import type { VercelRequest, VercelResponse } from '@vercel/node';

interface TranslateRequestBody {
  model: string;
  imageBase64: string;
  sourceLanguage: string;
  targetLanguage: string;
  notes?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, sourceLanguage, targetLanguage, notes } =
    req.body as TranslateRequestBody;

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: GEMINI_API_KEY is not set' });
  }

  const model = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite-preview';

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

    

  try {
    const sourceDesc =
      sourceLanguage === 'Auto Detect' ? 'the detected language' : sourceLanguage;

    const systemPrompt = [
      `You are a professional document translator.`,
      `You will receive a screenshot of a PDF page containing text.`,
      `Translate ALL visible text from ${sourceDesc} to ${targetLanguage}.`,
      `Do NOT output the original text.`,
      `Do NOT output the original text together with the translated text.`,
      `Preserve the original paragraph structure and line breaks as much as possible.`,
      notes ? `Additional instructions: ${notes}` : '',
      `Output format: Return ONLY a single JSON object (no markdown/code block) with exactly: {"translation":"..."}. The value of "translation" may contain newlines.`,
    ]
      .filter(Boolean)
      .join('\n');

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

    const body = {
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: 'image/png',
                data: imageBase64,
              },
            },
            {
              text: systemPrompt,
            },
          ],
        },
      ],
      generationConfig: {
        temperature: 0.0,
        maxOutputTokens: 8192,
      },
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      return res.status(response.status).json({
        error: error?.error?.message || 'Gemini API error',
      });
    }

        

    const result = await response.json();
    const rawText: string | undefined =
      result?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!rawText) {
      return res.status(200).json({ translation: 'No translation received' });
    }

    const cleaned = rawText
      .replace(/```(?:json)?/g, '')
      .replace(/```/g, '')
      .trim();

    let translation: string | undefined;

    // Preferred: strict JSON
    try {
      const parsed = JSON.parse(cleaned);
      if (typeof parsed?.translation === 'string') {
        translation = parsed.translation;
      }
    } catch {
      // Ignore
    }

    // Fallback: extract the first JSON object that contains "translation"
    if (!translation) {
      const match = cleaned.match(/\{[\s\S]*"translation"\s*:\s*[\s\S]*\}/);
      if (match) {
        try {
          const parsed = JSON.parse(match[0]);
          if (typeof parsed?.translation === 'string') {
            translation = parsed.translation;
          }
        } catch {
          // Ignore
        }
      }
    }

    return res.status(200).json({ translation: (translation ?? rawText).trim() });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

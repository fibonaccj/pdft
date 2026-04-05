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
    const systemPrompt = [
      `You are a professional document translator.`,
      `You will receive a screenshot of a PDF page.`,
      `Your task is to:`,
      `1. Extract all text content visible in the image`,
      `2. Translate the extracted text from ${sourceLanguage === 'Auto Detect' ? 'the detected language' : sourceLanguage} to ${targetLanguage}`,
      `3. Output ONLY the translated text, preserving the original paragraph structure and line breaks as much as possible`,
      `4. Do NOT include any explanations, headings, or meta-information — just the translated text`,
      notes ? `5. Additional instructions: ${notes}` : '',
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
        temperature: 0.1,
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
    const translatedText =
      result?.candidates?.[0]?.content?.parts?.[0]?.text ||
      'No translation received';

    return res.status(200).json({ translation: translatedText });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

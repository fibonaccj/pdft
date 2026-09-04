import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Mistral } from '@mistralai/mistralai';

interface TranslateRequestBody {
  model: string;
  imageBase64: string;
  sourceLanguage: string;
  targetLanguage: string;
  notes?: string;
}

function extractTranslationValue(text: string): string | undefined {
  const keyMatch = /["']?translation["']?\s*:\s*/i.exec(text);
  if (!keyMatch) return undefined;

  const valueStart = keyMatch.index + keyMatch[0].length;
  if (text[valueStart] !== '"') return undefined;

  let value = '';
  let escaped = false;

  for (let index = valueStart + 1; index < text.length; index += 1) {
    const character = text[index];

    if (escaped) {
      value += `\\${character}`;
      escaped = false;
    } else if (character === '\\') {
      escaped = true;
    } else if (character === '"') {
      try {
        return JSON.parse(`"${value}"`);
      } catch {
        return value.replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');
      }
    } else {
      value += character;
    }
  }

  return undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageBase64, sourceLanguage, targetLanguage, notes } =
    req.body as TranslateRequestBody;

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: MISTRAL_API_KEY is not set' });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

    

  try {
    const client = new Mistral({ apiKey });

    // Lấy model từ biến môi trường MISTRAL_MODEL (đặt trong Vercel),
    // nếu không có thì dùng mặc định 'mistral-medium-2505'.
    const model = process.env.MISTRAL_MODEL || 'glm-5-2';
    const sourceDesc =
      sourceLanguage === 'Auto Detect' ? 'ngôn ngữ được phát hiện' : sourceLanguage;

    const translationPrompt = [
      `Dịch đoạn văn bản trong hình ảnh từ ${sourceDesc} sang ${targetLanguage}.`,
      `Chỉ trả về bản dịch, không trả về text gốc.`,
      notes ? `Yêu cầu thêm: ${notes}` : '',
      `Trả về JSON: {"translation":"bản dịch ở đây"}`,
    ]
      .filter(Boolean)
      .join('\n');

    const chatResponse = await client.chat.complete({
      model,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: translationPrompt },
            { type: 'image_url', imageUrl: `data:image/png;base64,${imageBase64}` },
          ],
        },
      ],
    });

    const rawText = chatResponse.choices?.[0]?.message?.content;

    if (!rawText) {
      return res.status(200).json({ translation: 'No translation received' });
    }

    const textContent = typeof rawText === 'string'
      ? rawText
      : Array.isArray(rawText)
        ? rawText
            .map((chunk) => {
              if (typeof chunk === 'string') return chunk;
              if (chunk && typeof chunk === 'object' && 'text' in chunk) {
                return typeof chunk.text === 'string' ? chunk.text : '';
              }
              return '';
            })
            .join('')
        : '';

    const cleaned = textContent
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

    if (!translation) {
      translation = extractTranslationValue(cleaned);
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

    if (translation) {
      return res.status(200).json({ translation: translation.trim() });
    }

    // Fallback: trả về text trực tiếp nếu không parse được JSON
    return res.status(200).json({ translation: cleaned });
  } catch (error) {
    console.error('Translation error:', error);
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Internal server error',
    });
  }
}

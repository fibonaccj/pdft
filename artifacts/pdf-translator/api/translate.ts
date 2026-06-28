import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Mistral } from '@mistralai/mistralai';

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

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfiguration: MISTRAL_API_KEY is not set' });
  }

  if (!imageBase64) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

    

  try {
    const client = new Mistral({ apiKey });

    // Bước 1: OCR để trích xuất text từ ảnh
    const ocrResponse = await client.ocr.process({
      model: 'mistral-ocr-latest',
      document: {
        type: 'image_url',
        imageUrl: `data:image/png;base64,${imageBase64}`,
      },
      includeImageBase64: true,
    });

    // Trích xuất text từ kết quả OCR
    const extractedText = ocrResponse.pages
      ?.map((page) => page.markdown || '')
      .join('\n') || '';

    if (!extractedText) {
      return res.status(200).json({ translation: 'No text extracted from image' });
    }

    // Bước 2: Dịch text với model mistral-small-2506
    const sourceDesc =
      sourceLanguage === 'Auto Detect' ? 'ngôn ngữ được phát hiện' : sourceLanguage;

    const translationPrompt = [
      `Dịch đoạn văn bản sau từ ${sourceDesc} sang ${targetLanguage}.`,
      `Chỉ trả về bản dịch, không trả về text gốc.`,
      notes ? `Yêu cầu thêm: ${notes}` : '',
      `Trả về JSON: {"translation":"bản dịch ở đây"}`,
      '',
      'Văn bản cần dịch:',
      extractedText,
    ]
      .filter(Boolean)
      .join('\n');

    const chatResponse = await client.chat.complete({
      model: 'mistral-small-2506',
      messages: [{ role: 'user', content: translationPrompt }],
    });

    const rawText = chatResponse.choices?.[0]?.message?.content;

    if (!rawText) {
      return res.status(200).json({ translation: 'No translation received' });
    }

    // Xử lý trường hợp rawText có thể là string hoặc ContentChunk[]
    const textContent = typeof rawText === 'string' ? rawText : JSON.stringify(rawText);

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

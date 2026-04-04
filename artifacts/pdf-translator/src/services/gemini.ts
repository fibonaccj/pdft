export interface TranslateOptions {
  apiKey: string;
  model: string;
  imageBase64: string;
  sourceLanguage: string;
  targetLanguage: string;
  notes?: string;
}

export async function translateWithGemini(options: TranslateOptions): Promise<string> {
  const { apiKey, model, imageBase64, sourceLanguage, targetLanguage, notes } = options;

  const systemPrompt = [
    `You are a professional document translator.`,
    `You will receive a screenshot of a PDF page.`,
    `Your task is to:`,
    `1. Extract all text content visible in the image`,
    `2. Translate the extracted text from ${sourceLanguage === "Auto Detect" ? "the detected language" : sourceLanguage} to ${targetLanguage}`,
    `3. Output ONLY the translated text, preserving the original paragraph structure and line breaks as much as possible`,
    `4. Do NOT include any explanations, headings, or meta-information — just the translated text`,
    notes ? `5. Additional instructions: ${notes}` : "",
  ].filter(Boolean).join("\n");

  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const body = {
    contents: [
      {
        parts: [
          {
            inline_data: {
              mime_type: "image/png",
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
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error?.message || `API error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

  if (!text) {
    throw new Error("No translation returned from Gemini. The model may not have found any text in the image.");
  }

  return text.trim();
}

export interface TranslateOptions {
  model: string;
  imageBase64: string;
  sourceLanguage: string;
  targetLanguage: string;
  notes?: string;
}

export async function translateWithGemini(options: TranslateOptions): Promise<string> {
  const { model, imageBase64, sourceLanguage, targetLanguage, notes } = options;

  const response = await fetch("/api/translate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      imageBase64,
      sourceLanguage,
      targetLanguage,
      notes,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData?.error || `Server error ${response.status}`;
    throw new Error(message);
  }

  const data = await response.json();
  const text = data?.translation;

  if (!text) {
    throw new Error("No translation returned from Gemini. The model may not have found any text in the image.");
  }

  return text.trim();
}

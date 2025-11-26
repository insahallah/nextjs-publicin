import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  throw new Error("NEXT_PUBLIC_GEMINI_API_KEY is missing in .env");
}

const ai = new GoogleGenerativeAI(apiKey);

const MODELS = [
  "gemini-2.5-flash",
  "gemini-2.0-flash",
  "gemini-2.5-flash-lite-preview",
];

export const generateDescription = async (
  prompt: string,
  lang: string = "en"
): Promise<string> => {
  if (!prompt?.trim()) {
    throw new Error("Prompt must be a non-empty string");
  }

  const finalPrompt =
    lang === "hi"
      ? `उत्तर केवल हिंदी में दें। स्पष्ट और संक्षिप्त रहें:\n${prompt}`
      : `Respond only in English. Be clear and concise:\n${prompt}`;

  const errors: { model: string; error: string }[] = [];

  for (const model of MODELS) {
    try {
      const genModel = ai.getGenerativeModel({
        model,
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        },
      });

      const result = await genModel.generateContent(finalPrompt);
      const text = result?.response?.text()?.trim();

      if (text) return text;
    } catch (error) {
      errors.push({ model, error: (error as Error).message });
    }
  }

  throw new Error(`All Gemini models failed: ${JSON.stringify(errors)}`);
};

import { GoogleGenerativeAI } from '@google/generative-ai';

const ai = new GoogleGenerativeAI('AIzaSyCbdnJhqaHdOOXw_0gnSCyVL7Av7bFBhww');

const MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-2.5-flash-lite-preview',
];

export const generateDescription = async (
  prompt: string,
  lang: string = "en"
): Promise<string> => {

  if (!prompt || typeof prompt !== "string") {
    throw new Error("Prompt must be a non-empty string");
  }

  const finalPrompt =
    lang === "hi"
      ? `उत्तर केवल हिंदी में दें। स्पष्ट और संक्षिप्त रहें:\n\n${prompt}`
      : `Respond in English only. Be clear and concise:\n\n${prompt}`;

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

      if (text && text.length > 0) {
        return text;
      }

    } catch (error) {
      errors.push({ model, error: (error as Error).message });
    }
  }

  throw new Error(`All Gemini models failed. Errors: ${JSON.stringify(errors)}`);
};

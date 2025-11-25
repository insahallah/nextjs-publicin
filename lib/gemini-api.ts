import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini Client with direct API key
const ai = new GoogleGenerativeAI('AIzaSyCbdnJhqaHdOOXw_0gnSCyVL7Av7bFBhww');

const MODELS = [
  'gemini-2.5-flash',              // Main recommended model
  'gemini-2.0-flash',              // Fallback
  'gemini-2.5-flash-lite-preview', // Fallback
];

export const generateDescription = async (prompt: string, lang: string = "en"): Promise<string> => {
  if (!prompt || typeof prompt !== 'string') {
    throw new Error('Prompt must be a non-empty string');
  }

  // Hindi and English only
  const finalPrompt = lang === "hi" 
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
        }
      });

      const result = await genModel.generateContent(finalPrompt);
      const text = result?.response?.text()?.trim();

      if (text && text.length > 0) {
        console.log(`Successfully generated content using ${model}`);
        return text;
      }

    } catch (error) {
      console.warn(`Model ${model} failed:`, (error as Error).message);
      errors.push({ model, error: (error as Error).message });
      continue;
    }
  }

  throw new Error(`All Gemini AI models failed. Errors: ${JSON.stringify(errors)}`);
};

// Streaming version
export const generateDescriptionStream = async (
  prompt: string, 
  lang: string = "en", 
  onChunk?: (chunk: string) => void
): Promise<string> => {
  const finalPrompt = lang === "hi" 
    ? `उत्तर केवल हिंदी में दें:\n\n${prompt}`
    : prompt;

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
        }
      });

      const result = await genModel.generateContentStream(finalPrompt);
      
      let fullText = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullText += chunkText;
        onChunk?.(chunkText);
      }
      
      return fullText.trim();

    } catch (error) {
      console.warn(`Model ${model} failed:`, (error as Error).message);
      errors.push({ model, error: (error as Error).message });
      continue;
    }
  }
  
  throw new Error(`All Gemini AI models failed for streaming. Errors: ${JSON.stringify(errors)}`);
};
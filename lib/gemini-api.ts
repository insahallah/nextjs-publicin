const GEMINI_API_KEY = 'AIzaSyDrod28WgdLrppqtNUFDQlQAXRTHYnSfIg';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/';

export const generateDescription = async (prompt: string): Promise<string> => {
  try {
    const response = await fetch(`${GEMINI_API_URL}gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: prompt
              }
            ]
          }
        ],
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 1024,
        }
      })
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content) {
      return data.candidates[0].content.parts[0].text.trim();
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw new Error('Failed to generate description. Please try again.');
  }
};

export const generateBusinessDescription = async (businessData: {
  businessName: string;
  categories: string[];
  location: string;
}): Promise<string> => {
  const prompt = `Create a professional and engaging business description for "${businessData.businessName}" which is a ${businessData.categories.join(', ')} business located in ${businessData.location}. 

Requirements:
- 2-3 short paragraphs
- Professional and friendly tone
- Highlight key services/features
- Include location context
- SEO-friendly
- Engaging for potential customers
- Maximum 150-200 words

Please provide a compelling business description that will attract customers:`;

  try {
    const description = await generateDescription(prompt);
    return description;
  } catch (error) {
    // Fallback description
    return `${businessData.businessName} is a professional ${businessData.categories[0]} located in ${businessData.location}. We provide high-quality services and products to meet all your needs. Our dedicated team ensures customer satisfaction and excellent service quality. Visit us today to experience the difference!`;
  }
};
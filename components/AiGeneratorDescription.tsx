'use client';

import { useState, useEffect } from 'react';
import { generateDescription } from "@/lib/gemini-api";

interface BilingualTextGeneratorProps {
  onDescriptionGenerated: (description: string) => void;
  businessName?: string;
  businessCategory?: string;
  location?: string;
  language?: string;
  targetTextAreaId?: string;
}

const BilingualTextGenerator = ({
  onDescriptionGenerated,
  businessName = '',
  businessCategory = '',
  location = '',
  language = 'en',
  targetTextAreaId = 'description'
}: BilingualTextGeneratorProps) => {

  const [prompt, setPrompt] = useState('');
  const [generatedText, setGeneratedText] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState(language);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [charCount, setCharCount] = useState(0);

  useEffect(() => {
    let autoPrompt = `Create a compelling 250-350 character business description for `;
    if (businessName) autoPrompt += `"${businessName}"`;
    if (businessCategory) autoPrompt += `, a ${businessCategory} business`;
    if (location) autoPrompt += ` located in ${location}`;
    autoPrompt += `. Highlight unique value proposition, trust factors, customer experience, and key benefits. Make it engaging and professional.`;
    
    setPrompt(autoPrompt);
    setCharCount(autoPrompt.length);
  }, [businessName, businessCategory, location]);

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setPrompt(e.target.value);
    setCharCount(e.target.value.length);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError("Please enter a prompt to generate description");
      return;
    }

    if (prompt.length < 20) {
      setError("Please provide more details for better description");
      return;
    }

    setIsLoading(true);
    setError('');
    setGeneratedText('');

    try {
      const finalPrompt = selectedLanguage === "hi" 
        ? `250-350 अक्षरों का एक आकर्षक और पेशेवर व्यवसाय विवरण हिंदी में लिखें:\n${prompt}`
        : `Write a compelling 250-350 character professional business description:\n${prompt}`;

      const text = await generateDescription(finalPrompt, selectedLanguage);
      
      setGeneratedText(text);
      
      if (onDescriptionGenerated) {
        onDescriptionGenerated(text);
      }

    } catch (err: any) {
      setError("AI generation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedText);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
          <span className="text-white text-lg">✨</span>
        </div>
        <h3 className="text-lg font-semibold text-gray-900">AI Description Generator</h3>
        <p className="text-sm text-gray-600 mt-1">
          Let AI create a professional description for your business
        </p>
      </div>

      <div className="bg-gray-50 p-1 rounded-lg flex gap-1">
        <button
          onClick={() => setSelectedLanguage("en")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedLanguage === "en" 
              ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🇺🇸 English
        </button>
        <button
          onClick={() => setSelectedLanguage("hi")}
          className={`flex-1 py-2.5 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
            selectedLanguage === "hi" 
              ? "bg-white text-blue-600 shadow-sm border border-gray-200" 
              : "text-gray-600 hover:text-gray-800"
          }`}
        >
          🇮🇳 हिंदी
        </button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Customize Your Prompt
          </label>
          <span className="text-xs text-gray-500">{charCount} characters</span>
        </div>
        
        <div className="relative">
          <textarea
            rows={4}
            value={prompt}
            onChange={handlePromptChange}
            className="w-full border border-gray-300 p-4 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 resize-none"
            placeholder="AI will auto-generate prompt based on your business details..."
          />
          <div className="absolute bottom-2 right-2 text-xs text-gray-400">
            ✏️ Edit as needed
          </div>
        </div>
        
        <div className="flex items-start gap-2 text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
          <span className="text-blue-500 mt-0.5">💡</span>
          <p>AI will use this prompt to generate a professional business description. You can modify it to focus on specific aspects.</p>
        </div>
      </div>

      <button
        onClick={handleGenerate}
        disabled={isLoading || !prompt.trim() || prompt.length < 20}
        className={`w-full py-3.5 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 ${
          isLoading 
            ? "bg-blue-500 text-white cursor-wait" 
            : !prompt.trim() || prompt.length < 20
            ? "bg-gray-200 text-gray-400 cursor-not-allowed"
            : "bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        }`}
      >
        {isLoading ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            Generating...
          </>
        ) : (
          <>
            <span>🚀</span>
            Generate AI Description
          </>
        )}
      </button>

      {generatedText && (
        <div className="space-y-3 animate-fade-in">
          <div className="flex items-center justify-between">
            <h4 className="font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Generated Description
            </h4>
            <button
              onClick={copyToClipboard}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1"
            >
              📋 Copy
            </button>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
              {generatedText}
            </p>
            
            <div className="flex items-center gap-4 mt-3 pt-3 border-t border-green-200 text-xs text-green-700">
              <span className="flex items-center gap-1">
                📊 {generatedText.length} characters
              </span>
              <span className="flex items-center gap-1">
                ⏱️ {Math.ceil(generatedText.split(' ').length / 200 * 60)}s read
              </span>
              <span className="flex items-center gap-1">
                ✅ Auto-saved to form
              </span>
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <span className="text-blue-500 mt-0.5">🎉</span>
              <div>
                <p className="text-blue-800 text-sm font-medium">Description Ready!</p>
                <p className="text-blue-700 text-xs">You can now proceed to the next step</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 animate-shake">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-red-500 text-sm">⚠️</span>
            </div>
            <div>
              <p className="text-red-800 font-medium text-sm">Generation Failed</p>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="font-medium text-gray-900 text-sm mb-2 flex items-center gap-2">
          <span>💫</span>
          Tips for Best Results
        </h5>
        <ul className="text-xs text-gray-600 space-y-1">
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Include specific services, products, or specialties
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Mention your unique value proposition
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Add location-specific advantages if any
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500 mt-0.5">•</span>
            Keep prompt detailed but concise for better accuracy
          </li>
        </ul>
      </div>
    </div>
  );
};

export default BilingualTextGenerator;
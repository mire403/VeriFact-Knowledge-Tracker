import { GoogleGenAI } from "@google/genai";
import { AnalysisResult, Source } from "../types";

const apiKey = process.env.API_KEY || '';

// Initialize the client
const ai = new GoogleGenAI({ apiKey });

export const analyzeQuery = async (query: string): Promise<AnalysisResult> => {
  if (!apiKey) {
    throw new Error("缺少 API 密钥。请检查您的环境配置。");
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: query,
      config: {
        // Enable Google Search Grounding to track real knowledge
        tools: [{ googleSearch: {} }],
        temperature: 0.2, // Lower temperature for more factual responses
      },
    });

    const text = response.text || "未生成回答。";
    const groundingMetadata = response.candidates?.[0]?.groundingMetadata;

    // Extract unique sources from grounding chunks
    const sources: Source[] = [];
    const seenUrls = new Set<string>();

    if (groundingMetadata?.groundingChunks) {
      groundingMetadata.groundingChunks.forEach((chunk) => {
        if (chunk.web && chunk.web.uri && chunk.web.title) {
          if (!seenUrls.has(chunk.web.uri)) {
            seenUrls.add(chunk.web.uri);
            sources.push({
              uri: chunk.web.uri,
              title: chunk.web.title,
            });
          }
        }
      });
    }

    return {
      text,
      sources,
      groundingMetadata: groundingMetadata || null,
      timestamp: Date.now(),
    };

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
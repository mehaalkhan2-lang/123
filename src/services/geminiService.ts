import { GoogleGenAI, Type } from "@google/genai";

let aiClient: GoogleGenAI | null = null;

const GEMINI_API_KEY = (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : '') || '';

function getAiClient() {
  if (!aiClient) {
    if (!GEMINI_API_KEY || GEMINI_API_KEY === "MY_GEMINI_API_KEY") {
      throw new Error("Gemini API Key is not configured. Please set GEMINI_API_KEY in the Secrets panel (Settings > Secrets).");
    }
    
    try {
      aiClient = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
    } catch (e: any) {
      console.error("Failed to initialize GoogleGenAI:", e);
      throw new Error(`AI Initialization Failed: ${e.message}`);
    }
  }
  return aiClient;
}

export function isAiAvailable(): boolean {
  if (!GEMINI_API_KEY) return false;
  
  const keyStr = String(GEMINI_API_KEY);
  if (keyStr === "MY_GEMINI_API_KEY" || keyStr === "" || keyStr === "undefined" || keyStr === "null") return false;
  
  return keyStr.length > 10;
}

export interface GeneratedQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export async function generateMCQs(topic: string, classLevel: string, subject: string, count: number = 5): Promise<GeneratedQuestion[]> {
  const client = getAiClient();
  const prompt = `Generate ${count} MCQs for ${classLevel} ${subject} on "${topic}". 
  Format: JSON array of objects with "question", "options" (4 strings), and "correctAnswerIndex" (0-3).
  Level: ${classLevel} academically accurate.`;

  try {
    const response = await client.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: {
                type: Type.STRING,
                description: "The text of the question",
              },
              options: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Array of 4 possible answers",
              },
              correctAnswerIndex: {
                type: Type.INTEGER,
                description: "The zero-based index of the correct option",
              }
            },
            required: ["question", "options", "correctAnswerIndex"]
          }
        }
      }
    });

    if (!response.text) {
      throw new Error("No response from AI");
    }

    let jsonStr = response.text.trim();
    
    // Clean up potential markdown formatting
    if (jsonStr.includes('```')) {
      const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        jsonStr = match[1].trim();
      } else {
        jsonStr = jsonStr.replace(/```(?:json)?/g, '').replace(/```/g, '').trim();
      }
    }

    try {
      const questions = JSON.parse(jsonStr);
      return questions;
    } catch (parseError) {
      console.error("JSON Parse Error:", parseError, "Raw string:", jsonStr);
      throw new Error("Failed to parse AI response. Please try generating again.");
    }
  } catch (error) {
    console.error("AI Generation Error:", error);
    throw error;
  }
}

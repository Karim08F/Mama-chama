import { GoogleGenAI, Type, Schema, Content } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    trustImpactTitle: {
      type: Type.STRING,
      description: "A short, encouraging title about the trust boost (e.g., 'High Trust Boost!')."
    },
    trustImpactExplanation: {
      type: Type.STRING,
      description: "Explanation of why this saving move helps her score (mentioning frequency, amount, etc.). Use supportive tone and local context."
    },
    nextBestAction: {
      type: Type.STRING,
      description: "A simple, actionable tip for next week tailored to her saving frequency."
    },
    affirmation: {
      type: Type.STRING,
      description: "A short supportive message including local terms like M-Shwari, Chama, SACCO."
    }
  },
  required: ["trustImpactTitle", "trustImpactExplanation", "nextBestAction", "affirmation"]
};

export async function generateCreditAdvice(amount: number, frequency: string) {
  const prompt = `
You are a "Credit-Builder AI" for the Kenyan informal economy. 
Your goal: Transform raw savings into a "Trust Profile" that a bank or SACCO would respect.

Context: Users are "Mama Chamas" or small traders with irregular income. They don't have formal credit scores.

Input: User wants to save KES ${amount} on a ${frequency} basis.

Provide a tailored response based on these logic rules:
- Small, frequent amounts (daily/weekly) = High Trust boost.
- Large, one-off or irregular amounts = Medium Trust boost.
- Keep the tone supportive, expert, and use local context (e.g., mention M-Shwari, Chamas, SACCO dividends, M-Pesa).
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.7,
      }
    });

    if (response.text) {
      return JSON.parse(response.text);
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error generating advice:", error);
    throw new Error("Failed to generate advice. Please try again.");
  }
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export async function sendChatMessage(history: ChatMessage[], newMessage: string): Promise<string> {
  try {
    const contents: Content[] = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.text }]
    }));
    
    contents.push({
      role: "user",
      parts: [{ text: newMessage }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: contents as any,
      config: {
        systemInstruction: "You are a 'Finance AI' coach for the Kenyan informal economy (e.g. Mama Mbogas, small traders). Answer questions and give short, practical, encouraging advice on financial discipline, managing stock, and saving. Use local Kenyan context and terms where appropriate. Be concise and supportive.",
        temperature: 0.7,
      }
    });

    if (response.text) {
      return response.text;
    }
    throw new Error("Empty response from AI");
  } catch (error) {
    console.error("Error in chat:", error);
    throw new Error("Failed to get a response from Finance AI.");
  }
}


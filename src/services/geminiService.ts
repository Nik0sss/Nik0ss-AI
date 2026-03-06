import { GoogleGenAI, GenerateContentResponse } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

export interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: number;
}

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  async *streamChat(prompt: string, history: Message[] = [], personality: string = "default") {
    const model = "gemini-3-flash-preview";
    
    const personalityPrompts: Record<string, string> = {
      default: "Ты — Nik0ss chat bot, продвинутый ИИ-ассистент. Отвечай вежливо, информативно и на языке пользователя.",
      creative: "Ты — Nik0ss chat bot, творческий и вдохновляющий ассистент. Используй метафоры, будь креативным и предлагай необычные идеи.",
      professional: "Ты — Nik0ss chat bot, строгий и профессиональный эксперт. Отвечай кратко, по делу, используй факты и техническую терминологию.",
      friendly: "Ты — Nik0ss chat bot, твой лучший друг. Общайся неформально, используй эмодзи, будь очень дружелюбным и поддерживающим."
    };

    const systemInstruction = `${personalityPrompts[personality] || personalityPrompts.default} Используй Markdown для форматирования.`;

    // Format history for Gemini
    const contents = history.map(msg => ({
      role: msg.role,
      parts: [{ text: msg.content }]
    }));

    // Add current prompt
    contents.push({
      role: "user",
      parts: [{ text: prompt }]
    });

    try {
      const result = await this.ai.models.generateContentStream({
        model,
        contents,
        config: {
          systemInstruction,
        }
      });

      for await (const chunk of result) {
        const text = chunk.text;
        if (text) {
          yield text;
        }
      }
    } catch (error) {
      console.error("Gemini API Error:", error);
      throw error;
    }
  }
}

export const geminiService = new GeminiService();

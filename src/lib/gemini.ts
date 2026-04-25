import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  throw new Error("GEMINI_API_KEY is not defined in the environment.");
}

export const ai = new GoogleGenAI({ apiKey: API_KEY });

export interface TMTMetrics {
  type: string;
  duration: number;
  errors: number;
  tScore?: number;
}

export interface CognitiveAnalysis {
  interpretation: string;
  domains: {
    attention_span: { score: number; feedback: string };
    processing_speed: { score: number; feedback: string };
    error_correction: { score: number; feedback: string };
  };
  recommendations: string[];
  summary: string;
}

export async function analyzePerformance(history: TMTMetrics[]): Promise<CognitiveAnalysis> {
  const prompt = `
    Analyze the following user's Trail Making Test (TMT) clinical history. 
    The history includes ${history.length} recent sessions.
    
    Data:
    ${JSON.stringify(history, null, 2)}

    Context for T-Scores:
    - 70+: Superior
    - 60-69: Above Average
    - 40-59: Normal/Average
    - 30-39: Below Average
    - <30: Significant Deficit

    Provide a deep clinical cognitive analysis focusing on:
    1. Attention Span: Ability to maintain task focus and follow sequences.
    2. Processing Speed: Efficiency of visual scanning and psychomotor speed (Duration vs. Complexity).
    3. Error Correction: Cognitive flexibility and ability to recover from sequencing mistakes (based on Errors vs. Duration).

    Format the response as a valid JSON object with the following structure:
    {
      "interpretation": "Detailed clinical overview in Arabic",
      "domains": {
        "attention_span": { "score": 0-100, "feedback": "Arabic feedback" },
        "processing_speed": { "score": 0-100, "feedback": "Arabic feedback" },
        "error_correction": { "score": 0-100, "feedback": "Arabic feedback" }
      },
      "recommendations": ["Instructional steps in Arabic for improvement"],
      "summary": "One sentence overview in Arabic"
    }

    Notes: 
    - Scores should be 0-100 relative to professional clinical benchmarks.
    - All text output MUST be in Arabic to match the clinical context of the app.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text || "{}";
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini analysis error:", error);
    return {
      interpretation: "عذراً، تعذر تحليل الأداء في الوقت الحالي.",
      domains: {
        attention_span: { score: 0, feedback: "غير متوفر" },
        processing_speed: { score: 0, feedback: "غير متوفر" },
        error_correction: { score: 0, feedback: "غير متوفر" }
      },
      recommendations: ["استمر في التدريب المنتظم."],
      summary: "حدث خطأ أثناء رصد البيانات."
    };
  }
}

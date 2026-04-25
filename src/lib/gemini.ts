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
  timestamp?: any;
}

export interface CognitiveAnalysis {
  interpretation: string;
  domains: {
    attention_span: { score: number; feedback: string };
    processing_speed: { score: number; feedback: string };
    error_correction: { score: number; feedback: string };
  };
  trends: {
    status: 'improving' | 'stable' | 'declining';
    comment: string;
  };
  recommendations: string[];
  summary: string;
}

export async function analyzePerformance(history: TMTMetrics[], goals?: string[]): Promise<CognitiveAnalysis> {
  const prompt = `
    Analyze the following user's Trail Making Test (TMT) clinical history and align with their training goals.
    The history includes ${history.length} recent sessions.
    ${goals && goals.length > 0 ? `User's Training Goals: ${goals.join(', ')}` : ''}
    
    Data:
    ${JSON.stringify(history, null, 2)}

    Context for T-Scores:
    - 70+: Superior (Excellent executive function)
    - 60-69: Above Average
    - 40-59: Normal/Average (Healthy range)
    - 30-39: Below Average (Mild cognitive impairment indicator)
    - <30: Significant Deficit (Possible severe neurological or cognitive issues)

    Task:
    Provide a deep clinical cognitive analysis focusing on:
    1. Attention Span: Focus on consistency and error patterns in TMT-A.
    2. Processing Speed: Analyze the ratio of Duration to Complexity across sessions.
    3. Error Correction: Cognitive flexibility (TMT-B performance) and the ability to self-correct efficiently.
    4. Trend Analysis: Compare early sessions to recent ones to determine if the user is improving, stable, or declining.
    
    CRITICAL: If goals are provided, tailor the recommendations specifically to help the user achieve them.

    Format the response as a valid JSON object with the following structure:
    {
      "interpretation": "Detailed clinical overview in Arabic",
      "domains": {
        "attention_span": { "score": 0-100, "feedback": "Arabic feedback" },
        "processing_speed": { "score": 0-100, "feedback": "Arabic feedback" },
        "error_correction": { "score": 0-100, "feedback": "Arabic feedback" }
      },
      "trends": {
        "status": "improving | stable | declining",
        "comment": "One sentence summary of the trend in Arabic"
      },
      "recommendations": ["4-5 Actionable instructional steps in Arabic"],
      "summary": "One sentence motivational overview in Arabic"
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
      trends: {
        status: 'stable',
        comment: "لا توجد بيانات كافية لتحديد الاتجاه."
      },
      recommendations: ["استمر في التدريب المنتظم."],
      summary: "حدث خطأ أثناء رصد البيانات."
    };
  }
}

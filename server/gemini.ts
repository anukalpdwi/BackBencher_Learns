import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "" 
});

export interface ExplanationRequest {
  topic: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  context?: string;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizResponse {
  questions: QuizQuestion[];
}

export interface FlashcardResponse {
  cards: Array<{
    front: string;
    back: string;
  }>;
}

export async function generateExplanation(request: ExplanationRequest): Promise<string> {
  let prompt = "";
  
  switch (request.difficulty) {
    case "beginner":
      prompt = `Explain "${request.topic}" like I'm 10 years old. Use simple words, analogies, and make it fun and easy to understand. Include examples that a child would relate to.`;
      break;
    case "intermediate":
      prompt = `Provide a quick revision summary of "${request.topic}". Focus on key points, important concepts, and essential information. Make it concise but comprehensive for someone who needs a refresher.`;
      break;
    case "advanced":
      prompt = `Provide a college-level, in-depth explanation of "${request.topic}". Include technical details, theoretical foundations, practical applications, and advanced concepts. Assume the reader has some background knowledge.`;
      break;
  }

  if (request.context) {
    prompt += ` Context: ${request.context}`;
  }

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to generate explanation.";
  } catch (error) {
    console.error("Error generating explanation:", error);
    throw new Error("Failed to generate explanation");
  }
}

export async function generateQuiz(topic: string, questionCount: number = 5): Promise<QuizResponse> {
  const prompt = `Create ${questionCount} multiple-choice questions about "${topic}".
  
  Respond with JSON in this exact format:
  {
    "questions": [
      {
        "question": "Question text here",
        "options": ["Option A", "Option B", "Option C", "Option D"],
        "correctAnswer": 0,
        "explanation": "Why this answer is correct"
      }
    ]
  }
  
  Make sure:
  - Questions are educational and test understanding
  - Each question has exactly 4 options
  - correctAnswer is the index (0-3) of the correct option
  - Include clear explanations for each answer`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  question: { type: "string" },
                  options: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 4,
                    maxItems: 4
                  },
                  correctAnswer: { type: "number" },
                  explanation: { type: "string" }
                },
                required: ["question", "options", "correctAnswer", "explanation"]
              }
            }
          },
          required: ["questions"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: QuizResponse = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating quiz:", error);
    throw new Error("Failed to generate quiz");
  }
}

export async function generateFlashcards(topic: string, cardCount: number = 10): Promise<FlashcardResponse> {
  const prompt = `Create ${cardCount} flashcards about "${topic}".
  
  Respond with JSON in this exact format:
  {
    "cards": [
      {
        "front": "Question or term",
        "back": "Answer or definition"
      }
    ]
  }
  
  Make the flashcards educational and focused on key concepts, terms, and facts about the topic.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            cards: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  front: { type: "string" },
                  back: { type: "string" }
                },
                required: ["front", "back"]
              }
            }
          },
          required: ["cards"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      const data: FlashcardResponse = JSON.parse(rawJson);
      return data;
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating flashcards:", error);
    throw new Error("Failed to generate flashcards");
  }
}

export async function analyzeQuizPerformance(
  questions: QuizQuestion[],
  userAnswers: number[],
  topic: string
): Promise<string> {
  const correctAnswers = questions.map((q, index) => ({
    question: q.question,
    correct: q.correctAnswer,
    user: userAnswers[index],
    isCorrect: q.correctAnswer === userAnswers[index]
  }));

  const score = correctAnswers.filter(a => a.isCorrect).length;
  const incorrectQuestions = correctAnswers.filter(a => !a.isCorrect);

  const prompt = `Analyze this quiz performance for the topic "${topic}":
  
  Score: ${score}/${questions.length}
  
  Incorrect answers:
  ${incorrectQuestions.map(q => `- ${q.question} (chose option ${q.user}, correct was ${q.correct})`).join('\n')}
  
  Provide:
  1. Areas that need improvement
  2. Specific concepts to review
  3. Recommended next steps for learning
  4. Encouragement and positive feedback
  
  Keep it constructive and helpful.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Unable to analyze performance.";
  } catch (error) {
    console.error("Error analyzing quiz performance:", error);
    throw new Error("Failed to analyze quiz performance");
  }
}

export async function generateInterviewQuestions(
  role: string,
  level: string = "intermediate"
): Promise<{ questions: string[]; tips: string }> {
  const prompt = `Generate 5 interview questions for a ${level} level ${role} position.
  
  Respond with JSON in this exact format:
  {
    "questions": ["Question 1", "Question 2", etc.],
    "tips": "General tips for answering these types of questions"
  }
  
  Include a mix of technical and behavioral questions appropriate for the role and level.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "object",
          properties: {
            questions: {
              type: "array",
              items: { type: "string" }
            },
            tips: { type: "string" }
          },
          required: ["questions", "tips"]
        }
      },
      contents: prompt,
    });

    const rawJson = response.text;
    if (rawJson) {
      return JSON.parse(rawJson);
    } else {
      throw new Error("Empty response from model");
    }
  } catch (error) {
    console.error("Error generating interview questions:", error);
    throw new Error("Failed to generate interview questions");
  }
}

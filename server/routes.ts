import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer } from "ws";
import multer from "multer";
import { storage } from "./storage";
// import { isAuthenticated } from "./replitAuth"; // Replit OIDC removed
import {
  generateExplanation,
  generateQuiz,
  generateFlashcards,
  analyzeQuizPerformance,
  generateInterviewQuestions,
  generateChatResponse,
  type ExplanationRequest,
  type QuizQuestion,
} from "./gemini";
import {
  insertTopicSchema,
  insertPostSchema,
  insertStudyGroupSchema,
} from "@shared/schema";

// Helper for consistent error handling
const handleError = (res: Response, error: any, message: string) => {
  console.error(message, error);
  res.status(500).json({ message, error: error.message });
};

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.get("/api/auth/user", async (req: any, res) => {
    // Auth middleware removed; return dummy or unauthenticated for now
    res.json({ message: "Not implemented: auth middleware removed" });
  });

  // Topic routes
  app.post("/api/topics", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
      const topicData = insertTopicSchema.parse({ ...req.body, userId });
      const topic = await storage.createTopic(topicData);
      await storage.createLearningSession({
        userId,
        topicId: topic.id,
        activityType: "study",
        xpGained: 10,
      });
      await storage.updateUserXP(userId, 10);
      await storage.updateUserStreak(userId);
      res.json(topic);
    } catch (error) {
      handleError(res, error, "Failed to create topic");
    }
  });

  app.get("/api/topics", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
      const topics = await storage.getUserTopics(userId);
      res.json(topics);
    } catch (error) {
      handleError(res, error, "Failed to fetch topics");
    }
  });
  
  // AI content generation routes
  app.post("/api/ai/explain", async (req, res) => {
    try {
      const { topic, difficulty, context } = req.body;
      if (!topic || !difficulty) {
        return res.status(400).json({ message: "Topic and difficulty are required" });
      }
      const request: ExplanationRequest = { topic, difficulty, context };
      const explanation = await generateExplanation(request);
      res.json({ explanation });
    } catch (error) {
        handleError(res, error, "Failed to generate explanation");
    }
  });

  app.post("/api/ai/quiz", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
      const { topic, topicId, questionCount = 5 } = req.body;
      if (!topic || !topicId) {
        return res.status(400).json({ message: "Topic and topicId are required" });
      }
      const quizData = await generateQuiz(topic, questionCount);
      const quiz = await storage.createQuiz({
        topicId,
        userId,
        title: `${topic} Quiz`,
        questions: quizData.questions,
      });
      res.json({ quiz, questions: quizData.questions });
    } catch (error) {
        handleError(res, error, "Failed to generate quiz");
    }
  });

  app.post("/api/ai/flashcards", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
        const { topic, topicId, cardCount = 10 } = req.body;
        if (!topic || !topicId) {
            return res.status(400).json({ message: "Topic and topicId are required" });
        }
        const flashcardsData = await generateFlashcards(topic, cardCount);
        const savedCards = await Promise.all(
            flashcardsData.cards.map(card => 
                storage.createFlashcard({ topicId, userId, ...card })
            )
        );
        res.json({ flashcards: savedCards });
    } catch (error) {
        handleError(res, error, "Failed to generate flashcards");
    }
  });
  
  app.post("/api/ai/interview", async (req, res) => {
    try {
      const { role, level = "intermediate" } = req.body;
      if (!role) {
        return res.status(400).json({ message: "Role is required" });
      }
      const interviewData = await generateInterviewQuestions(role, level);
      res.json(interviewData);
    } catch (error) {
        handleError(res, error, "Failed to generate interview questions");
    }
  });

  app.post("/api/ai/chat", async (req: any, res) => {
    try {
      const { prompt, history } = req.body;
      if (!prompt) {
        return res.status(400).json({ message: "Prompt is required" });
      }
      const response = await generateChatResponse(prompt, history || []);
      res.json({ response });
    } catch (error) {
      handleError(res, error, "Failed to get chat response");
    }
  });

  // Social feed routes
  app.get("/api/feed", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
      const limit = parseInt(req.query.limit as string) || 20;
      const posts = await storage.getFeedPosts(userId, limit);
      res.json(posts);
    } catch (error) {
      handleError(res, error, "Failed to fetch feed");
    }
  });

  app.post("/api/posts", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
      const postData = insertPostSchema.parse({ ...req.body, userId });
      const post = await storage.createPost(postData);
      res.json(post);
    } catch (error) {
        handleError(res, error, "Failed to create post");
    }
  });

  app.post("/api/posts/:id/like", async (req: any, res) => {
        try {
            // No authentication, use a dummy userId for development
            const userId = "dev-user";
            await storage.togglePostLike(req.params.id, userId);
            res.json({ success: true });
        } catch (error) {
            handleError(res, error, "Failed to toggle like");
        }
    });

  // User progress routes
  app.get("/api/user/achievements", async (req: any, res) => {
    try {
  // No authentication, use a dummy userId for development
  const userId = "dev-user";
        const achievements = await storage.getUserAchievements(userId);
        res.json(achievements);
    } catch (error) {
        handleError(res, error, "Failed to fetch achievements");
    }
  });

  // Create HTTP server
  const httpServer = createServer(app);

  // Setup WebSocket server
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  wss.on("connection", (ws) => {
    console.log("WebSocket client connected");
    ws.on("close", () => console.log("WebSocket client disconnected"));
  });

  return httpServer;
}
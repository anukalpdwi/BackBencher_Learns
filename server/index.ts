import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import cors from "cors";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
// import { setupAuth } from "./replitAuth"; // Replit OIDC removed

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


(async () => {
  // Directly register routes, skip Replit OIDC setup
  const server = await registerRoutes(app);

  // A simple and effective global error handler
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    console.error("Global error handler caught:", err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
  });

  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`Server listening on port ${port}`);
  });
})();
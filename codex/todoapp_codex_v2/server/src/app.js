import fs from "node:fs";
import path from "node:path";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import { config } from "./config.js";
import { notFoundHandler, errorHandler } from "./middleware/errorHandler.js";
import { TaskRepository } from "./repository/taskRepository.js";
import { createTaskRouter } from "./routes/tasks.js";

export function createApp() {
  const app = express();
  const taskRepository = new TaskRepository(config.tasksFile);

  app.disable("x-powered-by");
  app.use(helmet());
  app.use(
    cors({
      origin: config.allowedOrigin,
      methods: ["GET", "POST", "PATCH", "DELETE"]
    })
  );
  app.use(express.json({ limit: "16kb" }));

  app.get("/api/health", (_request, response) => {
    response.json({
      data: {
        status: "ok"
      }
    });
  });

  app.use("/api/tasks", createTaskRouter(taskRepository));

  if (fs.existsSync(config.clientDistDir)) {
    app.use(express.static(config.clientDistDir));
    app.get(/^(?!\/api).*/, (_request, response) => {
      response.sendFile(path.join(config.clientDistDir, "index.html"));
    });
  }

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}

import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";

import { env } from "./config/env.js";
import { api } from "./routes.js";
import { errorHandler } from "./middleware/errors.js";
import { swaggerSpec } from "./swagger.js";

export const app = express();

// Security headers.
app.use(helmet());

// The frontend origin is configurable because local development and deployment
// normally use different URLs.
app.use(
  cors({
    origin: env.CORS_ORIGIN.split(",").map(value => value.trim())
  })
);

// JSON request bodies are intentionally limited to avoid accidental giant payloads.
app.use(express.json({ limit: "1mb" }));

// Basic protection against accidental request floods.
// Production deployments can add a distributed rate limiter if required.
app.use(
  rateLimit({
    windowMs: 60_000,
    limit: 120
  })
);

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "ai-travel-planner-backend",
    timestamp: new Date().toISOString()
  });
});

app.use(
  "/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec)
);

app.use("/api/v1", api);

// All application errors eventually reach this handler.
app.use(errorHandler);

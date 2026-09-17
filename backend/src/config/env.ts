import "dotenv/config";
import { z } from "zod";

// Centralizing environment parsing prevents the rest of the application
// from repeatedly checking process.env and accidentally using undefined values.
const schema = z.object({
  PORT: z.coerce.number().int().positive().default(4000),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
  USE_MOCK_SERVICES: z.string().default("true").transform(v => v.toLowerCase() === "true"),
  GOOGLE_MAPS_API_KEY: z.string().optional()
});

export const env = schema.parse(process.env);

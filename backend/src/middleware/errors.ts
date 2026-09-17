import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

// One error format keeps API failures predictable for Aagam's frontend.
// Detailed stack traces are intentionally not exposed to clients.
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error(err);

  if (err instanceof ZodError) {
    return res.status(400).json({
      error: "Validation failed",
      details: err.flatten()
    });
  }

  return res.status(500).json({ error: "Internal server error" });
}

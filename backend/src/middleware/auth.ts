import type { NextFunction, Response } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { AuthRequest } from "../types.js";

// Every protected route passes through this middleware.
// The important security property is that the backend, not the frontend,
// decides which authenticated user owns a resource.
export function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
  const header = req.headers.authorization;

  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Missing Bearer token" });
  }

  try {
    const payload = jwt.verify(header.slice(7), env.JWT_SECRET);

    if (typeof payload !== "object" || !payload.sub || typeof payload.email !== "string") {
      return res.status(401).json({ error: "Invalid token" });
    }

    req.user = { id: String(payload.sub), email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

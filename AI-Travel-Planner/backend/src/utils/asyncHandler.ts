import type { NextFunction, Request, Response } from "express";

// Express route handlers frequently contain async database/API operations.
// This wrapper forwards rejected promises to the centralized error middleware.
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>
) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

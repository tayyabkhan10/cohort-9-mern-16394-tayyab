import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const message = err instanceof Error ? err.message : "Something went wrong";
  logger.error({ err, path: req.path }, message);
  res.status(500).json({ message });
}

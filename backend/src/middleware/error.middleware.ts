import { MulterError } from "multer";
import { NextFunction, Request, Response } from "express";
import { logger } from "../config/logger";

export function errorMiddleware(err: unknown, req: Request, res: Response, _next: NextFunction) {
  const clientMessage = "Something went wrong";

  if (err instanceof MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      res.status(413).json({ message: "File too large" });
      return;
    }

    res.status(400).json({ message: err.message || "Invalid file upload" });
    return;
  }

  if (
    err instanceof SyntaxError &&
    "status" in err &&
    err.status === 400 &&
    "type" in err &&
    err.type === "entity.parse.failed"
  ) {
    res.status(400).json({ message: "Invalid JSON body" });
    return;
  }

  logger.error({ err, path: req.path }, clientMessage);
  res.status(500).json({ message: clientMessage });
}

import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { logger } from "../utils/logger.js";
import { captureException } from "../config/sentry.js";
import { recordSystemError } from "../services/ops-telemetry.service.js";

export class AppError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public isOperational = true,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
): void {
  const userId = (req as Request & { userId?: string }).userId;

  if (err instanceof AppError) {
    if (err.statusCode >= 500) {
      void recordSystemError({
        level: "error",
        message: err.message,
        stack: err.stack,
        path: req.originalUrl,
        userId,
        meta: { statusCode: err.statusCode },
      });
    }
    res.status(err.statusCode).json({
      success: false,
      error: err.message,
    });
    return;
  }

  if (err instanceof ZodError) {
    res.status(400).json({
      success: false,
      error: "Validation failed",
      details: err.flatten().fieldErrors,
    });
    return;
  }

  logger.error("Unhandled error", err);
  captureException(err);
  void recordSystemError({
    level: "error",
    message: err.message || "Internal server error",
    stack: err.stack,
    path: req.originalUrl,
    userId,
  });

  res.status(500).json({
    success: false,
    error: process.env.NODE_ENV === "production" ? "Internal server error" : err.message,
  });
}

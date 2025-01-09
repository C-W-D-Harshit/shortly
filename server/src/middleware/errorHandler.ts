import { Request, Response, NextFunction } from "express";

interface ErrorWithStatusCode extends Error {
  statusCode?: number;
}

/**
 * Global error handling middleware
 */
export const errorHandler = (
  err: ErrorWithStatusCode,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
    },
  });
};

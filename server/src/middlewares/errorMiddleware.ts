import { Request, Response, NextFunction } from "express";
import ErrorHandler from "../utils/errorHandler";

const errorMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Default to 500 if status code is not set
  error.statusCode = error.statusCode || 500;

  // Prisma Record Not Found error
  if (err.code === "P2025") {
    const message = `Resource not found.`;
    error = new ErrorHandler(message, 404);
  }

  // Prisma Unique Constraint error
  if (err.code === "P2002") {
    const message = `Duplicate field value entered.`;
    error = new ErrorHandler(message, 400);
  }

  // Handle JWT errors
  if (err.name === "JsonWebTokenError") {
    const message = `JSON Web Token is invalid. Try again.`;
    error = new ErrorHandler(message, 400);
  }

  if (err.name === "TokenExpiredError") {
    const message = `JSON Web Token has expired. Try again.`;
    error = new ErrorHandler(message, 400);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message || "Internal Server Error",
  });
};

export default errorMiddleware;

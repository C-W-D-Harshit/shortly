// utils/catchAsync.ts
import { Request, Response, NextFunction } from "express";

type AsyncFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

export const catchAsyncErrors =
  (fn: AsyncFn) => (req: Request, res: Response, next: NextFunction) => {
    try {
      fn(req, res, next).catch((err) => {
        console.error("Async error:", err);
        next(err); // Passes asynchronous errors to the error handler
      });
    } catch (err) {
      console.error("Synchronous error:", err);
      next(err); // Passes synchronous errors to the error handler
    }
  };
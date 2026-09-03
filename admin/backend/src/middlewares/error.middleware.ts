import type { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from '../errors/AppError.js';
import { ENV } from '../config/env.js';
import type { ProblemDetails } from '../types/api.js';

export const errorHandler = (
  err: unknown,
  req: Request,
  res: Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _next: NextFunction
): void => {
  let statusCode = 500;
  let type = 'https://httpstatuses.com/500';
  let title = 'Internal Server Error';
  let detail = 'An unexpected server error occurred. Please try again later.';
  let errors: Record<string, string[]> | undefined;

  if (err instanceof AppError) {
    statusCode = err.statusCode;
    type = err.type;
    title = err.name.replace(/([A-Z])/g, ' $1').trim();
    detail = err.message;
    errors = err.errors;
  } else if (err instanceof ZodError) {
    statusCode = 422;
    type = 'https://httpstatuses.com/422';
    title = 'Validation Failed';
    detail = 'One or more fields failed validation requirements.';
    const formattedErrors: Record<string, string[]> = {};
    for (const issue of err.issues) {
      const field = issue.path.join('.') || 'body';
      if (!formattedErrors[field]) {
        formattedErrors[field] = [];
      }
      formattedErrors[field].push(issue.message);
    }
    errors = formattedErrors;
  } else if (err instanceof Error) {
    detail = ENV.NODE_ENV === 'development' ? err.message : detail;
  }

  const problemDetails: ProblemDetails = {
    type,
    title,
    status: statusCode,
    detail,
    instance: req.originalUrl,
    ...(errors && { errors }),
    timestamp: new Date().toISOString(),
  };

  res.setHeader('Content-Type', 'application/problem+json');
  res.status(statusCode).json(problemDetails);
};

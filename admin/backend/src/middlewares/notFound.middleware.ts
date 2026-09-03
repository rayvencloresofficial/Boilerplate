import type { Request, Response } from 'express';
import type { ProblemDetails } from '../types/api.js';

export const notFoundHandler = (req: Request, res: Response): void => {
  const problem: ProblemDetails = {
    type: 'https://httpstatuses.com/404',
    title: 'Not Found',
    status: 404,
    detail: `Route '${req.method} ${req.originalUrl}' does not exist on this server.`,
    instance: req.originalUrl,
    timestamp: new Date().toISOString(),
  };

  res.setHeader('Content-Type', 'application/problem+json');
  res.status(404).json(problem);
};

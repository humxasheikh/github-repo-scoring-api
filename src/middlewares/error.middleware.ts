import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { GitHubApiError } from '../repositories';
import { ApiErrorResponse } from '../models';
import { config } from '../config';

export const errorHandler = (
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  if (error instanceof ZodError) {
    response.error = {
      code: 'VALIDATION_ERROR',
      message: 'Invalid request parameters',
      details: {
        errors: error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    };
    res.status(400).json(response);
    return;
  }

  if (error instanceof GitHubApiError) {
    response.error = {
      code: 'GITHUB_API_ERROR',
      message: error.message,
    };
    res.status(error.statusCode).json(response);
    return;
  }

  if (config.server.isDevelopment) {
    response.error.details = {
      stack: error.stack,
      name: error.name,
    };
  }

  console.error('Unhandled error:', error);
  res.status(500).json(response);
};

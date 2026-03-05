import { Request, Response } from 'express';
import { ApiErrorResponse } from '../models';

export const notFoundHandler = (_req: Request, res: Response): void => {
  const response: ApiErrorResponse = {
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'The requested resource was not found',
    },
    meta: {
      timestamp: new Date().toISOString(),
    },
  };

  res.status(404).json(response);
};

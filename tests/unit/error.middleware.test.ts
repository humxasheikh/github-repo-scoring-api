import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { errorHandler } from '../../src/middlewares/error.middleware';
import { GitHubApiError } from '../../src/repositories';
import { repositorySearchQuerySchema } from '../../src/validators';

describe('errorHandler middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
  });

  it('should handle ZodError with 400 status', () => {
    let zodError: ZodError | null = null;
    try {
      repositorySearchQuerySchema.parse({ page: 'invalid' });
    } catch (error) {
      zodError = error as ZodError;
    }

    expect(zodError).not.toBeNull();
    errorHandler(zodError!, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'VALIDATION_ERROR',
          message: 'Invalid request parameters',
        }),
      })
    );
  });

  it('should include field details in ZodError response', () => {
    let zodError: ZodError | null = null;
    try {
      repositorySearchQuerySchema.parse({ page: 0 });
    } catch (error) {
      zodError = error as ZodError;
    }

    expect(zodError).not.toBeNull();
    errorHandler(zodError!, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.objectContaining({
          details: expect.objectContaining({
            errors: expect.arrayContaining([
              expect.objectContaining({
                field: 'page',
              }),
            ]),
          }),
        }),
      })
    );
  });

  it('should handle GitHubApiError with correct status code', () => {
    const gitHubError = new GitHubApiError('Rate limit exceeded', 403);

    errorHandler(gitHubError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(403);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'GITHUB_API_ERROR',
          message: 'Rate limit exceeded',
        }),
      })
    );
  });

  it('should handle generic errors with 500 status', () => {
    const genericError = new Error('Something went wrong');

    errorHandler(genericError, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        success: false,
        error: expect.objectContaining({
          code: 'INTERNAL_ERROR',
        }),
      })
    );
  });

  it('should include timestamp in meta', () => {
    const error = new Error('Test error');

    errorHandler(error, mockRequest as Request, mockResponse as Response, mockNext);

    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        meta: expect.objectContaining({
          timestamp: expect.any(String),
        }),
      })
    );
  });
});

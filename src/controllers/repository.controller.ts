import { Request, Response, NextFunction } from 'express';
import { repositoryService } from '../services';
import { repositorySearchQuerySchema } from '../validators';
import { ApiResponse, RepositorySearchResult } from '../models';

export class RepositoryController {
  async searchRepositories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const validatedQuery = repositorySearchQuerySchema.parse(req.query);
      const result = await repositoryService.searchRepositories(validatedQuery);

      const response: ApiResponse<RepositorySearchResult> = {
        success: true,
        data: result,
        meta: {
          timestamp: new Date().toISOString(),
        },
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  }
}

export const repositoryController = new RepositoryController();

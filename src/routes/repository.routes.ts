import { Router } from 'express';
import { repositoryController } from '../controllers';

const router = Router();

/**
 * @swagger
 * /api/repositories:
 *   get:
 *     summary: Search and score GitHub repositories
 *     description: Fetches repositories from GitHub and calculates popularity scores (stars 50%, forks 30%, recency 20%).
 *     tags:
 *       - Repositories
 *     parameters:
 *       - in: query
 *         name: language
 *         schema:
 *           type: string
 *         description: Filter by programming language
 *       - in: query
 *         name: createdAfter
 *         schema:
 *           type: string
 *           format: date
 *         description: Filter repositories created after this date (YYYY-MM-DD)
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: perPage
 *         schema:
 *           type: integer
 *           default: 30
 *         description: Results per page (max 100)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [score, stars, forks, updated]
 *           default: score
 *         description: Sort field
 *       - in: query
 *         name: order
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *           default: desc
 *         description: Sort order
 *     responses:
 *       200:
 *         description: Scored repositories returned successfully
 *       400:
 *         description: Validation error
 *       403:
 *         description: GitHub API rate limit exceeded
 *       500:
 *         description: Internal server error
 */
router.get('/', (req, res, next) => repositoryController.searchRepositories(req, res, next));

export { router as repositoryRoutes };

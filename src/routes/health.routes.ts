import { Router } from 'express';
import { healthController } from '../controllers';

const router = Router();

/**
 * @swagger
 * /health:
 *   get:
 *     summary: Health check endpoint
 *     description: Returns server health status, uptime, and version.
 *     tags:
 *       - Health
 *     responses:
 *       200:
 *         description: Server is healthy
 */
router.get('/', (req, res) => healthController.check(req, res));

export { router as healthRoutes };

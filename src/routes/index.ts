import { Router } from 'express';
import { repositoryRoutes } from './repository.routes';
import { healthRoutes } from './health.routes';

const router = Router();

router.use('/health', healthRoutes);
router.use('/api/repositories', repositoryRoutes);

export { router as routes };

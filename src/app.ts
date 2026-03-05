import express, { Application } from 'express';
import swaggerUi from 'swagger-ui-express';
import { routes } from './routes';
import { errorHandler, notFoundHandler, requestLogger } from './middlewares';
import { swaggerSpec } from './config/swagger.config';

export const createApp = (): Application => {
  const app = express();

  // Request logging with response time
  app.use(requestLogger);

  // Built-in middlewares
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Swagger documentation
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  // Routes
  app.use(routes);

  // Error handling
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

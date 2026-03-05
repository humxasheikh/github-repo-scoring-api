/* eslint-disable no-console */
import { createApp } from './app';
import { config } from './config';

const app = createApp();

app.listen(config.server.port, () => {
  console.log(`Server running on port ${config.server.port}`);
  console.log(`Environment: ${config.server.nodeEnv}`);
  console.log(`Health check: http://localhost:${config.server.port}/health`);
  console.log(`API endpoint: http://localhost:${config.server.port}/api/repositories`);
  console.log(`Swagger docs: http://localhost:${config.server.port}/api-docs`);
});

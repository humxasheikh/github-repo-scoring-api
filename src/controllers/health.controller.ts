import { Request, Response } from 'express';
import { ApiResponse, HealthCheckResponse } from '../models';

const startTime = Date.now();

export class HealthController {
  check(_req: Request, res: Response): void {
    const uptime = Math.floor((Date.now() - startTime) / 1000);

    const healthData: HealthCheckResponse = {
      status: 'healthy',
      version: process.env.npm_package_version || '1.0.0',
      uptime,
      timestamp: new Date().toISOString(),
    };

    const response: ApiResponse<HealthCheckResponse> = {
      success: true,
      data: healthData,
    };

    res.status(200).json(response);
  }
}

export const healthController = new HealthController();

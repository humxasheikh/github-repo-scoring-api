/**
 * API request and response types
 */

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    timestamp: string;
    requestId?: string;
  };
}

export interface RepositorySearchQuery {
  language?: string;
  createdAfter?: string;
  page?: number;
  perPage?: number;
  sortBy?: 'score' | 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
}

export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
}

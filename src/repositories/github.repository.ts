import axios, { AxiosInstance, AxiosError } from 'axios';
import { config } from '../config';
import { GitHubSearchResponse, GitHubSearchParams } from '../models';

export class GitHubApiError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly originalError?: Error
  ) {
    super(message);
    this.name = 'GitHubApiError';
  }
}

export class GitHubRepository {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.github.baseUrl,
      timeout: 10000,
      headers: {
        Accept: 'application/vnd.github.v3+json',
        ...(config.github.accessToken && {
          Authorization: `Bearer ${config.github.accessToken}`,
        }),
      },
    });
  }

  private sanitizeQueryValue(value: string): string {
    // Remove GitHub query operators and special characters to prevent injection
    return value.replace(/[:\s<>=*"]/g, '').trim();
  }

  async searchRepositories(params: GitHubSearchParams): Promise<GitHubSearchResponse> {
    const query = this.buildSearchQuery(params);

    try {
      const response = await this.client.get<GitHubSearchResponse>('/search/repositories', {
        params: {
          q: query,
          sort: params.sort || 'stars',
          order: params.order || 'desc',
          per_page: params.perPage || 30,
          page: params.page || 1,
        },
      });

      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  private buildSearchQuery(params: GitHubSearchParams): string {
    const queryParts: string[] = [];

    if (params.language) {
      const sanitizedLanguage = this.sanitizeQueryValue(params.language);
      if (sanitizedLanguage) {
        queryParts.push(`language:${sanitizedLanguage}`);
      }
    }

    if (params.createdAfter) {
      queryParts.push(`created:>=${params.createdAfter}`);
    }

    // Default: search for repositories with at least 1 star to filter out empty repos
    if (queryParts.length === 0) {
      queryParts.push('stars:>=1');
    }

    return queryParts.join(' ');
  }

  private handleError(error: unknown): GitHubApiError {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError<{ message?: string }>;
      const statusCode = axiosError.response?.status || 500;
      const message = axiosError.response?.data?.message || axiosError.message;

      if (statusCode === 403) {
        return new GitHubApiError(
          'GitHub API rate limit exceeded. Please try again later or provide an access token.',
          statusCode,
          error
        );
      }

      if (statusCode === 422) {
        return new GitHubApiError(
          'Invalid search query. Please check your parameters.',
          statusCode,
          error
        );
      }

      return new GitHubApiError(`GitHub API error: ${message}`, statusCode, error);
    }

    return new GitHubApiError(
      'An unexpected error occurred while fetching repositories.',
      500,
      error instanceof Error ? error : undefined
    );
  }
}

export const gitHubRepository = new GitHubRepository();

import { gitHubRepository, GitHubRepository as GitHubRepoClient } from '../repositories';
import { scoringService, ScoringService, MaxValues } from './scoring.service';
import {
  GitHubRepository,
  GitHubSearchParams,
  ScoredRepository,
  RepositorySearchResult,
  PaginationInfo,
} from '../models';
import { RepositorySearchQueryOutput } from '../validators';

export class RepositoryService {
  constructor(
    private readonly githubRepo: GitHubRepoClient = gitHubRepository,
    private readonly scorer: ScoringService = scoringService
  ) {}

  async searchRepositories(query: RepositorySearchQueryOutput): Promise<RepositorySearchResult> {
    const searchParams = this.mapToGitHubParams(query);
    const response = await this.githubRepo.searchRepositories(searchParams);

    const maxValues = this.calculateMaxValues(response.items);
    const scoredRepositories = response.items.map((repo) =>
      this.mapToScoredRepository(repo, maxValues)
    );

    const sortedRepositories = this.sortRepositories(scoredRepositories, query.sortBy, query.order);

    const pagination = this.calculatePagination(
      response.total_count,
      query.page,
      query.perPage
    );

    return {
      totalCount: response.total_count,
      incompleteResults: response.incomplete_results,
      repositories: sortedRepositories,
      pagination,
    };
  }

  private mapToGitHubParams(query: RepositorySearchQueryOutput): GitHubSearchParams {
    return {
      language: query.language,
      createdAfter: query.createdAfter,
      page: query.page,
      perPage: query.perPage,
      sort: query.sortBy === 'score' ? 'stars' : query.sortBy,
      order: query.order,
    };
  }

  private calculateMaxValues(repositories: GitHubRepository[]): MaxValues {
    if (repositories.length === 0) {
      return { maxStars: 0, maxForks: 0 };
    }

    return repositories.reduce(
      (acc, repo) => ({
        maxStars: Math.max(acc.maxStars, repo.stargazers_count),
        maxForks: Math.max(acc.maxForks, repo.forks_count),
      }),
      { maxStars: 0, maxForks: 0 }
    );
  }

  private mapToScoredRepository(repo: GitHubRepository, maxValues: MaxValues): ScoredRepository {
    const score = this.scorer.calculateScore(repo, maxValues);

    return {
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      url: repo.html_url,
      language: repo.language,
      stars: repo.stargazers_count,
      forks: repo.forks_count,
      openIssues: repo.open_issues_count,
      createdAt: repo.created_at,
      updatedAt: repo.updated_at,
      pushedAt: repo.pushed_at,
      owner: {
        login: repo.owner.login,
        avatarUrl: repo.owner.avatar_url,
        profileUrl: repo.owner.html_url,
      },
      score,
    };
  }

  private sortRepositories(
    repositories: ScoredRepository[],
    sortBy: 'score' | 'stars' | 'forks' | 'updated',
    order: 'asc' | 'desc'
  ): ScoredRepository[] {
    const sorted = [...repositories].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case 'score':
          comparison = a.score.total - b.score.total;
          break;
        case 'stars':
          comparison = a.stars - b.stars;
          break;
        case 'forks':
          comparison = a.forks - b.forks;
          break;
        case 'updated':
          comparison = new Date(a.pushedAt).getTime() - new Date(b.pushedAt).getTime();
          break;
        default:
          comparison = a.score.total - b.score.total;
      }

      return order === 'desc' ? -comparison : comparison;
    });

    return sorted;
  }

  private calculatePagination(
    totalCount: number,
    currentPage: number,
    perPage: number
  ): PaginationInfo {
    // GitHub API limits to 1000 results
    const effectiveTotal = Math.min(totalCount, 1000);
    const totalPages = Math.ceil(effectiveTotal / perPage);

    return {
      currentPage,
      perPage,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPreviousPage: currentPage > 1,
    };
  }
}

export const repositoryService = new RepositoryService();

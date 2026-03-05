import { RepositoryService } from '../../src/services/repository.service';
import { GitHubRepository } from '../../src/repositories';
import { ScoringService } from '../../src/services/scoring.service';
import { GitHubSearchResponse, GitHubRepository as GitHubRepoType } from '../../src/models';

describe('RepositoryService', () => {
  let repositoryService: RepositoryService;
  let mockGitHubRepo: jest.Mocked<GitHubRepository>;
  let mockScoringService: jest.Mocked<ScoringService>;

  const mockGitHubResponse: GitHubSearchResponse = {
    total_count: 2,
    incomplete_results: false,
    items: [
      {
        id: 1,
        name: 'repo-1',
        full_name: 'owner/repo-1',
        description: 'First repo',
        html_url: 'https://github.com/owner/repo-1',
        language: 'TypeScript',
        stargazers_count: 1000,
        forks_count: 100,
        open_issues_count: 5,
        created_at: '2023-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
        pushed_at: '2024-01-01T00:00:00Z',
        owner: {
          login: 'owner',
          avatar_url: 'https://github.com/owner.png',
          html_url: 'https://github.com/owner',
        },
      },
      {
        id: 2,
        name: 'repo-2',
        full_name: 'owner/repo-2',
        description: 'Second repo',
        html_url: 'https://github.com/owner/repo-2',
        language: 'TypeScript',
        stargazers_count: 500,
        forks_count: 50,
        open_issues_count: 3,
        created_at: '2023-06-01T00:00:00Z',
        updated_at: '2024-02-01T00:00:00Z',
        pushed_at: '2024-02-01T00:00:00Z',
        owner: {
          login: 'owner',
          avatar_url: 'https://github.com/owner.png',
          html_url: 'https://github.com/owner',
        },
      },
    ],
  };

  beforeEach(() => {
    mockGitHubRepo = {
      searchRepositories: jest.fn(),
    } as unknown as jest.Mocked<GitHubRepository>;

    mockScoringService = {
      calculateScore: jest.fn(),
    } as unknown as jest.Mocked<ScoringService>;

    mockGitHubRepo.searchRepositories.mockResolvedValue(mockGitHubResponse);
    mockScoringService.calculateScore.mockImplementation((repo: GitHubRepoType) => ({
      total: repo.stargazers_count / 1000,
      breakdown: {
        starsScore: repo.stargazers_count / 2000,
        forksScore: repo.forks_count / 200,
        recencyScore: 0.15,
      },
    }));

    repositoryService = new RepositoryService(mockGitHubRepo, mockScoringService);
  });

  describe('searchRepositories', () => {
    const defaultQuery = {
      page: 1,
      perPage: 30,
      sortBy: 'score' as const,
      order: 'desc' as const,
    };

    it('should return scored repositories', async () => {
      const result = await repositoryService.searchRepositories(defaultQuery);

      expect(result.repositories).toHaveLength(2);
      expect(result.repositories[0]).toHaveProperty('score');
      expect(result.repositories[0].score).toHaveProperty('total');
      expect(result.repositories[0].score).toHaveProperty('breakdown');
    });

    it('should map GitHub response to domain model', async () => {
      const result = await repositoryService.searchRepositories(defaultQuery);

      const firstRepo = result.repositories[0];
      expect(firstRepo).toHaveProperty('id');
      expect(firstRepo).toHaveProperty('name');
      expect(firstRepo).toHaveProperty('fullName');
      expect(firstRepo).toHaveProperty('url');
      expect(firstRepo).toHaveProperty('stars');
      expect(firstRepo).toHaveProperty('forks');
      expect(firstRepo.owner).toHaveProperty('login');
      expect(firstRepo.owner).toHaveProperty('avatarUrl');
      expect(firstRepo.owner).toHaveProperty('profileUrl');
    });

    it('should sort by score in descending order by default', async () => {
      const result = await repositoryService.searchRepositories(defaultQuery);

      expect(result.repositories[0].score.total).toBeGreaterThanOrEqual(
        result.repositories[1].score.total
      );
    });

    it('should sort by score in ascending order when specified', async () => {
      const result = await repositoryService.searchRepositories({
        ...defaultQuery,
        order: 'asc',
      });

      expect(result.repositories[0].score.total).toBeLessThanOrEqual(
        result.repositories[1].score.total
      );
    });

    it('should include pagination info', async () => {
      const result = await repositoryService.searchRepositories(defaultQuery);

      expect(result.pagination).toHaveProperty('currentPage', 1);
      expect(result.pagination).toHaveProperty('perPage', 30);
      expect(result.pagination).toHaveProperty('totalPages');
      expect(result.pagination).toHaveProperty('hasNextPage');
      expect(result.pagination).toHaveProperty('hasPreviousPage', false);
    });

    it('should pass language filter to GitHub API', async () => {
      await repositoryService.searchRepositories({
        ...defaultQuery,
        language: 'typescript',
      });

      expect(mockGitHubRepo.searchRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          language: 'typescript',
        })
      );
    });

    it('should pass createdAfter filter to GitHub API', async () => {
      await repositoryService.searchRepositories({
        ...defaultQuery,
        createdAfter: '2023-01-01',
      });

      expect(mockGitHubRepo.searchRepositories).toHaveBeenCalledWith(
        expect.objectContaining({
          createdAfter: '2023-01-01',
        })
      );
    });

    it('should return totalCount and incompleteResults', async () => {
      const result = await repositoryService.searchRepositories(defaultQuery);

      expect(result.totalCount).toBe(2);
      expect(result.incompleteResults).toBe(false);
    });
  });
});

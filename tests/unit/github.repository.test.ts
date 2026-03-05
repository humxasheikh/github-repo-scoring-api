import axios from 'axios';
import { GitHubRepository, GitHubApiError } from '../../src/repositories/github.repository';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('GitHubRepository', () => {
  let gitHubRepository: GitHubRepository;
  let mockAxiosInstance: jest.Mocked<ReturnType<typeof axios.create>>;

  beforeEach(() => {
    mockAxiosInstance = {
      get: jest.fn(),
    } as unknown as jest.Mocked<ReturnType<typeof axios.create>>;

    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    gitHubRepository = new GitHubRepository();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchRepositories', () => {
    const mockResponse = {
      data: {
        total_count: 100,
        incomplete_results: false,
        items: [
          {
            id: 1,
            name: 'test-repo',
            full_name: 'owner/test-repo',
            description: 'Test',
            html_url: 'https://github.com/owner/test-repo',
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
        ],
      },
    };

    it('should fetch repositories successfully', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await gitHubRepository.searchRepositories({
        language: 'typescript',
        page: 1,
        perPage: 30,
      });

      expect(result.total_count).toBe(100);
      expect(result.items).toHaveLength(1);
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/repositories', {
        params: expect.objectContaining({
          q: 'language:typescript',
          page: 1,
          per_page: 30,
        }),
      });
    });

    it('should build query with createdAfter filter', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await gitHubRepository.searchRepositories({
        language: 'javascript',
        createdAfter: '2023-01-01',
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/repositories', {
        params: expect.objectContaining({
          q: 'language:javascript created:>=2023-01-01',
        }),
      });
    });

    it('should use default query when no filters provided', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await gitHubRepository.searchRepositories({});

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/repositories', {
        params: expect.objectContaining({
          q: 'stars:>=1',
        }),
      });
    });

    it('should throw GitHubApiError on rate limit (403)', async () => {
      const rateLimitError = {
        isAxiosError: true,
        response: {
          status: 403,
          data: { message: 'Rate limit exceeded' },
        },
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValue(rateLimitError);

      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(GitHubApiError);
      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(/rate limit/i);
    });

    it('should throw GitHubApiError on invalid query (422)', async () => {
      const validationError = {
        isAxiosError: true,
        response: {
          status: 422,
          data: { message: 'Validation Failed' },
        },
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValue(validationError);

      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(GitHubApiError);
      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(/invalid search query/i);
    });

    it('should throw GitHubApiError on other API errors', async () => {
      const apiError = {
        isAxiosError: true,
        response: {
          status: 500,
          data: { message: 'Internal Server Error' },
        },
        message: 'Request failed',
      };

      mockedAxios.isAxiosError.mockReturnValue(true);
      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(GitHubApiError);
    });

    it('should handle non-axios errors', async () => {
      mockedAxios.isAxiosError.mockReturnValue(false);
      mockAxiosInstance.get.mockRejectedValue(new Error('Network error'));

      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(GitHubApiError);
      await expect(gitHubRepository.searchRepositories({})).rejects.toThrow(/unexpected error/i);
    });

    it('should use default sort and order', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await gitHubRepository.searchRepositories({});

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/repositories', {
        params: expect.objectContaining({
          sort: 'stars',
          order: 'desc',
        }),
      });
    });

    it('should use custom sort and order when provided', async () => {
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      await gitHubRepository.searchRepositories({
        sort: 'forks',
        order: 'asc',
      });

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/search/repositories', {
        params: expect.objectContaining({
          sort: 'forks',
          order: 'asc',
        }),
      });
    });
  });
});

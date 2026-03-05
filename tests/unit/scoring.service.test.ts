import { ScoringService } from '../../src/services/scoring.service';
import { GitHubRepository } from '../../src/models';

describe('ScoringService', () => {
  let scoringService: ScoringService;

  const mockRepository: GitHubRepository = {
    id: 1,
    name: 'test-repo',
    full_name: 'owner/test-repo',
    description: 'Test repository',
    html_url: 'https://github.com/owner/test-repo',
    language: 'TypeScript',
    stargazers_count: 1000,
    forks_count: 200,
    open_issues_count: 10,
    created_at: '2023-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
    pushed_at: new Date().toISOString(),
    owner: {
      login: 'owner',
      avatar_url: 'https://github.com/owner.png',
      html_url: 'https://github.com/owner',
    },
  };

  const maxValues = {
    maxStars: 10000,
    maxForks: 2000,
  };

  beforeEach(() => {
    scoringService = new ScoringService({
      stars: 0.5,
      forks: 0.3,
      recency: 0.2,
    });
  });

  describe('calculateScore', () => {
    it('should return a score object with total and breakdown', () => {
      const score = scoringService.calculateScore(mockRepository, maxValues);

      expect(score).toHaveProperty('total');
      expect(score).toHaveProperty('breakdown');
      expect(score.breakdown).toHaveProperty('starsScore');
      expect(score.breakdown).toHaveProperty('forksScore');
      expect(score.breakdown).toHaveProperty('recencyScore');
    });

    it('should return score between 0 and 1', () => {
      const score = scoringService.calculateScore(mockRepository, maxValues);

      expect(score.total).toBeGreaterThanOrEqual(0);
      expect(score.total).toBeLessThanOrEqual(1);
    });

    it('should give higher score to recently updated repositories', () => {
      const recentRepo = {
        ...mockRepository,
        pushed_at: new Date().toISOString(),
      };

      const oldRepo = {
        ...mockRepository,
        pushed_at: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
      };

      const recentScore = scoringService.calculateScore(recentRepo, maxValues);
      const oldScore = scoringService.calculateScore(oldRepo, maxValues);

      expect(recentScore.breakdown.recencyScore).toBeGreaterThan(oldScore.breakdown.recencyScore);
    });

    it('should handle zero stars and forks', () => {
      const emptyRepo = {
        ...mockRepository,
        stargazers_count: 0,
        forks_count: 0,
      };

      const score = scoringService.calculateScore(emptyRepo, maxValues);

      expect(score.breakdown.starsScore).toBe(0);
      expect(score.breakdown.forksScore).toBe(0);
    });

    it('should handle zero max values', () => {
      const score = scoringService.calculateScore(mockRepository, {
        maxStars: 0,
        maxForks: 0,
      });

      expect(score.breakdown.starsScore).toBe(0);
      expect(score.breakdown.forksScore).toBe(0);
    });

    it('should apply weights correctly', () => {
      const customService = new ScoringService({
        stars: 1.0,
        forks: 0,
        recency: 0,
      });

      const score = customService.calculateScore(mockRepository, maxValues);

      expect(score.breakdown.forksScore).toBe(0);
      expect(score.breakdown.recencyScore).toBe(0);
      expect(score.total).toBe(score.breakdown.starsScore);
    });
  });
});

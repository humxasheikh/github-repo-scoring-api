import { config } from '../config';
import { GitHubRepository } from '../models';
import { RepositoryScore, ScoreWeights } from '../models';

export class ScoringService {
  private readonly weights: ScoreWeights;

  constructor(weights?: ScoreWeights) {
    this.weights = weights || config.scoring.weights;
  }

  calculateScore(repository: GitHubRepository, maxValues: MaxValues): RepositoryScore {
    const starsScore = this.normalizeScore(repository.stargazers_count, maxValues.maxStars);
    const forksScore = this.normalizeScore(repository.forks_count, maxValues.maxForks);
    const recencyScore = this.calculateRecencyScore(repository.pushed_at);

    const weightedStars = starsScore * this.weights.stars;
    const weightedForks = forksScore * this.weights.forks;
    const weightedRecency = recencyScore * this.weights.recency;

    const total = Math.round((weightedStars + weightedForks + weightedRecency) * 100) / 100;

    return {
      total,
      breakdown: {
        starsScore: Math.round(weightedStars * 100) / 100,
        forksScore: Math.round(weightedForks * 100) / 100,
        recencyScore: Math.round(weightedRecency * 100) / 100,
      },
    };
  }

  private normalizeScore(value: number, maxValue: number): number {
    if (maxValue === 0) return 0;

    // Use logarithmic scaling to handle large outliers
    const logValue = Math.log10(value + 1);
    const logMax = Math.log10(maxValue + 1);

    return logMax === 0 ? 0 : logValue / logMax;
  }

  private calculateRecencyScore(pushedAt: string): number {
    const lastPush = new Date(pushedAt);
    const now = new Date();
    const daysSinceUpdate = (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24);

    // Score decay: 100% for today, decreasing over time
    // After 365 days, score approaches 0
    const decayFactor = 365;
    const score = Math.max(0, 1 - daysSinceUpdate / decayFactor);

    return score;
  }
}

export interface MaxValues {
  maxStars: number;
  maxForks: number;
}

export const scoringService = new ScoringService();

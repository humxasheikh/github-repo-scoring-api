/**
 * Application domain types for scored repositories
 */

export interface ScoredRepository {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  url: string;
  language: string | null;
  stars: number;
  forks: number;
  openIssues: number;
  createdAt: string;
  updatedAt: string;
  pushedAt: string;
  owner: {
    login: string;
    avatarUrl: string;
    profileUrl: string;
  };
  score: RepositoryScore;
}

export interface RepositoryScore {
  total: number;
  breakdown: {
    starsScore: number;
    forksScore: number;
    recencyScore: number;
  };
}

export interface ScoreWeights {
  stars: number;
  forks: number;
  recency: number;
}

export interface RepositorySearchResult {
  totalCount: number;
  incompleteResults: boolean;
  repositories: ScoredRepository[];
  pagination: PaginationInfo;
}

export interface PaginationInfo {
  currentPage: number;
  perPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

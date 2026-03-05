/**
 * GitHub API response types
 */

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  owner: {
    login: string;
    avatar_url: string;
    html_url: string;
  };
}

export interface GitHubSearchResponse {
  total_count: number;
  incomplete_results: boolean;
  items: GitHubRepository[];
}

export interface GitHubSearchParams {
  language?: string;
  createdAfter?: string;
  perPage?: number;
  page?: number;
  sort?: 'stars' | 'forks' | 'updated';
  order?: 'asc' | 'desc';
}

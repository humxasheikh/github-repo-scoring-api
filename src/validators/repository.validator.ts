import { z } from 'zod';

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const repositorySearchQuerySchema = z.object({
  language: z
    .string()
    .min(1, 'Language must not be empty')
    .max(50, 'Language must not exceed 50 characters')
    .optional(),

  createdAfter: z
    .string()
    .regex(dateRegex, 'Date must be in YYYY-MM-DD format')
    .refine(
      (date) => {
        const parsed = new Date(date);
        return !isNaN(parsed.getTime()) && parsed <= new Date();
      },
      { message: 'Date must be a valid date not in the future' }
    )
    .optional(),

  page: z.coerce
    .number()
    .int('Page must be an integer')
    .min(1, 'Page must be at least 1')
    .max(100, 'Page must not exceed 100')
    .default(1),

  perPage: z.coerce
    .number()
    .int('Per page must be an integer')
    .min(1, 'Per page must be at least 1')
    .max(100, 'Per page must not exceed 100')
    .default(30),

  sortBy: z.enum(['score', 'stars', 'forks', 'updated']).default('score'),

  order: z.enum(['asc', 'desc']).default('desc'),
});

export type RepositorySearchQueryInput = z.input<typeof repositorySearchQuerySchema>;
export type RepositorySearchQueryOutput = z.output<typeof repositorySearchQuerySchema>;

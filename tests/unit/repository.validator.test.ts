import { repositorySearchQuerySchema } from '../../src/validators';

describe('repositorySearchQuerySchema', () => {
  describe('valid inputs', () => {
    it('should accept empty query with defaults', () => {
      const result = repositorySearchQuerySchema.parse({});

      expect(result.page).toBe(1);
      expect(result.perPage).toBe(30);
      expect(result.sortBy).toBe('score');
      expect(result.order).toBe('desc');
    });

    it('should accept valid language', () => {
      const result = repositorySearchQuerySchema.parse({
        language: 'typescript',
      });

      expect(result.language).toBe('typescript');
    });

    it('should accept valid date format', () => {
      const result = repositorySearchQuerySchema.parse({
        createdAfter: '2023-01-01',
      });

      expect(result.createdAfter).toBe('2023-01-01');
    });

    it('should coerce string numbers to numbers', () => {
      const result = repositorySearchQuerySchema.parse({
        page: '5',
        perPage: '50',
      });

      expect(result.page).toBe(5);
      expect(result.perPage).toBe(50);
    });

    it('should accept all valid sortBy options', () => {
      const sortOptions = ['score', 'stars', 'forks', 'updated'];

      sortOptions.forEach((sortBy) => {
        const result = repositorySearchQuerySchema.parse({ sortBy });
        expect(result.sortBy).toBe(sortBy);
      });
    });

    it('should accept both order directions', () => {
      const ascResult = repositorySearchQuerySchema.parse({ order: 'asc' });
      const descResult = repositorySearchQuerySchema.parse({ order: 'desc' });

      expect(ascResult.order).toBe('asc');
      expect(descResult.order).toBe('desc');
    });
  });

  describe('invalid inputs', () => {
    it('should reject empty language string', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          language: '',
        })
      ).toThrow();
    });

    it('should reject invalid date format', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          createdAfter: '01-01-2023',
        })
      ).toThrow();
    });

    it('should reject future dates', () => {
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const futureDateString = futureDate.toISOString().split('T')[0];

      expect(() =>
        repositorySearchQuerySchema.parse({
          createdAfter: futureDateString,
        })
      ).toThrow();
    });

    it('should reject page less than 1', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          page: 0,
        })
      ).toThrow();
    });

    it('should reject page greater than 100', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          page: 101,
        })
      ).toThrow();
    });

    it('should reject perPage greater than 100', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          perPage: 101,
        })
      ).toThrow();
    });

    it('should reject invalid sortBy option', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          sortBy: 'invalid',
        })
      ).toThrow();
    });

    it('should reject invalid order option', () => {
      expect(() =>
        repositorySearchQuerySchema.parse({
          order: 'invalid',
        })
      ).toThrow();
    });
  });
});

# GitHub Repository Scoring API

A backend application that fetches GitHub repositories and assigns popularity scores based on stars, forks, and recency of updates.

## Features

- Search GitHub repositories by language and creation date
- Calculate popularity scores using a weighted algorithm
- RESTful API with proper error handling
- Input validation using Zod
- Comprehensive test coverage
- **Swagger/OpenAPI documentation**

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Validation**: Zod
- **HTTP Client**: Axios
- **Testing**: Jest, Supertest
- **Documentation**: Swagger/OpenAPI

## Project Structure

```
src/
├── config/          # Environment configuration
├── controllers/     # Route handlers
├── middlewares/     # Express middlewares (error handling)
├── models/          # TypeScript interfaces
├── repositories/    # Data access layer (GitHub API)
├── routes/          # Route definitions
├── services/        # Business logic (scoring algorithm)
├── validators/      # Zod schemas
├── app.ts           # Express app setup
└── server.ts        # Entry point
```

## Getting Started

### Prerequisites

- Node.js >= 20
- npm >= 10

### Installation

```bash
# Install dependencies
npm install

# Copy environment file
cp .env.example .env
```

### Configuration

Edit `.env` file:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# GitHub API Configuration
GITHUB_API_BASE_URL=https://api.github.com
GITHUB_ACCESS_TOKEN=your_github_token_here  # Optional, increases rate limit

# Scoring Algorithm Weights (must sum to 1.0)
WEIGHT_STARS=0.5
WEIGHT_FORKS=0.3
WEIGHT_RECENCY=0.2
```

> **Note**: Without a GitHub token, API requests are limited to 60/hour. With a token, the limit increases to 5,000/hour.

### Running the Application

```bash
# Development mode (with hot reload)
npm run dev

# Production build
npm run build
npm start
```

## API Documentation

### Swagger UI

Once the server is running, access the interactive API documentation at:

```
http://localhost:3000/api-docs
```

The Swagger UI provides:
- Interactive API exploration
- Request/response examples
- Schema definitions
- Try-it-out functionality

## API Endpoints

### Health Check

```
GET /health
```

Response:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "version": "1.0.0",
    "uptime": 123,
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Search Repositories

```
GET /api/repositories
```

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `language` | string | - | Filter by programming language |
| `createdAfter` | string | - | Minimum creation date (YYYY-MM-DD) |
| `page` | number | 1 | Page number (1-100) |
| `perPage` | number | 30 | Results per page (1-100) |
| `sortBy` | string | score | Sort by: `score`, `stars`, `forks`, `updated` |
| `order` | string | desc | Sort order: `asc`, `desc` |

#### Example Request

```bash
curl "http://localhost:3000/api/repositories?language=typescript&createdAfter=2023-01-01&perPage=10&sortBy=score"
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "totalCount": 1000,
    "incompleteResults": false,
    "repositories": [
      {
        "id": 123456,
        "name": "awesome-project",
        "fullName": "owner/awesome-project",
        "description": "An awesome TypeScript project",
        "url": "https://github.com/owner/awesome-project",
        "language": "TypeScript",
        "stars": 5000,
        "forks": 500,
        "openIssues": 10,
        "createdAt": "2023-06-01T00:00:00Z",
        "updatedAt": "2024-01-01T00:00:00Z",
        "pushedAt": "2024-01-01T00:00:00Z",
        "owner": {
          "login": "owner",
          "avatarUrl": "https://github.com/owner.png",
          "profileUrl": "https://github.com/owner"
        },
        "score": {
          "total": 0.85,
          "breakdown": {
            "starsScore": 0.45,
            "forksScore": 0.25,
            "recencyScore": 0.15
          }
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "perPage": 10,
      "totalPages": 100,
      "hasNextPage": true,
      "hasPreviousPage": false
    }
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## Scoring Algorithm

The popularity score is calculated using three factors:

| Factor | Default Weight | Description |
|--------|---------------|-------------|
| Stars | 50% | Normalized using logarithmic scaling |
| Forks | 30% | Normalized using logarithmic scaling |
| Recency | 20% | Linear decay over 365 days |

### Formula

```
score = (starsScore × 0.5) + (forksScore × 0.3) + (recencyScore × 0.2)
```

- **Stars/Forks Score**: Uses logarithmic normalization to handle outliers
- **Recency Score**: `max(0, 1 - daysSinceLastPush / 365)`

Weights are configurable via environment variables.

## Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Coverage

| Metric | Coverage |
|--------|----------|
| Statements | 91% |
| Branches | 76% |
| Functions | 80% |
| Lines | 90% |

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run tests |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run lint` | Run ESLint |
| `npm run lint:fix` | Fix ESLint errors |
| `npm run format` | Format code with Prettier |
| `npm run typecheck` | Run TypeScript type checking |

## Assumptions

### Scoring Algorithm

| Assumption | Rationale |
|------------|-----------|
| **`pushed_at` for recency** | More reliable than `updated_at` which includes metadata changes |
| **365-day decay window** | Repositories inactive for over 1 year are considered stale |
| **Default weights (50/30/20)** | Stars are most indicative of popularity, recency least |
| **Logarithmic normalization** | Linear scaling would over-penalize average repositories |

### API Behavior

| Assumption | Rationale |
|------------|-----------|
| **Single language filter** | GitHub API limitation; multiple languages require separate calls |
| **Max 100 results per page** | GitHub API constraint |
| **Max 1000 total results** | GitHub search API limitation |
| **Scores normalized per result set** | Comparison within current page, not globally |

### Infrastructure

| Assumption | Rationale |
|------------|-----------|
| **Stateless application** | No persistence needed for scoring operations |
| **No authentication required** | Public API for demonstration purposes |
| **GitHub token optional** | Works without token (60 req/hr) but recommended for production |

## Scalability

### Current Design

The application is designed with scalability in mind:

- **Stateless architecture**: No session state; any instance can handle any request
- **Pagination**: Limits response size and memory usage
- **Input validation**: Rejects invalid requests early (fail-fast)
- **Error isolation**: Individual request failures don't affect the server

### Scaling Recommendations

| Component | Solution | Benefit |
|-----------|----------|---------|
| **Caching** | Redis with 5-15 min TTL | Reduce GitHub API calls by 80%+ |
| **Rate Limiting** | express-rate-limit | Protect from abuse |
| **Load Balancing** | Nginx / AWS ALB | Distribute traffic across instances |
| **Containerization** | Docker + Kubernetes | Auto-scaling based on demand |
| **CDN** | CloudFront / Cloudflare | Cache responses at edge locations |

### Bottlenecks & Solutions

| Bottleneck | Current Limit | Scalable Solution |
|------------|---------------|-------------------|
| GitHub API | 60 req/hr (no token) | Token (5000/hr) + Redis caching |
| Single process | ~100 req/sec | PM2 cluster mode / K8s pods |
| No caching | Every request hits GitHub | Redis reduces 80% of external calls |

## Error Handling

All errors return a consistent format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "meta": {
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request parameters |
| `NOT_FOUND` | 404 | Resource not found |
| `GITHUB_API_ERROR` | varies | GitHub API error |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## License

ISC

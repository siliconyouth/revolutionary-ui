# Marketplace API Documentation

This is the real API implementation for the Revolutionary UI Factory System marketplace.

## Setup

1. Copy `.env.sample` to `.env.local` and fill in your database credentials
2. Run `npm install` to install dependencies
3. Run `npm run prisma:migrate` to create database tables
4. Run `npm run prisma:seed` to populate with sample data
5. Run `npm run dev` to start the development server

## API Endpoints

### Components

#### GET /api/marketplace/components
Search and filter marketplace components.

Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 20)
- `sortField` (string): Field to sort by (downloads, rating, price, date, name)
- `sortDirection` (string): Sort direction (asc, desc)
- `search` (string): Search query
- `category` (string): Filter by category
- `framework` (string): Filter by framework
- `styling` (string): Filter by styling
- `minPrice` (number): Minimum price
- `maxPrice` (number): Maximum price
- `premium` (boolean): Filter premium components
- `author` (string): Filter by author ID
- `rating` (number): Minimum rating

#### POST /api/marketplace/components
Publish a new component (requires authentication).

Body:
```json
{
  "component": { /* ComponentNode */ },
  "name": "Component Name",
  "description": "Description",
  "category": "layout",
  "tags": ["tag1", "tag2"],
  "version": "1.0.0",
  "price": 0,
  "framework": ["react", "vue"],
  "styling": ["tailwind"],
  "license": "MIT",
  "documentation": "Usage instructions",
  "demoUrl": "https://demo.com"
}
```

#### GET /api/marketplace/components/[id]
Get a specific component by ID.

#### PUT /api/marketplace/components/[id]
Update a component (requires authentication and ownership).

Body:
```json
{
  "component": { /* ComponentNode */ },
  "changelog": "What changed in this version"
}
```

#### DELETE /api/marketplace/components/[id]
Unpublish a component (requires authentication and ownership).

### Downloads

#### POST /api/marketplace/components/[id]/download
Download a component (requires authentication, and purchase for premium components).

Returns:
```json
{
  "component": { /* ComponentNode */ },
  "license": "MIT"
}
```

### Reviews

#### GET /api/marketplace/components/[id]/reviews
Get reviews for a component.

Query parameters:
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)

#### POST /api/marketplace/components/[id]/reviews
Add a review (requires authentication).

Body:
```json
{
  "rating": 5,
  "comment": "Great component!"
}
```

### Versions

#### GET /api/marketplace/components/[id]/versions
Get version history for a component.

### Special Endpoints

#### GET /api/marketplace/components/featured
Get featured components.

#### GET /api/marketplace/components/trending
Get trending components.

Query parameters:
- `period` (string): Time period (day, week, month)

### User Library

#### GET /api/marketplace/user/library
Get user's library (purchased, favorites, published).

#### POST /api/marketplace/user/favorites/[id]
Add component to favorites.

#### DELETE /api/marketplace/user/favorites/[id]
Remove component from favorites.

### Categories

#### GET /api/marketplace/categories
Get all categories with component counts.

## Authentication

All endpoints that require authentication use NextAuth.js. Include the session cookie or use NextAuth's built-in authentication methods.

## Error Responses

All endpoints return standard HTTP status codes:
- 200: Success
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error format:
```json
{
  "error": "Error message"
}
```

## Rate Limiting

API endpoints are rate-limited to prevent abuse:
- Anonymous: 100 requests/hour
- Authenticated: 1000 requests/hour
- Publishing: 10 components/day

## Database Schema

See `prisma/schema.prisma` for the complete database schema.

## Development

To modify the API:
1. Update the route handler in `src/app/api/marketplace/`
2. Update the Prisma schema if needed
3. Run `npm run prisma:generate` to update the client
4. Run `npm run prisma:migrate` to apply database changes
5. Update this documentation
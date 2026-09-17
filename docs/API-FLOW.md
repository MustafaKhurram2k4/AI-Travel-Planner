# API Flow

## Authentication

```text
POST /api/v1/auth/register
POST /api/v1/auth/login
GET  /api/v1/auth/me
```

JWT is returned after successful login.

Send it as:

```http
Authorization: Bearer <token>
```

## Trip creation

```text
Frontend
 ↓
POST /api/v1/trips
 ↓
Trip Service
 ↓
Prisma
 ↓
Database
```

## Place search

```text
Frontend / AI
 ↓
GET /api/v1/places/search
 ↓
Places Service
 ↓
Mock provider OR Google provider
 ↓
Normalized PlaceResult
```

## Route

```text
POST /api/v1/routes/directions
 ↓
Routes Service
 ↓
Mock OR Google Routes
 ↓
Normalized RouteResult
```

## AI validation

```text
AI
 ↓
POST /api/v1/planning/:tripId/validate-draft
 ↓
Zod schema
 ↓
Deterministic validation engine
 ↓
ValidationResult
```

## Persistence

Only a valid draft should normally be persisted through:

```text
POST /api/v1/trips/:id/itinerary
```

The backend performs validation again before persistence.

## Activity edit

```text
Frontend
 ↓
PATCH /api/v1/activities/:id
 ↓
Backend ownership check
 ↓
Database update
 ↓
Frontend requests validation
```

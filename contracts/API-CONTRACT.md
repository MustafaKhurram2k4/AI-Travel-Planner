# Shared API Contract

## Frontend → Backend

### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "demo@travelplanner.local",
  "password": "Demo@12345"
}
```

### List trips

```http
GET /api/v1/trips
Authorization: Bearer <token>
```

### Create trip

```http
POST /api/v1/trips
Authorization: Bearer <token>
Content-Type: application/json
```

See `contracts/ITINERARY-DRAFT.json` for the itinerary format.

## AI → Backend

### Validate candidate

```http
POST /api/v1/planning/:tripId/validate-draft
Authorization: Bearer <token>
Content-Type: application/json
```

Response:

```json
{
  "source": "deterministic-validation-engine",
  "validation": {
    "valid": false,
    "errors": [],
    "warnings": [],
    "summary": {}
  }
}
```

## Important

If this contract changes:

1. update this document
2. update the backend schema
3. tell Aagam
4. tell Arav
5. add/update tests
6. make a dedicated Git commit

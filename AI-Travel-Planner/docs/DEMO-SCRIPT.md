# Major Project Backend Demo Script — Mustafa

## Demo 1 — Server

```text
npm run dev
```

Show:

```text
/health
/docs
```

Explain:

> "This is the REST backend and its API documentation."

## Demo 2 — Authentication

Register/login.

Explain:

> "The backend owns authentication and uses JWT to authorize protected resources."

## Demo 3 — Places

Search:

```text
GET /api/v1/places/search?query=temple
```

Explain:

> "The application uses a provider abstraction. During development the mock provider
> makes the demonstration deterministic. The same service can later call Google."

## Demo 4 — Validation

Submit an itinerary containing:

```text
10:00 → 12:00 Museum
11:00 → 13:00 Restaurant
```

Backend returns:

```text
OVERLAP
```

Explain:

> "The LLM is not the final authority. The deterministic backend catches the conflict."

## Demo 5 — Budget

Set:

```text
Budget: ₹5,000
Activities: ₹8,000
```

Backend rejects the itinerary.

## Demo 6 — Opening hours

Give an attraction:

```text
Opening: 09:00-18:00
Visit: 08:00-10:00
```

Backend rejects it.

## Demo 7 — AI handoff

Tell Arav:

> "Your AI generates the candidate. Send it to `/planning/:tripId/validate-draft`.
> Do not bypass the validator."

## Demo 8 — Frontend handoff

Tell Aagam:

> "Use the REST API and do not access Prisma directly."

## Strong closing statement

> "The backend provides persistence, external service abstraction and deterministic
> validation. AI is responsible for qualitative planning, while the backend remains
> responsible for hard constraints."

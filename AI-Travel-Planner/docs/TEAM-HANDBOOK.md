# Team Handbook — How We Work on the Project

## 1. Responsibilities

### Mustafa Khurram — Backend Owner

Own these directories:

```text
backend/src/
backend/prisma/
backend/tests/
```

Main deliverables:

1. REST API
2. Database
3. Authentication
4. Service wrappers
5. Mock services
6. Validation engine
7. Persistence
8. API documentation
9. Backend tests
10. Integration contracts

### Arav Gupta — AI/MCP Owner

Own:

```text
ai/
```

Main deliverables:

1. Prompt engineering
2. Structured itinerary output
3. LLM orchestration
4. Tool calling
5. MCP integration where selected
6. Repair/regeneration strategy
7. AI schema validation before submitting to backend

Arav should consume Mustafa's endpoints instead of directly writing to the database.

### Aagam Jain — Frontend Owner

Own:

```text
frontend/
```

Main deliverables:

1. React UI
2. Trip creation
3. Saved trips
4. Itinerary presentation
5. Editing controls
6. Map presentation
7. AI refinement UI
8. Responsive/accessibility polish

Aagam should consume REST APIs rather than directly accessing the database or provider APIs.

---

# 2. Shared API contract

The frontend should never assume database table names.

Use:

```text
/api/v1/...
```

The AI layer should never assume Prisma models.

Use:

```text
POST /api/v1/planning/:tripId/validate-draft
```

The backend is the contract boundary.

---

# 3. Environment variables

Never commit:

```text
.env
```

Commit:

```text
.env.example
```

API keys belong server-side.

---

# 4. How to add a backend feature

Example: adding weather.

Create:

```text
backend/src/services/weather.service.ts
backend/src/controllers/weather.controller.ts
```

Then add a route:

```text
GET /api/v1/weather
```

If an external API is used, first create an interface and then provide:

```text
LiveWeatherProvider
MockWeatherProvider
```

This keeps demonstrations deterministic.

---

# 5. How AI should call the backend

Arav receives the trip:

```http
GET /api/v1/trips/:id
```

He generates candidate JSON.

He submits:

```http
POST /api/v1/planning/:tripId/validate-draft
```

If:

```json
{
  "valid": false
}
```

he repairs the candidate.

If:

```json
{
  "valid": true
}
```

he can request persistence:

```http
POST /api/v1/trips/:id/itinerary
```

---

# 6. How frontend should work

Aagam can use:

```text
frontend/src/api/client.ts
```

Example:

```ts
const trips = await api.get("/trips");
```

Do not duplicate backend business rules in the frontend.

Frontend may provide friendly UX validation, but backend validation remains authoritative.

---

# 7. Before merging

Run:

```powershell
npm run build
npm test
```

for backend changes.

Frontend should run its own build/test commands.

---

# 8. If you break another person's work

Do not silently rewrite their files.

Create a branch and communicate:

```text
What changed
Why it changed
What API/contract changed
What they need to update
```

---

# 9. Integration checklist

Before final integration:

- [ ] Frontend can register/login
- [ ] Frontend can create trip
- [ ] Frontend can load saved trips
- [ ] AI can read trip
- [ ] AI can submit draft
- [ ] Backend validates draft
- [ ] AI can repair failed draft
- [ ] Backend persists valid itinerary
- [ ] Frontend can display itinerary
- [ ] Frontend can edit activity
- [ ] Backend revalidates edited activity
- [ ] Map receives coordinates/routes
- [ ] Mock mode works
- [ ] No secrets are in Git

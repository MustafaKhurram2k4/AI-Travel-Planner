# AI Travel Planner & Itinerary Maker — Team Complete Repository

> **Major Project-I | Team-ready development package**
>
> This repository is deliberately organized so each teammate can work independently
> without breaking the others' work.

## Team ownership

| Member | Primary ownership |
|---|---|
| **Mustafa Khurram** | Backend architecture, database, REST APIs, external API integration, validation engine, service layer |
| **Arav Gupta** | AI/ML itinerary generation, prompt/schema design, AI orchestration, MCP/tool integration |
| **Aagam Jain** | Frontend React application, responsive UI/UX, itinerary presentation, map presentation |

The project synopsis assigns these responsibilities explicitly. Everyone still participates in
integration, testing, documentation, presentation and deployment.

---

# 1. What this repository gives the team

### Mustafa's implementation
The `backend/` folder contains a runnable TypeScript/Node.js backend with:

- Express REST API
- Prisma database layer
- SQLite development mode
- PostgreSQL-ready schema
- JWT authentication
- Trip CRUD
- Trip preferences
- Itinerary persistence
- Places service abstraction
- Routes service abstraction
- Mock services for offline demonstrations
- Optional Google Places/Routes integration boundary
- Deterministic itinerary validation engine
- Budget validation
- Schedule overlap validation
- Opening-hours validation
- Travel-time validation
- Duplicate-place detection
- Geographic-efficiency warning
- API security middleware
- Swagger/OpenAPI documentation
- Automated validation tests
- AI integration endpoints

### Team integration contracts
The `contracts/` folder documents exactly how:

- Frontend calls backend
- AI/MCP calls backend
- Backend returns itinerary JSON
- Validation results are represented

### Frontend starter
The `frontend/` folder is intentionally a lightweight integration starter.
Aagam can replace/expand it with the team's final React + TypeScript + Tailwind UI.

### AI starter
The `ai/` folder contains the integration boundary Arav can use.
It intentionally does NOT pretend that Arav's final AI/MCP implementation is complete.

---

# 2. Run Mustafa's backend

Requirements:

- Node.js 20+ recommended
- npm

From `backend/`:

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

Open:

- API: http://localhost:4000
- Swagger: http://localhost:4000/docs
- Health: http://localhost:4000/health

Demo account:

```text
Email: demo@travelplanner.local
Password: Demo@12345
```

The backend starts in mock mode, so Google API credentials are NOT required for the initial demonstration.

---

# 3. Repository map

```text
AI-Travel-Planner-Team-Complete/
│
├── backend/                 ← MUSTAFA
│   ├── src/
│   ├── prisma/
│   ├── tests/
│   └── README.md
│
├── frontend/                ← AAGAM
│   ├── src/
│   └── README.md
│
├── ai/                      ← ARAV
│   ├── README.md
│   └── contracts/
│
├── contracts/               ← TEAM AGREEMENTS
│
├── docs/
│   ├── TEAM-HANDBOOK.md
│   ├── API-FLOW.md
│   ├── GIT-WORKFLOW.md
│   └── ARCHITECTURE.md
│
└── README.md
```

---

# 4. The most important architectural rule

The system is a hybrid AI + deterministic software architecture.

```text
User
 ↓
React Frontend
 ↓
Backend REST API
 ├──────────────→ Database
 ├──────────────→ External service wrappers
 ├──────────────→ Deterministic validation
 └──────────────→ AI integration boundary
                         ↓
                    Arav's AI/MCP
                         ↓
                    Tool results
                         ↓
                   Candidate itinerary
                         ↓
              Backend validation engine
                         ↓
                PASS / REPAIR / REJECT
```

### Golden rule

> **AI proposes. Backend validates. Database persists. Frontend presents.**

Do not put authoritative budget arithmetic, ownership checks, schedule validation,
or security decisions inside the LLM.

---

# 5. Development order

## Phase 1 — Mustafa
Finish and stabilize:

- database
- REST API
- authentication
- mock services
- validation engine
- tests
- Swagger

## Phase 2 — Aagam
Build:

- landing page
- navigation/auth UI
- trip creation form
- saved trips dashboard
- trip detail workspace
- day tabs
- activity cards
- refinement panel
- map component

## Phase 3 — Arav
Build:

- structured LLM itinerary generation
- prompt design
- JSON schema
- AI orchestration
- tool calling
- MCP where appropriate
- targeted repair

## Phase 4 — Integration
Connect:

```text
Aagam frontend
      ↓
Mustafa backend
      ↓
Arav AI
      ↓
Mustafa validation
      ↓
Database
      ↓
Frontend
```

## Phase 5 — Testing/demo
Test:

- invalid dates
- overlapping activities
- closed attractions
- insufficient travel time
- budget overflow
- duplicate places
- malformed AI output
- missing API credentials
- empty search results
- service timeout
- partial itinerary regeneration

---

# 6. Do not build initially

Do NOT spend the main project timeline on:

- real payment processing
- actual booking execution
- multi-agent architecture
- real-time collaboration
- native mobile apps
- OpenTable/Resy reservation execution

The project scope explicitly treats booking/payment as out of core MVP scope.

---

# 7. GitHub rule

Do not work directly on `main`.

Recommended:

```text
main
 ├── feature/mustafa-backend
 ├── feature/aagam-frontend
 └── feature/arav-ai
```

Merge only after the feature runs and the owner has tested it.

Recommended commit style:

```text
feat(backend): add trip persistence
feat(validation): add budget constraint
feat(places): add mock places provider
feat(frontend): add trip creation form
feat(ai): add structured itinerary schema
test(validation): add overlap test
docs(api): document planning contract
```

---

# 8. Definition of "done"

A feature is not done merely because code exists.

It should have:

- working implementation
- validation/error handling
- test where practical
- README/API documentation if externally consumed
- no secrets committed
- clear commit
- integration contract if another teammate consumes it

---

# 9. Final demonstration

The ideal final demo is:

```text
1. User creates a trip
2. Backend validates input
3. AI generates candidate itinerary
4. AI/tool layer obtains grounded place data
5. Backend validates the itinerary
6. Backend detects a deliberate conflict
7. AI repairs the affected part
8. Backend validates again
9. Valid itinerary is saved
10. Frontend renders itinerary + synchronized map
11. User edits an activity
12. Backend revalidates
```

This demonstrates the project's central technical idea instead of presenting it as a generic chatbot.

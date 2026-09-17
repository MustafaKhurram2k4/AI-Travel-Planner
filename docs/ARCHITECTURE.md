# Architecture

## Component architecture

```text
User Browser
    │
    ▼
Responsive React Frontend
    │
    ▼
REST Backend API
    │
    ├── Auth / User Service
    ├── Trip Service
    ├── Itinerary Service
    ├── Places Service
    ├── Routes Service
    ├── Planning Integration
    └── Deterministic Validation Engine
              │
              ├── Schedule
              ├── Opening Hours
              ├── Travel Feasibility
              ├── Budget
              ├── Duplicate Detection
              └── Geographic Efficiency
    │
    ├───────────────┐
    ▼               ▼
Database        External Providers
                ├── Google Places
                ├── Google Routes
                └── Optional Weather
```

## AI architecture

```text
Structured user request
        ↓
Backend normalization
        ↓
AI orchestration
        ↓
Tool/MCP calls
        ↓
Grounded data
        ↓
Candidate itinerary JSON
        ↓
Deterministic validation
        │
        ├── PASS → persist/render
        │
        └── FAIL → targeted repair
                         ↓
                     revalidate
```

## Ownership boundary

```text
MUSTAFA
Database + REST + external wrappers + validation
                    │
                    │ JSON contracts
                    ▼
ARAV
AI + prompts + orchestration + MCP
                    │
                    │ JSON itinerary
                    ▼
MUSTAFA
Validation + persistence
                    │
                    ▼
AAGAM
Presentation + editing + map UI
```

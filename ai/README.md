# Arav's AI/MCP Workspace

This directory is the handoff boundary for the AI/ML portion.

## Arav owns

- LLM provider integration
- prompts
- itinerary generation
- structured output
- tool selection
- MCP implementation
- repair/regeneration strategy

## Backend contract

The AI should ultimately call:

```text
GET /api/v1/trips/:id
POST /api/v1/places/search
POST /api/v1/routes/directions
POST /api/v1/planning/:tripId/validate-draft
POST /api/v1/trips/:id/itinerary
```

The exact route list is in `contracts/API-CONTRACT.md`.

## Recommended AI flow

```text
Trip requirements
 ↓
AI interprets qualitative preferences
 ↓
Tool calls
 ↓
Grounded place/route information
 ↓
Structured itinerary JSON
 ↓
Backend validation
 ↓
If invalid:
    targeted repair
    ↓
    backend validation again
 ↓
If valid:
    persistence
```

## Do not

- directly access Prisma
- expose API keys to the frontend
- perform authoritative budget arithmetic in the prompt
- treat model output as automatically valid
- make booking/payment execution part of the MVP

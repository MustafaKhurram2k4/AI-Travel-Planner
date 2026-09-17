# Mustafa's Backend

This is the primary backend contribution.

## Stack

- TypeScript
- Node.js
- Express
- Prisma
- SQLite for immediate local development
- PostgreSQL-ready schema
- Zod
- JWT
- Swagger
- Vitest

## Start

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

## URLs

- `http://localhost:4000/health`
- `http://localhost:4000/docs`

## Why SQLite first?

The project needs a deterministic, easy-to-run development mode.
SQLite removes database installation friction. The Prisma schema is kept relational
and can be moved to PostgreSQL for deployment.

## Provider strategy

`USE_MOCK_SERVICES=true` means:

```text
Application → internal service → mock provider
```

Later:

```text
Application → internal service → Google provider
```

The rest of the backend should not care which provider is active.

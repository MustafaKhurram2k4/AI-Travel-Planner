# Git / GitHub Workflow

## Initial setup

```powershell
git clone <TEAM_REPOSITORY_URL>
cd AI-Travel-Planner
git checkout -b feature/mustafa-backend
```

## Mustafa

```powershell
git add backend docs contracts
git commit -m "feat(backend): implement backend foundation"
git push -u origin feature/mustafa-backend
```

## Arav

```powershell
git checkout -b feature/arav-ai
```

## Aagam

```powershell
git checkout -b feature/aagam-frontend
```

## Pull request rule

PR description should include:

```text
What changed:
Why:
Files:
API/contract changes:
How tested:
Known limitations:
```

## Never commit

```text
.env
API keys
JWT production secrets
database production credentials
personal access tokens
```

## Good commit examples

```text
feat(database): add itinerary relations
feat(validation): detect schedule overlaps
feat(routes): add route provider abstraction
feat(ai): add itinerary draft adapter
feat(frontend): add saved trips dashboard
fix(validation): handle overnight activities
test(api): cover trip ownership
docs(api): document itinerary contract
```

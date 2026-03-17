# 🔄 CI/CD Pipeline Proposal

## Branch Model

```
main ──── production (auto-deploy to Vercel)
  │
  ├── develop ──── staging (preview deployments)
  │     │
  │     ├── feature/uiconfig-backend
  │     ├── feature/artist-crud
  │     └── fix/track-reorder-bug
  │
  └── hotfix/critical-fix ──── direct to main
```

### Branch Rules

| Branch      | Protection                    | Merge Method        |
| ----------- | ----------------------------- | ------------------- |
| `main`      | Require 1 approval + green CI | Squash merge        |
| `develop`   | Require green CI              | Merge commit        |
| `feature/*` | None                          | PR → develop        |
| `hotfix/*`  | Require 1 approval            | PR → main + develop |

---

## GitHub Actions Pipeline

```yaml
# .github/workflows/ci.yml
name: CI Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm run lint

  test:
    needs: lint
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npm test

  security:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm audit --audit-level=high

  e2e:
    needs: test
    if: github.event_name == 'push' && github.ref == 'refs/heads/develop'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: '18' }
      - run: npm ci
      - run: npx playwright install --with-deps
      - run: npm run test:e2e
```

---

## Pre-commit Hooks

Using `husky` + `lint-staged`:

```json
// package.json additions
{
  "lint-staged": {
    "*.js": ["eslint --fix", "prettier --write"]
  }
}
```

```bash
npx husky init
echo "npx lint-staged" > .husky/pre-commit
```

---

## Deploy Pipeline

```
PR opened → CI runs (lint, test, security)
            → Vercel preview deployment
            → Link posted on PR

PR merged to develop → CI runs
                      → Deploy to staging

PR merged to main → CI runs
                   → Deploy to production (auto via Vercel)
```

---

## Quality Gates

| Gate          | Tool       | When                    |
| ------------- | ---------- | ----------------------- |
| Lint          | ESLint     | Pre-commit + CI         |
| Format        | Prettier   | Pre-commit              |
| Unit tests    | Jest       | CI (all PRs)            |
| Security      | npm audit  | CI (all PRs)            |
| Vulnerability | Dependabot | Weekly scan             |
| E2E smoke     | Playwright | CI (develop only)       |
| Code review   | GitHub PR  | All PRs to main/develop |

---

## Suggested Tooling

| Category | Tool                   | Purpose                |
| -------- | ---------------------- | ---------------------- |
| Lint     | ESLint (flat config)   | Code quality           |
| Format   | Prettier               | Code formatting        |
| Test     | Jest                   | Unit/integration tests |
| E2E      | Playwright             | Browser smoke tests    |
| CI       | GitHub Actions         | Pipeline automation    |
| Deploy   | Vercel                 | Serverless hosting     |
| Security | Dependabot + npm audit | Vulnerability scanning |
| Hooks    | Husky + lint-staged    | Pre-commit checks      |

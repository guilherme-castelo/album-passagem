# 📋 Product & Technical Backlog

## Priority Legend
- 🔴 **P0** — Critical / Must have
- 🟠 **P1** — High / Should have
- 🟡 **P2** — Medium / Nice to have
- 🟢 **P3** — Low / Future

---

## Backlog (30 Tickets)

### 🔴 P0 — Foundation (Sprint 1-2)

| # | Title | Type | Sprint | Est. | Acceptance Criteria |
|---|-------|------|--------|------|-----------|
| 1 | Remove MVP references from docs | docs | S1 | 4h | No "Passagem", "Bruno", or "Belas Artes" in docs/seeds |
| 2 | Generalize seeds and migration script | backend | S1 | 4h | `migrate_data.js` accepts CLI args `--albumTitle` `--artistName` |
| 3 | Delete legacy `backend/services/trackService.js` | backend | S1 | 1h | File deleted, no broken imports |
| 4 | Setup ESLint + Prettier | infra | S1 | 8h | `npm run lint` works, pre-commit hook active |
| 5 | Create GitHub Actions CI | infra | S1 | 8h | CI runs lint+test on every PR |
| 6 | Add `uiConfig` to album `ALLOWED_FIELDS` | backend | S2 | 4h | `PUT /api/album/:id` accepts uiConfig |
| 7 | uiConfig validation/sanitization | backend | S2 | 12h | Invalid configs rejected, XSS prevented |
| 8 | uiConfig defaults merging | backend | S2 | 8h | Missing fields filled with defaults |
| 9 | uiConfig unit tests | backend | S2 | 8h | 90%+ coverage on uiConfig logic |

### 🟠 P1 — Template System (Sprint 3-4)

| # | Title | Type | Sprint | Est. | Acceptance Criteria |
|---|-------|------|--------|------|-----------|
| 10 | Theme Editor component | frontend | S3 | 16h | Color pickers, font selectors, section toggles |
| 11 | Theme Editor in Album Hub | frontend | S3 | 8h | Accessible via tab in album detail |
| 12 | Live preview panel | frontend | S3 | 12h | Preview updates in real-time as config changes |
| 13 | Import/Export uiConfig JSON | frontend | S3 | 4h | Download/upload uiConfig JSON |
| 14 | CSS variable injection from uiConfig | frontend | S4 | 8h | Public site colors change per album |
| 15 | Dynamic Google Fonts loading | frontend | S4 | 8h | Fonts load based on typography config |
| 16 | Section visibility toggles | frontend | S4 | 8h | Sections hide/show based on layout.sections |
| 17 | Configurable labels | frontend | S4 | 8h | trackCode, statuses display custom labels |
| 18 | 3 built-in theme presets | frontend | S4 | 8h | "Dark", "Light", "Classic" selectable in admin |

### 🟠 P1 — Multi-Artist (Sprint 5)

| # | Title | Type | Sprint | Est. | Acceptance Criteria |
|---|-------|------|--------|------|-----------|
| 19 | Artists backend module | backend | S5 | 16h | CRUD for artists collection |
| 20 | Artists API handler | backend | S5 | 4h | `GET/POST/PUT/DELETE /api/artists` |
| 21 | Link albums to artists | backend | S5 | 4h | `albumId` → `artistId` reference |
| 22 | Artists admin view | frontend | S5 | 16h | CRUD UI with table + form |

### 🟡 P2 — Testing & Quality (Sprint 6)

| # | Title | Type | Sprint | Est. | Acceptance Criteria |
|---|-------|------|--------|------|-----------|
| 23 | Jest setup + unit tests | backend | S6 | 8h | `npm test` runs all backend tests |
| 24 | Service layer tests (album, track, user) | backend | S6 | 16h | Core CRUD paths covered |
| 25 | Playwright E2E setup | infra | S6 | 8h | Browser tests run in CI |
| 26 | 5 smoke tests (login, album CRUD, track CRUD) | infra | S6 | 8h | Core admin flows covered |

### 🟡 P2 — Integrations (Sprint 7)

| # | Title | Type | Sprint | Est. | Acceptance Criteria |
|---|-------|------|--------|------|-----------|
| 27 | Integration Port + Registry | backend | S7 | 8h | Abstract class + factory pattern |
| 28 | Spotify Adapter (search + embed) | backend | S7 | 16h | Search returns results, embed URL generates |
| 29 | Webhook handler skeleton | backend | S7 | 8h | Endpoint responds, signature verified |
| 30 | Integration management admin UI | frontend | S7 | 8h | Connect/disconnect integrations |

### 🟢 P3 — Future (Sprint 8-10)

| # | Title | Type | Sprint | Est. | Acceptance Criteria |
|---|-------|------|--------|------|-----------|
| — | Public auth (OAuth + email) | backend | S8 | — | Users register and login |
| — | Fan profiles and activity | frontend | S8 | — | Profile page with liked/rated tracks |
| — | Rate limiting | backend | S9 | — | Public endpoints rate-limited |
| — | Staging deployment | infra | S9 | — | staging.example.com live |
| — | Multi-tenant isolation | backend | S10 | — | `tenantId` on all entities |
| — | Subdomain routing | infra | S10 | — | `artist.platform.com` resolves |

---

## Sprint Mapping

```
S1  [████████] Foundation & Cleanup        (5 tickets)
S2  [████████] uiConfig Backend            (4 tickets)
S3  [████████] uiConfig Admin UI           (4 tickets)
S4  [████████] Template Rendering          (5 tickets)
S5  [████████] Multi-Artist                (4 tickets)
S6  [████████] Testing & Quality           (4 tickets)
S7  [████████] Integration Architecture    (4 tickets)
S8  [████░░░░] Public Auth                 (future)
S9  [████░░░░] Security & Staging          (future)
S10 [████░░░░] Multi-tenant                (future)
```

---

## Labels

| Label | Color | Scope |
|-------|-------|-------|
| `backend` | Blue | Server-side code |
| `frontend` | Green | Client-side code |
| `docs` | Gray | Documentation only |
| `infra` | Purple | CI/CD, tooling, deploy |
| `P0-critical` | Red | Must have |
| `P1-high` | Orange | Should have |
| `P2-medium` | Yellow | Nice to have |
| `P3-low` | Green | Future |

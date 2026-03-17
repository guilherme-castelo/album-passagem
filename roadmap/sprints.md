# 🗓️ Sprint Plan — SaaS Evolution

## Overview
10-week plan with weekly sprints delivering functional increments.

**DoD (Definition of Done) for all sprints:**
- Code passes lint + existing tests
- PR with Conventional Commit title + description
- Documentation updated for changed features
- Reviewed by at least 1 team member

---

## Sprint 1 — Foundation & Cleanup
**Objective:** Clean up MVP references and establish development infrastructure.

| # | Task | Est. | Role |
|---|------|------|------|
| 1 | Remove MVP references from all docs | 0.5d | Full-stack |
| 2 | Generalize seeds and migration scripts | 0.5d | Backend |
| 3 | Delete legacy `backend/services/trackService.js` | 0.5d | Backend |
| 4 | Set up ESLint + Prettier + pre-commit hooks | 1d | Infra |
| 5 | Create initial GitHub Actions CI pipeline | 1d | Infra |

**Acceptance:** No Passagem/Bruno references in docs. CI runs on PR.

---

## Sprint 2 — uiConfig Backend
**Objective:** Implement uiConfig storage and API support.

| # | Task | Est. | Role |
|---|------|------|------|
| 6 | Add `uiConfig` to `ALLOWED_FIELDS` in albumService | 0.5d | Backend |
| 7 | Create uiConfig validation/sanitization middleware | 1.5d | Backend |
| 8 | Add uiConfig defaults merging logic | 1d | Backend |
| 9 | Update `/api/album` endpoints to accept/return uiConfig | 0.5d | Backend |
| 10 | Unit tests for uiConfig validation | 1d | Backend |

**Acceptance:** Albums can store and return uiConfig via API. Validation rejects malformed configs.

---

## Sprint 3 — uiConfig Admin UI
**Objective:** Admin panel UI for editing album themes.

| # | Task | Est. | Role |
|---|------|------|------|
| 11 | Create Theme Editor component (color pickers, font selectors) | 2d | Frontend |
| 12 | Add Theme Editor tab to Album Hub | 1d | Frontend |
| 13 | Implement live preview panel | 1.5d | Frontend |
| 14 | Import/Export uiConfig as JSON | 0.5d | Frontend |

**Acceptance:** Admin can visually edit uiConfig per album with live preview.

---

## Sprint 4 — Public Site Template Rendering
**Objective:** Public site renders dynamically based on album's uiConfig.

| # | Task | Est. | Role |
|---|------|------|------|
| 15 | Create CSS variable injection from uiConfig colors | 1d | Frontend |
| 16 | Dynamic Google Fonts loading based on typography config | 1d | Frontend |
| 17 | Section visibility toggles (layout.sections) | 1d | Frontend |
| 18 | Configurable labels (trackCode, trackTag, statuses) | 1d | Frontend |
| 19 | Theme presets (3 built-in themes) | 1d | Frontend |

**Acceptance:** Public site responds to uiConfig. Different albums render differently.

---

## Sprint 5 — Multi-Artist Entity
**Objective:** Add artist management to the platform.

| # | Task | Est. | Role |
|---|------|------|------|
| 20 | Create `artists` module (Repository, Service, Controller) | 2d | Backend |
| 21 | Create `api/artists/index.js` handler | 0.5d | Backend |
| 22 | Add `artistId` field to album schema | 0.5d | Backend |
| 23 | Create Artists management view in admin | 2d | Frontend |

**Acceptance:** Artists CRUD works. Albums can be linked to artists.

---

## Sprint 6 — Testing & Quality
**Objective:** Establish automated testing baseline.

| # | Task | Est. | Role |
|---|------|------|------|
| 24 | Set up Jest for backend unit tests | 1d | Backend |
| 25 | Write tests for album, track, user services | 2d | Backend |
| 26 | Set up Playwright for admin E2E smoke tests | 1d | QA |
| 27 | Write 5 core E2E smoke tests | 1d | QA |

**Acceptance:** `npm test` runs unit tests. CI includes E2E smoke.

---

## Sprint 7 — Integration Architecture
**Objective:** Implement integration extension points.

| # | Task | Est. | Role |
|---|------|------|------|
| 28 | Create IntegrationPort abstract class | 0.5d | Backend |
| 29 | Create IntegrationRegistry factory | 0.5d | Backend |
| 30 | Implement SpotifyAdapter (search + embed only) | 2d | Backend |
| 31 | Create webhook handler skeleton | 1d | Backend |
| 32 | Admin UI for connecting integrations | 1d | Frontend |

**Acceptance:** Spotify search works with test credentials. Webhook endpoint responds 200.

---

## Sprint 8 — Public Auth & Fan Profiles
**Objective:** Allow public users to create accounts.

| # | Task | Est. | Role |
|---|------|------|------|
| 33 | Create `fans` module (register, login, profile) | 2d | Backend |
| 34 | Implement OAuth (Google) | 1.5d | Backend |
| 35 | Migrate likes/ratings from anonymous to authenticated | 1d | Backend |
| 36 | Public profile page with activity feed | 1d | Frontend |

**Acceptance:** Users can register, login, and see their liked/rated tracks.

---

## Sprint 9 — Staging Pipeline & Security
**Objective:** Production-ready deployment pipeline.

| # | Task | Est. | Role |
|---|------|------|------|
| 37 | Configure Vercel preview deployments for PRs | 0.5d | Infra |
| 38 | Add Dependabot for vulnerability scanning | 0.5d | Infra |
| 39 | Implement rate limiting on public endpoints | 1d | Backend |
| 40 | Add CORS tightening for production | 0.5d | Backend |
| 41 | Security audit: sanitize all user inputs | 1.5d | Backend |
| 42 | Deploy staging environment | 1d | Infra |

**Acceptance:** PRs get preview URLs. Dependabot active. Staging live.

---

## Sprint 10 — Multi-tenant Basics & Launch Prep
**Objective:** Prepare for multi-tenant SaaS.

| # | Task | Est. | Role |
|---|------|------|------|
| 43 | Design `tenantId` schema across all entities | 1d | Backend |
| 44 | Implement tenant isolation in queries | 2d | Backend |
| 45 | Subdomain routing (`artist.platform.com`) | 1d | Infra |
| 46 | Landing page for platform marketing | 1d | Frontend |
| 47 | Documentation review and finalization | 1d | All |

**Acceptance:** Multi-tenant isolation works. Platform ready for beta testers.

# 🔍 Discovery Report — SaaS Transformation

**Date:** 2026-03-16  
**Scope:** Full codebase analysis before SaaS generalization

---

## 1. MVP References — "Passagem" (Album Name)

| File | Line(s) | Reference | Type |
|------|---------|-----------|------|
| `README.md` | 1, 5, 11, 17, 54, 147 | Title, deploy URL, descriptions, folder name | Doc |
| `package.json` | 2, 11 | `"name": "album-passagem"`, description | Config |
| `server.js` | 60 | `"✈️ Aeroporto ativo no portão..."` | Log |
| `seed-admin.js` | 26 | `client.db('album-passagem')` | Script |
| `backend/lib/db.js` | 22 | `cachedDb = client.db("album-passagem")` | Backend |
| `backend/modules/album/albumService.js` | 4-8 | `DEFAULT_ALBUM` with "Passagem" title | Backend |
| `backend/services/trackService.js` | 3-8 | Legacy `getAlbumInfo()` returns "Passagem" | Legacy |
| `scripts/migrate_data.js` | 16 | Hardcoded album title "Passagem" | Script |
| `public/index.html` | 9, 57, 103, 190, 473, 494, 500 | Title, UI text, footer | HTML |
| `public/css/style.css` | 2 | CSS comment "Passagem" | CSS |
| `public/admin/login.html` | 6, 37, 90 | Title, branding text | HTML |
| `public/admin/index.html` | 7, 45 | Title and sidebar branding | HTML |
| `public/admin/css/admin.css` | 2 | CSS comment | CSS |
| `public/js/components/MediaRenderer.js` | 14 | YouTube embed param `passagem_player` | JS |
| `docs/architecture.md` | 5 | "O Álbum Passagem segue..." | Doc |
| `docs/api.md` | 41 | Example response `"title": "Passagem"` | Doc |
| `docs/data-model.md` | 6, 21, 135 | Database name, example data | Doc |
| `docs/saas-roadmap.md` | 5, 84 | SaaS narrative, subdomain example | Doc |
| `docs/patterns.md` | 195 | Code example `db("album-passagem")` | Doc |
| `docs/skills.md` | 199 | Subdomain example | Doc |

---

## 2. MVP References — "Bruno" / "Bruno Bratilieri" (Artist Name)

| File | Line(s) | Reference | Type |
|------|---------|-----------|------|
| `package.json` | 11, 12 | Description, author field | Config |
| `README.md` | 17 | Origin story mentions "Bruno" | Doc |
| `backend/modules/album/albumService.js` | 6 | `DEFAULT_ALBUM.artist = 'Bruno'` | Backend |
| `backend/services/trackService.js` | 5 | Legacy `artist: "Bruno"` | Legacy |
| `scripts/migrate_data.js` | 17 | `artist: 'Bruno'` | Script |
| `public/index.html` | 494 | `"ÁLBUM PASSAGEM - BRUNO BRATILIERI"` | HTML |
| `docs/api.md` | 41 | Example `"artist": "Bruno"` | Doc |
| `docs/data-model.md` | 22, 136 | Example data | Doc |
| `docs/saas-roadmap.md` | 39-40 | Artist entity example | Doc |

---

## 3. Flight/Airport Theme References

### Hard-coded flight metaphors in backend:
| File | Line(s) | Reference |
|------|---------|-----------|
| `backend/modules/tracks/trackService.js` | 3 | `REQUIRED_FIELDS = ['title', 'gate', 'flightCode']` |
| `backend/modules/tracks/trackService.js` | 43 | `flightCode = PSG${order}` |
| `backend/modules/tracks/trackService.js` | 91 | `_buildTrackDoc` includes `gate`, `flightCode` |
| `backend/modules/tracks/trackService.js` | 4 | `ALLOWED_STATUSES = ['ON TIME', 'DELAYED', 'FINAL CALL', 'BOARDING']` |

### Frontend UI (flight-themed):
| File | Reference |
|------|-----------|
| `public/index.html` | Title "Boarding Pass", check-in flow, "Painel de embarque", "Trocar de Voo", "Emitir Passagem", barcode, PSG-26 |
| `public/js/controllers/AppController.js` | `"buscando voos"`, `"Voo Cancelado"` |
| `public/js/components/TrackList.js` | `"CONEXÃO / VOO"` label |
| `public/js/components/LyricsView.js` | `track.flightCode` display |
| `public/css/style.css` | "Animação do Ícone de Voo" |
| `public/admin/js/views/TracksView.js` | "Código do Voo" label, BOARDING status badge |
| `public/admin/js/views/AlbumDetailView.js` | "Voo" column label, PSG flightCode |

### Docs:
| File | Reference |
|------|-----------|
| `README.md` | "Painel de Voos", "Códigos de Voo Automáticos", "cartão de embarque", etc. |
| `docs/data-model.md` | `gate`, `flightCode`, "Portão de embarque", "Código do voo" |
| `docs/api.md` | `gate`, `flightCode` in examples |
| `docs/admin-flow.md` | "Drag Handle, Voo, Título" columns |
| `docs/architecture.md` | "flightCode automático" |
| `docs/patterns.md` | "flightCodes" in drag-and-drop pattern |

---

## 4. Seeds & Fixtures

| File | Data | Used For |
|------|------|----------|
| `seed-admin.js` | Creates `admin/admin` user | First admin bootstrap |
| `scripts/migrate_data.js` | Creates "Passagem" album, links orphan tracks | Data migration |
| `backend/modules/album/albumService.js` | `DEFAULT_ALBUM` fallback | Public API when no album exists |
| `backend/services/trackService.js` | `getAlbumInfo()` returns "Passagem" | **Legacy file** (potentially dead code) |

---

## 5. Legacy/Dead Code

| File | Issue |
|------|-------|
| `backend/services/trackService.js` | **Legacy singleton** — duplicated logic from `backend/modules/tracks/trackService.js`. `getAlbumInfo()` returns hard-coded MVP data. Used nowhere in modular architecture. |
| `api/musicas/index.js` | Legacy endpoint for public site. Uses first album as "default". Still necessary for backward compatibility but should be documented as deprecated. |

---

## 6. Hard-coded UI Templates

The public site (`public/index.html`) is a **monolithic HTML file** with a fixed boarding-pass design:
- Check-in screen (name input → boarding pass)
- Loading screen ("Procurando Voos")
- Tracklist ("Painel de Embarque")
- Lyrics view (with flight-themed navigation)
- Barcode scanner decorative element

**There is no template/theme system.** The UI is entirely hard-coded with the flight metaphor embedded in HTML structure, CSS classes, and JS component logic.

---

## 7. Summary of Changes Required

### Immediate (Documentation & Seeds)
- [ ] Replace all "Passagem" references in docs with generic SaaS language
- [ ] Replace all "Bruno" references with "Artist Example"
- [ ] Update `DEFAULT_ALBUM` in `albumService.js` to generic example
- [ ] Update `migrate_data.js` to accept configurable album name
- [ ] Delete legacy `backend/services/trackService.js`
- [ ] Update `package.json` name and description

### Short-term (Architecture)
- [ ] Define `albums.uiConfig` schema for per-album template configuration
- [ ] Rename `flightCode` → `trackCode` and `gate` → `trackTag` (or make configurable per template)
- [ ] Abstract `ALLOWED_STATUSES` to be configurable per album template
- [ ] Create template system allowing different public page layouts

### Medium-term (SaaS Features)
- [ ] Multi-artist entity
- [ ] Integration adapters (Spotify, YouTube) — architecture only
- [ ] Admin UI for editing uiConfig per album
- [ ] CI/CD pipeline

---

*This report was generated by full codebase analysis. No files were modified.*

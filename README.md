# ✨ Album Platform — SaaS Musical & Admin Panel

Plataforma SaaS fullstack para gestão e apresentação de álbuns musicais. Combina um **site público interativo** personalizável por álbum e um **painel administrativo** moderno para gestão completa de conteúdo, artistas e integrações.

---

## 🌍 Visão Geral

O **Album Platform** é uma plataforma SaaS onde artistas independentes podem criar, gerenciar e publicar álbuns musicais com páginas interativas personalizáveis. O sistema suporta múltiplos álbuns, artistas e, futuramente, multi-tenant com portfólios individuais.

### Objetivo
Oferecer uma plataforma onde artistas possam apresentar seus álbuns com interatividade (likes, ratings, letras, mídia) e gerenciar todo o conteúdo via um painel administrativo intuitivo — com layouts e temas configuráveis por álbum.

---

## ✨ Funcionalidades

### 🌐 Site Público
- **Tracklist Interativa:** Lista de faixas com status customizáveis.
- **Player & Letras:** Visualização detalhada de cada faixa com players incorporados (YouTube/Spotify).
- **Interações (Likes & Ratings):** Curtir faixas e dar notas de 1 a 5 estrelas.
- **Layout Configurável:** Cada álbum pode ter seu próprio template, cores e tipografia via `uiConfig`.
- **Armazenamento Local:** Interações são salvas no localStorage.

### 🔐 Painel Administrativo
Interface protegida com design **Glassmorphism** em tema escuro.
- **Dashboard Analítico:** Total de faixas, likes, média de avaliações.
- **Gestão de Álbuns (Multi-Album):** CRUD completo com Hub centralizado.
- **Gestão de Faixas:** CRUD via modal com Rich Text editor, drag-and-drop e códigos automáticos.
- **Configuração de Template (`uiConfig`):** Cores, tipografia, layout e labels por álbum.
- **Controle de Acesso:** JWT + bcrypt, gestão de admins.
- **Componentização Avançada:** DataTable, Modal, Toast, ConfirmDialog reutilizáveis.

> 📄 Detalhes do fluxo admin: [`docs/admin-flow.md`](docs/admin-flow.md)

---

## 🗂️ Arquitetura

O projeto segue **Clean Architecture** no backend e **ES6 Modules (Vanilla JS)** no frontend.

> 📄 Detalhes completos: [`docs/architecture.md`](docs/architecture.md)

```
album-platform/
├── api/                         ← Handlers Serverless (Vercel Functions)
│   ├── album/                   ← Album CRUD + Tracks hierárquicos + Reorder
│   ├── auth/                    ← Login e JWT
│   ├── musicas/                 ← Endpoint legado (retrocompatibilidade)
│   ├── tracks/                  ← Tracks CRUD + Like/Rate
│   └── users/                   ← Gestão de admins
│
├── backend/                     ← Lógica de Negócio (Clean Architecture)
│   ├── lib/                     ← DB, CORS, Auth, Response helpers
│   └── modules/                 ← Controller → Service → Repository
│       ├── album/               ├── auth/
│       ├── tracks/              └── users/
│
├── public/                      ← Frontend Estático
│   ├── admin/                   ← Painel Administrativo
│   ├── js/                      ← Site Público (ES6 Modules)
│   └── index.html
│
├── docs/                        ← Documentação interna
├── roadmap/                     ← Sprint plan
├── backlog/                     ← Task backlog
├── reports/                     ← Discovery & analysis reports
└── ci/                          ← CI/CD proposals
```

---

## 📊 Estrutura de Dados

> 📄 Schema completo: [`docs/data-model.md`](docs/data-model.md)

### `albums`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `_id` | ObjectId | ID nativo MongoDB |
| `title` | String | Título do álbum |
| `artist` | String | Nome do artista |
| `event` | String | Evento associado |
| `date` | String | Data de lançamento |
| `uiConfig` | Object | Configuração de template/layout |

### `tracks`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `_id` | ObjectId | ID nativo MongoDB |
| `albumId` | String | Referência ao álbum |
| `title` | String | Título da faixa |
| `order` | Number | Posição no álbum |
| `trackCode` | String | Código identificador |
| `trackTag` | String | Tag/categorização |
| `status` | String | Status configurável |
| `lyrics` | String | Letra da música |
| `media` | Array | Widgets de mídia |
| `interactions` | Object | `{ likes, ratings }` |

---

## 🔧 Tecnologias

- **Backend:** Node.js, Express (Dev), Vercel Serverless Functions (Prod)
- **Banco de Dados:** MongoDB Atlas (Native Driver)
- **Segurança:** JWT, Bcrypt
- **Frontend CSS:** Tailwind CSS + Glassmorphism custom
- **Frontend JS:** Vanilla JavaScript (ES6 Modules)
- **Libs:** Quill.js (Rich Text Editor)

---

## 🚀 Setup Local

```bash
git clone <repo-url> && cd album-platform
npm install
```

**`.env`:**
```env
DB_USER=your_user
DB_PASS=your_password
PORT=3001
JWT_SECRET=your_secret_key
```

```bash
node seed-admin.js   # Create admin user (admin/admin)
npm run dev          # Start dev server
```

- **Public Site:** `http://localhost:3001`
- **Admin Panel:** `http://localhost:3001/admin/login.html`

---

## 📡 API

> 📄 Documentação completa: [`docs/api.md`](docs/api.md)

Admin routes require `Authorization: Bearer <token>`

| Método | Endpoint | Auth | Descrição |
|--------|----------|:----:|-----------|
| `POST` | `/api/auth/login` | ✗ | JWT Token |
| `GET` | `/api/musicas` | ✗ | Default album + tracks (legacy) |
| `POST` | `/api/musicas/:id/like` | ✗ | Toggle like |
| `POST` | `/api/musicas/:id/rate` | ✗ | Rate 1-5 |
| `GET/POST` | `/api/album` | ✓ | List / Create albums |
| `GET/PUT/DELETE` | `/api/album/:id` | ✓ | Album CRUD |
| `GET/POST` | `/api/album/:id/tracks` | ✓ | Album tracks |
| `POST` | `/api/album/:id/reorder` | ✓ | Reorder tracks |
| `GET/PUT/DELETE` | `/api/tracks/:id` | ✓ | Track CRUD |
| CRUD | `/api/users` | ✓ | Admin management |

---

## 🗺️ Roadmap

| Fase | Objetivo | Status |
|------|----------|--------|
| ✅ v1.0 | Core platform with album management | Done |
| ✅ v1.1 | Multi-album, Album Hub, Drag-and-Drop | Done |
| 🔜 v1.2 | Configurable templates (`uiConfig`) | Planned |
| 🔜 v1.3 | Multi-artist support | Planned |
| 🔜 v2.0 | SaaS: multi-tenant, auth, integrations | Planned |

> 📄 Sprint plan: [`roadmap/sprints.md`](roadmap/sprints.md) · Backlog: [`backlog/backlog.md`](backlog/backlog.md)

---

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [`docs/architecture.md`](docs/architecture.md) | System architecture |
| [`docs/api.md`](docs/api.md) | Full API reference |
| [`docs/data-model.md`](docs/data-model.md) | MongoDB schema |
| [`docs/ui-config.md`](docs/ui-config.md) | Template & uiConfig system |
| [`docs/admin-flow.md`](docs/admin-flow.md) | Admin panel flow |
| [`docs/integrations.md`](docs/integrations.md) | Integration architecture |
| [`docs/development-rules.md`](docs/development-rules.md) | Coding conventions |
| [`docs/patterns.md`](docs/patterns.md) | Architectural patterns |
| [`docs/skills.md`](docs/skills.md) | Project evolution guide |
| [`docs/saas-roadmap.md`](docs/saas-roadmap.md) | SaaS roadmap |
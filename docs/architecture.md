# 🏗️ Arquitetura do Sistema

## Visão Geral

O Album Platform segue uma arquitetura em camadas com separação clara entre Backend (lógica de negócio), API (handlers serverless) e Frontend (ES6 Modules com Vanilla JS).

```
┌──────────────────────────────────────────────┐
│              Frontend (public/)              │
│  ┌────────────────┐  ┌────────────────────┐  │
│  │   Site Público  │  │  Painel Admin      │  │
│  │  (ES6 Modules)  │  │  (ES6 Modules)     │  │
│  └───────┬────────┘  └───────┬────────────┘  │
│          │ Fetch API         │ Fetch API      │
└──────────┼───────────────────┼───────────────┘
           ▼                   ▼
┌──────────────────────────────────────────────┐
│            API Layer (api/)                  │
│  Vercel Serverless Functions / Express       │
│  ┌─────────────────────────────────────────┐ │
│  │  auth │ album │ tracks │ users │ musicas│ │
│  └──────────────────┬──────────────────────┘ │
└─────────────────────┼────────────────────────┘
                      ▼
┌──────────────────────────────────────────────┐
│         Backend (backend/)                   │
│  ┌────────────┐ ┌──────────┐ ┌───────────┐  │
│  │ Controller │→│ Service  │→│ Repository│  │
│  └────────────┘ └──────────┘ └─────┬─────┘  │
│                                    ▼         │
│  ┌──────────────────────────────────────┐    │
│  │  lib/ (DB, Auth, CORS, Response)     │    │
│  └──────────────────────────────────────┘    │
└──────────────────────────────────────────────┘
                      ▼
┌──────────────────────────────────────────────┐
│            MongoDB Atlas                     │
│   Collections: album, tracks, users          │
└──────────────────────────────────────────────┘
```

---

## Backend (Clean Architecture)

Cada módulo segue o padrão **Controller → Service → Repository**:

| Camada | Responsabilidade | Exemplo |
|--------|-----------------|---------|
| **Controller** | Recebe request, extrai parâmetros, delega ao Service | `albumController.list(req, res)` |
| **Service** | Regras de negócio, validação, orquestração | `trackService.updateOrder(albumId, trackIds)` |
| **Repository** | Acesso ao MongoDB, queries e mutações | `trackRepository.findAll({ albumId })` |

### Módulos
- **album**: CRUD de álbuns. Campos permitidos via whitelist (`ALLOWED_FIELDS`).
- **tracks**: CRUD de faixas, interações (like/rate), reordenação com `trackCode` automático.
- **auth**: Login com bcrypt + geração de JWT.
- **users**: CRUD de administradores.

### Bibliotecas (`lib/`)
- `db.js`: Conexão singleton com MongoDB Atlas (connection pooling via `cachedDb`).
- `auth.js`: Middleware JWT para Express e handler para serverless.
- `cors.js`: CORS handler para funções serverless.
- `response.js`: Helpers padronizados (`sendSuccess`, `sendError`, `sendNotFound`).

---

## API Layer (Serverless)

Cada arquivo em `api/` é um **catch-all handler** que roteia internamente baseado no path e método HTTP.

### Padrão de Roteamento
```javascript
// api/album/index.js (exemplo simplificado)
const id = path[0];     // :id
const action = path[1]; // tracks | reorder

if (method === 'GET' && !id) → albumController.list
if (method === 'GET' && id && action === 'tracks') → trackController.listByAlbum
if (method === 'POST' && id && action === 'reorder') → trackController.reorder
```

### Vercel Adapter (Desenvolvimento Local)
O `server.js` emula o comportamento do Vercel localmente, convertendo rotas Express em chamadas serverless:
```javascript
app.use('/api/album', vercelCatchAll(albumHandler, '/api/album'));
```

---

## Frontend

### Site Público
Arquitetura **MVC** com ES6 Modules:
- **State** (`AppState.js`): Store reativo com Observer pattern e persistência em localStorage.
- **Controller** (`AppController.js`): Orquestra views, state, API e router.
- **Views**: Componentes puros que manipulam DOM (`TrackList`, `LyricsView`, `RatingWidget`).
- **Router** (`ViewRouter.js`): Transições animadas entre telas.

### Painel Admin
Mesma arquitetura, com componentes reutilizáveis:
- **AdminState.js**: Estado global com `subscribe()` reativo.
- **AdminController.js**: Orquestra seções (Dashboard, Albums, Users) e o Album Hub.
- **Views**: `DashboardView`, `AlbumsView`, `AlbumDetailView`, `TracksView`, `UsersView`.
- **Components**: `DataTable`, `ModalComponent`, `ToastComponent`, `ConfirmDialog`, `SidebarComponent`.

---

## Deploy

### Vercel (Produção)
- **Funções**: 5 serverless functions (uma por handler em `api/`).
- **Static**: Tudo em `public/` é servido como assets estáticos.
- **Rewrites**: Configurados em `vercel.json` para mapear paths às funções.

### Local (Desenvolvimento)
- Express com `vercelCatchAll` adapter para emular o comportamento serverless.
- `nodemon` para hot-reload.
- Porta configurável via `PORT` no `.env` (padrão: 3001).

---

## Decisões Arquiteturais

| Decisão | Justificativa |
|---------|---------------|
| **Vanilla JS (sem React/Vue)** | Projeto leve, sem build step, fácil deploy no Vercel |
| **MongoDB Native Driver** | Controle total sobre queries, sem overhead do Mongoose |
| **Serverless (Vercel)** | Zero custo de infraestrutura, escala automática |
| **Relacionamento por referência** | `tracks.albumId` referencia `album._id` para flexibilidade |
| **Connection pooling** | `cachedDb` reutiliza conexão entre invocações serverless |
| **JWT stateless** | Sem sessão no servidor, ideal para serverless |
| **Configurable templates** | `uiConfig` permite personalização visual por álbum |

# 🗃️ Modelo de Dados — Multi-Tenant SaaS

## Banco de Dados

- **Provedor:** MongoDB Atlas
- **Database:** `album-platform` (branch develop/feature) · `album-passagem` (branch main/legacy)
- **Driver:** MongoDB Native Driver (v7+)
- **Conexão:** Singleton com connection pooling (`cachedDb`)
- **Env var:** `DB_NAME` seleciona o banco (default: `album-platform`)

---

## Collections

### `tenants`

Representa uma organização/label na plataforma multi-tenant.

```json
{
  "_id": ObjectId("..."),
  "name": "My Label",
  "slug": "my-label",
  "plan": "free",
  "settings": {},
  "createdAt": ISODate("...")
}
```

| Campo       | Tipo     | Obrigatório | Descrição               |
| ----------- | -------- | :---------: | ----------------------- |
| `_id`       | ObjectId |    Auto     | Identificador nativo    |
| `name`      | String   |     Sim     | Nome da organização     |
| `slug`      | String   |     Sim     | Slug único (subdomínio) |
| `plan`      | String   |     Sim     | `free`, `pro`, `label`  |
| `settings`  | Object   |     Não     | Configurações do tenant |
| `createdAt` | Date     |    Auto     | Data de criação         |

**Índices:** `slug` (unique)

---

### `artists`

Representa um artista vinculado a um tenant.

```json
{
  "_id": ObjectId("..."),
  "tenantId": "string",
  "name": "Artist Example",
  "slug": "artist-example",
  "bio": "Bio do artista...",
  "avatar": "url",
  "links": { "website": "", "instagram": "", "spotify": "" },
  "createdAt": ISODate("...")
}
```

| Campo      | Tipo   | Obrigatório | Descrição                   |
| ---------- | ------ | :---------: | --------------------------- |
| `tenantId` | String |     Sim     | Referência ao tenant        |
| `name`     | String |     Sim     | Nome do artista             |
| `slug`     | String |     Sim     | Slug único dentro do tenant |
| `bio`      | String |     Não     | Biografia                   |
| `avatar`   | String |     Não     | URL da imagem               |
| `links`    | Object |     Não     | Links sociais               |

**Índices:** `tenantId+slug` (unique), `tenantId`

---

### `albums`

Representa um álbum musical (coleção renomeada de `album` → `albums`).

```json
{
  "_id": ObjectId("..."),
  "tenantId": "string",
  "artistId": "string",
  "title": "Example Album",
  "artist": "Artist Example",
  "event": "Launch Event",
  "date": "2026-01-01T00:00:00Z",
  "uiConfig": { "theme": "default", "colors": {}, "typography": {}, "layout": {}, "labels": {}, "branding": {} },
  "isDefault": true,
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

| Campo       | Tipo    | Obrigatório | Descrição                                                           |
| ----------- | ------- | :---------: | ------------------------------------------------------------------- |
| `tenantId`  | String  |     Sim     | Referência ao tenant                                                |
| `artistId`  | String  |     Sim     | Referência ao artista                                               |
| `title`     | String  |     Sim     | Título do álbum                                                     |
| `artist`    | String  |     Sim     | Nome do artista (denormalizado)                                     |
| `event`     | String  |     Não     | Evento associado                                                    |
| `date`      | String  |     Não     | Data de lançamento (ISO 8601)                                       |
| `uiConfig`  | Object  |     Não     | Configuração de template/layout ([docs/ui-config.md](ui-config.md)) |
| `isDefault` | Boolean |     Não     | Álbum padrão do site público                                        |

**Índices:** `artistId`, `tenantId`

---

### `tracks`

Representa uma faixa musical vinculada a um álbum.

```json
{
  "_id": ObjectId("..."),
  "tenantId": "string",
  "albumId": "string",
  "title": "Track Title",
  "trackCode": "TRK01",
  "trackTag": "Opening",
  "status": "Published",
  "order": 1,
  "lyrics": "Lyrics here...",
  "media": [
    { "type": "iframe", "origin": "youtube", "content": "https://..." },
    { "type": "iframe", "origin": "spotify", "content": "https://..." }
  ],
  "interactions": { "likes": 0, "ratings": [] },
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

| Campo          | Tipo   | Obrigatório | Descrição                                   |
| -------------- | ------ | :---------: | ------------------------------------------- |
| `tenantId`     | String |     Sim     | Referência ao tenant                        |
| `albumId`      | String |     Sim     | Referência ao álbum                         |
| `title`        | String |     Sim     | Título da faixa                             |
| `trackCode`    | String |     Sim     | Código identificador (ex: TRK01)            |
| `trackTag`     | String |     Não     | Tag/categoria                               |
| `status`       | String |     Não     | Configurável via `uiConfig.labels.statuses` |
| `order`        | Number |    Auto     | Posição no álbum                            |
| `lyrics`       | String |     Não     | Letra da música                             |
| `media`        | Array  |     Não     | Widgets de mídia incorporáveis              |
| `interactions` | Object |    Auto     | `{ likes: Number, ratings: [Number] }`      |

**Índices:** `albumId+order`, `tenantId`

---

### `admins`

Representa um administrador do painel.

```json
{
  "_id": ObjectId("..."),
  "tenantId": null,
  "username": "admin",
  "password": "$2b$10$hashedPassword...",
  "role": "superadmin",
  "createdAt": ISODate("...")
}
```

| Campo      | Tipo        | Descrição                           |
| ---------- | ----------- | ----------------------------------- |
| `tenantId` | String/null | `null` = superadmin (acesso global) |
| `role`     | String      | `superadmin`, `admin`, `editor`     |

**Índices:** `username` (unique), `tenantId`

---

### `fans` (futuro)

Usuários públicos da plataforma.

**Índices:** `email` (unique sparse)

### `credentials` (futuro)

Credenciais de integração por artista.

**Índices:** `artistId+provider` (unique)

### `webhooks` (futuro)

Log de webhooks recebidos.

---

## Relacionamentos

```
tenant (1) ←──── (N) artists
                      │
              artist (1) ←──── (N) albums
                                    │
                            album (1) ←──── (N) tracks
                                              │
                                    interactions (embedded)

tenant (1) ←──── (N) admins
```

Todos os relacionamentos são por **referência via string ID** (`tenantId`, `artistId`, `albumId`).

---

## Isolamento Multi-Tenant

**Toda query deve incluir `tenantId`** para garantir isolamento de dados:

```javascript
// ✅ Correto
collection.find({ tenantId, albumId });

// ❌ Incorreto (vaza dados entre tenants)
collection.find({ albumId });
```

Exceção: superadmins (`tenantId: null`) podem acessar dados de qualquer tenant.

---

## Setup

```bash
# Inicia o banco album-platform com collections, indexes e dados de exemplo
node scripts/setup-platform.js

# Pula dados de exemplo
node scripts/setup-platform.js --skip-example

# Usa banco legacy (branch main)
DB_NAME=album-passagem node scripts/setup-platform.js
```

# 📡 Documentação da API

## Autenticação

Rotas administrativas requerem JWT no header:
```
Authorization: Bearer <token>
```

O token é obtido via `POST /api/auth/login`.

---

## Endpoints

### 🔓 Auth

#### `POST /api/auth/login`
Retorna um JWT para acesso ao painel administrativo.

**Body:**
```json
{ "username": "admin", "password": "admin" }
```

**Response (200):**
```json
{ "token": "eyJhbGciOiJIUzI1NiIs...", "username": "admin" }
```

---

### 🎵 Musicas (Público)

#### `GET /api/musicas`
Retorna o álbum padrão (primeiro cadastrado) e todas as suas tracks ordenadas por `order`.

**Response (200):**
```json
{
  "album": { "_id": "...", "title": "Passagem", "artist": "Bruno" },
  "tracks": [
    {
      "_id": "...", "albumId": "...", "title": "Faixa 1",
      "gate": "A01", "flightCode": "PSG01", "status": "ON TIME",
      "order": 1, "lyrics": "...",
      "media": [{ "type": "iframe", "origin": "youtube", "content": "url" }],
      "interactions": { "likes": 5, "ratings": [4, 5, 3] }
    }
  ]
}
```

#### `POST /api/musicas/:id/like`
Adiciona ou remove like em uma track.

**Body:** `{ "action": "like" }` ou `{ "action": "unlike" }`

**Response:** `{ "likes": 6 }`

#### `POST /api/musicas/:id/rate`
Registra avaliação de 1-5 estrelas.

**Body:** `{ "rating": 5, "oldRating": 3 }` (`oldRating` opcional, para substituir voto anterior)

**Response:** `{ "ratings": [4, 5, 5], "success": true }`

---

### 💿 Album (Admin)

#### `GET /api/album`
Lista todos os álbuns.

**Response:** Array de objetos álbum.

#### `GET /api/album/:id`
Retorna detalhes de um álbum específico.

#### `POST /api/album`
Cria um novo álbum.

**Body:**
```json
{ "title": "Novo Álbum", "artist": "Artista", "event": "Show", "date": "2026-01-01" }
```

#### `PUT /api/album/:id`
Atualiza campos do álbum. Apenas `title`, `artist`, `event`, `date` são aceitos.

#### `DELETE /api/album/:id`
Remove um álbum.

---

### 🎶 Tracks (Admin)

#### `GET /api/album/:id/tracks`
Lista todas as tracks vinculadas ao álbum, ordenadas por `order`.

#### `POST /api/album/:id/tracks`
Cria uma nova track vinculada ao álbum.

**Body:**
```json
{
  "title": "Nova Faixa", "gate": "A01", "flightCode": "PSG01",
  "status": "ON TIME", "lyrics": "Letra...",
  "media": [{ "type": "iframe", "origin": "youtube", "content": "url" }]
}
```

**Campos obrigatórios:** `title`, `gate`, `flightCode`

**Status válidos:** `ON TIME`, `DELAYED`, `FINAL CALL`, `BOARDING`

#### `POST /api/album/:id/reorder`
Reordena todas as tracks do álbum. Atualiza `order` e recalcula `flightCode` automaticamente.

**Body:**
```json
{ "trackIds": ["id1", "id2", "id3"] }
```

#### `GET /api/tracks/:id`
Detalhes de uma track específica.

#### `PUT /api/tracks/:id`
Atualiza dados da track. Campos `_id` e `interactions` são ignorados por segurança.

#### `DELETE /api/tracks/:id`
Remove uma track.

---

### 👤 Users (Admin)

#### `GET /api/users`
Lista todos os administradores.

#### `POST /api/users`
Cria um novo admin. A senha é hasheada com bcrypt.

**Body:** `{ "username": "novo_admin", "password": "senha123" }`

#### `PUT /api/users/:id`
Atualiza admin. Se `password` for vazio, a senha atual é mantida.

#### `DELETE /api/users/:id`
Remove um admin.

---

## Padrões de Resposta

### Sucesso
```json
{ "campo": "valor" }
```
Status: `200`

### Erro
```json
{ "error": "Mensagem descritiva do erro" }
```
Status: `400`, `401`, `404`, `405`, `500`

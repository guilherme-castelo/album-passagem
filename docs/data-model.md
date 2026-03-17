# 🗃️ Modelo de Dados

## Banco de Dados

- **Provedor:** MongoDB Atlas
- **Database:** `album-passagem`
- **Driver:** MongoDB Native Driver (v7+)
- **Conexão:** Singleton com connection pooling (`cachedDb`)

---

## Collections

### `album`

Representa um álbum musical.

```json
{
  "_id": ObjectId("..."),
  "title": "Passagem",
  "artist": "Bruno",
  "event": "Pré-lançamento Teatro Belas Artes",
  "date": "2026-03-18T20:00:00-04:00",
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `_id` | ObjectId | Auto | Identificador nativo do MongoDB |
| `title` | String | Sim | Título do álbum |
| `artist` | String | Sim | Nome do artista |
| `event` | String | Não | Evento associado ao lançamento |
| `date` | String | Não | Data de lançamento (ISO 8601) |
| `createdAt` | Date | Auto | Data de criação |
| `updatedAt` | Date | Auto | Data da última atualização |

---

### `tracks`

Representa uma faixa musical vinculada a um álbum.

```json
{
  "_id": ObjectId("..."),
  "albumId": "string_id_do_album",
  "title": "Nome da Faixa",
  "gate": "A01",
  "flightCode": "PSG01",
  "status": "ON TIME",
  "order": 1,
  "lyrics": "Letra da música...",
  "media": [
    { "type": "iframe", "origin": "youtube", "content": "https://..." },
    { "type": "iframe", "origin": "spotify", "content": "https://..." }
  ],
  "interactions": {
    "likes": 42,
    "ratings": [5, 4, 5, 3, 4]
  },
  "createdAt": ISODate("..."),
  "updatedAt": ISODate("...")
}
```

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|:-----------:|-----------|
| `_id` | ObjectId | Auto | Identificador nativo |
| `albumId` | String | Sim | Referência ao álbum pai |
| `title` | String | Sim | Título da faixa |
| `gate` | String | Sim | Portão de embarque (temática) |
| `flightCode` | String | Sim | Código do voo (ex: PSG01) |
| `status` | String | Não | `ON TIME`, `DELAYED`, `FINAL CALL`, `BOARDING` |
| `order` | Number | Auto | Posição no álbum (usado para ordenação) |
| `lyrics` | String | Não | Letra da música (texto simples) |
| `media` | Array | Não | Widgets de mídia incorporáveis |
| `interactions` | Object | Auto | Dados de engajamento |
| `createdAt` | Date | Auto | Data de criação |

---

### `users`

Representa um administrador do painel.

```json
{
  "_id": ObjectId("..."),
  "username": "admin",
  "password": "$2b$10$hashedPassword...",
  "createdAt": ISODate("...")
}
```

---

## Relacionamentos

```
album (1) ←──── (N) tracks
                      │
                      ├── interactions.likes (Number)
                      └── interactions.ratings (Array<Number>)
```

O relacionamento `album ↔ tracks` é feito por **referência**: `tracks.albumId` armazena o `_id` do álbum como string.

### Por que referência ao invés de embedding?
- **Flexibilidade:** Tracks podem ser consultadas independentemente.
- **Performance:** Atualizações em tracks (likes, ratings) não bloqueiam o documento do álbum.
- **Escalabilidade:** Preparado para cenários com muitas faixas por álbum.

---

## Índices Recomendados

```javascript
// Para queries de tracks por álbum
db.tracks.createIndex({ albumId: 1, order: 1 });

// Para busca rápida de tracks
db.tracks.createIndex({ _id: 1 });
```

---

## Valores Padrão

Quando nenhum álbum existe no banco, o sistema utiliza um álbum fallback:
```javascript
const DEFAULT_ALBUM = {
    title: 'Passagem',
    artist: 'Bruno',
    event: 'Pré-lançamento Teatro Belas Artes',
    date: '2026-03-18T20:00:00-04:00'
};
```

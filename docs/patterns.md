# 🧩 Padrões Arquiteturais

## 1. Clean Architecture (Backend)

O backend segue uma variação simplificada da Clean Architecture com 3 camadas:

```
Request → Controller → Service → Repository → MongoDB
Response ← Controller ← Service ← Repository ←
```

### Fluxo de dados

```javascript
// Controller: extrai dados do request
const id = req.params.id || req.query.id;
const result = await trackService.update(id, req.body);
return sendSuccess(res, result);

// Service: aplica regras de negócio
async update(id, data) {
    await this.findById(id); // Valida que existe
    const { _id, interactions, ...safe } = data; // Sanitiza
    return trackRepository.update(id, safe);
}

// Repository: acessa o banco
async update(trackId, data) {
    return collection.findOneAndUpdate(
        { _id: new ObjectId(trackId) },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
}
```

---

## 2. Relacionamento por Referência (MongoDB)

Ao invés de embeddar tracks dentro do documento do álbum, usamos referência:

```
album: { _id: "abc123" }
track: { _id: "xyz789", albumId: "abc123" }
```

### Vantagens

- **Updates isolados** — Likes/ratings não travam o documento do álbum.
- **Queries flexíveis** — Buscar tracks por álbum, por ID, ou globalmente.
- **Escalabilidade** — Sem limite de 16MB do documento MongoDB.

---

## 3. Observer Pattern (Frontend State)

O `AdminState` / `AppState` implementa um Observer reativo:

```javascript
// Registrar listener
AdminState.subscribe('currentSection', (newValue) => {
  this._showSection(newValue);
});

// Disparar mudança
AdminState.set('currentSection', 'album');
// → Todos os subscribers de 'currentSection' são notificados
```

---

## 4. Callback Pattern (Views → Controller)

Views nunca chamam API diretamente. Elas expõem callbacks que o Controller conecta:

```javascript
// Na View: expõe o callback
class AlbumDetailView {
  onEditTrack = null; // Controller define isso

  render() {
    button.onClick = (row) => {
      if (this.onEditTrack) this.onEditTrack(row._id);
    };
  }
}

// No Controller: conecta lógica
albumDetail.onEditTrack = async (_id) => {
  const track = await adminService.getTrack(_id);
  tracks.openEditForm(track);
};
```

---

## 5. Catch-All Handler (API Serverless)

Cada módulo da API tem um único handler que roteia internamente:

```javascript
module.exports = async function handler(req, res) {
    const path = req.query.path || req.vercelPath || [];
    const id = path[0];
    const action = path[1];

    if (req.method === 'GET' && !id) → list
    if (req.method === 'GET' && id && action === 'tracks') → listByAlbum
    if (req.method === 'POST' && id && action === 'reorder') → reorder
};
```

### Por quê?

- **Vercel** permite apenas 1 handler por path prefix.
- **Menos cold starts** — menos funções serverless.
- **Consistência** — mesmo padrão em dev (Express) e prod (Vercel).

---

## 6. Optimistic UI

Atualizações são refletidas na UI antes da confirmação do servidor:

```javascript
// 1. Atualiza UI imediatamente
this.views.rating.render(updatedData);
this.views.rating.showToast('Curtido com sucesso! 🧡');

// 2. Envia pro servidor em background
try {
  await this.api.like(trackId, action);
} catch (err) {
  // 3. Rollback se falhar
  await this._refreshAlbumHub();
}
```

---

## 7. Vercel Adapter (Dev ↔ Prod)

O `server.js` emula o ambiente Vercel localmente:

```javascript
function vercelCatchAll(handler, prefix) {
  return async (req, res) => {
    // Extrai subpath e injeta como array
    req.vercelPath = subPath.split('/').filter(Boolean);
    return handler(req, res);
  };
}
```

Isso permite que **o mesmo código** rode tanto localmente (Express) quanto em produção (Vercel Functions).

---

## 8. Drag-and-Drop (Reordenação)

A reordenação usa HTML5 Drag-and-Drop API nativo:

```
1. Usuário arrasta linha da tabela
2. AlbumDetailView._setupDragAndDrop() escuta dragstart/dragover/drop
3. _handleReorder() extrai nova ordem de IDs
4. Atualiza trackCodes localmente (Optimistic UI)
5. Chama adminService.reorderTracks(albumId, trackIds)
6. Backend trackService.updateOrder() recalcula order + trackCode
```

---

## 9. Singleton Pattern (Repositories & Services)

Todas as classes de serviço e repositório são exportadas como singletons:

```javascript
class TrackRepository {
  /* ... */
}
module.exports = new TrackRepository();
```

Garantindo uma única instância compartilhada em toda a aplicação.

---

## 10. Connection Pooling (MongoDB)

A conexão com o banco é reutilizada entre invocações serverless:

```javascript
let cachedDb = null;

async function connectToDatabase() {
  if (cachedDb) return cachedDb; // Reutiliza
  const client = new MongoClient(uri);
  cachedDb = client.db('album-platform');
  return cachedDb;
}
```

Essencial para performance em ambiente serverless onde cold starts são comuns.

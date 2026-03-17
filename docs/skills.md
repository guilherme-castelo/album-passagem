# 🛠️ Guia para Evolução do Projeto

## Como Criar Novos Módulos Backend

### 1. Criar a estrutura
```
backend/modules/<novo_modulo>/
  ├── <modulo>Controller.js
  ├── <modulo>Service.js
  └── <modulo>Repository.js
```

### 2. Repository (acesso ao banco)
```javascript
const connectToDatabase = require('../../lib/db');

class NovoRepository {
    async getCollection() {
        const db = await connectToDatabase();
        return db.collection('nova_collection');
    }

    async findAll(query = {}) {
        const collection = await this.getCollection();
        return collection.find(query).toArray();
    }

    async create(data) {
        const collection = await this.getCollection();
        const result = await collection.insertOne({ ...data, createdAt: new Date() });
        return { ...data, _id: result.insertedId };
    }
    // + findById, update, delete seguindo o mesmo padrão
}

module.exports = new NovoRepository();
```

### 3. Service (regras de negócio)
```javascript
const repository = require('./novoRepository');

class NovoService {
    async list() { return repository.findAll(); }

    async create(data) {
        // Validações aqui
        if (!data.campo) throw new Error('Campo obrigatório');
        return repository.create(data);
    }
}

module.exports = new NovoService();
```

### 4. Controller (HTTP)
```javascript
const service = require('./novoService');
const { sendSuccess, sendError } = require('../../lib/response');

const controller = {
    async list(req, res) {
        try {
            const items = await service.list();
            return sendSuccess(res, items);
        } catch (err) {
            return sendError(res, 500, err.message);
        }
    }
};

module.exports = controller;
```

---

## Como Adicionar Novas Rotas

### 1. Criar handler em `api/`
```javascript
// api/novo/index.js
const controller = require('../../backend/modules/novo/novoController');
const applyCors = require('../../backend/lib/cors');
const { verifyTokenHandler } = require('../../backend/lib/auth');

module.exports = async function handler(req, res) {
    if (applyCors(req, res)) return;
    if (!verifyTokenHandler(req, res)) return;
    
    if (req.method === 'GET') return controller.list(req, res);
    // ...
};
```

### 2. Registrar no `server.js`
```javascript
const novoHandler = require('./api/novo/index');
app.use('/api/novo', vercelCatchAll(novoHandler, '/api/novo'));
```

### 3. Registrar no `vercel.json`
```json
{ "source": "/api/novo/:path*", "destination": "/api/novo/index.js" }
```

---

## Como Adicionar Novas Entidades no Banco

1. **Criar collection** — MongoDB cria automaticamente no primeiro insert.
2. **Definir schema virtual** — Documentar campos em `docs/data-model.md`.
3. **Criar índices** se necessário:
```javascript
db.nova_collection.createIndex({ campo: 1 });
```

### Relacionamentos
Para entidades relacionadas, usar **referência por ID string**:
```javascript
// track referencia album
{ albumId: album._id.toString() }
```

---

## Como Expandir o Admin

### Adicionar nova seção
1. **HTML**: Adicionar `<section>` em `admin/index.html`:
```html
<section id="section-novo" class="admin-section">
    <h2 class="text-2xl font-bold text-white mb-8">Nova Seção</h2>
    <div id="novo-container"></div>
</section>
```

2. **Nav**: Adicionar link na sidebar:
```html
<a class="sidebar-link sidebar-nav-link" data-section="novo">
    <svg>...</svg><span>Novo</span>
</a>
```

3. **View**: Criar `views/NovaView.js`:
```javascript
export class NovaView {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
    }
    render(data) { this.container.innerHTML = `...`; }
}
```

4. **Controller**: Registrar no `AdminController.js`:
```javascript
case 'novo': this._loadNovo(); break;
```

5. **App**: Instanciar no `app.js`:
```javascript
const novo = new NovaView({ container: 'novo-container' });
```

---

## Como Manter Compatibilidade da API

### Regras de ouro
1. **Nunca remover endpoints existentes** — depreciar primeiro.
2. **Manter `/api/musicas`** como endpoint público legado.
3. **Novos campos são opcionais** — não quebrar clients antigos.
4. **Versionar quando necessário** — prefixar URLs se houver breaking change.

### Exemplo de deprecação
```javascript
// Manter rota antiga funcionando
if (req.method === 'GET') {
    console.warn('DEPRECATED: Use /api/album/:id/tracks instead');
    return trackController.list(req, res);
}
```

---

## Como Preparar o Projeto para SaaS

### Fase 1: Multi-Artista
- Adicionar collection `artists` com campos `name`, `bio`, `avatar`.
- Vincular `album.artistId` ao artista.
- Criar tela de gestão de artistas no admin.

### Fase 2: Autenticação Pública
- Implementar registro de usuários públicos (fãs).
- Converter likes/ratings de anônimos para autenticados.
- Adicionar OAuth (Google, Spotify).

### Fase 3: Multi-tenant
- Adicionar `tenantId` em todas as entidades.
- Implementar subdomínios por artista (`artist.albumplatform.com`).
- Isolar dados por tenant em todas as queries.

### Fase 4: Monetização
- Planos free/pro para artistas.
- Analytics avançados (dashboard público).
- Integrações com plataformas de streaming.

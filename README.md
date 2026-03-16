# ✈️ Album Passagem

Site oficial do álbum **Passagem** de Bruno — com letras das músicas, sistema de likes e avaliação por estrelas.

**Deploy:** [album-passagem.vercel.app](https://album-passagem.vercel.app)

---

## 🗂️ Estrutura do Projeto

```
album-passagem/
├── api/                         ← Serverless Functions (Vercel)
│   ├── lib/
│   │   ├── cors.js              ← Middleware CORS reutilizável
│   │   ├── db.js                ← Conexão MongoDB com cache
│   │   └── response.js          ← Helpers de resposta HTTP
│   ├── repositories/
│   │   └── trackRepository.js   ← Acesso ao banco de dados
│   ├── services/
│   │   └── trackService.js      ← Regras de negócio (likes, ratings)
│   ├── musicas/
│   │   └── [id]/
│   │       ├── like.js          ← POST /api/musicas/:id/like
│   │       └── rate.js          ← POST /api/musicas/:id/rate
│   └── musicas.js               ← GET /api/musicas
├── public/                      ← Frontend estático
│   ├── css/
│   │   └── style.css
│   ├── js/
│   │   └── app.js
│   └── index.html
├── data/
│   └── musicas.json             ← Dados fonte para o seed
├── server.js                    ← Dev server local (Express + Vercel Adapter)
├── seed.js                      ← Script para popular o MongoDB
├── vercel.json                  ← Configuração de deploy
└── package.json
```

---

## 🚀 Como Executar Localmente

### 1. Instalar dependências
```bash
npm install
```

### 2. Configurar variáveis de ambiente
Crie um arquivo `.env` na raiz:
```
DB_USER=seu_usuario
DB_PASS=sua_senha
PORT=3001
```

### 3. Popular o banco de dados (primeira vez)
```bash
npm run seed
```

### 4. Iniciar o servidor de desenvolvimento
```bash
npm run dev
```

O site estará disponível em `http://localhost:3001`

---

## 📡 API Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/musicas` | Retorna álbum e todas as faixas |
| `POST` | `/api/musicas/:id/like` | Adiciona ou remove um like |
| `POST` | `/api/musicas/:id/rate` | Registra uma avaliação (1–5 estrelas) |

### Exemplos

**Like:**
```json
POST /api/musicas/1/like
{ "action": "like" }
```

**Rating:**
```json
POST /api/musicas/1/rate
{ "rating": 4, "oldRating": 3 }
```

---

## 🧱 Arquitetura

O projeto usa uma arquitetura em camadas seguindo princípios **SOLID**:

- **Handlers** (`api/musicas.js`, `like.js`, `rate.js`): Recebem a request HTTP e delegam para as camadas abaixo
- **Services** (`trackService.js`): Regras de negócio (cálculo de likes, gestão de ratings)
- **Repository** (`trackRepository.js`): Acesso e persistência no MongoDB
- **Lib** (`db.js`, `cors.js`, `response.js`): Utilitários compartilhados

### Modo Híbrido (Local + Vercel)

O `server.js` usa um **Vercel Adapter** para simular o ambiente da Vercel localmente:
- Na Vercel, os parâmetros dinâmicos (`[id]`) chegam via `req.query`
- No Express local, chegam via `req.params`
- O adapter injeta os `req.params` em `req.query` antes de chamar o handler

Isso garante que os **mesmos handlers** funcionem identicamente nos dois ambientes.

---

## 🔧 Tecnologias

- **Backend:** Node.js + Express (dev) / Vercel Serverless Functions (prod)
- **Banco de dados:** MongoDB Atlas (Native Driver)
- **Frontend:** HTML + CSS + JavaScript Vanilla
- **Deploy:** Vercel
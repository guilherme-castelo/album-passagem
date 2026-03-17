# ✈️ Álbum Passagem — Plataforma Musical & Painel Administrativo

Plataforma fullstack para gestão e apresentação de álbuns musicais. Combina um **site público interativo** com temática de voo e um **painel administrativo** moderno para gestão completa de conteúdo.

**Deploy:** [album-passagem.vercel.app](https://album-passagem.vercel.app)

---

## 🌍 Visão Geral

O **Álbum Passagem** é uma aplicação web que transforma a experiência de ouvir um álbum musical em uma jornada de viagem aérea. O sistema foi construído com uma arquitetura pensada para escalar — suportando múltiplos álbuns, artistas e, futuramente, um modelo SaaS de portfólio musical.

### Objetivo
Oferecer uma plataforma onde artistas possam apresentar seus álbuns com interatividade (likes, ratings, letras, mídia) e gerenciar todo o conteúdo via um painel administrativo intuitivo.

### Contexto
Originalmente criado para o álbum **"Passagem"** do artista Bruno, o sistema evoluiu para suportar múltiplos álbuns com relacionamento hierárquico entre entidades.

---

## ✨ Funcionalidades

### 🌐 Site Público (Experiência do Passageiro)
Uma experiência imersiva simulando uma viagem de avião para apresentar as faixas do álbum.
- **Check-in Interativo:** O usuário insere seu nome para gerar o "cartão de embarque".
- **Painel de Voos (Tracklist):** Lista de faixas exibidas como voos num painel de aeroporto, com status em tempo real (ON TIME, BOARDING, etc).
- **Player & Letras:** Visualização detalhada de cada faixa com suporte a players incorporados (YouTube/Spotify).
- **Interações (Likes & Ratings):** Sistema em tempo real para curtir faixas e dar notas de 1 a 5 estrelas.
- **Carimbo de Embarque:** Faixas visitadas recebem o selo visual **"BOARDED"**.
- **Armazenamento Local:** Nome do passageiro e interações são salvos no localStorage.

### 🔐 Painel Administrativo (Área Restrita)
Interface protegida com design **Glassmorphism** em tema escuro.
- **Dashboard Analítico:** Total de faixas, likes, média de avaliações e ranking das músicas mais populares.
- **Gestão de Álbuns (Multi-Album):** Listagem, criação, edição e exclusão de álbuns.
- **Hub do Álbum:** Visão centralizada onde se edita os dados do disco e gerencia todas as músicas no mesmo contexto.
- **Gestão de Faixas (CRUD):**
  - Criação e edição via modal com editor Rich Text (Quill.js) para letras.
  - Campos dinâmicos para múltiplas URLs de players de mídia (YouTube/Spotify).
  - **Reordenação Drag-and-Drop:** Arraste e solte para definir a ordem das faixas.
  - **Códigos de Voo Automáticos:** O campo `flightCode` (PSG01, PSG02...) é recalculado automaticamente.
- **Controle de Acesso:** Login protegido por JWT e bcrypt. Gestão de múltiplos administradores.
- **Componentização Avançada:** Tabelas de dados reutilizáveis com esqueletos de carregamento, paginação e *Toast notifications*.

---

## 🗂️ Arquitetura do Projeto

O projeto adota a **Clean Architecture** no Backend e um padrão rigoroso de **ES6 Modules (Vanilla JS)** no Frontend para garantir máxima escalabilidade e manutenibilidade sem o uso de frameworks pesados no client-side.

> 📄 Para detalhes completos, veja [`docs/architecture.md`](docs/architecture.md)

```
album-passagem/
├── api/                         ← Handlers Serverless (Vercel Functions)
│   ├── album/                   ← Album CRUD + Tracks hierárquicos + Reorder
│   ├── auth/                    ← Login e geração de JWT
│   ├── musicas/                 ← Endpoint legado (site público)
│   ├── tracks/                  ← Tracks CRUD + Like/Rate
│   └── users/                   ← Gestão de admins
│
├── backend/                     ← Lógica de Negócio (Clean Architecture)
│   ├── lib/                     ← Utilitários (DB, CORS, Auth, Response)
│   └── modules/                 ← Domínios Isolados
│       ├── album/               ← Controller → Service → Repository
│       ├── auth/                ← Login e JWT
│       ├── tracks/              ← Faixas, Interações e Reordenação
│       └── users/               ← Administradores
│
├── public/                      ← Frontend Estático
│   ├── admin/                   ← App do Painel Administrativo
│   │   ├── css/                 ← Design Tokens e Glassmorphism UI
│   │   └── js/                  ← Módulos ES6 (State, API, Components, Views, Utils)
│   │
│   ├── css/                     ← Estilos do Site Público
│   ├── js/                      ← Módulos do Site Público (App, Router, State)
│   │
│   ├── index.html               ← Shell do Site Público
│   └── admin/login.html         ← Shells do Admin
│       └── index.html
│
├── server.js                    ← Dev server local (Express + Vercel Adapter)
├── seed-admin.js                ← Script para criar primeiro admin
├── vercel.json                  ← Configuração de deploy e rewrites
└── package.json
```

### Padrão Frontend (Modularização ES6)
Tanto o site público quanto o admin seguem o Padrão Observer e Componentes de interface:
*   `State`: Gerencia os dados globais (`AppState.js` / `AdminState.js`) de forma reativa.
*   `Controllers`: Fazem o roteamento e orquestram a comunicação State ↔ View ↔ API.
*   `Views/Components`: Elementos burros manipuladores da DOM, reutilizáveis (e.g. `ModalComponent.js`, `DataTable.js`).

---

## 📊 Estrutura de Dados

O sistema utiliza MongoDB Atlas com o driver nativo (sem Mongoose). As entidades principais são:

> 📄 Para detalhes completos, veja [`docs/data-model.md`](docs/data-model.md)

### `albums`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `_id` | ObjectId | Identificador nativo do MongoDB |
| `title` | String | Título do álbum |
| `artist` | String | Nome do artista |
| `event` | String | Evento associado |
| `date` | String (ISO) | Data de lançamento |

### `tracks`
| Campo | Tipo | Descrição |
|-------|------|-----------|
| `_id` | ObjectId | Identificador nativo do MongoDB |
| `albumId` | String | Referência ao álbum (por referência) |
| `title` | String | Título da faixa |
| `gate` | String | Portão de embarque (ex: A01) |
| `flightCode` | String | Código do voo (ex: PSG01) |
| `status` | String | ON TIME, DELAYED, FINAL CALL, BOARDING |
| `order` | Number | Posição da faixa no álbum |
| `lyrics` | String | Letra da música |
| `media` | Array | Widgets de mídia `[{type, origin, content}]` |
| `interactions` | Object | `{ likes: Number, ratings: [Number] }` |

---

## 🔧 Tecnologias Utilizadas

- **Backend:** Node.js, Express (Dev), Vercel Serverless Functions (Prod)
- **Banco de Dados:** MongoDB Atlas (Native Driver sem Mongoose)
- **Segurança:** JSON Web Tokens (JWT), Bcrypt
- **Frontend CSS:** Tailwind CSS (via CDN) + CSS Customizado (Glassmorphism, Design Tokens)
- **Frontend JS:** Vanilla JavaScript (ES6 Modules, Fetch API)
- **Libs Externas Auxiliares:** Quill.js (Rich Text Editor)

---

## 🚀 Como Executar Localmente

### 1. Requisitos
- Node.js (v18+)
- Uma string de conexão MongoDB Atlas

### 2. Instalação
```bash
git clone <repo-url>
cd album-passagem
npm install
```

### 3. Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto:
```env
DB_USER=seu_usuario
DB_PASS=sua_senha
PORT=3001
JWT_SECRET=super_secret_key_12345
```

### 4. Setup do Banco de Dados
Gere o usuário administrador base para acessar o painel:
```bash
node seed-admin.js
```
*Cria automaticamente o usuário `admin` com a senha `admin`.*

### 5. Iniciar o Servidor
```bash
npm run dev
```

### 6. Acessos
- **Site Público:** `http://localhost:3001`
- **Login Admin:** `http://localhost:3001/admin/login.html`

### 7. Deploy (Vercel)
O projeto está configurado para deploy automático. O arquivo `vercel.json` define os rewrites para as 5 funções serverless.

---

## 📡 Endpoints da API

> 📄 Para detalhes completos, veja [`docs/api.md`](docs/api.md)

As rotas administrativas requerem o header: `Authorization: Bearer <token>`

### Públicos
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `POST` | `/api/auth/login` | Retorna JWT Token |
| `GET`  | `/api/musicas`    | Retorna álbum padrão + todas as tracks |
| `POST` | `/api/musicas/:id/like` | Adiciona/remove Like |
| `POST` | `/api/musicas/:id/rate` | Registra Rating (1-5) |

### Álbuns (Admin)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET`  | `/api/album`      | Listar todos os álbuns |
| `GET`  | `/api/album/:id`  | Detalhes de um álbum |
| `POST` | `/api/album`      | Criar novo álbum |
| `PUT`  | `/api/album/:id`  | Editar álbum |
| `DELETE`| `/api/album/:id` | Remover álbum |

### Tracks (Admin)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET`  | `/api/album/:id/tracks` | Listar tracks de um álbum |
| `POST` | `/api/album/:id/tracks` | Criar track no álbum |
| `POST` | `/api/album/:id/reorder` | Reordenar tracks (bulk) |
| `GET`  | `/api/tracks/:id`  | Detalhes de uma track |
| `PUT`  | `/api/tracks/:id`  | Editar track |
| `DELETE`| `/api/tracks/:id` | Remover track |

### Usuários (Admin)
| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET`/`POST`/`PUT`/`DELETE` | `/api/users` | CRUD completo de Admins |

---

## 🗺️ Roadmap

| Fase | Objetivo | Status |
|------|----------|--------|
| ✅ v1.0 | Álbum único com gestão de faixas | Concluído |
| ✅ v1.1 | Multi-album, Album Hub e Drag-and-Drop | Concluído |
| 🔜 v1.2 | Suporte a múltiplos artistas | Planejado |
| 🔜 v1.3 | Autenticação pública (OAuth/Social) | Planejado |
| 🔜 v2.0 | Portfólio de artistas e modelo SaaS | Planejado |

> 📄 Para detalhes do roadmap, veja [`docs/saas-roadmap.md`](docs/saas-roadmap.md)

---

## 📚 Documentação Interna

| Documento | Descrição |
|-----------|-----------|
| [`docs/architecture.md`](docs/architecture.md) | Decisões arquiteturais e estrutura do sistema |
| [`docs/api.md`](docs/api.md) | Documentação completa da API REST |
| [`docs/data-model.md`](docs/data-model.md) | Modelo de dados e entidades MongoDB |
| [`docs/admin-flow.md`](docs/admin-flow.md) | Fluxo do painel administrativo |
| [`docs/development-rules.md`](docs/development-rules.md) | Regras e convenções de desenvolvimento |
| [`docs/patterns.md`](docs/patterns.md) | Padrões arquiteturais utilizados |
| [`docs/skills.md`](docs/skills.md) | Guia para evolução do projeto |
| [`docs/saas-roadmap.md`](docs/saas-roadmap.md) | Roadmap para modelo SaaS |
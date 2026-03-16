# ✈️ Álbum Passagem — App & Painel Admin

Projeto Fullstack contendo o site oficial interativo do álbum **Passagem** (com temática de voo) e um sistema de **Painel Administrativo** moderno para gestão completa do conteúdo.

**Deploy:** [album-passagem.vercel.app](https://album-passagem.vercel.app)

---

## ✨ Funcionalidades

### 🌐 Site Público (Experiência do Passageiro)
Uma experiência imersiva simulando uma viagem de avião para apresentar as faixas do álbum.
- **Check-in Interativo:** O usuário insere seu nome para gerar o "cartão de embarque".
- **Painel de Voos (Tracklist):** Lista de faixas exibidas como voos num painel de aeroporto, com status em tempo real (ON TIME, BOARDING, etc).
- **Player & Letras:** Visualização detalhada de cada faixa (voo) com suporte para exibição de letras e players incorporados (YouTube/Spotify).
- **Interações (Likes & Ratings):** Sistema em tempo real para curtir faixas e dar notas de 1 a 5 estrelas.
- **Armazenamento Local:** Nome do passageiro e interações são salvos no localStorage para persistência da sessão.

### 🔐 Painel Administrativo (Área Restrita)
Interface de gestão protegida, desenvolvida com um design **Glassmorphism moderno** em um tema escuro.
- **Dashboard Analítico:** Visão geral com total de faixas, likes, média de avaliações e ranking das músicas mais populares.
- **Gestão de Faixas (CRUD):** 
  - Criação e edição em formulários em formato Modal.
  - Editor de texto rico (Rich Text / Quill.js) para as letras das músicas.
  - Campos dinâmicos para anexar URLs de players de mídia.
- **Gestão do Álbum:** Edição centralizada do título, artista, nome do evento e data de lançamento.
- **Controle de Acesso:**
  - Login protegido por JWT e bcrypt.
  - Gestão de usuários (criação e remoção de outros administradores).
- **Componentização Avançada:** Tabelas de dados reutilizáveis com esqueletos de carregamento, paginação, e *Toast notifications* elegantes.

---

## 🗂️ Arquitetura e Estrutura do Projeto

O projeto adota a **Clean Architecture** no Backend e um padrão rigoroso de **ES6 Modules (Vanilla JS)** no Frontend para garantir máxima escalabilidade e manutenibilidade sem o uso de frameworks pesados no client-side.

```
album-passagem/
├── api/                         ← Backend API (Serverless Vercel)
│   ├── lib/                     ← Utilitários (DB, CORS, Auth, Response)
│   ├── modules/                 ← Domínios Isolados (Clean Architecture)
│   │   ├── album/               ← Controller, Service, Repository, Routes
│   │   ├── auth/                ← Login e JWT
│   │   ├── tracks/              ← Gestão de Faixas e Interações
│   │   └── users/               ← Gestão de Usuários (Admins)
│   └── musicas/                 ← (Rotas Legadas - retrocompatibilidade)
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
└── package.json
```

### Padrão Frontend (Modularização ES6)
Tanto o site público quanto o admin seguem o Padrão Observer e Componentes de interface:
*   `State`: Gerencia os dados globais (`AppState.js` / `AdminState.js`) de forma reativa.
*   `Controllers`: Fazem o roteamento e orquestram a comunicação State ↔ View ↔ API.
*   `Views/Components`: Elementos burros manipuladores da DOM, reutilizáveis (e.g. `ModalComponent.js`, `DataTable.js`).

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
- Uma string de conexão MongoDB

### 2. Instalação
Clone o repositório e instale as dependências:
```bash
npm install
```

### 3. Configuração de Ambiente
Crie um arquivo `.env` na raiz do projeto contendo:
```env
DB_USER=seu_usuario
DB_PASS=sua_senha
PORT=3001
JWT_SECRET=super_secret_key_12345
```

### 4. Setup do Banco de Dados
Gere o usuário administrador base para conseguir acessar o painel:
```bash
node seed-admin.js
```
*Isso criará automaticamente o usuário `admin` com a senha `admin`.*

### 5. Iniciar o Servidor
Execute o servidor Express com o *Vercel Adapter* (que mapeia todas as rotas serveless para testes locais):
```bash
npm run dev
```

### 6. Acessos
- **Site Público:** `http://localhost:3001`
- **Login Admin:** `http://localhost:3001/admin/login.html`

---

## 📡 Endpoints da API

A API segue padrões RESTful. As rotas Administrativas (`/api/album`, `/api/tracks/..` (PUT, POST, DELETE), `/api/users`) requerem o header:
`Authorization: Bearer <token>`

| Método | Endpoint | Privado? | Descrição |
|--------|----------|----------|-----------|
| `POST` | `/api/auth/login` | Não | Retorna JWT Token |
| `GET`  | `/api/musicas`    | Não | Retorna o Álbum e todas as tracks |
| `POST` | `/api/musicas/:id/like` | Não | Adiciona remover Like publicamente |
| `POST` | `/api/musicas/:id/rate` | Não | Registra Rating de 1-5 |
| `GET`  | `/api/tracks`     | Sim | Lista de tracks restrita |
| `POST` | `/api/tracks`     | Sim | Criar nova track |
| `PUT`  | `/api/tracks/:id` | Sim | Editar track |
| `DELETE`|`/api/tracks/:id` | Sim | Remover track |
| `PUT`  | `/api/album`      | Sim | Editar informações globais do Álbum |
| `GET`/`POST`/`DELETE`/`PUT` | `/api/users` | Sim | CRUD completo de Usuários Admins |
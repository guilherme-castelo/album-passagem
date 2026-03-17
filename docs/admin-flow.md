# 🖥️ Fluxo do Painel Administrativo

## Visão Geral

O painel admin é uma SPA (Single Page Application) com 3 seções principais: **Dashboard**, **Álbum** e **Usuários**. A navegação entre seções é feita via sidebar com observer pattern.

```
┌─────────────────────────────────────────────────┐
│                    SIDEBAR                       │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐        │
│  │Dashboard │ │  Álbum   │ │ Usuários │        │
│  └─────┬────┘ └─────┬────┘ └─────┬────┘        │
│        │             │             │             │
│        ▼             ▼             ▼             │
│  ┌──────────┐ ┌──────────────┐ ┌──────────┐    │
│  │ Stats &  │ │ Album List   │ │ Users    │    │
│  │ Top 5    │ │ ┌──────────┐ │ │ Table    │    │
│  │          │ │ │ Gerenciar│ │ │ + CRUD   │    │
│  └──────────┘ │ └────┬─────┘ │ └──────────┘    │
│               │      ▼       │                   │
│               │ ┌──────────┐ │                   │
│               │ │Album Hub │ │                   │
│               │ │ ┌──────┐ │ │                   │
│               │ │ │Tracks│ │ │                   │
│               │ │ │Table │ │ │                   │
│               │ │ │D&D   │ │ │                   │
│               │ │ └──────┘ │ │                   │
│               │ └──────────┘ │                   │
│               └──────────────┘                   │
└─────────────────────────────────────────────────┘
```

---

## Fluxo de Navegação

### 1. Login

1. Usuário acessa `/admin/login.html`
2. Insere credenciais → `POST /api/auth/login`
3. Token JWT é salvo no localStorage
4. Redirecionado para `/admin/` (guard verifica token)

### 2. Dashboard

- Carrega o primeiro álbum e suas tracks
- Exibe 3 cards: Total de Faixas, Total de Likes, Avaliação Média
- Mostra ranking das 5 músicas mais curtidas

### 3. Gestão de Álbuns

1. **Lista de Álbuns** → `GET /api/album`
2. **Novo Álbum** → Modal com campos (título, artista, evento, data)
3. **Gerenciar** → Abre o **Album Hub**

### 4. Album Hub (Ponto central)

O Hub é onde toda a gestão de faixas acontece:

1. **Header do álbum** com botão "Voltar" e "Adicionar Música"
2. **Tabela de tracks** com colunas: Drag Handle, Code, Título, Status, Likes, Ações

**Ações disponíveis:**

- **Drag-and-Drop:** Arrastar linhas para reordenar → `POST /api/album/:id/reorder`
- **Adicionar:** Abre modal TracksView → `POST /api/album/:id/tracks`
- **Editar:** Carrega dados via `GET /api/tracks/:id` → `PUT /api/tracks/:id`
- **Excluir:** Confirmação via ConfirmDialog → `DELETE /api/tracks/:id`

### 5. Gestão de Usuários

- CRUD simples com tabela + modal
- Senhas são hasheadas com bcrypt no backend
- Edição permite manter senha atual (campo vazio)

---

## Componentes Reutilizáveis

| Componente         | Arquivo               | Função                                                      |
| ------------------ | --------------------- | ----------------------------------------------------------- |
| `DataTable`        | `DataTable.js`        | Tabela genérica com skeleton, ações e colunas customizáveis |
| `ModalComponent`   | `ModalComponent.js`   | Modal glassmorphic com body + footer customizáveis          |
| `ToastComponent`   | `ToastComponent.js`   | Notificações flutuantes (success/error)                     |
| `ConfirmDialog`    | `ConfirmDialog.js`    | Diálogo de confirmação async (substitui `window.confirm`)   |
| `SidebarComponent` | `SidebarComponent.js` | Navegação lateral com mobile overlay                        |

---

## Estado (AdminState)

```javascript
AdminState = {
  currentSection: 'dashboard', // Seção ativa
  selectedAlbum: null, // Álbum aberto no Hub
  albums: [], // Cache de álbuns
  tracks: [], // Cache de tracks
  users: [] // Cache de usuários
};
```

O `AdminController` é o orquestrador central:

- Escuta mudanças de `currentSection` para trocar a seção visível
- Gerencia o ciclo de vida do Album Hub (abrir, refresh, voltar)
- Conecta callbacks das views ao `adminService` (API)

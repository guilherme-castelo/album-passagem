# 📏 Regras de Desenvolvimento

## Convenções de Nomenclatura

### Arquivos

| Tipo            | Convenção    | Exemplo                                  |
| --------------- | ------------ | ---------------------------------------- |
| Módulos Backend | `camelCase`  | `albumController.js`, `trackService.js`  |
| Views Frontend  | `PascalCase` | `AlbumDetailView.js`, `DashboardView.js` |
| Components      | `PascalCase` | `DataTable.js`, `ModalComponent.js`      |
| Utilitários     | `camelCase`  | `adminService.js`, `auth.js`             |
| Estilos         | `kebab-case` | `admin.css`                              |

### Código

- **Variáveis e funções:** `camelCase` → `findById`, `handleTrackSelect`
- **Classes:** `PascalCase` → `TrackService`, `AdminController`
- **Constantes:** `UPPER_SNAKE_CASE` → `ALLOWED_STATUSES`, `REQUIRED_FIELDS`
- **IDs HTML:** `kebab-case` → `album-detail-container`, `btn-new-track`
- **CSS classes:** `kebab-case` → `glass-card`, `sidebar-link`

---

## Padrão de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

```
<tipo>(<escopo>): <descrição>
```

### Tipos

| Tipo       | Uso                                   |
| ---------- | ------------------------------------- |
| `feat`     | Nova funcionalidade                   |
| `fix`      | Correção de bug                       |
| `refactor` | Refatoração (sem mudar comportamento) |
| `docs`     | Documentação                          |
| `style`    | Formatação (não altera lógica)        |
| `chore`    | Tarefas de manutenção                 |

### Exemplos

```
feat(tracks): add drag-and-drop reordering
fix(admin): resolve panel initialization error
refactor(api): standardize _id usage across endpoints
docs: create internal documentation suite
```

---

## Organização de Arquivos

### Backend

```
backend/modules/<modulo>/
  ├── <modulo>Controller.js   ← Request/Response
  ├── <modulo>Service.js      ← Regras de negócio
  ├── <modulo>Repository.js   ← Acesso ao banco
  └── <modulo>Routes.js       ← Definição de rotas (opcional)
```

### Frontend

```
public/admin/js/
  ├── controllers/    ← Orquestradores (1 por app)
  ├── views/          ← Manipuladores de DOM (1 por seção)
  ├── components/     ← Componentes reutilizáveis
  ├── state/          ← Gerenciador de estado reativo
  ├── api/            ← Camada de comunicação com backend
  └── utils/          ← Funções utilitárias (auth, dom, etc.)
```

---

## Separação de Responsabilidades

### Backend

| Camada         | Pode                                               | Não pode                                            |
| -------------- | -------------------------------------------------- | --------------------------------------------------- |
| **Controller** | Extrair params, chamar Service, retornar response  | Acessar banco diretamente, conter lógica de negócio |
| **Service**    | Validar dados, orquestrar Repository, lançar erros | Acessar `req`/`res`, retornar HTTP status           |
| **Repository** | Fazer queries MongoDB, retornar dados crus         | Validar regras de negócio, formatar responses       |

### Frontend

| Camada         | Pode                                               | Não pode                                     |
| -------------- | -------------------------------------------------- | -------------------------------------------- |
| **Controller** | Orquestrar views, chamar API, atualizar state      | Manipular DOM diretamente                    |
| **View**       | Renderizar HTML, emitir eventos via callbacks      | Fazer chamadas API, conter lógica de negócio |
| **Component**  | Gerenciar seu próprio DOM, aceitar dados via props | Conhecer estado global, acessar outras views |

---

## Boas Práticas de Código

### JavaScript

1. **Sempre usar `async/await`** ao invés de `.then()` chains.
2. **Destructuring** para extrair propriedades: `const { _id, title } = track;`
3. **Fallback seguro** para IDs: `track._id || track.id`
4. **Não mutar state diretamente** — usar `state.getClone()` para Optimistic UI.
5. **Imports explícitos** — cada módulo importa apenas o que usa.

### MongoDB

1. **Sempre usar `new ObjectId(id)`** para queries por `_id`.
2. **Nunca expor `_id` bruto** — converter para string quando necessário.
3. **Usar `$set`** para updates parciais (nunca substituir documento inteiro).
4. **Incluir timestamps** (`createdAt`, `updatedAt`) em todos os documentos.

### API

1. **Validar no Service**, não no Controller.
2. **Usar helpers de response** — `sendSuccess`, `sendError`, `sendNotFound`.
3. **Sanitizar input** — whitelist de campos permitidos (ex: `ALLOWED_FIELDS`).
4. **Auth antes da lógica** — verificar JWT no início do handler.

### UX & UI (Neutralidade Visual)

1. **Agnosticismo Total**: Proibido usar cores fixas (hex/rgb) ou fontes específicas no CSS/JS. Tudo deve vir de variáveis CSS ou `uiConfig`.
2. **Abstração de Labels**: Textos de interface (ex: "Entrar", "Músicas") devem usar `data-label` para serem traduzíveis via Admin.
3. **Skeleton Loading**: Sempre mostrar esqueletos enquanto dados carregam para manter a fluidez percebida.
4. **Optimistic UI**: Atualizar UI imediatamente em interações sociais (likes), com rollback automático.
5. **Feedback Visual**: Toasts consistentes para toda ação do usuário no Admin.

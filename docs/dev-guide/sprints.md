# 🗓️ Sprint History & Roadmap

Este documento registra a evolução real do projeto e planeja os próximos passos rumo à plataforma SaaS.

---

# 📜 Sprint History (Concluídas)

## Sprint 1 — Fundação & Transição Multi-Álbum

**Objetivo:** Migrar o sistema de um único álbum estático para uma estrutura dinâmica de múltiplos álbuns.

- **Entregas:**
  - Criação da collection `albums` no MongoDB.
  - Associação de faixas via `albumId`.
  - Migração de dados legados do "Passagem" para a nova estrutura.
  - CRUD básico de álbuns no Admin.
- **Impacto:** Permitiu que a plataforma suportasse mais de um lançamento simultaneamente.

## Sprint 2 — Padronização de Dados & API

**Objetivo:** Estabelecer padrões de identificação e rotas de API robustas.

- **Entregas:**
  - Padronização de `_id` como string em todo o backend/frontend.
  - Implementação de roteamento hierárquico: `/api/album/:id/tracks`.
  - Refatoração do `trackController` e `trackService` para isolamento de contexto.
- **Impacto:** API mais limpa e consistente, facilitando a gestão de faixas por álbum.

## Sprint 3 — Reset Visual & Abstração (The Engine) 🚀

**Objetivo:** Desacoplar o design fixo do código e criar um motor de renderização genérico.

- **Entregas:**
  - Implementação do `uiConfig` (JSON Schema) para controle total da interface.
  - Criação do `ThemeManager.js` para injeção dinâmica de estilos.
  - Setup do `vars.css` (CSS Variables) eliminando cores e fontes hardcoded.
  - Refatoração total dos componentes frontend (`TrackList`, `LyricsView`, `ViewRouter`) para neutralidade visual.
  - Arquivamento de assets e estilos legados em `/legacy`.
- **Impacto:** Transformou o site em um software agnóstico capaz de "vestir" qualquer tema sem alteração de código.

## Sprint 4 — Refinamento UX & Estabilização

**Objetivo:** Corrigir bugs críticos e melhorar a percepção de performance.

- **Entregas:**
  - **Bugfix Admin:** Habilitação da exclusão de álbuns (binding do controller).
  - **Bugfix Persistência:** Garantia de vínculo `albumId` na criação de novas faixas via Admin.
  - **Loading Experience:** Substituição do "Carregando..." fixo por injeção de metadados dinâmica e novos spinners.
  - **Sanitização:** Remoção de termos aeroportuários ("Voo", "Portão") remanescentes nos formulários.
- **Impacto:** Interface profissional, estável e livre de referências ao tema original.

## Sprint 5 — Governança & Organização Documental

**Objetivo:** Consolidar o conhecimento e preparar para o desenvolvimento colaborativo.

- **Entregas:**
  - Reorganização total da pasta `docs/` em categorias (`core`, `frontend`, `backend`, `dev-guide`).
  - Criação do `README.md` mestre.
  - Atualização das regras de desenvolvimento focando em **Neutralidade Visual**.
  - Documentação do Roadmap SaaS e infraestrututa de CI/CD.
- **Impacto:** Base de conhecimento sólida e estruturada para escala.

---

# 🚀 Current Sprint

## Sprint 6 — Consolidação & Planejamento SaaS

**Status:** In-Progress

- **Objetivo:** Auditar o estado da arte do código e planejar os módulos de Artista e Multi-tenancy.
- **Tarefas:**
  - [x] Auditoria e carregamento de toda a doc consolidada.
  - [x] Sincronização do Histórico de Sprints (este documento).
  - [ ] Revisão final do modelo de dados para expansão Multi-Artista.
- **DOD:** Documentação 100% fiel ao código e roadmap aprovado.

---

# 📅 Next Sprints (Roadmap)

## Sprint 7 — Editor Visual & Presets

- **Objetivo:** Facilitar a customização sem necessidade de editar JSON manualmente.
- **Tarefas:**
  - Implementar aba "Aparência" no Album Hub.
  - Interface visual para seleção de cores e fontes do `uiConfig`.
  - Criar sistema de "Presets de Tema" (Um clique para mudar todo o layout).
  - Live Preview das mudanças antes de salvar.

## Sprint 8 — Entidade Artist (Módulo Artistas)

- **Objetivo:** Adicionar a camada de gestão de múltiplos artistas (Artistas → Álbuns).
- **Tarefas:**
  - Criação da collection `artists`.
  - CRUD de artistas no Admin.
  - UI para vincular álbuns a artistas.
  - Página pública de portfólio do artista (`/artista/:slug`).

## Sprint 9 — Autenticação Pública & Interações 2.0

- **Objetivo:** Engajamento autenticado de fãs.
- **Tarefas:**
  - Login via OAuth (Google/Spotify) para usuários públicos.
  - Histórico de faixas ouvidas e curtidas por usuário.
  - Sistema de comentários/mensagens no álbum.

## Sprint 10 — Multi-tenancy & Infra SaaS

- **Objetivo:** Isolamento total e preparação comercial.
- **Tarefas:**
  - Implementação de `tenantId` em todas as queries.
  - Roteamento por subdomínios (`artista.plataforma.com`).
  - Painel de Analytics avançado por álbum.
  - Integração inicial com Stripe para planos Pro/Label.

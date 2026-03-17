# 🚀 Roadmap SaaS

## Visão de Futuro

O Álbum Passagem nasceu como plataforma de apresentação para um álbum específico, mas sua arquitetura foi projetada para evoluir para um **SaaS de portfólio musical** onde artistas independentes podem criar suas próprias páginas interativas.

---

## Fase Atual: v1.1 ✅

### O que temos
- Multi-álbum com gestão centralizada (Album Hub)
- API hierárquica (`/api/album/:id/tracks`)
- Drag-and-Drop para reordenação de faixas
- Dashboard analítico com métricas de engajamento
- Padronização MongoDB `_id` em todo o sistema
- Deploy serverless via Vercel

---

## Fase 2: Multi-Artista 🔜

### Objetivo
Permitir que múltiplos artistas tenham seus álbuns na plataforma.

### Mudanças
| Área | Mudança |
|------|---------|
| **Banco** | Nova collection `artists` (`name`, `bio`, `avatar`, `slug`) |
| **Álbum** | Novo campo `artistId` referenciando o artista |
| **API** | `GET /api/artists`, `GET /api/artists/:slug/albums` |
| **Admin** | Nova seção "Artistas" com CRUD |
| **Público** | Página `/artista/:slug` com portfólio de álbuns |

### Estrutura de Dados
```json
{
  "_id": ObjectId,
  "name": "Bruno",
  "slug": "bruno",
  "bio": "Artista independente...",
  "avatar": "url",
  "links": {
    "instagram": "url",
    "spotify": "url"
  }
}
```

---

## Fase 3: Autenticação Pública 🔜

### Objetivo
Permitir que fãs criem contas para interagir de forma autenticada.

### Mudanças
| Área | Mudança |
|------|---------|
| **Banco** | Nova collection `fans` com perfil público |
| **Auth** | OAuth (Google, Spotify) + email/senha |
| **Interações** | Likes e ratings vinculados ao usuário logado |
| **Histórico** | Registro de faixas ouvidas por usuário |
| **Público** | Perfil do fã com músicas curtidas e avaliadas |

---

## Fase 4: SaaS & Monetização 🔜

### Objetivo
Transformar a plataforma em um produto comercial para artistas independentes.

### Modelo de Negócio
| Plano | Preço | Recursos |
|-------|-------|----------|
| **Free** | R$ 0 | 1 álbum, 10 faixas, analytics básico |
| **Pro** | R$ 29/mês | Ilimitado, domínio custom, analytics avançado |
| **Label** | R$ 99/mês | Multi-artista, relatórios, integrações |

### Mudanças Técnicas
| Área | Mudança |
|------|---------|
| **Multi-tenant** | `tenantId` em todas as entidades |
| **Subdomínios** | `artista.albumpassagem.com` |
| **Billing** | Integração com Stripe |
| **Analytics** | Dashboard público com métricas |
| **CDN** | Upload de imagens/áudio para S3 ou Cloudinary |

---

## Prioridades de Implementação

```
v1.2 ──→ Multi-Artista
  │
  ├── Collection artists
  ├── Vínculo album → artist
  ├── Página pública de artista
  └── Admin: gestão de artistas

v1.3 ──→ Autenticação Pública
  │
  ├── OAuth / email
  ├── Perfil de fã
  ├── Likes autenticados
  └── Histórico de atividade

v2.0 ──→ SaaS
  │
  ├── Multi-tenant
  ├── Subdomínios
  ├── Planos e billing
  └── Analytics avançado
```

---

## Princípios para Evolução

1. **Backward compatible** — Nunca quebrar APIs existentes.
2. **Feature flags** — Novas funcionalidades atrás de flags configuráveis.
3. **Gradual rollout** — Testar com artistas beta antes de lançar publicamente.
4. **Data isolation** — Cada artista/tenant só vê seus próprios dados.
5. **Stateless** — Manter arquitetura serverless para escalar sem dor.

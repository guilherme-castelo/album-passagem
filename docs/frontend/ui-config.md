# Schema do uiConfig (Design System Dinâmico)

Este documento define a estrutura de dados permitida para a customização visual dos álbuns.

## Estrutura JSON

```json
{
  "theme": "minimal | ticket | glass | neo",
  "palette": {
    "primary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "text": "#hex",
    "muted": "#hex"
  },
  "typography": {
    "heading": "Nome da Fonte (Google Fonts)",
    "body": "Nome da Fonte",
    "mono": "Nome da Fonte"
  },
  "layout": {
    "sectionsOrder": ["hero", "tracklist", "lyrics", "media"],
    "trackDisplay": "list | grid | compact",
    "showLyrics": true,
    "showMedia": true
  },
  "visualTokens": {
    "borderRadius": "string (px/rem)",
    "shadowLevel": "string (CSS shadow)"
  },
  "labels": {
    "tracklistTitle": "Destinos",
    "cta": "Explorar",
    "...": "Demais labels abstraídas"
  },
  "branding": {
    "logo": "URL",
    "heroImage": "URL"
  },
  "customCss": "String (Sanitizada)"
}
```

## Regras de Segurança (Runtime)

1. **Sanitização de CSS**:
   - Bloqueio de seletores de elementos globais (ex: `body`, `html`, `*`). Permitido apenas dentro do container do álbum.
   - Bloqueio de `@import` remotos não autorizados.
   - Remoção de `expression()`, `-moz-binding`, e outros vetores de XSS.
2. **Assets**:
   - Logos e imagens devem residir em domínios permitidos ou via upload no sistema.
   - SVGs injetados serão purgados de tags `<script>`.

3. **Fallbacks**:
   - Caso `uiConfig` seja nulo, o renderer assume o tema `minimal` com paleta preto/branco.

```

## Acessibilidade (WCAG AA)
- O sistema impedirá (ou alertará) combinações de cores com contraste inferior a 4.5:1 para texto normal.
```

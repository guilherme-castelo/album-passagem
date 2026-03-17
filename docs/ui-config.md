# 🎨 UI Configuration System (`uiConfig`)

## Overview

Each album can define its own visual configuration via the `uiConfig` field. This allows artists to customize the public-facing page without modifying code.

---

## Schema

```json
{
  "uiConfig": {
    "theme": "default",
    "colors": {
      "primary": "#0F2C59",
      "accent": "#F9B572",
      "background": "#0a0f1a",
      "text": "#ffffff",
      "muted": "#94a3b8"
    },
    "typography": {
      "heading": "Inter",
      "body": "Inter",
      "mono": "Roboto Mono"
    },
    "layout": {
      "sections": ["hero", "tracklist", "lyrics"],
      "trackDisplay": "list",
      "showInteractions": true,
      "showLyrics": true,
      "showMedia": true
    },
    "labels": {
      "trackCode": "Track",
      "trackTag": "Tag",
      "statuses": ["Published", "Draft", "Featured", "Hidden"],
      "cta": "Listen Now"
    },
    "branding": {
      "title": "",
      "subtitle": "",
      "logo": "",
      "footer": ""
    }
  }
}
```

---

## Field Reference

### `theme`

| Value       | Description                        |
| ----------- | ---------------------------------- |
| `"default"` | Platform default theme             |
| `"dark"`    | Dark glassmorphism                 |
| `"light"`   | Light clean                        |
| `"custom"`  | Fully custom via colors/typography |

### `colors`

| Key          | Type | Default   | Description            |
| ------------ | ---- | --------- | ---------------------- |
| `primary`    | Hex  | `#0F2C59` | Main brand color       |
| `accent`     | Hex  | `#F9B572` | Accent/highlight color |
| `background` | Hex  | `#0a0f1a` | Page background        |
| `text`       | Hex  | `#ffffff` | Primary text           |
| `muted`      | Hex  | `#94a3b8` | Secondary text         |

### `typography`

| Key       | Type   | Default       | Description              |
| --------- | ------ | ------------- | ------------------------ |
| `heading` | String | `Inter`       | Google Font for headings |
| `body`    | String | `Inter`       | Google Font for body     |
| `mono`    | String | `Roboto Mono` | Monospaced font          |

### `layout`

| Key                | Type    | Default                         | Description                |
| ------------------ | ------- | ------------------------------- | -------------------------- |
| `sections`         | Array   | `["hero","tracklist","lyrics"]` | Visible sections and order |
| `trackDisplay`     | String  | `"list"`                        | `list` or `grid`           |
| `showInteractions` | Boolean | `true`                          | Show likes/ratings         |
| `showLyrics`       | Boolean | `true`                          | Show lyrics view           |
| `showMedia`        | Boolean | `true`                          | Show media embeds          |

### `labels`

| Key         | Type   | Default                                     | Description                  |
| ----------- | ------ | ------------------------------------------- | ---------------------------- |
| `trackCode` | String | `"Track"`                                   | Label for track identifier   |
| `trackTag`  | String | `"Tag"`                                     | Label for track tag/category |
| `statuses`  | Array  | `["Published","Draft","Featured","Hidden"]` | Available status values      |
| `cta`       | String | `"Listen Now"`                              | Call-to-action button text   |

### `branding`

| Key        | Type   | Default     | Description            |
| ---------- | ------ | ----------- | ---------------------- |
| `title`    | String | Album title | Override page title    |
| `subtitle` | String | `""`        | Subtitle beneath title |
| `logo`     | String | `""`        | URL to logo image      |
| `footer`   | String | `""`        | Footer text override   |

---

## Defaults

When `uiConfig` is not present on an album, the platform defaults apply:

```javascript
const DEFAULT_UI_CONFIG = {
  theme: 'default',
  colors: {
    primary: '#0F2C59',
    accent: '#F9B572',
    background: '#0a0f1a',
    text: '#ffffff',
    muted: '#94a3b8'
  },
  typography: { heading: 'Inter', body: 'Inter', mono: 'Roboto Mono' },
  layout: {
    sections: ['hero', 'tracklist', 'lyrics'],
    trackDisplay: 'list',
    showInteractions: true,
    showLyrics: true,
    showMedia: true
  },
  labels: {
    trackCode: 'Track',
    trackTag: 'Tag',
    statuses: ['Published', 'Draft', 'Featured', 'Hidden'],
    cta: 'Listen Now'
  },
  branding: { title: '', subtitle: '', logo: '', footer: '' }
};
```

---

## Security Constraints

- **Sanitization:** All string values are sanitized (no HTML/JS injection).
- **Max lengths:** `title` and `subtitle` max 200 chars, `footer` max 500 chars.
- **Font whitelist:** Only Google Fonts are accepted. Invalid fonts fall back to `Inter`.
- **Color validation:** Must be valid hex codes (`#RRGGBB` or `#RGB`).
- **Admin-only:** Only authenticated admins can modify `uiConfig`.

---

## How to Create a New Album Theme

### Step 1: Create the config JSON

```json
{
  "theme": "custom",
  "colors": {
    "primary": "#1DB954",
    "accent": "#191414",
    "background": "#121212",
    "text": "#FFFFFF",
    "muted": "#B3B3B3"
  },
  "typography": {
    "heading": "Outfit",
    "body": "Outfit",
    "mono": "JetBrains Mono"
  },
  "labels": {
    "trackCode": "#",
    "trackTag": "Genre",
    "statuses": ["Released", "Coming Soon", "Exclusive"],
    "cta": "Play Now"
  },
  "branding": {
    "title": "My Album",
    "subtitle": "A journey through sound",
    "footer": "© 2026 My Label"
  }
}
```

### Step 2: Apply via API

```bash
curl -X PUT /api/album/:id \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"uiConfig": { ... }}'
```

### Step 3: Admin UI (planned)

In the admin Album Hub, a "Theme Editor" tab will provide:

- Color pickers for each color field
- Font selector (dropdown of Google Fonts)
- Section toggler (checkboxes for sections array)
- Labels editor (text inputs)
- Live preview panel with responsive viewport toggle

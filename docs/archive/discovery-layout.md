# Relatório de Descoberta: Acoplamento de Layout "Passagem"

Este documento mapeia todos os elementos vinculados ao tema original de aeroporto que devem ser removidos ou abstraídos.

## 1. HTML (`index.html`)

### Estrutura e IDs

- `#ticket-container`: ID que evoca a ideia de bilhete.
- `header`: Contém estrutura rígida de canhoto de passagem.
- `.flight-icon`: SVG de avião hardcoded.
- `.ticket-divider`, `.ticket-divider-bottom`: Elementos visuais de "picote" de papel.
- `#checkin-id`, `#header-flight-code`: IDs vinculados a códigos de voo.

### Referências Textuais Hardcoded

- `Passagem | Boarding Pass` (Title)
- `Passenger / Passageiro`
- `Flight / Voo`
- `From / De`, `To / Para`
- `Destinos`, `Voos Programados`
- `Trocar de Voo`, `Portão`
- `In-flight Entertainment`
- `Obrigado por voar conosco`

## 2. CSS (`style.css`)

### Classes Temáticas

- `.flight-icon`: Animação `flightBob`.
- `.timeline-item`, `.timeline-dot`: Visual de rota/escala.
- `.stamp-visited`: Visual de carimbo de passaporte.
- `.ticket-divider`, `.ticket-divider-bottom`: Estilos de picote e círculos.

### Cores Fixas (Backgrounds)

- `bg-gray-200` no body (simula mesa de aeroporto).
- `bg-brand-blue` (Azul marinho clássico de aviação).

## 3. Scripts

### `ThemeManager.js`

- Contém lógica `_applyTheme` que esconde ou mostra classes como `.ticket-divider`.
- Referências a `flight-icon` para substituição de logo.

### `TrackList.js` / `LyricsView.js`

- Classes `.timeline-*` injetadas no DOM.
- Labels padrão em português/inglês hardcoded no código se o `uiConfig` falta.
- Lógica de `flightCode` (PSG-xx) gerada via script.

## 4. Assets

- SVGs inline no HTML.
- Background de código de barras no footer.

# 🔌 Integration Architecture

## Overview

The platform is designed with extension points for future integrations with media services. This document defines the adapter architecture, credential storage, and webhook contracts.

> **Status:** Architecture defined. Implementation is planned for Sprint 7+.

---

## Adapter Pattern

Integrations follow a **Port/Adapter** pattern:

```
┌───────────────────────────────┐
│         Core Platform          │
│   ┌──────────────────────┐    │
│   │  Integration Port    │    │
│   │  (interface/contract)│    │
│   └────────┬─────────────┘    │
└────────────┼──────────────────┘
             │
    ┌────────┴────────┐
    │                 │
┌───▼────┐      ┌────▼────┐
│Spotify │      │YouTube  │
│Adapter │      │Adapter  │
└────────┘      └─────────┘
```

### Integration Port (Interface)

```javascript
// backend/integrations/IntegrationPort.js
class IntegrationPort {
  constructor(name) {
    this.name = name;
  }

  async search(query) {
    throw new Error('Not implemented');
  }
  async getTrackInfo(externalId) {
    throw new Error('Not implemented');
  }
  async getEmbedUrl(externalId) {
    throw new Error('Not implemented');
  }
  async handleWebhook(payload) {
    throw new Error('Not implemented');
  }
}
```

### Adapter Implementation Example

```javascript
// backend/integrations/adapters/SpotifyAdapter.js
class SpotifyAdapter extends IntegrationPort {
  constructor(credentials) {
    super('spotify');
    this.clientId = credentials.clientId;
    this.clientSecret = credentials.clientSecret;
  }

  async search(query) {
    // Spotify Web API search
    const token = await this._getAccessToken();
    const response = await fetch(`https://api.spotify.com/v1/search?q=${query}&type=track`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.json();
  }

  async getEmbedUrl(trackId) {
    return `https://open.spotify.com/embed/track/${trackId}`;
  }
}
```

---

## File Structure (Planned)

```
backend/
├── integrations/
│   ├── IntegrationPort.js       ← Abstract port
│   ├── IntegrationRegistry.js   ← Registry/factory
│   ├── adapters/
│   │   ├── SpotifyAdapter.js
│   │   └── YouTubeAdapter.js
│   └── webhooks/
│       ├── spotifyWebhook.js
│       └── youtubeWebhook.js

api/
├── integrations/
│   └── index.js                 ← Webhook handler
```

---

## Credential Storage

Per-artist integration credentials stored in a `credentials` collection:

```json
{
  "_id": ObjectId,
  "artistId": "string",
  "provider": "spotify",
  "credentials": {
    "clientId": "encrypted_value",
    "clientSecret": "encrypted_value",
    "refreshToken": "encrypted_value"
  },
  "scopes": ["user-read-email", "playlist-read-private"],
  "status": "active",
  "createdAt": ISODate,
  "updatedAt": ISODate
}
```

> **Security:** Credentials are encrypted at rest using AES-256. Only the integration adapter can decrypt them at runtime.

---

## Webhook Routes

| Provider | Endpoint                              | Method | Purpose                         |
| -------- | ------------------------------------- | ------ | ------------------------------- |
| Spotify  | `/api/integrations/spotify/webhook`   | POST   | Track updates, playlist changes |
| YouTube  | `/api/integrations/youtube/webhook`   | POST   | Video status, new uploads       |
| Generic  | `/api/integrations/:provider/webhook` | POST   | Extensible for future providers |

### Webhook Payload Contract

```json
{
  "provider": "spotify",
  "event": "track.updated",
  "timestamp": "2026-01-01T00:00:00Z",
  "data": {
    "externalId": "spotify_track_id",
    "title": "Updated Track Name",
    "metadata": {}
  },
  "signature": "hmac_sha256_signature"
}
```

### Webhook Verification

```javascript
function verifyWebhookSignature(payload, signature, secret) {
  const crypto = require('crypto');
  const expected = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}
```

---

## Integration Registry

```javascript
// Usage
const registry = new IntegrationRegistry();
registry.register('spotify', SpotifyAdapter);
registry.register('youtube', YouTubeAdapter);

// Get adapter for artist
const adapter = await registry.getAdapter('spotify', artistId);
const results = await adapter.search('album name');
```

---

## Media Types

The `tracks.media` array supports multiple providers:

```json
{
  "media": [
    { "type": "iframe", "origin": "youtube", "content": "https://youtube.com/embed/xyz" },
    {
      "type": "iframe",
      "origin": "spotify",
      "content": "https://open.spotify.com/embed/track/abc"
    },
    { "type": "audio", "origin": "upload", "content": "/uploads/track.mp3" }
  ]
}
```

Future adapters can auto-populate the `media` array when an artist connects their Spotify/YouTube account.

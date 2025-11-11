# Minecraft Store Redirect

> Tiny **Node.js/Express** service that turns clean HTTP links into deep links for the **Minecraft Bedrock** client, e.g. `/StoreOffer/<itemId>` → `minecraft://openStore?showStoreOffer=<itemId>`.

[![Runtime](https://img.shields.io/badge/runtime-Node.js_18%2B-339933?logo=node.js)](#)
[![Framework](https://img.shields.io/badge/framework-Express-000?logo=express)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)

Repo: `https://github.com/Daniel-Ric/Minecraft-Store-Redirect`

---

## Table of Contents

* [Overview](#overview)
* [Routes](#routes)
* [Quickstart](#quickstart)
* [Configuration](#configuration)
* [Usage Examples](#usage-examples)
* [Deployment](#deployment)

  * [Docker](#docker)
  * [Reverse Proxy (optional)](#reverse-proxy-optional)
* [Security Notes](#security-notes)
* [FAQ](#faq)
* [License](#license)

---

## Overview

This service exposes two endpoints that **redirect** to the Minecraft deep-link URL scheme:

* Store offer: `minecraft://openStore?showStoreOffer=<itemId>`
* Dressing Room offer: `minecraft://openStore/?showDressingRoomOffer=<itemId>`

It also sets a permissive CORS header (`Access-Control-Allow-Origin: *`) so links can be generated from any front-end without preflight issues.

> ⚠️ Deep links only work on devices/platforms where the `minecraft://` URL scheme is registered (e.g., Minecraft Bedrock installed).

---

## Routes

| Method | Path                         | Description                             | Redirect target                                        |
| -----: | ---------------------------- | --------------------------------------- | ------------------------------------------------------ |
|    GET | `/StoreOffer/:itemId`        | Open a specific marketplace store offer | `minecraft://openStore?showStoreOffer=:itemId`         |
|    GET | `/DressingRoomOffer/:itemId` | Open a specific dressing room offer     | `minecraft://openStore/?showDressingRoomOffer=:itemId` |

---

## Quickstart

```bash
# 1) Clone
git clone https://github.com/Daniel-Ric/Minecraft-Store-Redirect
cd Minecraft-Store-Redirect

# 2) Install deps
npm ci

# 3) Run
PORT=3000 node index.js
# or (if you use the snippet below as index.js)
```

By default it listens on `http://localhost:3000`.

**Minimal server code (for reference):**

```js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((_, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  next();
});

app.get('/StoreOffer/:itemId', (req, res) => {
  res.redirect(`minecraft://openStore?showStoreOffer=${req.params.itemId}`);
});

app.get('/DressingRoomOffer/:itemId', (req, res) => {
  res.redirect(`minecraft://openStore/?showDressingRoomOffer=${req.params.itemId}`);
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
```

---

## Configuration

| Env var | Default | Description                  |
| ------- | ------: | ---------------------------- |
| `PORT`  |  `3000` | Port to bind the HTTP server |

No other configuration is required.

---

## Usage Examples

### Open a store offer

```bash
# Replace <ITEM_ID> with a real offer ID
curl -i "http://localhost:3000/StoreOffer/<ITEM_ID>"
```

**What happens:** the server responds `302 Found` with
`Location: minecraft://openStore?showStoreOffer=<ITEM_ID>`

### Open a dressing room offer

```bash
curl -i "http://localhost:3000/DressingRoomOffer/<ITEM_ID>"
```

**What happens:** the server responds `302 Found` with
`Location: minecraft://openStore/?showDressingRoomOffer=<ITEM_ID>`

### From a web page

```html
<a href="https://your-domain.example/StoreOffer/12345678">Open in Minecraft</a>
```

If the device has Minecraft Bedrock installed, the OS should offer to open the app.

---

## Deployment

### Docker

**Dockerfile**

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY . .
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["node","index.js"]
```

**Build & run**

```bash
docker build -t mc-store-redirect .
docker run -p 3000:3000 --name mc-redirect mc-store-redirect
```

### Reverse Proxy (optional)

Example **Nginx** snippet:

```nginx
server {
  listen 80;
  server_name redirect.example.com;

  location / {
    proxy_pass         http://127.0.0.1:3000;
    proxy_set_header   Host $host;
    proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header   X-Forwarded-Proto $scheme;
  }
}
```

---

## Security Notes

* CORS is wide-open by design (`*`). If you need to restrict, change it to an allow-list.
* The service performs **no validation** on `itemId` and simply injects it into the deep link. If you expose this publicly, consider:

  * Allow-listing patterns for `itemId` (e.g., `^[A-Za-z0-9_-]+$`)
  * Adding basic logging/rate limiting if abuse is a concern.

---

## FAQ

**Does this work on desktop?**
It depends on whether the `minecraft://` scheme is registered on that OS and account. It’s most reliable on platforms with the Bedrock client installed and registered.

**Can I customize the paths or query names?**
Yes—adjust the two route handlers to emit the deep-link format you need.

**Can I use 301 instead of 302?**
Sure, replace `res.redirect(url)` with `res.redirect(301, url)` if you want permanent redirects.

---

## License

**APACHE 2.0** — see [LICENSE](./LICENSE).

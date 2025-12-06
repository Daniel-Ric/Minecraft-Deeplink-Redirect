# Minecraft Bedrock Deeplink Redirect

> Tiny **Node.js/Express** service that turns clean HTTP links into deep links for the **Minecraft Bedrock** client  
> (e.g. `/StoreOffer/<itemId>` → `minecraft://openStore?showStoreOffer=<itemId>`).

[![Runtime](https://img.shields.io/badge/runtime-Node.js_18%2B-339933?logo=node.js)](#)
[![Framework](https://img.shields.io/badge/framework-Express-000?logo=express)](#)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue)](#)

Repo: `https://github.com/Daniel-Ric/Minecraft-Store-Redirect`

---

## Why?

Minecraft Bedrock supports a **`minecraft://` URL scheme** that can:

- Open marketplace offers or the store home
- Jump into profile / dressing room and “How to Play”
- Add external servers or directly connect to them
- Join Realms, gatherings/events, and load local worlds
- Execute a slash command in context

However, these URLs:

- Are not officially documented
- Are sometimes platform-dependent
- Are awkward to use directly in frontends

This project gives you a **tiny HTTP façade**:

- Frontend / launcher / bot calls **simple HTTPS URLs**
- Service responds with a **302 redirect** to the `minecraft://…` deeplink
- The OS hands control over to the Minecraft Bedrock client

---

## Features

- 🌐 Simple REST-style routes → `minecraft://` deeplinks
- 🧱 Supports a curated set of **Bedrock deeplinks** (store, UI, servers, realms, events, commands)
- 🔄 Zero state: no database, no sessions, just redirects
- 🚀 Ready for Docker, reverse proxy, or serverless setups
- 🔒 CORS allowed for all origins by default (easy integration with any frontend)

> ⚠️ Deep links only work on devices/platforms where the **`minecraft://` URL scheme is registered**
> (i.e. Minecraft Bedrock installed and associated with the scheme).

---

## Routes

### 1. Store & Dressing Room

| Method | Path                          | Description                             | Redirect target                                        |
|-------:|-------------------------------|-----------------------------------------|--------------------------------------------------------|
|    GET | `/StoreOffer/:itemId`         | Open a specific marketplace store offer | `minecraft://openStore?showStoreOffer=:itemId`         |
|    GET | `/DressingRoomOffer/:itemId`  | Open a specific dressing room offer     | `minecraft://openStore/?showDressingRoomOffer=:itemId` |
|    GET | `/StoreHome`                  | Open the store home                     | `minecraft://openStore`                                |
|    GET | `/MineCoinOffers`             | Open Minecoin purchase offers           | `minecraft://?showMineCoinOffers=1`                    |
|    GET | `/MarketplaceInventory/:type` | Open marketplace inventory view         | `minecraft://?openMarketplaceInventory=:type`          |

**`/MarketplaceInventory/:type`** currently accepts values such as:

- `Owned`
- `RealmsPlusCurrent`
- `RealmsPlusRemoved`
- `Subscriptions`

(Unsupported values are simply passed through to Minecraft; behaviour may differ per client version.)

---

### 2. UI / Profile / Help

| Method | Path             | Description                       | Redirect target                      |
|-------:|------------------|-----------------------------------|--------------------------------------|
|    GET | `/ProfileScreen` | Open the Minecraft profile screen | `minecraft://showProfileScreen`      |
|    GET | `/HowToPlay`     | Open the “How to Play” screen     | `minecraft://?showHowToPlayScreen=1` |

---

### 3. Servers & Local Worlds

| Method | Path                                  | Description                                 | Redirect target                                           |
|-------:|---------------------------------------|---------------------------------------------|-----------------------------------------------------------|
|    GET | `/AddExternalServer`                  | Add an external server                      | `minecraft://?addExternalServer=<name>\|<address>:<port>` |
|    GET | `/ConnectServer`                      | Connect to a specific server                | `minecraft://connect/?serverUrl=<url>&serverPort=<port>`  |
|    GET | `/ConnectLocalWorldByName/:worldName` | Load a local world by its display name      | `minecraft://connect/?localWorld=:worldName`              |
|    GET | `/ConnectLocalWorldById/:levelId`     | Load a local world by its internal level ID | `minecraft://?load=:levelId`                              |

**Query parameters**

- `/AddExternalServer`
    - `name` (optional, string) – display name in the server list
    - `address` (required, string) – hostname or IP
    - `port` (optional, number, default `19132`) – Bedrock server port

- `/ConnectServer`
    - `serverUrl` (required, string) – hostname or IP
    - `serverPort` (optional, number, default `19132`) – server port

---

### 4. Realms & Gatherings

| Method | Path                              | Description                          | Redirect target                                      |
|-------:|-----------------------------------|--------------------------------------|------------------------------------------------------|
|    GET | `/AcceptRealmInvite/:inviteId`    | Accept a Realms invite               | `minecraft://acceptRealmInvite?inviteID=:inviteId`   |
|    GET | `/ConnectRealmById/:realmId`      | Connect to a Realm by its numeric ID | `minecraft://connectToRealm?realmId=:realmId`        |
|    GET | `/ConnectRealmByInvite/:inviteId` | Connect to a Realm using invite code | `minecraft://connectToRealm?inviteID=:inviteId`      |
|    GET | `/JoinGathering/:gatheringId`     | Join a gathering / in‑game event     | `minecraft://joinGathering?gatheringId=:gatheringId` |

---

### 5. Utility

| Method | Path            | Description                                      | Redirect target                       |
|-------:|-----------------|--------------------------------------------------|---------------------------------------|
|    GET | `/SlashCommand` | Execute a slash command (in the current context) | `minecraft://?slashcommand=<command>` |

**Query parameters**

- `/SlashCommand`
    - `command` (required, string) – full command, e.g. `/gamemode creative`  
      (will be URL-encoded by the service)

> ⚠️ The behaviour of deeplinks like `?slashcommand=` is subject to change between
> client versions and may depend on the current game/UI state.

---

## Quickstart

```bash
# 1) Clone
git clone https://github.com/Daniel-Ric/Minecraft-Store-Redirect
cd Minecraft-Store-Redirect

# 2) Install dependencies
npm ci

# 3) Run
PORT=3000 node server.js
# or simply:
node server.js
```

By default the server listens on:  
`http://localhost:3000`

---

## Server Code (Reference)

```js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

app.get('/StoreOffer/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const minecraftUrl = `minecraft://openStore?showStoreOffer=${itemId}`;
    res.redirect(minecraftUrl);
});

app.get('/DressingRoomOffer/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const minecraftUrl = `minecraft://openStore/?showDressingRoomOffer=${itemId}`;
    res.redirect(minecraftUrl);
});

app.get('/StoreHome', (req, res) => {
    const minecraftUrl = 'minecraft://openStore';
    res.redirect(minecraftUrl);
});

app.get('/MineCoinOffers', (req, res) => {
    const minecraftUrl = 'minecraft://?showMineCoinOffers=1';
    res.redirect(minecraftUrl);
});

app.get('/MarketplaceInventory/:type', (req, res) => {
    const type = req.params.type;
    const minecraftUrl = `minecraft://?openMarketplaceInventory=${type}`;
    res.redirect(minecraftUrl);
});

app.get('/ProfileScreen', (req, res) => {
    const minecraftUrl = 'minecraft://showProfileScreen';
    res.redirect(minecraftUrl);
});

app.get('/HowToPlay', (req, res) => {
    const minecraftUrl = 'minecraft://?showHowToPlayScreen=1';
    res.redirect(minecraftUrl);
});

app.get('/AddExternalServer', (req, res) => {
    const name = req.query.name || '';
    const address = req.query.address || '';
    const port = req.query.port || '19132';
    const value = `${encodeURIComponent(name)}|${address}:${port}`;
    const minecraftUrl = `minecraft://?addExternalServer=${value}`;
    res.redirect(minecraftUrl);
});

app.get('/ConnectServer', (req, res) => {
    const serverUrl = req.query.serverUrl || '';
    const serverPort = req.query.serverPort || '19132';
    const minecraftUrl = `minecraft://connect/?serverUrl=${encodeURIComponent(serverUrl)}&serverPort=${serverPort}`;
    res.redirect(minecraftUrl);
});

app.get('/ConnectLocalWorldByName/:worldName', (req, res) => {
    const worldName = req.params.worldName;
    const minecraftUrl = `minecraft://connect/?localWorld=${encodeURIComponent(worldName)}`;
    res.redirect(minecraftUrl);
});

app.get('/ConnectLocalWorldById/:levelId', (req, res) => {
    const levelId = req.params.levelId;
    const minecraftUrl = `minecraft://?load=${encodeURIComponent(levelId)}`;
    res.redirect(minecraftUrl);
});

app.get('/AcceptRealmInvite/:inviteId', (req, res) => {
    const inviteId = req.params.inviteId;
    const minecraftUrl = `minecraft://acceptRealmInvite?inviteID=${inviteId}`;
    res.redirect(minecraftUrl);
});

app.get('/ConnectRealmById/:realmId', (req, res) => {
    const realmId = req.params.realmId;
    const minecraftUrl = `minecraft://connectToRealm?realmId=${realmId}`;
    res.redirect(minecraftUrl);
});

app.get('/ConnectRealmByInvite/:inviteId', (req, res) => {
    const inviteId = req.params.inviteId;
    const minecraftUrl = `minecraft://connectToRealm?inviteID=${inviteId}`;
    res.redirect(minecraftUrl);
});

app.get('/JoinGathering/:gatheringId', (req, res) => {
    const gatheringId = req.params.gatheringId;
    const minecraftUrl = `minecraft://joinGathering?gatheringId=${gatheringId}`;
    res.redirect(minecraftUrl);
});

app.get('/SlashCommand', (req, res) => {
    const command = req.query.command || '';
    const minecraftUrl = `minecraft://?slashcommand=${encodeURIComponent(command)}`;
    res.redirect(minecraftUrl);
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});
```

---

## Configuration

| Env var | Default | Description                  |
|---------|--------:|------------------------------|
| `PORT`  |  `3000` | Port to bind the HTTP server |

No other configuration is required.

---

## Usage Examples

### Open a store offer

```bash
# Replace <ITEM_ID> with a real offer ID
curl -i "http://localhost:3000/StoreOffer/<ITEM_ID>"
```

Response (simplified):

```http
HTTP/1.1 302 Found
Location: minecraft://openStore?showStoreOffer=<ITEM_ID>
```

### Open a dressing room offer

```bash
curl -i "http://localhost:3000/DressingRoomOffer/<ITEM_ID>"
```

```http
HTTP/1.1 302 Found
Location: minecraft://openStore/?showDressingRoomOffer=<ITEM_ID>
```

### Open the store home

```bash
curl -i "http://localhost:3000/StoreHome"
```

```http
HTTP/1.1 302 Found
Location: minecraft://openStore
```

### Add an external server

```bash
curl -i "http://localhost:3000/AddExternalServer?name=MyServer&address=example.com&port=19132"
```

Resulting deeplink (pretty printed):

```text
minecraft://?addExternalServer=MyServer%7Cexample.com:19132
```

### Connect directly to a server

```bash
curl -i "http://localhost:3000/ConnectServer?serverUrl=play.example.com&serverPort=19132"
```

```http
Location: minecraft://connect/?serverUrl=play.example.com&serverPort=19132
```

### Accept a Realm invite

```bash
curl -i "http://localhost:3000/AcceptRealmInvite/ABCDEF123456"
```

```http
Location: minecraft://acceptRealmInvite?inviteID=ABCDEF123456
```

### Execute a slash command

```bash
curl -i "http://localhost:3000/SlashCommand?command=/gamemode%20creative"
```

```http
Location: minecraft://?slashcommand=/gamemode%20creative
```

### From a web page

```html
<a href="https://your-domain.example/StoreOffer/12345678">
    Open in Minecraft
</a>
```

If the device has Minecraft Bedrock installed, the OS should offer to open the app.

---

## Platform Notes & Caveats

- These deeplinks are **not officially documented by Mojang/Microsoft** and are gathered from community knowledge and
  client behaviour.
- Behaviour may differ between:
    - Minecraft versions
    - Platforms (Windows, mobile, console)
    - Whether the game is currently open/closed
- Links like `?slashcommand=` or realm/gathering joins may require:
    - A valid user session
    - Proper permissions on the world/realm

Test deeplinks carefully before using them in production or sharing them widely.

---

## Security & Hardening

The service is intentionally minimal and does **no input validation** by default.

For public deployments you should consider:

- Restricting allowed origins instead of `Access-Control-Allow-Origin: *`
- Sanitising / validating:
    - `itemId`, `realmId`, `gatheringId`, `worldName`, etc.
    - `command` (for `/SlashCommand`)
- Adding:
    - Basic rate limiting
    - Logging and monitoring
    - Optional authentication (API keys, JWT, etc.) in front of this service

Because the final target is always a `minecraft://` URL, classic web vulnerabilities (like XSS) are less critical here,
but **malicious or unexpected deeplinks** could still confuse players.

---

## Extending

You can easily add your own routes:

1. Identify a working `minecraft://` deeplink in your environment
2. Add an Express route that builds that URL
3. `res.redirect(minecraftUrl)`

Example skeleton:

```js
app.get('/MyCustomRoute', (req, res) => {
    const minecraftUrl = 'minecraft://somePathOrQuery';
    res.redirect(minecraftUrl);
});
```

Feel free to open an issue or PR with new deeplinks that you have verified.

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
CMD ["node","server.js"]
```

**Build & run**

```bash
docker build -t mc-bedrock-deeplink-redirect .
docker run -p 3000:3000 --name mc-redirect mc-bedrock-deeplink-redirect
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

## FAQ

### Does this work on desktop?

It depends on whether the `minecraft://` scheme is registered on that OS and account.  
It’s most reliable on platforms with the Bedrock client installed and associated with the scheme.

### Can I customize the paths or query names?

Yes. The HTTP paths (`/StoreOffer/...`, `/ConnectServer`, …) are just Express routes – you can rename,
add, or remove them as you like as long as you generate the desired `minecraft://` target.

### Can I use 301 instead of 302?

Yes. Replace `res.redirect(url)` with `res.redirect(301, url)` if you want permanent redirects
(e.g. for SEO or caching reasons). For testing and development, `302` is usually fine.

### Are you affiliated with Mojang or Microsoft?

No. This is an independent community project.  
All trademarks are property of their respective owners.

---

## License

**Apache 2.0** — see [LICENSE](./LICENSE).

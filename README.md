# Minecraft Bedrock Deeplink Redirect

> Tiny **Node.js/Express** service that turns clean HTTP links into deep links for the **Minecraft: Bedrock Edition** client
> (for example, `/StoreOffer/<itemId>` → `minecraft://openStore?showStoreOffer=<itemId>`).

[![Runtime](https://img.shields.io/badge/runtime-Node.js_18%2B-339933?logo=node.js)](https://nodejs.org/)
[![Framework](https://img.shields.io/badge/framework-Express_5-000000?logo=express)](https://expressjs.com/)
[![License](https://img.shields.io/badge/license-Apache_2.0-blue)](./LICENSE)

*Repository: [github.com/Daniel-Ric/Minecraft-Deeplink-Redirect](https://github.com/Daniel-Ric/Minecraft-Deeplink-Redirect)*

## Why?

Minecraft Bedrock supports a **`minecraft://` URL scheme** that can:

- Open Marketplace pages, offers, inventory, and Marketplace Pass screens
- Jump into the Dressing Room, profile, help topics, or the Servers tab
- Add or connect to servers and load locally stored worlds
- Open Realms, Realms Stories, experiences, gatherings, and events
- Import worlds, packs, add-ons, and templates
- Execute a slash command in the current game context

These deep links are useful, but they are awkward to place directly in websites,
bots, launchers, and other integrations. Some are officially documented, while
others are based on current client behaviour or binary inspection.

This project provides a small HTTP façade:

- A frontend, launcher, or bot calls a clean **HTTP/HTTPS URL**
- The service responds with a **302 redirect** to a `minecraft://` URI
- The operating system hands the URI to the installed Minecraft client

---

## Features

- 🌐 Simple REST-style routes that produce `minecraft://` deep links
- 🧱 Marketplace, UI, servers, worlds, Realms, events, and content imports
- 🔎 Required-parameter, enum, and port validation
- 🔐 URI-component encoding for values placed in redirect targets
- 🔄 Stateless operation with no database, sessions, or persistent storage
- 🚀 Suitable for Docker, reverse proxies, or a small Node.js host
- 🔗 CORS enabled for all origins by default

> ⚠️ Deep links only work on devices where Minecraft Bedrock is installed and the
> **`minecraft://` scheme is registered**. Microsoft describes these handlers as
> internal functionality that may change or fail silently between client releases.

---

## Quickstart

### Requirements

- Node.js 18 or newer
- npm

### Install and run

```bash
git clone https://github.com/Daniel-Ric/Minecraft-Deeplink-Redirect.git
cd Minecraft-Deeplink-Redirect
npm ci
npm start
```

The service listens on `http://localhost:3000` by default.

Use a different port when needed:

```bash
PORT=8080 npm start
```

PowerShell:

```powershell
$env:PORT = 8080
npm start
```

---

## Routes

### Route status

- **Documented** — present in the current Microsoft reference
- **Observed** — found through client testing or binary inspection
- **Deprecated** — retained for compatibility, but should not be used for new integrations

### 1. Marketplace & Dressing Room

| Method | Path | Description | Redirect target | Status |
|------:|---|---|---|---|
| GET | `/StoreOffer/:itemId` | Open a Marketplace offer | `minecraft://openStore?showStoreOffer=:itemId` | Documented |
| GET | `/OfferCollection/:offerId` | Open an offer collection for an item/offer ID | `minecraft://?showOfferCollection=:offerId` | Observed |
| GET | `/MarketplacePage/:pageId` | Open a Marketplace page or layout | `minecraft://?getLayoutPage=:pageId` | Documented |
| GET | `/DressingRoomOffer/:itemId` | Open a selected Dressing Room offer | `minecraft://showDressingRoomOffer?offerID=:itemId` | Documented/observed |
| GET | `/StoreHome` | Open the Marketplace home | `minecraft://openStore` | Documented |
| GET | `/StoreHomeScreen` | Open the Marketplace home through the query handler | `minecraft://?showStoreHomeScreen=1` | Observed |
| GET | `/MineCoinOffers` | Open the Minecoin purchase modal | `minecraft://?showMineCoinOffers=1` | Observed |
| GET | `/MarketplaceInventory/:type` | Open a Marketplace inventory tab | `minecraft://?openMarketplaceInventory=:type` | Deprecated |
| GET | `/MarketplacePass/:tab` | Open a Marketplace Pass screen | `minecraft://?openCsbPDPScreen=:tab` | Documented |

**Marketplace parameters**

- `/MarketplaceInventory/:type`
  - `Owned`
  - `RealmsPlusCurrent`
  - `RealmsPlusRemoved`
  - `Subscriptions`
- `/MarketplacePass/:tab`
  - `Home`
  - `Content`
  - `Faq`
  - `Subscribe`

Use `MarketplacePage` rather than `OfferCollection` for document and page IDs.
One observed Marketplace root-page ID is `MultiItemPage_StoreRoot`:

```text
http://localhost:3000/MarketplacePage/MultiItemPage_StoreRoot
→ minecraft://?getLayoutPage=MultiItemPage_StoreRoot
```

Microsoft calls the Dressing Room parameter `offerID` in the description but
uses `offerId` in its example. This project retains the client-observed
`offerID` spelling.

---

### 2. UI, Profile & Help

| Method | Path | Description | Redirect target | Status |
|------:|---|---|---|---|
| GET | `/ProfileScreen` | Open the Persona Dressing Room | `minecraft://showProfileScreen` | Documented |
| GET | `/HowToPlay` | Open the legacy How-to-Play screen | `minecraft://?showHowToPlayScreen=1` | Observed legacy form |
| GET | `/HowToPlay/:topic` | Open a specific How-to-Play topic | `minecraft://?showHowToPlayScreen=:topic` | Documented |
| GET | `/ServersTab` | Open Play with the Servers tab selected | `minecraft://openServersTab` | Documented |

Documented How-to-Play topics include `crafting_table`, `commands`,
`multiplayer`, `realms`, `servers`, and `the_store`. Unknown topic values are
passed to Minecraft and may fail silently.

---

### 3. Servers & Local Worlds

| Method | Path | Description | Redirect target | Status |
|------:|---|---|---|---|
| GET | `/AddExternalServer` | Add an external server to the server list | `minecraft://?addExternalServer=<name>\|<address>:<port>` | Documented |
| GET | `/ConnectServer` | Connect directly to a Bedrock server | `minecraft://connect/?serverUrl=<url>&serverPort=<port>` | Documented/client-tested |
| GET | `/ConnectWorldByToken` | Connect using a JSON deep-link token | `minecraft://connect?deeplinkToken=<token>` | Documented |
| GET | `/ConnectLocalWorldById/:levelId` | Load a locally stored world by level ID | `minecraft://?load=:levelId` | Documented |

**Query parameters**

- `/AddExternalServer`
  - `name` — required display name
  - `address` — required hostname or IP address
  - `port` — optional port, defaults to `19132`
- `/ConnectServer`
  - `serverUrl` — required hostname or IP address
  - `serverPort` — optional port, defaults to `19132`
- `/ConnectWorldByToken`
  - `deeplinkToken` — required JSON token; its schema is not publicly documented

Ports must be integers between `1` and `65535`.

`ConnectServer` is intentionally retained. The generated
`minecraft://connect/?serverUrl=...&serverPort=...` form is client-tested, and
Microsoft continues to document the `connect`, `serverUrl`, and `serverPort`
handlers.

The former `ConnectLocalWorldByName` route is no longer exposed because the
newer client comparison no longer contains `localWorld`. Loading by local ID
continues to use the documented `load` argument.

---

### 4. Realms, Experiences & Events

| Method | Path | Description | Redirect target | Status |
|------:|---|---|---|---|
| GET | `/AcceptRealmInvite/:inviteId` | Accept a Realm invitation code | `minecraft://acceptRealmInvite?inviteID=:inviteId` | Documented |
| GET | `/ConnectRealmById/:realmId` | Connect to a Realm by ID | `minecraft://connectToRealm?realmId=:realmId` | Documented |
| GET | `/ConnectRealmByInvite/:inviteId` | Connect using a Realm invite code | `minecraft://connectToRealm?inviteID=:inviteId` | Observed legacy form |
| GET | `/OpenRealmsStories/:realmId` | Open Realms Stories | `minecraft://openRealmsStories?realmId=:realmId` | Documented |
| GET | `/JoinExperience/:experienceId` | Join an experience, gathering, or event | `minecraft://joinExperience?experienceId=:experienceId` | Documented |
| GET | `/JoinGathering/:gatheringId` | Join a gathering through the old handler | `minecraft://joinGathering?gatheringId=:gatheringId` | Deprecated |

`JoinExperience` also accepts two optional query parameters:

- `worldId` — world UUID to join
- `friendID` — friend ID to join with

```text
/JoinExperience/<experienceId>?worldId=<worldId>&friendID=<friendId>
```

> ⚠️ Microsoft marks `joinGathering` as deprecated. Use `JoinExperience` for all
> new integrations.

---

### 5. Content Imports

| Method | Path | Description | Redirect target | Status |
|------:|---|---|---|---|
| GET | `/Import?path=<path>` | Import a world or project | `minecraft://?import=<path>` | Documented |
| GET | `/ImportLoad?path=<path>` | Import and load content | `minecraft://?importload=<path>` | Observed |
| GET | `/ImportPack?path=<path>` | Import a resource or behaviour pack | `minecraft://?importpack=<path>&fromtempfile=1` | Observed |
| GET | `/ImportAddon?path=<path>` | Import an add-on | `minecraft://?importaddon=<path>&fromtempfile=1` | Documented/observed |
| GET | `/ImportTemplate?path=<path>` | Import a world template | `minecraft://?importtemplate=<path>&fromtempfile=1` | Observed |

The service adds `fromtempfile=1` to pack, add-on, and template imports because
recent clients otherwise appear to fail silently. Microsoft also documents
`fromtempfile` as an optional companion to `import*` arguments.

Microsoft labels its add-on section `importaddon` but uses `import` in the
example. This project retains the client-observed `importaddon` parameter.

The supplied path must be accessible to the device on which Minecraft runs.
It is not a path on the redirect server. URL-encode Windows paths when building
the HTTP request.

---

### 6. Utility

| Method | Path | Description | Redirect target | Status |
|------:|---|---|---|---|
| GET | `/SlashCommand` | Execute a command in the current game context | `minecraft://?slashcommand=<command>` | Observed |

**Query parameters**

- `/SlashCommand`
  - `command` — required command string, for example `/gamemode creative`

> ⚠️ This handler can execute a command on the current server. It may disconnect
> the client when invoked from a local world. Never build command links from
> untrusted input without additional restrictions.

---

## Intentionally Not Exposed

- `oculus_launched` was removed from the newer client comparison.
- `localWorld` and `localLevelId` are not emitted; local ID loading uses `load`.
- `fromtempfile` is a helper argument rather than a standalone action.
- `originalpath` remains undocumented and its input contract is unknown.

---

## Configuration

| Environment variable | Default | Description |
|---|---:|---|
| `PORT` | `3000` | HTTP port on which the Express service listens |

No other configuration is required.

---

## Usage Examples

### Open a Marketplace offer

```bash
curl -i "http://localhost:3000/StoreOffer/Internal_Realms2pSubscription"
```

```http
HTTP/1.1 302 Found
Location: minecraft://openStore?showStoreOffer=Internal_Realms2pSubscription
```

### Open a Marketplace page

```bash
curl -i "http://localhost:3000/MarketplacePage/MultiItemPage_StoreRoot"
```

```http
HTTP/1.1 302 Found
Location: minecraft://?getLayoutPage=MultiItemPage_StoreRoot
```

### Connect directly to a server

```bash
curl -i "http://localhost:3000/ConnectServer?serverUrl=play.example.com&serverPort=19132"
```

```http
HTTP/1.1 302 Found
Location: minecraft://connect/?serverUrl=play.example.com&serverPort=19132
```

### Join an experience with optional context

```bash
curl -i "http://localhost:3000/JoinExperience/<EXPERIENCE_ID>?worldId=<WORLD_ID>&friendID=<FRIEND_ID>"
```

```http
HTTP/1.1 302 Found
Location: minecraft://joinExperience?experienceId=<EXPERIENCE_ID>&worldId=<WORLD_ID>&friendID=<FRIEND_ID>
```

### Import an add-on

```bash
curl -i "http://localhost:3000/ImportAddon?path=C%3A%5CDownloads%5Cexample.mcaddon"
```

```http
HTTP/1.1 302 Found
Location: minecraft://?importaddon=C%3A%5CDownloads%5Cexample.mcaddon&fromtempfile=1
```

### Use a redirect from a web page

```html
<a href="https://your-domain.example/StoreOffer/Internal_Realms2pSubscription">
    Open in Minecraft
</a>
```

If the device has Minecraft Bedrock installed, the operating system should offer
to open the link in the game.

---

## Server Code Reference

The complete implementation lives in [`server.js`](./server.js). It exports the
Express application, so it can also be mounted or started by another Node.js
entry point:

```js
const app = require('./server');

const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
```

The default entry point already starts the service when you run `npm start` or
`node server.js`.

---

## Platform Notes & Caveats

- Behaviour can differ between Minecraft releases and platforms.
- A valid Microsoft/Xbox session may be required for Marketplace, Realm, and event routes.
- Many handlers fail silently when supplied an unknown argument or invalid ID.
- Deep links may behave differently depending on whether Minecraft is closed,
  already running, or currently inside a world.
- Marketplace page IDs and `deeplinkToken` contents are not publicly documented.
- `openMarketplaceInventory` and `joinGathering` are deprecated.

Sources:

- [Microsoft Learn: Deep Link Handlers](https://learn.microsoft.com/de-de/minecraft/creator/reference/content/deep-links?view=minecraft-bedrock-stable)
- [Community reverse-engineering list](https://github.com/phasephasephase/MCBEProtocolURIs)

Verify every deep link against the Minecraft versions and platforms you intend
to support.

---

## Security & Hardening

The service validates required query values, known Marketplace enum values, and
port ranges. Redirect values are URI-component encoded, and every generated
target is built with the `minecraft://` scheme.

For a public deployment, also consider:

- Restricting `Access-Control-Allow-Origin` instead of allowing `*`
- Applying stricter validation to item IDs, Realm IDs, experience IDs, and file paths
- Allow-listing safe commands or removing `/SlashCommand`
- Adding rate limiting, request logging, and monitoring
- Placing authentication or an API gateway in front of sensitive routes
- Serving the HTTP endpoint through HTTPS

---

## Extending

Add another Express route in `server.js` and pass its command and arguments to
the existing redirect helper:

```js
app.get('/MyCustomRoute/:value', (req, res) => {
    minecraftRedirect(res, 'someCommand', { argument: req.params.value });
});
```

Only expose deep links whose current behaviour and input contract you understand.

---

## Deployment

### Docker

Create a `Dockerfile` with:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY server.js ./
ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000
CMD ["npm", "start"]
```

Build and run it:

```bash
docker build -t minecraft-deeplink-redirect .
docker run --rm -p 3000:3000 --name minecraft-deeplink-redirect minecraft-deeplink-redirect
```

### Reverse proxy

Example Nginx configuration:

```nginx
server {
    listen 80;
    server_name redirect.example.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## FAQ

### Does this work on desktop and mobile?

It works wherever Minecraft Bedrock registers the `minecraft://` URI scheme.
Exact support and behaviour depend on the platform and client version.

### Why does an endpoint return `400`?

The request is missing a required parameter, contains an unsupported enum value,
or supplies a port outside the valid `1`–`65535` range.

### Why does Minecraft open without showing the requested screen?

The handler may have changed, the supplied ID may be invalid, or the current
platform/client state may not support that action. Minecraft often reports no
visible error for invalid deep-link values.

### Can the HTTP paths be renamed?

Yes. The HTTP route names are part of this service, not Minecraft. The generated
`minecraft://` target and its parameter names are the parts interpreted by the game.

### Can redirects use status `301` instead of `302`?

They can, but permanent redirects are cached aggressively. Status `302` is safer
for handlers that may change between Minecraft versions.

### Are you affiliated with Mojang or Microsoft?

No. This is an independent community project. All trademarks belong to their
respective owners.

---

## License

**Apache 2.0** — see [LICENSE](./LICENSE).

# Minecraft Bedrock Deeplink Redirect

Small Node.js/Express service that converts clean HTTP endpoints into
`minecraft://` deep links for Minecraft: Bedrock Edition.

> Deep-link handlers are internal Minecraft features. They can change or fail
> silently between client releases. The route list below was refreshed against
> the Microsoft reference current through May 3, 2026 and recent Windows-client
> observations.

## Setup

Requirements: Node.js 18 or newer.

```bash
git clone https://github.com/Daniel-Ric/Minecraft-Deeplink-Redirect.git
cd Minecraft-Deeplink-Redirect
npm ci
npm start
```

The service listens on `http://localhost:3000` by default. Use `PORT` to choose
another port.

```bash
PORT=8080 npm start
```

Every successful endpoint responds with a temporary `302` redirect. Required
values and known enum values are validated; invalid requests return `400`.

## Routes

Status meanings:

- **Documented**: present in the current Microsoft reference.
- **Observed**: found through client testing or binary inspection, but not in the current reference.
- **Deprecated**: still exposed for compatibility, but a replacement should be preferred.

### Marketplace and Dressing Room

| HTTP route | Redirect target | Status |
|---|---|---|
| `/StoreOffer/:itemId` | `minecraft://openStore?showStoreOffer=:itemId` | Documented |
| `/OfferCollection/:offerId` | `minecraft://?showOfferCollection=:offerId` | Observed; now for item/offer IDs, not page IDs |
| `/MarketplacePage/:pageId` | `minecraft://?getLayoutPage=:pageId` | Documented; use this for Marketplace pages |
| `/DressingRoomOffer/:itemId` | `minecraft://showDressingRoomOffer?offerID=:itemId` | Documented/observed |
| `/StoreHome` | `minecraft://openStore` | Documented |
| `/StoreHomeScreen` | `minecraft://?showStoreHomeScreen=1` | Observed alternative |
| `/MineCoinOffers` | `minecraft://?showMineCoinOffers=1` | Observed |
| `/MarketplaceInventory/:type` | `minecraft://?openMarketplaceInventory=:type` | Deprecated |
| `/MarketplacePass/:tab` | `minecraft://?openCsbPDPScreen=:tab` | Documented |

`MarketplacePage` replaces the old use of `showOfferCollection` for document
and page IDs. One observed root-page ID is `MultiItemPage_StoreRoot`:

```text
http://localhost:3000/MarketplacePage/MultiItemPage_StoreRoot
→ minecraft://?getLayoutPage=MultiItemPage_StoreRoot
```

Allowed inventory types are `Owned`, `RealmsPlusCurrent`,
`RealmsPlusRemoved`, and `Subscriptions`. Allowed Marketplace Pass tabs are
`Home`, `Content`, `Faq`, and `Subscribe`.

Microsoft's text names the Dressing Room parameter `offerID`, while its example
uses `offerId`. This service retains the client-observed `offerID` form.

### UI and help

| HTTP route | Redirect target | Status |
|---|---|---|
| `/ProfileScreen` | `minecraft://showProfileScreen` | Documented |
| `/HowToPlay` | `minecraft://?showHowToPlayScreen=1` | Legacy default |
| `/HowToPlay/:topic` | `minecraft://?showHowToPlayScreen=:topic` | Documented |
| `/ServersTab` | `minecraft://openServersTab` | Documented |

The current handler accepts specific How-to-Play topics, for example
`crafting_table`, `commands`, `multiplayer`, `realms`, `servers`, or
`the_store`.

### Servers and local worlds

| HTTP route | Input | Redirect target | Status |
|---|---|---|---|
| `/AddExternalServer` | `name`, `address`, optional `port` | `minecraft://?addExternalServer=<name>\|<address>:<port>` | Documented |
| `/ConnectServer` | `serverUrl`, optional `serverPort` | `minecraft://connect/?serverUrl=<url>&serverPort=<port>` | Documented and client-tested |
| `/ConnectWorldByToken` | `deeplinkToken` | `minecraft://connect?deeplinkToken=<token>` | Documented; token format is not public |
| `/ConnectLocalWorldById/:levelId` | path parameter | `minecraft://?load=:levelId` | Documented |

Ports default to `19132` and must be between `1` and `65535`.

`ConnectServer` is intentionally retained: the exact URI above is still
client-tested, and the current Microsoft reference continues to list the
`connect` command with `serverUrl` and `serverPort`. The former
`/ConnectLocalWorldByName/:worldName` route was removed because the newer
client comparison no longer contains the `localWorld` argument. Loading by
local level ID remains available through `?load=`.

### Realms, experiences, and events

| HTTP route | Redirect target | Status |
|---|---|---|
| `/AcceptRealmInvite/:inviteId` | `minecraft://acceptRealmInvite?inviteID=:inviteId` | Documented |
| `/ConnectRealmById/:realmId` | `minecraft://connectToRealm?realmId=:realmId` | Documented |
| `/ConnectRealmByInvite/:inviteId` | `minecraft://connectToRealm?inviteID=:inviteId` | Observed legacy form |
| `/OpenRealmsStories/:realmId` | `minecraft://openRealmsStories?realmId=:realmId` | Documented |
| `/JoinExperience/:experienceId` | `minecraft://joinExperience?experienceId=:experienceId` | Documented |
| `/JoinGathering/:gatheringId` | `minecraft://joinGathering?gatheringId=:gatheringId` | Deprecated |

`JoinExperience` also passes optional `worldId` and `friendID` query
parameters:

```text
/JoinExperience/<experienceId>?worldId=<worldId>&friendID=<friendId>
```

Use `JoinExperience` for new integrations; Microsoft identifies it as the
replacement for `joinGathering`.

### Imports

| HTTP route | Redirect target | Status |
|---|---|---|
| `/Import?path=<path>` | `minecraft://?import=<path>` | Documented |
| `/ImportLoad?path=<path>` | `minecraft://?importload=<path>` | Observed |
| `/ImportPack?path=<path>` | `minecraft://?importpack=<path>&fromtempfile=1` | Observed |
| `/ImportAddon?path=<path>` | `minecraft://?importaddon=<path>&fromtempfile=1` | Documented/observed |
| `/ImportTemplate?path=<path>` | `minecraft://?importtemplate=<path>&fromtempfile=1` | Observed |

The service adds `fromtempfile=1` to pack, add-on, and template imports because
recent clients otherwise appear to fail silently. Microsoft also documents
`fromtempfile` as a supported optional companion to `import*` arguments.

Microsoft labels its add-on section `importaddon` but shows `import` in the
example. The service retains the client-observed `importaddon` parameter.

Paths must refer to files visible to the device on which Minecraft runs, not to
files on the redirect server. URL-encode Windows paths when constructing the
HTTP request.

### Utility

| HTTP route | Redirect target | Status |
|---|---|---|
| `/SlashCommand?command=<command>` | `minecraft://?slashcommand=<command>` | Observed |

This can execute a command in the current server context and may disconnect a
client that is in a local world. Treat links containing commands as untrusted
input.

### Intentionally not exposed

- `oculus_launched` was removed from the newer client comparison.
- `localWorld` and `localLevelId` are not emitted. Local ID loading uses the
  still-documented `load` argument instead.
- `fromtempfile` is a helper argument, not a standalone action; the relevant
  import routes add it automatically.
- `originalpath` remains undocumented and its input contract is unknown, so the
  service does not guess at an HTTP API for it.
- `connect`, `serverUrl`, and `serverPort` are the deliberate exception to the
  binary-removal notes because they are both client-tested and currently
  documented.

## Examples

```bash
curl -i "http://localhost:3000/StoreOffer/Internal_Realms2pSubscription"
curl -i "http://localhost:3000/MarketplacePass/Subscribe"
curl -i "http://localhost:3000/AddExternalServer?name=Example&address=play.example.com&port=19132"
curl -i "http://localhost:3000/ConnectServer?serverUrl=play.example.com&serverPort=19132"
```

Example response:

```http
HTTP/1.1 302 Found
Location: minecraft://connect/?serverUrl=play.example.com&serverPort=19132
```

## Compatibility and sources

- [Microsoft: Deep Link Handlers](https://learn.microsoft.com/minecraft/creator/reference/content/deep-links?view=minecraft-bedrock-stable)
- [Community reverse-engineering list](https://github.com/phasephasephase/MCBEProtocolURIs)

The Microsoft page itself warns that these handlers are primarily internal and
may be altered or removed. Test every link against the Minecraft versions and
platforms you support. This project is not affiliated with Mojang or Microsoft.

## License

Apache 2.0 — see [LICENSE](./LICENSE).

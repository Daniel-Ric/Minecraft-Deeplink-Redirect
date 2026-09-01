const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const MARKETPLACE_INVENTORY_TABS = new Set([
    'Owned',
    'RealmsPlusCurrent',
    'RealmsPlusRemoved',
    'Subscriptions',
]);
const MARKETPLACE_PASS_TABS = new Set(['Home', 'Content', 'Faq', 'Subscribe']);

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    next();
});

app.get('/StoreOffer/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const minecraftUrl = `minecraft://openStore?showStoreOffer=${itemId}`;
    res.redirect(minecraftUrl);
app.get('/StoreOffer/:itemId', (req, res) => {
    minecraftRedirect(res, 'openStore', { showStoreOffer: req.params.itemId });
});

app.get('/OfferCollection/:offerId', (req, res) => {
    minecraftRedirect(res, '', { showOfferCollection: req.params.offerId });
});

app.get('/MarketplacePage/:pageId', (req, res) => {
    minecraftRedirect(res, '', { getLayoutPage: req.params.pageId });
});

app.get('/DressingRoomOffer/:itemId', (req, res) => {
    minecraftRedirect(res, 'showDressingRoomOffer', { offerID: req.params.itemId });
});

app.get('/StoreHome', (req, res) => {
    minecraftRedirect(res, 'openStore');
});

app.get('/StoreHomeScreen', (req, res) => {
    minecraftRedirect(res, '', { showStoreHomeScreen: 1 });
});

app.get('/MineCoinOffers', (req, res) => {
    minecraftRedirect(res, '', { showMineCoinOffers: 1 });
});

app.get('/MarketplaceInventory/:type', (req, res) => {
    const { type } = req.params;
    if (!allowedValue(res, type, MARKETPLACE_INVENTORY_TABS, 'type')) return;

    minecraftRedirect(res, '', { openMarketplaceInventory: type });
});

app.get('/MarketplacePass/:tab', (req, res) => {
    const { tab } = req.params;
    if (!allowedValue(res, tab, MARKETPLACE_PASS_TABS, 'tab')) return;

    minecraftRedirect(res, '', { openCsbPDPScreen: tab });
});

app.get('/ProfileScreen', (req, res) => {
    minecraftRedirect(res, 'showProfileScreen');
});

app.get(['/HowToPlay', '/HowToPlay/:topic'], (req, res) => {
    minecraftRedirect(res, '', { showHowToPlayScreen: req.params.topic || 1 });
});

app.get('/ServersTab', (req, res) => {
    minecraftRedirect(res, 'openServersTab');
});

app.get('/AddExternalServer', (req, res) => {
    const name = requiredQuery(req, res, 'name');
    if (name === null) return;
    const address = requiredQuery(req, res, 'address');
    if (address === null) return;
    const port = typeof req.query.port === 'string' ? req.query.port : '19132';
    if (!validPort(res, port)) return;

    minecraftRedirect(res, '', { addExternalServer: `${name}|${address}:${port}` });
});

app.get('/ConnectServer', (req, res) => {
    const serverUrl = requiredQuery(req, res, 'serverUrl');
    if (serverUrl === null) return;
    const serverPort = typeof req.query.serverPort === 'string' ? req.query.serverPort : '19132';
    if (!validPort(res, serverPort)) return;

    minecraftRedirect(res, 'connect/', { serverUrl, serverPort });
});

app.get('/ConnectWorldByToken', (req, res) => {
    const deeplinkToken = requiredQuery(req, res, 'deeplinkToken');
    if (deeplinkToken === null) return;

    minecraftRedirect(res, 'connect', { deeplinkToken });
});

app.get('/ConnectLocalWorldById/:levelId', (req, res) => {
    minecraftRedirect(res, '', { load: req.params.levelId });
});

app.get('/AcceptRealmInvite/:inviteId', (req, res) => {
    minecraftRedirect(res, 'acceptRealmInvite', { inviteID: req.params.inviteId });
});

app.get('/ConnectRealmById/:realmId', (req, res) => {
    minecraftRedirect(res, 'connectToRealm', { realmId: req.params.realmId });
});

app.get('/ConnectRealmByInvite/:inviteId', (req, res) => {
    minecraftRedirect(res, 'connectToRealm', { inviteID: req.params.inviteId });
});

app.get('/OpenRealmsStories/:realmId', (req, res) => {
    minecraftRedirect(res, 'openRealmsStories', { realmId: req.params.realmId });
});

app.get('/JoinGathering/:gatheringId', (req, res) => {
    minecraftRedirect(res, 'joinGathering', { gatheringId: req.params.gatheringId });
});

app.get('/JoinExperience/:experienceId', (req, res) => {
    const worldId = typeof req.query.worldId === 'string' ? req.query.worldId : undefined;
    const friendID = typeof req.query.friendID === 'string' ? req.query.friendID : undefined;

    minecraftRedirect(res, 'joinExperience', {
        experienceId: req.params.experienceId,
        worldId,
        friendID,
    });
});

app.get('/Import', (req, res) => {
    const path = requiredQuery(req, res, 'path');
    if (path === null) return;

    minecraftRedirect(res, '', { import: path });
});

app.get('/ImportLoad', (req, res) => {
    const path = requiredQuery(req, res, 'path');
    if (path === null) return;

    minecraftRedirect(res, '', { importload: path });
});

app.get('/ImportPack', (req, res) => {
    const path = requiredQuery(req, res, 'path');
    if (path === null) return;

    minecraftRedirect(res, '', { importpack: path, fromtempfile: 1 });
});

app.get('/ImportAddon', (req, res) => {
    const path = requiredQuery(req, res, 'path');
    if (path === null) return;

    minecraftRedirect(res, '', { importaddon: path, fromtempfile: 1 });
});

app.get('/ImportTemplate', (req, res) => {
    const path = requiredQuery(req, res, 'path');
    if (path === null) return;

    minecraftRedirect(res, '', { importtemplate: path, fromtempfile: 1 });
});

app.get('/SlashCommand', (req, res) => {
    const command = requiredQuery(req, res, 'command');
    if (command === null) return;

    minecraftRedirect(res, '', { slashcommand: command });
});

app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

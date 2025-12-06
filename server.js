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

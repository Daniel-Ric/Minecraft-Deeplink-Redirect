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

// Start des Servers
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

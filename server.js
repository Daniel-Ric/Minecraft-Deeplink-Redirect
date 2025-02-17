const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware, um Protokoll-Header zu setzen (optional, für CORS-Unterstützung)
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
});

// Allgemeine Store-Route für beide Domains
app.get('/store/:itemId', (req, res) => {
    const itemId = req.params.itemId;
    const minecraftUrl = `minecraft://openStore?showStoreOffer=${itemId}`;
    res.redirect(minecraftUrl);
});

// Start des Servers
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}`);
});

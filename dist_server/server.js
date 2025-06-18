"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config"); // Load .env file variables
const http = require("http");
const tts_handler_1 = require("./src/api/tts-handler");
const PORT = process.env.PORT || 3001;
const server = http.createServer((req, res) => {
    if (req.url === '/api/tts' && req.method === 'POST') {
        (0, tts_handler_1.ttsRequestHandler)(req, res);
    }
    else if (req.url === '/health' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
    }
    else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});
server.listen(PORT, () => {
    console.log(`Node.js HTTP server listening on port ${PORT}`);
    console.log(`TTS proxy available at http://localhost:${PORT}/api/tts`);
    console.log('Ensure TTS_URL environment variable is set for the server.');
});
process.on('SIGTERM', () => {
    console.log('SIGTERM signal received: closing HTTP server');
    server.close(() => {
        console.log('HTTP server closed');
    });
});

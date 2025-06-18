"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ttsRequestHandler = void 0;
const perf_hooks_1 = require("perf_hooks");
const stream_1 = require("stream");
// Helper to parse body, assuming JSON. For production, use a robust parser.
async function parseJsonBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', (chunk) => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                resolve(JSON.parse(body));
            }
            catch (e) {
                reject(new Error('Invalid JSON body'));
            }
        });
        req.on('error', reject);
    });
}
const ttsRequestHandler = async (req, res) => {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        res.writeHead(405, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: `Method ${req.method} Not Allowed` }));
        return;
    }
    const ttsInternalStart = perf_hooks_1.performance.now();
    try {
        const ttsUrl = process.env.TTS_URL;
        if (!ttsUrl) {
            console.error('TTS_URL environment variable is not set.');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'TTS service URL is not configured.' }));
            return;
        }
        const requestBody = await parseJsonBody(req);
        const upstream = await fetch(`${ttsUrl}/v1/tts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody),
        });
        const ttsInternalEnd = perf_hooks_1.performance.now();
        const ttsInternalMs = (ttsInternalEnd - ttsInternalStart).toFixed(2);
        res.setHeader('Server-Timing', `tts_internal_ms=${ttsInternalMs}`);
        if (!upstream.ok) {
            const errorBody = await upstream.text();
            console.error(`TTS service error: ${upstream.status} - ${errorBody}`);
            res.writeHead(upstream.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Error from TTS service: ${upstream.status}` }));
            return;
        }
        res.setHeader('Content-Type', 'audio/mpeg');
        if (upstream.body) {
            const nodeStream = stream_1.Readable.fromWeb(upstream.body);
            nodeStream.pipe(res);
            nodeStream.on('error', (error) => {
                console.error('Error piping TTS stream to response:', error);
                if (!res.writableEnded) {
                    res.end();
                }
            });
        }
        else {
            console.error('TTS service returned no body');
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'TTS service returned no response body' }));
        }
    }
    catch (error) {
        const ttsInternalEnd = perf_hooks_1.performance.now();
        const ttsInternalMs = (ttsInternalEnd - ttsInternalStart).toFixed(2);
        if (!res.headersSent) {
            res.setHeader('Server-Timing', `tts_internal_ms=${ttsInternalMs}`);
        }
        console.error('Proxy to TTS service failed:', error);
        if (!res.headersSent) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: error.message || 'Failed to proxy request to TTS service' }));
        }
        else {
            console.error('Headers already sent, cannot send JSON error response.');
            res.end();
        }
    }
};
exports.ttsRequestHandler = ttsRequestHandler;

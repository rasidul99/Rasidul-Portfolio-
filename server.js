const http = require('http');
const path = require('path');
const { PORT } = require('./server/config');
const { findFile } = require('./server/file-resolver');
const { streamFile } = require('./server/range-streamer');
const { handleLogError } = require('./server/error-logger');

const server = http.createServer((req, res) => {
    // Set CORS & SharedArrayBuffer WebGL security headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS, POST');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Range');
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
    res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');

    // Handle POST /log-error telemetry endpoint
    if (req.method === 'POST' && req.url === '/log-error') {
        handleLogError(req, res);
        return;
    }

    // Handle OPTIONS preflight requests
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Extract & decode pathname
    const parsedUrl = new URL(req.url, `http://${req.headers.host}`);
    let reqPath = decodeURIComponent(parsedUrl.pathname);

    // Default root path to /index.html
    if (reqPath === '/') {
        reqPath = '/index.html';
    }

    // Redirect disabled /about route to home
    if (reqPath === '/about' || reqPath === '/about.html') {
        res.writeHead(301, { Location: '/' });
        res.end();
        return;
    }

    // Resolve file across mirrored domains
    let filePath = findFile(reqPath);

    // If file not found and has no extension, check if an html file exists (e.g. /resume -> /resume.html)
    const hasExtension = path.extname(reqPath) !== '';
    if (!filePath && !hasExtension) {
        filePath = findFile(reqPath + '.html');
    }

    // SPA routing fallback: If file not found and has no extension, route to /index.html
    if (!filePath && !hasExtension) {
        filePath = findFile('/index.html');
    }

    if (!filePath) {
        console.log(`[404] Not Found: ${req.url}`);
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
    }

    // Serve static or byte-range media stream
    streamFile(req, res, filePath);
});

// Start server with port auto-increment on EADDRINUSE
function startServer(port) {
    server.once('error', (err) => {
        if (err.code === 'EADDRINUSE') {
            console.log(`Port ${port} is in use, trying port ${port + 1}...`);
            startServer(port + 1);
        } else {
            console.error('Server error:', err);
        }
    });

    server.listen(port, () => {
        console.log('\n==================================================');
        console.log(`  Rasidul Portfolio Server is running!`);
        console.log(`  Local URL: http://localhost:${port}`);
        console.log('==================================================\n');
    });
}

startServer(PORT);

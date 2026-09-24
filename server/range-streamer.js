const fs = require('fs');
const path = require('path');
const { MIME_TYPES, ROOT_DIR } = require('./config');

/**
 * Handles HTTP 206 Byte-Range streaming and HTTP 200 static file streams.
 */
function streamFile(req, res, filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Log request resolution
    console.log(`[REQ] ${req.method} ${req.url} -> ${path.relative(ROOT_DIR, filePath)}`);

    // Handle range request (crucial for video / audio)
    if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize || end >= fileSize) {
            res.writeHead(416, { 'Content-Range': `bytes */${fileSize}` });
            res.end();
            return;
        }

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(filePath, { start, end });

        res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });

        fileStream.pipe(res);
    } else {
        res.writeHead(200, {
            'Content-Length': fileSize,
            'Content-Type': contentType,
            'Cache-Control': 'no-cache'
        });
        fs.createReadStream(filePath).pipe(res);
    }
}

module.exports = {
    streamFile
};

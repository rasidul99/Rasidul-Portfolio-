const path = require('path');

// Root workspace directory
const ROOT_DIR = path.resolve(__dirname, '..');

// Port to listen on (will fallback to next available if busy)
const PORT = parseInt(process.env.PORT, 10) || 3000;

// List of all directories in the workspace to check for assets
const DOMAIN_DIRS = [
    'rasidul.co',
    'rasidul.dev',
    'lusion.co',
    'lusion.dev',
    'cdn.jsdelivr.net',
    'player.vimeo.com',
    'vimeo.com',
    'f.vimeocdn.com',
    'i.vimeocdn.com',
    'vod-adaptive-ak.vimeocdn.com',
    'www.google-analytics.com',
    'www.google.com',
    'www.googletagmanager.com',
    'www.gstatic.com',
    '_DataURI'
];

// MIME types mapping
const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.mjs': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml; charset=utf-8',
    '.ico': 'image/x-icon',
    '.woff': 'font/woff',
    '.woff2': 'font/woff2',
    '.ttf': 'font/ttf',
    '.otf': 'font/otf',
    '.glb': 'model/gltf-binary',
    '.gltf': 'model/gltf+json',
    '.mp3': 'audio/mpeg',
    '.wav': 'audio/wav',
    '.ogg': 'audio/ogg',
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.txt': 'text/plain; charset=utf-8'
};

module.exports = {
    ROOT_DIR,
    PORT,
    DOMAIN_DIRS,
    MIME_TYPES
};

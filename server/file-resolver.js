const fs = require('fs');
const path = require('path');
const { ROOT_DIR, DOMAIN_DIRS } = require('./config');

/**
 * Validates and resolves physical file existence on disk,
 * preventing Path Traversal directory escape attacks.
 */
function resolvePath(filePath) {
    // SECURITY CHECK: Verify target path does not escape ROOT_DIR
    const normalizedPath = path.normalize(filePath);
    if (!normalizedPath.startsWith(ROOT_DIR)) {
        console.warn(`[SECURITY WARNING] Blocked Path Traversal Attempt: ${filePath}`);
        return null;
    }

    if (fs.existsSync(normalizedPath)) {
        const stat = fs.statSync(normalizedPath);
        if (stat.isFile()) {
            return normalizedPath;
        } else if (stat.isDirectory()) {
            const indexPath = path.join(normalizedPath, 'index.html');
            if (fs.existsSync(indexPath) && fs.statSync(indexPath).isFile()) {
                return indexPath;
            }
        }
    }
    return null;
}

/**
 * Searches across mirrored domain folders to resolve requested asset paths.
 */
function findFile(reqPath) {
    // Sanitize relative path
    reqPath = path.normalize(reqPath).replace(/^(\.\.[\/\\])+/, '');

    // Path Overrides
    if (reqPath.startsWith('/assets/projects/oryzo_ai') || reqPath.startsWith('\\assets\\projects\\oryzo_ai')) {
        reqPath = reqPath.replace('/assets/projects/oryzo_ai', '/assets/projects/CodeMoly')
                         .replace('\\assets\\projects\\oryzo_ai', '\\assets\\projects\\CodeMoly');
    }
    if (reqPath.startsWith('/assets/projects/MolyEcom') || reqPath.startsWith('\\assets\\projects\\MolyEcom') ||
        reqPath.startsWith('/assets/projects/molyecom') || reqPath.startsWith('\\assets\\projects\\molyecom')) {
        reqPath = reqPath.replace(/\/assets\/projects\/moly(ecom)?/i, '/assets/projects/of_the_oak')
                         .replace(/\\assets\\projects\\moly(ecom)?/i, '\\assets\\projects\\of_the_oak');
    }

    if (reqPath === '/assets/models/home/cross.buf' || reqPath === '\\assets\\models\\home\\cross.buf') {
        reqPath = '/assets/models/home/cross_ld.buf';
    } else if (reqPath === '/assets/textures/home/matcap.exr' || reqPath === '\\assets\\textures\\home\\matcap_ld.exr') {
        reqPath = '/assets/textures/home/matcap_ld.exr';
    } else if (reqPath === '/assets/textures/tunnels/stickers.png' || reqPath === '\\assets\\textures\\tunnels\\stickers.png') {
        reqPath = '/assets/textures/tunnels/stickers_low.png';
    } else if (reqPath === '/assets/textures/reel/desktop.mp4' || reqPath === '\\assets\\textures\\reel\\desktop.mp4') {
        reqPath = '/assets/textures/reel/mobile.mp4';
    }

    let resolved;

    // 1. Direct under ROOT_DIR
    resolved = resolvePath(path.join(ROOT_DIR, reqPath));
    if (resolved) return resolved;

    // 2. Under rasidul.co/ or lusion.co/
    resolved = resolvePath(path.join(ROOT_DIR, 'rasidul.co', reqPath)) || resolvePath(path.join(ROOT_DIR, 'lusion.co', reqPath));
    if (resolved) return resolved;

    // 3. Under rasidul.dev/ or lusion.dev/
    resolved = resolvePath(path.join(ROOT_DIR, 'rasidul.dev', reqPath)) || resolvePath(path.join(ROOT_DIR, 'lusion.dev', reqPath));
    if (resolved) return resolved;

    // 4. Other DOMAIN_DIRS
    for (const dir of DOMAIN_DIRS) {
        if (dir === 'lusion.co' || dir === 'lusion.dev') continue;
        resolved = resolvePath(path.join(ROOT_DIR, dir, reqPath));
        if (resolved) return resolved;
    }

    if (!resolved && reqPath.endsWith('home_depth.webp')) {
        return findFile(reqPath.replace('home_depth.webp', 'home.webp'));
    }

    return null;
}

module.exports = {
    resolvePath,
    findFile
};

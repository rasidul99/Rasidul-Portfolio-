/**
 * Handles POST /log-error requests from client-side window.onerror listeners.
 * Enforces a 100KB body payload limit to prevent Memory Exhaustion DoS attacks.
 */
function handleLogError(req, res) {
    let body = '';
    const MAX_PAYLOAD_SIZE = 100 * 1024; // 100 KB limit

    req.on('data', chunk => {
        body += chunk;
        if (body.length > MAX_PAYLOAD_SIZE) {
            console.warn('[SECURITY WARNING] Rejected oversized /log-error payload');
            req.destroy(); // Destroy stream on excess payload size
        }
    });

    req.on('end', () => {
        try {
            const err = JSON.parse(body);
            console.error('\n!!! BROWSER JS ERROR !!!');
            console.error(`Message: ${err.message}`);
            console.error(`Source: ${err.source} at line ${err.lineno}:${err.colno}`);
            if (err.stack) console.error(`Stack:\n${err.stack}`);
            console.error('!!!!!!!!!!!!!!!!!!!!!!!!\n');
        } catch (e) {
            console.error('Error parsing browser error log:', body);
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok' }));
    });
}

module.exports = {
    handleLogError
};

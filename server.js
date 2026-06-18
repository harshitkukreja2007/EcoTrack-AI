const http = require('http');
const next = require('next');

// Override process.on to catch and ignore any unsupported Windows terminal signals
const originalOn = process.on;
process.on = function(signal, handler) {
  if (['SIGINT', 'SIGTERM', 'SIGHUP', 'SIGQUIT', 'SIGUSR2'].includes(signal)) {
    console.log(`[Server] Signal registered: ${signal} (ignored for compatibility)`);
    return this;
  }
  return originalOn.apply(this, arguments);
};

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev, dir: __dirname });
const handle = app.getRequestHandler();

console.log('[Server] Initializing Next.js app instance...');

app.prepare()
  .then(() => {
    const server = http.createServer((req, res) => {
      handle(req, res);
    });

    server.listen(3000, '127.0.0.1', (err) => {
      if (err) {
        console.error('[Server] Failed to bind server socket:', err);
        process.exit(1);
      }
      console.log('[Server] Custom server ready on http://127.0.0.1:3000');
    });
  })
  .catch((err) => {
    console.error('[Server] Critical error preparing Next.js:', err);
    process.exit(1);
  });

import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sirv from 'sirv';
import { log } from './logger.mjs';

const BASE = '/products/ignite-ui-angular/docs/sass/latest';
const PORT = Number(process.env.PORT) || 3001;
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(
  __dirname,
  '..',
  'dist',
  'igniteui-angular',
  'docs',
  'sass'
);

const assets = sirv(root, { dev: true });

const server = http.createServer((req, res) => {
  const url = req.url ?? '/';

  if (!url.startsWith(`${BASE}/`)) {
    res.writeHead(302, { Location: `${BASE}/` });
    res.end();
    return;
  }

  req.url = url.slice(BASE.length);
  assets(req, res, () => {
    res.writeHead(404);
    res.end('Not found');
  });
});

server.listen(PORT, () => {
  log('sassdoc', `Serving ${root} at http://localhost:${PORT}${BASE}/`);
});

const { spawn } = require('child_process');

const node = process.execPath;
const backend = spawn(node, ['server.js'], { stdio: 'inherit', env: process.env });
const frontend = spawn(
  node,
  ['./node_modules/@angular/cli/bin/ng.js', 'serve', '--host', '127.0.0.1', '--port', '4200', '--proxy-config', 'proxy.conf.json'],
  { stdio: 'inherit', env: process.env }
);

function shutdown(code) {
  backend.kill('SIGINT');
  frontend.kill('SIGINT');
  process.exit(code);
}

backend.on('exit', (code) => shutdown(code || 0));
frontend.on('exit', (code) => shutdown(code || 0));

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

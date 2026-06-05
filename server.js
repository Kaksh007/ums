const fs = require('fs');
const path = require('path');
const express = require('express');
const { connectDb } = require('./api/_lib/db');
const loginHandler = require('./api/auth/login');
const usersHandler = require('./api/users/index');
const userByIdHandler = require('./api/users/[id]');
const imagesHandler = require('./api/images/index');
const myImagesHandler = require('./api/images/mine');

loadEnvFile('.env.local');
loadEnvFile('.env');

const app = express();
const port = Number(process.env.PORT || 3000);

app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));

function adapt(handler) {
  return (req, res) =>
    handler(
      Object.assign(req, {
        query: req.params && Object.keys(req.params).length ? { ...req.query, ...req.params } : req.query
      }),
      res
    );
}

function loadEnvFile(filename) {
  const filePath = path.join(__dirname, filename);
  if (!fs.existsSync(filePath)) {
    return;
  }

  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim();
    if (key && !process.env[key]) {
      process.env[key] = value;
    }
  }
}

app.get('/api/health', async (_req, res) => {
  try {
    await connectDb();
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ ok: false, message: error.message });
  }
});

app.post('/api/auth/login', adapt(loginHandler));
app.get('/api/users', adapt(usersHandler));
app.post('/api/users', adapt(usersHandler));
app.delete('/api/users/:id', adapt(userByIdHandler));
app.get('/api/images', adapt(imagesHandler));
app.post('/api/images', adapt(imagesHandler));
app.get('/api/images/mine', adapt(myImagesHandler));

app.use((req, res) => {
  res.status(404).json({ message: 'Not found.' });
});

app.listen(port, () => {
  console.log(`Local API server listening on http://127.0.0.1:${port}`);
});

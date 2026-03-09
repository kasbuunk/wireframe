const express = require('express');
const chokidar = require('chokidar');
const fs = require('fs');
const path = require('path');

// Load .env if present
const envFile = path.join(__dirname, '.env');
if (fs.existsSync(envFile)) {
  fs.readFileSync(envFile, 'utf8').split('\n').forEach(line => {
    const [k, ...rest] = line.split('=');
    if (k && rest.length && !process.env[k.trim()]) {
      process.env[k.trim()] = rest.join('=').trim();
    }
  });
}

const app = express();
const PORT = process.env.PORT || 3000;
const WIREFRAMES_DIR = path.resolve(__dirname, process.env.WIREFRAMES_DIR || 'wireframes');

// SSE clients
const clients = new Set();

// Ensure wireframes directory exists
if (!fs.existsSync(WIREFRAMES_DIR)) {
  fs.mkdirSync(WIREFRAMES_DIR, { recursive: true });
}

// Static files for frontend
app.use(express.static(path.join(__dirname, 'public')));

// GET /api/wireframes — list all wireframes
app.get('/api/wireframes', (req, res) => {
  try {
    const files = fs.readdirSync(WIREFRAMES_DIR);
    const intentFiles = files.filter(f => f.endsWith('.intent.json'));

    const wireframes = intentFiles.map(file => {
      const id = file.replace('.intent.json', '');
      try {
        const data = JSON.parse(fs.readFileSync(path.join(WIREFRAMES_DIR, file), 'utf8'));
        return { id: data.id || id, title: data.title || id, description: data.description || '' };
      } catch {
        return { id, title: id, description: '' };
      }
    }).sort((a, b) => a.id.localeCompare(b.id));

    res.json(wireframes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wireframes/:id — get wireframe metadata (intent JSON)
app.get('/api/wireframes/:id', (req, res) => {
  const filePath = path.join(WIREFRAMES_DIR, `${req.params.id}.intent.json`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'Wireframe not found' });
  }
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/wireframes/:id/html — serve raw HTML
app.get('/api/wireframes/:id/html', (req, res) => {
  const filePath = path.join(WIREFRAMES_DIR, `${req.params.id}.html`);
  if (!fs.existsSync(filePath)) {
    return res.status(404).send('<p>Wireframe HTML not found</p>');
  }
  res.sendFile(filePath);
});

// GET /api/events — SSE endpoint for file change notifications
app.get('/api/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  clients.add(res);

  req.on('close', () => {
    clients.delete(res);
  });
});

function broadcast(event, data) {
  const message = `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
  for (const client of clients) {
    client.write(message);
  }
}

// Watch wireframes directory
const watcher = chokidar.watch(WIREFRAMES_DIR, {
  ignoreInitial: true,
  persistent: true
});

watcher.on('add', file => broadcast('change', { type: 'add', file: path.basename(file) }));
watcher.on('change', file => broadcast('change', { type: 'change', file: path.basename(file) }));
watcher.on('unlink', file => broadcast('change', { type: 'remove', file: path.basename(file) }));

app.listen(PORT, () => {
  console.log(`Wireframe Viewer running at http://localhost:${PORT}`);
  console.log(`Watching: ${WIREFRAMES_DIR}`);
});

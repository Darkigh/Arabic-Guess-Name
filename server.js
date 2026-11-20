const http = require('http'), fs = require('fs'), path = require('path');
const { WebSocketServer } = require('ws');
const PORT = process.env.PORT || 3000;
const store = new Map(); // full doc path -> data (kept in memory)

const server = http.createServer((req, res) => {
  fs.readFile(path.join(__dirname, 'public', 'index.html'), (e, b) => {
    res.writeHead(e ? 500 : 200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(e ? 'error' : b);
  });
});

const wss = new WebSocketServer({ server, maxPayload: 20000 });
const send = (ws, m) => ws.readyState === 1 && ws.send(JSON.stringify(m));

wss.on('connection', ws => {
  send(ws, { t: 'init', docs: [...store] });
  ws.on('message', raw => {
    let m; try { m = JSON.parse(raw); } catch { return; }
    const { t, path: p, data } = m;
    if (typeof p !== 'string' || p.length > 200) return;
    if (t === 'del') store.delete(p);
    else if (t === 'set' && data && typeof data === 'object') store.set(p, data);
    else if (t === 'upd' && data && typeof data === 'object') store.set(p, { ...(store.get(p) || {}), ...data });
    else return;
    const out = JSON.stringify({ t: 'doc', path: p, data: store.get(p) || null });
    wss.clients.forEach(c => { if (c !== ws && c.readyState === 1) c.send(out); });
  });
});

// delete rooms older than 12 hours
setInterval(() => {
  const old = Date.now() - 12 * 3600e3;
  for (const [p, d] of [...store]) {
    if (/^rooms\/[A-Z]+$/.test(p) && d.created < old)
      for (const k of [...store.keys()]) if (k === p || k.startsWith(p + '/')) store.delete(k);
  }
  wss.clients.forEach(c => send(c, { t: 'init', docs: [...store] }));
}, 30 * 60e3);

server.listen(PORT, () => console.log('Game running on port ' + PORT));

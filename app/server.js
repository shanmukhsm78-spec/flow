#!/usr/bin/env node
/**
 * FLOW Official 14 — Phase 1
 * Tiny local server (Node stdlib only). Serves chat UI, proxies Ollama,
 * reads/writes ./data/memory.json. Brain/chats/Mnemosyne/Ghost receipts
 * stay on-device — never on a FLOW cloud server.
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');
const crypto = require('crypto');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.FLOW_MODEL || 'llama3.2';

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const MEMORY_PATH = path.join(DATA_DIR, 'memory.json');

const FEATURE_FLAGS = {
  flowAi: 'LIVE',
  mnemosyne: 'LIVE',
  ghost: 'LIVE',
  silenceMode: 'THIN LIVE',
  echo: 'THIN LIVE',
  witness: 'THIN LIVE',
  temporalCognition: 'Coming',
  timeFold: 'Coming',
  mirrorProtocol: 'Coming',
  soul: 'Coming',
  causalAi: 'Coming',
  constellation: 'Coming',
  reflect: 'Coming',
  lifeMemory: 'Coming'
};

function emptyMemory() {
  return {
    version: 1,
    updatedAt: new Date().toISOString(),
    settings: {
      model: DEFAULT_MODEL,
      silenceMode: false,
      echoMode: false,
      witnessMode: false
    },
    messages: [],
    notes: [],
    ghostReceipts: []
  };
}

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEMORY_PATH)) {
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(emptyMemory(), null, 2), 'utf8');
  }
}

function normalizeMemory(raw) {
  const base = emptyMemory();
  const data = raw && typeof raw === 'object' ? raw : {};
  const settings = Object.assign({}, base.settings, data.settings || {});
  return {
    version: typeof data.version === 'number' ? data.version : 1,
    updatedAt: data.updatedAt || base.updatedAt,
    settings: {
      model: typeof settings.model === 'string' && settings.model.trim() ? settings.model.trim() : DEFAULT_MODEL,
      silenceMode: !!settings.silenceMode,
      echoMode: !!settings.echoMode,
      witnessMode: !!settings.witnessMode
    },
    messages: Array.isArray(data.messages) ? data.messages : [],
    notes: Array.isArray(data.notes) ? data.notes : [],
    ghostReceipts: Array.isArray(data.ghostReceipts) ? data.ghostReceipts : []
  };
}

function readMemory() {
  ensureData();
  try {
    const parsed = JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
    return normalizeMemory(parsed);
  } catch (err) {
    throw new Error('Failed to read memory.json: ' + err.message);
  }
}

function writeMemory(data) {
  ensureData();
  const normalized = normalizeMemory(data);
  normalized.updatedAt = new Date().toISOString();
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(normalized, null, 2), 'utf8');
  return normalized;
}

function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(new Error('Invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const map = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.svg': 'image/svg+xml',
    '.png': 'image/png',
    '.ico': 'image/x-icon'
  };
  return map[ext] || 'application/octet-stream';
}

function serveStatic(req, res, urlPath) {
  let rel = urlPath === '/' ? '/index.html' : urlPath;
  rel = decodeURIComponent(rel.split('?')[0]);
  const filePath = path.normalize(path.join(PUBLIC, rel));
  if (!filePath.startsWith(PUBLIC)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': contentType(filePath) });
    res.end(data);
  });
}

async function checkOllama() {
  try {
    const u = new URL('/api/tags', OLLAMA_HOST);
    const result = await httpRequest(u, { method: 'GET' });
    return { ok: result.statusCode >= 200 && result.statusCode < 300, status: result.statusCode, body: result.body };
  } catch (err) {
    return { ok: false, error: err.message };
  }
}

function httpRequest(urlObj, options, body) {
  return new Promise((resolve, reject) => {
    const lib = urlObj.protocol === 'https:' ? require('https') : http;
    const req = lib.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port || (urlObj.protocol === 'https:' ? 443 : 80),
        path: urlObj.pathname + urlObj.search,
        method: options.method || 'GET',
        headers: options.headers || {},
        timeout: options.timeout || 120000
      },
      (res) => {
        const chunks = [];
        res.on('data', (c) => chunks.push(c));
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            headers: res.headers,
            body: Buffer.concat(chunks).toString('utf8')
          });
        });
      }
    );
    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Ollama request timed out'));
    });
    if (body) req.write(body);
    req.end();
  });
}

function buildSystemPrompt(memory) {
  const settings = memory.settings || {};
  const notes = (memory.notes || []).slice(-20);
  const parts = [
    'You are FLOW, a helpful on-device assistant. Keep answers clear and honest.',
    'You run locally via Ollama. You do not have cloud memory beyond what is provided here.',
    'You are not a finished "digital twin." Answer using the local notes and chat context given below.'
  ];

  if (notes.length) {
    parts.push('Mnemosyne notes (local memory.json — use as light style/context, not as absolute truth):\n' +
      notes.map((n) => '- ' + (n.text || '')).join('\n'));
  } else {
    parts.push('Mnemosyne notes: none yet. Answer helpfully without inventing personal history.');
  }

  if (settings.echoMode) {
    parts.push(
      'Echo mode is ON (thin). Answer as the user\'s future self — grounded only in the notes and conversation above. ' +
      'Speak in first person as a wiser future version of them. Do not invent a full life story. Stay humble and local.'
    );
  }

  if (settings.witnessMode) {
    parts.push(
      'Witness mode is ON (thin). When useful, push back honestly — challenge weak assumptions, ' +
      'name tradeoffs, and avoid empty agreement. Stay kind, not cruel.'
    );
  }

  return parts.join('\n\n');
}

async function handleChat(req, res) {
  let payload;
  try {
    payload = await readBody(req);
  } catch (e) {
    return sendJson(res, 400, { error: e.message });
  }

  const memory = readMemory();
  const model = (payload.model || memory.settings.model || DEFAULT_MODEL).trim();
  const userMessage = (payload.message || '').trim();
  if (!userMessage) return sendJson(res, 400, { error: 'message is required' });

  memory.messages.push({
    role: 'user',
    content: userMessage,
    at: new Date().toISOString()
  });
  if (payload.note && typeof payload.note === 'string' && payload.note.trim()) {
    memory.notes.push({ id: crypto.randomUUID(), text: payload.note.trim(), at: new Date().toISOString() });
  }
  writeMemory(memory);

  const history = memory.messages.slice(-40).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  const ollamaBody = JSON.stringify({
    model,
    stream: false,
    messages: [{ role: 'system', content: buildSystemPrompt(memory) }, ...history]
  });

  let ollamaRes;
  try {
    const u = new URL('/api/chat', OLLAMA_HOST);
    ollamaRes = await httpRequest(
      u,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(ollamaBody)
        },
        timeout: 180000
      },
      ollamaBody
    );
  } catch (err) {
    return sendJson(res, 503, {
      error: 'Ollama is not reachable',
      detail: err.message,
      hints: [
        'Install Ollama from https://ollama.com',
        'Run: ollama serve  (or open the Ollama app)',
        'Pull a model: ollama pull ' + model,
        'Confirm: curl ' + OLLAMA_HOST + '/api/tags',
        'Wifi-off chat only works if Ollama and the model are already on this machine'
      ]
    });
  }

  if (ollamaRes.statusCode < 200 || ollamaRes.statusCode >= 300) {
    let detail = ollamaRes.body;
    try {
      const parsed = JSON.parse(ollamaRes.body);
      detail = parsed.error || ollamaRes.body;
    } catch (_) {}
    return sendJson(res, 502, {
      error: 'Ollama returned an error',
      status: ollamaRes.statusCode,
      detail,
      hints: [
        'Is the model installed? Try: ollama pull ' + model,
        'List models: ollama list',
        'You can change the model in the UI settings or FLOW_MODEL env var'
      ]
    });
  }

  let replyText = '';
  try {
    const parsed = JSON.parse(ollamaRes.body);
    replyText = (parsed.message && parsed.message.content) || '';
  } catch (e) {
    return sendJson(res, 502, { error: 'Bad response from Ollama', detail: e.message });
  }

  memory.messages.push({
    role: 'assistant',
    content: replyText,
    at: new Date().toISOString(),
    model
  });
  memory.settings.model = model;
  writeMemory(memory);

  return sendJson(res, 200, {
    reply: replyText,
    model,
    modes: {
      echoMode: !!memory.settings.echoMode,
      witnessMode: !!memory.settings.witnessMode,
      silenceMode: !!memory.settings.silenceMode
    },
    memory: {
      messageCount: memory.messages.length,
      noteCount: memory.notes.length,
      ghostReceiptCount: memory.ghostReceipts.filter((r) => !r.deleted).length
    }
  });
}

function handleGhostReceipt(req, res, body) {
  const memory = readMemory();
  if (memory.settings.silenceMode) {
    return sendJson(res, 403, {
      error: 'Ghost muted',
      detail: 'Silence Mode is ON — Ghost is blocked. Turn Silence off to record a receipt.',
      silenceMode: true
    });
  }

  const signal = typeof body.signal === 'string' && body.signal.trim() ? body.signal.trim() : 'stuck';
  const help = typeof body.help === 'string' && body.help.trim()
    ? body.help.trim()
    : 'Pause. Name the blocker in one sentence. Then ask FLOW for the next small step.';

  const receipt = {
    id: crypto.randomUUID(),
    at: new Date().toISOString(),
    signal,
    help,
    deleted: false
  };
  memory.ghostReceipts.push(receipt);
  writeMemory(memory);
  return sendJson(res, 200, { receipt, silenceMode: false, localOnly: true });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const p = url.pathname;

  try {
    if (req.method === 'GET' && p === '/api/health') {
      const ollama = await checkOllama();
      const memory = readMemory();
      return sendJson(res, 200, {
        ok: true,
        app: 'flow-official-14-phase-1',
        ollamaHost: OLLAMA_HOST,
        ollamaOk: !!ollama.ok,
        ollamaError: ollama.error || null,
        defaultModel: memory.settings.model || DEFAULT_MODEL,
        messageCount: memory.messages.length,
        noteCount: memory.notes.length,
        ghostReceiptCount: memory.ghostReceipts.filter((r) => !r.deleted).length,
        settings: {
          silenceMode: !!memory.settings.silenceMode,
          echoMode: !!memory.settings.echoMode,
          witnessMode: !!memory.settings.witnessMode
        },
        features: FEATURE_FLAGS,
        memoryPath: 'app/data/memory.json',
        localOnly: true
      });
    }

    if (req.method === 'GET' && p === '/api/memory') {
      return sendJson(res, 200, readMemory());
    }

    if (req.method === 'PUT' && p === '/api/memory') {
      const body = await readBody(req);
      const current = readMemory();
      if (body.settings && typeof body.settings === 'object') {
        const s = body.settings;
        if (typeof s.model === 'string' && s.model.trim()) current.settings.model = s.model.trim();
        if (typeof s.silenceMode === 'boolean') current.settings.silenceMode = s.silenceMode;
        if (typeof s.echoMode === 'boolean') current.settings.echoMode = s.echoMode;
        if (typeof s.witnessMode === 'boolean') current.settings.witnessMode = s.witnessMode;
      }
      if (Array.isArray(body.notes)) {
        current.notes = body.notes.map((n) => {
          if (typeof n === 'string') {
            return { id: crypto.randomUUID(), text: n, at: new Date().toISOString() };
          }
          return {
            id: n.id || crypto.randomUUID(),
            text: String(n.text || ''),
            at: n.at || new Date().toISOString()
          };
        }).filter((n) => n.text.trim());
      }
      if (typeof body.appendNote === 'string' && body.appendNote.trim()) {
        current.notes.push({
          id: crypto.randomUUID(),
          text: body.appendNote.trim(),
          at: new Date().toISOString()
        });
      }
      if (Array.isArray(body.messages)) current.messages = body.messages;
      return sendJson(res, 200, writeMemory(current));
    }

    if (req.method === 'DELETE' && p === '/api/memory/messages') {
      const current = readMemory();
      current.messages = [];
      return sendJson(res, 200, writeMemory(current));
    }

    if (req.method === 'DELETE' && p === '/api/memory/notes') {
      const current = readMemory();
      current.notes = [];
      return sendJson(res, 200, writeMemory(current));
    }

    if (req.method === 'DELETE' && p === '/api/memory') {
      return sendJson(res, 200, writeMemory(emptyMemory()));
    }

    if (req.method === 'POST' && p === '/api/ghost/receipt') {
      const body = await readBody(req);
      return handleGhostReceipt(req, res, body);
    }

    if (req.method === 'DELETE' && p === '/api/ghost/receipts') {
      const current = readMemory();
      current.ghostReceipts = [];
      return sendJson(res, 200, writeMemory(current));
    }

    const receiptMatch = p.match(/^\/api\/ghost\/receipts\/([^/]+)$/);
    if (req.method === 'DELETE' && receiptMatch) {
      const id = decodeURIComponent(receiptMatch[1]);
      const current = readMemory();
      const before = current.ghostReceipts.length;
      current.ghostReceipts = current.ghostReceipts.filter((r) => r.id !== id);
      if (current.ghostReceipts.length === before) {
        return sendJson(res, 404, { error: 'Receipt not found', id });
      }
      return sendJson(res, 200, writeMemory(current));
    }

    if (req.method === 'POST' && p === '/api/chat') {
      return await handleChat(req, res);
    }

    if (req.method === 'GET') {
      return serveStatic(req, res, p);
    }

    sendJson(res, 405, { error: 'Method not allowed' });
  } catch (err) {
    console.error(err);
    sendJson(res, 500, { error: 'Server error', detail: String(err.message || err) });
  }
});

ensureData();
server.listen(PORT, HOST, () => {
  console.log(`FLOW Official 14 Phase 1 listening on http://${HOST}:${PORT}`);
  console.log(`Ollama: ${OLLAMA_HOST}  default model: ${DEFAULT_MODEL}`);
  console.log(`Memory: ${MEMORY_PATH} (local only)`);
});

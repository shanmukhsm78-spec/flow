#!/usr/bin/env node
/**
 * FLOW v0 — tiny local server (Node stdlib only)
 * Serves chat UI, proxies Ollama /api/chat, reads/writes ./data/memory.json
 */
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = Number(process.env.PORT || 8787);
const HOST = process.env.HOST || '127.0.0.1';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://127.0.0.1:11434';
const DEFAULT_MODEL = process.env.FLOW_MODEL || 'llama3.2';

const ROOT = __dirname;
const PUBLIC = path.join(ROOT, 'public');
const DATA_DIR = path.join(ROOT, 'data');
const MEMORY_PATH = path.join(DATA_DIR, 'memory.json');

function ensureData() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(MEMORY_PATH)) {
    const initial = {
      version: 1,
      updatedAt: new Date().toISOString(),
      settings: { model: DEFAULT_MODEL, silenceMode: false },
      messages: [],
      notes: []
    };
    fs.writeFileSync(MEMORY_PATH, JSON.stringify(initial, null, 2), 'utf8');
  }
}

function readMemory() {
  ensureData();
  try {
    return JSON.parse(fs.readFileSync(MEMORY_PATH, 'utf8'));
  } catch (err) {
    throw new Error('Failed to read memory.json: ' + err.message);
  }
}

function writeMemory(data) {
  ensureData();
  data.updatedAt = new Date().toISOString();
  fs.writeFileSync(MEMORY_PATH, JSON.stringify(data, null, 2), 'utf8');
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

async function handleChat(req, res) {
  let payload;
  try {
    payload = await readBody(req);
  } catch (e) {
    return sendJson(res, 400, { error: e.message });
  }

  const memory = readMemory();
  const model = (payload.model || memory.settings?.model || DEFAULT_MODEL).trim();
  const userMessage = (payload.message || '').trim();
  if (!userMessage) return sendJson(res, 400, { error: 'message is required' });

  // Persist user message first
  memory.messages = memory.messages || [];
  memory.messages.push({
    role: 'user',
    content: userMessage,
    at: new Date().toISOString()
  });
  if (payload.note && typeof payload.note === 'string' && payload.note.trim()) {
    memory.notes = memory.notes || [];
    memory.notes.push({ text: payload.note.trim(), at: new Date().toISOString() });
  }
  writeMemory(memory);

  // Build Ollama messages (include recent history + notes as light context)
  const history = memory.messages.slice(-40).map((m) => ({
    role: m.role === 'assistant' ? 'assistant' : 'user',
    content: m.content
  }));

  const notes = (memory.notes || []).slice(-20);
  const systemParts = [
    'You are FLOW, a helpful on-device assistant. Keep answers clear and honest.',
    'You run locally via Ollama. You do not have cloud memory beyond what is provided here.'
  ];
  if (notes.length) {
    systemParts.push('User notes (local memory.json):\n' + notes.map((n) => '- ' + n.text).join('\n'));
  }

  const ollamaBody = JSON.stringify({
    model,
    stream: false,
    messages: [{ role: 'system', content: systemParts.join('\n\n') }, ...history]
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
        'Confirm: curl ' + OLLAMA_HOST + '/api/tags'
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
  memory.settings = memory.settings || {};
  memory.settings.model = model;
  writeMemory(memory);

  return sendJson(res, 200, {
    reply: replyText,
    model,
    memory: { messageCount: memory.messages.length, noteCount: (memory.notes || []).length }
  });
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
        app: 'flow-v0',
        ollamaHost: OLLAMA_HOST,
        ollamaOk: !!ollama.ok,
        ollamaError: ollama.error || null,
        defaultModel: memory.settings?.model || DEFAULT_MODEL,
        messageCount: (memory.messages || []).length
      });
    }

    if (req.method === 'GET' && p === '/api/memory') {
      return sendJson(res, 200, readMemory());
    }

    if (req.method === 'PUT' && p === '/api/memory') {
      const body = await readBody(req);
      const current = readMemory();
      if (body.settings && typeof body.settings === 'object') {
        current.settings = { ...current.settings, ...body.settings };
      }
      if (Array.isArray(body.notes)) current.notes = body.notes;
      if (Array.isArray(body.messages)) current.messages = body.messages;
      if (typeof body.appendNote === 'string' && body.appendNote.trim()) {
        current.notes = current.notes || [];
        current.notes.push({ text: body.appendNote.trim(), at: new Date().toISOString() });
      }
      writeMemory(current);
      return sendJson(res, 200, current);
    }

    if (req.method === 'DELETE' && p === '/api/memory/messages') {
      const current = readMemory();
      current.messages = [];
      writeMemory(current);
      return sendJson(res, 200, current);
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
  console.log(`FLOW v0 listening on http://${HOST}:${PORT}`);
  console.log(`Ollama: ${OLLAMA_HOST}  default model: ${DEFAULT_MODEL}`);
  console.log(`Memory: ${MEMORY_PATH}`);
});

# FLOW — Official 14 Phase 1

**You think. The world adjusts.**

Privacy-first **on-device AI** prototype. Model + memory stay on your machine. This app does not own your chats in the cloud.

**Stage:** early prototype · **Building in public** · Honesty over hype.

Landing (keep URL): [https://flowprivate.netlify.app](https://flowprivate.netlify.app)

---

## Claim gate

**[FEATURES.md](./FEATURES.md)** is the only source of truth for LIVE / THIN LIVE / STUB / Coming.  
**[PROOF.md](./PROOF.md)** has M3 commands, screenshot checklist, and the 60-second Ghost script.

Do not pitch Phase 1 as fourteen LIVE features. Do not claim “world’s first,” “beats GPT,” or a finished digital twin.

---

## What’s LIVE vs not

### LIVE

| Feature | What it does |
|---------|----------------|
| **FLOW AI** | Local chat → Ollama proxy. Every reply injects Mnemosyne notes + Echo/Witness style into the system prompt. Not a finished digital twin. |
| **Mnemosyne** | `app/data/memory.json` — messages, notes, settings, ghostReceipts. Show / delete note / clear chat / wipe. |

### THIN LIVE

| Feature | What it does |
|---------|----------------|
| **Ghost** | One stuck signal (typing stall ≥10s **or** same string sent twice) → help panel + optional Ask FLOW → local receipt. Demo: **Simulate stuck**. Respects Silence. Local-only receipts — **not** full wifi-off proven beyond that architecture. |
| **Silence Mode** | Toggle persists; dims UI **and** blocks Ghost (banner: Ghost muted). Chat still works. |
| **Echo** | Toggle → `echoMode` → future-self voice grounded in notes. |
| **Witness** | Toggle → `witnessMode` → honest pushback when useful. |

### Coming (Phase 2–3)

Temporal Cognition · Time-Fold · Mirror Protocol · Soul · Causal AI · Constellation · Reflect · Life Memory  

Listed as Coming only — not clickable fake working features.

### Not built

- Cloud sync, accounts, or FLOW-hosted models  
- Cross-device memory  
- Full Ghost wifi-off stealth bar (Bench proof still required for LIVE upgrade)  
- Mobile apps, installers, auto-updates  

---

## Prerequisites (MacBook Air M3)

- **macOS** on Apple Silicon (M3)
- **Node.js 18+** (`node -v`) — optional Homebrew: `brew install node`
- **Ollama** — [https://ollama.com](https://ollama.com)
- Browser (Safari / Chrome / Firefox)

---

## Run the on-device app

### 1) Install Ollama and a model

```bash
brew install ollama   # or download from https://ollama.com
ollama serve
# other terminal:
ollama pull llama3.2
curl http://127.0.0.1:11434/api/tags
```

Wifi-off chat needs Ollama + model **already** pulled.

### 2) Start FLOW

```bash
cd app
npm start
# equivalent: node server.js
```

No `npm install` needed (zero dependencies).

Open: **http://127.0.0.1:8787**

### Env vars (optional)

| Variable       | Default                         | Meaning              |
|----------------|---------------------------------|----------------------|
| `PORT`         | `8787`                          | HTTP port            |
| `HOST`         | `127.0.0.1`                     | Bind address         |
| `OLLAMA_HOST`  | `http://127.0.0.1:11434`        | Ollama base URL      |
| `FLOW_MODEL`   | `llama3.2`                      | Default model name   |

### Data

- Live memory: `app/data/memory.json` (gitignored)
- Schema example: `memory.example.json` (repo root) and `app/data/memory.example.json`
- Ghost receipts live only in `ghostReceipts` inside that file — never leave the device

---

## Landing page → Netlify (keep flowprivate.netlify.app)

Publish directory is **`landing`** (see `netlify.toml`).

```bash
netlify deploy --prod --dir=landing
```

Waitlist: Netlify Forms `name="waitlist"` — unchanged.

---

## Project layout

```
flow/
├── README.md
├── FEATURES.md             # Official 14 claim gate
├── PROOF.md                # M3 commands + Ghost 60s script
├── netlify.toml
├── .gitignore
├── memory.example.json
├── landing/
│   └── index.html
└── app/
    ├── package.json
    ├── server.js           # Node http, stdlib only
    ├── public/index.html   # Chat UI
    └── data/
        ├── memory.example.json
        └── memory.json     # runtime (gitignored)
```

---

## License

Optional / none for now. Built in public by a solo founder.

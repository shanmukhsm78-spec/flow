# FLOW v0

**You think. The world adjusts.**

Privacy-first **on-device AI** prototype. Model + memory stay on your machine. This app does not own your chats in the cloud.

**Stage:** idea / early prototype · **Building in public** · Honesty over hype.

Landing (keep URL): [https://flowprivate.netlify.app](https://flowprivate.netlify.app)

---

## Claim gate

**[FEATURES.md](./FEATURES.md)** is the only source of truth for LIVE / STUB / Coming. Do not pitch Phase 1 as six LIVE features.

## What’s built vs not built

### Built (v0)

- Apple-quiet five-screen landing + Netlify Forms waitlist (`landing/`) — name, email, ChatGPT question
- Local chat UI + tiny Node server (`app/`) — **zero npm dependencies**
- Proxy to local Ollama at `http://127.0.0.1:11434` (`/api/chat`)
- Persist messages + notes to `app/data/memory.json`
- Configurable model (UI field or `FLOW_MODEL` env)
- Clear errors when Ollama is down (no fake replies)
- **Ghost / Silence Mode** toggle labeled **Experimental** — **stub only** (dims UI + banner; not real stealth)

### Not built

- Cloud sync, accounts, or FLOW-hosted models
- Automatic “notices when stuck” / proactive help
- Long-term semantic memory that “remembers everything”
- Real Ghost / Silence Mode behavior
- Mobile apps, installers, auto-updates

---

## Prerequisites (MacBook Air M3)

- **macOS** on Apple Silicon (M3)
- **Node.js 18+** (check: `node -v`)
  - Optional via Homebrew: `brew install node`
- **Ollama** — [https://ollama.com](https://ollama.com)
- Browser (Safari / Chrome / Firefox)

Homebrew is optional; you can install Node and Ollama from their official installers.

---

## Run the on-device app

### 1) Install Ollama and a model

```bash
# Install Ollama (Mac): download from https://ollama.com or:
brew install ollama

# Start Ollama (app menu bar, or):
ollama serve

# In another terminal — pull a small capable default:
ollama pull llama3.2
```

Confirm:

```bash
curl http://127.0.0.1:11434/api/tags
```

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

Example:

```bash
FLOW_MODEL=llama3.2 PORT=8787 node server.js
```

### Data

- Live memory: `app/data/memory.json` (gitignored)
- Schema example: `memory.example.json` (repo root) and `app/data/memory.example.json`

---

## Landing page → Netlify (keep flowprivate.netlify.app)

Publish directory is **`landing`** (see `netlify.toml`).

### Deploy from CLI (when logged in)

```bash
# from repo root
netlify deploy --prod --dir=landing
# or link the site once, then:
netlify deploy --prod
```

### Deploy from Git

1. Connect the repo in Netlify
2. Build command: *(leave empty)*
3. Publish directory: `landing`
4. Keep existing site URL / custom domain pointing at **flowprivate.netlify.app**

### Waitlist form

- Netlify Forms: `name="waitlist"`, `netlify` / `data-netlify="true"`, hidden `form-name`
- Fields: **email** (required), **What would you never type into ChatGPT?** (`never_chatgpt`, required)
- Success: redirect / hash `#thanks` shows a thank-you message

Submissions appear in Netlify → Forms → **waitlist**.

---

## Project layout

```
flow/
├── README.md
├── netlify.toml
├── .gitignore
├── memory.example.json
├── landing/
│   └── index.html          # Honest marketing page
└── app/
    ├── package.json
    ├── server.js           # Native Node http (stdlib only)
    ├── public/
    │   └── index.html      # Chat UI
    └── data/
        ├── memory.example.json
        └── memory.json     # created at runtime (gitignored)
```

---

## Users & language

- Audience: students + founders
- Copy: global English
- Positioning: privacy-first on-device prototype — not vaporware claims

---

## License

Optional / none for now. Built in public by a solo founder.

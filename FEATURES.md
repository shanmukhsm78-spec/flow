# FLOW Official 14 — claim gate

**Source of truth for what we may say is LIVE / THIN LIVE / STUB / Coming.**  
If it is not listed here, do not pitch it as shipped on the page, in social, or in interviews.

Last updated: 2026-09-23 · Commit gate owner: Forge · Audit gate: Bench via Anchor

**Product law:** Brain / chats / Mnemosyne / Ghost receipts are **not** on a FLOW server. Local only via Ollama + `app/data/memory.json`.

No “world’s first,” no “beats GPT,” no finished “digital twin.”

---

## Official 14

| Name | Status | File path | How to demo | Must not claim |
|------|--------|-----------|-------------|----------------|
| **FLOW AI** | **LIVE** | `app/server.js`, `app/public/index.html` | `cd app && npm start` → open `http://127.0.0.1:8787` → send a chat (Ollama running). Replies inject Mnemosyne notes + Echo/Witness style into the system prompt. | Finished digital twin; cloud-hosted FLOW model; beats GPT |
| **Mnemosyne** | **LIVE** | `app/data/memory.json`, `app/server.js` | Show memory panel → notes + Ghost receipts; Save note; Delete note; Clear chat; Wipe memory. APIs: GET `/api/memory`, PUT settings/notes, DELETE messages/notes/all. | Cross-device sync; “remembers everything”; semantic long-term memory |
| **Ghost** | **THIN LIVE** | `app/public/index.html`, `app/server.js` | Silence off → **Simulate stuck** (or typing stall ≥10s / same string sent twice) → Ghost panel + tip → optional Ask FLOW → receipt in Show memory → delete receipt. Receipt path: local `ghostReceipts` only. | Full wifi-off stealth bar proven; invisible mode; cloud Ghost |
| **Silence Mode** | **THIN LIVE** | `app/public/index.html`, settings in memory.json | Toggle Silence ON → UI dims + banner “Ghost muted” → Simulate stuck → **no** Ghost / no receipt. Chat still works. | Full stealth / privacy OS; more than dim + Ghost block |
| **Echo** | **THIN LIVE** | settings `echoMode` → system prompt in `server.js` | Toggle Echo → chat; model asked to answer as future-self grounded in notes. | Finished Echo product; full life simulation |
| **Witness** | **THIN LIVE** | settings `witnessMode` → system prompt in `server.js` | Toggle Witness → chat; model asked to push back when useful. | Finished Witness product; always-right critic |
| **Temporal Cognition** | **Coming** | — | Roadmap label only (not clickable). | Any live capability |
| **Time-Fold** | **Coming** | — | Roadmap label only. | Any live capability |
| **Mirror Protocol** | **Coming** | — | Roadmap label only. | Any live capability |
| **Soul** | **Coming** | — | Roadmap label only. | Any live capability |
| **Causal AI** | **Coming** | — | Roadmap label only. | Any live capability |
| **Constellation** | **Coming** | — | Roadmap label only. | Any live capability |
| **Reflect** | **Coming** | — | Roadmap label only. | Any live capability |
| **Life Memory** | **Coming** | — | Roadmap label only. | Any live capability |

Phase 1 ships **6** features at LIVE or THIN LIVE. Phase 2–3 are **Coming** only — no fake working buttons.

---

## Honesty notes

- **Wifi-off chat:** needs local Ollama already installed and the model already pulled. FLOW does not download weights for you offline.
- **Ghost receipts:** written only to `app/data/memory.json` → `ghostReceipts`. Never leave the device. Architecture is local-only; do **not** mark Ghost as full wifi-off **proven** beyond that until Bench’s demo bar is met.
- **FLOW AI** answers using local memory context. It is **not** a finished digital twin.

---

## Bench regrade note

Full **Ghost** bar still wants **wifi-off demo proof** (Bench 12‑mo): Ghost works with wifi off + on-device receipt + memory delete. Until that proof is recorded, keep Ghost at **THIN LIVE** (stuck signal + help + receipt + Silence respect). Do not upgrade to full LIVE in this file without that proof.

12‑month proof Bench locked:

1. Ghost works with wifi off  
2. On-device receipt  
3. Memory delete (user can wipe local memory)

---

## App run (proof path)

```bash
cd app && npm start
# http://127.0.0.1:8787
# Ollama at 127.0.0.1:11434 · memory at app/data/memory.json
```

Health includes feature flags: `GET /api/health` → `features`.

Landing: https://flowprivate.netlify.app  
Repo: https://github.com/shanmukhsm78-spec/flow  
Proof script: [PROOF.md](./PROOF.md)

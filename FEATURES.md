# FLOW Official 14 — claim gate

**Source of truth for what we may say is LIVE / THIN LIVE / STUB / Coming.**  
If it is not listed here, do not pitch it as shipped on the page, in social, or in interviews.

Last updated: 2026-09-23 (Ghost → LIVE after wifi-off proof) · Commit gate owner: Forge · Audit gate: Bench via Anchor

**Product law:** Brain / chats / Mnemosyne / Ghost receipts are **not** on a FLOW server. Local only via Ollama + `app/data/memory.json`.

No “world’s first,” no “beats GPT,” no finished “digital twin.”

---

## Official 14

| Name | Status | File path | How to demo | Must not claim |
|------|--------|-----------|-------------|----------------|
| **FLOW AI** | **LIVE** | `app/server.js`, `app/public/index.html` | `cd app && npm start` → open `http://127.0.0.1:8787` → send a chat (Ollama running). Replies inject Mnemosyne notes + Echo/Witness style into the system prompt. | Finished digital twin; cloud-hosted FLOW model; beats GPT |
| **Mnemosyne** | **LIVE** | `app/data/memory.json`, `app/server.js` | Show memory panel → notes + Ghost receipts; Save note; Delete note; Clear chat; Wipe memory. APIs: GET `/api/memory`, PUT settings/notes, DELETE messages/notes/all. | Cross-device sync; “remembers everything”; semantic long-term memory |
| **Ghost** | **LIVE** | `app/public/index.html`, `app/server.js`, `scripts/wifi-off-proof.sh` | Wifi off → stuck/help/receipt OR `bash scripts/wifi-off-proof.sh` → receipt in memory.json → delete; Silence blocks Ghost (403). Proof log: `PROOF-wifi-off-20260923-130509.log` (2026-09-23). | Invisible OS stealth; cloud Ghost; “world’s first” |
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
- **Ghost receipts:** written only to `app/data/memory.json` → `ghostReceipts`. Never leave the device.
- **Wifi-off Ghost:** proven 2026-09-23 on founder Mac (Wi-Fi Off, public net fail, Ollama local, chat_ok, receipt + delete, Silence 403). Log: `PROOF-wifi-off-20260923-130509.log`.
- **FLOW AI** answers using local memory context. It is **not** a finished digital twin.

---

## Bench regrade note

**Ghost upgraded to LIVE** after wifi-off proof (2026-09-23):

1. Ghost works with wifi off — PASS (`Wi-Fi Power (en0): Off`, public fail, local Ollama + chat)
2. On-device receipt — PASS (`signal: wifi-off-proof` in memory.json)
3. Memory delete — PASS (receipt delete + clear messages in proof script)

Echo / Witness / Silence remain **THIN LIVE**. Regrade trigger met for Ghost.

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

# FLOW features — claim gate

**Source of truth for what we may say is LIVE.**  
If it is not listed LIVE (or THIN LIVE) here, do not pitch it as shipped on the page, in social, or in interviews.

Last updated: 2026-09-23 · Commit gate owner: Forge · Audit gate: Bench via Anchor

---

## Phase 1 (now)

| Name | Status | What is real today | Must not claim |
|------|--------|--------------------|----------------|
| **FLOW AI** | **LIVE** | Local chat UI → Ollama proxy → model on the machine. No FLOW cloud chat ownership. | “Digital twin,” finished product, cloud-hosted FLOW model |
| **Mnemosyne** | **THIN LIVE** | `app/data/memory.json` persists messages + notes; GET `/api/memory`; clear chat via DELETE `/api/memory/messages`; notes appendable in UI | Long-term semantic memory, “remembers everything,” cross-device sync |
| **Ghost** | **STUB / sci-fi** | Not implemented. Page may say building toward / not shipped only. | Wifi-off stealth, invisible mode, on-device receipt as shipped |
| **Silence Mode** | **STUB** | UI toggle dims the app + banner only. No real silence / stealth behavior. | Real silence, stealth, or privacy mode beyond UI chrome |
| **Echo** | **Coming** (Phase 2–3) | Not built. | Any live Echo capability |
| **Witness** | **Coming** (Phase 2–3) | Not built. | Any live Witness capability |

Phase 1 is **not** six LIVE features. Pitch only what this table marks LIVE or THIN LIVE.

---

## Phase 2–3

Label **Coming** only. No LIVE claims. No timelines as promises.

---

## Bench regrade triggers

Mark **Ghost** or **Mnemosyne** as **LIVE** in this file **only** when the matching proof exists:

- **Ghost LIVE:** wifi-off behavior + on-device receipt (Bench 12‑mo proof bar)
- **Mnemosyne LIVE** (beyond thin): stronger than file show/clear — only after product + Bench agree

Until then: Ghost stays STUB; Mnemosyne stays THIN LIVE at most.

---

## 12‑month proof Bench locked

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

Landing: https://flowprivate.netlify.app  
Repo: https://github.com/shanmukhsm78-spec/flow

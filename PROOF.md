# FLOW Official 14 Phase 1 — proof

Landing URL: **https://flowprivate.netlify.app**  
Local app: **http://127.0.0.1:8787**  
Memory: `app/data/memory.json` (gitignored, local only)

Ghost / Echo / Witness / Silence are **THIN LIVE**. Ghost is local-only architecture — not marked as full wifi-off proven beyond that.

---

## M3 run commands

```bash
# 1) Ollama (once)
# Install from https://ollama.com or: brew install ollama
ollama serve
# other terminal:
ollama pull llama3.2
curl http://127.0.0.1:11434/api/tags

# 2) FLOW
cd app
npm start
# open http://127.0.0.1:8787

# 3) Smoke
curl -s http://127.0.0.1:8787/api/health | head
curl -s http://127.0.0.1:8787/api/memory | head
```

Wifi-off chat only works if Ollama + model are already on the machine.

---

## Screenshot checklist

1. Header shows Official 14 · Phase 1; Echo / Witness / Silence toggles labeled Thin  
2. Health status line (Ollama reachable or clear error)  
3. Chat reply that reflects a saved Mnemosyne note  
4. Show memory panel: notes + Ghost receipt list  
5. Ghost panel after Simulate stuck (Silence off)  
6. Silence ON banner: “Ghost muted”  
7. Phase 2–3 Coming chips (not clickable as working features)  
8. Landing Phase 1 list matches FEATURES.md LIVE / THIN / Coming  

---

## 60-second Ghost script

Path in repo: **PROOF.md** (this section).

1. Silence **off**  
2. Click **Simulate stuck**  
3. See Ghost help panel (short local tip)  
4. Open **Show memory** → receipt listed under Ghost receipts  
5. **Delete receipt**  
6. Silence **on** → banner Ghost muted  
7. **Simulate stuck** again → **no** Ghost panel / **no** new receipt  
8. Chat still works while Silence is on  

Optional: typing stall (≥10s text in composer without send) or send the same pasted/error-like string twice.

---

## Must not claim in demos

- World’s first / beats GPT  
- Finished digital twin  
- Ghost full wifi-off proven (beyond local-only receipt path)  
- Phase 2–3 names as shipped

## Wifi-off proof (Bench bar) — run on the Mac yourself

Remote agents **cannot** turn Wi-Fi off for you: it drops the Mac link.

1. Start Ollama + FLOW while online: `ollama serve` · `cd app && npm start`
2. Turn **Wi-Fi Off** in Control Center
3. In Terminal: `bash scripts/wifi-off-proof.sh`
4. Confirm log shows: wifi Off, public net fail, Ollama ok, Ghost receipt+delete, chat reply, Silence 403
5. Turn **Wi-Fi On**, paste the log path to Forge

Until that log exists, Ghost stays **THIN LIVE** in FEATURES.md (not full LIVE).


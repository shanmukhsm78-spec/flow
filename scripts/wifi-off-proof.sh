#!/usr/bin/env bash
# FLOW Ghost wifi-off proof — run THIS on the Mac while Wi-Fi is OFF.
# Do not run via remote Grok session (turning Wi-Fi off drops the link).
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
APP="$ROOT/app"
HOST=127.0.0.1
PORT=8787
BASE="http://$HOST:$PORT"
OUT="$ROOT/PROOF-wifi-off-$(date +%Y%m%d-%H%M%S).log"

exec > >(tee "$OUT") 2>&1

echo "=== FLOW wifi-off proof ==="
echo "at: $(date -Iseconds 2>/dev/null || date)"
echo "wifi status:"
networksetup -getairportpower en0 2>/dev/null || true
echo "public net (expect fail):"
curl -s -m 3 -o /dev/null -w "example.com=%{http_code}\n" https://example.com || echo "example.com=fail_ok"

echo "ollama local:"
curl -s -m 5 "http://127.0.0.1:11434/api/tags" | python3 -c 'import sys,json; d=json.load(sys.stdin); print("models", [m["name"] for m in d.get("models") or []])' 

# ensure server
if ! curl -s -m 2 "$BASE/api/health" >/dev/null; then
  echo "starting FLOW server..."
  (cd "$APP" && node server.js >/tmp/flow-wifi-proof-server.log 2>&1 &) 
  sleep 1
fi

curl -s "$BASE/api/health" | python3 -m json.tool

# Silence off
curl -s -X PUT "$BASE/api/memory" -H 'Content-Type: application/json' -d '{"settings":{"silenceMode":false}}' >/dev/null

# Ghost receipt
REC=$(curl -s -X POST "$BASE/api/ghost/receipt" -H 'Content-Type: application/json' -d '{"signal":"wifi-off-proof","help":"local tip while offline"}')
echo "$REC" | python3 -m json.tool
RID=$(echo "$REC" | python3 -c 'import sys,json; print(json.load(sys.stdin)["receipt"]["id"])')

# Chat (needs local Ollama)
CHAT=$(curl -s -X POST "$BASE/api/chat" -H 'Content-Type: application/json' -d '{"message":"wifi-off proof ping — reply in five words max"}')
echo "$CHAT" | python3 -c 'import sys,json; j=json.load(sys.stdin); print("chat_ok", "reply" in j, "err", j.get("error")); print((j.get("reply") or "")[:200])'

# Delete receipt + clear messages
curl -s -X DELETE "$BASE/api/ghost/receipts/$RID" | python3 -c 'import sys,json; m=json.load(sys.stdin); print("receipts_after", len(m.get("ghostReceipts") or []))'
curl -s -X DELETE "$BASE/api/memory/messages" >/dev/null
echo "messages cleared"

# Silence blocks Ghost
curl -s -X PUT "$BASE/api/memory" -H 'Content-Type: application/json' -d '{"settings":{"silenceMode":true}}' >/dev/null
CODE=$(curl -s -o /tmp/ghost403.json -w "%{http_code}" -X POST "$BASE/api/ghost/receipt" -H 'Content-Type: application/json' -d '{"signal":"should-block","help":"no"}')
echo "silence_block_http=$CODE"
cat /tmp/ghost403.json; echo
curl -s -X PUT "$BASE/api/memory" -H 'Content-Type: application/json' -d '{"settings":{"silenceMode":false}}' >/dev/null

echo "=== PASS if: wifi Off, public fail, ollama models listed, ghost receipt+delete ok, chat reply ok, silence 403 ==="
echo "log: $OUT"
echo "Then turn Wi-Fi back ON and tell Forge the log path."

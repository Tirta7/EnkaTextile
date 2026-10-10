#!/usr/bin/env bash

cd "$(dirname "$0")"

export PATH="/Users/tirtaaditya/.local/node/bin:/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

clear
echo "=========================================================="
echo "          ENKATEXTILE / VOCpos - Restart Server           "
echo "=========================================================="
echo ""
echo "[1/3] Menghentikan proses server lama..."
PIDS=$(lsof -ti :8080 -ti :5174 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
fi
echo "[✓] Server lama berhasil dihentikan."

echo ""
echo "[2/3] Memeriksa status PostgreSQL..."
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    open -a Postgres 2>/dev/null || true
    sleep 3
fi
echo "[✓] PostgreSQL siap."

echo ""
echo "[3/3] Menyalakan kembali EnkaTextile (Backend: 8080, Frontend: 5174)..."
echo "----------------------------------------------------------"
echo "  URL Web   : http://localhost:5174"
echo "  Username  : admin"
echo "  Password  : vocpos2026"
echo "----------------------------------------------------------"
echo ""
echo "Browser akan terbuka otomatis dalam 3 detik..."
echo "Tekan Ctrl + C untuk menghentikan server."
echo "=========================================================="
echo ""

(sleep 3 && open http://localhost:5174) &

pnpm dev

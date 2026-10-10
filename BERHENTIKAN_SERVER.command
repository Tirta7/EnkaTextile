#!/usr/bin/env bash

cd "$(dirname "$0")"

clear
echo "=========================================================="
echo "          ENKATEXTILE / VOCpos - Stop Server              "
echo "=========================================================="
echo ""
echo "Sedang mematikan server EnkaTextile (Port 8080 & 5174)..."

PIDS=$(lsof -ti :8080 -ti :5174 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    echo ""
    echo "[✓] Semua server EnkaTextile (Backend & Frontend) berhasil dimatikan!"
else
    echo ""
    echo "[i] Server EnkaTextile memang sedang tidak berjalan."
fi

echo ""
echo "Port 8080 dan 5174 sudah bersih dan bebas."
echo "Anda bisa langsung menutup jendela ini (tekan Cmd + W atau klik tombol merah X)."
echo "=========================================================="
echo ""
exit 0

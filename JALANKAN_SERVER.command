#!/usr/bin/env bash

# Pindah ke folder project EnkaTextile
cd "$(dirname "$0")"

# Pastikan tool node, pnpm, dan postgres terbaca
export PATH="/Users/tirtaaditya/.local/node/bin:/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

clear
echo "=========================================================="
echo "          ENKATEXTILE / VOCpos - Server Startup           "
echo "=========================================================="
echo ""

# Periksa apakah PostgreSQL aktif
if ! pg_isready -h localhost -p 5432 >/dev/null 2>&1; then
    echo "[!] PostgreSQL belum aktif. Sedang membuka Postgres.app..."
    open -a Postgres 2>/dev/null || true
    sleep 3
fi

echo "[✓] PostgreSQL siap."
echo "[✓] Menyalakan Backend API (Port 8080) & Frontend (Port 5174)..."
echo ""
echo "----------------------------------------------------------"
echo "  URL Web   : http://localhost:5174"
echo "  Username  : admin"
echo "  Password  : vocpos2026"
echo "----------------------------------------------------------"
echo ""
echo "Browser akan terbuka otomatis dalam beberapa detik..."
echo "Jangan tutup jendela ini selama Anda menggunakan aplikasi."
echo "Untuk mematikan server: tekan Ctrl + C"
echo "=========================================================="
echo ""

# Buka browser otomatis ke http://localhost:5174 setelah delay 3 detik
(sleep 3 && open http://localhost:5174) &

# Jalankan server frontend dan backend bersamaan
pnpm dev

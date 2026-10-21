#!/usr/bin/env bash

cd "$(dirname "$0")"

clear
echo "=========================================================="
echo "    ENKATEXTILE / VOCpos - HARD RESTART (DOCKER)         "
echo "=========================================================="
echo ""
echo "  PERINGATAN KERAS (DATA AKAN DIHAPUS TOTAL):"
echo "  Tindakan ini akan mereset database Docker ke kondisi AWAL."
echo "  Semua data riwayat, stok, dan master akan DIHAPUS PERMANEN."
echo ""
echo "  Setelah reset selesai, akun admin bawaan adalah:"
echo "    Username : admin"
echo "    Password : vocpos2026"
echo "=========================================================="
echo ""
read -p "Ketik YAKIN lalu tekan Enter untuk melanjutkan: " CONFIRM

if [ "$CONFIRM" != "YAKIN" ] && [ "$CONFIRM" != "yakin" ]; then
    echo ""
    echo "[i] Dibatalkan. Tidak ada data yang diubah."
    echo ""
    read -p "Tekan Enter untuk menutup jendela ini..."
    exit 0
fi

echo ""
echo "[1/3] Menghapus container dan volume database Docker..."
docker compose down -v 2>/dev/null || docker-compose down -v

echo ""
echo "[2/3] Menyalakan kembali layanan Docker (Database & Aplikasi)..."
docker compose up -d 2>/dev/null || docker-compose up -d

echo ""
echo "[3/3] Menunggu aplikasi siap (10 detik)..."
sleep 10

echo ""
echo "=========================================================="
echo "  HARD RESTART DOCKER SELESAI!"
echo "  Aplikasi: http://localhost:8080"
echo "=========================================================="
echo ""

open http://localhost:8080 2>/dev/null || xdg-open http://localhost:8080 2>/dev/null || true

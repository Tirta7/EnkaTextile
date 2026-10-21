#!/usr/bin/env bash

# Pindah ke direktori project tempat file .command berada
cd "$(dirname "$0")"

# Setup PATH untuk Node.js, pnpm, dan PostgreSQL di macOS
export PATH="/Users/tirtaaditya/.local/node/bin:/Applications/Postgres.app/Contents/Versions/latest/bin:/usr/local/bin:/opt/homebrew/bin:$PATH"

clear
echo "=========================================================="
echo "    ENKATEXTILE / VOCpos - HARD RESTART / RESET FACTORY   "
echo "=========================================================="
echo ""
echo "  PERINGATAN KERAS (DATA AKAN DIHAPUS TOTAL):"
echo "  Tindakan ini akan mereset sistem ke kondisi AWAL PABRIK."
echo "  Semua data berikut akan DIHAPUS PERMANEN:"
echo "  - Semua Riwayat Penjualan, Pembelian, Kas, Hutang & Piutang"
echo "  - Semua Data Barang, Roll Kain, & Mutasi Stok"
echo "  - Semua Data Pelanggan & Supplier"
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
echo "[1/4] Menghentikan server EnkaTextile yang sedang aktif..."
PIDS=$(lsof -ti :8080 -ti :5174 2>/dev/null)
if [ -n "$PIDS" ]; then
    echo "$PIDS" | xargs kill -9 2>/dev/null || true
    sleep 1
fi
echo "[✓] Server lama berhasil dihentikan."

echo ""
echo "[2/4] Memeriksa koneksi PostgreSQL..."
if ! pg_isready -h 127.0.0.1 -p 5432 >/dev/null 2>&1; then
    open -a Postgres 2>/dev/null || true
    sleep 3
fi
echo "[✓] PostgreSQL aktif dan siap."

echo ""
echo "[3/4] Menjalankan pembersihan database & inisialisasi awal pabrik..."
pnpm --filter @workspace/api-server exec tsx --env-file=../../.env ../../scripts/factory-reset.ts

if [ $? -ne 0 ]; then
    echo ""
    echo "[X] Terjadi kesalahan saat mereset database."
    read -p "Tekan Enter untuk keluar..."
    exit 1
fi

echo ""
echo "[4/4] Menyalakan kembali Server EnkaTextile..."
echo "----------------------------------------------------------"
echo "  URL Web   : http://localhost:5174"
echo "  Username  : admin"
echo "  Password  : vocpos2026"
echo "----------------------------------------------------------"
echo ""
echo "Browser akan terbuka otomatis dalam 3 detik..."
echo "Tekan Ctrl + C di jendela ini untuk mematikan server."
echo "=========================================================="
echo ""

(sleep 3 && open http://localhost:5174) &

pnpm dev

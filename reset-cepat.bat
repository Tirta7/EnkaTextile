@echo off
setlocal enabledelayedexpansion

title VOCpos - Reset Database Bersih
color 0C

set PSQL="C:\Program Files\PostgreSQL\18\bin\psql.exe"

echo ============================================================
echo  PERINGATAN: Semua data akan DIHAPUS PERMANEN!
echo  (Penjualan, Barang, Pelanggan, Transaksi, dll)
echo ============================================================
echo.
set /p confirm="Ketik YAKIN lalu tekan Enter: "
if /i not "!confirm!"=="YAKIN" (
    echo Dibatalkan. Tidak ada data yang dihapus.
    pause
    exit /b
)

echo.
echo [1/3] Memutus semua koneksi aktif ke database avocpos...
set PGPASSWORD=vocpos2026
%PSQL% -h 127.0.0.1 -p 4538 -U postgres -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'avocpos' AND pid <> pg_backend_pid();"

echo.
echo [2/3] Menghapus dan membuat ulang database kosong...
%PSQL% -h 127.0.0.1 -p 4538 -U postgres -d postgres -c "DROP DATABASE IF EXISTS avocpos;"
%PSQL% -h 127.0.0.1 -p 4538 -U postgres -d postgres -c "CREATE DATABASE avocpos;"

echo.
echo [3/3] Membuat ulang tabel (schema) dari awal...
cd /d "d:\AVOCpos\Alma-Ecosystem"
pnpm --filter @workspace/db run push-force

echo.
echo ============================================================
echo RESET SELESAI! Database avocpos kini kosong bersih.
echo Silakan refresh browser aplikasi kasir Anda.
echo ============================================================
pause

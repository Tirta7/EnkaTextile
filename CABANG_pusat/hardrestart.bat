@echo off
setlocal enabledelayedexpansion

title VOCpos - Hard Restart
color 0C

echo ============================================================
echo   PERINGATAN: HARD RESTART (RESET SEMUA DATA)
echo ============================================================
echo Anda akan mereset SEMUA data dan aplikasi ke kondisi AWAL.
echo Semua riwayat penjualan, barang, pelanggan dll akan HILANG!
echo.
set /p confirm="Ketik YAKIN untuk melanjutkan: "
if /i not "!confirm!"=="YAKIN" (
    echo Dibatalkan.
    pause
    exit /b
)

echo.
echo [1/3] Menghapus Database Docker (Volume)...
docker-compose down -v
if %ERRORLEVEL% neq 0 (
    echo Gagal menghapus container docker.
)

echo [2/3] Membangun ulang dan menyalakan Database...
docker-compose up -d db

echo [3/3] Selesai
echo.
echo ============================================================
echo HARD RESTART SELESAI!
echo ============================================================
echo Silakan jalankan start-vocpos.bat kembali.
echo Sistem akan membuat tabel database baru pada saat start pertama kali.
echo.
pause

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

echo [2/3] Membangun ulang dan menyalakan seluruh sistem Docker...
docker-compose up -d
if %ERRORLEVEL% neq 0 (
    echo Gagal menyalakan docker. Pastikan Docker Desktop berjalan.
    pause
    exit /b 1
)

echo.
echo [3/3] Menunggu aplikasi siap (10 detik)...
timeout /t 10 /nobreak >nul

echo.
echo ============================================================
echo HARD RESTART SELESAI!
echo Database baru dan bersih telah diinisialisasi otomatis.
echo Akun Admin : admin / vocpos2026
echo Web App    : http://localhost:8080
echo ============================================================
echo.
start http://localhost:8080
pause

@echo off
setlocal
title Instalasi VOCpos (EnkaTextile)
color 0B

echo ========================================================
echo        INSTALASI VOCpos DENGAN DOCKER
echo ========================================================
echo.

:: Cek apakah Docker sudah terinstall
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Docker tidak ditemukan di PC ini!
    echo Silakan install Docker Desktop terlebih dahulu dari:
    echo https://www.docker.com/products/docker-desktop/
    echo.
    pause
    exit /b 1
)

echo [INFO] Docker ditemukan. Memulai proses instalasi dan build...
echo [INFO] Proses ini mungkin memakan waktu beberapa menit, tergantung kecepatan internet dan PC Anda.
echo.

:: Menjalankan docker-compose
docker-compose up -d --build

if %errorlevel% neq 0 (
    echo.
    echo [ERROR] Terjadi kesalahan saat membangun aplikasi. Pastikan Docker Desktop sedang berjalan!
    pause
    exit /b 1
)

echo.
echo ========================================================
echo        INSTALASI SELESAI & APLIKASI BERJALAN!
echo ========================================================
echo.
echo [INFO] Menunggu sistem melakukan inisialisasi awal (10 detik)...
timeout /t 10 /nobreak >nul

echo [INFO] Membuka browser ke halaman VOCpos...
start http://localhost:8080

echo.
echo Anda dapat menutup jendela terminal ini.
pause

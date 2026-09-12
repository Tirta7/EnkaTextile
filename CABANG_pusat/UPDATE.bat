@echo off
setlocal enabledelayedexpansion

:: SELF-ELEVATION
net session >nul 2>&1
if %errorlevel% neq 0 (
    powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process cmd.exe -ArgumentList '/c \"%~f0\" & pause' -Verb RunAs -Wait"
    exit /b 0
)

chcp 437 >nul 2>&1
title EnkaTextile - Update Aplikasi
color 0E
set "INSTALL_DIR=%~dp0"
cd /d "%INSTALL_DIR%"

:: Konfigurasi Hardcoded dari EnkaTextile
set "GITHUB_TOKEN="
set "GITHUB_USERNAME=tirta7"
set "GDRIVE_FOLDER_ID="

echo.
echo  ============================================================
echo    ENKATEXTILE SYSTEM - Update ke Versi Terbaru
echo  ============================================================
echo.

if "!GITHUB_TOKEN!"=="" (
    set /p "GITHUB_TOKEN=  Masukkan GitHub Token: "
)

echo  [1/3] Login ke GitHub Container Registry (ghcr.io)...
echo !GITHUB_TOKEN! | docker login ghcr.io -u !GITHUB_USERNAME! --password-stdin
if errorlevel 1 (
    echo  [ERROR] Gagal login. Pastikan token masih valid.
    pause & exit /b 1
)

echo  [2/3] Mengunduh update terbaru...
docker compose -f "%INSTALL_DIR%docker-compose.yml" pull
if errorlevel 1 (
    echo  [ERROR] Gagal mengunduh update.
    pause & exit /b 1
)

echo  [3/3] Restart layanan dengan versi baru...
docker compose -f "%INSTALL_DIR%docker-compose.yml" up -d
if errorlevel 1 (
    echo  [ERROR] Gagal restart layanan.
    pause & exit /b 1
)

echo.
echo  [OK] Update selesai! Menunggu 15 detik...
timeout /t 15 /nobreak >nul

echo.
echo  ============================================================
echo   Update berhasil! Aplikasi berjalan dengan versi terbaru.
echo  ============================================================
echo.
start http://localhost:8080
pause >nul
endlocal

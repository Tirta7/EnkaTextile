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

echo.
echo  ============================================================
echo    ENKATEXTILE SYSTEM - Update ke Versi Terbaru
echo  ============================================================
echo.

if "!GITHUB_TOKEN!"=="" (
    set /p "GITHUB_TOKEN=  Masukkan GitHub Token: "
)

:: ─── STEP 0: Backup database SEBELUM update ────────────────────────────────
echo  [0/4] Backup database sebelum update...
if not exist "%INSTALL_DIR%backups" mkdir "%INSTALL_DIR%backups"
for /f "tokens=1-3 delims=/ " %%a in ("%date%") do set TGLNOW=%%c%%a%%b
for /f "tokens=1-2 delims=:." %%a in ("%time: =0%") do set JAMNOW=%%a%%b
set "BACKUP_FILE=%INSTALL_DIR%backups\backup_before_update_%TGLNOW%_%JAMNOW%.sql"

docker exec vocpos-db pg_dump -U postgres vocpos > "%BACKUP_FILE%" 2>nul
if exist "%BACKUP_FILE%" (
    echo  [OK] Backup tersimpan: %BACKUP_FILE%
) else (
    echo  [WARN] Backup gagal - lanjutkan dengan hati-hati
)
echo.

:: ─── STEP 1: Login GitHub ───────────────────────────────────────────────────
echo  [1/4] Login ke GitHub Container Registry (ghcr.io)...
echo !GITHUB_TOKEN! | docker login ghcr.io -u !GITHUB_USERNAME! --password-stdin
if errorlevel 1 (
    echo  [ERROR] Gagal login. Pastikan token masih valid.
    pause & exit /b 1
)
echo.

:: ─── STEP 2: Download update ────────────────────────────────────────────────
echo  [2/4] Mengunduh update terbaru (hanya image app)...
docker pull ghcr.io/tirta7/enkatextile:latest
if errorlevel 1 (
    echo  [ERROR] Gagal mengunduh update.
    pause & exit /b 1
)
echo.

:: ─── STEP 3: Restart HANYA container app (DB tetap berjalan) ────────────────
echo  [3/4] Restart aplikasi saja (database TIDAK disentuh)...
docker stop vocpos-app 2>nul
docker rm vocpos-app 2>nul
docker compose -f "%INSTALL_DIR%docker-compose.yml" up -d --no-deps app
if errorlevel 1 (
    echo  [ERROR] Gagal restart layanan.
    pause & exit /b 1
)
echo.

:: ─── STEP 4: Selesai ────────────────────────────────────────────────────────
echo  [4/4] Menunggu aplikasi siap (15 detik)...
timeout /t 15 /nobreak >nul

echo.
echo  ============================================================
echo   Update berhasil! Aplikasi berjalan dengan versi terbaru.
echo   Backup data tersimpan di folder: backups\
echo  ============================================================
echo.
start http://localhost:8080
pause >nul
endlocal

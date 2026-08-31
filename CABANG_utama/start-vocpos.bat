@echo off
title VOCpos - Server Produksi
color 0b
setlocal enabledelayedexpansion

echo =================================================================
echo                    VOCpos - VIRTUAL OPERATIONAL CONTROL
echo                        Sistem Startup Otomatis
echo =================================================================
echo.

echo [1/2] Menyalakan Sistem...
docker-compose up -d
if %ERRORLEVEL% neq 0 (
  color 0c
  echo.
  echo [ERROR] Gagal menyalakan sistem! Pastikan Docker sudah berjalan.
  pause
  exit /b %ERRORLEVEL%
)

echo.
echo [2/2] Mencari IP Address Anda di Jaringan Lokal...
set LOCAL_IP=127.0.0.1
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.InterfaceAlias -notmatch 'vEthernet' -and $_.IPAddress -notmatch '^169\.254\.' } | Select-Object -First 1).IPAddress"`) do set LOCAL_IP=%%a

if "!LOCAL_IP!"=="" set LOCAL_IP=127.0.0.1

echo.
color 0a
echo =================================================================
echo                 APLIKASI SUDAH AKTIF DAN BERJALAN!
echo =================================================================
echo.
echo Anda bisa mengakses aplikasi ini dari Komputer / Tablet / HP lain 
echo yang terhubung di jaringan WiFi yang sama dengan alamat berikut:
echo.
echo     LAN / WiFi  : http://!LOCAL_IP!:8080
echo     Komputer Ini: http://localhost:8080
echo.
echo =================================================================
echo CATATAN: Jendela ini boleh ditutup karena sistem berjalan di Docker.
echo =================================================================
echo.
pause

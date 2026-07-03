@echo off
title VOCpos - Server Produksi
color 0b
setlocal enabledelayedexpansion

echo =================================================================
echo                    VOCpos - VIRTUAL OPERATIONAL CONTROL
echo                        Sistem Startup Otomatis
echo =================================================================
echo.

echo [1/3] Mencari IP Address Anda di Jaringan Lokal...
set LOCAL_IP=127.0.0.1
for /f "usebackq tokens=*" %%a in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'Loopback' -and $_.InterfaceAlias -notmatch 'vEthernet' -and $_.IPAddress -notmatch '^169\.254\.' } | Select-Object -First 1).IPAddress"`) do set LOCAL_IP=%%a

if "!LOCAL_IP!"=="" set LOCAL_IP=127.0.0.1

echo IP Address terdeteksi: !LOCAL_IP!
echo.

echo [2/3] Memadatkan File Aplikasi (Building)...
echo Harap tunggu, proses ini butuh waktu beberapa detik...
call pnpm --filter @workspace/tmcpos --filter @workspace/api-server run build
if %ERRORLEVEL% neq 0 (
  color 0c
  echo.
  echo [ERROR] Gagal melakukan proses build!
  echo Pastikan semua instalasi sudah benar.
  pause
  exit /b %ERRORLEVEL%
)

echo.
color 0a
echo [3/3] Server Berhasil Disiapkan!
echo.
echo =================================================================
echo                 APLIKASI SUDAH AKTIF DAN BERJALAN!
echo =================================================================
echo.
echo Anda bisa mengakses aplikasi ini dari Komputer / Tablet / HP lain 
echo yang terhubung di jaringan WiFi yang sama dengan alamat berikut:
echo.
echo     LAN / WiFi : http://!LOCAL_IP!:8080
echo     Komputer Ini: http://localhost:8080
echo.
echo =================================================================
echo CATATAN: JANGAN TUTUP LAYAR HITAM INI SELAMA APLIKASI DIGUNAKAN!
echo =================================================================
echo.

call pnpm --filter @workspace/api-server run start:prod

pause

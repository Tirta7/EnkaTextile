@echo off
title VOCpos - Development Mode
color 0e
setlocal enabledelayedexpansion

echo =================================================================
echo                    VOCpos - DEVELOPMENT MODE
echo                        (Hot Reloading Aktif)
echo =================================================================
echo.
echo Mode ini digunakan khusus untuk MENGEDIT KODINGAN.
echo - File Web/Frontend akan otomatis update tanpa perlu restart!
echo - Aksesnya melalui port 5173.
echo.
echo Membuka 2 jendela baru untuk menjalankan Frontend dan Backend...
echo.

:: Jalankan API Server di jendela baru
start "VOCpos Backend API" cmd /k "color 0b & pnpm --filter @workspace/api-server run dev"

:: Jalankan Vite Frontend di jendela baru
start "VOCpos Frontend Vite" cmd /k "color 0a & pnpm --filter @workspace/tmcpos run dev"

echo =================================================================
echo SEMUA SERVER DEV SUDAH BERJALAN!
echo.
echo Silakan buka browser dan akses aplikasi Anda di:
echo     http://localhost:5173
echo.
echo Kodingan frontend (TMCpos) yang Anda edit akan otomatis terupdate 
echo di browser tanpa perlu merestart apapun!
echo =================================================================
pause

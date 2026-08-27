@echo off
title Cloudflare Tunnel - VOCpos
echo ===================================================
echo Memulai Cloudflare Tunnel untuk VOCpos dan VOC Billiard...
echo Akses VOCpos: https://enkatextile.co.id
echo ===================================================
echo JANGAN TUTUP JENDELA INI SELAMA INGIN DIAKSES DARI LUAR
echo ===================================================

:: Mencari nama network docker-compose yang sedang berjalan untuk menyambungkan tunnel
for /f "tokens=1" %%i in ('docker network ls --format "{{.Name}}" ^| findstr /i "default" ^| findstr /v "bridge"') do set "DOCKER_NET=%%i"
if "%DOCKER_NET%"=="" (
    echo [ERROR] Tidak dapat menemukan network docker untuk aplikasi. Pastikan aplikasi sudah berjalan (install.bat / docker-compose up).
    pause
    exit /b
)

docker run -it --rm --name cloudflare-tunnel --network %DOCKER_NET% -v "%~dp0cloudflare:/etc/cloudflared" cloudflare/cloudflared:latest tunnel run
pause

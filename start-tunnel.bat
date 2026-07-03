@echo off
title Cloudflare Tunnel - VOCpos
echo ===================================================
echo Memulai Cloudflare Tunnel untuk VOCpos dan VOC Billiard...
echo Akses VOCpos: https://enkatextile.vocbilliard.online
echo ===================================================
echo JANGAN TUTUP JENDELA INI SELAMA INGIN DIAKSES DARI LUAR
echo ===================================================
d:\Billiard_APPS\cloudflared.exe tunnel --config d:\Billiard_APPS\config.yml run
pause

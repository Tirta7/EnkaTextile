@echo off
setlocal enabledelayedexpansion

title FRANCHISE GENERATOR - ENKATEXTILE
color 0B

echo ============================================================
echo   SISTEM PEMBUAT CABANG OTOMATIS (ENKATEXTILE FRANCHISE)
echo ============================================================
echo.
echo Alat ini akan menggandakan folder installer, mendaftarkan
echo domain baru, dan mem-bypass sistem kartu kredit Cloudflare
echo secara otomatis dalam hitungan detik!
echo.

set /p BRANCH="Masukkan nama kota cabang (ketik 'utama' atau 'pusat' untuk cabang utama): "
if "!BRANCH!"=="" (
    echo Nama cabang tidak boleh kosong!
    pause
    exit /b
)

set "DOMAIN=!BRANCH!.enkatextile.co.id"
if /i "!BRANCH!"=="utama" set "DOMAIN=enkatextile.co.id"
if /i "!BRANCH!"=="pusat" set "DOMAIN=enkatextile.co.id"

echo.
echo [1/4] Membuat Cloudflare Tunnel baru bernama "!BRANCH!-enka"...
cloudflared tunnel create !BRANCH!-enka > temp_tunnel_output.txt 2>&1

set "TUNNEL_UUID="
for /f "tokens=6" %%a in ('findstr /c:"Created tunnel" temp_tunnel_output.txt') do set "TUNNEL_UUID=%%a"

if "!TUNNEL_UUID!"=="" (
    echo.
    echo [ERROR] Gagal membuat tunnel. Kemungkinan besar nama "!BRANCH!-enka" sudah pernah dibuat sebelumnya!
    echo Silakan gunakan nama lain atau cek file temp_tunnel_output.txt
    type temp_tunnel_output.txt
    pause
    exit /b
)

echo [OK] Tunnel berhasil diciptakan! ID: !TUNNEL_UUID!
echo.

echo [2/4] Mendaftarkan Domain DNS ke satelit Cloudflare...
cloudflared tunnel route dns !BRANCH!-enka !DOMAIN!
echo [OK] Domain !DOMAIN! berhasil didaftarkan!
echo.

echo [3/4] Menggandakan folder "TEMPLATE_CABANG" menjadi "CABANG_!BRANCH!"...
set "TARGET_DIR=CABANG_!BRANCH!"
xcopy "TEMPLATE_CABANG" "!TARGET_DIR!\" /E /I /H /Y /Q >nul
echo [OK] Folder berhasil digandakan!
echo.

echo [4/4] Memasukkan konfigurasi rahasia khusus cabang !BRANCH!...
:: Menyuntikkan credential rahasia
copy "C:\Users\%USERNAME%\.cloudflared\!TUNNEL_UUID!.json" "!TARGET_DIR!\cloudflare\credentials.json" >nul

:: Membuat config.yml khusus Docker cabang
(
  echo tunnel: !TUNNEL_UUID!
  echo credentials-file: /etc/cloudflared/credentials.json
  echo.
  echo ingress:
  echo   - hostname: !DOMAIN!
  echo     service: http://app:8080
  echo   - service: http_status:404
) > "!TARGET_DIR!\cloudflare\config.yml"

del temp_tunnel_output.txt >nul 2>&1

echo [OK] Konfigurasi berhasil disuntikkan!
echo.
echo ============================================================
echo   SELESAI! AJAIB!
echo ============================================================
echo Folder instalasi khusus untuk !BRANCH! sudah matang:
echo %CD%\!TARGET_DIR!
echo.
echo Anda tinggal masuk ke dalam folder tersebut, dan mengkopi 
echo folder CABANG_!BRANCH! ke Flashdisk untuk dikirim ke lokasi!
echo.
echo Di PC tujuan, cukup jalankan 'install.bat', maka aplikasi
echo otomatis online di https://!DOMAIN!
echo tanpa perlu repot menjalankan tunnel secara manual lagi!
echo ============================================================
pause

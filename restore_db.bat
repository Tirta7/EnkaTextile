@echo off
setlocal enabledelayedexpansion

REM ==========================================
REM RESTORE POSTGRESQL - ENKATEXTILE SYSTEM
REM v2 - Safe Restore: DATA ONLY (schema tetap dari migrasi)
REM ==========================================

REM ── Kredensial Database ──────────────────
set DB_USER=postgres
set DB_NAME=vocpos

REM ── Konfigurasi Docker ───────────────────
set CONTAINER_NAME=vocpos-db
set APP_CONTAINER=vocpos-app
set PGPASSWORD_DOCKER=vocpos2026

REM ── Konfigurasi Lokal ────────────────────
set DB_HOST=localhost
set DB_PORT=5432
set PGPASSWORD_LOCAL=vocpos2026
set PG_PSQL_EXE=C:\Program Files\PostgreSQL\18\bin\psql.exe

REM ── Folder Backup ─────────────────────────
set BACKUP_DIR=%~dp0backups

REM ==========================================
REM AUTO-DETECT: Docker atau Lokal?
REM ==========================================
set USE_DOCKER=no
where docker >nul 2>&1
if %ERRORLEVEL% equ 0 (
    for /f "delims=" %%R in ('docker inspect --format={{.State.Running}} %CONTAINER_NAME% 2^>nul') do set DOCKER_RUNNING=%%R
    if "!DOCKER_RUNNING!"=="true" set USE_DOCKER=yes
)

:start_menu
cls
echo.
echo =======================================================
echo      MENU RESTORE DATABASE - ENKATEXTILE v2
echo =======================================================
if "!USE_DOCKER!"=="yes" (
    echo  Mode    : DOCKER (Container: %CONTAINER_NAME%)
) else (
    echo  Mode    : LOKAL (Host: %DB_HOST%:%DB_PORT%)
)
echo =======================================================
echo.
echo  [1] Restore AMAN    - data saja, schema dari migrasi (DIREKOMENDASIKAN)
echo  [2] Restore PENUH   - data + schema dari file backup (versi lama saja)
echo  [3] Keluar
echo.
set /p PILIHAN="Pilih menu [1/2/3]: "

if "!PILIHAN!"=="3" exit /b
if "!PILIHAN!"=="1" goto :mode_safe
if "!PILIHAN!"=="2" goto :mode_full
goto :start_menu

REM ==========================================
REM MODE 1: RESTORE AMAN (data-only)
REM Cocok untuk restore backup lama ke versi aplikasi terbaru
REM ==========================================
:mode_safe
cls
echo.
echo =======================================================
echo   RESTORE AMAN - Data Only
echo   Schema tabel tetap dari migrasi versi terbaru.
echo   Cocok untuk: backup lama ke aplikasi versi baru.
echo =======================================================
echo.
goto :pilih_file

REM ==========================================
REM MODE 2: RESTORE PENUH (schema + data)
REM Hanya cocok jika backup dari versi yang SAMA
REM ==========================================
:mode_full
cls
echo.
echo =======================================================
echo   RESTORE PENUH - Schema + Data
echo   PERINGATAN: Hanya gunakan jika backup dari
echo   versi aplikasi yang SAMA persis!
echo =======================================================
echo.
goto :pilih_file

:pilih_file
REM Cek folder backups
if not exist "%BACKUP_DIR%" (
    echo [ERROR] Folder backups tidak ditemukan!
    pause & exit /b
)

echo DAFTAR FILE BACKUP YANG TERSEDIA:
echo -------------------------------------------------------
set FILE_COUNT=0
for %%F in ("%BACKUP_DIR%\*.sql") do (
    set /a FILE_COUNT+=1
    echo  !FILE_COUNT!. %%~nxF
)
echo -------------------------------------------------------
echo.
if !FILE_COUNT! equ 0 (
    echo [ERROR] Tidak ada file .sql di folder backups!
    pause & exit /b
)

echo Ketik/Paste nama file yang ingin di-restore (lengkap dengan .sql):
set /p TARGET_FILE="> "
if "!TARGET_FILE!"=="" (
    echo [BATAL] Tidak ada file yang dipilih.
    pause & exit /b
)
if /i "!TARGET_FILE:~-4!" neq ".sql" set TARGET_FILE=!TARGET_FILE!.sql

set BACKUP_PATH=%BACKUP_DIR%\%TARGET_FILE%
if not exist "%BACKUP_PATH%" (
    echo [ERROR] File '!TARGET_FILE!' tidak ditemukan!
    pause & exit /b
)

echo.
echo =======================================================
echo                   !! PERINGATAN !!
echo =======================================================
if "!PILIHAN!"=="1" (
    echo  Mode     : AMAN - hanya data, schema dari migrasi
) else (
    echo  Mode     : PENUH - schema + data dari file backup
    echo  RISIKO   : Jika backup dari versi lama, kolom baru
    echo             akan hilang setelah restore!
)
echo  File     : !TARGET_FILE!
echo  Database : %DB_NAME%
echo.
echo  Semua data yang ada saat ini akan TERTIMPA!
echo =======================================================
echo.
set /p CONFIRM="Ketik YES untuk lanjutkan: "
if /i "!CONFIRM!" neq "YES" (
    echo [BATAL] Proses restore dibatalkan.
    pause & exit /b
)

echo.
echo Sedang memproses restore... Mohon tunggu...
echo.

if "!USE_DOCKER!"=="yes" (
    goto :docker_restore
) else (
    goto :local_restore
)

REM ─── DOCKER RESTORE ───────────────────────────────────────────────────────
:docker_restore
echo Mode: DOCKER (Container: %CONTAINER_NAME%)
echo.

if "!PILIHAN!"=="1" (
    REM === RESTORE AMAN: hapus data saja, schema tetap ===
    echo [1/4] Menghentikan app sementara...
    docker stop %APP_CONTAINER% >nul 2>&1

    echo [2/4] Menghapus data lama (TRUNCATE semua tabel)...
    docker exec -e PGPASSWORD=%PGPASSWORD_DOCKER% %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% -c ^
        "DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '__drizzle_migrations') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END $$;" >nul 2>&1
    echo  -> Data lama dihapus, tabel dan schema tetap ada.

    echo [3/4] Menyalin file backup ke container...
    docker cp "%BACKUP_PATH%" %CONTAINER_NAME%:/tmp/restore_target.sql

    echo [4/4] Memuat data saja dari backup...
    REM Extract hanya INSERT statements dari backup
    docker exec %CONTAINER_NAME% sh -c "grep -E '^(INSERT INTO|COPY |\\\\.)' /tmp/restore_target.sql > /tmp/data_only.sql; psql -U %DB_USER% -d %DB_NAME% -f /tmp/data_only.sql; rm -f /tmp/restore_target.sql /tmp/data_only.sql" 2>nul
    set RESTORE_ERR=!ERRORLEVEL!

    echo  -> Memulai ulang aplikasi...
    docker start %APP_CONTAINER% >nul 2>&1

) else (
    REM === RESTORE PENUH: drop + recreate ===
    echo [1/3] Menghapus database lama dan membuat ulang...
    docker exec -e PGPASSWORD=%PGPASSWORD_DOCKER% %CONTAINER_NAME% psql -U %DB_USER% -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='%DB_NAME%' AND pid <> pg_backend_pid();" >nul 2>&1
    docker exec -e PGPASSWORD=%PGPASSWORD_DOCKER% %CONTAINER_NAME% psql -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;" >nul 2>&1
    docker exec -e PGPASSWORD=%PGPASSWORD_DOCKER% %CONTAINER_NAME% psql -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;" >nul 2>&1
    echo  -> Database direset.

    echo [2/3] Menyalin file backup ke container...
    docker cp "%BACKUP_PATH%" %CONTAINER_NAME%:/tmp/restore_target.sql

    echo [3/3] Memuat backup penuh...
    docker exec -e PGPASSWORD=%PGPASSWORD_DOCKER% %CONTAINER_NAME% psql -U %DB_USER% -d %DB_NAME% -f /tmp/restore_target.sql
    set RESTORE_ERR=!ERRORLEVEL!
    docker exec %CONTAINER_NAME% rm -f /tmp/restore_target.sql >nul 2>&1

    echo  -> Menjalankan migrasi untuk sinkronisasi schema...
    docker restart %APP_CONTAINER% >nul 2>&1
)

goto :selesai

REM ─── LOCAL RESTORE ────────────────────────────────────────────────────────
:local_restore
echo Mode: LOKAL (Host: %DB_HOST%, Port: %DB_PORT%)
echo.
if not exist "%PG_PSQL_EXE%" (
    where psql >nul 2>&1
    if %ERRORLEVEL% equ 0 (set PG_PSQL_EXE=psql) else (
        echo [ERROR] psql tidak ditemukan. Install PostgreSQL client.
        pause & exit /b
    )
)
set PGPASSWORD=%PGPASSWORD_LOCAL%

if "!PILIHAN!"=="1" (
    echo [1/2] Menghapus data lama (TRUNCATE semua tabel)...
    "%PG_PSQL_EXE%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c ^
        "DO $$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '__drizzle_migrations') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END $$;" >nul 2>&1
    echo [2/2] Memuat data dari backup...
    "%PG_PSQL_EXE%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -c "\i %BACKUP_PATH%"
) else (
    echo [1/2] Menghapus dan membuat ulang database...
    "%PG_PSQL_EXE%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "DROP DATABASE IF EXISTS %DB_NAME%;" >nul 2>&1
    "%PG_PSQL_EXE%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d postgres -c "CREATE DATABASE %DB_NAME%;" >nul 2>&1
    echo [2/2] Memuat backup penuh...
    "%PG_PSQL_EXE%" -h %DB_HOST% -p %DB_PORT% -U %DB_USER% -d %DB_NAME% -f "%BACKUP_PATH%"
)

:selesai
echo.
echo =======================================================
echo  [SELESAI] Proses restore selesai!
echo  File    : !TARGET_FILE!
echo  Mode    : !PILIHAN!
echo =======================================================
echo.
if "!PILIHAN!"=="2" (
    echo  PENTING: Restart aplikasi agar schema tersinkronisasi:
    if "!USE_DOCKER!"=="yes" echo    docker restart %APP_CONTAINER%
)
echo.
pause
endlocal

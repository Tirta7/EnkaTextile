#!/usr/bin/env bash
set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

DB_USER="postgres"
DB_NAME="avocpos"
DB_HOST="127.0.0.1"
DB_PORT="5432"
export PGPASSWORD="vocpos2026"
BACKUP_DIR="$DIR/backups"

echo "======================================================="
echo "      RESTORE DATABASE - ENKATEXTILE / VOCpos (macOS)  "
echo "======================================================="
echo "Database: $DB_NAME ($DB_HOST:$DB_PORT)"
echo ""
echo "[1] Restore AMAN   - Data saja (schema tetap dari migrasi)"
echo "[2] Restore PENUH  - Data + Schema lengkap dari file backup"
echo "[3] Keluar"
echo ""
read -p "Pilih menu [1/2/3]: " PILIHAN

if [ "$PILIHAN" = "3" ]; then
    echo "Dibatalkan."
    exit 0
fi

if [ ! -d "$BACKUP_DIR" ]; then
    echo "[ERROR] Folder backups tidak ditemukan!"
    exit 1
fi

echo ""
echo "DAFTAR FILE BACKUP YANG TERSEDIA:"
echo "-------------------------------------------------------"
files=("$BACKUP_DIR"/*.sql)
idx=1
for f in "${files[@]}"; do
    if [ -f "$f" ]; then
        echo "  $idx. $(basename "$f")"
        idx=$((idx+1))
    fi
done
echo "-------------------------------------------------------"
echo ""
read -p "Masukkan nama file backup (misal: avocpos_backup_20260914_192539.sql): " TARGET_FILE

if [ -z "$TARGET_FILE" ]; then
    echo "[BATAL] Tidak ada file yang dipilih."
    exit 1
fi

case "$TARGET_FILE" in
    *.sql) ;;
    *) TARGET_FILE="${TARGET_FILE}.sql" ;;
esac

BACKUP_PATH="$BACKUP_DIR/$TARGET_FILE"
if [ ! -f "$BACKUP_PATH" ]; then
    echo "[ERROR] File '$TARGET_FILE' tidak ditemukan di folder backups!"
    exit 1
fi

echo ""
echo "PERINGATAN: Semua data di database '$DB_NAME' akan ditimpa dengan '$TARGET_FILE'!"
read -p "Ketik YES untuk melanjutkan: " CONFIRM
if [ "$CONFIRM" != "YES" ] && [ "$CONFIRM" != "yes" ]; then
    echo "[BATAL] Proses restore dibatalkan."
    exit 0
fi

echo "Memproses restore database..."

if [ "$PILIHAN" = "1" ]; then
    echo "[1/2] Menghapus data lama (TRUNCATE)..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c \
        "DO \$\$ DECLARE r RECORD; BEGIN FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname='public' AND tablename != '__drizzle_migrations') LOOP EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE'; END LOOP; END \$\$;" >/dev/null 2>&1 || true
    echo "[2/2] Memuat data backup..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_PATH"
else
    echo "[1/3] Menghapus dan membuat ulang database..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname='$DB_NAME' AND pid <> pg_backend_pid();" >/dev/null 2>&1 || true
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "DROP DATABASE IF EXISTS $DB_NAME;" >/dev/null 2>&1 || true
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d postgres -c "CREATE DATABASE $DB_NAME OWNER $DB_USER;" >/dev/null 2>&1 || true
    echo "[2/3] Memuat backup penuh..."
    psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$BACKUP_PATH"
    echo "[3/3] Menyelaraskan skema migrasi..."
    pnpm --filter @workspace/db run push || true
fi

echo ""
echo "======================================================="
echo " [SELESAI] Restore database selesai dengan sukses!"
echo "======================================================="

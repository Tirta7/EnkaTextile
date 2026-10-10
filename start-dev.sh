#!/usr/bin/env bash
set -e

# Change directory to the root of the repository
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

echo "=========================================================="
echo "          ENKATEXTILE / VOCpos - Development Server       "
echo "=========================================================="
echo ""
echo "Memulai Backend API (Port 8080) dan Frontend Vite (Port 5174)..."
echo "Akses aplikasi di browser: http://localhost:5174"
echo "Login default:"
echo "  Username : admin"
echo "  Password : vocpos2026"
echo ""
echo "Tekan Ctrl+C untuk menghentikan server."
echo "=========================================================="
echo ""

pnpm dev

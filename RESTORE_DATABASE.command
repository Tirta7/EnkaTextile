#!/usr/bin/env bash

cd "$(dirname "$0")"

export PATH="/Users/tirtaaditya/.local/node/bin:/Applications/Postgres.app/Contents/Versions/latest/bin:$PATH"

./restore_db.sh

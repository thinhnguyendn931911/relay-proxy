#!/usr/bin/env bash
set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/relay-proxy}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"

mkdir -p "$BACKUP_DIR"
STAMP=$(date +%Y%m%d-%H%M%S)
DEST="$BACKUP_DIR/relay-proxy-$STAMP.sql.gz"

pg_dump "$DATABASE_URL" | gzip > "$DEST"
echo "Backup saved to $DEST"

find "$BACKUP_DIR" -name "relay-proxy-*.sql.gz" -mtime "+$RETAIN_DAYS" -delete
echo "Cleaned backups older than $RETAIN_DAYS days"

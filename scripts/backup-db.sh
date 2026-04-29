#!/usr/bin/env bash
# Daily Postgres backup for Milagros Fitness.
#
# Run as the `postgres` user (doesn't need DATABASE_URL because peer auth
# is the default on the local socket). Keeps 7 daily files. Off-VPS sync
# is a separate step (rclone / aws cli) — left out here to keep zero
# external dependencies on Day 8.
#
# Usage:
#   sudo -u postgres bash /home/Fitness/scripts/backup-db.sh
#
# Cron (run as root, edit /etc/crontab):
#   0 3 * * * postgres bash /home/Fitness/scripts/backup-db.sh
#
# Restore drill (DESTRUCTIVE — verify on a non-prod DB first):
#   sudo -u postgres dropdb milagros_dev
#   sudo -u postgres createdb -O milagros milagros_dev
#   gunzip -c /var/backups/milagros/milagros_dev_<DATE>.sql.gz | sudo -u postgres psql milagros_dev

set -euo pipefail

DB_NAME="${DB_NAME:-milagros_dev}"
BACKUP_DIR="${BACKUP_DIR:-/var/backups/milagros}"
RETAIN_DAYS="${RETAIN_DAYS:-7}"

mkdir -p "$BACKUP_DIR"
chmod 700 "$BACKUP_DIR"

STAMP="$(date -u +%Y%m%d-%H%M%S)"
OUT="$BACKUP_DIR/${DB_NAME}_${STAMP}.sql.gz"

echo "[$(date -u +%FT%TZ)] dumping $DB_NAME → $OUT"
pg_dump --format=plain --no-owner --no-privileges "$DB_NAME" | gzip -c > "$OUT"

# Verify the gzip is well-formed.
gzip -t "$OUT"

# Prune older than RETAIN_DAYS.
find "$BACKUP_DIR" -name "${DB_NAME}_*.sql.gz" -type f -mtime +"$RETAIN_DAYS" -delete

echo "[$(date -u +%FT%TZ)] done. retained:"
ls -lh "$BACKUP_DIR" | tail -10

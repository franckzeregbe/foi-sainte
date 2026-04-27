#!/usr/bin/env bash
set -euo pipefail

SCRIPT="/var/www/foi-sainte/deploy/scripts/backup-sqlite.sh"
CRON_LINE="15 2 * * * ${SCRIPT} >> /var/log/foi-sainte-backup.log 2>&1"

if [ ! -f "${SCRIPT}" ]; then
  echo "Script backup introuvable: ${SCRIPT}"
  exit 1
fi

(crontab -l 2>/dev/null | grep -v "backup-sqlite.sh"; echo "${CRON_LINE}") | crontab -

echo "Cron backup installe: ${CRON_LINE}"

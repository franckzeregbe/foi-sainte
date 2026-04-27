#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/foi-sainte"
DB_PATH="${APP_DIR}/foi_sainte.db"
BACKUP_DIR="/var/backups/foi-sainte"
STAMP="$(date +%F_%H-%M-%S)"

sudo mkdir -p "${BACKUP_DIR}"

if [ ! -f "${DB_PATH}" ]; then
  echo "Base introuvable: ${DB_PATH}"
  exit 1
fi

# Sauvegarde atomique SQLite sans bloquer l'app
sqlite3 "${DB_PATH}" ".backup '${BACKUP_DIR}/foi_sainte_${STAMP}.db'"

# Conserver 14 jours
sudo find "${BACKUP_DIR}" -type f -name "foi_sainte_*.db" -mtime +14 -delete

echo "Backup sqlite ok: ${BACKUP_DIR}/foi_sainte_${STAMP}.db"

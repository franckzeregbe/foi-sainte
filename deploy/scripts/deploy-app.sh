#!/usr/bin/env bash
set -euo pipefail

APP_DIR="$(cd "$(dirname "$0")/../.." && pwd)"
APP_USER="${USER:-www-data}"

if [ ! -f "${APP_DIR}/package.json" ]; then
  echo "Introuvable: ${APP_DIR}/package.json"
  echo "Placez-vous dans le dossier du projet ou ajustez APP_DIR"
  exit 1
fi

cd "${APP_DIR}"
echo "Deploiement dans ${APP_DIR}"

npm ci --omit=dev

if [ ! -f ".env.production" ]; then
  cp .env.production.example .env.production
  echo "Fichier .env.production cree. Editez SESSION_SECRET avant demarrage."
fi

pm2 start ecosystem.config.cjs --env production 2>/dev/null || pm2 restart foi-sainte
pm2 save
pm2 startup systemd -u "${APP_USER}" --hp "${HOME}" 2>/dev/null || true

echo "Deploiement termine. Commandes utiles:"
echo "  pm2 status                 # etat du processus"
echo "  pm2 logs foi-sainte        # voir les logs"

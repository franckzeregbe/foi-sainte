#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/foi-sainte"
APP_USER="www-data"
APP_GROUP="www-data"

if [ ! -d "${APP_DIR}" ]; then
  echo "Dossier ${APP_DIR} introuvable. Lancez bootstrap-ubuntu.sh d'abord."
  exit 1
fi

cd "${APP_DIR}"

if [ ! -d ".git" ]; then
  echo "Initialisation du depot dans ${APP_DIR}"
  sudo -u "${APP_USER}" git init
fi

if [ ! -f "package.json" ]; then
  echo "Copiez votre projet dans ${APP_DIR} puis relancez ce script."
  exit 1
fi

sudo -u "${APP_USER}" npm ci --omit=dev

if [ ! -f ".env.production" ]; then
  sudo cp .env.production.example .env.production
  sudo chown "${APP_USER}:${APP_GROUP}" .env.production
  echo "Fichier .env.production cree. Mettez SESSION_SECRET avant demarrage."
fi

sudo mkdir -p /var/log
sudo touch /var/log/foi-sainte-error.log /var/log/foi-sainte-out.log
sudo chown "${APP_USER}:${APP_GROUP}" /var/log/foi-sainte-error.log /var/log/foi-sainte-out.log

sudo -u "${APP_USER}" pm2 start ecosystem.config.cjs --env production || sudo -u "${APP_USER}" pm2 restart foi-sainte
sudo -u "${APP_USER}" pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "${APP_USER}" --hp "/var/www"

echo "Deploiement termine. Verifiez: pm2 status"

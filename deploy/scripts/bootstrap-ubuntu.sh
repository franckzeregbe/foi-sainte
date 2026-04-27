#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/var/www/foi-sainte"
APP_USER="www-data"

sudo apt update
sudo apt -y upgrade
sudo apt -y install nginx certbot python3-certbot-nginx ufw fail2ban curl git sqlite3

# Node.js LTS (20.x)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt -y install nodejs

# PM2 global
sudo npm install -g pm2

# Basic firewall policy
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

# App folders and permissions
sudo mkdir -p "${APP_DIR}"
sudo chown -R "${APP_USER}:${APP_USER}" "${APP_DIR}"

echo "Bootstrap termine. Prochaine etape: deploy/scripts/deploy-app.sh"

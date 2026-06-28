#!/usr/bin/env bash
set -euo pipefail

#!/usr/bin/env bash
set -euo pipefail

echo "=== Bootstrap FOI SAINTE — Infomaniak / Ubuntu ==="

sudo apt update && sudo apt -y upgrade
sudo apt -y install nginx certbot python3-certbot-nginx ufw fail2ban curl git sqlite3

# Node.js LTS (22.x)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt -y install nodejs

# PM2 global
sudo npm install -g pm2

# Pare-feu : SSH + Nginx
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw --force enable

echo ""
echo "=== Bootstrap termine ==="
echo "Prochaine etape : copier les fichiers du projet puis lancer :"
echo "  bash deploy/scripts/deploy-app.sh"

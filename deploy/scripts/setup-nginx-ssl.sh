#!/usr/bin/env bash
set -euo pipefail

DOMAIN="${1:-}"
EMAIL="${2:-}"

if [ -z "${DOMAIN}" ] || [ -z "${EMAIL}" ]; then
  echo "Usage: ./setup-nginx-ssl.sh votre-domaine.tld email@domaine.tld"
  exit 1
fi

CONF_SRC="/var/www/foi-sainte/deploy/nginx/foi-sainte.conf"
CONF_DST="/etc/nginx/sites-available/foi-sainte"

if [ ! -f "${CONF_SRC}" ]; then
  echo "Fichier nginx introuvable: ${CONF_SRC}"
  exit 1
fi

sudo cp "${CONF_SRC}" "${CONF_DST}"
sudo sed -i "s/VOTRE-DOMAINE.COM/${DOMAIN}/g" "${CONF_DST}"

sudo ln -sf "${CONF_DST}" /etc/nginx/sites-enabled/foi-sainte
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

sudo certbot --nginx -d "${DOMAIN}" -d "www.${DOMAIN}" -m "${EMAIL}" --agree-tos --redirect --non-interactive

echo "Nginx + SSL configures pour ${DOMAIN}"

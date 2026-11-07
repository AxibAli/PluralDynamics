#!/usr/bin/env bash
# One-command setup for a fresh Ubuntu 24.04 EC2 server. Safe to re-run: it also redeploys.
#
#   sudo bash /opt/pluraldynamics/deploy/aws/setup-server.sh pluraldynamics.com you@example.com
#
# Expects the project at /opt/pluraldynamics with its .env (MongoDB, admin password, SMTP).
# Installs Node 22, Nginx and PM2, builds the Node.js app (.output/) and runs it behind Nginx.
# The email argument is only for the free Let's Encrypt HTTPS certificate.
set -euo pipefail

DOMAIN="${1:-pluraldynamics.com}"
CERT_EMAIL="${2:-}"
APP=/opt/pluraldynamics
log() { printf '\n\033[1;31m==>\033[0m %s\n' "$*"; }

[ "$(id -u)" = 0 ] || { echo "Run with sudo."; exit 1; }
[ -f "$APP/package.json" ] || { echo "Upload the project to $APP first (see deploy/aws/README.md)."; exit 1; }

# ---------- system ----------
if ! swapon --show | grep -q .; then
  log "Adding 2 GB swap (the build needs memory on small instances)"
  fallocate -l 2G /swapfile && chmod 600 /swapfile && mkswap /swapfile >/dev/null && swapon /swapfile
  grep -q '^/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

log "Installing Nginx, Certbot and tools"
export DEBIAN_FRONTEND=noninteractive
apt-get update -y >/dev/null
apt-get install -y nginx certbot python3-certbot-nginx curl ca-certificates openssl >/dev/null

if ! node -v 2>/dev/null | grep -Eq '^v(2[2-9]|[3-9][0-9])'; then
  log "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | bash - >/dev/null
  apt-get install -y nodejs >/dev/null
fi
command -v pm2 >/dev/null || { log "Installing PM2"; npm install -g pm2 >/dev/null; }

# ---------- settings (.env) ----------
ENV_FILE="$APP/.env"
if [ ! -f "$ENV_FILE" ]; then
  log "No .env found: creating one from .env.example"
  cp "$APP/.env.example" "$ENV_FILE"
  sed -i "s|^ADMIN_SESSION_SECRET=.*|ADMIN_SESSION_SECRET=$(openssl rand -hex 32)|" "$ENV_FILE"
  echo "  !! Fill in MONGODB_URI, ADMIN_PASSWORD and SMTP_PASS in $ENV_FILE, then re-run this script."
fi
chmod 600 "$ENV_FILE"
for k in MONGODB_URI ADMIN_PASSWORD SMTP_PASS; do
  grep -Eq "^$k=.+" "$ENV_FILE" || echo "  !! $k is empty in $ENV_FILE"
done

# ---------- build + run ----------
log "Building the website (takes a few minutes)"
cd "$APP"
npm ci --no-audit --no-fund --loglevel=error || npm install --no-audit --no-fund --loglevel=error
npm run build

log "Starting it with PM2"
pm2 startOrReload "$APP/deploy/aws/ecosystem.config.cjs" --update-env
pm2 save >/dev/null
pm2 startup systemd -u root --hp /root >/dev/null

# ---------- Nginx ----------
log "Configuring Nginx"
sed "s/__DOMAIN__/$DOMAIN/g" "$APP/deploy/aws/nginx.conf.template" > /etc/nginx/sites-available/pluraldynamics
ln -sf /etc/nginx/sites-available/pluraldynamics /etc/nginx/sites-enabled/pluraldynamics
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

# ---------- HTTPS ----------
if [ -n "$CERT_EMAIL" ]; then
  if [ -d "/etc/letsencrypt/live/$DOMAIN" ]; then
    log "HTTPS certificate already present (renews automatically)"
    certbot install --nginx --cert-name "$DOMAIN" --redirect --non-interactive >/dev/null 2>&1 || true
  else
    log "Requesting HTTPS certificates (DNS must already point to this server)"
    certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$CERT_EMAIL" --redirect \
      || echo "  !! Certbot failed. Check the DNS A records, then re-run this script."
  fi
else
  echo "  (Skipping HTTPS: pass your email as the 2nd argument once DNS points here.)"
fi

log "Done"
echo "  Website:   http://$DOMAIN   (https after certbot)"
echo "  Dashboard: http://$DOMAIN/admin"
echo "  Logs:      pm2 logs pluraldynamics"
echo "  Server IP for MongoDB Atlas > Network Access: $(curl -s https://checkip.amazonaws.com || echo 'see EC2 console')"

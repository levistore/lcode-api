#!/bin/bash
set -e

echo "========================================="
echo "  Lcode API Backend - VPS Deploy Script"
echo "========================================="

APP_DIR="/opt/lcode-api"
NODE_VERSION="22"

# 1. Install Node.js 22
if ! command -v node &> /dev/null; then
    echo "[1/8] Installing Node.js ${NODE_VERSION}..."
    curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | bash -
    apt install -y nodejs
else
    echo "[1/8] Node.js already installed: $(node -v)"
fi

# 2. Install PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "[2/8] Installing PostgreSQL..."
    apt install -y postgresql postgresql-contrib
    systemctl enable postgresql
    systemctl start postgresql

    echo "Creating database..."
    sudo -u postgres psql -c "CREATE USER lcode_user WITH PASSWORD 'lcode_secure_2026';"
    sudo -u postgres psql -c "CREATE DATABASE lcode_api OWNER lcode_user;"
    sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE lcode_api TO lcode_user;"
else
    echo "[2/8] PostgreSQL already installed"
fi

# 3. Install Redis
if ! command -v redis-cli &> /dev/null; then
    echo "[3/8] Installing Redis..."
    apt install -y redis-server
    sed -i 's/supervised no/supervised systemd/' /etc/redis/redis.conf
    systemctl enable redis-server
    systemctl restart redis-server
else
    echo "[3/8] Redis already installed"
fi

# 4. Install PM2
if ! command -v pm2 &> /dev/null; then
    echo "[4/8] Installing PM2..."
    npm install -g pm2
    pm2 startup systemd -u root --hp /root
else
    echo "[4/8] PM2 already installed"
fi

# 5. Install Nginx
if ! command -v nginx &> /dev/null; then
    echo "[5/8] Installing Nginx..."
    apt install -y nginx
    systemctl enable nginx
else
    echo "[5/8] Nginx already installed"
fi

# 6. Setup app directory
echo "[6/8] Setting up application..."
mkdir -p "$APP_DIR"

if [ -d "$APP_DIR/backend" ]; then
    echo "Updating existing deployment..."
    cd "$APP_DIR/backend"
    git pull origin main || true
else
    echo "Copy the backend folder to $APP_DIR/backend"
    echo "Run: scp -r ./backend root@YOUR_VPS_IP:$APP_DIR/backend"
    exit 0
fi

# 7. Install dependencies and migrate
echo "[7/8] Installing dependencies..."
cd "$APP_DIR/backend"
npm install --production=false
npx prisma generate
npx prisma migrate deploy

# 8. Setup Nginx
echo "[8/8] Configuring Nginx..."
cp "$APP_DIR/backend/nginx.conf" /etc/nginx/sites-available/api.levicodex.web.id
ln -sf /etc/nginx/sites-available/api.levicodex.web.id /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

# Start app
cd "$APP_DIR/backend"
pm2 delete lcode-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

echo ""
echo "========================================="
echo "  Deployment Complete!"
echo "========================================="
echo "  API: https://api.levicodex.web.id"
echo "  Logs: pm2 logs lcode-api"
echo "  Status: pm2 status"
echo "========================================="

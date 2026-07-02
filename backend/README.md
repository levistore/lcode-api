# Lcode API Backend

Backend production-ready untuk **Lcode API** — platform penyedia API yang modular, scalable, dan siap deploy ke VPS Debian.

- **Frontend:** https://levicodex.web.id
- **Backend:** https://api.levicodex.web.id

---

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| Node.js | 22 LTS | Runtime |
| Express.js | 5.x | Web framework |
| PostgreSQL | 15+ | Database |
| Prisma | 6.x | ORM |
| Redis | 7+ | Cache & rate limiting |
| JWT (jose) | 6.x | Authentication |
| bcryptjs | 3.x | Password hashing |
| PM2 | latest | Process manager |
| Nginx | latest | Reverse proxy |

---

## Project Structure

```
backend/
├── server.js              # Entry point
├── app.js                 # Express app setup
├── package.json
├── ecosystem.config.js    # PM2 config
├── nginx.conf             # Nginx reverse proxy config
├── .env.example
├── config/
│   ├── app.js             # App configuration
│   └── index.js
├── controllers/
│   ├── auth.controller.js
│   ├── user.controller.js
│   ├── apiKey.controller.js
│   ├── endpoint.controller.js
│   ├── analytics.controller.js
│   ├── system.controller.js
│   ├── admin.controller.js
│   └── public.controller.js
├── database/
│   ├── prisma.js          # Prisma client
│   └── redis.js           # Redis client
├── middlewares/
│   ├── auth.js            # JWT authentication
│   ├── authorization.js   # Role-based access
│   ├── apiKey.js          # API key validation & rate limit
│   ├── errorHandler.js    # Global error handler
│   ├── logger.js          # Request logger
│   ├── rateLimit.js       # Rate limiting
│   └── validation.js      # Zod validation
├── prisma/
│   └── schema.prisma      # Database schema
├── routes/
│   ├── index.js           # Main router
│   ├── auth.routes.js
│   ├── user.routes.js
│   ├── apiKey.routes.js
│   ├── endpoint.routes.js
│   ├── analytics.routes.js
│   ├── system.routes.js
│   ├── admin.routes.js
│   └── public.routes.js
├── services/
│   ├── auth.service.js
│   ├── apiKey.service.js
│   ├── analytics.service.js
│   ├── email.service.js
│   └── admin.service.js
├── utils/
│   ├── crypto.js
│   ├── helpers.js
│   ├── jwt.js
│   ├── logger.js
│   ├── response.js
│   └── validator.js
├── logs/
└── storage/
```

---

## Deployment Guide — Debian 12 (Bookworm)

### 1. Install Node.js 22 LTS

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v
npm -v
```

### 2. Install PostgreSQL 15

```bash
apt install -y postgresql postgresql-contrib
systemctl enable postgresql
systemctl start postgresql
```

Buat database dan user:

```bash
sudo -u postgres psql
```

```sql
CREATE USER lcode_user WITH PASSWORD 'your_secure_password';
CREATE DATABASE lcode_api OWNER lcode_user;
GRANT ALL PRIVILEGES ON DATABASE lcode_api TO lcode_user;
\q
```

### 3. Install Redis 7

```bash
apt install -y redis-server
```

Edit `/etc/redis/redis.conf`:

```bash
nano /etc/redis/redis.conf
```

Ubah `supervised no` menjadi `supervised systemd`.

```bash
systemctl enable redis-server
systemctl restart redis-server
```

### 4. Install PM2

```bash
npm install -g pm2
pm2 startup systemd -u root --hp /root
```

### 5. Install Nginx

```bash
apt install -y nginx
systemctl enable nginx
```

### 6. Setup Firewall

```bash
apt install -y ufw
ufw default deny incoming
ufw default allow outgoing
ufw allow ssh
ufw allow http
ufw allow https
ufw enable
ufw status
```

### 7. Setup Reverse Proxy

Salin konfigurasi Nginx:

```bash
cp /path/to/backend/nginx.conf /etc/nginx/sites-available/api.levicodex.web.id
ln -s /etc/nginx/sites-available/api.levicodex.web.id /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### 8. Setup Cloudflare

1. Tambahkan domain `api.levicodex.web.id` di Cloudflare DNS
2. Buat A record → `api` → IP server → Proxy status: **Proxied**
3. Di **SSL/TLS** → pilih **Full (Strict)**
4. Generate **Cloudflare Origin Certificate**:
   - SSL/TLS → Origin Server → Create Certificate
   - Download dan salin ke server:

```bash
mkdir -p /etc/ssl/certs /etc/ssl/private
nano /etc/ssl/certs/cloudflare-origin.pem
nano /etc/ssl/private/cloudflare-origin-key.pem
chmod 600 /etc/ssl/private/cloudflare-origin-key.pem
```

5. Reload Nginx:

```bash
nginx -t
systemctl reload nginx
```

### 9. Deploy Backend

```bash
cd /opt
git clone <repository-url> lcode-api
cd lcode-api/backend
cp .env.example .env
nano .env
```

Isi seluruh variabel environment (lihat tabel di bawah).

```bash
npm install
npx prisma generate
npx prisma migrate deploy
```

### 10. Menjalankan Backend

```bash
pm2 start ecosystem.config.js
pm2 save
pm2 list
```

### 11. Restart Backend

```bash
pm2 restart lcode-api
pm2 logs lcode-api
```

### 12. Update Backend

```bash
cd /opt/lcode-api/backend
git pull origin main
npm install
npx prisma migrate deploy
npx prisma generate
pm2 restart lcode-api
```

---

## Backup & Restore Database

### Backup

```bash
pg_dump -U lcode_user -d lcode_api -F c -f backup_$(date +%Y%m%d_%H%M%S).dump
```

### Restore

```bash
pg_restore -U lcode_user -d lcode_api -c backup_YYYYMMDD_HHMMSS.dump
```

### Auto Backup (Cron)

```bash
crontab -e
```

Tambahkan baris berikut untuk backup harian pukul 02:00:

```
0 2 * * * pg_dump -U lcode_user -d lcode_api -F c -f /opt/backups/db_$(date +\%Y\%m\%d).dump
```

---

## Development Guide

### Menambah Route Baru

1. Buat file di `routes/`, contoh `routes/payment.routes.js`
2. Daftarkan di `routes/index.js`:

```js
import paymentRoutes from "./payment.routes.js";
router.use("/payments", paymentRoutes);
```

### Menambah Controller Baru

1. Buat file di `controllers/`, contoh `controllers/payment.controller.js`
2. Export async functions yang menerima `(req, res)`
3. Gunakan `success()` dan `error()` dari `utils/response.js`

### Menambah Service Baru

1. Buat file di `services/`, contoh `services/payment.service.js`
2. Export async functions yang berisi business logic
3. Import `prisma` dari `database/prisma.js`

### Menambah Middleware Baru

1. Buat file di `middlewares/`, contoh `middlewares/cache.js`
2. Export function yang mengembalikan `(req, res, next) => {}`
3. Gunakan di route yang membutuhkan

### Menambah API Endpoint Baru

1. Tambahkan model ke `prisma/schema.prisma` jika perlu
2. Buat service function di `services/`
3. Buat controller handler di `controllers/`
4. Daftarkan route di `routes/`
5. Daftarkan endpoint ke database (tabel ApiEndpoint) melalui admin panel

---

## npm Scripts

| Command | Description |
|---|---|
| `npm install` | Install dependencies |
| `npm run dev` | Development mode (auto-reload) |
| `npm run start` | Production start |
| `npm run build` | Generate Prisma client |
| `npm run prod` | Start with PM2 |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:deploy` | Deploy migrations |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

---

## API Endpoints

### Auth (`/api/auth`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | /register | - | Register user baru |
| POST | /login | - | Login |
| POST | /refresh | - | Refresh access token |
| POST | /logout | JWT | Logout |
| GET | /verify-email | - | Verifikasi email |
| POST | /forgot-password | - | Request reset password |
| POST | /reset-password | - | Reset password |
| GET | /profile | JWT | Get profile |

### Users (`/api/users`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /profile | JWT | Get profile |
| PUT | /profile | JWT | Update profile |
| DELETE | /account | JWT | Delete account |

### API Keys (`/api/api-keys`)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | / | JWT | Create API key |
| GET | / | JWT | List API keys |
| PUT | /:id | JWT | Update API key name |
| POST | /:id/regenerate | JWT | Regenerate API key |
| PATCH | /:id/toggle | JWT | Activate/deactivate |
| DELETE | /:id | JWT | Delete API key |

### Endpoints (`/api/endpoints`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | / | Optional | List endpoints |
| GET | /leaderboard | - | Top endpoints |
| GET | /:id | - | Endpoint detail |

### Analytics (`/api/analytics`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /overview | JWT | Overview stats |
| GET | /timeline | JWT | Request timeline |
| GET | /user-stats | JWT | User's own stats |

### System (`/api/system`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /status | Admin | Server status |

### Admin (`/api/admin`) — Requires ADMIN or SUPER_ADMIN role

| Method | Path | Description |
|---|---|---|
| GET | /users | List users |
| GET | /users/:id | User detail |
| PUT | /users/:id | Update user |
| DELETE | /users/:id | Delete user |
| GET/POST | /endpoints | List/create endpoints |
| PUT/DELETE | /endpoints/:id | Update/delete endpoints |
| GET/POST | /categories | List/create categories |
| PUT/DELETE | /categories/:id | Update/delete categories |
| GET/POST | /plans | List/create plans |
| PUT/DELETE | /plans/:id | Update/delete plans |
| GET/POST | /announcements | List/create announcements |
| PUT/DELETE | /announcements/:id | Update/delete announcements |
| GET/PUT | /settings | Get/update settings |
| GET | /logs | List logs |
| GET | /api-keys | List all API keys |
| PUT | /api-keys/:id | Update API key |
| DELETE | /api-keys/:id | Delete API key |
| GET | /stats | Admin dashboard stats |

### Public (`/api/public`)

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | /health | - | Health check |
| GET | /stats | - | Public stats |
| GET | /endpoints | - | Public endpoint list |
| GET | /announcements | - | Active announcements |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `NODE_ENV` | development | Environment (development/production) |
| `PORT` | 3000 | Server port |
| `HOST` | 0.0.0.0 | Server host |
| `DATABASE_URL` | - | PostgreSQL connection string |
| `REDIS_HOST` | 127.0.0.1 | Redis host |
| `REDIS_PORT` | 6379 | Redis port |
| `REDIS_PASSWORD` | - | Redis password |
| `JWT_SECRET` | - | JWT signing secret |
| `JWT_EXPIRES_IN` | 15m | Access token expiry |
| `JWT_REFRESH_EXPIRES_IN` | 7d | Refresh token expiry |
| `SMTP_HOST` | smtp.resend.com | SMTP host |
| `SMTP_PORT` | 587 | SMTP port |
| `SMTP_USER` | - | SMTP username |
| `SMTP_PASS` | - | SMTP password |
| `EMAIL_FROM` | noreply@levicodex.web.id | Sender email |
| `FRONTEND_URL` | http://localhost:3000 | Frontend URL |
| `API_URL` | http://localhost:3000 | Backend URL |
| `RATE_LIMIT_FREE` | 60 | Rate limit for free plan |
| `RATE_LIMIT_PREMIUM` | 1000 | Rate limit for premium plan |
| `RATE_LIMIT_WINDOW_MS` | 60000 | Rate limit window (ms) |

---

## License

MIT

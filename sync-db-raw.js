const pg = require("pg");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
dotenv.config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });

async function run() {
  try {
    console.log("Connecting to PostgreSQL...");
    
    // Alter Role enum
    console.log("Altering 'Role' enum to add 'SUPER_ADMIN'...");
    try {
      await pool.query(`ALTER TYPE "Role" ADD VALUE 'SUPER_ADMIN';`);
    } catch (e) {
      if (e.code !== "42710") {
        console.warn("Alter Role warning:", e.message);
      }
    }

    // 1. Alter User table
    console.log("Altering 'users' table to add 'status' column if it does not exist...");
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(255) DEFAULT 'ACTIVE';
    `);

    // 2. Create categories table
    console.log("Creating 'categories' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        description TEXT,
        slug VARCHAR(255) UNIQUE NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 3. Create api_keys table
    console.log("Creating 'api_keys' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_keys (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        key VARCHAR(255) UNIQUE NOT NULL,
        status VARCHAR(255) DEFAULT 'ACTIVE',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "lastUsed" TIMESTAMP,
        "expiresAt" TIMESTAMP
      );
    `);

    // 4. Create api_endpoints table
    console.log("Creating 'api_endpoints' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_endpoints (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        route VARCHAR(255) UNIQUE NOT NULL,
        method VARCHAR(255) NOT NULL,
        "categoryId" VARCHAR(255) NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
        status VARCHAR(255) DEFAULT 'ACTIVE',
        "accessLevel" VARCHAR(255) DEFAULT 'FREE',
        "rateLimit" INTEGER DEFAULT 60,
        "requestCount" INTEGER DEFAULT 0,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 5. Create api_requests table
    console.log("Creating 'api_requests' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS api_requests (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) REFERENCES users(id) ON DELETE SET NULL,
        "endpointId" VARCHAR(255) REFERENCES api_endpoints(id) ON DELETE SET NULL,
        route VARCHAR(255) NOT NULL,
        method VARCHAR(255) NOT NULL,
        ip VARCHAR(255) NOT NULL,
        "statusCode" INTEGER NOT NULL,
        "responseTime" INTEGER NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Create plans table
    console.log("Creating 'plans' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plans (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        code VARCHAR(255) UNIQUE NOT NULL,
        price DOUBLE PRECISION NOT NULL,
        "requestsLimit" INTEGER NOT NULL,
        features TEXT NOT NULL,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Create subscriptions table
    console.log("Creating 'subscriptions' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS subscriptions (
        id VARCHAR(255) PRIMARY KEY,
        "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        "planId" VARCHAR(255) NOT NULL REFERENCES plans(id) ON DELETE RESTRICT,
        status VARCHAR(255) DEFAULT 'ACTIVE',
        "startDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "endDate" TIMESTAMP
      );
    `);

    // 8. Create payments table
    console.log("Creating 'payments' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id VARCHAR(255) PRIMARY KEY,
        "invoiceId" VARCHAR(255) UNIQUE NOT NULL,
        "userId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        amount DOUBLE PRECISION NOT NULL,
        method VARCHAR(255) NOT NULL,
        status VARCHAR(255) DEFAULT 'PENDING',
        date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 9. Create announcements table
    console.log("Creating 'announcements' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS announcements (
        id VARCHAR(255) PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        type VARCHAR(255) DEFAULT 'INFO',
        "publishDate" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 10. Create settings table
    console.log("Creating 'settings' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        id VARCHAR(255) PRIMARY KEY DEFAULT 'global',
        "siteName" VARCHAR(255) DEFAULT 'Lcode API',
        "siteDescription" VARCHAR(255) DEFAULT 'API Marketplace Platform',
        "logoUrl" VARCHAR(255),
        "enableRegistration" BOOLEAN DEFAULT TRUE,
        "enableGoogleLogin" BOOLEAN DEFAULT FALSE,
        "enableEmailVerification" BOOLEAN DEFAULT FALSE,
        "resendApiKey" VARCHAR(255),
        "resendSenderEmail" VARCHAR(255),
        "freeUserLimit" INTEGER DEFAULT 100,
        "premiumUserLimit" INTEGER DEFAULT 5000
      );
    `);

    // 11. Create audit_logs table
    console.log("Creating 'audit_logs' table...");
    await pool.query(`
      CREATE TABLE IF NOT EXISTS audit_logs (
        id VARCHAR(255) PRIMARY KEY,
        "adminId" VARCHAR(255) NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        action VARCHAR(255) NOT NULL,
        details TEXT NOT NULL,
        ip VARCHAR(255) DEFAULT '0.0.0.0',
        "createdAt" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("All tables checked/created successfully!");

    // 12. Seeding Default Records
    console.log("Seeding default settings...");
    await pool.query(`
      INSERT INTO settings (id, "siteName", "siteDescription", "enableRegistration", "enableGoogleLogin", "enableEmailVerification", "resendApiKey", "resendSenderEmail", "freeUserLimit", "premiumUserLimit")
      VALUES ('global', 'Lcode API', 'Premium API Marketplace Platform', true, false, false, 're_Sgj7TESp_PWp2tFAukucc3itEf16DuwZd', 'noreply@lcode.dev', 100, 5000)
      ON CONFLICT (id) DO NOTHING;
    `);

    console.log("Seeding default pricing plans...");
    const plans = [
      ['p1', 'Free Plan', 'FREE', 0.0, 1000, '1,000 requests/day,Access to basic APIs,Rate limit 60 req/min,Community support'],
      ['p2', 'Premium Plan', 'PREMIUM', 29.0, 50000, '50,000 requests/day,Access to all APIs (including Canva),Rate limit 300 req/min,Email support,99.9% Uptime SLA'],
      ['p3', 'Enterprise Plan', 'ENTERPRISE', 199.0, 1000000, '1,000,000 requests/day,Unlimited custom APIs,Custom rate limit parameters,Dedicated support,Custom SLA & uptime guarantees']
    ];
    for (const p of plans) {
      await pool.query(`
        INSERT INTO plans (id, name, code, price, "requestsLimit", features, "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW())
        ON CONFLICT (code) DO UPDATE SET name = $2, price = $4, "requestsLimit" = $5, features = $6, "updatedAt" = NOW();
      `, p);
    }

    console.log("Seeding Super Admin user...");
    const adminEmail = "admin@lcode.dev";
    const hashedPassword = await bcrypt.hash("Password123", 12);
    await pool.query(`
      INSERT INTO users (id, name, email, password, role, status, "emailVerified", "createdAt", "updatedAt")
      VALUES ('superadmin', 'Super Admin', $1, $2, 'SUPER_ADMIN', 'ACTIVE', NOW(), NOW(), NOW())
      ON CONFLICT (email) DO UPDATE SET role = 'SUPER_ADMIN', status = 'ACTIVE';
    `, [adminEmail, hashedPassword]);

    console.log("Cleaning up old seed data...");
    try {
      await pool.query(`DELETE FROM api_requests;`);
      await pool.query(`DELETE FROM api_endpoints;`);
      await pool.query(`DELETE FROM categories;`);
    } catch (e) {
      console.warn("Cleanup warning (non-critical):", e.message);
    }

    console.log("Seeding categories...");
    const categories = [
      ['cat_ai', 'AI APIs', 'ai-apis', 'Endpoints powered by ChatGPT, DALL-E, Claude, and Llama models.'],
      ['cat_canva', 'Canva APIs', 'canva-apis', 'Design automation, template manipulation, and export utilities.'],
      ['cat_down', 'Downloader APIs', 'downloader-apis', 'High-speed video and audio download APIs.'],
      ['cat_tools', 'Tools APIs', 'tools-apis', 'Developer toolchains and scrapers.'],
      ['cat_util', 'Utility APIs', 'utility-apis', 'Geolocation, short links, QR codes.']
    ];
    for (const c of categories) {
      await pool.query(`
        INSERT INTO categories (id, name, slug, description, "updatedAt")
        VALUES ($1, $2, $3, $4, NOW())
        ON CONFLICT (id) DO UPDATE SET name = $2, slug = $3, description = $4, "updatedAt" = NOW();
      `, c);
    }

    console.log("Seeding endpoints...");
    const endpoints = [
      ['api_tk', 'TikTok Video Downloader', 'Extracts video URLs without watermark from TikTok links.', '/api/v1/download/tiktok', 'GET', 'cat_down', 'ACTIVE', 'FREE', 100, 15480],
      ['api_de', 'DALL-E Image Creator', 'Creates photorealistic images from textual prompt description.', '/api/v1/ai/image-gen', 'POST', 'cat_ai', 'ACTIVE', 'PREMIUM', 15, 924],
      ['api_cv', 'Canva Auto-Designer', 'Injects user content and templates.', '/api/v1/canva/render', 'POST', 'cat_canva', 'ACTIVE', 'PREMIUM', 30, 2011],
      ['api_ai', 'AI Text Generator', 'Generates text prompts summaries.', '/api/v1/ai/text-gen', 'POST', 'cat_ai', 'ACTIVE', 'FREE', 60, 3840]
    ];
    for (const ep of endpoints) {
      await pool.query(`
        INSERT INTO api_endpoints (id, name, description, route, method, "categoryId", status, "accessLevel", "rateLimit", "requestCount", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())
        ON CONFLICT (route) DO UPDATE SET name = $2, description = $3, method = $5, "categoryId" = $6, status = $7, "accessLevel" = $8, "rateLimit" = $9, "requestCount" = $10, "updatedAt" = NOW();
      `, ep);
    }

    console.log("Seeding default dummy users...");
    const dummyUsers = [
      ['u_john', 'John Doe', 'john@example.com', 'USER', 'ACTIVE'],
      ['u_jane', 'Jane Smith', 'jane@example.com', 'USER', 'ACTIVE'],
      ['u_bob', 'Bob Johnson', 'bob@example.com', 'USER', 'BANNED'],
      ['u_jack', 'Developer Jack', 'jack@example.com', 'ADMIN', 'ACTIVE']
    ];
    for (const du of dummyUsers) {
      const pw = await bcrypt.hash("Password123", 12);
      await pool.query(`
        INSERT INTO users (id, name, email, password, role, status, "emailVerified", "createdAt", "updatedAt")
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), NOW())
        ON CONFLICT (email) DO NOTHING;
      `, [du[0], du[1], du[2], pw, du[3], du[4]]);
    }

    console.log("Database synchronization and seeding completed successfully!");
  } catch (error) {
    console.error("Database synchronization failed!");
    console.error(error);
  } finally {
    await pool.end();
  }
}

run();

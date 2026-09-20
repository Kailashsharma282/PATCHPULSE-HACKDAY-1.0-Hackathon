const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const envPath = path.join(rootDir, '.env');
const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');

if (!fs.existsSync(schemaPath)) {
  console.error('[Prisma Prep] schema.prisma not found at:', schemaPath);
  process.exit(1);
}

// If .env does not exist (e.g. fresh CI / Render build), create a fallback .env
if (!fs.existsSync(envPath) && !process.env.DATABASE_URL) {
  console.log('[Prisma Prep] No .env file or DATABASE_URL detected. Generating CI/local fallback .env...');
  const defaultEnv = [
    'DATABASE_URL="file:./dev.db"',
    'JWT_SECRET="patchpulse_build_jwt_secret_token_12345"',
    'AI_MODE="mock"',
    'PORT=3000',
    'NODE_ENV="development"',
  ].join('\n') + '\n';
  fs.writeFileSync(envPath, defaultEnv, 'utf8');
}

// If .env exists, load it into process.env if not already loaded
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.substring(0, eqIdx).trim();
        let val = trimmed.substring(eqIdx + 1).trim();
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  });
}

let schema = fs.readFileSync(schemaPath, 'utf8');
const dbUrl = (process.env.DATABASE_URL || '').trim();
const isPostgres = dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://');

if (isPostgres) {
  console.log('[Prisma Prep] Detected PostgreSQL (Neon DB). Setting datasource provider to "postgresql"...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, 'provider = "postgresql"');
} else {
  console.log('[Prisma Prep] SQLite / Local fallback detected. Setting datasource provider to "sqlite"...');
  schema = schema.replace(/provider\s*=\s*"(sqlite|postgresql)"/g, 'provider = "sqlite"');
}

fs.writeFileSync(schemaPath, schema, 'utf8');
console.log('[Prisma Prep] schema.prisma configured successfully for active provider.');

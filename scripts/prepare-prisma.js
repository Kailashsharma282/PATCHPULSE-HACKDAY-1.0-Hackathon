const fs = require('fs');
const path = require('path');

const schemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');
if (!fs.existsSync(schemaPath)) {
  console.error('[Prisma Prep] schema.prisma not found at:', schemaPath);
  process.exit(1);
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

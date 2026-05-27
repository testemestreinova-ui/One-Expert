/**
 * Script de setup do banco de dados Supabase.
 * Executa todas as migrations via conexão direta (postgres).
 *
 * Uso: node scripts/setup-database.mjs
 *
 * Requer a variável DB_PASSWORD no .env.local
 * (Settings → Database → Database password no painel Supabase)
 */

import { readFileSync } from "fs";
import { createRequire } from "module";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);

// Carrega .env.local manualmente (sem depender do Next.js)
function loadEnv() {
  const envPath = join(__dirname, "..", ".env.local");
  if (!existsSync(envPath)) {
    console.error("❌ .env.local não encontrado");
    process.exit(1);
  }
  const content = readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const [key, ...rest] = trimmed.split("=");
    if (key && rest.length) {
      process.env[key.trim()] = rest.join("=").trim();
    }
  }
}

loadEnv();

const { Client } = require("pg");

const PROJECT_REF = "umapyanacbqqsrhtzxwb";
const DB_PASSWORD = process.env.DB_PASSWORD;
const DB_URL = process.env.DATABASE_URL;

if (!DB_PASSWORD && !DB_URL) {
  console.error(`
❌ Senha do banco não encontrada.

Adicione ao seu .env.local:
  DB_PASSWORD=sua_senha_do_banco

Onde encontrar:
  Supabase → seu projeto → Settings → Database → Database password
`);
  process.exit(1);
}

const connectionString =
  DB_URL ||
  `postgresql://postgres.${PROJECT_REF}:${DB_PASSWORD}@aws-0-us-east-1.pooler.supabase.com:6543/postgres`;

const MIGRATIONS_DIR = join(__dirname, "..", "supabase", "migrations");
const MIGRATION_FILES = [
  "001_auth_profiles.sql",
  "002_workspaces.sql",
  "003_conversations.sql",
  "004_campaigns.sql",
  "005_leads.sql",
  "006_rls_policies.sql",
];

async function run() {
  console.log("\n🚀 UNE Expert Business — Setup do Banco de Dados\n");

  const client = new Client({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    console.log("🔌 Conectando ao banco...");
    await client.connect();
    console.log("✅ Conectado!\n");

    for (const file of MIGRATION_FILES) {
      const filePath = join(MIGRATIONS_DIR, file);
      const sql = readFileSync(filePath, "utf-8");

      process.stdout.write(`⚙️  Executando ${file}...`);
      await client.query(sql);
      console.log(" ✅");
    }

    console.log("\n🎉 Banco configurado com sucesso!");
    console.log("\nTabelas criadas:");
    const { rows } = await client.query(`
      select tablename
      from pg_tables
      where schemaname = 'public'
      order by tablename;
    `);
    rows.forEach((r) => console.log(`  ✓ ${r.tablename}`));
  } catch (err) {
    console.error("\n❌ Erro:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

run();

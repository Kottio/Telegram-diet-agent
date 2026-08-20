// src/scripts/migrate.ts
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { sql } from "bun";

const dir = join(import.meta.dir, "../../migrations");

// 1. The ledger. Static SQL, no ${} — a plain tagged template is fine here.
await sql`
  create table if not exists schema_migrations (
    name       text primary key,
    applied_at timestamptz not null default now()
  )
`;

// 2. What has already run
const rows = await sql`select name from schema_migrations`;
const applied = new Set(rows.map((r) => r.name));

// 3. What exists on disk, in order
const files = readdirSync(dir)
  .filter((f) => f.endsWith(".sql"))
  .sort();

// 4. Apply the difference
for (const file of files) {
  if (applied.has(file)) {
    console.log(`- ${file} (already applied)`);
    continue;
  }

  console.log(`+ ${file}`);
  const content = await Bun.file(join(dir, file)).text();

  await sql.begin(async (tx) => {
    await tx.unsafe(content); // ← raw SQL, not a parameter
    await tx`insert into schema_migrations (name) values (${file})`; // ← ${} IS a parameter
  });
}

console.log("migrations up to date");
await sql.end(); // without this the process hangs on the open connection

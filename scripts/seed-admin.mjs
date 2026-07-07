// Creates (or updates the password of) an admin_users account.
// Usage: node --env-file=.env scripts/seed-admin.mjs <username> <password>
import bcrypt from "bcryptjs";
import pg from "pg";

const [, , username, password] = process.argv;

if (!username || !password) {
  console.error("Usage: node --env-file=.env scripts/seed-admin.mjs <username> <password>");
  process.exit(1);
}
if (password.length < 8) {
  console.error("Password must be at least 8 characters.");
  process.exit(1);
}

const client = new pg.Client({
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
});

await client.connect();

const passwordHash = await bcrypt.hash(password, 12);

await client.query(
  `INSERT INTO admin_users (username, password_hash)
   VALUES ($1, $2)
   ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash`,
  [username, passwordHash]
);

console.log(`Admin account "${username}" is ready.`);
await client.end();

import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { PGlite } from "@electric-sql/pglite";
import { Pool, type PoolClient, type QueryResult, type QueryResultRow } from "pg";

const DEFAULT_PGLITE_DIR = join(process.cwd(), "data", "roofradar");

let pool: Pool | null = null;
let pglite: PGlite | null = null;
let pgliteReady: Promise<PGlite> | null = null;

export function getConnectionString(): string {
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) return url;
  if (process.env.VERCEL) {
    throw new Error(
      "DATABASE_URL is required on Vercel. Add Neon Postgres in project Storage settings.",
    );
  }
  return `pglite://${DEFAULT_PGLITE_DIR}`;
}

export function usesEmbeddedDb(): boolean {
  if (process.env.VERCEL) return false;
  const url = process.env.DATABASE_URL ?? process.env.POSTGRES_URL;
  if (url) return false;
  return true;
}

function getPglitePath(): string {
  const url = getConnectionString();
  if (url.startsWith("pglite://")) {
    return url.replace("pglite://", "");
  }
  if (url.startsWith("file:")) {
    return url.replace("file:", "");
  }
  return DEFAULT_PGLITE_DIR;
}

async function getPglite(): Promise<PGlite> {
  if (!pgliteReady) {
    pgliteReady = (async () => {
      const dataDir = getPglitePath();
      mkdirSync(dataDir, { recursive: true });
      pglite = new PGlite(dataDir);
      await pglite.waitReady;
      return pglite;
    })();
  }
  return pgliteReady;
}

export function getPool(): Pool {
  if (usesEmbeddedDb()) {
    throw new Error(
      "Embedded PGlite is active — use query() instead of getPool()",
    );
  }
  if (!pool) {
    const connectionString = getConnectionString();
    pool = new Pool({
      connectionString,
      ssl: connectionString.includes("localhost")
        ? undefined
        : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export async function execSql(sql: string): Promise<void> {
  if (usesEmbeddedDb()) {
    const db = await getPglite();
    await db.exec(sql);
    return;
  }
  await getPool().query(sql);
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<T>> {
  if (usesEmbeddedDb()) {
    const db = await getPglite();
    const result = await db.query<T>(text, params);
    return {
      rows: result.rows,
      rowCount: result.rows.length,
      command: "",
      oid: 0,
      fields: [],
    };
  }
  return getPool().query<T>(text, params);
}

export async function closeDb(): Promise<void> {
  if (pglite) {
    await pglite.close();
    pglite = null;
    pgliteReady = null;
  }
  if (pool) {
    await pool.end();
    pool = null;
  }
}

export async function withTransaction<T>(
  fn: (client: Pick<PoolClient, "query">) => Promise<T>,
): Promise<T> {
  if (usesEmbeddedDb()) {
    const db = await getPglite();
    return db.transaction(async (tx) =>
      fn(tx as unknown as Pick<PoolClient, "query">),
    );
  }

  const client = await getPool().connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

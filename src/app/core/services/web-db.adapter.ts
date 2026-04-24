import type { BindParams, Database, SqlJsStatic } from 'sql.js';

import { IDbConnection } from './db-connection.interface';

const STORAGE_KEY = 'fintrack_db_v1';

/**
 * Browser-SQLite über sql.js (WebAssembly).
 * Ersetzt jeep-sqlite, da dessen WASM-Binaries Versionskonflikte verursachen.
 * Daten werden nach jeder Mutation in localStorage persistiert.
 */
export class WebDbAdapter implements IDbConnection {
  constructor(private db: Database) {}

  async query(
    sql: string,
    values: unknown[] = [],
  ): Promise<{ values: Record<string, unknown>[] }> {
    const stmt = this.db.prepare(sql);
    stmt.bind(values as BindParams);
    const rows: Record<string, unknown>[] = [];
    while (stmt.step()) {
      rows.push(stmt.getAsObject() as Record<string, unknown>);
    }
    stmt.free();
    return { values: rows };
  }

  async run(
    sql: string,
    values: unknown[] = [],
  ): Promise<{ changes: { lastId: number; changes: number } }> {
    this.db.run(sql, values as BindParams);
    const lastIdResult = this.db.exec('SELECT last_insert_rowid() AS id');
    const lastId = (lastIdResult[0]?.values[0]?.[0] as number) ?? 0;
    const rowsModified = this.db.getRowsModified();
    this.persist();
    return { changes: { lastId, changes: rowsModified } };
  }

  async execute(sql: string): Promise<void> {
    this.db.exec(sql);
    this.persist();
  }

  private persist(): void {
    const data = this.db.export();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(data)));
  }

  static loadSaved(): Uint8Array | null {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;
    return new Uint8Array(JSON.parse(stored) as number[]);
  }
}

export async function createWebDbAdapter(): Promise<WebDbAdapter> {
  const initSqlJs = ((await import('sql.js')) as { default: SqlJsStatic }).default;
  const SQL = await initSqlJs({ locateFile: (file: string) => `assets/${file}` });
  const existing = WebDbAdapter.loadSaved();
  const db = existing ? new SQL.Database(existing) : new SQL.Database();
  return new WebDbAdapter(db);
}

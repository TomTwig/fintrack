/** Gemeinsames Interface für native SQLiteDBConnection und Web-Adapter */
export interface IDbConnection {
  query(
    sql: string,
    values?: unknown[],
  ): Promise<{ values?: Record<string, unknown>[] }>;

  run(
    sql: string,
    values?: unknown[],
  ): Promise<{ changes?: { lastId?: number; changes?: number } }>;

  execute(sql: string): Promise<unknown>;
}

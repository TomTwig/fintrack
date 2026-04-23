import { Injectable } from '@angular/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Capacitor } from '@capacitor/core';

import { DEFAULT_CATEGORIES } from '../models/category.model';

const DB_NAME = 'fintrack';
const DB_VERSION = 1;

const CREATE_TABLES_SQL = `
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS categories (
    id    INTEGER PRIMARY KEY AUTOINCREMENT,
    name  TEXT    NOT NULL,
    icon  TEXT    NOT NULL,
    color TEXT    NOT NULL,
    type  TEXT    NOT NULL CHECK(type IN ('expense', 'income'))
  );

  CREATE TABLE IF NOT EXISTS fixed_costs (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    name          TEXT    NOT NULL,
    amount        REAL    NOT NULL,
    category_id   INTEGER REFERENCES categories(id),
    billing_day   INTEGER NOT NULL CHECK(billing_day BETWEEN 1 AND 31),
    billing_cycle TEXT    NOT NULL CHECK(billing_cycle IN ('monthly', 'quarterly', 'yearly')),
    is_active     INTEGER NOT NULL DEFAULT 1,
    notes         TEXT,
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS transactions (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    amount        REAL    NOT NULL,
    description   TEXT,
    category_id   INTEGER REFERENCES categories(id),
    date          TEXT    NOT NULL,
    is_fixed_cost INTEGER NOT NULL DEFAULT 0,
    fixed_cost_id INTEGER REFERENCES fixed_costs(id),
    created_at    TEXT    NOT NULL DEFAULT (datetime('now'))
  );

  CREATE INDEX IF NOT EXISTS idx_transactions_date        ON transactions(date);
  CREATE INDEX IF NOT EXISTS idx_transactions_category_id ON transactions(category_id);
  CREATE INDEX IF NOT EXISTS idx_fixed_costs_active       ON fixed_costs(is_active);
`;

@Injectable({ providedIn: 'root' })
export class DatabaseService {
  private sqlite = new SQLiteConnection(CapacitorSQLite);
  private db: SQLiteDBConnection | null = null;
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    const platform = Capacitor.getPlatform();

    if (platform === 'web') {
      await this.sqlite.initWebStore();
    }

    this.db = await this.sqlite.createConnection(DB_NAME, false, 'no-encryption', DB_VERSION, false);
    await this.db.open();
    await this.db.execute(CREATE_TABLES_SQL);
    await this.seedDefaultCategories();

    this.initialized = true;
  }

  getDb(): SQLiteDBConnection {
    if (!this.db) throw new Error('Database not initialized. Call initialize() first.');
    return this.db;
  }

  private async seedDefaultCategories(): Promise<void> {
    const db = this.getDb();
    const result = await db.query('SELECT COUNT(*) as count FROM categories');
    const count = result.values?.[0]?.['count'] as number ?? 0;

    if (count > 0) return;

    const values = DEFAULT_CATEGORIES.map((c) => [c.name, c.icon, c.color, c.type]);
    const placeholders = values.map(() => '(?, ?, ?, ?)').join(', ');
    const flat = values.flat();

    await db.run(
      `INSERT INTO categories (name, icon, color, type) VALUES ${placeholders}`,
      flat,
    );
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.sqlite.closeConnection(DB_NAME, false);
      this.db = null;
      this.initialized = false;
    }
  }
}

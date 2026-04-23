import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import {
  CategorySummary,
  MonthSummary,
  NewTransaction,
  QuickEntry,
  Transaction,
  TransactionWithCategory,
} from '../models/transaction.model';

import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class TransactionService {
  private transactionsSubject = new BehaviorSubject<TransactionWithCategory[]>([]);
  readonly transactions$ = this.transactionsSubject.asObservable();

  constructor(private db: DatabaseService) {}

  async loadByMonth(year: number, month: number): Promise<void> {
    const list = await this.getByMonth(year, month);
    this.transactionsSubject.next(list);
  }

  async getByMonth(year: number, month: number): Promise<TransactionWithCategory[]> {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-31`;
    const result = await this.db.getDb().query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.date BETWEEN ? AND ?
       ORDER BY t.date DESC, t.created_at DESC`,
      [from, to],
    );
    return (result.values ?? []).map(this.rowToTransactionWithCategory);
  }

  async getRecent(limit = 5): Promise<TransactionWithCategory[]> {
    const result = await this.db.getDb().query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT ?`,
      [limit],
    );
    return (result.values ?? []).map(this.rowToTransactionWithCategory);
  }

  async getById(id: number): Promise<TransactionWithCategory | null> {
    const result = await this.db.getDb().query(
      `SELECT t.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id],
    );
    return result.values?.[0] ? this.rowToTransactionWithCategory(result.values[0]) : null;
  }

  async addQuickEntry(entry: QuickEntry): Promise<Transaction> {
    const newTx: NewTransaction = {
      amount: entry.amount,
      description: entry.description ?? null,
      categoryId: entry.categoryId,
      date: entry.date,
      isFixedCost: false,
      fixedCostId: null,
    };
    return this.create(newTx);
  }

  async create(data: NewTransaction): Promise<Transaction> {
    const result = await this.db.getDb().run(
      `INSERT INTO transactions (amount, description, category_id, date, is_fixed_cost, fixed_cost_id)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [
        data.amount,
        data.description,
        data.categoryId,
        data.date,
        data.isFixedCost ? 1 : 0,
        data.fixedCostId,
      ],
    );
    const id = result.changes?.lastId;
    if (!id) throw new Error('Failed to create transaction');

    return {
      ...data,
      id,
      createdAt: new Date().toISOString(),
    };
  }

  async update(id: number, data: Partial<NewTransaction>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.amount !== undefined)      { fields.push('amount = ?');       values.push(data.amount); }
    if (data.description !== undefined) { fields.push('description = ?');  values.push(data.description); }
    if (data.categoryId !== undefined)  { fields.push('category_id = ?');  values.push(data.categoryId); }
    if (data.date !== undefined)        { fields.push('date = ?');          values.push(data.date); }

    if (fields.length === 0) return;
    values.push(id);

    await this.db.getDb().run(
      `UPDATE transactions SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
  }

  async delete(id: number): Promise<void> {
    await this.db.getDb().run('DELETE FROM transactions WHERE id = ?', [id]);
    this.transactionsSubject.next(this.transactionsSubject.value.filter((t) => t.id !== id));
  }

  async getMonthSummary(year: number, month: number): Promise<MonthSummary> {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-31`;

    const result = await this.db.getDb().query(
      `SELECT
         SUM(CASE WHEN c.type = 'expense' THEN t.amount ELSE 0 END) AS total_expenses,
         SUM(CASE WHEN c.type = 'income'  THEN t.amount ELSE 0 END) AS total_income,
         COUNT(*) AS tx_count
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.date BETWEEN ? AND ?`,
      [from, to],
    );

    const row = result.values?.[0] ?? {};
    const totalExpenses = (row['total_expenses'] as number) ?? 0;
    const totalIncome   = (row['total_income']   as number) ?? 0;

    return {
      month,
      year,
      totalExpenses,
      totalIncome,
      balance: totalIncome - totalExpenses,
      transactionCount: (row['tx_count'] as number) ?? 0,
    };
  }

  async getCategorySummary(year: number, month: number): Promise<CategorySummary[]> {
    const from = `${year}-${String(month).padStart(2, '0')}-01`;
    const to = `${year}-${String(month).padStart(2, '0')}-31`;

    const result = await this.db.getDb().query(
      `SELECT
         c.id   AS category_id,
         c.name AS category_name,
         c.color AS category_color,
         c.icon  AS category_icon,
         SUM(t.amount) AS total
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.date BETWEEN ? AND ? AND c.type = 'expense'
       GROUP BY c.id
       ORDER BY total DESC`,
      [from, to],
    );

    const rows = result.values ?? [];
    const grandTotal = rows.reduce((sum, r) => sum + ((r['total'] as number) ?? 0), 0);

    return rows.map((r) => ({
      categoryId:    r['category_id']    as number,
      categoryName:  r['category_name']  as string,
      categoryColor: r['category_color'] as string,
      categoryIcon:  r['category_icon']  as string,
      total:         r['total']          as number,
      percentage:    grandTotal > 0 ? ((r['total'] as number) / grandTotal) * 100 : 0,
    }));
  }

  private rowToTransactionWithCategory(row: Record<string, unknown>): TransactionWithCategory {
    return {
      id:            row['id']             as number,
      amount:        row['amount']         as number,
      description:   row['description']   as string | null,
      categoryId:    row['category_id']   as number | null,
      date:          row['date']           as string,
      isFixedCost:   (row['is_fixed_cost'] as number) === 1,
      fixedCostId:   row['fixed_cost_id'] as number | null,
      createdAt:     row['created_at']    as string,
      categoryName:  row['category_name'] as string | null,
      categoryIcon:  row['category_icon'] as string | null,
      categoryColor: row['category_color'] as string | null,
    };
  }
}

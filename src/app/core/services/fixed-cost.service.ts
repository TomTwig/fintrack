import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BillingCycle, FixedCost, FixedCostWithCategory, NewFixedCost } from '../models/fixed-cost.model';
import { NewTransaction } from '../models/transaction.model';

import { DatabaseService } from './database.service';
import { TransactionService } from './transaction.service';

@Injectable({ providedIn: 'root' })
export class FixedCostService {
  private fixedCostsSubject = new BehaviorSubject<FixedCostWithCategory[]>([]);
  readonly fixedCosts$ = this.fixedCostsSubject.asObservable();

  constructor(
    private db: DatabaseService,
    private transactionService: TransactionService,
  ) {}

  async loadAll(): Promise<void> {
    await this.db.ensureReady();
    this.fixedCostsSubject.next(await this.getAll());
  }

  async getAll(): Promise<FixedCostWithCategory[]> {
    await this.db.ensureReady();
    const result = await this.db.getDb().query(
      `SELECT f.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM fixed_costs f
       LEFT JOIN categories c ON f.category_id = c.id
       ORDER BY f.billing_day ASC`,
    );
    return (result.values ?? []).map(this.rowToFixedCostWithCategory);
  }

  async getActive(): Promise<FixedCostWithCategory[]> {
    await this.db.ensureReady();
    const result = await this.db.getDb().query(
      `SELECT f.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM fixed_costs f
       LEFT JOIN categories c ON f.category_id = c.id
       WHERE f.is_active = 1
       ORDER BY f.billing_day ASC`,
    );
    return (result.values ?? []).map(this.rowToFixedCostWithCategory);
  }

  async getById(id: number): Promise<FixedCostWithCategory | null> {
    await this.db.ensureReady();
    const result = await this.db.getDb().query(
      `SELECT f.*, c.name AS category_name, c.icon AS category_icon, c.color AS category_color
       FROM fixed_costs f
       LEFT JOIN categories c ON f.category_id = c.id
       WHERE f.id = ?`,
      [id],
    );
    return result.values?.[0] ? this.rowToFixedCostWithCategory(result.values[0]) : null;
  }

  async create(data: NewFixedCost): Promise<FixedCost> {
    await this.db.ensureReady();
    const result = await this.db.getDb().run(
      `INSERT INTO fixed_costs (name, amount, category_id, billing_day, billing_cycle, is_active, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.name, data.amount, data.categoryId, data.billingDay, data.billingCycle, data.isActive ? 1 : 0, data.notes],
    );
    const id = result.changes?.lastId;
    if (!id) throw new Error('Failed to create fixed cost');
    const created: FixedCost = { ...data, id, createdAt: new Date().toISOString() };
    await this.loadAll();
    return created;
  }

  async update(id: number, data: Partial<NewFixedCost>): Promise<void> {
    await this.db.ensureReady();
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name         !== undefined) { fields.push('name = ?');          values.push(data.name); }
    if (data.amount       !== undefined) { fields.push('amount = ?');        values.push(data.amount); }
    if (data.categoryId   !== undefined) { fields.push('category_id = ?');   values.push(data.categoryId); }
    if (data.billingDay   !== undefined) { fields.push('billing_day = ?');   values.push(data.billingDay); }
    if (data.billingCycle !== undefined) { fields.push('billing_cycle = ?'); values.push(data.billingCycle); }
    if (data.isActive     !== undefined) { fields.push('is_active = ?');     values.push(data.isActive ? 1 : 0); }
    if (data.notes        !== undefined) { fields.push('notes = ?');         values.push(data.notes); }

    if (fields.length === 0) return;
    values.push(id);

    await this.db.getDb().run(
      `UPDATE fixed_costs SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    await this.loadAll();
  }

  async delete(id: number): Promise<void> {
    await this.db.ensureReady();
    await this.db.getDb().run('DELETE FROM fixed_costs WHERE id = ?', [id]);
    this.fixedCostsSubject.next(this.fixedCostsSubject.value.filter((f) => f.id !== id));
  }

  async markAsPaid(fixedCost: FixedCost): Promise<void> {
    const today = new Date().toISOString().split('T')[0];
    const newTx: NewTransaction = {
      amount: fixedCost.amount, description: fixedCost.name,
      categoryId: fixedCost.categoryId, date: today,
      isFixedCost: true, fixedCostId: fixedCost.id,
    };
    await this.transactionService.create(newTx);
  }

  async isPaidThisMonth(fixedCostId: number): Promise<boolean> {
    await this.db.ensureReady();
    const now = new Date();
    const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
    const to   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-31`;
    const result = await this.db.getDb().query(
      `SELECT COUNT(*) AS count FROM transactions WHERE fixed_cost_id = ? AND date BETWEEN ? AND ?`,
      [fixedCostId, from, to],
    );
    return ((result.values?.[0]?.['count'] as number) ?? 0) > 0;
  }

  getMonthlyTotal(costs: FixedCost[]): number {
    return costs.filter((c) => c.isActive).reduce((sum, c) => {
      const monthly =
        c.billingCycle === 'monthly'   ? c.amount :
        c.billingCycle === 'quarterly' ? c.amount / 3 :
        c.amount / 12;
      return sum + monthly;
    }, 0);
  }

  private rowToFixedCostWithCategory(row: Record<string, unknown>): FixedCostWithCategory {
    return {
      id:            row['id']             as number,
      name:          row['name']           as string,
      amount:        row['amount']         as number,
      categoryId:    row['category_id']   as number | null,
      billingDay:    row['billing_day']   as number,
      billingCycle:  row['billing_cycle'] as BillingCycle,
      isActive:      (row['is_active']    as number) === 1,
      notes:         row['notes']          as string | null,
      createdAt:     row['created_at']    as string,
      categoryName:  row['category_name'] as string | null,
      categoryIcon:  row['category_icon'] as string | null,
      categoryColor: row['category_color'] as string | null,
    };
  }
}

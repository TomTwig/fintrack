import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { Category, CategoryType, NewCategory } from '../models/category.model';

import { DatabaseService } from './database.service';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private categoriesSubject = new BehaviorSubject<Category[]>([]);
  readonly categories$ = this.categoriesSubject.asObservable();

  constructor(private db: DatabaseService) {}

  async loadAll(): Promise<void> {
    const cats = await this.getAll();
    this.categoriesSubject.next(cats);
  }

  async getAll(): Promise<Category[]> {
    const result = await this.db.getDb().query(
      'SELECT id, name, icon, color, type FROM categories ORDER BY name',
    );
    return (result.values ?? []).map(this.rowToCategory);
  }

  async getByType(type: CategoryType): Promise<Category[]> {
    const result = await this.db.getDb().query(
      'SELECT id, name, icon, color, type FROM categories WHERE type = ? ORDER BY name',
      [type],
    );
    return (result.values ?? []).map(this.rowToCategory);
  }

  async getById(id: number): Promise<Category | null> {
    const result = await this.db.getDb().query(
      'SELECT id, name, icon, color, type FROM categories WHERE id = ?',
      [id],
    );
    return result.values?.[0] ? this.rowToCategory(result.values[0]) : null;
  }

  async create(data: NewCategory): Promise<Category> {
    const result = await this.db.getDb().run(
      'INSERT INTO categories (name, icon, color, type) VALUES (?, ?, ?, ?)',
      [data.name, data.icon, data.color, data.type],
    );
    const id = result.changes?.lastId;
    if (!id) throw new Error('Failed to create category');
    const category = { ...data, id };
    this.categoriesSubject.next([...this.categoriesSubject.value, category]);
    return category;
  }

  async update(id: number, data: Partial<NewCategory>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    if (data.name !== undefined) { fields.push('name = ?'); values.push(data.name); }
    if (data.icon !== undefined) { fields.push('icon = ?'); values.push(data.icon); }
    if (data.color !== undefined) { fields.push('color = ?'); values.push(data.color); }
    if (data.type !== undefined) { fields.push('type = ?'); values.push(data.type); }

    if (fields.length === 0) return;
    values.push(id);

    await this.db.getDb().run(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      values,
    );
    await this.loadAll();
  }

  async delete(id: number): Promise<void> {
    await this.db.getDb().run('DELETE FROM categories WHERE id = ?', [id]);
    this.categoriesSubject.next(this.categoriesSubject.value.filter((c) => c.id !== id));
  }

  private rowToCategory(row: Record<string, unknown>): Category {
    return {
      id: row['id'] as number,
      name: row['name'] as string,
      icon: row['icon'] as string,
      color: row['color'] as string,
      type: row['type'] as CategoryType,
    };
  }
}

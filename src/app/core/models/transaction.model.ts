export interface Transaction {
  id: number;
  amount: number;
  description: string | null;
  categoryId: number | null;
  date: string;          // ISO-8601: "2025-04-15"
  isFixedCost: boolean;
  fixedCostId: number | null;
  createdAt: string;     // ISO-8601
}

export type NewTransaction = Omit<Transaction, 'id' | 'createdAt'>;

export interface TransactionWithCategory extends Transaction {
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export interface QuickEntry {
  amount: number;
  categoryId: number;
  description?: string;
  date: string; // ISO-8601
}

export interface MonthSummary {
  month: number;
  year: number;
  totalExpenses: number;
  totalIncome: number;
  balance: number;
  transactionCount: number;
}

export interface CategorySummary {
  categoryId: number;
  categoryName: string;
  categoryColor: string;
  categoryIcon: string;
  total: number;
  percentage: number;
}

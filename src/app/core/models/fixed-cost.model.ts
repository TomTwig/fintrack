export type BillingCycle = 'monthly' | 'quarterly' | 'yearly';

export interface FixedCost {
  id: number;
  name: string;
  amount: number;
  categoryId: number | null;
  billingDay: number;    // Tag im Monat (1–31)
  billingCycle: BillingCycle;
  isActive: boolean;
  notes: string | null;
  createdAt: string;     // ISO-8601
}

export type NewFixedCost = Omit<FixedCost, 'id' | 'createdAt'>;

export interface FixedCostWithCategory extends FixedCost {
  categoryName: string | null;
  categoryIcon: string | null;
  categoryColor: string | null;
}

export function isFixedCostDueThisMonth(cost: FixedCost): boolean {
  const today = new Date();
  const dueDate = new Date(today.getFullYear(), today.getMonth(), cost.billingDay);
  return dueDate <= today;
}

export function getNextBillingDate(cost: FixedCost): Date {
  const today = new Date();
  const dueThisMonth = new Date(today.getFullYear(), today.getMonth(), cost.billingDay);

  if (cost.billingCycle === 'monthly') {
    return dueThisMonth > today
      ? dueThisMonth
      : new Date(today.getFullYear(), today.getMonth() + 1, cost.billingDay);
  }

  if (cost.billingCycle === 'quarterly') {
    for (let i = 0; i <= 3; i++) {
      const candidate = new Date(today.getFullYear(), today.getMonth() + i, cost.billingDay);
      if (candidate > today) return candidate;
    }
  }

  if (cost.billingCycle === 'yearly') {
    const thisYear = new Date(today.getFullYear(), today.getMonth(), cost.billingDay);
    return thisYear > today
      ? thisYear
      : new Date(today.getFullYear() + 1, today.getMonth(), cost.billingDay);
  }

  return dueThisMonth;
}

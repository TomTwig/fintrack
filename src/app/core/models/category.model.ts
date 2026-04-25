export type CategoryType = 'expense' | 'income';

export interface Category {
  id: number;
  name: string;
  icon: string;  // Ionicon-Name z.B. "cart-outline"
  color: string; // Hex-Farbe z.B. "#FF6B6B"
  type: CategoryType;
}

export type NewCategory = Omit<Category, 'id'>;

export const DEFAULT_CATEGORIES: NewCategory[] = [
  { name: 'Lebensmittel', icon: 'cart-outline', color: '#FF6B6B', type: 'expense' },
  { name: 'Restaurant', icon: 'restaurant-outline', color: '#FF9F43', type: 'expense' },
  { name: 'Transport', icon: 'car-outline', color: '#54A0FF', type: 'expense' },
  { name: 'Wohnen', icon: 'home-outline', color: '#5F27CD', type: 'expense' },
  { name: 'Freizeit', icon: 'game-controller-outline', color: '#1DD1A1', type: 'expense' },
  { name: 'Gesundheit', icon: 'medkit-outline', color: '#EF9F27', type: 'expense' },
  { name: 'Einkommen', icon: 'cash-outline', color: '#1D9E75', type: 'income' },
  { name: 'Shopping', icon: 'bag-outline', color: '#C44569', type: 'expense' },
  { name: 'Bildung', icon: 'book-outline', color: '#786FA6', type: 'expense' },
  { name: 'Sparplan', icon: 'trending-up-outline', color: '#20bf6b', type: 'expense' },
  { name: 'Sonstiges', icon: 'ellipsis-horizontal-outline', color: '#888EA8', type: 'expense' },
];

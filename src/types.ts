export type Category = 'Food' | 'Transport' | 'Shopping' | 'Bills' | 'Other';

export interface Expense {
  id: string;
  amount: number;
  category: Category;
  date: string;
  description?: string;
}

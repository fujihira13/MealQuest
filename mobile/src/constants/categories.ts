import type { ExpenseCategory } from '@/types';

export const CATEGORY_LIST: ExpenseCategory[] = [
  'スーパー', '自販機', 'コンビニ', '外食', '飲み会', 'デート', 'その他',
];

export const CATEGORY_COLORS: Record<ExpenseCategory, string> = {
  'スーパー': '#4CAF50', '自販機': '#2196F3', 'コンビニ': '#FF9800',
  '外食': '#9C27B0', '飲み会': '#F44336', 'デート': '#E91E63', 'その他': '#9E9E9E',
};

export const CATEGORY_ICONS: Record<ExpenseCategory, string> = {
  'スーパー': '🛒', '自販機': '🥤', 'コンビニ': '🏪',
  '外食': '🍽️', '飲み会': '🍻', 'デート': '💕', 'その他': '📝',
};

export const WASTE_CATEGORIES: ExpenseCategory[] = ['コンビニ', '自販機'];

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '../utils/id';
import type { Expense } from '../types';
import { useNotificationStore } from './useNotificationStore';

interface ExpenseState {
  expenses: Expense[];
  setAll: (expenses: Expense[]) => void;
  add: (data: Omit<Expense, 'id' | 'createdAt'>) => Expense;
  update: (id: string, patch: Partial<Expense>) => void;
  remove: (id: string) => void;
}

export const useExpenseStore = create<ExpenseState>()(
  persist(
    (set, get) => ({
      expenses: [],
      setAll: (expenses) => set({ expenses }),
      add: (data) => {
        const expense: Expense = { ...data, id: generateId('exp'), createdAt: new Date().toISOString() };
        set((s) => ({ expenses: [expense, ...s.expenses] }));
        useNotificationStore.getState().push('success', 'Expense recorded', `${expense.title} — ${expense.amount}`);
        return expense;
      },
      update: (id, patch) => set((s) => ({ expenses: s.expenses.map((e) => (e.id === id ? { ...e, ...patch } : e)) })),
      remove: (id) => set((s) => ({ expenses: s.expenses.filter((e) => e.id !== id) }))
    }),
    { name: 'greenledger:v1:expenses', storage: createJSONStorage(() => localStorage) }
  )
);

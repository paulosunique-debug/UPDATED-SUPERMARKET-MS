import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId, generateBarcode, generateSKU } from '../utils/id';
import type { Product } from '../types';
import { useStockLogStore } from './useStockLogStore';
import { useNotificationStore } from './useNotificationStore';

export type NewProductInput = Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'sku' | 'barcode'> & {
  sku?: string;
  barcode?: string;
};

interface ProductState {
  products: Product[];
  setAll: (products: Product[]) => void;
  add: (data: NewProductInput) => Product;
  update: (id: string, patch: Partial<Product>) => void;
  remove: (id: string) => void;
  duplicate: (id: string) => Product | null;
  receiveStock: (id: string, qty: number, reason?: string, reference?: string) => void;
  adjustStock: (id: string, qty: number, direction: 'increase' | 'decrease', reason?: string) => void;
  transferStock: (id: string, qty: number, reason?: string) => void;
  decreaseForSale: (id: string, qty: number, reference: string) => void;
}

export const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],
      setAll: (products) => set({ products }),
      add: (data) => {
        const now = new Date().toISOString();
        const product: Product = {
          ...data,
          id: generateId('prod'),
          sku: data.sku || generateSKU(data.name),
          barcode: data.barcode || generateBarcode(),
          createdAt: now,
          updatedAt: now
        };
        set((s) => ({ products: [product, ...s.products] }));
        useStockLogStore.getState().addLog({
          productId: product.id,
          type: 'initial',
          quantity: product.stock,
          reason: 'Product created',
          resultingStock: product.stock
        });
        useNotificationStore.getState().push('success', 'Product added', `${product.name} was added to the catalog.`);
        if (product.stock <= product.reorderLevel) {
          useNotificationStore.getState().push('warning', 'Low stock', `${product.name} is at or below its reorder level.`);
        }
        return product;
      },
      update: (id, patch) => {
        set((s) => ({
          products: s.products.map((p) => (p.id === id ? { ...p, ...patch, updatedAt: new Date().toISOString() } : p))
        }));
        const p = get().products.find((x) => x.id === id);
        if (p) useNotificationStore.getState().push('info', 'Product updated', `${p.name} was updated.`);
      },
      remove: (id) => {
        const p = get().products.find((x) => x.id === id);
        set((s) => ({ products: s.products.filter((x) => x.id !== id) }));
        if (p) useNotificationStore.getState().push('warning', 'Product deleted', `${p.name} was removed from the catalog.`);
      },
      duplicate: (id) => {
        const original = get().products.find((x) => x.id === id);
        if (!original) return null;
        const now = new Date().toISOString();
        const copy: Product = {
          ...original,
          id: generateId('prod'),
          name: `${original.name} (Copy)`,
          sku: generateSKU(original.name),
          barcode: generateBarcode(),
          createdAt: now,
          updatedAt: now
        };
        set((s) => ({ products: [copy, ...s.products] }));
        useNotificationStore.getState().push('success', 'Product duplicated', `Created a copy of ${original.name}.`);
        return copy;
      },
      receiveStock: (id, qty, reason, reference) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const resultingStock = p.stock + qty;
        get().update(id, { stock: resultingStock });
        useStockLogStore.getState().addLog({ productId: id, type: 'receive', quantity: qty, reason, reference, resultingStock });
      },
      adjustStock: (id, qty, direction, reason) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const delta = direction === 'increase' ? qty : -qty;
        const resultingStock = Math.max(0, p.stock + delta);
        get().update(id, { stock: resultingStock });
        useStockLogStore.getState().addLog({
          productId: id,
          type: direction === 'increase' ? 'adjust-increase' : 'adjust-decrease',
          quantity: delta,
          reason,
          resultingStock
        });
        if (resultingStock <= p.reorderLevel) {
          useNotificationStore.getState().push('warning', 'Low stock', `${p.name} is now at ${resultingStock} units.`);
        }
      },
      transferStock: (id, qty, reason) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const resultingStock = Math.max(0, p.stock - qty);
        get().update(id, { stock: resultingStock });
        useStockLogStore.getState().addLog({ productId: id, type: 'transfer', quantity: -qty, reason, resultingStock });
      },
      decreaseForSale: (id, qty, reference) => {
        const p = get().products.find((x) => x.id === id);
        if (!p) return;
        const resultingStock = Math.max(0, p.stock - qty);
        set((s) => ({ products: s.products.map((x) => (x.id === id ? { ...x, stock: resultingStock } : x)) }));
        useStockLogStore.getState().addLog({ productId: id, type: 'sale', quantity: -qty, reference, resultingStock });
        if (resultingStock <= p.reorderLevel) {
          useNotificationStore.getState().push('warning', 'Low stock', `${p.name} is running low (${resultingStock} left).`);
        }
      }
    }),
    { name: 'greenledger:v1:products', storage: createJSONStorage(() => localStorage) }
  )
);

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { generateId } from '../utils/id';
import type { PurchaseOrder, PurchaseOrderItem } from '../types';
import { useNotificationStore } from './useNotificationStore';

interface PurchaseOrderState {
  orders: PurchaseOrder[];
  setAll: (orders: PurchaseOrder[]) => void;
  create: (supplierId: string, items: PurchaseOrderItem[]) => PurchaseOrder;
  markDelivered: (id: string) => void;
  cancel: (id: string) => void;
}

export const usePurchaseOrderStore = create<PurchaseOrderState>()(
  persist(
    (set, get) => ({
      orders: [],
      setAll: (orders) => set({ orders }),
      create: (supplierId, items) => {
        const poNumber = `PO-${20000 + get().orders.length}`;
        const order: PurchaseOrder = {
          id: generateId('po'),
          poNumber,
          supplierId,
          items,
          status: 'pending',
          createdAt: new Date().toISOString(),
          deliveredAt: null
        };
        set((s) => ({ orders: [order, ...s.orders] }));
        useNotificationStore.getState().push('success', 'Purchase order created', `${poNumber} was created.`);
        return order;
      },
      markDelivered: (id) => {
        set((s) => ({
          orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'delivered', deliveredAt: new Date().toISOString() } : o))
        }));
        const o = get().orders.find((x) => x.id === id);
        if (o) useNotificationStore.getState().push('success', 'Order delivered', `${o.poNumber} marked as delivered.`);
      },
      cancel: (id) => {
        set((s) => ({ orders: s.orders.map((o) => (o.id === id ? { ...o, status: 'cancelled' } : o)) }));
        const o = get().orders.find((x) => x.id === id);
        if (o) useNotificationStore.getState().push('warning', 'Order cancelled', `${o.poNumber} was cancelled.`);
      }
    }),
    { name: 'greenledger:v1:purchaseOrders', storage: createJSONStorage(() => localStorage) }
  )
);

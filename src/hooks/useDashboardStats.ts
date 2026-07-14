import { useMemo } from 'react';
import { useProductStore } from '../stores/useProductStore';
import { useSalesStore } from '../stores/useSalesStore';
import { useCustomerStore } from '../stores/useCustomerStore';
import { isSameDay, isSameMonth, daysAgo, getExpiryStatus } from '../utils/date';
import { round2 } from '../utils/currency';

export function useDashboardStats() {
  const products = useProductStore((s) => s.products);
  const sales = useSalesStore((s) => s.sales);
  const customers = useCustomerStore((s) => s.customers);

  return useMemo(() => {
    const completedSales = sales.filter((s) => s.status !== 'refunded');
    const todaySales = completedSales.filter((s) => isSameDay(s.createdAt));
    const monthSales = completedSales.filter((s) => isSameMonth(s.createdAt));

    const todayRevenue = round2(todaySales.reduce((sum, s) => sum + s.total, 0));
    const monthRevenue = round2(monthSales.reduce((sum, s) => sum + s.total, 0));
    const totalRevenue = round2(completedSales.reduce((sum, s) => sum + s.total, 0));

    const totalCost = completedSales.reduce((sum, s) => {
      return (
        sum +
        s.items.reduce((lineSum, item) => {
          const product = products.find((p) => p.id === item.productId);
          const cost = product ? product.costPrice : item.unitPrice * 0.6;
          return lineSum + cost * item.quantity;
        }, 0)
      );
    }, 0);
    const profit = round2(totalRevenue - totalCost);

    const inventoryValue = round2(products.reduce((sum, p) => sum + p.costPrice * p.stock, 0));
    const lowStock = products.filter((p) => p.stock <= p.reorderLevel && p.stock > 0);
    const outOfStock = products.filter((p) => p.stock === 0);
    const expiringSoon = products.filter((p) => getExpiryStatus(p.expiryDate) === 'expiring');
    const expired = products.filter((p) => getExpiryStatus(p.expiryDate) === 'expired');

    // last 7 days revenue trend
    const trend = Array.from({ length: 7 }).map((_, i) => {
      const day = daysAgo(6 - i);
      const dayLabel = day.toLocaleDateString(undefined, { weekday: 'short' });
      const dayTotal = round2(
        completedSales.filter((s) => isSameDay(s.createdAt, day)).reduce((sum, s) => sum + s.total, 0)
      );
      return { day: dayLabel, revenue: dayTotal };
    });

    // sales by category
    const categoryTotals = new Map<string, number>();
    completedSales.forEach((s) => {
      s.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        const catId = product?.categoryId ?? 'unknown';
        categoryTotals.set(catId, (categoryTotals.get(catId) ?? 0) + item.unitPrice * item.quantity);
      });
    });

    return {
      todayRevenue,
      monthRevenue,
      totalRevenue,
      profit,
      inventoryValue,
      totalOrders: completedSales.length,
      todayOrders: todaySales.length,
      lowStock,
      outOfStock,
      expiringSoon,
      expired,
      totalCustomers: customers.length,
      trend,
      categoryTotals
    };
  }, [products, sales, customers]);
}

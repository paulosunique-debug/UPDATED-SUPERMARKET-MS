import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useAppInit } from './hooks/useAppInit';
import { useTheme } from './hooks/useTheme';
import { useExpiryAlerts } from './hooks/useExpiryAlerts';
import { AppLayout } from './layouts/AppLayout';
import { Leaf } from 'lucide-react';

import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Inventory from './pages/Inventory';
import POS from './pages/POS';
import Customers from './pages/Customers';
import Suppliers from './pages/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders';
import SalesHistory from './pages/SalesHistory';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

export default function App() {
  const ready = useAppInit();
  useTheme();
  useExpiryAlerts();

  if (!ready) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center gap-3 bg-paper dark:bg-slate2-900">
        <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-xl bg-market-500 text-white">
          <Leaf className="h-6 w-6" />
        </div>
        <p className="text-sm text-slate2-400">Setting up your store…</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/pos" element={<POS />} />
          <Route path="/products" element={<Products />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/suppliers" element={<Suppliers />} />
          <Route path="/purchase-orders" element={<PurchaseOrders />} />
          <Route path="/sales-history" element={<SalesHistory />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

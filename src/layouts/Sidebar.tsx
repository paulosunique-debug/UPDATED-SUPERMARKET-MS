import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  ShoppingCart,
  Users,
  Truck,
  ClipboardList,
  Receipt,
  Wallet,
  FileBarChart,
  LineChart,
  Settings,
  Leaf,
  ChevronsLeft,
  ChevronsRight,
  X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '../utils/cn';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';
import type { TranslationKey } from '../i18n/translations';

const NAV_ITEMS: { to: string; key: TranslationKey; icon: any; end?: boolean }[] = [
  { to: '/', key: 'nav_dashboard', icon: LayoutDashboard, end: true },
  { to: '/pos', key: 'nav_pos', icon: ShoppingCart },
  { to: '/products', key: 'nav_products', icon: Package },
  { to: '/categories', key: 'nav_categories', icon: Tags },
  { to: '/inventory', key: 'nav_inventory', icon: Boxes },
  { to: '/customers', key: 'nav_customers', icon: Users },
  { to: '/suppliers', key: 'nav_suppliers', icon: Truck },
  { to: '/purchase-orders', key: 'nav_purchaseOrders', icon: ClipboardList },
  { to: '/sales-history', key: 'nav_salesHistory', icon: Receipt },
  { to: '/expenses', key: 'nav_expenses', icon: Wallet },
  { to: '/reports', key: 'nav_reports', icon: FileBarChart },
  { to: '/analytics', key: 'nav_analytics', icon: LineChart },
  { to: '/settings', key: 'nav_settings', icon: Settings }
];

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const storeName = useSettingsStore((s) => s.settings.storeName);
  const logoUrl = useSettingsStore((s) => s.settings.logoUrl);
  const { t } = useTranslation();

  return (
    <>
      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm md:hidden" onClick={onCloseMobile} />
      )}
      <motion.aside
        animate={{ width: collapsed ? 76 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex h-screen flex-col border-r border-slate2-100 bg-white transition-transform duration-200 dark:border-slate2-700 dark:bg-slate2-800 md:relative md:z-auto md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-14 shrink-0 items-center gap-2 border-b border-slate2-100 px-4 dark:border-slate2-700">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-market-500 text-white">
            {logoUrl ? <img src={logoUrl} alt={storeName} className="h-full w-full object-cover" /> : <Leaf className="h-4 w-4" />}
          </div>
          {!collapsed && <span className="truncate font-display text-sm font-semibold text-ink dark:text-slate2-50">{storeName}</span>}
          <button onClick={onCloseMobile} className="ml-auto rounded-lg p-1.5 text-slate2-400 hover:bg-slate2-100 md:hidden dark:hover:bg-slate2-700">
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-market-50 text-market-600 dark:bg-market-900/40 dark:text-market-200'
                    : 'text-slate2-500 hover:bg-slate2-50 hover:text-ink dark:text-slate2-400 dark:hover:bg-slate2-700 dark:hover:text-slate2-100'
                )
              }
            >
              <item.icon className="h-4 w-4 shrink-0" />
              {!collapsed && <span className="truncate">{t(item.key)}</span>}
            </NavLink>
          ))}
        </nav>

        <button
          onClick={() => setCollapsed((c) => !c)}
          className="hidden shrink-0 items-center justify-center gap-2 border-t border-slate2-100 py-3 text-xs text-slate2-400 hover:text-slate2-600 md:flex dark:border-slate2-700"
        >
          {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
          {!collapsed && t('nav_collapse')}
        </button>
      </motion.aside>
    </>
  );
}

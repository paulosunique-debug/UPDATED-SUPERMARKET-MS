import { useMemo, useState } from 'react';
import { PackagePlus, PackageMinus, ArrowLeftRight, Search, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Modal } from '../components/ui/Modal';
import { Badge } from '../components/ui/Badge';
import { Tabs } from '../components/ui/Tabs';
import { DataTable, type DataTableColumn } from '../components/ui/DataTable';
import { useProductStore } from '../stores/useProductStore';
import { useStockLogStore } from '../stores/useStockLogStore';
import { useSettingsStore } from '../stores/useSettingsStore';
import { useTranslation } from '../hooks/useTranslation';
import { useDebounce } from '../hooks/useDebounce';
import { formatCurrency } from '../utils/currency';
import { formatDateTime, getExpiryStatus, formatExpiryLabel } from '../utils/date';
import type { Product, StockLogEntry } from '../types';

type Action = 'receive' | 'increase' | 'decrease' | 'transfer';

export default function Inventory() {
  const products = useProductStore((s) => s.products);
  const receiveStock = useProductStore((s) => s.receiveStock);
  const adjustStock = useProductStore((s) => s.adjustStock);
  const transferStock = useProductStore((s) => s.transferStock);
  const logs = useStockLogStore((s) => s.logs);
  const symbol = useSettingsStore((s) => s.settings.currencySymbol);
  const { t } = useTranslation();

  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 200);
  const [actionModal, setActionModal] = useState<{ product: Product; action: Action } | null>(null);
  const [qty, setQty] = useState('1');
  const [reason, setReason] = useState('');

  const filtered = products.filter((p) => !debouncedSearch || p.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || p.sku.toLowerCase().includes(debouncedSearch.toLowerCase()));

  const lowStock = products.filter((p) => p.stock <= p.reorderLevel && p.stock > 0);
  const outOfStock = products.filter((p) => p.stock === 0);
  const expiringSoon = products.filter((p) => getExpiryStatus(p.expiryDate) === 'expiring');
  const expired = products.filter((p) => getExpiryStatus(p.expiryDate) === 'expired');
  const inventoryValue = products.reduce((sum, p) => sum + p.costPrice * p.stock, 0);

  function openAction(product: Product, action: Action) {
    setActionModal({ product, action });
    setQty('1');
    setReason('');
  }

  function submitAction() {
    if (!actionModal) return;
    const n = Number(qty);
    if (!n || n <= 0) return;
    const { product, action } = actionModal;
    if (action === 'receive') receiveStock(product.id, n, reason || 'Stock received', 'manual-receive');
    if (action === 'increase') adjustStock(product.id, n, 'increase', reason || 'Manual increase');
    if (action === 'decrease') adjustStock(product.id, n, 'decrease', reason || 'Manual decrease');
    if (action === 'transfer') transferStock(product.id, n, reason || 'Stock transfer');
    setActionModal(null);
  }

  const columns: DataTableColumn<Product>[] = [
    { key: 'name', header: 'Product', sortable: true, render: (p) => <span className="font-medium text-ink dark:text-slate2-50">{p.name}</span> },
    { key: 'sku', header: 'SKU', render: (p) => <span className="font-mono text-xs text-slate2-400">{p.sku}</span> },
    {
      key: 'stock',
      header: 'Current Stock',
      sortable: true,
      render: (p) => {
        const tone = p.stock === 0 ? 'tomato' : p.stock <= p.reorderLevel ? 'citrus' : 'market';
        return <Badge tone={tone as any}>{p.stock} {p.unit}</Badge>;
      }
    },
    { key: 'reorderLevel', header: 'Reorder Level', render: (p) => `${p.reorderLevel} ${p.unit}` },
    {
      key: 'expiryDate',
      header: t('inventory_expiry'),
      sortable: true,
      render: (p) => {
        const status = getExpiryStatus(p.expiryDate);
        if (status === 'none') return <span className="text-slate2-400">—</span>;
        return <Badge tone={status === 'expired' ? 'tomato' : status === 'expiring' ? 'citrus' : 'market'}>{formatExpiryLabel(p.expiryDate)}</Badge>;
      }
    },
    { key: 'costPrice', header: 'Stock Value', render: (p) => formatCurrency(p.costPrice * p.stock, symbol) },
    {
      key: 'id',
      header: 'Actions',
      render: (p) => (
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <Button size="sm" variant="outline" onClick={() => openAction(p, 'receive')}>
            <PackagePlus className="h-3.5 w-3.5" />
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAction(p, 'increase')}>
            +
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAction(p, 'decrease')}>
            −
          </Button>
          <Button size="sm" variant="outline" onClick={() => openAction(p, 'transfer')}>
            <ArrowLeftRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )
    }
  ];

  const logColumns: DataTableColumn<StockLogEntry & { id: string }>[] = [
    { key: 'createdAt', header: 'Date', sortable: true, render: (l) => formatDateTime(l.createdAt) },
    {
      key: 'productId',
      header: 'Product',
      render: (l) => products.find((p) => p.id === l.productId)?.name ?? 'Deleted product'
    },
    {
      key: 'type',
      header: 'Type',
      render: (l) => <Badge tone={l.quantity < 0 ? 'tomato' : 'market'}>{l.type.replace('-', ' ')}</Badge>
    },
    { key: 'quantity', header: 'Qty Change', render: (l) => (l.quantity > 0 ? `+${l.quantity}` : l.quantity) },
    { key: 'resultingStock', header: 'Resulting Stock' },
    { key: 'reason', header: 'Reason', render: (l) => l.reason || l.reference || '—' }
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-ink dark:text-slate2-50">{t('inventory_title')}</h1>
          <p className="text-sm text-slate2-400">{t('inventory_totalValue')} {formatCurrency(inventoryValue, symbol)}</p>
        </div>
        <Tabs tabs={[{ value: 'overview', label: t('inventory_overview') }, { value: 'log', label: t('inventory_log'), count: logs.length }]} active={tab} onChange={setTab} />
      </div>

      {(lowStock.length > 0 || outOfStock.length > 0 || expiringSoon.length > 0 || expired.length > 0) && tab === 'overview' && (
        <div className="flex flex-wrap gap-3">
          {outOfStock.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-tomato-200 bg-tomato-50 px-3 py-2 text-sm text-tomato-600 dark:border-tomato-500/30 dark:bg-tomato-500/10">
              <AlertTriangle className="h-4 w-4" /> {outOfStock.length} {t('inventory_outOfStockAlert')}
            </div>
          )}
          {lowStock.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-citrus-200 bg-citrus-50 px-3 py-2 text-sm text-citrus-600 dark:border-citrus-500/30 dark:bg-citrus-500/10">
              <AlertTriangle className="h-4 w-4" /> {lowStock.length} {t('inventory_lowStockAlert')}
            </div>
          )}
          {expired.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-tomato-200 bg-tomato-50 px-3 py-2 text-sm text-tomato-600 dark:border-tomato-500/30 dark:bg-tomato-500/10">
              <AlertTriangle className="h-4 w-4" /> {expired.length} {t('inventory_expiredAlert')}
            </div>
          )}
          {expiringSoon.length > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-citrus-200 bg-citrus-50 px-3 py-2 text-sm text-citrus-600 dark:border-citrus-500/30 dark:bg-citrus-500/10">
              <AlertTriangle className="h-4 w-4" /> {expiringSoon.length} {t('inventory_expiringSoon')}
            </div>
          )}
        </div>
      )}

      {tab === 'overview' ? (
        <>
          <Input placeholder={`${t('common_search')}…`} leftIcon={<Search className="h-4 w-4" />} value={search} onChange={(e) => setSearch(e.target.value)} className="w-full max-w-xs" />
          <DataTable columns={columns} data={filtered} pageSize={10} />
        </>
      ) : (
        <DataTable columns={logColumns} data={logs.map((l) => ({ ...l }))} pageSize={12} />
      )}

      <Modal
        open={!!actionModal}
        onClose={() => setActionModal(null)}
        title={
          actionModal
            ? { receive: t('inventory_receive'), increase: t('inventory_increase'), decrease: t('inventory_decrease'), transfer: t('inventory_transfer') }[actionModal.action]
            : ''
        }
        description={actionModal ? `${actionModal.product.name} · currently ${actionModal.product.stock} ${actionModal.product.unit}` : ''}
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setActionModal(null)}>
              {t('common_cancel')}
            </Button>
            <Button onClick={submitAction}>{t('common_confirm')}</Button>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <Input label={t('inventory_quantity')} type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
          <Input label={t('inventory_reason')} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Optional note" />
        </div>
      </Modal>
    </div>
  );
}

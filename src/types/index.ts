export type Unit = 'pc' | 'kg' | 'g' | 'l' | 'ml' | 'box' | 'pack';

export interface Category {
  id: string;
  name: string;
  color: string;
  icon: string;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  categoryId: string;
  supplierId: string | null;
  costPrice: number;
  sellingPrice: number;
  taxRate: number; // percent
  unit: Unit;
  stock: number;
  reorderLevel: number;
  batchNumber: string;
  expiryDate: string | null;
  imageUrl: string | null;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface StockLogEntry {
  id: string;
  productId: string;
  type: 'receive' | 'adjust-increase' | 'adjust-decrease' | 'sale' | 'transfer' | 'initial' | 'po-receive';
  quantity: number;
  reason?: string;
  reference?: string;
  createdAt: string;
  resultingStock: number;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes: string;
  rewardPoints: number;
  debtBalance: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactName: string;
  phone: string;
  email: string;
  address: string;
  productIds: string[];
  balance: number;
  createdAt: string;
}

export type POStatus = 'pending' | 'delivered' | 'cancelled';

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitCost: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  items: PurchaseOrderItem[];
  status: POStatus;
  createdAt: string;
  deliveredAt: string | null;
}

export type PaymentMethod = 'cash' | 'card' | 'mobile-money' | 'split';

export interface SplitPaymentPart {
  method: 'cash' | 'card' | 'mobile-money';
  amount: number;
}

export interface SaleItem {
  productId: string;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number; // possibly manually overridden
  originalPrice: number;
  taxRate: number;
  lineDiscount: number;
}

export type SaleStatus = 'completed' | 'refunded' | 'partially-refunded';

export interface Sale {
  id: string;
  invoiceNumber: string;
  customerId: string | null;
  cashier: string;
  items: SaleItem[];
  subtotal: number;
  discount: number;
  discountType: 'amount' | 'percent';
  couponCode: string | null;
  tax: number;
  total: number;
  amountPaid: number;
  change: number;
  paymentMethod: PaymentMethod;
  splitPayments: SplitPaymentPart[] | null;
  status: SaleStatus;
  createdAt: string;
}

export type ExpenseCategory = 'Utilities' | 'Salary' | 'Transport' | 'Rent' | 'Marketing' | 'Other';

export interface Expense {
  id: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  notes: string;
  createdAt: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}

export interface StoreSettings {
  storeName: string;
  logoUrl: string | null;
  currency: string;
  currencySymbol: string;
  language: string;
  defaultTaxRate: number;
  receiptFooter: string;
  theme: 'light' | 'dark';
  notificationsEnabled: boolean;
}

export interface CartLine {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  originalPrice: number;
  quantity: number;
  taxRate: number;
  lineDiscount: number;
  stock: number;
}

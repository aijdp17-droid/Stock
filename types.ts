export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'seller'
  | 'stock_manager'
  | 'accountant'
  | 'custom';

export interface UserPermissions {
  manageUsers: boolean;
  connectSheets: boolean;
  viewProducts: boolean;
  addProduct: boolean;
  editPrices: boolean;
  recordSale: boolean;
  cancelSale: boolean;
  manageStock: boolean;
  viewFinancials: boolean;
  manageCategories: boolean;
  deleteData: boolean;
  managePurchases: boolean;
  manageExpenses: boolean;
  manageSettings: boolean;
  applyDiscounts: boolean;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
  customPermissions?: Partial<UserPermissions>;
  active: boolean;
  lastLogin?: string;
  title?: string;
  enterpriseId?: string;
}

export type BusinessSectorType =
  | 'general_commerce'
  | 'fashion_retail'
  | 'tech_electronics'
  | 'wholesale_distribution'
  | 'grocery_supermarket'
  | 'hardware_tools';

export type GoogleSheetTemplateType =
  | 'standard_erp'
  | 'retail_fashion'
  | 'hightech_serial'
  | 'wholesale_tier'
  | 'grocery_fresh'
  | 'hardware_tools';

export interface EnterpriseAccount {
  id: string;
  name: string;
  sector: BusinessSectorType;
  sheetTemplateType: GoogleSheetTemplateType;
  spreadsheetId: string;
  spreadsheetName: string;
  sheetUrl?: string;
  facebookPageUrl?: string;
  facebookPageName?: string;
  settings: CompanySettings;
  createdAt: string;
  ownerName: string;
  ownerEmail: string;
  isDefault?: boolean;
  notes?: string;
}

export interface CompanySettings {
  name: string;
  tagline: string;
  logoUrl: string;
  phone: string;
  email: string;
  address: string;
  siretOrNif: string;
  currency: string;
  taxRate: number; // e.g. 20 for 20%
  alertStockMin: number;
  allowNegativeStock: boolean;
  websiteEnabled: boolean;
  invoiceFooterNote: string;
  enterpriseId?: string;
  facebookPageUrl?: string;
  facebookPageName?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  iconName: string;
  active: boolean;
}

export type ProductStatus = 'active' | 'inactive' | 'unavailable';

export interface Product {
  id: string;
  ref: string; // SKU
  name: string;
  categoryId: string;
  description: string;
  imageUrl: string;
  purchasePrice: number; // Coût d'achat (confidentiel)
  sellingPrice: number; // Prix de vente public
  currentStock: number;
  minStockAlert: number;
  supplierId: string;
  status: ProductStatus;
  createdAt: string;
  updatedAt?: string;
  facebookPostUrl?: string; // Lien direct vers la publication/boutique Facebook du produit
}

export type StockMovementType =
  | 'in_purchase' // Entrée marchandise / Achat
  | 'out_sale' // Sortie vente
  | 'adjustment' // Ajustement inventaire
  | 'loss_damaged' // Perte ou casse
  | 'transfer' // Transfert interne
  | 'sale_canceled'; // Rétablissement suite annulation

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  productRef: string;
  type: StockMovementType;
  quantity: number; // positif ou négatif
  previousStock: number;
  newStock: number;
  reason: string;
  referenceDocId?: string; // ex: VTE-001 ou ACH-001
  userId: string;
  userName: string;
  date: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  companyName?: string;
  totalSpent: number;
  balanceDue: number; // Créance / Reste à payer
  createdAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  totalPurchases: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productRef: string;
  unitPrice: number;
  purchasePrice: number; // For margin calculation
  quantity: number;
  discountPercent: number;
  total: number;
}

export type PaymentMethod =
  | 'especes'
  | 'carte'
  | 'virement'
  | 'mobile_money'
  | 'cheque';

export type SaleStatus = 'completed' | 'partial' | 'canceled';

export interface Sale {
  id: string; // ex: VTE-2026-001
  date: string;
  sellerId: string;
  sellerName: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  taxAmount: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentMethod: PaymentMethod;
  status: SaleStatus;
  notes?: string;
  cancelReason?: string;
  canceledBy?: string;
  canceledAt?: string;
}

export interface PurchaseOrderItem {
  productId: string;
  productName: string;
  productRef: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
}

export interface PurchaseOrder {
  id: string; // ex: ACH-2026-001
  date: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  totalAmount: number;
  amountPaid: number;
  paymentStatus: 'paid' | 'partial' | 'pending';
  receiptStatus: 'ordered' | 'received' | 'partial';
  receivedAt?: string;
  receivedBy?: string;
  notes?: string;
}

export type ExpenseCategory =
  | 'loyer'
  | 'transport'
  | 'electricite'
  | 'fournitures'
  | 'salaires'
  | 'marketing'
  | 'autre';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory;
  amount: number;
  description: string;
  paymentMethod: PaymentMethod;
  recordedBy: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  entityType: string;
  entityId: string;
}

export interface GoogleSheetConnection {
  id: string;
  name: string;
  spreadsheetId: string;
  spreadsheetName: string;
  sheetUrl?: string;
  templateType?: GoogleSheetTemplateType;
  enterpriseId?: string;
  connectedAt: string;
  lastSyncAt?: string;
  status: 'connected' | 'error' | 'disconnected' | 'syncing';
  autoSync: boolean;
  mappedSheets: {
    products: string;
    categories: string;
    stock: string;
    sales: string;
    customers: string;
    suppliers: string;
    purchases: string;
    expenses: string;
    users: string;
  };
  syncErrors: string[];
}

export interface PublicOrderRequest {
  id: string;
  date: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  deliveryAddress: string;
  notes?: string;
  items: {
    productId: string;
    productName: string;
    productRef: string;
    quantity: number;
    unitPrice: number;
  }[];
  totalEstimated: number;
  status: 'pending' | 'converted' | 'rejected';
}

export type NotificationType = 'stock_alert' | 'web_order' | 'sheets_sync' | 'sale' | 'system';
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

export interface AppNotification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  actionTab?: string;
  targetId?: string;
}

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserPermissions,
  CompanySettings,
  Category,
  Product,
  StockMovement,
  Customer,
  Supplier,
  Sale,
  PurchaseOrder,
  Expense,
  AuditLog,
  GoogleSheetConnection,
  PublicOrderRequest,
  StockMovementType,
  AppNotification,
  EnterpriseAccount,
  BusinessSectorType,
  GoogleSheetTemplateType,
} from '../types';
import {
  DEFAULT_ROLE_PERMISSIONS,
  INITIAL_COMPANY_SETTINGS,
  INITIAL_ENTERPRISES,
  INITIAL_USERS,
  INITIAL_CATEGORIES,
  INITIAL_SUPPLIERS,
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SALES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_PURCHASES,
  INITIAL_EXPENSES,
  INITIAL_AUDIT_LOGS,
  INITIAL_SHEET_CONNECTIONS,
  INITIAL_PUBLIC_ORDERS,
  INITIAL_NOTIFICATIONS,
} from '../data/initialData';
import { GOOGLE_SHEET_TEMPLATES } from '../data/sheetTemplates';

interface AppContextType {
  currentUser: User;
  users: User[];
  currentPermissions: UserPermissions;
  hasPermission: (permission: keyof UserPermissions) => boolean;
  switchUser: (userId: string) => void;
  addUser: (userData: Omit<User, 'id'>) => void;
  updateUser: (id: string, userData: Partial<User>) => void;
  toggleUserStatus: (id: string) => void;

  // Enterprise & Multi-accounts
  enterprises: EnterpriseAccount[];
  currentEnterpriseId: string;
  currentEnterprise: EnterpriseAccount;
  createEnterprise: (data: {
    name: string;
    sector: BusinessSectorType;
    sheetTemplateType: GoogleSheetTemplateType;
    spreadsheetId?: string;
    spreadsheetName?: string;
    sheetUrl?: string;
    facebookPageUrl?: string;
    facebookPageName?: string;
    settings?: Partial<CompanySettings>;
    ownerName?: string;
    ownerEmail?: string;
    seedSampleData?: boolean;
  }) => EnterpriseAccount;
  switchEnterprise: (enterpriseId: string) => void;
  updateEnterprise: (id: string, data: Partial<EnterpriseAccount>) => void;
  deleteEnterprise: (id: string) => boolean;
  linkSheetTemplateToCurrentEnterprise: (
    templateType: GoogleSheetTemplateType,
    spreadsheetId?: string,
    spreadsheetName?: string,
    sheetUrl?: string
  ) => void;
  linkFacebookPageToCurrentEnterprise: (url: string, pageName?: string) => void;

  companySettings: CompanySettings;
  updateCompanySettings: (settings: Partial<CompanySettings>) => void;

  categories: Category[];
  addCategory: (category: Omit<Category, 'id'>) => void;
  updateCategory: (id: string, data: Partial<Category>) => void;
  deleteCategory: (id: string) => void;

  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Product;
  updateProduct: (id: string, data: Partial<Product>) => void;
  deleteProduct: (id: string) => void;

  stockMovements: StockMovement[];
  recordStockMovement: (
    productId: string,
    type: StockMovementType,
    quantity: number,
    reason: string,
    referenceDocId?: string
  ) => boolean;

  customers: Customer[];
  addCustomer: (customer: Omit<Customer, 'id' | 'totalSpent' | 'balanceDue' | 'createdAt'>) => Customer;
  updateCustomer: (id: string, data: Partial<Customer>) => void;

  suppliers: Supplier[];
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchases'>) => Supplier;
  updateSupplier: (id: string, data: Partial<Supplier>) => void;

  sales: Sale[];
  createSale: (saleData: Omit<Sale, 'id' | 'date' | 'sellerId' | 'sellerName'>) => Sale;
  cancelSale: (saleId: string, reason: string) => boolean;

  purchases: PurchaseOrder[];
  createPurchaseOrder: (poData: Omit<PurchaseOrder, 'id' | 'date'>) => PurchaseOrder;
  receivePurchaseOrder: (poId: string) => boolean;

  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id' | 'recordedBy'>) => void;
  deleteExpense: (id: string) => void;

  auditLogs: AuditLog[];
  addAuditLog: (action: string, details: string, entityType: string, entityId: string) => void;

  sheetConnections: GoogleSheetConnection[];
  connectSheet: (sheet: Omit<GoogleSheetConnection, 'id' | 'connectedAt' | 'syncErrors'>) => void;
  syncSheet: (connectionId: string) => Promise<boolean>;
  simulateSyncFailure: (connectionId: string, customError?: string) => Promise<void>;
  deleteSheetConnection: (id: string) => void;

  publicOrders: PublicOrderRequest[];
  submitPublicOrder: (order: Omit<PublicOrderRequest, 'id' | 'date' | 'status'>) => PublicOrderRequest;
  convertPublicOrderToSale: (orderId: string) => Sale | null;
  rejectPublicOrder: (orderId: string) => void;

  notifications: AppNotification[];
  activeToasts: AppNotification[];
  unreadNotificationsCount: number;
  addNotification: (
    notif: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>,
    triggerToast?: boolean
  ) => AppNotification;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  dismissToast: (id: string) => void;

  resetAllData: () => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => boolean;
}

const AppContext = createContext<AppContextType | null>(null);

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`omnigestion_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading ${key} from storage:`, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`omnigestion_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving ${key} to storage:`, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enterprises, setEnterprises] = useState<EnterpriseAccount[]>(() =>
    loadFromStorage('enterprises', INITIAL_ENTERPRISES)
  );
  const [currentEnterpriseId, setCurrentEnterpriseId] = useState<string>(() =>
    loadFromStorage('currentEnterpriseId', 'ent-1')
  );
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUserId, setCurrentUserId] = useState<string>(() => loadFromStorage('currentUserId', 'usr-1'));
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() =>
    loadFromStorage('companySettings', INITIAL_COMPANY_SETTINGS)
  );
  const [categories, setCategories] = useState<Category[]>(() => loadFromStorage('categories', INITIAL_CATEGORIES));
  const [products, setProducts] = useState<Product[]>(() => loadFromStorage('products', INITIAL_PRODUCTS));
  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() =>
    loadFromStorage('stockMovements', INITIAL_STOCK_MOVEMENTS)
  );
  const [customers, setCustomers] = useState<Customer[]>(() => loadFromStorage('customers', INITIAL_CUSTOMERS));
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => loadFromStorage('suppliers', INITIAL_SUPPLIERS));
  const [sales, setSales] = useState<Sale[]>(() => loadFromStorage('sales', INITIAL_SALES));
  const [purchases, setPurchases] = useState<PurchaseOrder[]>(() => loadFromStorage('purchases', INITIAL_PURCHASES));
  const [expenses, setExpenses] = useState<Expense[]>(() => loadFromStorage('expenses', INITIAL_EXPENSES));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadFromStorage('auditLogs', INITIAL_AUDIT_LOGS));
  const [sheetConnections, setSheetConnections] = useState<GoogleSheetConnection[]>(() =>
    loadFromStorage('sheetConnections', INITIAL_SHEET_CONNECTIONS)
  );
  const [publicOrders, setPublicOrders] = useState<PublicOrderRequest[]>(() =>
    loadFromStorage('publicOrders', INITIAL_PUBLIC_ORDERS)
  );
  const [notifications, setNotifications] = useState<AppNotification[]>(() =>
    loadFromStorage('notifications', INITIAL_NOTIFICATIONS)
  );
  const [activeToasts, setActiveToasts] = useState<AppNotification[]>([]);

  // Sync state to LocalStorage
  useEffect(() => saveToStorage('enterprises', enterprises), [enterprises]);
  useEffect(() => saveToStorage('currentEnterpriseId', currentEnterpriseId), [currentEnterpriseId]);
  useEffect(() => saveToStorage('users', users), [users]);
  useEffect(() => saveToStorage('currentUserId', currentUserId), [currentUserId]);
  useEffect(() => saveToStorage('companySettings', companySettings), [companySettings]);
  useEffect(() => saveToStorage('categories', categories), [categories]);
  useEffect(() => saveToStorage('products', products), [products]);
  useEffect(() => saveToStorage('stockMovements', stockMovements), [stockMovements]);
  useEffect(() => saveToStorage('customers', customers), [customers]);
  useEffect(() => saveToStorage('suppliers', suppliers), [suppliers]);
  useEffect(() => saveToStorage('sales', sales), [sales]);
  useEffect(() => saveToStorage('purchases', purchases), [purchases]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('auditLogs', auditLogs), [auditLogs]);
  useEffect(() => saveToStorage('sheetConnections', sheetConnections), [sheetConnections]);
  useEffect(() => saveToStorage('publicOrders', publicOrders), [publicOrders]);
  useEffect(() => saveToStorage('notifications', notifications), [notifications]);

  const unreadNotificationsCount = notifications.filter((n) => !n.isRead).length;

  const dismissToast = (id: string) => {
    setActiveToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const addNotification = (
    notifData: Omit<AppNotification, 'id' | 'timestamp' | 'isRead'>,
    triggerToast: boolean = true
  ): AppNotification => {
    const newNotif: AppNotification = {
      ...notifData,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };

    setNotifications((prev) => [newNotif, ...prev]);

    if (triggerToast) {
      setActiveToasts((prev) => [newNotif, ...prev.slice(0, 3)]); // Keep max 4 toasts at once
      // Auto-dismiss after 5 seconds
      setTimeout(() => {
        dismissToast(newNotif.id);
      }, 5000);
    }

    return newNotif;
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    dismissToast(id);
  };

  const clearAllNotifications = () => {
    setNotifications([]);
    setActiveToasts([]);
  };

  const currentUser = users.find((u) => u.id === currentUserId) || users[0];
  const currentEnterprise =
    enterprises.find((e) => e.id === currentEnterpriseId) || enterprises[0] || INITIAL_ENTERPRISES[0];

  const currentPermissions: UserPermissions = {
    ...DEFAULT_ROLE_PERMISSIONS[currentUser.role],
    ...(currentUser.customPermissions || {}),
  };

  const hasPermission = (permission: keyof UserPermissions): boolean => {
    return !!currentPermissions[permission];
  };

  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUserId(userId);
      addAuditLog('Changement Session', `Connexion de ${found.name} (${found.role})`, 'user', found.id);
    }
  };

  const addAuditLog = (action: string, details: string, entityType: string, entityId: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      userName: currentUser.name,
      action,
      details,
      entityType,
      entityId,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const addUser = (userData: Omit<User, 'id'>) => {
    const newUser: User = {
      ...userData,
      id: `usr-${Date.now()}`,
      lastLogin: 'Jamais connecté',
    };
    setUsers((prev) => [...prev, newUser]);
    addAuditLog('Création Utilisateur', `Création du compte ${newUser.name} (${newUser.role})`, 'user', newUser.id);
  };

  const updateUser = (id: string, userData: Partial<User>) => {
    setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, ...userData } : u)));
    addAuditLog('Modification Utilisateur', `Mise à jour du compte utilisateur ID: ${id}`, 'user', id);
  };

  const toggleUserStatus = (id: string) => {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === id) {
          const updatedActive = !u.active;
          addAuditLog(
            updatedActive ? 'Activation Compte' : 'Désactivation Compte',
            `Le compte ${u.name} a été ${updatedActive ? 'activé' : 'désactivé'}`,
            'user',
            id
          );
          return { ...u, active: updatedActive };
        }
        return u;
      })
    );
  };

  const updateCompanySettings = (settings: Partial<CompanySettings>) => {
    setCompanySettings((prev) => {
      const updated = { ...prev, ...settings };
      // Also synchronize into enterprises list
      setEnterprises((prevEnts) =>
        prevEnts.map((e) =>
          e.id === currentEnterpriseId
            ? {
                ...e,
                name: updated.name,
                facebookPageUrl: updated.facebookPageUrl,
                facebookPageName: updated.facebookPageName,
                settings: updated,
              }
            : e
        )
      );
      addAuditLog('Mise à jour Paramètres', 'Modification des paramètres généraux de l’entreprise', 'settings', 'company');
      return updated;
    });
  };

  const createEnterprise = (data: {
    name: string;
    sector: BusinessSectorType;
    sheetTemplateType: GoogleSheetTemplateType;
    spreadsheetId?: string;
    spreadsheetName?: string;
    sheetUrl?: string;
    facebookPageUrl?: string;
    facebookPageName?: string;
    settings?: Partial<CompanySettings>;
    ownerName?: string;
    ownerEmail?: string;
    seedSampleData?: boolean;
  }): EnterpriseAccount => {
    const newEntId = `ent-${Date.now()}`;
    const template =
      GOOGLE_SHEET_TEMPLATES.find((t) => t.id === data.sheetTemplateType) || GOOGLE_SHEET_TEMPLATES[0];

    const safeName = data.name.trim();
    const sheetId =
      data.spreadsheetId?.trim() || `1${safeName.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}_Sheets`;
    const sheetName = data.spreadsheetName?.trim() || template.defaultSpreadsheetName;
    const sheetUrl = data.sheetUrl?.trim() || `https://docs.google.com/spreadsheets/d/${sheetId}`;
    const fbUrl = data.facebookPageUrl?.trim() || data.settings?.facebookPageUrl?.trim() || undefined;
    const fbName = data.facebookPageName?.trim() || data.settings?.facebookPageName?.trim() || (fbUrl ? `${safeName} Officiel` : undefined);

    const newSettings: CompanySettings = {
      name: safeName,
      tagline: data.settings?.tagline || `Espace commercial - ${template.sectorLabel}`,
      logoUrl: data.settings?.logoUrl || '',
      phone: data.settings?.phone || companySettings.phone,
      email: data.settings?.email || (data.ownerEmail ? data.ownerEmail : companySettings.email),
      address: data.settings?.address || companySettings.address,
      siretOrNif: data.settings?.siretOrNif || `SIRET ${Math.floor(100000000 + Math.random() * 900000000)} 00018`,
      currency: data.settings?.currency || '€',
      taxRate: data.settings?.taxRate ?? 20,
      alertStockMin: data.settings?.alertStockMin ?? 5,
      allowNegativeStock: data.settings?.allowNegativeStock ?? false,
      websiteEnabled: true,
      invoiceFooterNote: data.settings?.invoiceFooterNote || `Facture ${safeName} - Merci pour votre confiance.`,
      enterpriseId: newEntId,
      facebookPageUrl: fbUrl,
      facebookPageName: fbName,
    };

    const newEnterprise: EnterpriseAccount = {
      id: newEntId,
      name: safeName,
      sector: data.sector,
      sheetTemplateType: data.sheetTemplateType,
      spreadsheetId: sheetId,
      spreadsheetName: sheetName,
      sheetUrl: sheetUrl,
      facebookPageUrl: fbUrl,
      facebookPageName: fbName,
      settings: newSettings,
      createdAt: new Date().toISOString(),
      ownerName: data.ownerName || currentUser.name,
      ownerEmail: data.ownerEmail || currentUser.email,
      isDefault: false,
      notes: `Entreprise créée avec le modèle Google Sheets "${template.name}".`,
    };

    // If seedSampleData requested, seed custom sample categories & products for this sector
    if (data.seedSampleData && template.sampleProducts?.length) {
      const addedCategories: Category[] = template.sampleCategories.map((c, idx) => ({
        ...c,
        id: `cat-${newEntId}-${idx + 1}`,
      }));
      setCategories((prev) => [...addedCategories, ...prev]);

      const addedProducts: Product[] = template.sampleProducts.map((p, idx) => ({
        ...p,
        id: `prod-${newEntId}-${idx + 1}`,
        categoryId: addedCategories[idx % addedCategories.length]?.id || 'cat-1',
        createdAt: new Date().toISOString(),
      }));
      setProducts((prev) => [...addedProducts, ...prev]);
    }

    // Create matching Google Sheet connection
    const newConnection: GoogleSheetConnection = {
      id: `conn-${newEntId}`,
      name: `Classeur ${template.name}`,
      spreadsheetId: sheetId,
      spreadsheetName: sheetName,
      sheetUrl: sheetUrl,
      templateType: data.sheetTemplateType,
      enterpriseId: newEntId,
      connectedAt: new Date().toISOString(),
      lastSyncAt: 'À l\'instant',
      status: 'connected',
      autoSync: true,
      mappedSheets: {
        products: template.sheets.find((s) => s.key === 'products')?.name || 'Produits_Stock',
        categories: template.sheets.find((s) => s.key === 'categories')?.name || 'Categories',
        stock: template.sheets.find((s) => s.key === 'stock')?.name || 'Mouvements_Stock',
        sales: template.sheets.find((s) => s.key === 'sales')?.name || 'Ventes_Factures',
        customers: template.sheets.find((s) => s.key === 'customers')?.name || 'Clients',
        suppliers: template.sheets.find((s) => s.key === 'suppliers')?.name || 'Fournisseurs',
        purchases: template.sheets.find((s) => s.key === 'purchases')?.name || 'Achats_Approvisionnement',
        expenses: template.sheets.find((s) => s.key === 'expenses')?.name || 'Depenses_Frais',
        users: 'Utilisateurs_Roles',
      },
      syncErrors: [],
    };

    setEnterprises((prev) => [...prev, newEnterprise]);
    setCurrentEnterpriseId(newEntId);
    setCompanySettings(newSettings);
    setSheetConnections((prev) => [newConnection, ...prev]);

    addAuditLog(
      'Création Entreprise',
      `Nouvelle entreprise "${safeName}" créée avec modèle Google Sheets "${template.name}"`,
      'enterprise',
      newEntId
    );

    addNotification(
      {
        type: 'system',
        severity: 'success',
        title: 'Nouvelle Entreprise Créée !',
        message: `L'entreprise "${safeName}" a été créée avec succès et liée au modèle Google Sheets "${template.name}".`,
        actionTab: 'sheets',
      },
      true
    );

    return newEnterprise;
  };

  const switchEnterprise = (enterpriseId: string) => {
    const found = enterprises.find((e) => e.id === enterpriseId);
    if (!found) return;

    setCurrentEnterpriseId(enterpriseId);
    setCompanySettings(found.settings);

    addAuditLog(
      'Changement Entreprise',
      `Basculement sur l'entreprise "${found.name}" (Modèle Sheets: ${found.sheetTemplateType})`,
      'enterprise',
      found.id
    );

    addNotification(
      {
        type: 'system',
        severity: 'info',
        title: 'Entreprise Active Changée',
        message: `Vous gérez désormais le compte "${found.name}". Données et classeur Google Sheets synchronisés.`,
      },
      true
    );
  };

  const updateEnterprise = (id: string, data: Partial<EnterpriseAccount>) => {
    setEnterprises((prev) =>
      prev.map((e) => {
        if (e.id === id) {
          const updated = { ...e, ...data };
          if (data.settings && e.id === currentEnterpriseId) {
            setCompanySettings((prevSettings) => ({ ...prevSettings, ...data.settings }));
          }
          return updated;
        }
        return e;
      })
    );
    addAuditLog('Modification Entreprise', `Mise à jour des informations d'entreprise`, 'enterprise', id);
  };

  const deleteEnterprise = (id: string): boolean => {
    if (enterprises.length <= 1) {
      addNotification({
        type: 'system',
        severity: 'warning',
        title: 'Suppression Impossible',
        message: 'Vous devez conserver au moins un compte d\'entreprise actif.',
      });
      return false;
    }

    const toDelete = enterprises.find((e) => e.id === id);
    if (!toDelete) return false;

    setEnterprises((prev) => prev.filter((e) => e.id !== id));

    if (currentEnterpriseId === id) {
      const remaining = enterprises.filter((e) => e.id !== id);
      if (remaining.length > 0) {
        setCurrentEnterpriseId(remaining[0].id);
        setCompanySettings(remaining[0].settings);
      }
    }

    addAuditLog('Suppression Entreprise', `Entreprise "${toDelete.name}" supprimée`, 'enterprise', id);
    addNotification({
      type: 'system',
      severity: 'info',
      title: 'Entreprise Supprimée',
      message: `Le compte "${toDelete.name}" a été supprimé.`,
    });
    return true;
  };

  const linkSheetTemplateToCurrentEnterprise = (
    templateType: GoogleSheetTemplateType,
    spreadsheetId?: string,
    spreadsheetName?: string,
    sheetUrl?: string
  ) => {
    const template =
      GOOGLE_SHEET_TEMPLATES.find((t) => t.id === templateType) || GOOGLE_SHEET_TEMPLATES[0];
    const safeSheetId = spreadsheetId?.trim() || currentEnterprise.spreadsheetId;
    const safeSheetName = spreadsheetName?.trim() || template.defaultSpreadsheetName;
    const safeSheetUrl =
      sheetUrl?.trim() || (safeSheetId ? `https://docs.google.com/spreadsheets/d/${safeSheetId}` : undefined);

    // Update current enterprise
    setEnterprises((prev) =>
      prev.map((e) =>
        e.id === currentEnterpriseId
          ? {
              ...e,
              sheetTemplateType: templateType,
              spreadsheetId: safeSheetId,
              spreadsheetName: safeSheetName,
              sheetUrl: safeSheetUrl,
            }
          : e
      )
    );

    // Update or create corresponding connection
    setSheetConnections((prev) => {
      const existingIdx = prev.findIndex((c) => c.enterpriseId === currentEnterpriseId);
      const mapped = {
        products: template.sheets.find((s) => s.key === 'products')?.name || 'Produits_Stock',
        categories: template.sheets.find((s) => s.key === 'categories')?.name || 'Categories',
        stock: template.sheets.find((s) => s.key === 'stock')?.name || 'Mouvements_Stock',
        sales: template.sheets.find((s) => s.key === 'sales')?.name || 'Ventes_Factures',
        customers: template.sheets.find((s) => s.key === 'customers')?.name || 'Clients',
        suppliers: template.sheets.find((s) => s.key === 'suppliers')?.name || 'Fournisseurs',
        purchases: template.sheets.find((s) => s.key === 'purchases')?.name || 'Achats_Approvisionnement',
        expenses: template.sheets.find((s) => s.key === 'expenses')?.name || 'Depenses_Frais',
        users: 'Utilisateurs_Roles',
      };

      if (existingIdx >= 0) {
        const copy = [...prev];
        copy[existingIdx] = {
          ...copy[existingIdx],
          name: `Classeur ${template.name}`,
          spreadsheetId: safeSheetId,
          spreadsheetName: safeSheetName,
          sheetUrl: safeSheetUrl,
          templateType: templateType,
          mappedSheets: mapped,
          lastSyncAt: 'À l\'instant',
          status: 'connected',
        };
        return copy;
      } else {
        const newConn: GoogleSheetConnection = {
          id: `conn-${currentEnterpriseId}`,
          name: `Classeur ${template.name}`,
          spreadsheetId: safeSheetId,
          spreadsheetName: safeSheetName,
          sheetUrl: safeSheetUrl,
          templateType: templateType,
          enterpriseId: currentEnterpriseId,
          connectedAt: new Date().toISOString(),
          lastSyncAt: 'À l\'instant',
          status: 'connected',
          autoSync: true,
          mappedSheets: mapped,
          syncErrors: [],
        };
        return [newConn, ...prev];
      }
    });

    addAuditLog(
      'Liaison Modèle Sheets',
      `Entreprise "${currentEnterprise.name}" liée au modèle Google Sheets "${template.name}"`,
      'enterprise',
      currentEnterpriseId
    );

    addNotification(
      {
        type: 'sheets_sync',
        severity: 'success',
        title: 'Type de Google Sheets Associé !',
        message: `L'entreprise "${currentEnterprise.name}" est maintenant liée au type de feuille "${template.name}". Les schémas de données sont configurés.`,
        actionTab: 'sheets',
      },
      true
    );
  };

  const linkFacebookPageToCurrentEnterprise = (url: string, pageName?: string) => {
    const cleanUrl = url.trim();
    const cleanName = pageName?.trim() || cleanUrl.split('/').filter(Boolean).pop() || `${currentEnterprise.name} Officiel`;
    
    // Update company settings
    setCompanySettings((prev) => {
      const updated = {
        ...prev,
        facebookPageUrl: cleanUrl,
        facebookPageName: cleanName,
      };
      return updated;
    });

    // Update enterprises list
    setEnterprises((prev) =>
      prev.map((e) =>
        e.id === currentEnterpriseId
          ? {
              ...e,
              facebookPageUrl: cleanUrl,
              facebookPageName: cleanName,
              settings: {
                ...e.settings,
                facebookPageUrl: cleanUrl,
                facebookPageName: cleanName,
              },
            }
          : e
      )
    );

    addAuditLog(
      'Liaison Page Facebook',
      `Association de la page Facebook "${cleanName}" (${cleanUrl}) à l'entreprise "${currentEnterprise.name}"`,
      'enterprise',
      currentEnterpriseId
    );

    addNotification(
      {
        type: 'system',
        severity: 'success',
        title: 'Page Facebook Liée !',
        message: `La page Facebook "${cleanName}" est maintenant reliée à l'entreprise "${currentEnterprise.name}". Le bouton catalogue est actif !`,
        actionTab: 'products',
      },
      true
    );
  };

  const addCategory = (categoryData: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...categoryData,
      id: `cat-${Date.now()}`,
    };
    setCategories((prev) => [...prev, newCat]);
    addAuditLog('Nouvelle Catégorie', `Création de la catégorie: ${newCat.name}`, 'category', newCat.id);
  };

  const updateCategory = (id: string, data: Partial<Category>) => {
    setCategories((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    addAuditLog('Modification Catégorie', `Mise à jour de la catégorie ID: ${id}`, 'category', id);
  };

  const deleteCategory = (id: string) => {
    const target = categories.find((c) => c.id === id);
    setCategories((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Suppression Catégorie', `Suppression de la catégorie: ${target?.name || id}`, 'category', id);
  };

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt'>): Product => {
    const newProd: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setProducts((prev) => [...prev, newProd]);

    // Initial stock movement if stock > 0
    if (newProd.currentStock > 0) {
      const initialMvt: StockMovement = {
        id: `mvt-${Date.now()}`,
        productId: newProd.id,
        productName: newProd.name,
        productRef: newProd.ref,
        type: 'adjustment',
        quantity: newProd.currentStock,
        previousStock: 0,
        newStock: newProd.currentStock,
        reason: 'Stock initial à la création du produit',
        userId: currentUser.id,
        userName: currentUser.name,
        date: new Date().toISOString(),
      };
      setStockMovements((prev) => [initialMvt, ...prev]);
    }

    addAuditLog('Ajout Produit', `Création produit ${newProd.ref} - ${newProd.name}`, 'product', newProd.id);
    return newProd;
  };

  const updateProduct = (id: string, data: Partial<Product>) => {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...data, updatedAt: new Date().toISOString() } : p)));
    addAuditLog('Modification Produit', `Mise à jour du produit ID: ${id}`, 'product', id);
  };

  const deleteProduct = (id: string) => {
    const target = products.find((p) => p.id === id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
    addAuditLog('Suppression Produit', `Suppression du produit: ${target?.name || id}`, 'product', id);
  };

  const recordStockMovement = (
    productId: string,
    type: StockMovementType,
    quantity: number,
    reason: string,
    referenceDocId?: string
  ): boolean => {
    const product = products.find((p) => p.id === productId);
    if (!product) return false;

    const previousStock = product.currentStock;
    const newStock = previousStock + quantity;

    if (newStock < 0 && !companySettings.allowNegativeStock) {
      return false;
    }

    const mvt: StockMovement = {
      id: `mvt-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      productId,
      productName: product.name,
      productRef: product.ref,
      type,
      quantity,
      previousStock,
      newStock,
      reason,
      referenceDocId,
      userId: currentUser.id,
      userName: currentUser.name,
      date: new Date().toISOString(),
    };

    setStockMovements((prev) => [mvt, ...prev]);

    // Update product stock and status
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === productId) {
          const updatedStatus = newStock <= 0 ? 'unavailable' : p.status;
          return {
            ...p,
            currentStock: newStock,
            status: updatedStatus,
            updatedAt: new Date().toISOString(),
          };
        }
        return p;
      })
    );

    addAuditLog(
      'Mouvement de Stock',
      `${type.toUpperCase()} sur ${product.ref} (${quantity > 0 ? '+' : ''}${quantity}). Motif: ${reason}`,
      'stock',
      productId
    );

    // Automatic alerts for low stock and out-of-stock
    if (newStock <= 0 && previousStock > 0) {
      addNotification({
        type: 'stock_alert',
        severity: 'error',
        title: `Rupture de Stock : ${product.name}`,
        message: `Le produit ${product.ref} est désormais en rupture totale (0 unité en stock).`,
        actionTab: 'stock',
        targetId: product.id,
      });
    } else if (newStock <= product.minStockAlert && previousStock > product.minStockAlert) {
      addNotification({
        type: 'stock_alert',
        severity: 'warning',
        title: `Alerte Stock Faible : ${product.name}`,
        message: `Le stock du produit ${product.ref} a franchi le seuil d'alerte (${newStock} unités restantes, alerte min: ${product.minStockAlert}).`,
        actionTab: 'stock',
        targetId: product.id,
      });
    }

    return true;
  };

  const addCustomer = (customerData: Omit<Customer, 'id' | 'totalSpent' | 'balanceDue' | 'createdAt'>): Customer => {
    const newCustomer: Customer = {
      ...customerData,
      id: `cli-${Date.now()}`,
      totalSpent: 0,
      balanceDue: 0,
      createdAt: new Date().toISOString(),
    };
    setCustomers((prev) => [...prev, newCustomer]);
    addAuditLog('Nouveau Client', `Ajout client: ${newCustomer.name} (${newCustomer.phone})`, 'customer', newCustomer.id);
    return newCustomer;
  };

  const updateCustomer = (id: string, data: Partial<Customer>) => {
    setCustomers((prev) => prev.map((c) => (c.id === id ? { ...c, ...data } : c)));
    addAuditLog('Modification Client', `Mise à jour client ID: ${id}`, 'customer', id);
  };

  const addSupplier = (supplierData: Omit<Supplier, 'id' | 'totalPurchases'>): Supplier => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: `sup-${Date.now()}`,
      totalPurchases: 0,
    };
    setSuppliers((prev) => [...prev, newSupplier]);
    addAuditLog('Nouveau Fournisseur', `Ajout fournisseur: ${newSupplier.name}`, 'supplier', newSupplier.id);
    return newSupplier;
  };

  const updateSupplier = (id: string, data: Partial<Supplier>) => {
    setSuppliers((prev) => prev.map((s) => (s.id === id ? { ...s, ...data } : s)));
    addAuditLog('Modification Fournisseur', `Mise à jour fournisseur ID: ${id}`, 'supplier', id);
  };

  const createSale = (saleData: Omit<Sale, 'id' | 'date' | 'sellerId' | 'sellerName'>): Sale => {
    const saleId = `VTE-${new Date().getFullYear()}-${String(sales.length + 1).padStart(3, '0')}`;
    const newSale: Sale = {
      ...saleData,
      id: saleId,
      date: new Date().toISOString(),
      sellerId: currentUser.id,
      sellerName: currentUser.name,
    };

    // 1. Decrement stock for each product & create traceable movement
    newSale.items.forEach((item) => {
      recordStockMovement(
        item.productId,
        'out_sale',
        -item.quantity,
        `Vente n° ${saleId}`,
        saleId
      );
    });

    // 2. Update customer statistics if selected
    if (newSale.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === newSale.customerId) {
            return {
              ...c,
              totalSpent: c.totalSpent + newSale.grandTotal,
              balanceDue: c.balanceDue + newSale.balanceDue,
            };
          }
          return c;
        })
      );
    }

    setSales((prev) => [newSale, ...prev]);

    addAuditLog(
      'Nouvelle Vente Validée',
      `Facture ${saleId} d'un montant de ${newSale.grandTotal.toFixed(2)} ${companySettings.currency} par ${currentUser.name}`,
      'sale',
      saleId
    );

    return newSale;
  };

  const cancelSale = (saleId: string, reason: string): boolean => {
    const sale = sales.find((s) => s.id === saleId);
    if (!sale || sale.status === 'canceled') return false;

    // 1. Re-instate stock for each product
    sale.items.forEach((item) => {
      recordStockMovement(
        item.productId,
        'sale_canceled',
        item.quantity,
        `Annulation vente ${saleId}: ${reason}`,
        saleId
      );
    });

    // 2. Adjust customer balance if needed
    if (sale.customerId) {
      setCustomers((prev) =>
        prev.map((c) => {
          if (c.id === sale.customerId) {
            return {
              ...c,
              totalSpent: Math.max(0, c.totalSpent - sale.grandTotal),
              balanceDue: Math.max(0, c.balanceDue - sale.balanceDue),
            };
          }
          return c;
        })
      );
    }

    // 3. Mark sale as canceled
    setSales((prev) =>
      prev.map((s) =>
        s.id === saleId
          ? {
              ...s,
              status: 'canceled',
              cancelReason: reason,
              canceledBy: currentUser.name,
              canceledAt: new Date().toISOString(),
            }
          : s
      )
    );

    addAuditLog(
      'Annulation Vente',
      `Annulation de la facture ${saleId} par ${currentUser.name}. Motif: ${reason}. Stocks restitués.`,
      'sale',
      saleId
    );

    return true;
  };

  const createPurchaseOrder = (poData: Omit<PurchaseOrder, 'id' | 'date'>): PurchaseOrder => {
    const poId = `ACH-${new Date().getFullYear()}-${String(purchases.length + 1).padStart(3, '0')}`;
    const newPO: PurchaseOrder = {
      ...poData,
      id: poId,
      date: new Date().toISOString(),
    };

    setPurchases((prev) => [newPO, ...prev]);

    // Update supplier total purchases
    setSuppliers((prev) =>
      prev.map((s) => (s.id === newPO.supplierId ? { ...s, totalPurchases: s.totalPurchases + newPO.totalAmount } : s))
    );

    addAuditLog('Bon de Commande Achat', `Création commande ${poId} fournisseur ${newPO.supplierName}`, 'purchase', poId);

    // If order is directly marked as received upon creation
    if (newPO.receiptStatus === 'received') {
      newPO.items.forEach((item) => {
        recordStockMovement(
          item.productId,
          'in_purchase',
          item.quantityReceived || item.quantityOrdered,
          `Réception achat n° ${poId}`,
          poId
        );
      });
    }

    return newPO;
  };

  const receivePurchaseOrder = (poId: string): boolean => {
    const po = purchases.find((p) => p.id === poId);
    if (!po || po.receiptStatus === 'received') return false;

    // Strict requirement (§12): Update stock only upon effective reception
    po.items.forEach((item) => {
      const qty = item.quantityOrdered;
      recordStockMovement(item.productId, 'in_purchase', qty, `Réception effective marchandise ${poId}`, poId);
    });

    setPurchases((prev) =>
      prev.map((p) =>
        p.id === poId
          ? {
              ...p,
              receiptStatus: 'received',
              receivedAt: new Date().toISOString(),
              receivedBy: currentUser.name,
              items: p.items.map((it) => ({ ...it, quantityReceived: it.quantityOrdered })),
            }
          : p
      )
    );

    addAuditLog(
      'Réception Marchandises',
      `Réception confirmée et entrée en stock pour l'achat ${poId} par ${currentUser.name}`,
      'purchase',
      poId
    );

    return true;
  };

  const addExpense = (expenseData: Omit<Expense, 'id' | 'recordedBy'>) => {
    const newExpense: Expense = {
      ...expenseData,
      id: `dep-${Date.now()}`,
      recordedBy: currentUser.name,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    addAuditLog(
      'Enregistrement Dépense',
      `Dépense [${newExpense.category}]: ${newExpense.amount} ${companySettings.currency} - ${newExpense.description}`,
      'expense',
      newExpense.id
    );
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    addAuditLog('Suppression Dépense', `Suppression de la dépense ID: ${id}`, 'expense', id);
  };

  const connectSheet = (sheet: Omit<GoogleSheetConnection, 'id' | 'connectedAt' | 'syncErrors'>) => {
    const newConnection: GoogleSheetConnection = {
      ...sheet,
      id: `conn-${Date.now()}`,
      connectedAt: new Date().toISOString(),
      syncErrors: [],
    };
    setSheetConnections((prev) => [...prev, newConnection]);
    addAuditLog(
      'Connexion Google Sheets',
      `Nouvelle feuille Google Sheets configurée: ${newConnection.name} (${newConnection.spreadsheetName})`,
      'sheets',
      newConnection.id
    );
  };

  const syncSheet = async (connectionId: string): Promise<boolean> => {
    setSheetConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'syncing' } : c))
    );

    await new Promise((res) => setTimeout(res, 1200));

    const now = new Date();
    const formattedDate = `Aujourd'hui à ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    setSheetConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId
          ? {
              ...c,
              status: 'connected',
              lastSyncAt: formattedDate,
              syncErrors: [],
            }
          : c
      )
    );

    addAuditLog(
      'Synchronisation Google Sheets',
      `Synchronisation réussie des tables (Produits, Ventes, Stocks, Clients)`,
      'sheets',
      connectionId
    );

    addNotification({
      type: 'sheets_sync',
      severity: 'success',
      title: 'Google Sheets Synchronisé',
      message: `Toutes les feuilles et tables ont été synchronisées avec succès (${formattedDate}).`,
      actionTab: 'sheets',
      targetId: connectionId,
    });

    return true;
  };

  const simulateSyncFailure = async (connectionId: string, customError?: string): Promise<void> => {
    setSheetConnections((prev) =>
      prev.map((c) => (c.id === connectionId ? { ...c, status: 'syncing' } : c))
    );

    await new Promise((res) => setTimeout(res, 1000));

    const errMessage =
      customError ||
      "Erreur 403: Jeton OAuth révoqué ou feuille Google Sheets inaccessible (Permissions insuffisantes / Quota d'écriture dépassé)";

    setSheetConnections((prev) =>
      prev.map((c) =>
        c.id === connectionId
          ? {
              ...c,
              status: 'error',
              syncErrors: [errMessage, ...(c.syncErrors || []).slice(0, 4)],
            }
          : c
      )
    );

    addNotification({
      type: 'sheets_sync',
      severity: 'error',
      title: 'Échec de Synchronisation Google Sheets',
      message: `Erreur critique lors de la synchronisation : ${errMessage}. Vérifiez le partage de votre feuille ou reconnectez le classeur.`,
      actionTab: 'sheets',
      targetId: connectionId,
    });

    addAuditLog(
      'Échec Synchro Google Sheets',
      `Erreur lors de la synchronisation de la feuille ID ${connectionId}: ${errMessage}`,
      'sheets',
      connectionId
    );
  };

  const deleteSheetConnection = (id: string) => {
    setSheetConnections((prev) => prev.filter((c) => c.id !== id));
    addAuditLog('Déconnexion Google Sheets', `Connexion Google Sheets ID: ${id} supprimée`, 'sheets', id);
  };

  const submitPublicOrder = (order: Omit<PublicOrderRequest, 'id' | 'date' | 'status'>): PublicOrderRequest => {
    const newOrder: PublicOrderRequest = {
      ...order,
      id: `CMD-WEB-${String(publicOrders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString(),
      status: 'pending',
    };
    setPublicOrders((prev) => [newOrder, ...prev]);

    addAuditLog(
      'Commande En Ligne Reçue',
      `Nouvelle demande de commande ${newOrder.id} de ${newOrder.customerName} (${newOrder.totalEstimated.toFixed(2)} ${companySettings.currency})`,
      'order_request',
      newOrder.id
    );

    // Live alert notification for new web order
    addNotification({
      type: 'web_order',
      severity: 'info',
      title: `Nouvelle Commande Web : ${newOrder.id}`,
      message: `${newOrder.customerName} a transmis une commande en ligne (${newOrder.items.length} article(s) • ${newOrder.totalEstimated.toFixed(2)} ${companySettings.currency}).`,
      actionTab: 'web_orders',
      targetId: newOrder.id,
    });

    return newOrder;
  };

  const convertPublicOrderToSale = (orderId: string): Sale | null => {
    const order = publicOrders.find((o) => o.id === orderId);
    if (!order || order.status !== 'pending') return null;

    // Find or create customer
    let customer = customers.find((c) => c.phone === order.customerPhone || c.name.toLowerCase() === order.customerName.toLowerCase());
    if (!customer) {
      customer = addCustomer({
        name: order.customerName,
        phone: order.customerPhone,
        email: order.customerEmail,
        address: order.deliveryAddress,
      });
    }

    const saleItems = order.items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productName: it.productName,
        productRef: it.productRef,
        unitPrice: it.unitPrice,
        purchasePrice: prod?.purchasePrice || 0,
        quantity: it.quantity,
        discountPercent: 0,
        total: it.unitPrice * it.quantity,
      };
    });

    const subtotal = saleItems.reduce((acc, i) => acc + i.total, 0);
    const taxAmount = (subtotal * companySettings.taxRate) / 100;
    const grandTotal = subtotal + taxAmount;

    const sale = createSale({
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      items: saleItems,
      subtotal,
      discountTotal: 0,
      taxAmount,
      grandTotal,
      amountPaid: grandTotal,
      balanceDue: 0,
      paymentMethod: 'carte',
      status: 'completed',
      notes: `Convertie depuis la commande web ${order.id}. Adresse de livraison: ${order.deliveryAddress}. Notes: ${order.notes || 'Aucune'}`,
    });

    setPublicOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'converted' } : o)));

    addAuditLog(
      'Conversion Commande Web',
      `Demande ${order.id} convertie en vente validée ${sale.id}`,
      'sale',
      sale.id
    );

    return sale;
  };

  const rejectPublicOrder = (orderId: string) => {
    setPublicOrders((prev) => prev.map((o) => (o.id === orderId ? { ...o, status: 'rejected' } : o)));
    addAuditLog('Rejet Commande Web', `Demande de commande ${orderId} rejetée`, 'order_request', orderId);
  };

  const resetAllData = () => {
    setEnterprises(INITIAL_ENTERPRISES);
    setCurrentEnterpriseId('ent-1');
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr-1');
    setCompanySettings(INITIAL_COMPANY_SETTINGS);
    setCategories(INITIAL_CATEGORIES);
    setProducts(INITIAL_PRODUCTS);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setCustomers(INITIAL_CUSTOMERS);
    setSuppliers(INITIAL_SUPPLIERS);
    setSales(INITIAL_SALES);
    setPurchases(INITIAL_PURCHASES);
    setExpenses(INITIAL_EXPENSES);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setSheetConnections(INITIAL_SHEET_CONNECTIONS);
    setPublicOrders(INITIAL_PUBLIC_ORDERS);
    localStorage.clear();
  };

  const exportDatabaseJson = (): string => {
    const dump = {
      exportDate: new Date().toISOString(),
      enterprises,
      currentEnterpriseId,
      companySettings,
      users,
      categories,
      products,
      stockMovements,
      customers,
      suppliers,
      sales,
      purchases,
      expenses,
      auditLogs,
      sheetConnections,
      publicOrders,
    };
    return JSON.stringify(dump, null, 2);
  };

  const importDatabaseJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.enterprises) setEnterprises(data.enterprises);
      if (data.currentEnterpriseId) setCurrentEnterpriseId(data.currentEnterpriseId);
      if (data.companySettings) setCompanySettings(data.companySettings);
      if (data.users) setUsers(data.users);
      if (data.categories) setCategories(data.categories);
      if (data.products) setProducts(data.products);
      if (data.stockMovements) setStockMovements(data.stockMovements);
      if (data.customers) setCustomers(data.customers);
      if (data.suppliers) setSuppliers(data.suppliers);
      if (data.sales) setSales(data.sales);
      if (data.purchases) setPurchases(data.purchases);
      if (data.expenses) setExpenses(data.expenses);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      if (data.sheetConnections) setSheetConnections(data.sheetConnections);
      if (data.publicOrders) setPublicOrders(data.publicOrders);
      addAuditLog('Importation Sauvegarde', 'Base de données restaurée avec succès depuis un fichier JSON', 'backup', 'all');
      return true;
    } catch (e) {
      console.error('Import database JSON failed:', e);
      return false;
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        currentPermissions,
        hasPermission,
        switchUser,
        addUser,
        updateUser,
        toggleUserStatus,
        enterprises,
        currentEnterpriseId,
        currentEnterprise,
        createEnterprise,
        switchEnterprise,
        updateEnterprise,
        deleteEnterprise,
        linkSheetTemplateToCurrentEnterprise,
        linkFacebookPageToCurrentEnterprise,
        companySettings,
        updateCompanySettings,
        categories,
        addCategory,
        updateCategory,
        deleteCategory,
        products,
        addProduct,
        updateProduct,
        deleteProduct,
        stockMovements,
        recordStockMovement,
        customers,
        addCustomer,
        updateCustomer,
        suppliers,
        addSupplier,
        updateSupplier,
        sales,
        createSale,
        cancelSale,
        purchases,
        createPurchaseOrder,
        receivePurchaseOrder,
        expenses,
        addExpense,
        deleteExpense,
        auditLogs,
        addAuditLog,
        sheetConnections,
        connectSheet,
        syncSheet,
        simulateSyncFailure,
        deleteSheetConnection,
        publicOrders,
        submitPublicOrder,
        convertPublicOrderToSale,
        rejectPublicOrder,
        notifications,
        activeToasts,
        unreadNotificationsCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearAllNotifications,
        dismissToast,
        resetAllData,
        exportDatabaseJson,
        importDatabaseJson,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

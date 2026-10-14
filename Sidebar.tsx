import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  LayoutDashboard,
  ShoppingCart,
  Receipt,
  Package,
  Layers,
  ArrowUpDown,
  Users,
  Truck,
  ShoppingBag,
  Wallet,
  BarChart3,
  UserCog,
  FileSpreadsheet,
  Settings,
  Store,
  ChevronDown,
  Shield,
  LogOut,
  Bell,
  Menu,
  X,
} from 'lucide-react';
import { UserRole } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (open: boolean) => void;
  onOpenPublicCatalog: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  isMobileOpen,
  setIsMobileOpen,
  onOpenPublicCatalog,
}) => {
  const {
    currentUser,
    users,
    switchUser,
    hasPermission,
    companySettings,
    enterprises,
    currentEnterprise,
    currentEnterpriseId,
    switchEnterprise,
    products,
    publicOrders,
    sheetConnections,
  } = useApp();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  // Badge calculations
  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStockAlert && p.status !== 'inactive'
  ).length;
  const pendingOrdersCount = publicOrders.filter((o) => o.status === 'pending').length;

  const roleLabels: Record<UserRole, { label: string; color: string }> = {
    super_admin: { label: 'Super Admin', color: 'bg-purple-100 text-purple-800 border-purple-200' },
    admin: { label: 'Admin', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    moderator: { label: 'Modérateur', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    seller: { label: 'Vendeur', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    stock_manager: { label: 'Gest. Stock', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    accountant: { label: 'Comptable', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
    custom: { label: 'Personnalisé', color: 'bg-gray-100 text-gray-800 border-gray-200' },
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: 'pos',
      label: 'Nouvelle Vente',
      icon: ShoppingCart,
      show: hasPermission('recordSale'),
      highlight: true,
    },
    {
      id: 'sales',
      label: 'Historique des Ventes',
      icon: Receipt,
      show: hasPermission('recordSale') || hasPermission('viewFinancials'),
    },
    {
      id: 'products',
      label: 'Produits & Photos',
      icon: Package,
      show: hasPermission('viewProducts'),
      badge: lowStockCount > 0 ? `${lowStockCount} alertes` : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'categories',
      label: 'Catégories',
      icon: Layers,
      show: hasPermission('manageCategories') || hasPermission('viewProducts'),
    },
    {
      id: 'stock',
      label: 'Gestion des Stocks',
      icon: ArrowUpDown,
      show: hasPermission('manageStock') || hasPermission('viewProducts'),
      badge: lowStockCount > 0 ? `${lowStockCount}` : undefined,
      badgeColor: 'bg-red-500 text-white',
    },
    {
      id: 'web_orders',
      label: 'Commandes Web',
      icon: Store,
      show: hasPermission('recordSale') || hasPermission('viewFinancials'),
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount}` : undefined,
      badgeColor: 'bg-blue-600 text-white animate-pulse',
    },
    {
      id: 'customers',
      label: 'Clients',
      icon: Users,
      show: true,
    },
    {
      id: 'suppliers_purchases',
      label: 'Achats & Fournisseurs',
      icon: Truck,
      show: hasPermission('managePurchases') || currentUser.role === 'super_admin',
    },
    {
      id: 'expenses',
      label: 'Dépenses',
      icon: Wallet,
      show: hasPermission('manageExpenses') || hasPermission('viewFinancials'),
    },
    {
      id: 'reports',
      label: 'Rapports & Marges',
      icon: BarChart3,
      show: hasPermission('viewFinancials') || currentUser.role === 'super_admin',
    },
    {
      id: 'users',
      label: 'Utilisateurs & Rôles',
      icon: UserCog,
      show: hasPermission('manageUsers') || currentUser.role === 'super_admin',
    },
    {
      id: 'sheets',
      label: 'Google Sheets',
      icon: FileSpreadsheet,
      show: hasPermission('connectSheets') || currentUser.role === 'super_admin',
      badge: sheetConnections.some((c) => c.status === 'error')
        ? 'Erreur !'
        : sheetConnections.some((c) => c.status === 'connected')
        ? 'Actif'
        : undefined,
      badgeColor: sheetConnections.some((c) => c.status === 'error')
        ? 'bg-red-600 text-white animate-pulse'
        : 'bg-emerald-600 text-white',
    },
    {
      id: 'settings',
      label: 'Paramètres Généraux',
      icon: Settings,
      show: hasPermission('manageSettings') || currentUser.role === 'super_admin',
    },
  ];

  const handleSelectNav = (id: string) => {
    setCurrentTab(id);
    setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 backdrop-blur-xs z-40 lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static top-0 bottom-0 left-0 z-50 w-72 bg-white border-r border-gray-200 flex flex-col transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header Branding */}
        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20 shrink-0">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-gray-900 truncate leading-tight">
                {companySettings.name}
              </h1>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-blue-50 text-blue-700 border border-blue-200 uppercase font-mono">
                  {currentEnterprise?.sheetTemplateType ? currentEnterprise.sheetTemplateType.replace('_', ' ') : 'ERP'}
                </span>
                <p className="text-xs text-gray-500 truncate">{companySettings.currency} • {companySettings.tagline}</p>
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Profile Card & Role Switcher */}
        <div className="p-3 border-b border-gray-100 bg-slate-50/70">
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-white border border-gray-200 hover:border-gray-300 shadow-xs transition-all text-left"
            >
              <div className="flex items-center space-x-2.5 min-w-0">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-full object-cover border border-gray-200"
                />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1.5">
                    <span>{currentUser.name}</span>
                  </div>
                  <span
                    className={`inline-block text-[11px] font-medium px-2 py-0.5 rounded-md border ${
                      roleLabels[currentUser.role]?.color || 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {roleLabels[currentUser.role]?.label || currentUser.role}
                  </span>
                </div>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-1" />
            </button>

            {/* Quick Switch Dropdown */}
            {roleMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 p-2 max-h-72 overflow-y-auto">
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider px-2 py-1">
                  Tester un autre compte / rôle (§22)
                </div>
                {users.map((u) => (
                  <button
                    key={u.id}
                    onClick={() => {
                      switchUser(u.id);
                      setRoleMenuOpen(false);
                    }}
                    className={`w-full flex items-center space-x-2.5 p-2 rounded-lg text-left text-xs transition-colors ${
                      u.id === currentUser.id
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'hover:bg-gray-50 text-gray-700'
                    }`}
                  >
                    <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-full object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{u.name}</p>
                      <p className="text-[10px] text-gray-400">{roleLabels[u.role]?.label}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectNav(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                      : item.highlight
                      ? 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center space-x-3 truncate">
                    <Icon
                      className={`w-4 h-4 shrink-0 ${
                        isActive
                          ? 'text-white'
                          : item.highlight
                          ? 'text-emerald-600'
                          : 'text-gray-400'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
        </nav>

        {/* Public Catalog Link & Footer */}
        <div className="p-3 border-t border-gray-100 space-y-2 bg-slate-50">
          <button
            onClick={() => {
              onOpenPublicCatalog();
              setIsMobileOpen(false);
            }}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-all"
          >
            <Store className="w-4 h-4" />
            <span>Catalogue Public / Vitrine</span>
          </button>

          <div className="flex items-center justify-between text-[11px] text-gray-500 px-2 pt-1">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              En ligne (Local &amp; Sheets)
            </span>
            <span className="font-mono text-gray-400">v2.4.0</span>
          </div>
        </div>
      </aside>
    </>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Menu,
  Search,
  Bell,
  RefreshCw,
  ShoppingCart,
  Store,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  X,
  Building2,
  ChevronDown,
  Plus,
} from 'lucide-react';
import { CreateEnterpriseModal } from './CreateEnterpriseModal';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenPos: () => void;
  onOpenPublicCatalog: () => void;
  onSelectTab: (tab: string) => void;
  currentTab: string;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleSidebar,
  onOpenPos,
  onOpenPublicCatalog,
  onSelectTab,
  currentTab,
}) => {
  const {
    currentUser,
    companySettings,
    enterprises,
    currentEnterprise,
    currentEnterpriseId,
    switchEnterprise,
    products,
    publicOrders,
    sheetConnections,
    syncSheet,
    simulateSyncFailure,
    hasPermission,
    customers,
    sales,
    notifications,
    unreadNotificationsCount,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
  } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);
  const [showEnterpriseMenu, setShowEnterpriseMenu] = useState(false);
  const [showCreateEnterpriseModal, setShowCreateEnterpriseModal] = useState(false);
  const [notifFilter, setNotifFilter] = useState<'all' | 'stock_alert' | 'web_order' | 'sheets_sync'>('all');

  const filteredNotifications = notifications.filter((n) => {
    if (notifFilter === 'all') return true;
    return n.type === notifFilter;
  });

  const activeConnection = sheetConnections[0];

  const handleQuickSync = async () => {
    if (!activeConnection) {
      onSelectTab('sheets');
      return;
    }
    setIsSyncing(true);
    await syncSheet(activeConnection.id);
    setIsSyncing(false);
  };

  // Global search filtering
  const filteredProducts = searchTerm.trim()
    ? products
        .filter(
          (p) =>
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.ref.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .slice(0, 4)
    : [];

  const filteredCustomers = searchTerm.trim()
    ? customers
        .filter(
          (c) =>
            c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            c.phone.includes(searchTerm)
        )
        .slice(0, 3)
    : [];

  const filteredSales = searchTerm.trim()
    ? sales
        .filter(
          (s) =>
            s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .slice(0, 3)
    : [];

  const hasAnyResults =
    filteredProducts.length > 0 || filteredCustomers.length > 0 || filteredSales.length > 0;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 py-2.5">
      <div className="flex items-center justify-between gap-3">
        {/* Left: Mobile trigger & Search */}
        <div className="flex items-center space-x-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-gray-600 hover:bg-gray-100 focus:outline-hidden"
            aria-label="Toggle Navigation"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Global Search Bar */}
          <div className="relative flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher produit, réf SKU, client, facture..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowSearchResults(true);
                }}
                onFocus={() => setShowSearchResults(true)}
                className="w-full pl-9 pr-8 py-2 bg-gray-100 hover:bg-gray-50 focus:bg-white text-xs md:text-sm text-gray-900 placeholder-gray-400 rounded-xl border border-transparent focus:border-blue-500 focus:outline-hidden transition-all"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Quick Search Popover */}
            {showSearchResults && searchTerm.trim().length > 1 && (
              <div
                className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 p-3 max-h-96 overflow-y-auto"
                onMouseLeave={() => setShowSearchResults(false)}
              >
                {!hasAnyResults ? (
                  <p className="text-xs text-gray-500 text-center py-4">
                    Aucun résultat trouvé pour "{searchTerm}"
                  </p>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Produits ({filteredProducts.length})
                        </div>
                        {filteredProducts.map((p) => (
                          <div
                            key={p.id}
                            onClick={() => {
                              onSelectTab('products');
                              setShowSearchResults(false);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <img
                                src={p.imageUrl}
                                alt={p.name}
                                className="w-8 h-8 rounded-lg object-cover"
                              />
                              <div>
                                <p className="text-xs font-semibold text-gray-900">{p.name}</p>
                                <p className="text-[10px] text-gray-500 font-mono">{p.ref}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-blue-600">
                                {p.sellingPrice.toFixed(2)} {companySettings.currency}
                              </p>
                              <span
                                className={`text-[10px] ${
                                  p.currentStock <= p.minStockAlert
                                    ? 'text-red-600 font-bold'
                                    : 'text-gray-500'
                                }`}
                              >
                                Stock: {p.currentStock}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredCustomers.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Clients ({filteredCustomers.length})
                        </div>
                        {filteredCustomers.map((c) => (
                          <div
                            key={c.id}
                            onClick={() => {
                              onSelectTab('customers');
                              setShowSearchResults(false);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="text-xs font-semibold text-gray-900">{c.name}</p>
                              <p className="text-[10px] text-gray-500">{c.phone}</p>
                            </div>
                            <span className="text-[11px] text-gray-600">
                              Achats: {c.totalSpent.toFixed(2)} {companySettings.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {filteredSales.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                          Factures Ventes ({filteredSales.length})
                        </div>
                        {filteredSales.map((s) => (
                          <div
                            key={s.id}
                            onClick={() => {
                              onSelectTab('sales');
                              setShowSearchResults(false);
                            }}
                            className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div>
                              <p className="text-xs font-semibold text-gray-900 font-mono">{s.id}</p>
                              <p className="text-[10px] text-gray-500">
                                {s.customerName || 'Client standard'} • {s.sellerName}
                              </p>
                            </div>
                            <span className="text-xs font-bold text-emerald-600">
                              {s.grandTotal.toFixed(2)} {companySettings.currency}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 md:space-x-3">
          {/* Enterprise Account Switcher Pill */}
          <div className="relative">
            <button
              onClick={() => setShowEnterpriseMenu(!showEnterpriseMenu)}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border border-blue-200 bg-blue-50/70 hover:bg-blue-100 text-blue-900 text-xs font-semibold transition-all cursor-pointer shadow-2xs"
              title="Changer d'entreprise active ou créer un nouveau compte"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[100px] md:max-w-[140px]">
                {currentEnterprise?.name || companySettings.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-500 shrink-0" />
            </button>

            {/* Enterprise Dropdown Menu */}
            {showEnterpriseMenu && (
              <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-3 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100 text-xs">
                  <span className="font-bold text-gray-500 uppercase tracking-wider text-[10px]">
                    Entreprises &amp; Comptes ({enterprises.length})
                  </span>
                  <button
                    onClick={() => {
                      setShowEnterpriseMenu(false);
                      setShowCreateEnterpriseModal(true);
                    }}
                    className="flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-800 font-bold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Nouveau compte</span>
                  </button>
                </div>

                <div className="space-y-1.5 max-h-60 overflow-y-auto">
                  {enterprises.map((ent) => {
                    const isActive = ent.id === currentEnterpriseId;
                    return (
                      <div
                        key={ent.id}
                        onClick={() => {
                          switchEnterprise(ent.id);
                          setShowEnterpriseMenu(false);
                        }}
                        className={`p-2.5 rounded-xl text-left transition-all cursor-pointer flex items-center justify-between ${
                          isActive
                            ? 'bg-blue-50 text-blue-900 font-bold border border-blue-200'
                            : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="min-w-0 pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs truncate">{ent.name}</span>
                            {isActive && (
                              <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0" />
                            )}
                          </div>
                          <div className="text-[10px] text-gray-400 font-normal truncate mt-0.5">
                            Modèle Sheets: <span className="font-mono text-gray-600">{ent.sheetTemplateType}</span> • {ent.settings.currency}
                          </div>
                        </div>
                        {isActive && (
                          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-3 pt-2.5 border-t border-gray-100">
                  <button
                    onClick={() => {
                      setShowEnterpriseMenu(false);
                      setShowCreateEnterpriseModal(true);
                    }}
                    className="w-full flex items-center justify-center space-x-1.5 py-2 px-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Créer une Nouvelle Entreprise</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Google Sheets Sync Pill */}
          <div className="hidden sm:flex items-center">
            <button
              onClick={handleQuickSync}
              disabled={isSyncing}
              title={
                activeConnection
                  ? `Connecté à ${activeConnection.spreadsheetName} (Dernière synchro: ${activeConnection.lastSyncAt || 'N/A'})`
                  : 'Configurer Google Sheets'
              }
              className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl border text-xs font-medium transition-all ${
                activeConnection?.status === 'connected'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span className="hidden md:inline">Sheets:</span>
              <span className="font-semibold truncate max-w-[100px]">
                {activeConnection?.spreadsheetName ? 'Synchronisé' : 'Non lié'}
              </span>
              <RefreshCw
                className={`w-3 h-3 ml-0.5 text-emerald-600 ${isSyncing ? 'animate-spin' : ''}`}
              />
            </button>
          </div>

          {/* Notifications Center Bell */}
          <div className="relative">
            <button
              onClick={() => setShowNotificationMenu(!showNotificationMenu)}
              className="relative p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
              aria-label="Alertes & Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center animate-pulse shadow-xs">
                  {unreadNotificationsCount > 9 ? '9+' : unreadNotificationsCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown Panel */}
            {showNotificationMenu && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 p-4 max-h-[500px] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Header with actions */}
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-gray-900">Centre de Notifications</span>
                    {unreadNotificationsCount > 0 && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-100 text-red-700">
                        {unreadNotificationsCount} non lue(s)
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-1.5 text-[11px]">
                    {unreadNotificationsCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-blue-600 hover:text-blue-800 font-semibold cursor-pointer"
                      >
                        Tout lire
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-gray-400 hover:text-red-600 ml-1 cursor-pointer"
                        title="Vider les notifications"
                      >
                        Effacer
                      </button>
                    )}
                  </div>
                </div>

                {/* Filter Tabs */}
                <div className="flex items-center gap-1.5 pt-2 pb-2 border-b border-gray-100 text-[11px] overflow-x-auto">
                  <button
                    onClick={() => setNotifFilter('all')}
                    className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                      notifFilter === 'all'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Toutes ({notifications.length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('stock_alert')}
                    className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                      notifFilter === 'stock_alert'
                        ? 'bg-amber-500 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Stocks ({notifications.filter((n) => n.type === 'stock_alert').length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('web_order')}
                    className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                      notifFilter === 'web_order'
                        ? 'bg-purple-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Web ({notifications.filter((n) => n.type === 'web_order').length})
                  </button>
                  <button
                    onClick={() => setNotifFilter('sheets_sync')}
                    className={`px-2.5 py-1 rounded-lg font-medium shrink-0 transition-colors ${
                      notifFilter === 'sheets_sync'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    Sheets ({notifications.filter((n) => n.type === 'sheets_sync').length})
                  </button>
                </div>

                {/* Notifications List */}
                <div className="flex-1 overflow-y-auto divide-y divide-gray-100 my-2 pr-1 space-y-1">
                  {filteredNotifications.length === 0 ? (
                    <div className="text-center py-8 text-gray-400 text-xs">
                      <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
                      <p className="font-semibold text-gray-600">Aucune notification dans cette vue</p>
                      <p className="text-[11px] text-gray-400 mt-0.5">
                        Toutes les alertes système s'afficheront ici en direct.
                      </p>
                    </div>
                  ) : (
                    filteredNotifications.map((n) => {
                      const isUnread = !n.isRead;
                      const isError = n.severity === 'error';
                      const isWarning = n.severity === 'warning';
                      const isSuccess = n.severity === 'success';

                      let itemIcon = AlertTriangle;
                      let iconColor = 'text-amber-600 bg-amber-50';
                      if (n.type === 'stock_alert') {
                        itemIcon = AlertTriangle;
                        iconColor = isError ? 'text-red-600 bg-red-50' : 'text-amber-600 bg-amber-50';
                      } else if (n.type === 'sheets_sync') {
                        itemIcon = FileSpreadsheet;
                        iconColor = isError ? 'text-red-600 bg-red-50' : 'text-emerald-600 bg-emerald-50';
                      } else if (n.type === 'web_order') {
                        itemIcon = Store;
                        iconColor = 'text-purple-600 bg-purple-50';
                      }

                      const IconComponent = itemIcon;

                      return (
                        <div
                          key={n.id}
                          className={`p-2.5 rounded-xl transition-all relative group flex items-start gap-2.5 cursor-pointer ${
                            isUnread
                              ? 'bg-blue-50/50 hover:bg-blue-50 border border-blue-100'
                              : 'hover:bg-gray-50 border border-transparent'
                          }`}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.actionTab) {
                              onSelectTab(n.actionTab);
                              setShowNotificationMenu(false);
                            }
                          }}
                        >
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${iconColor}`}
                          >
                            <IconComponent className="w-4 h-4" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <p
                                className={`text-xs truncate ${
                                  isUnread ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'
                                }`}
                              >
                                {n.title}
                              </p>
                              <span className="text-[10px] text-gray-400 font-medium shrink-0 ml-1">
                                {new Date(n.timestamp).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-[11px] text-gray-600 line-clamp-2 mt-0.5 leading-relaxed">
                              {n.message}
                            </p>
                            {n.actionTab && (
                              <span className="inline-block text-[10px] font-bold text-blue-600 mt-1 hover:underline">
                                Voir le détail →
                              </span>
                            )}
                          </div>

                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(n.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-md transition-opacity"
                            title="Supprimer cette alerte"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      );
                    })
                  )}
                </div>

                {/* Quick Simulation Testing bar (§15 Requirement) */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-500 bg-gray-50 -mx-4 -mb-4 p-2.5 rounded-b-2xl">
                  <span className="font-semibold text-gray-600">Simuler une alerte :</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        addNotification({
                          type: 'stock_alert',
                          severity: 'warning',
                          title: 'Alerte Stock Faible Détecté',
                          message: 'Le produit Casque Audio (HT-WLS-001) a franchi le seuil d\'alerte (4 unités).',
                          actionTab: 'stock',
                        });
                      }}
                      className="px-2 py-0.5 bg-amber-100 text-amber-800 rounded-md font-bold hover:bg-amber-200 transition-colors"
                    >
                      Stock
                    </button>
                    <button
                      onClick={() => {
                        addNotification({
                          type: 'web_order',
                          severity: 'info',
                          title: 'Nouvelle Commande Web Reçue',
                          message: 'Marc V. a validé une commande en ligne pour un montant de 249.00 €.',
                          actionTab: 'web_orders',
                        });
                      }}
                      className="px-2 py-0.5 bg-purple-100 text-purple-800 rounded-md font-bold hover:bg-purple-200 transition-colors"
                    >
                      Web
                    </button>
                    <button
                      onClick={() => {
                        if (activeConnection) {
                          simulateSyncFailure(activeConnection.id);
                        } else {
                          addNotification({
                            type: 'sheets_sync',
                            severity: 'error',
                            title: 'Échec Synchronisation Google Sheets',
                            message: 'Erreur 403: Jeton OAuth révoqué ou feuille Google Sheets inaccessible. Reconnexion requise.',
                            actionTab: 'sheets',
                          });
                        }
                      }}
                      className="px-2 py-0.5 bg-red-100 text-red-800 rounded-md font-bold hover:bg-red-200 transition-colors"
                    >
                      Échec Sheets
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* New Sale Button (POS shortcut) */}
          {hasPermission('recordSale') && (
            <button
              onClick={onOpenPos}
              className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-sm shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Vente Caisse</span>
            </button>
          )}

          {/* Public Storefront button */}
          <button
            onClick={onOpenPublicCatalog}
            title="Ouvrir la vitrine publique du catalogue"
            className="p-2 text-gray-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl border border-gray-200 transition-colors flex items-center gap-1.5 text-xs font-medium"
          >
            <Store className="w-4 h-4 text-emerald-600" />
            <span className="hidden xl:inline">Vitrine</span>
          </button>
        </div>
      </div>

      {/* Create Enterprise Modal */}
      <CreateEnterpriseModal
        isOpen={showCreateEnterpriseModal}
        onClose={() => setShowCreateEnterpriseModal(false)}
        onEnterpriseCreated={() => onSelectTab('sheets')}
      />
    </header>
  );
};

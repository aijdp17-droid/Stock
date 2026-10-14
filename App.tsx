import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { InvoiceModal } from './components/InvoiceModal';
import { NotificationToasts } from './components/NotificationToasts';
import { DashboardView } from './views/DashboardView';
import { PointOfSaleView } from './views/PointOfSaleView';
import { SalesHistoryView } from './views/SalesHistoryView';
import { ProductsView } from './views/ProductsView';
import { CategoriesView } from './views/CategoriesView';
import { StockManagementView } from './views/StockManagementView';
import { CustomersView } from './views/CustomersView';
import { SuppliersAndPurchasesView } from './views/SuppliersAndPurchasesView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { UsersManagementView } from './views/UsersManagementView';
import { GoogleSheetsView } from './views/GoogleSheetsView';
import { WebOrdersView } from './views/WebOrdersView';
import { SettingsView } from './views/SettingsView';
import { PublicCatalogView } from './views/PublicCatalogView';
import { Sale } from './types';

const MainLayout: React.FC = () => {
  const { hasPermission, currentUser } = useApp();

  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState<Sale | null>(null);
  const [isPublicStoreOpen, setIsPublicStoreOpen] = useState(false);

  // If public storefront is toggled, render public catalog view
  if (isPublicStoreOpen) {
    return <PublicCatalogView onBackToApp={() => setIsPublicStoreOpen(false)} />;
  }

  // Render current tab component with permission check
  const renderTabContent = () => {
    switch (currentTab) {
      case 'dashboard':
        return (
          <DashboardView
            onSelectTab={setCurrentTab}
            onOpenPos={() => setCurrentTab('pos')}
            onViewInvoice={(sale) => setActiveInvoice(sale)}
          />
        );

      case 'pos':
        if (!hasPermission('recordSale')) {
          return (
            <div className="p-8 text-center bg-white rounded-2xl border border-gray-200">
              <p className="text-sm text-gray-500">
                Vous n'avez pas l'autorisation d'accéder au module de caisse.
              </p>
            </div>
          );
        }
        return (
          <PointOfSaleView
            onSaleCompleted={(sale) => {
              setActiveInvoice(sale);
              setCurrentTab('sales');
            }}
          />
        );

      case 'sales':
        return <SalesHistoryView onViewInvoice={(sale) => setActiveInvoice(sale)} />;

      case 'products':
        return (
          <ProductsView
            onOpenStockMovementForProduct={() => setCurrentTab('stock')}
          />
        );

      case 'categories':
        return <CategoriesView />;

      case 'stock':
        return <StockManagementView />;

      case 'web_orders':
        return (
          <WebOrdersView
            onOrderConverted={() => setCurrentTab('sales')}
          />
        );

      case 'customers':
        return <CustomersView onViewInvoice={(sale) => setActiveInvoice(sale)} />;

      case 'suppliers_purchases':
        return <SuppliersAndPurchasesView />;

      case 'expenses':
        return <ExpensesView />;

      case 'reports':
        return <ReportsView />;

      case 'users':
        return <UsersManagementView />;

      case 'sheets':
        return <GoogleSheetsView />;

      case 'settings':
        return <SettingsView />;

      default:
        return (
          <DashboardView
            onSelectTab={setCurrentTab}
            onOpenPos={() => setCurrentTab('pos')}
            onViewInvoice={(sale) => setActiveInvoice(sale)}
          />
        );
    }
  };

  return (
    <div className="flex h-screen bg-slate-100 text-gray-900 overflow-hidden font-sans">
      {/* Sidebar Navigation */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isMobileOpen={isMobileNavOpen}
        setIsMobileOpen={setIsMobileNavOpen}
        onOpenPublicCatalog={() => setIsPublicStoreOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header
          currentTab={currentTab}
          onSelectTab={setCurrentTab}
          onToggleSidebar={() => setIsMobileNavOpen(!isMobileNavOpen)}
          onOpenPos={() => setCurrentTab('pos')}
          onOpenPublicCatalog={() => setIsPublicStoreOpen(true)}
        />

        {/* Scrollable View Container */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
          {renderTabContent()}
        </main>
      </div>

      {/* Invoice / Printable Modal */}
      {activeInvoice && (
        <InvoiceModal
          sale={activeInvoice}
          onClose={() => setActiveInvoice(null)}
        />
      )}

      {/* Real-time Floating Notification Toasts */}
      <NotificationToasts onNavigateTab={setCurrentTab} />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

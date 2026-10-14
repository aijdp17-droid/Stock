import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Receipt,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Layers,
  FileSpreadsheet,
  PlusCircle,
  Eye,
  CheckCircle2,
  Users,
  Store,
  Info,
} from 'lucide-react';
import { Sale } from '../types';

interface DashboardViewProps {
  onSelectTab: (tab: string) => void;
  onOpenPos: () => void;
  onViewInvoice: (sale: Sale) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onSelectTab,
  onOpenPos,
  onViewInvoice,
}) => {
  const {
    products,
    sales,
    stockMovements,
    purchases,
    expenses,
    customers,
    companySettings,
    hasPermission,
    publicOrders,
    sheetConnections,
  } = useApp();

  const [period, setPeriod] = useState<'today' | 'week' | 'month' | 'all'>('month');

  // Filter sales according to period
  const now = new Date();
  const filteredSales = sales.filter((s) => {
    if (s.status === 'canceled') return false;
    const saleDate = new Date(s.date);
    if (period === 'today') {
      return (
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === 'week') {
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (period === 'month') {
      return saleDate.getMonth() === now.getMonth() && saleDate.getFullYear() === now.getFullYear();
    }
    return true;
  });

  // Today specific calculations
  const todaySales = sales.filter((s) => {
    if (s.status === 'canceled') return false;
    const saleDate = new Date(s.date);
    return (
      saleDate.getDate() === now.getDate() &&
      saleDate.getMonth() === now.getMonth() &&
      saleDate.getFullYear() === now.getFullYear()
    );
  });
  const todayRevenue = todaySales.reduce((acc, s) => acc + s.grandTotal, 0);

  // Financial metrics for selected period
  const totalRevenue = filteredSales.reduce((acc, s) => acc + s.grandTotal, 0);

  // Calculate Cost of Goods Sold (COGS) to find Gross Margin
  let totalCostOfGoodsSold = 0;
  filteredSales.forEach((s) => {
    s.items.forEach((it) => {
      totalCostOfGoodsSold += (it.purchasePrice || 0) * it.quantity;
    });
  });

  const grossMargin = totalRevenue - totalCostOfGoodsSold;
  const grossMarginPercent = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  // Filter expenses for selected period
  const filteredExpenses = expenses.filter((e) => {
    const expDate = new Date(e.date);
    if (period === 'today') {
      return (
        expDate.getDate() === now.getDate() &&
        expDate.getMonth() === now.getMonth() &&
        expDate.getFullYear() === now.getFullYear()
      );
    }
    if (period === 'week') {
      const diffTime = Math.abs(now.getTime() - expDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }
    if (period === 'month') {
      return expDate.getMonth() === now.getMonth() && expDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
  const totalExpensesAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  // Estimated Net Profit = Gross Margin - Recorded Operating Expenses
  const estimatedNetProfit = grossMargin - totalExpensesAmount;

  // Stock counts
  const totalProducts = products.length;
  const availableProducts = products.filter((p) => p.currentStock > 0 && p.status === 'active').length;
  const lowStockProducts = products.filter(
    (p) => p.currentStock > 0 && p.currentStock <= p.minStockAlert && p.status !== 'inactive'
  );
  const outOfStockProducts = products.filter(
    (p) => p.currentStock <= 0 || p.status === 'unavailable'
  );
  const totalStockAlerts = lowStockProducts.length + outOfStockProducts.length;

  // Top selling products count
  const productSalesMap: Record<string, { product: (typeof products)[0]; totalQty: number; revenue: number }> = {};
  sales.forEach((s) => {
    if (s.status === 'canceled') return;
    s.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      if (prod) {
        if (!productSalesMap[it.productId]) {
          productSalesMap[it.productId] = { product: prod, totalQty: 0, revenue: 0 };
        }
        productSalesMap[it.productId].totalQty += it.quantity;
        productSalesMap[it.productId].revenue += it.total;
      }
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.totalQty - a.totalQty)
    .slice(0, 5);

  const pendingWebOrders = publicOrders.filter((o) => o.status === 'pending');
  const canViewFinancials = hasPermission('viewFinancials');

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome & Period Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Tableau de Bord Intelligent
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Vue synthétique des activités commerciales, de la caisse et des niveaux de stock
          </p>
        </div>

        {/* Period Selector */}
        <div className="flex items-center space-x-1.5 bg-gray-100 p-1 rounded-xl self-start md:self-auto text-xs font-semibold">
          <button
            onClick={() => setPeriod('today')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'today'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Aujourd'hui
          </button>
          <button
            onClick={() => setPeriod('week')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'week'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            7 Jours
          </button>
          <button
            onClick={() => setPeriod('month')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'month'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Ce Mois
          </button>
          <button
            onClick={() => setPeriod('all')}
            className={`px-3 py-1.5 rounded-lg transition-all ${
              period === 'all'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Global
          </button>
        </div>
      </div>

      {/* Critical Stock Alert Banner if any */}
      {totalStockAlerts > 0 && (
        <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-900">
                Alerte Stock : {outOfStockProducts.length} rupture(s) et {lowStockProducts.length} stock(s) faible(s)
              </h4>
              <p className="text-xs text-amber-700">
                Certains articles nécessitent un réapprovisionnement d'urgence pour éviter les pertes de ventes.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('stock')}
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            Voir les Stocks
          </button>
        </div>
      )}

      {/* Sheets Sync Error Alert Banner if any */}
      {sheetConnections.some((c) => c.status === 'error') && (
        <div className="p-4 bg-gradient-to-r from-red-50 to-rose-50 border border-red-300 rounded-2xl flex items-center justify-between gap-4 animate-in fade-in">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-red-950">
                Alerte Système : Échec de Synchronisation Google Sheets
              </h4>
              <p className="text-xs text-red-800">
                Une interruption de connexion ou un problème de droits empêche la synchronisation des données.
              </p>
            </div>
          </div>
          <button
            onClick={() => onSelectTab('sheets')}
            className="px-3.5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-semibold shrink-0 shadow-xs transition-colors cursor-pointer"
          >
            Gérer la Connexion
          </button>
        </div>
      )}

      {/* Primary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Ventes Aujourd'hui */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Ventes Aujourd'hui
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">
              {todayRevenue.toFixed(2)} {companySettings.currency}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600">{todaySales.length} transaction(s)</span>
              <span>enregistrée(s) aujourd'hui</span>
            </p>
          </div>
        </div>

        {/* Chiffre d'Affaires Période */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-emerald-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Chiffre d'Affaires ({period === 'today' ? 'Jour' : period === 'week' ? '7 J' : period === 'month' ? 'Mois' : 'Total'})
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">
              {totalRevenue.toFixed(2)} {companySettings.currency}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-600">{filteredSales.length} ventes</span>
              <span>sur la période</span>
            </p>
          </div>
        </div>

        {/* Marge Brute Estimée (Conditional on financial permissions) */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-indigo-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Marge Brute Estimée
            </span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            {canViewFinancials ? (
              <>
                <h3 className="text-2xl font-bold text-gray-900">
                  {grossMargin.toFixed(2)} {companySettings.currency}
                </h3>
                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                  <span className="font-semibold text-indigo-600 font-mono">
                    {grossMarginPercent.toFixed(1)}% de marge
                  </span>
                  <span>(CA - Coût achat)</span>
                </p>
              </>
            ) : (
              <p className="text-xs text-gray-400 italic py-2">
                Accès restreint à votre profil
              </p>
            )}
          </div>
        </div>

        {/* Produits & Stocks */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-purple-200 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Catalogue &amp; Stocks
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <h3 className="text-2xl font-bold text-gray-900">
              {availableProducts} / {totalProducts}
            </h3>
            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-purple-600">{availableProducts} en rayon</span>
              <span className="text-red-600 font-semibold">• {totalStockAlerts} alerte(s)</span>
            </p>
          </div>
        </div>
      </div>

      {/* Financial Health & Transparency Breakdown Card (§4 Requirement) */}
      {canViewFinancials && (
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white p-6 rounded-3xl shadow-lg border border-slate-700">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-700">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-semibold">
                  Analyse de Rentabilité
                </span>
                <span className="text-xs text-slate-400">Période : {period.toUpperCase()}</span>
              </div>
              <h3 className="text-lg md:text-xl font-bold text-white mt-1">
                Distinction Financière &amp; Bénéfice Net Estimé
              </h3>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-800/80 px-3 py-2 rounded-xl border border-slate-700">
              <Info className="w-4 h-4 text-blue-400 shrink-0" />
              <span>Conforme §4 : Ne présente pas le bénéfice estimé comme définitif</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-5">
            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-slate-400">1. Chiffre d'Affaires</span>
              <p className="text-lg md:text-xl font-bold text-white mt-1 font-mono">
                {totalRevenue.toFixed(2)} {companySettings.currency}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Total ventes facturées</p>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-slate-400">2. Coût d'Achat Marchandises</span>
              <p className="text-lg md:text-xl font-bold text-amber-400 mt-1 font-mono">
                -{totalCostOfGoodsSold.toFixed(2)} {companySettings.currency}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Prix d'achat des articles vendus</p>
            </div>

            <div className="bg-slate-800/60 p-4 rounded-2xl border border-slate-700/80">
              <span className="text-xs text-slate-400">3. Dépenses Enregistrées</span>
              <p className="text-lg md:text-xl font-bold text-red-400 mt-1 font-mono">
                -{totalExpensesAmount.toFixed(2)} {companySettings.currency}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">Loyer, salaires, logistique</p>
            </div>

            <div className="bg-blue-600/20 p-4 rounded-2xl border border-blue-500/30">
              <span className="text-xs text-blue-300 font-semibold">4. Résultat Net Estimé</span>
              <p className="text-lg md:text-xl font-bold text-emerald-400 mt-1 font-mono">
                {estimatedNetProfit >= 0 ? '+' : ''}
                {estimatedNetProfit.toFixed(2)} {companySettings.currency}
              </p>
              <p className="text-[11px] text-blue-200 mt-1">Sous réserve de charges non saisies</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Action Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {hasPermission('recordSale') && (
          <button
            onClick={onOpenPos}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-emerald-50 border border-gray-200 hover:border-emerald-300 rounded-2xl shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <ShoppingCart className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Nouvelle Vente</span>
            <span className="text-[10px] text-gray-500">Caisse tactile</span>
          </button>
        )}

        {hasPermission('addProduct') && (
          <button
            onClick={() => onSelectTab('products')}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-300 rounded-2xl shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Ajouter Produit</span>
            <span className="text-[10px] text-gray-500">Photo &amp; prix</span>
          </button>
        )}

        {hasPermission('manageStock') && (
          <button
            onClick={() => onSelectTab('stock')}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-amber-50 border border-gray-200 hover:border-amber-300 rounded-2xl shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Mvt. de Stock</span>
            <span className="text-[10px] text-gray-500">Entrée / Sortie</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('web_orders')}
          className="flex flex-col items-center justify-center p-4 bg-white hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-2xl shadow-xs transition-all text-center group cursor-pointer relative"
        >
          {pendingWebOrders.length > 0 && (
            <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-red-500 text-white text-[10px] font-bold">
              {pendingWebOrders.length}
            </span>
          )}
          <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <Store className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-900">Commandes Web</span>
          <span className="text-[10px] text-gray-500">Vitrine en ligne</span>
        </button>

        {hasPermission('connectSheets') && (
          <button
            onClick={() => onSelectTab('sheets')}
            className="flex flex-col items-center justify-center p-4 bg-white hover:bg-teal-50 border border-gray-200 hover:border-teal-300 rounded-2xl shadow-xs transition-all text-center group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-gray-900">Google Sheets</span>
            <span className="text-[10px] text-gray-500">Synchro &amp; Modèles</span>
          </button>
        )}

        <button
          onClick={() => onSelectTab('reports')}
          className="flex flex-col items-center justify-center p-4 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-2xl shadow-xs transition-all text-center group cursor-pointer"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-gray-900">Rapports &amp; Marges</span>
          <span className="text-[10px] text-gray-500">Exports CSV / stats</span>
        </button>
      </div>

      {/* Two Column Layout: Top Products & Recent Sales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Products */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Produits les Plus Vendus</h3>
              <p className="text-xs text-gray-500">Classement selon les volumes écoulés</p>
            </div>
            <button
              onClick={() => onSelectTab('products')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Tous les produits →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {topProducts.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">Aucune vente enregistrée pour le moment.</p>
            ) : (
              topProducts.map(({ product, totalQty, revenue }, idx) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <span className="w-6 text-xs font-bold text-gray-400 font-mono text-center">
                      #{idx + 1}
                    </span>
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-10 h-10 rounded-lg object-cover shrink-0 border border-gray-200"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-gray-900 truncate">{product.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono">
                        {product.ref} • Stock restant: {product.currentStock}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-3">
                    <p className="text-xs font-bold text-gray-900">{totalQty} vendus</p>
                    <p className="text-[11px] font-mono text-emerald-600 font-semibold">
                      {revenue.toFixed(2)} {companySettings.currency}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Dernières Ventes Enregistrées */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">Dernières Ventes Récentes</h3>
              <p className="text-xs text-gray-500">Transactions et factures en temps réel</p>
            </div>
            <button
              onClick={() => onSelectTab('sales')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800"
            >
              Historique complet →
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {sales.slice(0, 5).map((sale) => (
              <div
                key={sale.id}
                className="flex items-center justify-between p-2.5 rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200 transition-all"
              >
                <div className="min-w-0">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold text-gray-900">{sale.id}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                        sale.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sale.status === 'partial'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {sale.status === 'completed'
                        ? 'Payée'
                        : sale.status === 'partial'
                        ? 'Partielle'
                        : 'Annulée'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {sale.customerName || 'Client standard'} • Vendu par {sale.sellerName}
                  </p>
                  <p className="text-[10px] text-gray-400">
                    {new Date(sale.date).toLocaleDateString()} {new Date(sale.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>

                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-gray-900 font-mono">
                      {sale.grandTotal.toFixed(2)} {companySettings.currency}
                    </p>
                    <p className="text-[10px] text-gray-500 uppercase">{sale.paymentMethod}</p>
                  </div>
                  <button
                    onClick={() => onViewInvoice(sale)}
                    className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    title="Voir / Imprimer la facture"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

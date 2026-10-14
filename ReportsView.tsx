import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  BarChart3,
  Download,
  DollarSign,
  TrendingUp,
  Package,
  Users,
  Wallet,
  Calendar,
  Layers,
  FileSpreadsheet,
  CheckCircle,
  HelpCircle,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, products, expenses, purchases, customers, suppliers, companySettings } = useApp();

  const [period, setPeriod] = useState<'month' | 'year' | 'all'>('month');

  // Completed sales
  const validSales = sales.filter((s) => s.status !== 'canceled');

  // Total Revenue
  const totalRevenue = validSales.reduce((acc, s) => acc + s.grandTotal, 0);

  // Cost of Goods Sold (COGS)
  let totalCostOfGoodsSold = 0;
  validSales.forEach((s) => {
    s.items.forEach((it) => {
      totalCostOfGoodsSold += (it.purchasePrice || 0) * it.quantity;
    });
  });

  const grossMargin = totalRevenue - totalCostOfGoodsSold;
  const grossMarginRate = totalRevenue > 0 ? (grossMargin / totalRevenue) * 100 : 0;

  // Total Expenses
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  // Net Profit Estimated
  const netProfitEstimated = grossMargin - totalExpenses;

  // Inventory Valuation
  const stockPurchaseValue = products.reduce((acc, p) => acc + p.currentStock * p.purchasePrice, 0);
  const stockRetailValue = products.reduce((acc, p) => acc + p.currentStock * p.sellingPrice, 0);
  const potentialStockMargin = stockRetailValue - stockPurchaseValue;

  // Receivables & Payables
  const totalCustomerReceivables = customers.reduce((acc, c) => acc + c.balanceDue, 0);
  const totalSupplierPayables = purchases
    .filter((p) => p.paymentStatus !== 'paid')
    .reduce((acc, p) => acc + (p.totalAmount - p.amountPaid), 0);

  // Performance by Seller
  const sellerStats: Record<string, { name: string; salesCount: number; totalAmount: number }> = {};
  validSales.forEach((s) => {
    if (!sellerStats[s.sellerId]) {
      sellerStats[s.sellerId] = { name: s.sellerName, salesCount: 0, totalAmount: 0 };
    }
    sellerStats[s.sellerId].salesCount += 1;
    sellerStats[s.sellerId].totalAmount += s.grandTotal;
  });

  // Performance by Category
  const categorySalesMap: Record<string, number> = {};
  validSales.forEach((s) => {
    s.items.forEach((it) => {
      const prod = products.find((p) => p.id === it.productId);
      const catKey = prod?.categoryId || 'Autre';
      categorySalesMap[catKey] = (categorySalesMap[catKey] || 0) + it.total;
    });
  });

  // Export functions to CSV
  const exportToCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportSalesCsv = () => {
    const headers = [
      'N_Facture',
      'Date',
      'Client',
      'Vendeur',
      'Total_TTC',
      'Montant_Paye',
      'Reste_Du',
      'Moyen_Paiement',
      'Statut',
    ];
    const rows = validSales.map((s) => [
      s.id,
      s.date,
      `"${s.customerName || 'Client standard'}"`,
      `"${s.sellerName}"`,
      s.grandTotal.toFixed(2),
      s.amountPaid.toFixed(2),
      s.balanceDue.toFixed(2),
      s.paymentMethod,
      s.status,
    ]);
    exportToCsv('Export_Ventes_OmniGestion', headers, rows);
  };

  const exportStockCsv = () => {
    const headers = [
      'Reference_SKU',
      'Designation',
      'Stock_Actuel',
      'Seuil_Min',
      'Prix_Achat_Unitaire',
      'Prix_Vente_Unitaire',
      'Valeur_Achat_Stock',
      'Valeur_Vente_Stock',
      'Statut',
    ];
    const rows = products.map((p) => [
      p.ref,
      `"${p.name}"`,
      p.currentStock,
      p.minStockAlert,
      p.purchasePrice.toFixed(2),
      p.sellingPrice.toFixed(2),
      (p.currentStock * p.purchasePrice).toFixed(2),
      (p.currentStock * p.sellingPrice).toFixed(2),
      p.status,
    ]);
    exportToCsv('Export_Stocks_OmniGestion', headers, rows);
  };

  const exportExpensesCsv = () => {
    const headers = ['ID', 'Date', 'Categorie', 'Montant', 'Description', 'Reglement', 'Auteur'];
    const rows = expenses.map((e) => [
      e.id,
      e.date,
      e.category,
      e.amount.toFixed(2),
      `"${e.description}"`,
      e.paymentMethod,
      `"${e.recordedBy}"`,
    ]);
    exportToCsv('Export_Depenses_OmniGestion', headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Rapports &amp; Statistiques Financières
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Analyse des marges, valorisation des inventaires, créances et exports de données (§13)
          </p>
        </div>

        {/* CSV Export Dropdown / Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={exportSalesCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Ventes CSV</span>
          </button>
          <button
            onClick={exportStockCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-blue-600" />
            <span>Export Stocks CSV</span>
          </button>
          <button
            onClick={exportExpensesCsv}
            className="flex items-center space-x-1.5 px-3 py-2 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-purple-600" />
            <span>Export Dépenses CSV</span>
          </button>
        </div>
      </div>

      {/* Financial Health Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chiffre d'Affaires */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            1. Chiffre d'Affaires
          </span>
          <p className="text-2xl font-bold font-mono text-gray-900 mt-2">
            {totalRevenue.toFixed(2)} {companySettings.currency}
          </p>
          <p className="text-xs text-gray-500 mt-1">{validSales.length} ventes acquittées</p>
        </div>

        {/* Marge Brute */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            2. Marge Brute Globale
          </span>
          <p className="text-2xl font-bold font-mono text-indigo-600 mt-2">
            {grossMargin.toFixed(2)} {companySettings.currency}
          </p>
          <p className="text-xs text-indigo-700 font-semibold mt-1">
            Taux de marge : {grossMarginRate.toFixed(1)}%
          </p>
        </div>

        {/* Total Charges d'Exploitation */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
            3. Dépenses d'Exploitation
          </span>
          <p className="text-2xl font-bold font-mono text-red-600 mt-2">
            -{totalExpenses.toFixed(2)} {companySettings.currency}
          </p>
          <p className="text-xs text-gray-500 mt-1">{expenses.length} dépenses saisies</p>
        </div>

        {/* Résultat Net Estimé */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-xs bg-emerald-50/20">
          <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
            4. Bénéfice Net Estimé
          </span>
          <p
            className={`text-2xl font-bold font-mono mt-2 ${
              netProfitEstimated >= 0 ? 'text-emerald-600' : 'text-red-600'
            }`}
          >
            {netProfitEstimated >= 0 ? '+' : ''}
            {netProfitEstimated.toFixed(2)} {companySettings.currency}
          </p>
          <p className="text-[11px] text-gray-500 mt-1">Marge brute - Dépenses</p>
        </div>
      </div>

      {/* Stock Valuation & Working Capital */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Valorisation du Stock */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Valorisation Globale du Stock en Entrepôt
              </h3>
              <p className="text-xs text-gray-500">
                Capital immobilisé et valeur marchande potentielle
              </p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-[11px] text-gray-500 font-medium">Valeur d'Achat du Stock</span>
              <p className="text-lg font-bold font-mono text-gray-900 mt-1">
                {stockPurchaseValue.toFixed(2)} {companySettings.currency}
              </p>
              <span className="text-[10px] text-gray-400">Coût réel des articles présents</span>
            </div>

            <div className="p-3.5 rounded-xl bg-blue-50 border border-blue-100">
              <span className="text-[11px] text-blue-700 font-medium">Valeur Marchande (Revente)</span>
              <p className="text-lg font-bold font-mono text-blue-700 mt-1">
                {stockRetailValue.toFixed(2)} {companySettings.currency}
              </p>
              <span className="text-[10px] text-blue-500">Prix public TTC des articles</span>
            </div>
          </div>

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-900">Marge potentielle en stock :</span>
            <span className="font-mono font-bold text-indigo-700 text-sm">
              +{potentialStockMargin.toFixed(2)} {companySettings.currency}
            </span>
          </div>
        </div>

        {/* Trésorerie : Créances vs Dettes */}
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Créances Clients &amp; Dettes Fournisseurs
              </h3>
              <p className="text-xs text-gray-500">Engagements financiers et montants à recouvrer</p>
            </div>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-100">
              <span className="text-[11px] text-amber-800 font-medium">
                Créances Clients (À encaisser)
              </span>
              <p className="text-lg font-bold font-mono text-amber-900 mt-1">
                {totalCustomerReceivables.toFixed(2)} {companySettings.currency}
              </p>
              <span className="text-[10px] text-amber-600">Restes à payer sur factures</span>
            </div>

            <div className="p-3.5 rounded-xl bg-purple-50 border border-purple-100">
              <span className="text-[11px] text-purple-800 font-medium">
                Dettes Fournisseurs (À régler)
              </span>
              <p className="text-lg font-bold font-mono text-purple-900 mt-1">
                {totalSupplierPayables.toFixed(2)} {companySettings.currency}
              </p>
              <span className="text-[10px] text-purple-600">Soldes sur commandes d'achat</span>
            </div>
          </div>

          <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between text-xs">
            <span className="font-semibold text-gray-700">Solde net débiteur/créditeur :</span>
            <span
              className={`font-mono font-bold text-sm ${
                totalCustomerReceivables - totalSupplierPayables >= 0
                  ? 'text-emerald-600'
                  : 'text-red-600'
              }`}
            >
              {(totalCustomerReceivables - totalSupplierPayables).toFixed(2)}{' '}
              {companySettings.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Performance by Seller Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-sm font-bold text-gray-900">Performance des Vendeurs</h3>
          <p className="text-xs text-gray-500">Chiffre d'affaires et volume généré par collaborateur</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Collaborateur / Vendeur</th>
                <th className="py-3 px-4 text-center">Nombre de Ventes</th>
                <th className="py-3 px-4 text-right">Chiffre d'Affaires Généré</th>
                <th className="py-3 px-4 text-right">Panier Moyen</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.values(sellerStats).map((seller, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 font-semibold text-gray-900">{seller.name}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold">{seller.salesCount}</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                    {seller.totalAmount.toFixed(2)} {companySettings.currency}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-gray-600">
                    {(seller.totalAmount / (seller.salesCount || 1)).toFixed(2)}{' '}
                    {companySettings.currency}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

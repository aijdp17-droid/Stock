import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ArrowUpDown,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  History,
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  CheckCircle,
  FileText,
  X,
  Package,
} from 'lucide-react';
import { StockMovementType, Product } from '../types';

export const StockManagementView: React.FC = () => {
  const {
    products,
    stockMovements,
    recordStockMovement,
    hasPermission,
    companySettings,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMovementType, setFilterMovementType] = useState<string>('all');

  // Stock Movement Modal
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [movementType, setMovementType] = useState<StockMovementType>('in_purchase');
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementReason, setMovementReason] = useState<string>('');
  const [referenceDoc, setReferenceDoc] = useState<string>('');

  const canManageStock = hasPermission('manageStock');

  const lowStockCount = products.filter(
    (p) => p.currentStock <= p.minStockAlert && p.status !== 'inactive'
  ).length;

  const outOfStockCount = products.filter(
    (p) => p.currentStock <= 0 && p.status !== 'inactive'
  ).length;

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ref.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredMovements = stockMovements.filter((m) => {
    const matchesSearch =
      m.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.productRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userName.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesType = filterMovementType === 'all' || m.type === filterMovementType;
    return matchesSearch && matchesType;
  });

  const openQuickMovement = (product: Product, type: StockMovementType) => {
    setSelectedProduct(product);
    setMovementType(type);
    setMovementQuantity(type === 'loss_damaged' ? 1 : 5);
    setMovementReason('');
    setReferenceDoc('');
    setShowMovementModal(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct || movementQuantity <= 0 || !movementReason.trim()) return;

    // Apply signed quantity based on type
    const isDeduction =
      movementType === 'out_sale' ||
      movementType === 'loss_damaged' ||
      movementType === 'transfer';

    const signedQuantity = isDeduction ? -Math.abs(movementQuantity) : Math.abs(movementQuantity);

    const success = recordStockMovement(
      selectedProduct.id,
      movementType,
      signedQuantity,
      movementReason.trim(),
      referenceDoc.trim() || undefined
    );

    if (!success) {
      alert('Impossible d\'effectuer ce mouvement : le stock deviendrait négatif.');
      return;
    }

    setShowMovementModal(false);
  };

  const movementLabels: Record<StockMovementType, { label: string; color: string }> = {
    in_purchase: { label: 'Entrée Marchandise', color: 'bg-emerald-100 text-emerald-800' },
    out_sale: { label: 'Sortie Vente', color: 'bg-blue-100 text-blue-800' },
    adjustment: { label: 'Ajustement Inventaire', color: 'bg-purple-100 text-purple-800' },
    loss_damaged: { label: 'Perte / Casse', color: 'bg-red-100 text-red-800' },
    transfer: { label: 'Transfert Interne', color: 'bg-amber-100 text-amber-800' },
    sale_canceled: { label: 'Rétablissement Vente', color: 'bg-teal-100 text-teal-800' },
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Gestion &amp; Traçabilité des Stocks
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Suivi des mouvements d'entrepôt, corrections justifiées et historique d'inventaire
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center bg-gray-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'inventory'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>État des Stocks</span>
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              activeTab === 'history'
                ? 'bg-white text-gray-900 shadow-xs'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Journal des Mouvements</span>
          </button>
        </div>
      </div>

      {/* Stock Alerts Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Articles Répertoriés</span>
            <p className="text-xl font-bold text-gray-900 mt-1">{products.length} références</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-amber-600 font-semibold">Articles Stock Faible</span>
            <p className="text-xl font-bold text-amber-600 mt-1">{lowStockCount} article(s)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-red-600 font-semibold">Ruptures Totales</span>
            <p className="text-xl font-bold text-red-600 mt-1">{outOfStockCount} article(s)</p>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder={
              activeTab === 'inventory'
                ? 'Filtrer les produits par nom ou référence SKU...'
                : 'Rechercher dans l\'historique par produit, auteur ou motif...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs md:text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>

        {activeTab === 'history' && (
          <select
            value={filterMovementType}
            onChange={(e) => setFilterMovementType(e.target.value)}
            className="text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
          >
            <option value="all">Tous les types de mouvement</option>
            <option value="in_purchase">Entrée Marchandise</option>
            <option value="out_sale">Sortie Vente</option>
            <option value="adjustment">Ajustement Inventaire</option>
            <option value="loss_damaged">Perte ou Casse</option>
            <option value="sale_canceled">Rétablissement Annulation</option>
          </select>
        )}
      </div>

      {/* Tab Content 1: Inventory Table */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4 font-mono">Réf. SKU</th>
                  <th className="py-3 px-4 text-center">Stock Actuel</th>
                  <th className="py-3 px-4 text-center">Seuil Alerte</th>
                  <th className="py-3 px-4 text-center">État Disponibilité</th>
                  {canManageStock && <th className="py-3 px-4 text-right">Actions de Stock</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const isOutOfStock = p.currentStock <= 0;
                  const isLow = p.currentStock > 0 && p.currentStock <= p.minStockAlert;

                  return (
                    <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-gray-200"
                          />
                          <span className="font-semibold text-gray-900 truncate max-w-[200px]">
                            {p.name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">{p.ref}</td>
                      <td className="py-3 px-4 text-center font-mono font-bold">
                        <span
                          className={`px-2.5 py-1 rounded-full text-xs ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-800 font-bold'
                              : isLow
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-mono text-gray-500">
                        {p.minStockAlert}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isOutOfStock
                              ? 'bg-red-100 text-red-700'
                              : isLow
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {isOutOfStock ? 'Rupture' : isLow ? 'Faible' : 'Conforme'}
                        </span>
                      </td>
                      {canManageStock && (
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            <button
                              onClick={() => openQuickMovement(p, 'in_purchase')}
                              className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Enregistrer une entrée de marchandise"
                            >
                              <Plus className="w-3 h-3" />
                              Entrée
                            </button>
                            <button
                              onClick={() => openQuickMovement(p, 'loss_damaged')}
                              className="px-2 py-1 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Déclarer perte ou casse"
                            >
                              <Minus className="w-3 h-3" />
                              Casse / Perte
                            </button>
                            <button
                              onClick={() => openQuickMovement(p, 'adjustment')}
                              className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="Ajustement inventaire avec motif"
                            >
                              <RefreshCw className="w-3 h-3" />
                              Ajuster
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 2: Complete Movements Audit Trail (§9) */}
      {activeTab === 'history' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">Date &amp; Heure</th>
                  <th className="py-3 px-4">Article &amp; Réf.</th>
                  <th className="py-3 px-4 text-center">Type de Mouvement</th>
                  <th className="py-3 px-4 text-center">Quantité</th>
                  <th className="py-3 px-4 text-center">Évolution Stock</th>
                  <th className="py-3 px-4">Motif Justificatif &amp; Réf Doc</th>
                  <th className="py-3 px-4">Responsable</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredMovements.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-gray-400">
                      Aucun mouvement de stock correspondant.
                    </td>
                  </tr>
                ) : (
                  filteredMovements.map((m) => {
                    const isPositive = m.quantity > 0;
                    const badge = movementLabels[m.type] || {
                      label: m.type,
                      color: 'bg-gray-100 text-gray-800',
                    };

                    return (
                      <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 text-gray-600">
                          <div>{new Date(m.date).toLocaleDateString()}</div>
                          <div className="text-[10px] text-gray-400">
                            {new Date(m.date).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-gray-900 block truncate max-w-[180px]">
                            {m.productName}
                          </span>
                          <span className="text-[10px] text-gray-500 font-mono">{m.productRef}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${badge.color}`}
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          <span
                            className={isPositive ? 'text-emerald-600' : 'text-red-600 font-bold'}
                          >
                            {isPositive ? `+${m.quantity}` : m.quantity}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-gray-600">
                          {m.previousStock} → <span className="font-bold text-gray-900">{m.newStock}</span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-gray-900 font-medium">{m.reason}</p>
                          {m.referenceDocId && (
                            <span className="text-[10px] text-blue-600 font-mono font-semibold">
                              Doc: {m.referenceDocId}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">{m.userName}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Movement Registration Modal */}
      {showMovementModal && selectedProduct && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Mouvement de Stock</h3>
                <p className="text-xs text-gray-500">{selectedProduct.name} ({selectedProduct.ref})</p>
              </div>
              <button
                onClick={() => setShowMovementModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMovement} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Type d'Opération *
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as StockMovementType)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="in_purchase">Entrée de Stock (Réapprovisionnement / Achat)</option>
                  <option value="out_sale">Sortie de Marchandise</option>
                  <option value="loss_damaged">Déclaration Perte ou Casse</option>
                  <option value="adjustment">Ajustement d'Inventaire</option>
                  <option value="transfer">Transfert Interne</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Quantité *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementQuantity}
                    onChange={(e) => setMovementQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono font-bold focus:outline-hidden focus:border-blue-500"
                  />
                </div>

                <div className="bg-gray-50 p-2 rounded-xl border border-gray-100 flex flex-col justify-center">
                  <span className="text-[10px] text-gray-500">Stock Actuel :</span>
                  <span className="text-xs font-bold font-mono text-gray-900">
                    {selectedProduct.currentStock} unités
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Motif Obligatoire de la Justification (§9) *
                </label>
                <textarea
                  required
                  rows={2}
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="ex: Réception BL-9928, casse lors de la mise en rayon, recomptage annuel..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Référence Documentaire Associée (Facultatif)
                </label>
                <input
                  type="text"
                  value={referenceDoc}
                  onChange={(e) => setReferenceDoc(e.target.value)}
                  placeholder="ex: BL-2026-042 ou ACH-2026-003"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Valider le Mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Package,
  Plus,
  Search,
  Filter,
  Grid,
  List,
  Edit,
  Trash2,
  AlertTriangle,
  CheckCircle,
  Eye,
  X,
  Layers,
  Image as ImageIcon,
} from 'lucide-react';
import { Product, ProductStatus } from '../types';

interface ProductsViewProps {
  onOpenStockMovementForProduct?: (productId: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({ onOpenStockMovementForProduct }) => {
  const {
    products,
    categories,
    suppliers,
    addProduct,
    updateProduct,
    deleteProduct,
    companySettings,
    hasPermission,
    currentUser,
  } = useApp();

  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [onlyAlerts, setOnlyAlerts] = useState<boolean>(false);

  // Modal State
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);

  // Form Fields
  const [formRef, setFormRef] = useState('');
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPurchasePrice, setFormPurchasePrice] = useState<number>(0);
  const [formSellingPrice, setFormSellingPrice] = useState<number>(0);
  const [formInitialStock, setFormInitialStock] = useState<number>(10);
  const [formMinStockAlert, setFormMinStockAlert] = useState<number>(5);
  const [formSupplierId, setFormSupplierId] = useState('');
  const [formStatus, setFormStatus] = useState<ProductStatus>('active');

  const canAddProduct = hasPermission('addProduct');
  const canEditPrices = hasPermission('editPrices');
  const canDeleteData = hasPermission('deleteData');
  const canViewCostPrice = hasPermission('viewFinancials') || currentUser.role === 'super_admin';

  // Sample photo presets for quick picking
  const photoPresets = [
    { label: 'Casque Audio', url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80' },
    { label: 'Hub USB-C', url: 'https://images.unsplash.com/photo-1544652478-6653e09f18a2?w=500&auto=format&fit=crop&q=80' },
    { label: 'Fauteuil Bureau', url: 'https://images.unsplash.com/photo-1580481077195-c3f99506d128?w=500&auto=format&fit=crop&q=80' },
    { label: 'Bureau Ergonomique', url: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?w=500&auto=format&fit=crop&q=80' },
    { label: 'Sacoche Cuir', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=80' },
    { label: 'Montre Acier', url: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop&q=80' },
    { label: 'Cafetière Expresso', url: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=500&auto=format&fit=crop&q=80' },
    { label: 'Batterie Externe', url: 'https://images.unsplash.com/photo-1609592424364-156c7e2b7677?w=500&auto=format&fit=crop&q=80' },
  ];

  // Filtering
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ref.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesAlert = !onlyAlerts || p.currentStock <= p.minStockAlert;
    return matchesSearch && matchesCat && matchesStatus && matchesAlert;
  });

  const openAddModal = () => {
    setEditingProductId(null);
    setFormRef(`REF-${Math.floor(100 + Math.random() * 900)}`);
    setFormName('');
    setFormCategory(categories[0]?.id || '');
    setFormDescription('');
    setFormImageUrl(photoPresets[0].url);
    setFormPurchasePrice(20);
    setFormSellingPrice(45);
    setFormInitialStock(10);
    setFormMinStockAlert(companySettings.alertStockMin);
    setFormSupplierId(suppliers[0]?.id || '');
    setFormStatus('active');
    setShowProductModal(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProductId(p.id);
    setFormRef(p.ref);
    setFormName(p.name);
    setFormCategory(p.categoryId);
    setFormDescription(p.description);
    setFormImageUrl(p.imageUrl);
    setFormPurchasePrice(p.purchasePrice);
    setFormSellingPrice(p.sellingPrice);
    setFormInitialStock(p.currentStock);
    setFormMinStockAlert(p.minStockAlert);
    setFormSupplierId(p.supplierId);
    setFormStatus(p.status);
    setShowProductModal(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRef.trim()) return;

    if (editingProductId) {
      updateProduct(editingProductId, {
        ref: formRef.trim(),
        name: formName.trim(),
        categoryId: formCategory,
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim(),
        purchasePrice: Number(formPurchasePrice),
        sellingPrice: Number(formSellingPrice),
        minStockAlert: Number(formMinStockAlert),
        supplierId: formSupplierId,
        status: formStatus,
      });
    } else {
      addProduct({
        ref: formRef.trim(),
        name: formName.trim(),
        categoryId: formCategory,
        description: formDescription.trim(),
        imageUrl: formImageUrl.trim() || photoPresets[0].url,
        purchasePrice: Number(formPurchasePrice),
        sellingPrice: Number(formSellingPrice),
        currentStock: Number(formInitialStock),
        minStockAlert: Number(formMinStockAlert),
        supplierId: formSupplierId,
        status: formStatus,
      });
    }

    setShowProductModal(false);
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Êtes-vous sûr de vouloir supprimer le produit "${name}" ?`)) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Catalogue des Produits</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Gestion des fiches articles, photos haute définition, tarifs et alertes de stock
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {canAddProduct && (
            <button
              onClick={openAddModal}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Produit</span>
            </button>
          )}

          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500'
              }`}
              title="Vue Grille"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-white shadow-xs text-blue-600' : 'text-gray-500'
              }`}
              title="Vue Tableau"
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par référence SKU, nom du produit..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs md:text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">Toutes les catégories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">Tous les statuts</option>
              <option value="active">Actif</option>
              <option value="unavailable">Indisponible / Rupture</option>
              <option value="inactive">Inactif</option>
            </select>

            <button
              onClick={() => setOnlyAlerts(!onlyAlerts)}
              className={`px-3 py-2 rounded-xl text-xs font-semibold border transition-all ${
                onlyAlerts
                  ? 'bg-amber-500 text-white border-amber-600 shadow-xs'
                  : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
              }`}
            >
              Alertes Stocks Uniquement
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.currentStock <= 0;
            const isLowStock = p.currentStock > 0 && p.currentStock <= p.minStockAlert;
            const cat = categories.find((c) => c.id === p.categoryId);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col group"
              >
                {/* Photo & Badge */}
                <div className="relative h-44 w-full bg-gray-100 overflow-hidden">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span
                    className={`absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full text-[10px] font-bold shadow-xs ${
                      isOutOfStock
                        ? 'bg-red-600 text-white'
                        : isLowStock
                        ? 'bg-amber-500 text-white'
                        : 'bg-emerald-600 text-white'
                    }`}
                  >
                    {isOutOfStock ? 'Rupture' : isLowStock ? 'Stock Faible' : 'En Stock'}
                  </span>
                  <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-mono">
                    {p.ref}
                  </span>
                </div>

                {/* Details */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div>
                    <span className="text-[10px] font-semibold text-blue-600 uppercase tracking-wider block mb-1">
                      {cat?.name || 'Général'}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2 mt-1">{p.description}</p>
                  </div>

                  {/* Stock & Prices */}
                  <div className="pt-2 border-t border-gray-100 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Quantité en stock :</span>
                      <span
                        className={`font-bold font-mono ${
                          isOutOfStock
                            ? 'text-red-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-gray-900'
                        }`}
                      >
                        {p.currentStock} unités
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Prix de vente :</span>
                      <span className="text-sm font-bold text-blue-600 font-mono">
                        {p.sellingPrice.toFixed(2)} {companySettings.currency}
                      </span>
                    </div>

                    {/* Cost price shown only to authorized managers */}
                    {canViewCostPrice && (
                      <div className="flex items-center justify-between text-[11px] text-gray-400">
                        <span>Coût d'achat (confid.) :</span>
                        <span className="font-mono">
                          {p.purchasePrice.toFixed(2)} {companySettings.currency}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center justify-end space-x-1 pt-2 border-t border-gray-100">
                    <button
                      onClick={() => openEditModal(p)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifier la fiche produit"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {canDeleteData && (
                      <button
                        onClick={() => handleDelete(p.id, p.name)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Supprimer le produit"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase font-semibold">
                <tr>
                  <th className="py-3 px-4">Article</th>
                  <th className="py-3 px-4">Réf. SKU</th>
                  <th className="py-3 px-4">Catégorie</th>
                  <th className="py-3 px-4 text-center">Stock Actuel</th>
                  <th className="py-3 px-4 text-right">Prix Vente</th>
                  {canViewCostPrice && <th className="py-3 px-4 text-right">Coût Achat</th>}
                  <th className="py-3 px-4 text-center">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredProducts.map((p) => {
                  const cat = categories.find((c) => c.id === p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-10 h-10 rounded-lg object-cover border border-gray-200"
                          />
                          <div className="min-w-0">
                            <span className="font-semibold text-gray-900 block truncate max-w-[200px]">
                              {p.name}
                            </span>
                            <span className="text-[10px] text-gray-400 truncate block max-w-[200px]">
                              {p.description}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-gray-700">{p.ref}</td>
                      <td className="py-3 px-4 text-gray-600">{cat?.name || 'Général'}</td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`font-mono font-bold px-2 py-0.5 rounded-full ${
                            p.currentStock <= 0
                              ? 'bg-red-100 text-red-700'
                              : p.currentStock <= p.minStockAlert
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.currentStock}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-blue-600">
                        {p.sellingPrice.toFixed(2)} {companySettings.currency}
                      </td>
                      {canViewCostPrice && (
                        <td className="py-3 px-4 text-right font-mono text-gray-500">
                          {p.purchasePrice.toFixed(2)} {companySettings.currency}
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            p.status === 'active'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'unavailable'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.status === 'active'
                            ? 'Actif'
                            : p.status === 'unavailable'
                            ? 'Indisponible'
                            : 'Inactif'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1">
                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          {canDeleteData && (
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg cursor-pointer"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Add / Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-gray-200 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingProductId ? 'Modifier la Fiche Produit' : 'Créer un Nouveau Produit'}
              </h3>
              <button
                onClick={() => setShowProductModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Référence SKU (Unique) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formRef}
                    onChange={(e) => setFormRef(e.target.value)}
                    placeholder="ex: HT-WLS-009"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono uppercase focus:border-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Désignation du Produit *
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="ex: Clavier Mécanique RGB Sans Fil"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Fournisseur Associé
                  </label>
                  <select
                    value={formSupplierId}
                    onChange={(e) => setFormSupplierId(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                  >
                    <option value="">Aucun fournisseur</option>
                    {suppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Description &amp; Caractéristiques
                </label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Spécifications techniques, garantie, dimensions..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>

              {/* Photo Input & Presets */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  URL de la Photo du Produit
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formImageUrl}
                    onChange={(e) => setFormImageUrl(e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                  />
                  {formImageUrl && (
                    <img
                      src={formImageUrl}
                      alt="Aperçu"
                      className="w-10 h-10 rounded-lg object-cover border border-gray-200 shrink-0"
                    />
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-[11px] text-gray-400 block mb-1">
                    Ou choisissez une photo d'exemple :
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {photoPresets.map((preset, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setFormImageUrl(preset.url)}
                        className="px-2 py-1 bg-gray-100 hover:bg-blue-100 text-gray-700 hover:text-blue-700 rounded-lg text-[10px] font-medium transition-colors"
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pricing & Stock Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-gray-100">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Prix de Vente ({companySettings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formSellingPrice || ''}
                    onChange={(e) => setFormSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-mono font-bold text-blue-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Coût d'Achat ({companySettings.currency}) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    disabled={!canEditPrices}
                    value={formPurchasePrice || ''}
                    onChange={(e) => setFormPurchasePrice(parseFloat(e.target.value) || 0)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-mono text-gray-700 focus:outline-hidden disabled:bg-gray-100"
                  />
                </div>

                {!editingProductId && (
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Stock Initial *
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={formInitialStock || ''}
                      onChange={(e) => setFormInitialStock(parseInt(e.target.value, 10) || 0)}
                      className="w-full text-xs p-2 rounded-xl border border-gray-200 font-mono focus:outline-hidden"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Alerte Seuil Min *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formMinStockAlert || ''}
                    onChange={(e) => setFormMinStockAlert(parseInt(e.target.value, 10) || 5)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 font-mono focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Statut du Produit
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as ProductStatus)}
                    className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:outline-hidden"
                  >
                    <option value="active">Actif</option>
                    <option value="unavailable">Indisponible</option>
                    <option value="inactive">Inactif / Archivé</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl font-medium"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingProductId ? 'Sauvegarder les modifications' : 'Enregistrer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

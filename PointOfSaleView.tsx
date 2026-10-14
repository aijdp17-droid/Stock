import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  UserPlus,
  CreditCard,
  Banknote,
  Smartphone,
  Building,
  CheckCircle,
  AlertCircle,
  X,
  FileText,
} from 'lucide-react';
import { Product, PaymentMethod, SaleItem, Sale } from '../types';

interface PointOfSaleViewProps {
  onSaleCompleted: (sale: Sale) => void;
}

export const PointOfSaleView: React.FC<PointOfSaleViewProps> = ({ onSaleCompleted }) => {
  const {
    products,
    categories,
    customers,
    addCustomer,
    createSale,
    companySettings,
    currentUser,
    hasPermission,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<SaleItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('carte');
  const [amountPaidInput, setAmountPaidInput] = useState<string>('');
  const [saleNotes, setSaleNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick New Customer Modal
  const [showNewCustomerModal, setShowNewCustomerModal] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerPhone, setNewCustomerPhone] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');

  const canApplyDiscounts = hasPermission('applyDiscounts');

  // Filter products for POS
  const filteredProducts = products.filter((p) => {
    if (p.status === 'inactive') return false;
    const matchesCategory = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ref.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingIndex = cart.findIndex((i) => i.productId === product.id);
    const currentQtyInCart = existingIndex > -1 ? cart[existingIndex].quantity : 0;

    // Check stock limit
    if (currentQtyInCart + 1 > product.currentStock && !companySettings.allowNegativeStock) {
      alert(`Stock insuffisant pour ${product.name} (Disponible: ${product.currentStock})`);
      return;
    }

    if (existingIndex > -1) {
      const updated = [...cart];
      const newQty = updated[existingIndex].quantity + 1;
      const unit = updated[existingIndex].unitPrice;
      const disc = updated[existingIndex].discountPercent;
      const total = newQty * unit * (1 - disc / 100);
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        total,
      };
      setCart(updated);
    } else {
      const newItem: SaleItem = {
        productId: product.id,
        productName: product.name,
        productRef: product.ref,
        unitPrice: product.sellingPrice,
        purchasePrice: product.purchasePrice,
        quantity: 1,
        discountPercent: 0,
        total: product.sellingPrice,
      };
      setCart([...cart, newItem]);
    }
  };

  const updateQuantity = (productId: string, delta: number) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > product.currentStock && !companySettings.allowNegativeStock) {
              alert(`Stock maximal disponible atteint (${product.currentStock} unités).`);
              return item;
            }
            return {
              ...item,
              quantity: newQty,
              total: newQty * item.unitPrice * (1 - item.discountPercent / 100),
            };
          }
          return item;
        })
        .filter(Boolean) as SaleItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((i) => i.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setAmountPaidInput('');
    setSaleNotes('');
  };

  // Calculations
  const rawSubtotal = cart.reduce((acc, it) => acc + it.quantity * it.unitPrice, 0);
  const discountTotal = (rawSubtotal * discountPercent) / 100;
  const subtotalAfterDiscount = rawSubtotal - discountTotal;
  const taxAmount = (subtotalAfterDiscount * companySettings.taxRate) / 100;
  const grandTotal = subtotalAfterDiscount + taxAmount;

  const defaultPaid = amountPaidInput === '' ? grandTotal : parseFloat(amountPaidInput) || 0;
  const changeToGive = Math.max(0, defaultPaid - grandTotal);
  const balanceDue = Math.max(0, grandTotal - defaultPaid);

  const handleCreateCustomerQuick = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newCustomerPhone.trim()) return;

    const created = addCustomer({
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      email: newCustomerEmail.trim(),
    });
    setSelectedCustomerId(created.id);
    setShowNewCustomerModal(false);
    setNewCustomerName('');
    setNewCustomerPhone('');
    setNewCustomerEmail('');
  };

  const handleProcessSale = () => {
    if (cart.length === 0 || isSubmitting) return;

    setIsSubmitting(true);

    try {
      const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);

      const created = createSale({
        customerId: selectedCustomer?.id,
        customerName: selectedCustomer?.name,
        customerPhone: selectedCustomer?.phone,
        items: cart,
        subtotal: subtotalAfterDiscount,
        discountTotal,
        taxAmount,
        grandTotal,
        amountPaid: Math.min(defaultPaid, grandTotal),
        balanceDue,
        paymentMethod,
        status: balanceDue > 0 ? 'partial' : 'completed',
        notes: saleNotes.trim() || undefined,
      });

      clearCart();
      onSaleCompleted(created);
    } catch (err) {
      console.error('Error during sale creation:', err);
      alert('Une erreur est survenue lors de la validation de la vente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-130px)] min-h-[600px]">
      {/* Left Column: Product Selection & Catalog */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
        {/* Header Search & Category Filter */}
        <div className="p-4 border-b border-gray-200 space-y-3 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Scanner code-barre ou rechercher par nom / SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white text-xs md:text-sm rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Category Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Tous les articles
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
          {filteredProducts.map((p) => {
            const isOutOfStock = p.currentStock <= 0;
            const inCartItem = cart.find((i) => i.productId === p.id);

            return (
              <button
                key={p.id}
                disabled={isOutOfStock}
                onClick={() => addToCart(p)}
                className={`relative flex flex-col p-3 rounded-2xl border text-left transition-all group ${
                  isOutOfStock
                    ? 'bg-gray-100/70 border-gray-200 opacity-60 cursor-not-allowed'
                    : inCartItem
                    ? 'bg-blue-50/40 border-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-md cursor-pointer'
                }`}
              >
                {/* Quantity in cart badge */}
                {inCartItem && (
                  <span className="absolute top-2 right-2 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center shadow-xs">
                    {inCartItem.quantity}
                  </span>
                )}

                <div className="w-full h-28 rounded-xl overflow-hidden mb-2 bg-gray-100">
                  <img
                    src={p.imageUrl}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                </div>

                <span className="text-[10px] font-mono text-gray-400 font-semibold">{p.ref}</span>
                <h4 className="text-xs font-bold text-gray-900 line-clamp-2 leading-tight flex-1">
                  {p.name}
                </h4>

                <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100">
                  <span className="text-xs md:text-sm font-bold text-blue-600 font-mono">
                    {p.sellingPrice.toFixed(2)} {companySettings.currency}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
                      isOutOfStock
                        ? 'bg-red-100 text-red-700'
                        : p.currentStock <= p.minStockAlert
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {isOutOfStock ? 'Épuisé' : `Stock: ${p.currentStock}`}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Interactive Cart & Checkout Desk */}
      <div className="w-full lg:w-96 flex flex-col bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        {/* Cart Header */}
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
            <h3 className="text-sm font-bold text-gray-900">Panier en cours</h3>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
              {cart.reduce((a, b) => a + b.quantity, 0)} art.
            </span>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Vider
            </button>
          )}
        </div>

        {/* Customer Selector */}
        <div className="p-3 border-b border-gray-100 bg-white">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Client associé
            </label>
            <button
              onClick={() => setShowNewCustomerModal(true)}
              className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              Nouveau client
            </button>
          </div>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="w-full text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          >
            <option value="">Client Comptoir / Anonyme</option>
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone})
              </option>
            ))}
          </select>
        </div>

        {/* Cart Items List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2 divide-y divide-gray-100">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-gray-400">
              <ShoppingCart className="w-12 h-12 text-gray-200 mb-2 stroke-1" />
              <p className="text-xs font-medium">Le panier est vide.</p>
              <p className="text-[11px] text-gray-400 mt-0.5">
                Cliquez sur un produit à gauche pour l'ajouter à la caisse.
              </p>
            </div>
          ) : (
            cart.map((item) => (
              <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-bold text-gray-900 truncate">{item.productName}</p>
                  <p className="text-[10px] text-gray-400 font-mono">
                    {item.unitPrice.toFixed(2)} {companySettings.currency} / unité
                  </p>
                </div>

                {/* Counter */}
                <div className="flex items-center space-x-1.5 shrink-0 bg-gray-100 rounded-lg p-0.5">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="p-1 text-gray-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-gray-900">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    className="p-1 text-gray-600 hover:bg-white rounded-md transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <div className="text-right shrink-0 min-w-[65px]">
                  <p className="text-xs font-bold text-gray-900 font-mono">
                    {item.total.toFixed(2)} {companySettings.currency}
                  </p>
                  <button
                    onClick={() => removeFromCart(item.productId)}
                    className="text-[10px] text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Totals & Payment Configuration */}
        {cart.length > 0 && (
          <div className="p-4 border-t border-gray-200 bg-gray-50/80 space-y-3">
            {/* Discount Option (RBAC Protected) */}
            {canApplyDiscounts && (
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600 font-medium">Remise commerciale (%) :</span>
                <div className="flex items-center space-x-1">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={discountPercent || ''}
                    placeholder="0"
                    onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                    className="w-16 p-1 text-right text-xs bg-white border border-gray-300 rounded-lg"
                  />
                  <span className="text-gray-500 font-bold">%</span>
                </div>
              </div>
            )}

            {/* Subtotal, Tax and Grand Total */}
            <div className="space-y-1 text-xs text-gray-600 pt-1 border-t border-gray-200">
              <div className="flex justify-between">
                <span>Sous-total HT :</span>
                <span className="font-mono">
                  {subtotalAfterDiscount.toFixed(2)} {companySettings.currency}
                </span>
              </div>
              <div className="flex justify-between">
                <span>TVA ({companySettings.taxRate}%) :</span>
                <span className="font-mono">
                  {taxAmount.toFixed(2)} {companySettings.currency}
                </span>
              </div>
              <div className="flex justify-between text-sm md:text-base font-bold text-gray-900 pt-1 border-t border-gray-200">
                <span>Total TTC :</span>
                <span className="text-blue-600 font-mono">
                  {grandTotal.toFixed(2)} {companySettings.currency}
                </span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div>
              <label className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1">
                Mode de Paiement
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {[
                  { id: 'carte', label: 'Carte', icon: CreditCard },
                  { id: 'especes', label: 'Espèces', icon: Banknote },
                  { id: 'virement', label: 'Virement', icon: Building },
                  { id: 'mobile_money', label: 'Mobile', icon: Smartphone },
                  { id: 'cheque', label: 'Chèque', icon: FileText },
                ].map((mode) => {
                  const Icon = mode.icon;
                  const isSelected = paymentMethod === mode.id;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentMethod(mode.id as PaymentMethod)}
                      className={`flex items-center justify-center space-x-1 py-1.5 px-2 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Amount Tendered (Espèces / Partiel) */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-medium text-gray-500">Montant Reçu :</label>
                <input
                  type="number"
                  step="any"
                  placeholder={grandTotal.toFixed(2)}
                  value={amountPaidInput}
                  onChange={(e) => setAmountPaidInput(e.target.value)}
                  className="w-full p-2 bg-white border border-gray-200 rounded-xl font-mono text-xs focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="bg-white p-2 rounded-xl border border-gray-200 text-right">
                {changeToGive > 0 ? (
                  <>
                    <span className="text-[10px] text-emerald-600 font-bold block">À rendre :</span>
                    <span className="text-xs font-bold text-emerald-700 font-mono">
                      {changeToGive.toFixed(2)} {companySettings.currency}
                    </span>
                  </>
                ) : balanceDue > 0 ? (
                  <>
                    <span className="text-[10px] text-amber-600 font-bold block">Reste dû :</span>
                    <span className="text-xs font-bold text-amber-700 font-mono">
                      {balanceDue.toFixed(2)} {companySettings.currency}
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-[10px] text-gray-400 block">Statut solde :</span>
                    <span className="text-xs font-bold text-gray-800">Compte exact</span>
                  </>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleProcessSale}
              disabled={isSubmitting}
              className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl font-bold text-sm shadow-md shadow-emerald-500/20 transition-all flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{isSubmitting ? 'Validation...' : 'Valider la Vente & Facturer'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Quick New Customer Modal */}
      {showNewCustomerModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full border border-gray-200 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h4 className="text-sm font-bold text-gray-900">Ajouter un Client Rapide</h4>
              <button
                onClick={() => setShowNewCustomerModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateCustomerQuick} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Nom complet / Société *
                </label>
                <input
                  type="text"
                  required
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                  placeholder="+33 6 00 00 00 00"
                  className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">
                  E-mail (Facultatif)
                </label>
                <input
                  type="email"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  placeholder="client@domaine.fr"
                  className="w-full text-xs p-2 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerModal(false)}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

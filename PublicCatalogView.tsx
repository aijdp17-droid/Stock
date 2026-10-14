import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  Search,
  ShoppingCart,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Plus,
  Minus,
  Trash2,
  X,
  Send,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';
import { Product } from '../types';

interface PublicCatalogViewProps {
  onBackToApp: () => void;
}

export const PublicCatalogView: React.FC<PublicCatalogViewProps> = ({ onBackToApp }) => {
  const { products, categories, companySettings, submitPublicOrder } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cart, setCart] = useState<{ product: Product; quantity: number }[]>([]);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [orderSubmittedSuccess, setOrderSubmittedSuccess] = useState<string | null>(null);

  // Order Form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');

  // Filter public items (only active products, NO cost prices exposed!)
  const publicProducts = products.filter((p) => {
    if (p.status === 'inactive') return false;
    const matchesCat = selectedCategory === 'all' || p.categoryId === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.ref.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const addToCart = (product: Product) => {
    if (product.currentStock <= 0) return;
    const existing = cart.find((i) => i.product.id === product.id);
    if (existing) {
      setCart(
        cart.map((i) =>
          i.product.id === product.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      );
    } else {
      setCart([...cart, { product, quantity: 1 }]);
    }
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((i) => {
          if (i.product.id === productId) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as { product: Product; quantity: number }[]
    );
  };

  const cartTotal = cart.reduce((acc, i) => acc + i.quantity * i.product.sellingPrice, 0);

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim() || cart.length === 0) return;

    const newOrder = submitPublicOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim(),
      deliveryAddress: deliveryAddress.trim(),
      notes: orderNotes.trim() || undefined,
      items: cart.map((i) => ({
        productId: i.product.id,
        productName: i.product.name,
        productRef: i.product.ref,
        quantity: i.quantity,
        unitPrice: i.product.sellingPrice,
      })),
      totalEstimated: cartTotal,
    });

    setOrderSubmittedSuccess(newOrder.id);
    setCart([]);
    setShowOrderModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Bar for Back to Administration */}
      <div className="bg-slate-900 text-white px-4 py-2 flex items-center justify-between text-xs">
        <button
          onClick={onBackToApp}
          className="flex items-center space-x-1.5 text-blue-300 hover:text-white font-semibold transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>← Retour à l'Espace de Gestion Commerciale</span>
        </button>
        <span className="text-slate-400 hidden sm:inline">
          Aperçu de la Vitrine Publique (§14 - Données d'achats &amp; marges confidentielles masquées)
        </span>
      </div>

      {/* Public Store Header Banner */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-lg shadow-blue-500/20">
                <ShoppingBag className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                  {companySettings.name}
                </h1>
                <p className="text-sm text-gray-600 font-medium">{companySettings.tagline}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 mt-1.5">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    {companySettings.address}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    {companySettings.phone}
                  </span>
                  <span className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    {companySettings.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Public Cart Trigger */}
            <div className="flex items-center space-x-3 self-end md:self-auto">
              <button
                onClick={() => setShowOrderModal(true)}
                className="relative flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Panier / Devis</span>
                {cart.length > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-400 text-gray-900 text-xs font-black flex items-center justify-center">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Catalog Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {orderSubmittedSuccess && (
          <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl flex items-center justify-between text-emerald-900 text-sm font-semibold">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
              <span>
                Votre demande de commande n° <strong>{orderSubmittedSuccess}</strong> a bien été transmise à l'équipe commerciale ! Nous vous contacterons rapidement.
              </span>
            </div>
            <button
              onClick={() => setOrderSubmittedSuccess(null)}
              className="text-emerald-700 hover:text-emerald-950 text-xs font-bold"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Search and Category Filters */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher un produit dans notre catalogue public..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto text-xs">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tous
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3.5 py-2 rounded-xl font-medium shrink-0 transition-colors ${
                  selectedCategory === c.id
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {publicProducts.map((p) => {
            const isOutOfStock = p.currentStock <= 0;
            const inCart = cart.find((i) => i.product.id === p.id);

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="relative h-48 w-full bg-gray-100 overflow-hidden">
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isOutOfStock ? (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-xs">
                        Victime de son succès
                      </span>
                    ) : (
                      <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                        Disponible
                      </span>
                    )}
                  </div>

                  <div className="p-4 space-y-2">
                    <span className="text-[10px] font-mono font-semibold text-gray-400">
                      Réf: {p.ref}
                    </span>
                    <h3 className="text-sm font-bold text-gray-900 line-clamp-2 leading-snug">
                      {p.name}
                    </h3>
                    <p className="text-xs text-gray-500 line-clamp-2">{p.description}</p>
                  </div>
                </div>

                <div className="p-4 pt-0">
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <span className="text-[10px] text-gray-400 block font-medium">Prix Public TTC</span>
                      <span className="text-base font-black text-blue-600 font-mono">
                        {p.sellingPrice.toFixed(2)} {companySettings.currency}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(p)}
                      disabled={isOutOfStock}
                      className={`flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isOutOfStock
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : inCart
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                      }`}
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>{inCart ? `Ajouté (${inCart.quantity})` : 'Ajouter'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      {/* Public Cart & Order Request Modal */}
      {showOrderModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-gray-900">Demande de Commande / Devis</h3>
              </div>
              <button
                onClick={() => setShowOrderModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {cart.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-xs">
                Votre panier est vide. Sélectionnez des articles dans le catalogue.
              </div>
            ) : (
              <form onSubmit={handleSubmitOrder} className="mt-4 space-y-4">
                {/* Cart summary */}
                <div className="max-h-44 overflow-y-auto divide-y divide-gray-100 border border-gray-100 rounded-xl p-2 bg-gray-50/50">
                  {cart.map(({ product, quantity }) => (
                    <div
                      key={product.id}
                      className="py-2 first:pt-0 flex items-center justify-between text-xs"
                    >
                      <div className="min-w-0 flex-1 pr-2">
                        <p className="font-bold text-gray-900 truncate">{product.name}</p>
                        <p className="text-[10px] text-gray-500 font-mono">
                          {product.sellingPrice.toFixed(2)} {companySettings.currency} / unité
                        </p>
                      </div>

                      <div className="flex items-center space-x-1.5 shrink-0 bg-white rounded-lg p-0.5 border border-gray-200">
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, -1)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded-sm"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-5 text-center font-bold">{quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(product.id, 1)}
                          className="p-1 text-gray-600 hover:bg-gray-100 rounded-sm"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <span className="font-mono font-bold text-gray-900 shrink-0 w-20 text-right">
                        {(quantity * product.sellingPrice).toFixed(2)} {companySettings.currency}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm font-bold text-gray-900 pt-1">
                  <span>Total estimé :</span>
                  <span className="font-mono text-base text-blue-600">
                    {cartTotal.toFixed(2)} {companySettings.currency}
                  </span>
                </div>

                {/* Visitor Information */}
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Votre Nom et Prénom / Société *
                    </label>
                    <input
                      type="text"
                      required
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="ex: Sophie Bernard"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Téléphone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="+33 6 00 00 00 00"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-gray-700 block mb-1">
                        Adresse E-mail
                      </label>
                      <input
                        type="email"
                        value={customerEmail}
                        onChange={(e) => setCustomerEmail(e.target.value)}
                        placeholder="client@mail.fr"
                        className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Adresse de livraison souhaitée
                    </label>
                    <input
                      type="text"
                      value={deliveryAddress}
                      onChange={(e) => setDeliveryAddress(e.target.value)}
                      placeholder="Adresse complète, ville, code postal"
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">
                      Instructions complémentaires (optionnel)
                    </label>
                    <input
                      type="text"
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Demande de facture avec TVA, délai urgent..."
                      className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowOrderModal(false)}
                    className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                  >
                    Continuer mes achats
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Envoyer la Commande</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

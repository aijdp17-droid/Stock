import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Truck,
  Plus,
  PackageCheck,
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  X,
  PlusCircle,
  Trash2,
  Phone,
  Mail,
  MapPin,
} from 'lucide-react';
import { PurchaseOrder, Supplier, PurchaseOrderItem } from '../types';

export const SuppliersAndPurchasesView: React.FC = () => {
  const {
    suppliers,
    addSupplier,
    updateSupplier,
    purchases,
    createPurchaseOrder,
    receivePurchaseOrder,
    products,
    companySettings,
    currentUser,
    hasPermission,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'purchases' | 'suppliers'>('purchases');
  const [searchQuery, setSearchQuery] = useState('');

  // New Purchase Order Modal
  const [showPOModal, setShowPOModal] = useState(false);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [orderItems, setOrderItems] = useState<
    { productId: string; quantity: number; unitCost: number }[]
  >([]);
  const [amountPaidInput, setAmountPaidInput] = useState('');
  const [poNotes, setPONotes] = useState('');

  // Supplier Modal
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplierId, setEditingSupplierId] = useState<string | null>(null);
  const [supName, setSupName] = useState('');
  const [supContact, setSupContact] = useState('');
  const [supPhone, setSupPhone] = useState('');
  const [supEmail, setSupEmail] = useState('');
  const [supAddress, setSupAddress] = useState('');
  const [supCategory, setSupCategory] = useState('');

  // Detail View of PO
  const [viewingPO, setViewingPO] = useState<PurchaseOrder | null>(null);

  const canManagePurchases = hasPermission('managePurchases') || currentUser.role === 'super_admin';

  const addItemToPO = () => {
    const firstProd = products[0];
    if (!firstProd) return;
    setOrderItems((prev) => [
      ...prev,
      { productId: firstProd.id, quantity: 10, unitCost: firstProd.purchasePrice },
    ]);
  };

  const updatePOItem = (index: number, field: string, value: any) => {
    const updated = [...orderItems];
    if (field === 'productId') {
      const prod = products.find((p) => p.id === value);
      updated[index].productId = value;
      if (prod) updated[index].unitCost = prod.purchasePrice;
    } else if (field === 'quantity') {
      updated[index].quantity = Math.max(1, parseInt(value, 10) || 1);
    } else if (field === 'unitCost') {
      updated[index].unitCost = Math.max(0, parseFloat(value) || 0);
    }
    setOrderItems(updated);
  };

  const removePOItem = (index: number) => {
    setOrderItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const openNewPOModal = () => {
    setSelectedSupplierId(suppliers[0]?.id || '');
    setOrderItems([
      {
        productId: products[0]?.id || '',
        quantity: 10,
        unitCost: products[0]?.purchasePrice || 0,
      },
    ]);
    setAmountPaidInput('');
    setPONotes('');
    setShowPOModal(true);
  };

  const handleCreatePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplierId || orderItems.length === 0) return;

    const supplier = suppliers.find((s) => s.id === selectedSupplierId);
    if (!supplier) return;

    const items: PurchaseOrderItem[] = orderItems.map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        productName: prod?.name || 'Article',
        productRef: prod?.ref || 'SKU',
        quantityOrdered: item.quantity,
        quantityReceived: 0,
        unitCost: item.unitCost,
        totalCost: item.quantity * item.unitCost,
      };
    });

    const totalAmount = items.reduce((acc, it) => acc + it.totalCost, 0);
    const amountPaid = amountPaidInput === '' ? totalAmount : parseFloat(amountPaidInput) || 0;

    createPurchaseOrder({
      supplierId: supplier.id,
      supplierName: supplier.name,
      items,
      totalAmount,
      amountPaid,
      paymentStatus:
        amountPaid >= totalAmount ? 'paid' : amountPaid > 0 ? 'partial' : 'pending',
      receiptStatus: 'ordered', // §12 strictly: stock only increments upon reception!
      notes: poNotes.trim() || undefined,
    });

    setShowPOModal(false);
  };

  const handleReceiveGoods = (poId: string) => {
    if (
      confirm(
        'Confirmer la réception effective des marchandises ? Cette action mettra à jour et incrémentera immédiatement les stocks dans le catalogue.'
      )
    ) {
      receivePurchaseOrder(poId);
    }
  };

  // Supplier modal handlers
  const openAddSupplier = () => {
    setEditingSupplierId(null);
    setSupName('');
    setSupContact('');
    setSupPhone('');
    setSupEmail('');
    setSupAddress('');
    setSupCategory('');
    setShowSupplierModal(true);
  };

  const openEditSupplier = (s: Supplier) => {
    setEditingSupplierId(s.id);
    setSupName(s.name);
    setSupContact(s.contactPerson);
    setSupPhone(s.phone);
    setSupEmail(s.email);
    setSupAddress(s.address);
    setSupCategory(s.category);
    setShowSupplierModal(true);
  };

  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supName.trim()) return;

    if (editingSupplierId) {
      updateSupplier(editingSupplierId, {
        name: supName.trim(),
        contactPerson: supContact.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim(),
        category: supCategory.trim(),
      });
    } else {
      addSupplier({
        name: supName.trim(),
        contactPerson: supContact.trim(),
        phone: supPhone.trim(),
        email: supEmail.trim(),
        address: supAddress.trim(),
        category: supCategory.trim(),
      });
    }

    setShowSupplierModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Achats &amp; Fournisseurs
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Commandes d'approvisionnement, gestion des tiers et validation de réception de marchandises (§12)
          </p>
        </div>

        <div className="flex items-center space-x-2">
          {/* Tab toggle */}
          <div className="flex items-center bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveTab('purchases')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'purchases'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Commandes d'Achat ({purchases.length})
            </button>
            <button
              onClick={() => setActiveTab('suppliers')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Fournisseurs ({suppliers.length})
            </button>
          </div>

          {canManagePurchases && (
            <button
              onClick={activeTab === 'purchases' ? openNewPOModal : openAddSupplier}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>{activeTab === 'purchases' ? 'Nouvel Achat' : 'Nouveau Fournisseur'}</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab: Purchase Orders */}
      {activeTab === 'purchases' && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3 px-4">N° Commande</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Fournisseur</th>
                  <th className="py-3 px-4 text-center">Articles</th>
                  <th className="py-3 px-4 text-right">Montant Total</th>
                  <th className="py-3 px-4 text-center">Paiement</th>
                  <th className="py-3 px-4 text-center">État Réception Stock</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {purchases.map((po) => {
                  const isReceived = po.receiptStatus === 'received';
                  return (
                    <tr key={po.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{po.id}</td>
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(po.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 font-semibold text-gray-900">{po.supplierName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="px-2 py-0.5 rounded-full bg-gray-100 font-semibold">
                          {po.items.length} réf.
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        {po.totalAmount.toFixed(2)} {companySettings.currency}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            po.paymentStatus === 'paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : po.paymentStatus === 'partial'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {po.paymentStatus === 'paid'
                            ? 'Payé'
                            : po.paymentStatus === 'partial'
                            ? 'Acompte'
                            : 'En attente'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            isReceived
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {isReceived ? (
                            <>
                              <CheckCircle className="w-3 h-3" />
                              Reçu en Stock
                            </>
                          ) : (
                            <>
                              <Clock className="w-3 h-3" />
                              Commandé / En transit
                            </>
                          )}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {!isReceived && canManagePurchases && (
                            <button
                              onClick={() => handleReceiveGoods(po.id)}
                              className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                              title="Valider la réception effective et incrémenter le stock"
                            >
                              <PackageCheck className="w-3.5 h-3.5" />
                              Réceptionner
                            </button>
                          )}
                          <button
                            onClick={() => setViewingPO(po)}
                            className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
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

      {/* Tab: Suppliers */}
      {activeTab === 'suppliers' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {suppliers.map((sup) => (
            <div
              key={sup.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">
                    {sup.category || 'Général'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-3">{sup.name}</h3>
                <p className="text-xs text-gray-500">Contact: {sup.contactPerson}</p>

                <div className="mt-3 space-y-1.5 text-xs text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-gray-400" />
                    <span>{sup.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-gray-400" />
                    <span>{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <span className="truncate">{sup.address}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-gray-400 block font-medium">Cumul Achats</span>
                  <span className="text-xs font-bold font-mono text-gray-900">
                    {sup.totalPurchases.toFixed(2)} {companySettings.currency}
                  </span>
                </div>

                <button
                  onClick={() => openEditSupplier(sup)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                >
                  Modifier
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* PO Detail View Modal */}
      {viewingPO && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">Bon de Commande {viewingPO.id}</h3>
                <p className="text-xs text-gray-500">Fournisseur : {viewingPO.supplierName}</p>
              </div>
              <button
                onClick={() => setViewingPO(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="my-4 overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-200 text-gray-500">
                    <th className="py-2">Article</th>
                    <th className="py-2 text-center">Commandé</th>
                    <th className="py-2 text-center">Réceptionné</th>
                    <th className="py-2 text-right">Coût U.</th>
                    <th className="py-2 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {viewingPO.items.map((it, idx) => (
                    <tr key={idx}>
                      <td className="py-2 font-medium text-gray-900">
                        {it.productName}
                        <span className="block text-[10px] text-gray-400 font-mono">{it.productRef}</span>
                      </td>
                      <td className="py-2 text-center">{it.quantityOrdered}</td>
                      <td className="py-2 text-center font-bold text-emerald-600">
                        {it.quantityReceived}
                      </td>
                      <td className="py-2 text-right font-mono">
                        {it.unitCost.toFixed(2)} {companySettings.currency}
                      </td>
                      <td className="py-2 text-right font-mono font-bold">
                        {it.totalCost.toFixed(2)} {companySettings.currency}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-between items-center text-xs">
              <div>
                <span className="text-gray-500">Statut de réception: </span>
                <span className="font-bold text-gray-900 uppercase">{viewingPO.receiptStatus}</span>
              </div>
              <div className="text-right">
                <span className="text-gray-500">Montant total: </span>
                <span className="font-mono text-base font-bold text-blue-600">
                  {viewingPO.totalAmount.toFixed(2)} {companySettings.currency}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Purchase Order Modal */}
      {showPOModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-gray-200 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                Nouveau Bon de Commande Fournisseur
              </h3>
              <button
                onClick={() => setShowPOModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePO} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Sélectionner le Fournisseur *
                </label>
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.contactPerson})
                    </option>
                  ))}
                </select>
              </div>

              {/* Items in PO */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-gray-700">Articles commandés *</label>
                  <button
                    type="button"
                    onClick={addItemToPO}
                    className="text-xs text-blue-600 font-semibold flex items-center gap-1 hover:text-blue-800"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    Ajouter une ligne
                  </button>
                </div>

                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {orderItems.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200"
                    >
                      <select
                        value={item.productId}
                        onChange={(e) => updatePOItem(idx, 'productId', e.target.value)}
                        className="text-xs p-2 rounded-lg border border-gray-300 bg-white flex-1"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} ({p.ref})
                          </option>
                        ))}
                      </select>

                      <div className="w-20">
                        <input
                          type="number"
                          min="1"
                          placeholder="Qté"
                          value={item.quantity}
                          onChange={(e) => updatePOItem(idx, 'quantity', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono text-center"
                        />
                      </div>

                      <div className="w-24">
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Prix unitaire"
                          value={item.unitCost}
                          onChange={(e) => updatePOItem(idx, 'unitCost', e.target.value)}
                          className="w-full text-xs p-2 rounded-lg border border-gray-300 bg-white font-mono text-right"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removePOItem(idx)}
                        className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Summary */}
              <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-900">Total estimé de la commande :</span>
                <span className="font-mono font-bold text-sm text-blue-700">
                  {orderItems
                    .reduce((a, b) => a + b.quantity * b.unitCost, 0)
                    .toFixed(2)}{' '}
                  {companySettings.currency}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Acompte ou Paiement versé
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="Montant payé (laisser vide si total)"
                    value={amountPaidInput}
                    onChange={(e) => setAmountPaidInput(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Remarques ou conditions
                  </label>
                  <input
                    type="text"
                    placeholder="ex: Délai 5 jours ouvrés"
                    value={poNotes}
                    onChange={(e) => setPONotes(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowPOModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Créer le Bon de Commande
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Supplier Modal */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingSupplierId ? 'Modifier le Fournisseur' : 'Ajouter un Fournisseur'}
              </h3>
              <button
                onClick={() => setShowSupplierModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="mt-4 space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nom de la société / Entreprise *
                </label>
                <input
                  type="text"
                  required
                  value={supName}
                  onChange={(e) => setSupName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Personne de contact
                </label>
                <input
                  type="text"
                  value={supContact}
                  onChange={(e) => setSupContact(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Téléphone</label>
                  <input
                    type="tel"
                    value={supPhone}
                    onChange={(e) => setSupPhone(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Secteur / Rayon</label>
                  <input
                    type="text"
                    value={supCategory}
                    onChange={(e) => setSupCategory(e.target.value)}
                    placeholder="ex: Électronique"
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">E-mail</label>
                <input
                  type="email"
                  value={supEmail}
                  onChange={(e) => setSupEmail(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Adresse postale</label>
                <input
                  type="text"
                  value={supAddress}
                  onChange={(e) => setSupAddress(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowSupplierModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
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

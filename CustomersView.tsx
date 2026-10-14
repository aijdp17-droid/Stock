import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Users,
  Search,
  Plus,
  Edit,
  Eye,
  Receipt,
  Phone,
  Mail,
  MapPin,
  Building,
  DollarSign,
  AlertCircle,
  X,
} from 'lucide-react';
import { Customer, Sale } from '../types';

interface CustomersViewProps {
  onViewInvoice: (sale: Sale) => void;
}

export const CustomersView: React.FC<CustomersViewProps> = ({ onViewInvoice }) => {
  const { customers, addCustomer, updateCustomer, sales, companySettings } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomerId, setEditingCustomerId] = useState<string | null>(null);

  // Detail Drawer state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  // Form
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [companyName, setCompanyName] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.companyName && c.companyName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const openAddModal = () => {
    setEditingCustomerId(null);
    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCompanyName('');
    setShowModal(true);
  };

  const openEditModal = (c: Customer) => {
    setEditingCustomerId(c.id);
    setName(c.name);
    setPhone(c.phone);
    setEmail(c.email || '');
    setAddress(c.address || '');
    setCompanyName(c.companyName || '');
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    if (editingCustomerId) {
      updateCustomer(editingCustomerId, {
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        companyName: companyName.trim() || undefined,
      });
    } else {
      addCustomer({
        name: name.trim(),
        phone: phone.trim(),
        email: email.trim() || undefined,
        address: address.trim() || undefined,
        companyName: companyName.trim() || undefined,
      });
    }

    setShowModal(false);
  };

  // Customer sales history
  const customerSales = selectedCustomer
    ? sales.filter((s) => s.customerId === selectedCustomer.id)
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Gestion des Clients</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Répertoire commercial, historique d'achats et suivi des créances / soldes
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher par nom, téléphone, société, email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs md:text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* Customers List */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Client / Raison Sociale</th>
                <th className="py-3 px-4">Coordonnées</th>
                <th className="py-3 px-4">Adresse</th>
                <th className="py-3 px-4 text-right">Volume Achats</th>
                <th className="py-3 px-4 text-right">Créance / Reste Dû</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Users className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    Aucun client trouvé.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-bold text-gray-900 block">{c.name}</span>
                      {c.companyName && (
                        <span className="text-[10px] text-gray-400 font-medium">
                          Sté: {c.companyName}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Phone className="w-3 h-3 text-gray-400" />
                        <span>{c.phone}</span>
                      </div>
                      {c.email && (
                        <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
                          <Mail className="w-3 h-3" />
                          <span>{c.email}</span>
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-500 truncate max-w-[200px]">
                      {c.address || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                      {c.totalSpent.toFixed(2)} {companySettings.currency}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      {c.balanceDue > 0 ? (
                        <span className="text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                          {c.balanceDue.toFixed(2)} {companySettings.currency}
                        </span>
                      ) : (
                        <span className="text-emerald-600">0.00 {companySettings.currency}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        <button
                          onClick={() => setSelectedCustomer(c)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Voir l'historique des achats"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => openEditModal(c)}
                          className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                          title="Modifier les coordonnées"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Purchase History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 border border-gray-200 shadow-2xl max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-base font-bold text-gray-900">
                  Fiche &amp; Historique Client
                </h3>
                <p className="text-xs text-gray-500">
                  {selectedCustomer.name} • Tél: {selectedCustomer.phone}
                </p>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 my-4">
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                <span className="text-[10px] text-blue-600 font-bold uppercase">Total Dépensé</span>
                <p className="text-lg font-bold font-mono text-blue-900 mt-0.5">
                  {selectedCustomer.totalSpent.toFixed(2)} {companySettings.currency}
                </p>
              </div>
              <div className="p-3 bg-gray-50 rounded-xl border border-gray-200">
                <span className="text-[10px] text-gray-500 font-bold uppercase">Solde Débiteur</span>
                <p
                  className={`text-lg font-bold font-mono mt-0.5 ${
                    selectedCustomer.balanceDue > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}
                >
                  {selectedCustomer.balanceDue.toFixed(2)} {companySettings.currency}
                </p>
              </div>
            </div>

            <h4 className="text-xs font-bold text-gray-900 mb-2">Factures Associées</h4>
            <div className="flex-1 overflow-y-auto space-y-2 border border-gray-100 rounded-xl p-2">
              {customerSales.length === 0 ? (
                <p className="text-xs text-gray-400 text-center py-6">
                  Aucune facture enregistrée pour ce client.
                </p>
              ) : (
                customerSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                  >
                    <div>
                      <span className="font-mono font-bold text-xs text-gray-900">{sale.id}</span>
                      <p className="text-[10px] text-gray-500">
                        Date: {new Date(sale.date).toLocaleDateString()} • {sale.items.length} article(s)
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <span className="font-mono font-bold text-xs text-gray-900">
                        {sale.grandTotal.toFixed(2)} {companySettings.currency}
                      </span>
                      <button
                        onClick={() => {
                          setSelectedCustomer(null);
                          onViewInvoice(sale);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-100 rounded-lg"
                        title="Consulter la facture"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingCustomerId ? 'Modifier le Client' : 'Ajouter un Client'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nom &amp; Prénom / Contact *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Jean Dupont"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Numéro de Téléphone *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="ex: +33 6 12 34 56 78"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Raison Sociale / Entreprise (Facultatif)
                </label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="ex: SAS Global Services"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Adresse E-mail
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contact@client.com"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Adresse Postale / Livraison
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Numéro, rue, code postal, ville..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Enregistrer le Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

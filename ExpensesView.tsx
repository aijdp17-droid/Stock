import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Wallet,
  Plus,
  Trash2,
  Calendar,
  Filter,
  DollarSign,
  Tag,
  Building,
  Truck,
  Zap,
  ShoppingBag,
  Users,
  Megaphone,
  Layers,
  X,
} from 'lucide-react';
import { Expense, ExpenseCategory, PaymentMethod } from '../types';

export const ExpensesView: React.FC = () => {
  const { expenses, addExpense, deleteExpense, companySettings, currentUser, hasPermission } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Form
  const [category, setCategory] = useState<ExpenseCategory>('loyer');
  const [amount, setAmount] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('virement');

  const canManageExpenses = hasPermission('manageExpenses') || currentUser.role === 'super_admin';

  const categoryIcons: Record<ExpenseCategory, any> = {
    loyer: Building,
    transport: Truck,
    electricite: Zap,
    fournitures: ShoppingBag,
    salaires: Users,
    marketing: Megaphone,
    autre: Layers,
  };

  const categoryLabels: Record<ExpenseCategory, string> = {
    loyer: 'Loyer & Locaux',
    transport: 'Transport & Logistique',
    electricite: 'Énergie & Fluides',
    fournitures: 'Fournitures & Emballages',
    salaires: 'Salaires & Rémunérations',
    marketing: 'Marketing & Publicité',
    autre: 'Autres Dépenses',
  };

  const filteredExpenses = expenses.filter((e) =>
    selectedCategory === 'all' ? true : e.category === selectedCategory
  );

  const totalExpenseAmount = filteredExpenses.reduce((acc, e) => acc + e.amount, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0 || !description.trim()) return;

    addExpense({
      date: new Date().toISOString(),
      category,
      amount,
      description: description.trim(),
      paymentMethod,
    });

    setShowModal(false);
    setAmount(0);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Dépenses &amp; Frais d'Exploitation</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Suivi des charges opérationnelles (loyer, transport, énergie, fournitures) (§13.1)
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-medium">Cumul dépenses :</span>
            <span className="text-lg font-bold text-red-600 font-mono">
              -{totalExpenseAmount.toFixed(2)} {companySettings.currency}
            </span>
          </div>

          {canManageExpenses && (
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Saisir Dépense</span>
            </button>
          )}
        </div>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedCategory('all')}
          className={`px-3 py-1.5 rounded-xl font-semibold shrink-0 transition-colors ${
            selectedCategory === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
          }`}
        >
          Toutes ({expenses.length})
        </button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const count = expenses.filter((e) => e.category === key).length;
          return (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors ${
                selectedCategory === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              {label} ({count})
            </button>
          );
        })}
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Catégorie</th>
                <th className="py-3 px-4">Description</th>
                <th className="py-3 px-4 text-center">Règlement</th>
                <th className="py-3 px-4">Enregistré par</th>
                <th className="py-3 px-4 text-right">Montant</th>
                {canManageExpenses && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400">
                    <Wallet className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    Aucune dépense enregistrée dans cette catégorie.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => {
                  const Icon = categoryIcons[exp.category] || Layers;
                  return (
                    <tr key={exp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-3 px-4 text-gray-600">
                        {new Date(exp.date).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 text-gray-800 font-semibold text-[11px]">
                          <Icon className="w-3.5 h-3.5 text-gray-500" />
                          {categoryLabels[exp.category] || exp.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-medium text-gray-900">{exp.description}</td>
                      <td className="py-3 px-4 text-center uppercase font-mono text-[10px] text-gray-500">
                        {exp.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-gray-600">{exp.recordedBy}</td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-red-600 text-sm">
                        -{exp.amount.toFixed(2)} {companySettings.currency}
                      </td>
                      {canManageExpenses && (
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => deleteExpense(exp.id)}
                            className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Enregistrer une Dépense</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Catégorie de Dépense *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                >
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Montant ({companySettings.currency}) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono font-bold text-red-600 focus:outline-hidden focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Description / Justification *
                </label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ex: Facture électricité showroom, frais livraison coursier..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Mode de Règlement</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="virement">Virement Bancaire</option>
                  <option value="carte">Carte Bancaire</option>
                  <option value="especes">Espèces (Petite caisse)</option>
                  <option value="cheque">Chèque</option>
                  <option value="mobile_money">Mobile Money</option>
                </select>
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
                  Enregistrer la Dépense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  Receipt,
  Eye,
  XCircle,
  Calendar,
  Filter,
  CheckCircle,
  AlertCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { Sale } from '../types';

interface SalesHistoryViewProps {
  onViewInvoice: (sale: Sale) => void;
}

export const SalesHistoryView: React.FC<SalesHistoryViewProps> = ({ onViewInvoice }) => {
  const { sales, cancelSale, hasPermission, companySettings } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');

  // Cancel modal state
  const [saleToCancel, setSaleToCancel] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');

  const canCancelSale = hasPermission('cancelSale');

  const filteredSales = sales.filter((s) => {
    const matchesSearch =
      s.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.customerName && s.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      s.sellerName.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || s.status === statusFilter;

    let matchesDate = true;
    const saleDate = new Date(s.date);
    const now = new Date();
    if (dateFilter === 'today') {
      matchesDate =
        saleDate.getDate() === now.getDate() &&
        saleDate.getMonth() === now.getMonth() &&
        saleDate.getFullYear() === now.getFullYear();
    } else if (dateFilter === 'week') {
      const diffTime = Math.abs(now.getTime() - saleDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      matchesDate = diffDays <= 7;
    }

    return matchesSearch && matchesStatus && matchesDate;
  });

  const handleConfirmCancel = (e: React.FormEvent) => {
    e.preventDefault();
    if (!saleToCancel || !cancelReason.trim()) return;

    cancelSale(saleToCancel.id, cancelReason.trim());
    setSaleToCancel(null);
    setCancelReason('');
  };

  const totalSalesCount = filteredSales.length;
  const totalSalesAmount = filteredSales
    .filter((s) => s.status !== 'canceled')
    .reduce((acc, s) => acc + s.grandTotal, 0);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Historique des Ventes &amp; Factures
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Journal de toutes les transactions, factures acquittées et traçabilité des annulations
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <span className="text-xs text-gray-400 block font-medium">Total facturé :</span>
            <span className="text-lg font-bold text-emerald-600 font-mono">
              {totalSalesAmount.toFixed(2)} {companySettings.currency}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par n° de facture, nom du client ou vendeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50 text-xs md:text-sm rounded-xl border border-gray-200 focus:bg-white focus:border-blue-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">Tous les statuts</option>
              <option value="completed">Payée / Réglée</option>
              <option value="partial">Paiement Partiel</option>
              <option value="canceled">Annulée</option>
            </select>

            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="text-xs p-2 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:outline-hidden"
            >
              <option value="all">Toutes dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="week">7 derniers jours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Sales Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/70 border-b border-gray-200 text-gray-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Date &amp; Heure</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4">Vendeur</th>
                <th className="py-3 px-4 text-center">Articles</th>
                <th className="py-3 px-4 text-right">Montant Total</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Règlement</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredSales.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-gray-400">
                    <Receipt className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                    Aucune vente ne correspond aux critères sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredSales.map((sale) => {
                  const isCanceled = sale.status === 'canceled';
                  const isPartial = sale.status === 'partial';

                  return (
                    <tr
                      key={sale.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isCanceled ? 'bg-red-50/30 opacity-75' : ''
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-gray-900">{sale.id}</td>
                      <td className="py-3 px-4 text-gray-600">
                        <div>{new Date(sale.date).toLocaleDateString()}</div>
                        <div className="text-[10px] text-gray-400">
                          {new Date(sale.date).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-semibold text-gray-900 block truncate max-w-[150px]">
                          {sale.customerName || 'Client standard'}
                        </span>
                        {sale.customerPhone && (
                          <span className="text-[10px] text-gray-400">{sale.customerPhone}</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-gray-700">{sale.sellerName}</td>
                      <td className="py-3 px-4 text-center">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 font-semibold text-gray-700">
                          {sale.items.reduce((a, b) => a + b.quantity, 0)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-gray-900">
                        {sale.grandTotal.toFixed(2)} {companySettings.currency}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                            sale.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : isPartial
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {sale.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                          {isPartial && <AlertCircle className="w-3 h-3" />}
                          {sale.status === 'completed'
                            ? 'Payée'
                            : isPartial
                            ? 'Partielle'
                            : 'Annulée'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-medium uppercase text-[10px] text-gray-500">
                        {sale.paymentMethod}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => onViewInvoice(sale)}
                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="Consulter / Imprimer le reçu"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {!isCanceled && canCancelSale && (
                            <button
                              onClick={() => setSaleToCancel(sale)}
                              className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                              title="Annuler la vente (restitue les stocks)"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mandatory Cancellation Justification Modal (§9 & §10 Requirement) */}
      {saleToCancel && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center space-x-3 text-red-600 pb-3 border-b border-gray-100">
              <AlertCircle className="w-6 h-6 shrink-0" />
              <div>
                <h4 className="text-base font-bold text-gray-900">
                  Confirmation d'Annulation de Vente
                </h4>
                <p className="text-xs text-gray-500">Facture {saleToCancel.id}</p>
              </div>
            </div>

            <div className="my-4 text-xs text-gray-600 space-y-2 bg-amber-50 p-3 rounded-xl border border-amber-200">
              <p className="font-semibold text-amber-900">
                Action sécurisée avec rétablissement de stock :
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Le stock de tous les articles ({saleToCancel.items.length}) sera automatiquement restitué.</li>
                <li>L'annulation sera consignée dans le journal d'audit avec votre identifiant.</li>
                <li>Un motif explicite est strictement obligatoire.</li>
              </ul>
            </div>

            <form onSubmit={handleConfirmCancel} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Motif obligatoire de l'annulation *
                </label>
                <textarea
                  required
                  rows={3}
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="ex: Erreur de saisie caisse, retour marchandise client, moyen de paiement rejeté..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-300 focus:border-red-500 focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setSaleToCancel(null)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Fermer sans annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-semibold rounded-xl"
                >
                  Confirmer l'annulation &amp; Restituer stocks
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Store,
  CheckCircle,
  XCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  ShoppingBag,
  ArrowRight,
} from 'lucide-react';
import { PublicOrderRequest } from '../types';

interface WebOrdersViewProps {
  onOrderConverted: () => void;
}

export const WebOrdersView: React.FC<WebOrdersViewProps> = ({ onOrderConverted }) => {
  const { publicOrders, convertPublicOrderToSale, rejectPublicOrder, companySettings } = useApp();

  const handleConvert = (orderId: string) => {
    if (
      confirm(
        'Voulez-vous valider cette commande web et la convertir en vente officielle ? Le stock sera automatiquement décrémenté.'
      )
    ) {
      const sale = convertPublicOrderToSale(orderId);
      if (sale) {
        alert(`Commande web convertie avec succès en facture ${sale.id} !`);
        onOrderConverted();
      }
    }
  };

  const handleReject = (orderId: string) => {
    if (confirm('Rejeter cette demande de commande en ligne ?')) {
      rejectPublicOrder(orderId);
    }
  };

  const pendingOrders = publicOrders.filter((o) => o.status === 'pending');
  const pastOrders = publicOrders.filter((o) => o.status !== 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Commandes Web &amp; Devis Reçus (§14)
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Traitement des demandes issues de la vitrine publique avant validation et facturation
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            {pendingOrders.length} en attente de traitement
          </span>
        </div>
      </div>

      {/* Pending Orders Section */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          <Clock className="w-4 h-4 text-amber-500" />
          <span>Demandes En Attente de Validation</span>
        </h2>

        {pendingOrders.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center text-gray-400 text-xs shadow-xs">
            <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            Toutes les demandes de commande en ligne ont été traitées !
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingOrders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-blue-200 shadow-xs p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                    <span className="font-mono font-bold text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md">
                      {order.id}
                    </span>
                    <span className="text-[11px] text-gray-400">
                      {new Date(order.date).toLocaleDateString()} {new Date(order.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-sm font-bold text-gray-900">{order.customerName}</h3>
                    <div className="mt-1 space-y-1 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-gray-400" />
                        <span>{order.customerPhone}</span>
                      </div>
                      {order.customerEmail && (
                        <div className="flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-gray-400" />
                          <span>{order.customerEmail}</span>
                        </div>
                      )}
                      {order.deliveryAddress && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-gray-400" />
                          <span className="truncate">{order.deliveryAddress}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Order Items */}
                  <div className="mt-3 bg-gray-50 p-2.5 rounded-xl border border-gray-100 space-y-1.5">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">
                      Articles demandés ({order.items.length}) :
                    </span>
                    {order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-gray-700">
                        <span className="truncate flex-1">
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-mono font-semibold ml-2">
                          {(it.quantity * it.unitPrice).toFixed(2)} {companySettings.currency}
                        </span>
                      </div>
                    ))}
                  </div>

                  {order.notes && (
                    <p className="mt-2 text-xs italic text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200">
                      Note client : {order.notes}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-gray-400 block font-medium">Total estimé</span>
                    <span className="font-mono font-bold text-sm text-blue-600">
                      {order.totalEstimated.toFixed(2)} {companySettings.currency}
                    </span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleReject(order.id)}
                      className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-semibold transition-colors cursor-pointer"
                    >
                      Rejeter
                    </button>
                    <button
                      onClick={() => handleConvert(order.id)}
                      className="flex items-center space-x-1.5 px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Valider &amp; Décrémenter Stock</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Past Processed Orders */}
      {pastOrders.length > 0 && (
        <div className="space-y-3 pt-6 border-t border-gray-200">
          <h2 className="text-sm font-bold text-gray-700">Historique des Commandes Web Traitées</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-2.5 px-4">Réf. Demande</th>
                  <th className="py-2.5 px-4">Date</th>
                  <th className="py-2.5 px-4">Client</th>
                  <th className="py-2.5 px-4 text-center">Articles</th>
                  <th className="py-2.5 px-4 text-right">Montant</th>
                  <th className="py-2.5 px-4 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pastOrders.map((o) => (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="py-2.5 px-4 font-mono font-bold text-gray-900">{o.id}</td>
                    <td className="py-2.5 px-4 text-gray-600">
                      {new Date(o.date).toLocaleDateString()}
                    </td>
                    <td className="py-2.5 px-4 font-medium text-gray-900">{o.customerName}</td>
                    <td className="py-2.5 px-4 text-center">{o.items.length}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      {o.totalEstimated.toFixed(2)} {companySettings.currency}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.status === 'converted'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {o.status === 'converted' ? 'Convertie en Vente' : 'Rejetée'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

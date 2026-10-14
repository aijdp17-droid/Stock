import React from 'react';
import { Sale } from '../types';
import { useApp } from '../context/AppContext';
import { Printer, X, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';

interface InvoiceModalProps {
  sale: Sale | null;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, onClose }) => {
  const { companySettings } = useApp();

  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  const paymentLabels: Record<string, string> = {
    especes: 'Espèces',
    carte: 'Carte Bancaire',
    virement: 'Virement Bancaire',
    mobile_money: 'Mobile Money',
    cheque: 'Chèque',
  };

  const formattedDate = new Date(sale.date).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden border border-gray-200 my-8">
        {/* Top Action Bar (hidden on print) */}
        <div className="p-4 bg-gray-50 border-b border-gray-200 flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${
                sale.status === 'completed'
                  ? 'bg-emerald-100 text-emerald-800'
                  : sale.status === 'partial'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {sale.status === 'completed' && <CheckCircle className="w-3.5 h-3.5" />}
              {sale.status === 'partial' && <AlertCircle className="w-3.5 h-3.5" />}
              {sale.status === 'completed'
                ? 'Facture Réglée'
                : sale.status === 'partial'
                ? 'Paiement Partiel'
                : 'Facture Annulée'}
            </span>
            <span className="text-xs font-mono text-gray-500 font-bold">{sale.id}</span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimer / PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Body */}
        <div className="p-6 md:p-8 space-y-6 text-gray-900 print:p-0">
          {/* Header Information */}
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-gray-200">
            <div>
              <div className="flex items-center space-x-2 mb-1">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
                  <ShoppingBag className="w-4 h-4" />
                </div>
                <h2 className="text-lg font-bold text-gray-900">{companySettings.name}</h2>
              </div>
              <p className="text-xs text-gray-500">{companySettings.tagline}</p>
              <p className="text-xs text-gray-600 mt-1">{companySettings.address}</p>
              <p className="text-xs text-gray-600">
                Tél: {companySettings.phone} • {companySettings.email}
              </p>
              <p className="text-xs text-gray-500 font-mono mt-0.5">{companySettings.siretOrNif}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                FACTURE COMMERCIALE
              </span>
              <h3 className="text-base font-bold font-mono text-gray-900">{sale.id}</h3>
              <p className="text-xs text-gray-500 mt-1">Date: {formattedDate}</p>
              <p className="text-xs text-gray-600">
                Vendeur: <span className="font-semibold">{sale.sellerName}</span>
              </p>
            </div>
          </div>

          {/* Client Information */}
          <div className="bg-gray-50 rounded-xl p-3.5 border border-gray-100 flex flex-col sm:flex-row justify-between gap-2">
            <div>
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Facturé à :
              </p>
              <p className="text-sm font-bold text-gray-900">
                {sale.customerName || 'Client Comptoir (Passager)'}
              </p>
              {sale.customerPhone && (
                <p className="text-xs text-gray-600">Tél: {sale.customerPhone}</p>
              )}
            </div>
            <div className="sm:text-right">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                Mode de règlement :
              </p>
              <p className="text-xs font-semibold text-gray-900">
                {paymentLabels[sale.paymentMethod] || sale.paymentMethod}
              </p>
            </div>
          </div>

          {/* Items Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider">
                  <th className="py-2 font-semibold">Réf.</th>
                  <th className="py-2 font-semibold">Article</th>
                  <th className="py-2 text-center font-semibold">Qté</th>
                  <th className="py-2 text-right font-semibold">P.U.</th>
                  <th className="py-2 text-right font-semibold">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sale.items.map((item, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 font-mono text-gray-500">{item.productRef}</td>
                    <td className="py-2.5 font-medium text-gray-900">
                      <div>{item.productName}</div>
                      {item.discountPercent > 0 && (
                        <span className="text-[10px] text-emerald-600 font-semibold">
                          Remise: -{item.discountPercent}%
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center font-semibold text-gray-700">{item.quantity}</td>
                    <td className="py-2.5 text-right font-mono text-gray-600">
                      {item.unitPrice.toFixed(2)} {companySettings.currency}
                    </td>
                    <td className="py-2.5 text-right font-mono font-semibold text-gray-900">
                      {item.total.toFixed(2)} {companySettings.currency}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Financial Totals */}
          <div className="pt-4 border-t border-gray-200 space-y-1.5">
            <div className="flex justify-between text-xs text-gray-600">
              <span>Sous-total HT :</span>
              <span className="font-mono">
                {sale.subtotal.toFixed(2)} {companySettings.currency}
              </span>
            </div>
            {sale.discountTotal > 0 && (
              <div className="flex justify-between text-xs text-emerald-600">
                <span>Remise commerciale accordée :</span>
                <span className="font-mono">
                  -{sale.discountTotal.toFixed(2)} {companySettings.currency}
                </span>
              </div>
            )}
            <div className="flex justify-between text-xs text-gray-600">
              <span>TVA ({companySettings.taxRate}%) :</span>
              <span className="font-mono">
                {sale.taxAmount.toFixed(2)} {companySettings.currency}
              </span>
            </div>
            <div className="flex justify-between text-sm md:text-base font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total TTC :</span>
              <span className="font-mono text-blue-600">
                {sale.grandTotal.toFixed(2)} {companySettings.currency}
              </span>
            </div>
            <div className="flex justify-between text-xs text-gray-700 pt-1">
              <span>Montant Réglé :</span>
              <span className="font-mono font-semibold">
                {sale.amountPaid.toFixed(2)} {companySettings.currency}
              </span>
            </div>
            {sale.balanceDue > 0 && (
              <div className="flex justify-between text-xs font-bold text-red-600 pt-1">
                <span>Reste à payer (Créance) :</span>
                <span className="font-mono">
                  {sale.balanceDue.toFixed(2)} {companySettings.currency}
                </span>
              </div>
            )}
          </div>

          {/* Notes & Footer */}
          {sale.notes && (
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900">
              <span className="font-bold">Observations: </span>
              {sale.notes}
            </div>
          )}

          {sale.status === 'canceled' && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800">
              <p className="font-bold">Facture annulée le {sale.canceledAt ? new Date(sale.canceledAt).toLocaleDateString() : ''} par {sale.canceledBy}</p>
              <p className="mt-0.5">Motif: {sale.cancelReason}</p>
            </div>
          )}

          <div className="pt-4 border-t border-gray-100 text-center text-[11px] text-gray-500">
            <p>{companySettings.invoiceFooterNote}</p>
            <p className="mt-1 font-mono text-[10px] text-gray-400">
              Document généré électroniquement par {companySettings.name} • Logiciel de Gestion Commerciale
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

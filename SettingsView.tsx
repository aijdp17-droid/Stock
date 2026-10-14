import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  Settings,
  Building,
  Building2,
  DollarSign,
  Download,
  Upload,
  RotateCcw,
  Shield,
  Save,
  CheckCircle,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { CreateEnterpriseModal } from '../components/CreateEnterpriseModal';
import { GOOGLE_SHEET_TEMPLATES } from '../data/sheetTemplates';

export const SettingsView: React.FC = () => {
  const {
    companySettings,
    updateCompanySettings,
    enterprises,
    currentEnterprise,
    currentEnterpriseId,
    switchEnterprise,
    deleteEnterprise,
    exportDatabaseJson,
    importDatabaseJson,
    resetAllData,
    currentUser,
    hasPermission,
  } = useApp();

  const [name, setName] = useState(companySettings.name);
  const [tagline, setTagline] = useState(companySettings.tagline);
  const [phone, setPhone] = useState(companySettings.phone);
  const [email, setEmail] = useState(companySettings.email);
  const [address, setAddress] = useState(companySettings.address);
  const [siretOrNif, setSiretOrNif] = useState(companySettings.siretOrNif);
  const [currency, setCurrency] = useState(companySettings.currency);
  const [taxRate, setTaxRate] = useState(companySettings.taxRate);
  const [alertStockMin, setAlertStockMin] = useState(companySettings.alertStockMin);
  const [allowNegativeStock, setAllowNegativeStock] = useState(companySettings.allowNegativeStock);
  const [invoiceFooterNote, setInvoiceFooterNote] = useState(companySettings.invoiceFooterNote);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [showCreateEnterpriseModal, setShowCreateEnterpriseModal] = useState(false);

  useEffect(() => {
    setName(companySettings.name);
    setTagline(companySettings.tagline);
    setPhone(companySettings.phone);
    setEmail(companySettings.email);
    setAddress(companySettings.address);
    setSiretOrNif(companySettings.siretOrNif);
    setCurrency(companySettings.currency);
    setTaxRate(companySettings.taxRate);
    setAlertStockMin(companySettings.alertStockMin);
    setAllowNegativeStock(companySettings.allowNegativeStock);
    setInvoiceFooterNote(companySettings.invoiceFooterNote);
  }, [companySettings]);

  const canManageSettings = hasPermission('manageSettings') || currentUser.role === 'super_admin';

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings({
      name: name.trim(),
      tagline: tagline.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      siretOrNif: siretOrNif.trim(),
      currency: currency.trim() || '€',
      taxRate: Number(taxRate),
      alertStockMin: Number(alertStockMin),
      allowNegativeStock,
      invoiceFooterNote: invoiceFooterNote.trim(),
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const json = exportDatabaseJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `sauvegarde_omnigestion_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseJson(content);
      if (success) {
        alert('Base de données restaurée avec succès !');
        setImportError(null);
      } else {
        setImportError('Le fichier de sauvegarde est invalide ou corrompu.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetData = () => {
    if (
      confirm(
        'ATTENTION : Êtes-vous sûr de vouloir réinitialiser toutes les données de l\'application à l\'état d\'usine ? Les modifications locales seront écrasées par les données de test certifiées.'
      )
    ) {
      resetAllData();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Paramètres Généraux</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Identité commerciale, devise, fiscalité et sauvegardes de la base de données (§19)
          </p>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-100 border border-emerald-300 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>Paramètres généraux enregistrés avec succès !</span>
        </div>
      )}

      {/* Multi-Enterprise Accounts Switcher Card */}
      <div className="bg-gradient-to-r from-blue-50/80 via-indigo-50/60 to-purple-50/50 border border-blue-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-blue-500/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-gray-900">
                  Comptes d'Entreprises &amp; Classeurs Liés
                </h2>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  {enterprises.length} Compte(s)
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Espace actif actuel : <strong className="text-gray-900">{currentEnterprise.name}</strong> • Modèle Sheets: <span className="font-mono text-blue-700 font-semibold">{currentEnterprise.sheetTemplateType}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowCreateEnterpriseModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Nouveau Compte</span>
          </button>
        </div>

        {/* Enterprise Accounts Quick Switch Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {enterprises.map((ent) => {
            const isActive = ent.id === currentEnterpriseId;
            return (
              <div
                key={ent.id}
                onClick={() => !isActive && switchEnterprise(ent.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between ${
                  isActive
                    ? 'border-blue-600 bg-white shadow-xs ring-1 ring-blue-600/20'
                    : 'border-blue-200/60 bg-white/70 hover:bg-white hover:border-blue-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 font-mono">
                      {ent.sheetTemplateType}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Actif
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          switchEnterprise(ent.id);
                        }}
                        className="text-[11px] text-blue-600 hover:text-blue-800 font-bold"
                      >
                        Basculer
                      </button>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-gray-900 truncate">{ent.name}</h4>
                  <p className="text-[11px] text-gray-500 truncate mt-0.5">
                    {ent.settings.currency} • TVA {ent.settings.taxRate}%
                  </p>
                </div>

                <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between text-[10px] text-gray-400">
                  <span className="truncate max-w-[130px] font-mono">
                    {ent.spreadsheetName || 'Classeur'}
                  </span>
                  {!isActive && enterprises.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Supprimer le compte entreprise "${ent.name}" ?`)) {
                          deleteEnterprise(ent.id);
                        }
                      }}
                      className="text-gray-400 hover:text-red-600 p-1 rounded-md"
                      title="Supprimer cette entreprise"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Settings Form */}
      <form onSubmit={handleSaveSettings} className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
        <div>
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <Building className="w-4 h-4 text-blue-600" />
            <span>Identité de l'Entreprise Active &amp; Coordonnées</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Raison Sociale / Nom Commercial *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Slogan / Description d'activité
              </label>
              <input
                type="text"
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Téléphone Commercial</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">E-mail Commercial</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Adresse du Siège &amp; Magasin
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Identifiant Légal (SIRET / NIF / Registre)
              </label>
              <input
                type="text"
                value={siretOrNif}
                onChange={(e) => setSiretOrNif(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Financial & Stock Parameters */}
        <div className="pt-4 border-t border-gray-100">
          <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
            <DollarSign className="w-4 h-4 text-emerald-600" />
            <span>Paramètres Commerciaux, Devise &amp; Stocks</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Symbole Monétaire / Devise
              </label>
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                placeholder="€, $, FCFA, MAD..."
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono font-bold focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Taux de TVA par Défaut (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={taxRate}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono focus:border-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Seuil d'Alerte Stock Minimal Standard
              </label>
              <input
                type="number"
                min="1"
                value={alertStockMin}
                onChange={(e) => setAlertStockMin(parseInt(e.target.value, 10) || 5)}
                className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono focus:border-blue-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="mt-4 flex items-center space-x-2">
            <input
              type="checkbox"
              id="negStock"
              checked={allowNegativeStock}
              onChange={(e) => setAllowNegativeStock(e.target.checked)}
              className="rounded text-blue-600 w-4 h-4"
            />
            <label htmlFor="negStock" className="text-xs font-medium text-gray-700">
              Autoriser les stocks négatifs lors des ventes (déconseillé sauf autorisation super admin)
            </label>
          </div>

          <div className="mt-4">
            <label className="text-xs font-bold text-gray-700 block mb-1">
              Mention de Pied de Facture Commerciale
            </label>
            <input
              type="text"
              value={invoiceFooterNote}
              onChange={(e) => setInvoiceFooterNote(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {canManageSettings && (
          <div className="flex justify-end pt-3 border-t border-gray-100">
            <button
              type="submit"
              className="flex items-center space-x-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Enregistrer les Paramètres</span>
            </button>
          </div>
        )}
      </form>

      {/* Backup and Data Recovery Section (§18) */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2 pb-2 border-b border-gray-100">
          <Shield className="w-4 h-4 text-purple-600" />
          <span>Sauvegardes, Export &amp; Restauration des Données (§18)</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900">Exporter Sauvegarde Complète (JSON)</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Télécharge un dump structuré de tous les articles, mouvements, ventes, clients, dépenses et paramètres.
              </p>
            </div>
            <button
              type="button"
              onClick={handleDownloadBackup}
              className="mt-4 flex items-center justify-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Télécharger le Fichier JSON</span>
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-2xl border border-gray-200 flex flex-col justify-between">
            <div>
              <h4 className="text-xs font-bold text-gray-900">Restaurer depuis un Fichier JSON</h4>
              <p className="text-[11px] text-gray-500 mt-1">
                Charge une sauvegarde précédente sans perte d'intégrité référentielle.
              </p>
            </div>
            <label className="mt-4 flex items-center justify-center space-x-1.5 px-4 py-2 bg-white hover:bg-gray-100 text-gray-800 border border-gray-300 rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer">
              <Upload className="w-4 h-4" />
              <span>Importer un Fichier JSON</span>
              <input
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>
        </div>

        {importError && (
          <p className="text-xs text-red-600 font-semibold">{importError}</p>
        )}

        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-red-600">Réinitialisation des Données d'Usine</h4>
            <p className="text-[11px] text-gray-400">
              Rétablit les articles, utilisateurs de test et mouvements d'origine.
            </p>
          </div>
          <button
            type="button"
            onClick={handleResetData}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold border border-red-200 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
        </div>
      </div>

      {/* Create Enterprise Modal */}
      <CreateEnterpriseModal
        isOpen={showCreateEnterpriseModal}
        onClose={() => setShowCreateEnterpriseModal(false)}
      />
    </div>
  );
};

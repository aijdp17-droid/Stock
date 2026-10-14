import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  FileSpreadsheet,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Plus,
  Trash2,
  Database,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Tag,
  Check,
} from 'lucide-react';
import { GoogleSheetConnection, GoogleSheetTemplateType } from '../types';
import { GOOGLE_SHEET_TEMPLATES } from '../data/sheetTemplates';
import { CreateEnterpriseModal } from '../components/CreateEnterpriseModal';

export const GoogleSheetsView: React.FC = () => {
  const {
    sheetConnections,
    connectSheet,
    syncSheet,
    simulateSyncFailure,
    deleteSheetConnection,
    enterprises,
    currentEnterprise,
    currentEnterpriseId,
    switchEnterprise,
    linkSheetTemplateToCurrentEnterprise,
    products,
    categories,
    sales,
    stockMovements,
    customers,
    suppliers,
    expenses,
    auditLogs,
    hasPermission,
    currentUser,
  } = useApp();

  const [activeConnId, setActiveConnId] = useState<string>(
    sheetConnections.find((c) => c.enterpriseId === currentEnterpriseId)?.id || sheetConnections[0]?.id || ''
  );
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [copiedSheetName, setCopiedSheetName] = useState<string | null>(null);
  const [expandedTemplateId, setExpandedTemplateId] = useState<string | null>(null);

  // Modals
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [showCreateEnterpriseModal, setShowCreateEnterpriseModal] = useState(false);
  const [selectedInitialTemplate, setSelectedInitialTemplate] = useState<GoogleSheetTemplateType>('standard_erp');

  // New Connection Form
  const [newConnName, setNewConnName] = useState('');
  const [newSpreadsheetId, setNewSpreadsheetId] = useState('');
  const [newSpreadsheetName, setNewSpreadsheetName] = useState('');

  const currentConnection =
    sheetConnections.find((c) => c.enterpriseId === currentEnterpriseId) ||
    sheetConnections.find((c) => c.id === activeConnId) ||
    sheetConnections[0];

  const currentTemplate =
    GOOGLE_SHEET_TEMPLATES.find((t) => t.id === currentEnterprise?.sheetTemplateType) ||
    GOOGLE_SHEET_TEMPLATES[0];

  const canConnectSheets = hasPermission('connectSheets') || currentUser.role === 'super_admin';

  const handleSyncNow = async () => {
    if (!currentConnection) return;
    setIsSyncing(true);
    setSyncFeedback(null);

    await syncSheet(currentConnection.id);

    setIsSyncing(false);
    setSyncFeedback(
      `Synchronisation réussie avec Google Sheets (${new Date().toLocaleTimeString()}). Les tables du modèle ${currentTemplate.name} sont conformes.`
    );
    setTimeout(() => setSyncFeedback(null), 5000);
  };

  const copyHeadersToClipboard = (sheetKey: string, columns: string[]) => {
    const headerString = columns.join('\t');
    navigator.clipboard.writeText(headerString);
    setCopiedSheetName(sheetKey);
    setTimeout(() => setCopiedSheetName(null), 2500);
  };

  const handleSaveConnection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newConnName.trim() || !newSpreadsheetId.trim()) return;

    connectSheet({
      name: newConnName.trim(),
      spreadsheetId: newSpreadsheetId.trim(),
      spreadsheetName: newSpreadsheetName.trim() || 'Feuille_Gestion_Commerciale',
      status: 'connected',
      autoSync: true,
      enterpriseId: currentEnterpriseId,
      templateType: currentEnterprise.sheetTemplateType,
      mappedSheets: {
        products: currentTemplate.sheets.find((s) => s.key === 'products')?.name || 'Produits_Stock',
        categories: currentTemplate.sheets.find((s) => s.key === 'categories')?.name || 'Categories',
        stock: currentTemplate.sheets.find((s) => s.key === 'stock')?.name || 'Mouvements_Stock',
        sales: currentTemplate.sheets.find((s) => s.key === 'sales')?.name || 'Ventes_Factures',
        customers: currentTemplate.sheets.find((s) => s.key === 'customers')?.name || 'Clients',
        suppliers: currentTemplate.sheets.find((s) => s.key === 'suppliers')?.name || 'Fournisseurs',
        purchases: currentTemplate.sheets.find((s) => s.key === 'purchases')?.name || 'Achats_Approvisionnement',
        expenses: currentTemplate.sheets.find((s) => s.key === 'expenses')?.name || 'Depenses_Frais',
        users: 'Utilisateurs_Roles',
      },
    });

    setShowConnectModal(false);
  };

  const getDataCountForKey = (key: string): number => {
    switch (key) {
      case 'products':
        return products.length;
      case 'categories':
        return categories.length;
      case 'stock':
        return stockMovements.length;
      case 'sales':
        return sales.length;
      case 'customers':
        return customers.length;
      case 'suppliers':
        return suppliers.length;
      case 'expenses':
        return expenses.length;
      case 'audit':
        return auditLogs.length;
      default:
        return 0;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              Connexion &amp; Synchronisation Google Sheets
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Multi-Entreprises
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Liez votre entreprise à un type de Google Sheet spécialisé ou créez un nouveau compte commercial
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canConnectSheets && (
            <button
              onClick={() => {
                setSelectedInitialTemplate(currentEnterprise.sheetTemplateType || 'standard_erp');
                setShowCreateEnterpriseModal(true);
              }}
              className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-md shadow-blue-500/20 transition-all cursor-pointer"
            >
              <Building2 className="w-4 h-4" />
              <span>Créer une Nouvelle Entreprise</span>
            </button>
          )}

          {canConnectSheets && (
            <button
              onClick={() => {
                setNewConnName(`Classeur ${currentEnterprise.name}`);
                setNewSpreadsheetId(currentEnterprise.spreadsheetId || '1s8xK9Lm0Y...SheetID');
                setNewSpreadsheetName(currentEnterprise.spreadsheetName || 'Commerce_Stock_2026');
                setShowConnectModal(true);
              }}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Connecter un Classeur</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Enterprise & Current Google Sheet Connection Banner */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-blue-50 border border-emerald-200 rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-start space-x-4">
            <div className="w-13 h-13 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-600/20">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {currentEnterprise.name}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  {currentConnection ? 'Classeur Connecté' : 'Prêt à lier'}
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${currentTemplate.badgeColor}`}>
                  Modèle: {currentTemplate.name}
                </span>
              </div>

              <h3 className="text-base font-bold text-gray-900 mt-1.5">
                {currentConnection?.name || `Classeur ${currentEnterprise.spreadsheetName}`}
              </h3>
              <p className="text-xs text-gray-600 font-mono mt-0.5">
                ID Classeur Google: {currentEnterprise.spreadsheetId || currentConnection?.spreadsheetId || 'Non défini'}
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Dernière synchronisation : {currentConnection?.lastSyncAt || 'À l\'instant'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {currentEnterprise.sheetUrl && (
              <a
                href={currentEnterprise.sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs font-semibold shadow-2xs transition-all"
              >
                <ExternalLink className="w-3.5 h-3.5 text-gray-500" />
                <span>Ouvrir dans Google Sheets</span>
              </a>
            )}

            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{isSyncing ? 'Synchronisation...' : 'Synchroniser Maintenant'}</span>
            </button>

            <button
              onClick={() => currentConnection && simulateSyncFailure(currentConnection.id)}
              disabled={isSyncing || !currentConnection}
              className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
              title="Déclenche une simulation d'erreur pour tester les notifications et alertes d'échec"
            >
              <AlertCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Tester Échec</span>
            </button>
          </div>
        </div>

        {/* Sync Feedback Alert */}
        {syncFeedback && (
          <div className="mt-4 p-3 bg-emerald-600 text-white rounded-xl text-xs font-medium flex items-center space-x-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
        )}

        {/* Error State */}
        {currentConnection?.status === 'error' && (
          <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded-2xl flex items-start gap-3 text-red-900 animate-in fade-in">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="flex-1 text-xs">
              <p className="font-bold text-red-950">
                Attention : Échec de la dernière synchronisation Google Sheets détecté !
              </p>
              <p className="mt-0.5 text-red-800">
                {currentConnection.syncErrors[0] ||
                  "Une erreur réseau ou de permissions a empêché la mise à jour des feuilles. L'application reste utilisable localement."}
              </p>
            </div>
            <button
              onClick={handleSyncNow}
              className="px-3 py-1.5 bg-red-600 text-white text-xs font-semibold rounded-lg hover:bg-red-700 transition-colors cursor-pointer shrink-0"
            >
              Réessayer
            </button>
          </div>
        )}
      </div>

      {/* SECTION 1: SE LIER AVEC UN TYPE DE GOOGLE SHEET */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-base md:text-lg font-bold text-gray-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-600" />
              <span>Types &amp; Modèles de Google Sheets Disponibles</span>
            </h2>
            <p className="text-xs text-gray-500">
              Sélectionnez un type de Google Sheet pour adapter la structure de vos tables, ou créez directement une nouvelle entreprise avec ce modèle
            </p>
          </div>
          <span className="text-xs font-semibold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-xl self-start sm:self-auto">
            {GOOGLE_SHEET_TEMPLATES.length} Types Certifiés Prêts
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {GOOGLE_SHEET_TEMPLATES.map((tmpl) => {
            const isCurrentLinked = currentEnterprise.sheetTemplateType === tmpl.id;
            const isExpanded = expandedTemplateId === tmpl.id;

            return (
              <div
                key={tmpl.id}
                className={`bg-white rounded-2xl border-2 transition-all p-5 flex flex-col justify-between shadow-2xs ${
                  isCurrentLinked
                    ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/10'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-md border ${tmpl.badgeColor}`}>
                      {tmpl.sectorLabel}
                    </span>
                    {isCurrentLinked && (
                      <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1 bg-emerald-100 px-2 py-0.5 rounded-full">
                        <Check className="w-3.5 h-3.5" />
                        Actuel
                      </span>
                    )}
                  </div>

                  <h3 className="text-sm font-bold text-gray-900 leading-snug">{tmpl.name}</h3>
                  <p className="text-xs text-gray-600 mt-1.5 leading-relaxed">
                    {tmpl.description}
                  </p>

                  {/* Highlights */}
                  <div className="mt-3 space-y-1">
                    {tmpl.features.slice(0, 3).map((feat, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="line-clamp-1">{feat}</span>
                      </div>
                    ))}
                  </div>

                  {/* Expandable sheets details */}
                  {isExpanded && (
                    <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 animate-in fade-in">
                      <div className="text-[11px] font-bold text-gray-700">Feuilles incluses :</div>
                      <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                        {tmpl.sheets.map((s) => (
                          <div key={s.name} className="p-2 bg-gray-50 rounded-lg text-[10px]">
                            <div className="font-bold text-gray-800 font-mono flex items-center justify-between">
                              <span>{s.name}</span>
                              <button
                                onClick={() => copyHeadersToClipboard(s.key, s.columns)}
                                className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                title="Copier colonnes"
                              >
                                {copiedSheetName === s.key ? 'Copié !' : 'Copier'}
                              </button>
                            </div>
                            <div className="text-gray-500 mt-0.5">{s.desc}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-3 border-t border-gray-100 space-y-2">
                  <div className="flex items-center justify-between">
                    <button
                      onClick={() => setExpandedTemplateId(isExpanded ? null : tmpl.id)}
                      className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      <span>{isExpanded ? 'Masquer détails' : 'Voir les feuilles'}</span>
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    </button>
                    <span className="text-[11px] font-mono text-gray-400">
                      {tmpl.sheets.length} tables
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    {!isCurrentLinked && (
                      <button
                        onClick={() => linkSheetTemplateToCurrentEnterprise(tmpl.id)}
                        className="w-full py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold transition-colors cursor-pointer text-center"
                      >
                        Lier "{currentEnterprise.name}" à ce modèle
                      </button>
                    )}

                    <button
                      onClick={() => {
                        setSelectedInitialTemplate(tmpl.id);
                        setShowCreateEnterpriseModal(true);
                      }}
                      className="w-full flex items-center justify-center space-x-1.5 py-1.5 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Créer une entreprise avec ce modèle</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: GESTION DES ENTREPRISES & CLASSEURS LIÉS */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <span>Entreprises Enregistrées &amp; Classeurs Dédiés</span>
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Basculez d'un compte d'entreprise à un autre ou configurez leurs classeurs respectifs
            </p>
          </div>

          <button
            onClick={() => {
              setSelectedInitialTemplate('standard_erp');
              setShowCreateEnterpriseModal(true);
            }}
            className="flex items-center space-x-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Compte Entreprise</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {enterprises.map((ent) => {
            const isActive = ent.id === currentEnterpriseId;
            const matchedTmpl =
              GOOGLE_SHEET_TEMPLATES.find((t) => t.id === ent.sheetTemplateType) ||
              GOOGLE_SHEET_TEMPLATES[0];

            return (
              <div
                key={ent.id}
                className={`p-4 rounded-xl border-2 transition-all flex flex-col justify-between ${
                  isActive
                    ? 'border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-500/20'
                    : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                      {matchedTmpl.sectorLabel}
                    </span>
                    {isActive ? (
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        Espace Actif
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400">Inactif</span>
                    )}
                  </div>

                  <h4 className="text-sm font-bold text-gray-900">{ent.name}</h4>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">
                    Devise: {ent.settings.currency} • TVA: {ent.settings.taxRate}%
                  </p>
                  <p className="text-xs text-emerald-700 font-mono mt-1 truncate">
                    Classeur: {ent.spreadsheetName || 'Connecté'}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400 font-mono truncate max-w-[120px]">
                    {ent.sheetTemplateType}
                  </span>

                  {!isActive ? (
                    <button
                      onClick={() => switchEnterprise(ent.id)}
                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
                    >
                      Basculer
                    </button>
                  ) : (
                    <span className="text-xs font-bold text-indigo-600 flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      En cours
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* SECTION 3: MAPPAGE DES FEUILLES EN DIRECT POUR CE COMPTE */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <Database className="w-5 h-5 text-emerald-600" />
            <span>Feuilles Mappées en Temps Réel pour "{currentEnterprise.name}"</span>
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Schéma structuré pour le modèle « {currentTemplate.name} ». Cliquez sur « Copier les colonnes » pour générer vos en-têtes dans Google Sheets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentTemplate.sheets.map((sheet) => {
            const count = getDataCountForKey(sheet.key);
            const isCopied = copiedSheetName === sheet.key;

            return (
              <div
                key={sheet.name}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                      <h4 className="text-sm font-bold text-gray-900 font-mono">{sheet.name}</h4>
                    </div>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                      {count} enregistrements
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">{sheet.desc}</p>

                  <div className="mt-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-1">
                      En-têtes de colonnes ({sheet.columns.length}) :
                    </span>
                    <div className="flex flex-wrap gap-1 font-mono text-[10px] text-gray-600">
                      {sheet.columns.map((col, idx) => (
                        <span key={idx} className="bg-white px-1.5 py-0.5 rounded border border-gray-200">
                          {col}
                        </span>
                      ))}
                    </div>
                  </div>

                  {sheet.glideTips && (
                    <p className="text-[11px] text-emerald-800 bg-emerald-50/60 p-2 rounded-lg mt-2 font-medium">
                      Astuce Glide : {sheet.glideTips}
                    </p>
                  )}
                </div>

                <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                  <span className="text-[11px] text-gray-400">Glide Compatible</span>
                  <button
                    onClick={() => copyHeadersToClipboard(sheet.key, sheet.columns)}
                    className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                      isCopied
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-gray-100 hover:bg-emerald-50 text-gray-700 hover:text-emerald-700'
                    }`}
                  >
                    {isCopied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{isCopied ? 'Copié !' : 'Copier les colonnes'}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security and Best Practices (§5.3 & §21 Requirement) */}
      <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2 text-gray-900 font-bold text-sm">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <h4>Bonnes Pratiques Multi-Comptes &amp; Sécurité Google Sheets (§5.3 &amp; §21)</h4>
        </div>
        <ul className="text-xs text-gray-600 space-y-1.5 list-disc pl-5">
          <li>
            <strong className="text-gray-900">Isolation par Entreprise :</strong> Chaque compte d'entreprise conserve son propre identifiant de classeur et ses paramètres sans interférence avec les autres entités commerciales.
          </li>
          <li>
            <strong className="text-gray-900">Identifiants uniques :</strong> Chaque produit, vente ou mouvement possède un ID immuable (ex: VTE-2026-001) garantissant l'absence de doublons lors des synchronisations.
          </li>
          <li>
            <strong className="text-gray-900">Modèles Spécialisés :</strong> Chaque modèle de Google Sheet intègre des colonnes métier adaptées (taille/couleur pour la mode, numéros de série pour l'informatique, DLC pour l'alimentaire, tarifs de gros pour la distribution).
          </li>
        </ul>
      </div>

      {/* Connect Sheet Modal */}
      {showConnectModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">Connecter un Fichier Google Sheets</h3>
              <button
                onClick={() => setShowConnectModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveConnection} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nom d'affichage de la connexion *
                </label>
                <input
                  type="text"
                  required
                  value={newConnName}
                  onChange={(e) => setNewConnName(e.target.value)}
                  placeholder="ex: Google Sheets Principal 2026"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  ID du Fichier Google Sheets (Spreadsheet ID) *
                </label>
                <input
                  type="text"
                  required
                  value={newSpreadsheetId}
                  onChange={(e) => setNewSpreadsheetId(e.target.value)}
                  placeholder="1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 font-mono focus:outline-hidden focus:border-blue-500"
                />
                <p className="text-[10px] text-gray-400 mt-1">
                  Présent dans l'URL: docs.google.com/spreadsheets/d/<strong>ID_ICI</strong>/edit
                </p>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Titre du Document
                </label>
                <input
                  type="text"
                  value={newSpreadsheetName}
                  onChange={(e) => setNewSpreadsheetName(e.target.value)}
                  placeholder="Gestion_Commerciale_Nexus"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowConnectModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Valider la Connexion
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Enterprise Modal */}
      <CreateEnterpriseModal
        isOpen={showCreateEnterpriseModal}
        onClose={() => setShowCreateEnterpriseModal(false)}
        initialTemplateType={selectedInitialTemplate}
      />
    </div>
  );
};

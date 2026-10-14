import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Building2,
  FileSpreadsheet,
  X,
  CheckCircle2,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
  DollarSign,
  Globe,
  MapPin,
  Phone,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { BusinessSectorType, GoogleSheetTemplateType } from '../types';
import { GOOGLE_SHEET_TEMPLATES } from '../data/sheetTemplates';

interface CreateEnterpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTemplateType?: GoogleSheetTemplateType;
  onEnterpriseCreated?: (enterpriseId: string) => void;
}

export const CreateEnterpriseModal: React.FC<CreateEnterpriseModalProps> = ({
  isOpen,
  onClose,
  initialTemplateType = 'standard_erp',
  onEnterpriseCreated,
}) => {
  const { createEnterprise, currentUser } = useApp();

  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Form State
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [sector, setSector] = useState<BusinessSectorType>('general_commerce');
  const [sheetTemplateType, setSheetTemplateType] = useState<GoogleSheetTemplateType>(initialTemplateType);
  const [currency, setCurrency] = useState('€');
  const [taxRate, setTaxRate] = useState<number>(20);
  const [phone, setPhone] = useState('+33 1 40 00 00 00');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('10 Rue du Commerce, 75001 Paris');
  const [siretOrNif, setSiretOrNif] = useState('');
  const [ownerName, setOwnerName] = useState(currentUser?.name || '');
  const [ownerEmail, setOwnerEmail] = useState(currentUser?.email || '');

  // Google Sheets Parameters
  const [spreadsheetName, setSpreadsheetName] = useState('');
  const [spreadsheetId, setSpreadsheetId] = useState('');
  const [sheetUrl, setSheetUrl] = useState('');
  const [seedSampleData, setSeedSampleData] = useState(true);

  if (!isOpen) return null;

  const selectedTemplate =
    GOOGLE_SHEET_TEMPLATES.find((t) => t.id === sheetTemplateType) || GOOGLE_SHEET_TEMPLATES[0];

  const handleSelectTemplate = (templateId: GoogleSheetTemplateType) => {
    setSheetTemplateType(templateId);
    const tmpl = GOOGLE_SHEET_TEMPLATES.find((t) => t.id === templateId);
    if (tmpl) {
      setSector(tmpl.sector);
      if (!spreadsheetName || spreadsheetName.includes('2026')) {
        setSpreadsheetName(tmpl.defaultSpreadsheetName);
      }
    }
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newEnt = createEnterprise({
      name: name.trim(),
      sector,
      sheetTemplateType,
      spreadsheetId: spreadsheetId.trim() || undefined,
      spreadsheetName: spreadsheetName.trim() || undefined,
      sheetUrl: sheetUrl.trim() || undefined,
      settings: {
        tagline: tagline.trim() || `Espace commercial - ${selectedTemplate.sectorLabel}`,
        phone: phone.trim(),
        email: email.trim() || ownerEmail.trim(),
        address: address.trim(),
        siretOrNif: siretOrNif.trim(),
        currency: currency.trim() || '€',
        taxRate: Number(taxRate) || 20,
      },
      ownerName: ownerName.trim() || currentUser.name,
      ownerEmail: ownerEmail.trim() || currentUser.email,
      seedSampleData,
    });

    onClose();
    if (onEnterpriseCreated) {
      onEnterpriseCreated(newEnt.id);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-indigo-50/30 to-purple-50/40">
          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/25">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Créer une Nouvelle Entreprise
                </h2>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  Nouveau Compte
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                Initialisez une nouvelle entité commerciale et liez-la directement au type de Google Sheet adapté
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Steps Tab Indicators */}
        <div className="flex border-b border-gray-200 bg-gray-50/80 px-6 py-2.5 text-xs font-semibold gap-3 sm:gap-6 overflow-x-auto">
          <button
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
              step === 1 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}>1</span>
            <span>Identité &amp; Coordonnées</span>
          </button>

          <button
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
              step === 2 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}>2</span>
            <span>Type de Google Sheet</span>
          </button>

          <button
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 pb-1 border-b-2 transition-all cursor-pointer ${
              step === 3 ? 'border-blue-600 text-blue-700' : 'border-transparent text-gray-500 hover:text-gray-900'
            }`}
          >
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 3 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}>3</span>
            <span>Connexion du Classeur</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* STEP 1: IDENTITE */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                <div className="text-xs text-blue-900 leading-relaxed">
                  Chaque entreprise possède son propre profil, ses paramètres fiscaux, ses devises, ses stocks et sa feuille de calcul Google Sheets synchronisée.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nom de l'entreprise *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Aura Fashion Boutique, TechPulse Distri, Supermarché Étoile..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Slogan ou activité principale
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Prêt-à-porter & Accessoires de luxe / Importateur Informatique..."
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Devise Monétaire
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm bg-white"
                  >
                    <option value="€">Euro (€)</option>
                    <option value="$">Dollar US ($)</option>
                    <option value="FCFA">Franc CFA (FCFA)</option>
                    <option value="CHF">Franc Suisse (CHF)</option>
                    <option value="£">Livre Sterling (£)</option>
                    <option value="MAD">Dirham Marocain (MAD)</option>
                    <option value="DZD">Dinar Algérien (DZD)</option>
                    <option value="TND">Dinar Tunisien (TND)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Taux de TVA par défaut (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.5"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Téléphone Professionnel
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Email de Contact Commercial
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      placeholder="contact@monentreprise.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Adresse physique / Showroom
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Identifiant Légal (SIRET / RC / NIF)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: SIRET 849 203 118 00024 ou RC 12345/2026"
                    value={siretOrNif}
                    onChange={(e) => setSiretOrNif(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: TYPE DE GOOGLE SHEET */}
          {step === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-900">
                  Choisissez le modèle de Google Sheet adapté à votre activité
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Chaque type intègre une structure de tables pré-formatée pour votre secteur, prête pour Glide et Google Drive.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                {GOOGLE_SHEET_TEMPLATES.map((tmpl) => {
                  const isSelected = sheetTemplateType === tmpl.id;
                  return (
                    <div
                      key={tmpl.id}
                      onClick={() => handleSelectTemplate(tmpl.id)}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer text-left relative flex flex-col justify-between ${
                        isSelected
                          ? 'border-blue-600 bg-blue-50/40 shadow-sm ring-1 ring-blue-600/30'
                          : 'border-gray-200 hover:border-gray-300 bg-white hover:bg-slate-50/50'
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${tmpl.badgeColor}`}
                          >
                            {tmpl.sectorLabel}
                          </span>
                          {isSelected && (
                            <span className="flex items-center gap-1 text-xs font-bold text-blue-600">
                              <CheckCircle2 className="w-4 h-4 fill-blue-600 text-white" />
                              Sélectionné
                            </span>
                          )}
                        </div>

                        <h4 className="text-sm font-bold text-gray-900">{tmpl.name}</h4>
                        <p className="text-xs text-gray-600 mt-1 line-clamp-2 leading-relaxed">
                          {tmpl.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-3 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                        <span className="font-semibold text-gray-700">
                          {tmpl.sheets.length} feuilles pré-configurées
                        </span>
                        <span className="font-mono text-gray-500">{tmpl.tag}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Selected Template Details Box */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                  <span>Feuilles incluses dans ce type :</span>
                </div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {selectedTemplate.sheets.map((sheet) => (
                    <span
                      key={sheet.name}
                      className="px-2 py-1 rounded-lg bg-white border border-slate-200 text-[11px] font-mono text-slate-700 shadow-2xs"
                    >
                      {sheet.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CONNEXION CLASSEUR & VALIDATION */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 flex items-start gap-3">
                <FileSpreadsheet className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
                <div className="text-xs text-emerald-950">
                  <p className="font-bold">Liaison Google Sheets automatique pour "{name || 'Votre Entreprise'}"</p>
                  <p className="mt-0.5 text-emerald-800">
                    Modèle sélectionné : <span className="font-semibold">{selectedTemplate.name}</span>. Vous pouvez renseigner l'ID de votre classeur ou utiliser l'identifiant généré automatiquement.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Nom du classeur Google Sheets
                  </label>
                  <input
                    type="text"
                    value={spreadsheetName || `${name.replace(/\s+/g, '_') || 'Commerce'}_${selectedTemplate.defaultSpreadsheetName}`}
                    onChange={(e) => setSpreadsheetName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    ID du Classeur Google Sheets (Spreadsheet ID)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={`1s8xK9Lm0Y... (Laissez vide pour générer un ID certifié)`}
                      value={spreadsheetId}
                      onChange={(e) => setSpreadsheetId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                    />
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1">
                    Visible dans l'URL de votre Google Sheet : https://docs.google.com/spreadsheets/d/<strong>[ID]</strong>/edit
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    URL Google Sheets (Optionnel)
                  </label>
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-sm font-mono"
                  />
                </div>

                {/* Seed Sample Catalog */}
                <div className="p-4 rounded-2xl border border-gray-200 bg-slate-50/80 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="seedSampleData"
                    checked={seedSampleData}
                    onChange={(e) => setSeedSampleData(e.target.checked)}
                    className="mt-1 w-4 h-4 text-blue-600 rounded-sm border-gray-300 focus:ring-blue-500 cursor-pointer"
                  />
                  <label htmlFor="seedSampleData" className="text-xs cursor-pointer">
                    <span className="font-bold text-gray-900 block">
                      Générer des produits et catégories d'exemple pour {selectedTemplate.sectorLabel}
                    </span>
                    <span className="text-gray-500 block mt-0.5">
                      Pré-remplit l'espace de démonstration avec 3 articles et catégories certifiés pour ce secteur afin de tester immédiatement les ventes, stocks et factures.
                    </span>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 sm:p-5 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
          <div>
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep((s) => (s - 1) as any)}
                className="px-4 py-2 text-xs font-semibold text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Retour
              </button>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>

            {step < 3 ? (
              <button
                type="button"
                disabled={step === 1 && !name.trim()}
                onClick={() => setStep((s) => (s + 1) as any)}
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <span>Étape Suivante</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                disabled={!name.trim()}
                onClick={handleCreate}
                className="flex items-center space-x-1.5 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-4 h-4" />
                <span>Créer l'Entreprise &amp; Lier le Google Sheet</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  X,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  Building2,
  Share2,
  Unlink,
} from 'lucide-react';

interface LinkFacebookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LinkFacebookModal: React.FC<LinkFacebookModalProps> = ({ isOpen, onClose }) => {
  const { currentEnterprise, companySettings, linkFacebookPageToCurrentEnterprise, updateCompanySettings } = useApp();

  const [facebookUrl, setFacebookUrl] = useState('');
  const [facebookPageName, setFacebookPageName] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFacebookUrl(currentEnterprise.facebookPageUrl || companySettings.facebookPageUrl || '');
      setFacebookPageName(currentEnterprise.facebookPageName || companySettings.facebookPageName || '');
      setSavedSuccess(false);
    }
  }, [isOpen, currentEnterprise, companySettings]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!facebookUrl.trim()) return;

    let cleanUrl = facebookUrl.trim();
    if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
      cleanUrl = `https://${cleanUrl}`;
    }

    const cleanName = facebookPageName.trim() || `${currentEnterprise.name} - Page Officielle`;
    linkFacebookPageToCurrentEnterprise(cleanUrl, cleanName);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  const handleUnlink = () => {
    if (confirm(`Dissocier la page Facebook de l'entreprise "${currentEnterprise.name}" ?`)) {
      updateCompanySettings({
        facebookPageUrl: '',
        facebookPageName: '',
      });
      setFacebookUrl('');
      setFacebookPageName('');
      onClose();
    }
  };

  const isAlreadyLinked = Boolean(currentEnterprise.facebookPageUrl || companySettings.facebookPageUrl);

  return (
    <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-gray-100 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-blue-600 to-[#1877F2] text-white">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-xs text-white flex items-center justify-center shadow-inner">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                Lier l'Entreprise à une Page Facebook
              </h2>
              <p className="text-xs text-blue-100">
                Entreprise active : <strong className="text-white underline">{currentEnterprise.name}</strong>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {savedSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Page Facebook associée avec succès à l'entreprise !</span>
            </div>
          )}

          {/* Current Status Badge */}
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span className="text-gray-700 font-semibold">{currentEnterprise.name}</span>
            </div>
            {isAlreadyLinked ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-100 text-[#1877F2]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#1877F2] animate-pulse"></span>
                Page Facebook Liée
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-amber-100 text-amber-800">
                <AlertCircle className="w-3.5 h-3.5" />
                Non reliée
              </span>
            )}
          </div>

          {/* Facebook URL Input */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              URL complète de la Page Facebook *
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#1877F2]">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </div>
              <input
                type="text"
                required
                placeholder="https://www.facebook.com/ma-page-entreprise"
                value={facebookUrl}
                onChange={(e) => setFacebookUrl(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] text-xs font-medium font-mono"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Copiez l'adresse web de votre page publique ou boutique Facebook.
            </p>
          </div>

          {/* Facebook Display Name Input */}
          <div>
            <label className="block text-xs font-bold text-gray-800 mb-1.5">
              Nom d'affichage pour les boutons du catalogue
            </label>
            <input
              type="text"
              placeholder={`Ex: ${currentEnterprise.name} Officiel`}
              value={facebookPageName}
              onChange={(e) => setFacebookPageName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-gray-300 focus:outline-hidden focus:ring-2 focus:ring-[#1877F2]/20 focus:border-[#1877F2] text-xs"
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Ce libellé apparaîtra sur les boutons du catalogue public et dans la vitrine.
            </p>
          </div>

          {/* Quick Preview & Test Button */}
          {facebookUrl && (
            <div className="p-3 bg-blue-50/80 rounded-2xl border border-blue-200 flex items-center justify-between">
              <div className="text-xs">
                <span className="font-bold text-blue-900 block">Aperçu du bouton catalogue :</span>
                <div className="mt-1.5 inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1877F2] text-white rounded-lg text-xs font-bold shadow-xs">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                  <span>{facebookPageName || 'Page Facebook'}</span>
                </div>
              </div>
              <a
                href={facebookUrl.startsWith('http') ? facebookUrl : `https://${facebookUrl}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 text-xs font-bold text-blue-700 hover:text-blue-900 bg-white px-3 py-2 rounded-xl border border-blue-200 hover:border-blue-300 shadow-2xs"
              >
                <span>Tester le lien</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}

          {/* Social Commerce Info Card */}
          <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold">Effet sur le Catalogue :</p>
              <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                Une fois liée, un bouton Facebook apparaît en haut du catalogue public, ainsi que sur chaque fiche article pour permettre le partage ou la commande directe via votre Page Facebook.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            {isAlreadyLinked ? (
              <button
                type="button"
                onClick={handleUnlink}
                className="flex items-center space-x-1 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Dissocier</span>
              </button>
            ) : (
              <div></div>
            )}

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="flex items-center space-x-1.5 px-5 py-2.5 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/25 transition-all cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>Enregistrer &amp; Lier la Page</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

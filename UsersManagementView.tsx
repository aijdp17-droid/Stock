import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  UserCog,
  Plus,
  Shield,
  Check,
  X,
  Edit,
  Power,
  LogIn,
  KeyRound,
  UserCheck,
  Lock,
} from 'lucide-react';
import { User, UserRole, UserPermissions } from '../types';
import { DEFAULT_ROLE_PERMISSIONS } from '../data/initialData';

export const UsersManagementView: React.FC = () => {
  const {
    users,
    addUser,
    updateUser,
    toggleUserStatus,
    currentUser,
    switchUser,
    hasPermission,
  } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);

  // Form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('seller');
  const [title, setTitle] = useState('');
  const [customPerms, setCustomPerms] = useState<Partial<UserPermissions>>({});

  const canManageUsers = hasPermission('manageUsers') || currentUser.role === 'super_admin';

  const roleLabels: Record<UserRole, { label: string; color: string; desc: string }> = {
    super_admin: {
      label: 'Super Administrateur',
      color: 'bg-purple-100 text-purple-800 border-purple-200',
      desc: 'Accès intégral et souverain sur l\'ensemble du logiciel et des paramètres',
    },
    admin: {
      label: 'Administrateur',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: 'Gestion des produits, stocks, ventes et utilisateurs délégués',
    },
    moderator: {
      label: 'Modérateur / Gest. Commercial',
      color: 'bg-teal-100 text-teal-800 border-teal-200',
      desc: 'Gestion des fiches produits, catégories, clients et ventes autorisées',
    },
    seller: {
      label: 'Vendeur Comptoir',
      color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      desc: 'Enregistrement des ventes, vérification des stocks, catalogue sans données financières',
    },
    stock_manager: {
      label: 'Gestionnaire de Stock',
      color: 'bg-amber-100 text-amber-800 border-amber-200',
      desc: 'Entrées, sorties, pertes et ajustements obligatoirement justifiés',
    },
    accountant: {
      label: 'Comptable',
      color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
      desc: 'Consultation financière, dépenses, créances, factures et exports',
    },
    custom: {
      label: 'Rôle Personnalisé',
      color: 'bg-gray-100 text-gray-800 border-gray-200',
      desc: 'Combinaison de permissions configurées sur mesure',
    },
  };

  const permissionDescriptions: Record<keyof UserPermissions, string> = {
    viewProducts: 'Consulter le catalogue',
    recordSale: 'Enregistrer des ventes (Caisse)',
    cancelSale: 'Annuler des ventes validées',
    addProduct: 'Créer / éditer des produits',
    editPrices: 'Modifier les prix & coûts d\'achat',
    manageStock: 'Gérer les mouvements de stock',
    viewFinancials: 'Consulter les rapports financiers & marges',
    manageCategories: 'Gérer les catégories de produits',
    managePurchases: 'Créer / réceptionner les achats',
    manageExpenses: 'Enregistrer des dépenses',
    manageUsers: 'Gérer les comptes utilisateurs',
    connectSheets: 'Connecter / configurer Google Sheets',
    manageSettings: 'Modifier les paramètres d\'entreprise',
    deleteData: 'Supprimer des données irréversiblement',
    applyDiscounts: 'Accorder des remises commerciales',
  };

  const openCreateModal = () => {
    setEditingUserId(null);
    setName('');
    setEmail('');
    setRole('seller');
    setTitle('Vendeur en boutique');
    setCustomPerms({});
    setShowAddModal(true);
  };

  const openEditModal = (u: User) => {
    setEditingUserId(u.id);
    setName(u.name);
    setEmail(u.email);
    setRole(u.role);
    setTitle(u.title || '');
    setCustomPerms(u.customPermissions || {});
    setShowAddModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;

    if (editingUserId) {
      updateUser(editingUserId, {
        name: name.trim(),
        email: email.trim(),
        role,
        title: title.trim(),
        customPermissions: role === 'custom' ? customPerms : undefined,
      });
    } else {
      addUser({
        name: name.trim(),
        email: email.trim(),
        role,
        title: title.trim(),
        active: true,
        avatar: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 99999999)}?w=150&auto=format&fit=crop&q=80`,
        customPermissions: role === 'custom' ? customPerms : undefined,
      });
    }

    setShowAddModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            Gestion des Utilisateurs &amp; Niveaux d'Accès (RBAC)
          </h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Sécurité granulaire, attribution des rôles et contrôle des permissions (§6 &amp; §16)
          </p>
        </div>

        {canManageUsers && (
          <button
            onClick={openCreateModal}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Créer un Utilisateur</span>
          </button>
        )}
      </div>

      {/* Users Directory Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {users.map((u) => {
          const isCurrent = u.id === currentUser.id;
          const roleInfo = roleLabels[u.role] || roleLabels.custom;

          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs transition-all flex flex-col justify-between ${
                isCurrent ? 'border-blue-400 ring-2 ring-blue-500/10' : 'border-gray-200 hover:border-gray-300'
              } ${!u.active ? 'opacity-60 bg-gray-50' : ''}`}
            >
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center space-x-3">
                    <img
                      src={u.avatar}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover border border-gray-200"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-gray-900 flex items-center gap-1.5">
                        <span>{u.name}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded-md">
                            (Vous)
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-gray-500 truncate max-w-[170px]">{u.email}</p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${roleInfo.color}`}
                  >
                    {roleInfo.label}
                  </span>
                </div>

                <div className="mt-3 text-xs text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-100">
                  <span className="font-semibold block text-[11px] text-gray-700">
                    {u.title || 'Collaborateur commercial'}
                  </span>
                  <span className="text-[10px] text-gray-400">Dernière activité: {u.lastLogin || 'N/A'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                {/* 1-Click Test Login (§22 Test Requirement) */}
                <button
                  onClick={() => switchUser(u.id)}
                  disabled={isCurrent || !u.active}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                  }`}
                  title="Basculer instantanément sur cette session pour tester ses droits"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{isCurrent ? 'Session Active' : 'Tester ce Rôle'}</span>
                </button>

                {canManageUsers && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(u)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Modifier les autorisations"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    {u.role !== 'super_admin' && (
                      <button
                        onClick={() => toggleUserStatus(u.id)}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          u.active
                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50'
                            : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.active ? 'Désactiver le compte' : 'Activer le compte'}
                      >
                        <Power className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Indicative Permissions Matrix (§6.8 of Specifications) */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/70">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Matrice Officielle des Permissions par Rôle (§6.8)
              </h3>
              <p className="text-xs text-gray-500">
                Tableau de conformité des privilèges d'accès aux fonctions et aux données
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
              Enforced Security
            </span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-4">Fonctionnalité Commerciale</th>
                <th className="py-3 px-3 text-center">Super Admin</th>
                <th className="py-3 px-3 text-center">Admin</th>
                <th className="py-3 px-3 text-center">Modérateur</th>
                <th className="py-3 px-3 text-center">Vendeur</th>
                <th className="py-3 px-3 text-center">Stock</th>
                <th className="py-3 px-3 text-center">Comptable</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {Object.entries(permissionDescriptions).map(([key, label]) => {
                const permKey = key as keyof UserPermissions;
                return (
                  <tr key={key} className="hover:bg-gray-50/70">
                    <td className="py-2.5 px-4 font-medium text-gray-900">{label}</td>
                    {(['super_admin', 'admin', 'moderator', 'seller', 'stock_manager', 'accountant'] as UserRole[]).map(
                      (r) => {
                        const allowed = DEFAULT_ROLE_PERMISSIONS[r][permKey];
                        return (
                          <td key={r} className="py-2.5 px-3 text-center">
                            {allowed ? (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-emerald-100 text-emerald-700">
                                <Check className="w-3.5 h-3.5" />
                              </span>
                            ) : (
                              <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-gray-100 text-gray-400">
                                <X className="w-3 h-3" />
                              </span>
                            )}
                          </td>
                        );
                      }
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 border border-gray-200 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingUserId ? 'Modifier l\'Utilisateur' : 'Créer un Compte Collaborateur'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Nom et Prénom *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Patrick Martin"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Adresse E-mail professionnelle *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="p.martin@nexuscommercial.fr"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Intitulé du Poste / Fonction
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="ex: Responsable Caisse Principale"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Rôle &amp; Profil d'Accès *
                </label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                >
                  <option value="super_admin">Super Administrateur (Tous droits)</option>
                  <option value="admin">Administrateur</option>
                  <option value="moderator">Modérateur / Gestionnaire Commercial</option>
                  <option value="seller">Vendeur (Caisse &amp; consultation)</option>
                  <option value="stock_manager">Gestionnaire de Stock</option>
                  <option value="accountant">Comptable (Finances &amp; Rapports)</option>
                  <option value="custom">Rôle Personnalisé sur mesure</option>
                </select>
                <p className="text-[11px] text-gray-500 mt-1">{roleLabels[role]?.desc}</p>
              </div>

              {/* Custom Permissions Checkboxes if role === 'custom' */}
              {role === 'custom' && (
                <div className="pt-2 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-800 block mb-2">
                    Personnaliser les autorisations :
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {Object.entries(permissionDescriptions).map(([key, label]) => {
                      const permKey = key as keyof UserPermissions;
                      const isChecked = !!customPerms[permKey];
                      return (
                        <label
                          key={key}
                          className="flex items-center space-x-2 p-1.5 rounded-lg hover:bg-gray-50 border border-gray-100 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) =>
                              setCustomPerms({ ...customPerms, [permKey]: e.target.checked })
                            }
                            className="rounded-sm text-blue-600 w-3.5 h-3.5"
                          />
                          <span className="text-gray-700 text-[11px]">{label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-xs text-gray-600 hover:bg-gray-100 rounded-xl"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl"
                >
                  Enregistrer le Profil
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

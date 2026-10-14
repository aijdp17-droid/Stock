import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Layers, Plus, Edit, Trash2, Package, X, CheckCircle } from 'lucide-react';
import { Category } from '../types';

export const CategoriesView: React.FC = () => {
  const { categories, addCategory, updateCategory, deleteCategory, products, hasPermission } = useApp();

  const [showModal, setShowModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [active, setActive] = useState(true);

  const canManageCategories = hasPermission('manageCategories');

  const openAddModal = () => {
    setEditingCatId(null);
    setName('');
    setDescription('');
    setActive(true);
    setShowModal(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCatId(cat.id);
    setName(cat.name);
    setDescription(cat.description);
    setActive(cat.active);
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCatId) {
      updateCategory(editingCatId, {
        name: name.trim(),
        description: description.trim(),
        active,
      });
    } else {
      addCategory({
        name: name.trim(),
        description: description.trim(),
        iconName: 'Package',
        active,
      });
    }

    setShowModal(false);
  };

  const handleDelete = (id: string, catName: string) => {
    const count = products.filter((p) => p.categoryId === id).length;
    if (count > 0) {
      alert(`Impossible de supprimer cette catégorie car elle contient ${count} produit(s).`);
      return;
    }
    if (confirm(`Voulez-vous supprimer la catégorie "${catName}" ?`)) {
      deleteCategory(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-200 shadow-xs">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">Catégories de Produits</h1>
          <p className="text-xs md:text-sm text-gray-500 mt-0.5">
            Organisation du catalogue, classement des articles et visibilité sur la vitrine
          </p>
        </div>

        {canManageCategories && (
          <button
            onClick={openAddModal}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs md:text-sm font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Catégorie</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const productCount = products.filter((p) => p.categoryId === cat.id).length;
          return (
            <div
              key={cat.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs hover:border-blue-200 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Layers className="w-5 h-5" />
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      cat.active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {cat.active ? 'Active' : 'Désactivée'}
                  </span>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-3">{cat.name}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                  {cat.description || 'Aucune description spécifique renseignée.'}
                </p>
              </div>

              <div className="pt-4 mt-4 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5">
                  <Package className="w-3.5 h-3.5 text-gray-400" />
                  {productCount} produit(s)
                </span>

                {canManageCategories && (
                  <div className="flex items-center space-x-1">
                    <button
                      onClick={() => openEditModal(cat)}
                      className="p-1.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id, cat.name)}
                      className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 bg-gray-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-gray-200 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-base font-bold text-gray-900">
                {editingCatId ? 'Modifier la Catégorie' : 'Ajouter une Catégorie'}
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
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="ex: Accessoires Téléphonie"
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brève description de la gamme..."
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200 focus:outline-hidden focus:border-blue-500"
                />
              </div>

              <div className="flex items-center space-x-2 pt-2">
                <input
                  type="checkbox"
                  id="catActive"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="w-4 h-4 text-blue-600 rounded-md"
                />
                <label htmlFor="catActive" className="text-xs font-medium text-gray-700">
                  Catégorie active (visible dans les filtres et sur la vitrine)
                </label>
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
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

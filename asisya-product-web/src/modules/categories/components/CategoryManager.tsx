import React, { useState, useEffect } from 'react';
import { categoryService } from '../services/category.service';
import type { CategoryResponseDto, CreateCategoryDto } from '../dtos/category.dto';

export const CategoryManager: React.FC = () => {
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);

  const [formData, setFormData] = useState<CreateCategoryDto>({
    categoryName: '',
    description: '',
    base64Picture: ''
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedCategoryId(null);
    setFormData({ categoryName: '', description: '', base64Picture: '' });
    setShowModal(true);
  };

  const handleOpenEdit = (category: CategoryResponseDto) => {
    setIsEditing(true);
    setSelectedCategoryId(category.categoryID);
    setFormData({
      categoryName: category.categoryName,
      description: category.description || '',
      base64Picture: category.base64Picture || ''
    });
    setShowModal(true);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = (reader.result as string).split(',')[1];
        setFormData(prev => ({ ...prev, base64Picture: base64String }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedCategoryId) {
        await categoryService.update(selectedCategoryId, formData);
      } else {
        await categoryService.create(formData);
      }
      setShowModal(false);
      fetchCategories();
    } catch (err) {
      alert('Error al guardar la categoría.');
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de eliminar esta categoría?')) {
      try {
        await categoryService.delete(id);
        fetchCategories();
      } catch (err) {
        alert('Error al eliminar la categoría.');
      }
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-bold text-gray-800">Administración de Categorías</h2>
        <button
          onClick={handleOpenCreate}
          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
        >
          + Nueva Categoría
        </button>
      </div>

      {loading ? (
        <div className="text-center py-8 text-gray-500">Cargando categorías...</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Nombre</th>
                <th className="py-3 px-4">Descripción</th>
                <th className="py-3 px-4">Imagen</th>
                <th className="py-3 px-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y text-sm text-gray-700">
              {categories.map((c) => (
                <tr key={c.categoryID} className="hover:bg-gray-50">
                  <td className="py-3 px-4">{c.categoryID}</td>
                  <td className="py-3 px-4 font-medium text-gray-900">{c.categoryName}</td>
                  <td className="py-3 px-4">{c.description || 'Sin descripción'}</td>
                  <td className="py-3 px-4">{c.base64Picture ? (
  <img
    src={`data:image/webp;base64,${c.base64Picture}`}
    alt={c.categoryName}
    className="w-12 h-12 object-cover rounded-md"
  />
) : (
  <span>Sin imagen</span>
)}</td>
                  <td className="py-3 px-4 text-center space-x-2">
                    <button
                      onClick={() => handleOpenEdit(c)}
                      className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200"
                    >
                      Editar
                    </button>
                    <button
                      onClick={() => handleDelete(c.categoryID)}
                      className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h3 className="text-lg font-bold mb-4 text-gray-800">
              {isEditing ? 'Editar Categoría' : 'Crear Categoría'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Descripción</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Imagen (Opcional)</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="mt-1 block w-full text-xs text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border rounded-md text-sm text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                >
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
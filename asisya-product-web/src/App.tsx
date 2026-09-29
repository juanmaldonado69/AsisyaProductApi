import React, { useState, useEffect } from 'react';
import axiosClient from './api/axiosClient';
import { Login } from './modules/auth/components/Login';
import { CategoryManager } from './modules/categories/components/CategoryManager';
import { productService } from './modules/products/services/product.service';
import { categoryService } from './modules/categories/services/category.service';

import type { ProductResponseDto, CreateProductDto } from './modules/products/dtos/product.dto';
import type { CategoryResponseDto } from './modules/categories/dtos/category.dto';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  const [products, setProducts] = useState<ProductResponseDto[]>([]);
  const [categories, setCategories] = useState<CategoryResponseDto[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [pageSize] = useState<number>(10);
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  // Estado para la cantidad de registros en Carga Masiva
  const [bulkCount, setBulkCount] = useState<number>(10);
  const [isBulkLoading, setIsBulkLoading] = useState<boolean>(false);

  // Estados para Modal de Crear/Editar
  const [showModal, setShowModal] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null);

  // Estados para Modal de Detalle
  const [productDetail, setProductDetail] = useState<ProductResponseDto | null>(null);

  // Estado del Formulario
  const [formData, setFormData] = useState<CreateProductDto>({
    productName: '',
    categoryID: 1,
    unitPrice: 0,
    unitsInStock: 0,
    quantityPerUnit: '1 unit'
  });

  const fetchProducts = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await productService.getAll(search, pageNumber, pageSize);
      setProducts(data.items);
      setTotalCount(data.totalCount);
    } catch (err) {
      console.error('Error al cargar productos:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    if (!isAuthenticated) return;
    try {
      const data = await categoryService.getAll();
      setCategories(data);
      if (data.length > 0) {
        setFormData((prev) => ({ ...prev, categoryID: data[0].categoryID }));
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      fetchCategories();
    }
  }, [isAuthenticated, pageNumber, search]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  const handleOpenCreate = () => {
    setIsEditing(false);
    setSelectedProductId(null);
    setFormData({
      productName: '',
      categoryID: categories.length > 0 ? categories[0].categoryID : 1,
      unitPrice: 0,
      unitsInStock: 0,
      quantityPerUnit: '1 unit'
    });
    setShowModal(true);
  };

  const handleOpenEdit = (product: ProductResponseDto) => {
    setIsEditing(true);
    setSelectedProductId(product.productID);
    setFormData({
      productName: product.productName,
      categoryID: product.categoryID,
      unitPrice: product.unitPrice,
      unitsInStock: product.unitsInStock,
      quantityPerUnit: '1 unit'
    });
    setShowModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing && selectedProductId) {
        await productService.update(selectedProductId, formData);
      } else {
        await productService.create(formData);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      alert('Error al guardar el producto. Revisa los datos ingresados.');
    }
  };

  // Función de Carga Masiva
  const handleBulkCreate = async () => {
    if (categories.length === 0) {
      alert('Debe existir al menos una categoría registrada para crear productos.');
      return;
    }

    if (!confirm(`¿Desea generar e insertar ${bulkCount} productos automáticamente?`)) {
      return;
    }

    setIsBulkLoading(true);

    try {
      // Genera un arreglo dinámico de productos aleatorios de prueba
      const bulkProducts: CreateProductDto[] = Array.from({ length: bulkCount }, (_, i) => {
        const randomCat = categories[Math.floor(Math.random() * categories.length)];
        const randomPrice = parseFloat((Math.random() * 100 + 5).toFixed(2));
        const randomStock = Math.floor(Math.random() * 150) + 1;
        const randomId = Math.floor(Math.random() * 10000);

        return {
          productName: `Producto Masivo ${randomId}-${i + 1}`,
          categoryID: randomCat.categoryID,
          unitPrice: randomPrice,
          unitsInStock: randomStock,
          quantityPerUnit: '11 - 200 g'
        };
      });

      // Si tu backend soporta batch/bulk insert lo usará, si no, se insertan en paralelo
      if (typeof (productService as any).createBulk === 'function') {
        await (productService as any).createBulk(bulkProducts);
      } else {
        await Promise.all(bulkProducts.map((p) => productService.create(p)));
      }

      alert(`¡Se han cargado correctamente ${bulkCount} productos!`);
      fetchProducts();
    } catch (err) {
      console.error('Error en carga masiva:', err);
      alert('Ocurrió un error al realizar la carga masiva.');
    } finally {
      setIsBulkLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm('¿Está seguro de que desea eliminar este producto?')) {
      try {
        await productService.delete(id);
        fetchProducts();
      } catch (err) {
        alert('Error al eliminar el producto.');
      }
    }
  };

  const handleViewDetail = async (id: number) => {
    try {
      const data = await productService.getById(id);
      setProductDetail(data);
    } catch (err) {
      alert('Error al obtener el detalle del producto.');
    }
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* MENÚ SUPERIOR DE NAVEGACIÓN */}
        <header className="flex justify-between items-center mb-6 bg-white p-4 rounded-lg shadow-sm">
          <div className="flex items-center gap-6">
            <h1 className="text-xl font-bold text-gray-800">Asisya - Panel de Control</h1>
            <nav className="flex gap-2">
              <button
                onClick={() => setActiveTab('products')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'products' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Productos
              </button>
              <button
                onClick={() => setActiveTab('categories')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'categories' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                Categorías
              </button>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium text-gray-600">
              Usuario: <strong>{localStorage.getItem('username') || 'Admin'}</strong>
            </span>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
            >
              Cerrar Sesión
            </button>
          </div>
        </header>

        {/* CONTENIDO SEGÚN LA PESTAÑA SELECCIONADA */}
        {activeTab === 'categories' ? (
          <CategoryManager />
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-wrap justify-between items-center gap-4 mb-4">
              <input
                type="text"
                placeholder="Buscar producto por nombre..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPageNumber(1);
                }}
                className="w-72 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />

              <div className="flex items-center gap-3">
                {/* OPCIÓN DE SELECCIONAR CANTIDAD DE NUEVOS REGISTROS PARA CARGA MASIVA */}
                <div className="flex items-center bg-purple-50 border border-purple-200 rounded-md p-1 gap-2">
                  <label className="text-xs font-semibold text-purple-800 pl-2">
                    Cantidad:
                  </label>
                  <select
                    value={bulkCount}
                    onChange={(e) => setBulkCount(Number(e.target.value))}
                    disabled={isBulkLoading}
                    className="bg-white border border-purple-300 text-purple-900 text-xs font-medium rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-500"
                  >
                    <option value={5}>5 registros</option>
                    <option value={10}>10 registros</option>
                    <option value={20}>20 registros</option>
                    <option value={50}>50 registros</option>
                    <option value={100000}> 100.000 registros</option>
                  </select>

                  <button
                    onClick={handleBulkCreate}
                    disabled={isBulkLoading}
                    className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium transition-colors disabled:opacity-50 flex items-center gap-1"
                  >
                    {isBulkLoading ? 'Cargando...' : '⚡ Carga Masiva'}
                  </button>
                </div>

                <button
                  onClick={handleOpenCreate}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm font-medium transition-colors"
                >
                  + Nuevo Producto
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8 text-gray-500">Cargando productos...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b bg-gray-50 text-xs font-semibold text-gray-600 uppercase">
                      <th className="py-3 px-4">ID</th>
                      <th className="py-3 px-4">Nombre</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4">Precio</th>
                      <th className="py-3 px-4">Stock</th>
                      <th className="py-3 px-4 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y text-sm text-gray-700">
                    {products.length > 0 ? (
                      products.map((p) => (
                        <tr key={p.productID} className="hover:bg-gray-50">
                          <td className="py-3 px-4">{p.productID}</td>
                          <td className="py-3 px-4 font-medium text-gray-900">{p.productName}</td>
                          <td className="py-3 px-4">{p.categoryName || 'N/A'}</td>
                          <td className="py-3 px-4">${p.unitPrice?.toFixed(2)}</td>
                          <td className="py-3 px-4">{p.unitsInStock}</td>
                          <td className="py-3 px-4 text-center space-x-2">
                            <button
                              onClick={() => handleViewDetail(p.productID)}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
                            >
                              Ver
                            </button>
                            <button
                              onClick={() => handleOpenEdit(p)}
                              className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs hover:bg-amber-200"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => handleDelete(p.productID)}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs hover:bg-red-200"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="text-center py-6 text-gray-500">
                          No se encontraron productos registrados.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <button
                disabled={pageNumber === 1}
                onClick={() => setPageNumber((p) => p - 1)}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-600">
                Página {pageNumber} de {totalPages || 1}
              </span>
              <button
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((p) => p + 1)}
                className="px-3 py-1 border rounded-md text-sm disabled:opacity-50 hover:bg-gray-100"
              >
                Siguiente
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MODAL CREAR / EDITAR */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-lg">
            <h2 className="text-lg font-bold mb-4 text-gray-800">
              {isEditing ? 'Editar Producto' : 'Crear Producto'}
            </h2>
            <form onSubmit={handleSubmitForm} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Categoría</label>
                <select
                  value={formData.categoryID}
                  onChange={(e) => setFormData({ ...formData, categoryID: Number(e.target.value) })}
                  className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                >
                  {categories.map((c) => (
                    <option key={c.categoryID} value={c.categoryID}>
                      {c.categoryName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Precio Unitario</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    min="0"
                    value={formData.unitPrice}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Stock</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.unitsInStock}
                    onChange={(e) => setFormData({ ...formData, unitsInStock: Number(e.target.value) })}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
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

      {/* MODAL DETALLE */}
      {productDetail && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <h2 className="text-xl font-bold text-gray-800 mb-2">{productDetail.productName}</h2>
            <p className="text-sm text-gray-500 mb-4">Categoría: {productDetail.categoryName}</p>

            {productDetail.categoryPicture ? (
              <img
                src={`data:image/png;base64,${productDetail.categoryPicture}`}
                alt={productDetail.categoryName}
                className="w-32 h-32 object-cover mx-auto rounded-md shadow mb-4"
              />
            ) : (
              <div className="w-32 h-32 bg-gray-100 flex items-center justify-center mx-auto rounded-md text-gray-400 text-xs mb-4">
                Sin Imagen
              </div>
            )}

            <div className="text-left text-sm space-y-1 mb-6 border-t pt-3">
              <p><strong>Precio:</strong> ${productDetail.unitPrice?.toFixed(2)}</p>
              <p><strong>Unidades en Stock:</strong> {productDetail.unitsInStock}</p>
            </div>

            <button
              onClick={() => setProductDetail(null)}
              className="w-full py-2 bg-gray-800 text-white rounded-md text-sm hover:bg-gray-900"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
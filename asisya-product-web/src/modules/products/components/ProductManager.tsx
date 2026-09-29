import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../services/product.service';
import type { ProductResponseDto } from '../dtos/product.dto';
import type { PagedResult } from '../../../shared/dtos/paged-result.dto';
import { BulkGenerateButton } from './BulkGenerateButton';

export const ProductManager: React.FC = () => {
  const [productsData, setProductsData] = useState<PagedResult<ProductResponseDto> | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Parámetros para paginación y búsqueda
  const [pageNumber, setPageNumber] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');

  const fetchProducts = useCallback(async () => {
    try {
      setLoading(true);
      // Usamos el método getAll definido en tu product.service.ts
      const data = await productService.getAll(search, pageNumber, pageSize);
      setProductsData(data);
    } catch (error) {
      console.error('Error al obtener productos:', error);
    } finally {
      setLoading(false);
    }
  }, [search, pageNumber, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPageNumber(1);
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h2>Gestión de Productos</h2>

      {/* Barra de Controles */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="Buscar producto..."
          value={search}
          onChange={handleSearchChange}
          style={{ padding: '8px 12px', minWidth: '250px', borderRadius: '4px', border: '1px solid #ccc' }}
        />

        <BulkGenerateButton onSuccess={fetchProducts} />
      </div>

      {/* Tabla de Productos */}
      {loading ? (
        <p>Cargando productos...</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '10px' }}>ID</th>
              <th style={{ padding: '10px' }}>Nombre</th>
              <th style={{ padding: '10px' }}>Precio Un.</th>
              <th style={{ padding: '10px' }}>Stock</th>
            </tr>
          </thead>
          <tbody>
            {productsData?.items && productsData.items.length > 0 ? (
              productsData.items.map((prod) => (
                <tr key={prod.productId} style={{ borderBottom: '1px solid #e5e7eb' }}>
                  <td style={{ padding: '10px' }}>{prod.productId}</td>
                  <td style={{ padding: '10px' }}>{prod.productName}</td>
                  <td style={{ padding: '10px' }}>${prod.unitPrice?.toFixed(2) ?? '0.00'}</td>
                  <td style={{ padding: '10px' }}>{prod.unitsInStock}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} style={{ padding: '20px', textAlign: 'center' }}>
                  No se encontraron productos.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Paginación */}
      {productsData && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '20px' }}>
          <span>
            Página {productsData.pageIndex} de {productsData.totalPages} (Total: {productsData.totalCount})
          </span>
          <div>
            <button
              onClick={() => setPageNumber((p) => Math.max(p - 1, 1))}
              disabled={pageNumber === 1}
              style={{ marginRight: '8px', padding: '6px 12px' }}
            >
              Anterior
            </button>
            <button
              onClick={() => setPageNumber((p) => p + 1)}
              disabled={pageNumber >= productsData.totalPages}
              style={{ padding: '6px 12px' }}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
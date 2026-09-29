import React, { useState } from 'react';
import { productService } from '../services/product.service';

interface BulkGenerateButtonProps {
  onSuccess: () => void;
}

export const BulkGenerateButton: React.FC<BulkGenerateButtonProps> = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState<number>(100);

  const handleGenerate = async () => {
    if (count <= 0) return;

    try {
      setLoading(true);
      const res = await productService.generateRandomProducts(count);
      alert(res.message || `¡Éxito! Se generaron ${count} productos.`);
      onSuccess(); // Dispara la recarga del listado
    } catch (error: any) {
      console.error(error);
      const errorMsg = error.response?.data || 'Ocurrió un error al generar los productos.';
      alert(typeof errorMsg === 'string' ? errorMsg : JSON.stringify(errorMsg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <input
        type="number"
        min="1"
        max="50000"
        value={count}
        onChange={(e) => setCount(Number(e.target.value))}
        disabled={loading}
        style={{ width: '90px', padding: '6px 10px', borderRadius: '4px', border: '1px solid #ccc' }}
      />
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          padding: '6px 16px',
          backgroundColor: loading ? '#93c5fd' : '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: loading ? 'not-allowed' : 'pointer',
          fontWeight: 'bold',
        }}
      >
        {loading ? 'Generando...' : '⚡ Carga Masiva'}
      </button>
    </div>
  );
};
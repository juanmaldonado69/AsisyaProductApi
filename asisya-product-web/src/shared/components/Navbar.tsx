// src/components/Navbar.tsx
import React from 'react';

interface NavbarProps {
  activeTab: 'products' | 'categories';
  setActiveTab: (tab: 'products' | 'categories') => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onLogout }) => {
  const username = localStorage.getItem('username') || 'Admin';

  return (
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
          Usuario: <strong>{username}</strong>
        </span>
        <button
          onClick={onLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 text-sm font-medium transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </header>
  );
};
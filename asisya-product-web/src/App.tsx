// src/App.tsx
import React, { useState } from 'react';
import { Login } from './modules/auth/components/Login';
import { ProductManager } from './modules/products/components/ProductManager';
import { CategoryManager } from './modules/categories/components/CategoryManager';
import { Navbar } from './shared/components/Navbar.tsx';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(!!localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState<'products' | 'categories'>('products');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setIsAuthenticated(false);
  };

  if (!isAuthenticated) {
    return <Login onLoginSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        {/* CABECERA Y MENÚ */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
        />

        {/* CONTENIDO MODULAR */}
        <main>
          {activeTab === 'products' && <ProductManager />}
          {activeTab === 'categories' && <CategoryManager />}
        </main>
      </div>
    </div>
  );
}
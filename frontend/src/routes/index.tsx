import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Products from '../pages/Products';
import ProductCreate from '../pages/ProductCreate';
import ProductEdit from '../pages/ProductEdit';
import ProductDetails from '../pages/ProductDetails';
import Settings from '../components/admin/Settings';
import Quotes from '../pages/Quotes';
import QuoteCreate from '../pages/QuoteCreate';
import QuoteEdit from '../pages/QuoteEdit';
import QuoteDetails from '../pages/QuoteDetails';
import { useAuth } from '../hooks/useAuth';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/login" />;
};

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Rotas protegidas */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />

      {/* Rotas de Produtos */}
      <Route
        path="/produtos"
        element={
          <PrivateRoute>
            <Products />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos/novo"
        element={
          <PrivateRoute>
            <ProductCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos/:id"
        element={
          <PrivateRoute>
            <ProductDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/produtos/:id/editar"
        element={
          <PrivateRoute>
            <ProductEdit />
          </PrivateRoute>
        }
      />

      {/* Rotas de Cotações */}
      <Route
        path="/orcamentos"
        element={
          <PrivateRoute>
            <Quotes />
          </PrivateRoute>
        }
      />
      <Route
        path="/orcamentos/novo"
        element={
          <PrivateRoute>
            <QuoteCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/cotacoes"
        element={
          <PrivateRoute>
            <Quotes />
          </PrivateRoute>
        }
      />
      <Route
        path="/cotacoes/novo"
        element={
          <PrivateRoute>
            <QuoteCreate />
          </PrivateRoute>
        }
      />
      <Route
        path="/cotacoes/:id"
        element={
          <PrivateRoute>
            <QuoteDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/cotacoes/:id/editar"
        element={
          <PrivateRoute>
            <QuoteEdit />
          </PrivateRoute>
        }
      />

      {/* Rota de Configurações */}
      <Route
        path="/configuracoes"
        element={
          <PrivateRoute>
            <Settings />
          </PrivateRoute>
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

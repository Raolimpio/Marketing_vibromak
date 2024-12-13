import { Routes, Route, Navigate } from 'react-router-dom'
import { useState, useEffect } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Layout from "./components/Layout";
import Dashboard from './pages/Dashboard'
import Products from './pages/Products'
import ProductDetails from './pages/ProductDetails'
import ProductCreate from './pages/ProductCreate'
import ProductEdit from './pages/ProductEdit'
import Quotes from './pages/Quotes'
import Login from './pages/Login'
import Calendar from './pages/Calendar'
import QuoteCreate from './pages/QuoteCreate'
import Clients from './pages/Clients'
import ClientCreate from './pages/ClientCreate'
import ClientDetails from './pages/ClientDetails'
import ClientEdit from './pages/ClientEdit'
import Admin from './pages/Admin'
import QuoteDetails from './pages/QuoteDetails'
import QuoteEdit from './pages/QuoteEdit'
import QuoteList from './pages/QuoteList'
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import { AuthProvider } from './contexts/AuthContext'
import { ThemeProvider } from './hooks/useTheme'
import { useAuth } from './hooks/useAuth'
import { CircularProgress, Box } from '@mui/material'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { userProfile, loading } = useAuth();
  
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  if (!userProfile?.isAdmin) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/esqueci-senha" element={<ForgotPassword />} />
      <Route path="/redefinir-senha" element={<ResetPassword />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="produtos">
          <Route path="novo" element={<ProductCreate />} />
          <Route path=":id" element={<ProductDetails />} />
          <Route path=":id/editar" element={<ProductEdit />} />
          <Route index element={<Products />} />
        </Route>
        {/* Rotas de Orçamentos */}
        <Route path="orcamentos" element={<QuoteList />} />
        <Route path="orcamentos/novo" element={<QuoteCreate />} />
        <Route path="orcamentos/:id" element={<QuoteDetails />} />
        <Route path="orcamentos/:id/editar" element={<QuoteEdit />} />
        <Route path="calendario" element={<Calendar />} />
        <Route path="clientes">
          <Route index element={<Clients />} />
          <Route path="novo" element={<ClientCreate />} />
          <Route path=":id" element={<ClientDetails />} />
          <Route path=":id/editar" element={<ClientEdit />} />
        </Route>
        <Route path="configuracoes" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <CssBaseline />
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

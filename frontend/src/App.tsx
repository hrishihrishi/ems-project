import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css';
import { LoginForm } from './components/LoginForm';
import { DashboardPage } from './pages/Dashboard';

const queryClient = new QueryClient();

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<div className="p-8 text-center"><LoginForm/></div>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

function App() {
  useEffect(() => {
    if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
            <AppRoutes />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

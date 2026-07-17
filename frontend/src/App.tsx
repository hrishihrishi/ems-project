import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import './index.css'

const queryClient = new QueryClient();

const ThemeToggle: React.FC = () => {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDark(isDark);
  }, []);

  const toggle = () => {
    if (dark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    }
    setDark(!dark);
  };

  return (
    <button onClick={toggle} className="p-2 border rounded dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200">
      {dark ? '☀️ Light Mode' : '🌙 Dark Mode'}
    </button>
  );
};

const DashboardPlaceholder = () => {
  const { user, logout } = useAuth();
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">EMS Core Workspace Ready</h1>
        <div className="flex gap-4">
          <ThemeToggle />
          <button onClick={logout} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition">Logout</button>
        </div>
      </div>
      <div className="p-6 bg-white dark:bg-slate-800 rounded-lg shadow border dark:border-slate-700">
        <p className="text-lg">Welcome back, <span className="font-semibold">{user?.name}</span>!</p>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Authorization Clearance: {user?.role}</p>
      </div>
    </div>
  );
};

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<div className="p-8 text-center">Login Form Component Space</div>} />
      <Route path="/dashboard" element={<ProtectedRoute><DashboardPlaceholder /></ProtectedRoute>} />
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
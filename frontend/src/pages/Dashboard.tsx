import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { EmployeeTable } from '../components/EmployeeTable';
import { HierarchyVisualizer } from '../components/HierarchyVisualizer';
import { LayoutDashboard, TableProperties, Network, Moon, Sun, LogOut, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { EmployeeFormModal, type EmployeeFormData } from '../components/EmployeeFormModal';

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'metrics' | 'directory' | 'hierarchy'>('metrics');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

  // Modal State Management
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<EmployeeFormData | null>(null);

  const toggleTheme = () => {
    if (isDark) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  // Fetch Employees
  const { data: employeesData, isLoading: isEmployeesLoading } = useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const response = await api.get('/employees?limit=1000');
      return response.data.data;
    }
  });

  // Fetch Organization Tree
  const { data: treeData, isLoading: isTreeLoading } = useQuery({
    queryKey: ['hierarchy'],
    queryFn: async () => {
      const response = await api.get('/organization/tree');
      return response.data;
    }
  });

  // Action Mutation Pipelines
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/employees/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: Partial<EmployeeFormData>) => {
      await api.post('/employees', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to create employee');
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<EmployeeFormData>) => {
      const { id, ...payload } = data; // Strip ID from payload
      await api.put(`/employees/${id}`, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['hierarchy'] });
      setIsModalOpen(false);
    },
    onError: (error: any) => {
      alert(error.response?.data?.error || 'Failed to update employee');
    }
  });

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to softly delete this employee?')) {
      deleteMutation.mutate(id);
    }
  };

  const handleEdit = (emp: any) => {
    setEditingEmployee(emp);
    setIsModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = (data: Partial<EmployeeFormData>) => {
    if (editingEmployee) {
      updateMutation.mutate({ ...data, id: editingEmployee.id });
    } else {
      createMutation.mutate(data);
    }
  };

  const employees = employeesData || [];
  const hierarchyTree = treeData || [];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black tracking-tighter text-lg">EM</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">Enterprise Space</h1>
            <p className="text-xs text-slate-400 font-medium">Clearance: {user?.role || 'EMPLOYEE'}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <button 
            onClick={toggleTheme}
            className="p-2 border border-slate-200 dark:border-slate-800 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition text-slate-600 dark:text-slate-300 cursor-pointer"
          >
            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
          
          <div className="h-6 w-px bg-slate-200 dark:border-slate-800" />
          
          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 px-3 py-2 rounded-lg transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden md:inline">Exit Engine</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        <div className="flex justify-between items-end border-b border-slate-200 dark:border-slate-800">
          <div className="flex gap-6">
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-wide transition border-b-2 cursor-pointer ${
                activeTab === 'metrics'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" /> Analytical Core
            </button>
            
            <button
              onClick={() => setActiveTab('directory')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-wide transition border-b-2 cursor-pointer ${
                activeTab === 'directory'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <TableProperties className="w-4 h-4" /> Staff Directory
            </button>
            
            <button
              onClick={() => setActiveTab('hierarchy')}
              className={`flex items-center gap-2 pb-3 text-sm font-bold tracking-wide transition border-b-2 cursor-pointer ${
                activeTab === 'hierarchy'
                  ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Network className="w-4 h-4" /> Reporting Tree
            </button>
          </div>

          {/* New Add Employee Action Button */}
          {(user?.role === 'SUPER_ADMIN' || user?.role === 'HR_MANAGER') && activeTab === 'directory' && (
            <button
              onClick={openCreateModal}
              className="mb-2 flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add Employee
            </button>
          )}
        </div>

        <div className="animate-fadeIn duration-200">
          {activeTab === 'metrics' && (
            isEmployeesLoading ? <div className="p-8 text-center text-slate-500">Loading metrics...</div> : <DashboardMetrics data={employees} />
          )}
          {activeTab === 'directory' && (
            isEmployeesLoading ? <div className="p-8 text-center text-slate-500">Loading directory...</div> : <EmployeeTable employees={employees} onDelete={handleDelete} onEdit={handleEdit} />
          )}
          {activeTab === 'hierarchy' && (
            isTreeLoading ? <div className="p-8 text-center text-slate-500">Loading hierarchy...</div> : <HierarchyVisualizer treeData={hierarchyTree} />
          )}
        </div>
      </main>

      <EmployeeFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initialData={editingEmployee}
      />
    </div>
  );
};

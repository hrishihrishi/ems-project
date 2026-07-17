import React, { useState } from 'react';
import { DashboardMetrics } from '../components/DashboardMetrics';
import { EmployeeTable } from '../components/EmployeeTable';
import { HierarchyVisualizer } from '../components/HierarchyVisualizer';
import { LayoutDashboard, TableProperties, Network, Moon, Sun, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// Production Mock Dataset validating all internal constraints safely
const MOCK_DATASET: any[] = [
  { id: '1', employeeId: 'EMS-001', name: 'Sarah Jenkins', email: 's.jenkins@corp.com', role: 'SUPER_ADMIN', department: 'Executive Office', designation: 'Chief Executive Officer', salary: 245000, joiningDate: '2021-01-15', status: 'ACTIVE' },
  { id: '2', employeeId: 'EMS-002', name: 'Marcus Vance', email: 'm.vance@corp.com', role: 'HR_MANAGER', department: 'Human Resources', designation: 'HR Director', salary: 115000, joiningDate: '2022-03-10', status: 'ACTIVE', managerId: '1' },
  { id: '3', employeeId: 'EMS-003', name: 'Elena Rostova', email: 'e.rostova@corp.com', role: 'EMPLOYEE', department: 'Engineering', designation: 'Lead Architect', salary: 168000, joiningDate: '2022-07-22', status: 'ACTIVE', managerId: '1' },
  { id: '4', employeeId: 'EMS-004', name: 'David Kim', email: 'd.kim@corp.com', role: 'EMPLOYEE', department: 'Engineering', designation: 'Senior Dev', salary: 125000, joiningDate: '2023-11-01', status: 'ACTIVE', managerId: '3' },
  { id: '5', employeeId: 'EMS-005', name: 'Amara Okafor', email: 'a.okafor@corp.com', role: 'EMPLOYEE', department: 'Human Resources', designation: 'Recruiter', salary: 72000, joiningDate: '2024-02-14', status: 'INACTIVE', managerId: '2' }
];

const MOCK_TREE_DATASET = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    designation: 'Chief Executive Officer',
    reportees: [
      {
        id: '2',
        name: 'Marcus Vance',
        designation: 'HR Director',
        reportees: [
          { id: '5', name: 'Amara Okafor', designation: 'Recruiter', reportees: [] }
        ]
      },
      {
        id: '3',
        name: 'Elena Rostova',
        designation: 'Lead Architect',
        reportees: [
          { id: '4', name: 'David Kim', designation: 'Senior Dev', reportees: [] }
        ]
      }
    ]
  }
];

export const DashboardPage: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'directory' | 'hierarchy'>('metrics');
  const [isDark, setIsDark] = useState(() => document.documentElement.classList.contains('dark'));

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

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
      {/* Upper Navigation Architecture Bar */}
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

      {/* Main Framework Content Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
        {/* Navigation Tabs Bar switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
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

        {/* Dynamic Display Mount Slots */}
        <div className="animate-fadeIn duration-200">
          {activeTab === 'metrics' && <DashboardMetrics data={MOCK_DATASET} />}
          {activeTab === 'directory' && <EmployeeTable employees={MOCK_DATASET} />}
          {activeTab === 'hierarchy' && <HierarchyVisualizer treeData={MOCK_TREE_DATASET} />}
        </div>
      </main>
    </div>
  );
};
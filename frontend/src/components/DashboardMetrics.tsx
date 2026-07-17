import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, UserCheck, UserX, Briefcase } from 'lucide-react';

interface Employee {
  id: string;
  name: string;
  department: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: string;
}

interface MetricsProps {
  data: Employee[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#3b82f6'];

export const DashboardMetrics: React.FC<MetricsProps> = ({ data }) => {
  const calculations = useMemo(() => {
    const total = data.length;
    let active = 0;
    let inactive = 0;
    const deptsMap: Record<string, number> = {};

    data.forEach((emp) => {
      if (emp.status === 'ACTIVE') active++;
      if (emp.status === 'INACTIVE') inactive++;
      if (emp.department) {
        deptsMap[emp.department] = (deptsMap[emp.department] || 0) + 1;
      }
    });

    const uniqueDeptsCount = Object.keys(deptsMap).length;

    const departmentChartData = Object.entries(deptsMap).map(([name, value]) => ({
      name,
      value,
    }));

    const statusChartData = [
      { name: 'Active Metrics', value: active },
      { name: 'Inactive Metrics', value: inactive },
    ];

    return { total, active, inactive, uniqueDeptsCount, departmentChartData, statusChartData };
  }, [data]);

  return (
    <div className="space-y-8">
      {/* Metrics Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Total Headcount</p>
            <h3 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{calculations.total}</h3>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg"><Users className="w-6 h-6" /></div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Active Staff</p>
            <h3 className="text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{calculations.active}</h3>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg"><UserCheck className="w-6 h-6" /></div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Inactive Status</p>
            <h3 className="text-3xl font-bold text-amber-600 dark:text-amber-400 mt-1">{calculations.inactive}</h3>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 rounded-lg"><UserX className="w-6 h-6" /></div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Departments</p>
            <h3 className="text-3xl font-bold text-violet-600 dark:text-violet-400 mt-1">{calculations.uniqueDeptsCount}</h3>
          </div>
          <div className="p-3 bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400 rounded-lg"><Briefcase className="w-6 h-6" /></div>
        </div>
      </div>

      {/* Recharts Graphical Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Department Distribution Matrix</h4>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={calculations.departmentChartData}>
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
          <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4">Operational Status Breakout</h4>
          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={calculations.statusChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={95}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {calculations.statusChartData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? '#10b981' : '#f59e0b'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
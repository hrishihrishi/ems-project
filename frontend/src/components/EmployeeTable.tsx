import React, { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { ArrowUpDown, Search, ChevronLeft, ChevronRight, Trash2, Edit3 } from 'lucide-react';

interface Employee {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
}

interface TableProps {
  employees: Employee[];
  onDelete?: (id: string) => void;
  onEdit?: (emp: Employee) => void;
}

export const EmployeeTable: React.FC<TableProps> = ({ employees, onDelete, onEdit }) => {
  const { user } = useAuth();

  // Multi-value Text Input State Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Custom Sorting State Parameters
  const [sortField, setSortField] = useState<'name' | 'joiningDate'>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  // Pagination Controls Trackers
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const handleSort = (field: 'name' | 'joiningDate') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const processedData = useMemo(() => {
    let output = [...employees];

    // Filter Logic Execution
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      output = output.filter(
        (e) => e.name.toLowerCase().includes(lowerSearch) || e.email.toLowerCase().includes(lowerSearch)
      );
    }
    if (deptFilter !== 'ALL') {
      output = output.filter((e) => e.department === deptFilter);
    }
    if (statusFilter !== 'ALL') {
      output = output.filter((e) => e.status === statusFilter);
    }

    // Sort Logic Execution
    output.sort((a, b) => {
      let valA = a[sortField];
      let valB = b[sortField];

      if (sortField === 'joiningDate') {
        valA = new Date(a.joiningDate).getTime();
        valB = new Date(b.joiningDate).getTime();
      } else {
        valA = (valA as string).toLowerCase();
        valB = (valB as string).toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return output;
  }, [employees, searchTerm, deptFilter, statusFilter, sortField, sortDirection]);

  // Unique Department List Aggregation for Select dropdown
  const uniqueDepts = useMemo(() => {
    return Array.from(new Set(employees.map((e) => e.department).filter(Boolean)));
  }, [employees]);

  // Pagination Slice
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return processedData.slice(start, start + itemsPerPage);
  }, [processedData, currentPage]);

  const totalPages = Math.ceil(processedData.length / itemsPerPage) || 1;

  // RBAC Access Observers Visibility Control Values
  const isEmployee = user?.role === 'EMPLOYEE';
  const isHR = user?.role === 'HR_MANAGER';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  return (
    <div className="space-y-4">
      {/* Table Workspace Control Filters Bar */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search name or email..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-10 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <select
          value={deptFilter}
          onChange={(e) => { setDeptFilter(e.target.value); setCurrentPage(1); }}
          className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Departments</option>
          {uniqueDepts.map((d) => <option key={d} value={d}>{d}</option>)}
        </select>

        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
          className="py-2 px-3 border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        <div className="text-right text-xs text-slate-500 dark:text-slate-400 self-center font-medium">
          Matches: {processedData.length} entries located
        </div>
      </div>

      {/* Grid Architecture Node Wrapper */}
      <div className="w-full overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="p-4">Employee ID</th>
              <th className="p-4 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                <div className="flex items-center gap-1">Name <ArrowUpDown className="w-3.5 h-3.5" /></div>
              </th>
              <th className="p-4">Email</th>
              <th className="p-4">Role Mapping</th>
              <th className="p-4">Department</th>
              <th className="p-4 cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" onClick={() => handleSort('joiningDate')}>
                <div className="flex items-center gap-1">Joining Date <ArrowUpDown className="w-3.5 h-3.5" /></div>
              </th>
              <th className="p-4">Status</th>
              {!isEmployee && <th className="p-4 text-right">Compensation Matrix</th>}
              {(isSuperAdmin || isHR) && <th className="p-4 text-center">Actions Workspace</th>}
            </tr>
          </thead>
          <tbody className="text-sm divide-y divide-slate-200 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
            {paginatedData.map((emp) => (
              <tr key={emp.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                <td className="p-4 font-mono text-xs font-medium text-slate-500 dark:text-slate-400">{emp.employeeId}</td>
                <td className="p-4 font-semibold text-slate-900 dark:text-white">{emp.name}</td>
                <td className="p-4">{emp.email}</td>
                <td className="p-4">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {emp.role}
                  </span>
                </td>
                <td className="p-4 font-medium">{emp.department || 'N/A'}</td>
                <td className="p-4 text-xs">{new Date(emp.joiningDate).toLocaleDateString()}</td>
                <td className="p-4">
                  <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                    emp.status === 'ACTIVE' 
                      ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400'
                  }`}>
                    {emp.status}
                  </span>
                </td>
                
                {/* Conditional RBAC layout protection masks */}
                {!isEmployee && (
                  <td className="p-4 text-right font-mono font-semibold text-slate-900 dark:text-white">
                    ${emp.salary.toLocaleString()}
                  </td>
                )}

                {(isSuperAdmin || isHR) && (
                  <td className="p-4">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        onClick={() => onEdit?.(emp)}
                        className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-md transition cursor-pointer"
                        title="Modify Profile Node"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      
                      {/* Clear HR profile soft deletion blocking rules constraint check */}
                      {isSuperAdmin && (
                        <button 
                          onClick={() => onDelete?.(emp.id)}
                          className="p-1.5 text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-md transition cursor-pointer"
                          title="Purge Record Path"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={9} className="p-8 text-center text-sm text-slate-400">
                  No employee entries coordinate with matching filter presets.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Interface */}
      <div className="flex items-center justify-between px-2 text-sm text-slate-500 dark:text-slate-400">
        <div>
          Showing page <span className="font-semibold text-slate-800 dark:text-white">{currentPage}</span> of <span className="font-semibold text-slate-800 dark:text-white">{totalPages}</span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition hover:bg-slate-50"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-2 border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition hover:bg-slate-50"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
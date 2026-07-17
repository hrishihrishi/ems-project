import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export interface EmployeeFormData {
  id?: string;
  employeeId: string;
  name: string;
  email: string;
  password?: string;
  phone: string;
  department: string;
  designation: string;
  salary: number;
  joiningDate: string;
  status: 'ACTIVE' | 'INACTIVE';
  role: 'SUPER_ADMIN' | 'HR_MANAGER' | 'EMPLOYEE';
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<EmployeeFormData>) => void;
  initialData?: EmployeeFormData | null;
}

export const EmployeeFormModal: React.FC<ModalProps> = ({ isOpen, onClose, onSubmit, initialData }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<EmployeeFormData>>({
    employeeId: '', name: '', email: '', password: '', phone: '',
    department: '', designation: '', salary: 0, joiningDate: new Date().toISOString().split('T')[0],
    status: 'ACTIVE', role: 'EMPLOYEE'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Format date string to YYYY-MM-DD for date input
        joiningDate: new Date(initialData.joiningDate).toISOString().split('T')[0]
      });
    } else {
      setFormData({
        employeeId: '', name: '', email: '', password: '', phone: '',
        department: '', designation: '', salary: 0, joiningDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE', role: 'EMPLOYEE'
      });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;
  const isHR = user?.role === 'HR_MANAGER';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Clone formData to avoid mutating state directly
    const payload = { ...formData };
    
    // Convert YYYY-MM-DD to full ISO string for backend Zod validation
    if (payload.joiningDate && !payload.joiningDate.includes('T')) {
      payload.joiningDate = new Date(payload.joiningDate).toISOString();
    }
    
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        <div className="flex justify-between items-center p-6 border-b border-slate-200 dark:border-slate-800">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">
            {isEditing ? 'Edit Employee Profile' : 'Register New Employee'}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-1">
          <form id="employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Employee ID *</label>
              <input required name="employeeId" value={formData.employeeId} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Full Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            {!isEditing && (
              <div className="space-y-1">
                <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Password *</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Phone Number *</label>
              <input required name="phone" value={formData.phone} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Department *</label>
              <input required name="department" value={formData.department} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Designation *</label>
              <input required name="designation" value={formData.designation} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Salary (USD) *</label>
              <input required type="number" name="salary" value={formData.salary} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Joining Date *</label>
              <input required type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition" />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">System Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer">
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_MANAGER">HR Manager</option>
                {!isHR && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
              {isHR && formData.role === 'SUPER_ADMIN' && (
                 <p className="text-xs text-amber-500 mt-1">HR Managers cannot assign Super Admin roles.</p>
              )}
            </div>

          </form>
        </div>

        <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
          <button onClick={onClose} type="button" className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer">
            Cancel
          </button>
          <button type="submit" form="employee-form" className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition shadow-sm cursor-pointer">
            {isEditing ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>

      </div>
    </div>
  );
};

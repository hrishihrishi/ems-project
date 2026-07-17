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
  managerId?: string | null;
}

// Minimal shape needed for the manager dropdown list
interface ManagerOption {
  id: string;
  name: string;
  designation: string;
  role: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<EmployeeFormData>) => void;
  initialData?: EmployeeFormData | null;
  allEmployees?: ManagerOption[]; // All active employees to pick a manager from
}

const BLANK_FORM: Partial<EmployeeFormData> = {
  employeeId: '', name: '', email: '', password: '', phone: '',
  department: '', designation: '', salary: 0,
  joiningDate: new Date().toISOString().split('T')[0],
  status: 'ACTIVE', role: 'EMPLOYEE', managerId: null,
};

const inputCls = "w-full px-3 py-2 border rounded-lg bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 outline-none transition text-sm";

export const EmployeeFormModal: React.FC<ModalProps> = ({
  isOpen, onClose, onSubmit, initialData, allEmployees = []
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState<Partial<EmployeeFormData>>(BLANK_FORM);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        joiningDate: new Date(initialData.joiningDate).toISOString().split('T')[0],
      });
    } else {
      setFormData({ ...BLANK_FORM, joiningDate: new Date().toISOString().split('T')[0] });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const isEditing = !!initialData;
  const isHR = user?.role === 'HR_MANAGER';

  // Only HR Managers and Super Admins can be reporting managers
  const managerOptions = allEmployees.filter(
    (e) => (e.role === 'SUPER_ADMIN' || e.role === 'HR_MANAGER') && e.id !== initialData?.id
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let parsed: string | number | null = value;
    if (name === 'salary') parsed = Number(value);
    if (name === 'managerId' && value === '') parsed = null;
    setFormData(prev => ({ ...prev, [name]: parsed }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...formData };
    // Convert YYYY-MM-DD to full ISO string for backend Zod validation
    if (payload.joiningDate && !payload.joiningDate.includes('T')) {
      payload.joiningDate = new Date(payload.joiningDate).toISOString();
    }
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex justify-between items-center px-6 py-5 border-b border-slate-200 dark:border-slate-700">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {isEditing ? 'Edit Employee Profile' : 'Register New Employee'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isEditing ? 'Update the employee details below.' : 'Fill in all required fields to create an account.'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <div className="p-6 overflow-y-auto flex-1">
          <form id="employee-form" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Employee ID *</label>
              <input required name="employeeId" value={formData.employeeId} onChange={handleChange} className={inputCls} placeholder="e.g. EMP001" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Full Name *</label>
              <input required name="name" value={formData.name} onChange={handleChange} className={inputCls} placeholder="e.g. Sarah Connor" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Email Address *</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className={inputCls} placeholder="sarah@company.com" />
            </div>

            {!isEditing && (
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Password *</label>
                <input required type="password" name="password" value={formData.password} onChange={handleChange} className={inputCls} placeholder="Min. 6 characters" />
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Phone Number *</label>
              <input required name="phone" value={formData.phone} onChange={handleChange} className={inputCls} placeholder="e.g. 5551234567" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Department *</label>
              <input required name="department" value={formData.department} onChange={handleChange} className={inputCls} placeholder="e.g. Engineering" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Designation *</label>
              <input required name="designation" value={formData.designation} onChange={handleChange} className={inputCls} placeholder="e.g. Senior Developer" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Salary (USD) *</label>
              <input required type="number" name="salary" value={formData.salary} onChange={handleChange} className={inputCls} placeholder="e.g. 120000" min={0} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Joining Date *</label>
              <input required type="date" name="joiningDate" value={formData.joiningDate} onChange={handleChange} className={inputCls} />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</label>
              <select name="status" value={formData.status} onChange={handleChange} className={inputCls + " cursor-pointer"}>
                <option value="ACTIVE">Active</option>
                <option value="INACTIVE">Inactive</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">System Role</label>
              <select name="role" value={formData.role} onChange={handleChange} className={inputCls + " cursor-pointer"}>
                <option value="EMPLOYEE">Employee</option>
                <option value="HR_MANAGER">HR Manager</option>
                {!isHR && <option value="SUPER_ADMIN">Super Admin</option>}
              </select>
              {isHR && formData.role === 'SUPER_ADMIN' && (
                <p className="text-xs text-amber-500 mt-1">HR Managers cannot assign Super Admin roles.</p>
              )}
            </div>

            {/* Reporting Manager Dropdown */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">Reporting Manager</label>
              <select
                name="managerId"
                value={formData.managerId ?? ''}
                onChange={handleChange}
                className={inputCls + " cursor-pointer"}
              >
                <option value="">— No Manager (Top Level) —</option>
                {managerOptions.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} · {m.designation} ({m.role === 'SUPER_ADMIN' ? 'Super Admin' : 'HR Manager'})
                  </option>
                ))}
              </select>
              {managerOptions.length === 0 && (
                <p className="text-xs text-slate-400 mt-1">No HR Managers or Super Admins found to assign as manager.</p>
              )}
            </div>

          </form>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60 flex justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="employee-form"
            className="px-5 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 active:bg-indigo-800 transition shadow-sm cursor-pointer"
          >
            {isEditing ? 'Save Changes' : 'Create Employee'}
          </button>
        </div>

      </div>
    </div>
  );
};

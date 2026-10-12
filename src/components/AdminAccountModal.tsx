import React, { useState } from 'react';
import { UserProfile, UserRole } from '../types';
import { useAuth } from '../context/AuthContext';
import { X, UserPlus, Shield, Building, Users, CheckCircle, Mail, Key, Pencil, Save, CircleOff, CircleCheck, Eye, EyeOff } from 'lucide-react';

interface AdminAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminAccountModal: React.FC<AdminAccountModalProps> = ({ isOpen, onClose }) => {
  const { allProfiles, createAccount, updateAccount, setAccountActive, isSupabaseConfigured } = useAuth();

  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [editingProfile, setEditingProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<UserRole>('customer');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const resetForm = () => {
    setEditingProfile(null);
    setRole('customer');
    setFullName('');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setCompanyName('');
  };

  const handleEdit = (profile: UserProfile) => {
    setEditingProfile(profile);
    setRole(profile.role);
    setFullName(profile.fullName);
    setEmail(profile.email);
    setCompanyName(profile.companyName || '');
    setPassword('');
    setSuccessMessage('');
    setActiveTab('create');
  };

  const handleSetActive = async (profile: UserProfile) => {
    const isActive = profile.isActive === false;
    if (!isActive && !confirm(`Deactivate ${profile.fullName}? They will lose access, but their jobs and candidates will be kept.`)) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      await setAccountActive(profile.id, isActive);
      setSuccessMessage(`${profile.fullName} is now ${isActive ? 'active' : 'inactive'}.`);
    } catch (err: any) {
      alert(`Could not update customer status: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || (!editingProfile && (!email.trim() || !password))) return;

    setIsSubmitting(true);
    setSuccessMessage('');
    try {
      if (editingProfile) {
        await updateAccount(editingProfile.id, fullName.trim(), role, companyName.trim());
        setSuccessMessage(`Account updated successfully for ${fullName}.`);
        setActiveTab('list');
      } else {
        await createAccount(
          email.trim(),
          password,
          fullName.trim(),
          role,
          role === 'customer' ? companyName.trim() : undefined
        );
        setSuccessMessage(`Account created successfully for ${fullName} (${role})!`);
        resetForm();
      }
      setTimeout(() => setSuccessMessage(''), 3500);
    } catch (err: any) {
      alert(`Error ${editingProfile ? 'updating' : 'creating'} account: ${err.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-600 text-white rounded-lg shadow-xs">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{editingProfile ? 'Edit Account' : 'Admin Account Management'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Create new Customer and Admin platform accounts
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-semibold px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/40 gap-4">
          <button
            type="button"
            onClick={() => {
              resetForm();
              setSuccessMessage('');
              setActiveTab('create');
            }}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'create'
                ? 'border-purple-600 text-purple-700 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Create Account
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'list'
                ? 'border-purple-600 text-purple-700 dark:text-purple-400'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Active Accounts ({allProfiles.length})
          </button>
        </div>

        {activeTab === 'create' ? (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2 animate-in fade-in">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Role selection radio cards */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Select Account Role *
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label
                  className={`border rounded-xl p-3 cursor-pointer flex items-center gap-2.5 transition-all ${
                    role === 'customer'
                      ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 ring-1 ring-indigo-600 text-indigo-950 dark:text-indigo-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountRole"
                    value="customer"
                    checked={role === 'customer'}
                    onChange={() => setRole('customer')}
                    className="text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Customer Account</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Recruiter / Client hiring portal</span>
                  </div>
                </label>

                <label
                  className={`border rounded-xl p-3 cursor-pointer flex items-center gap-2.5 transition-all ${
                    role === 'admin'
                      ? 'border-purple-600 bg-purple-50/60 dark:bg-purple-950/40 ring-1 ring-purple-600 text-purple-950 dark:text-purple-200'
                      : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="accountRole"
                    value="admin"
                    checked={role === 'admin'}
                    onChange={() => setRole('admin')}
                    className="text-purple-600 focus:ring-purple-500"
                  />
                  <div>
                    <span className="text-xs font-bold block">Admin Account</span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">Full system & client management</span>
                  </div>
                </label>
              </div>
            </div>

            {/* Full Name & Company */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Rachel Zane"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Organization Name {role === 'customer' ? '*' : '(Optional)'}
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required={role === 'customer'}
                    placeholder="e.g. Pearson Hardman"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>
            </div>

            {editingProfile ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Login email (not editable here)
                </label>
                <p className="text-xs p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {editingProfile.email}
                </p>
              </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="rachel@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Initial Password *
                </label>
                <div className="relative">
                  <Key className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={isSupabaseConfigured ? 12 : undefined}
                    maxLength={128}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 font-mono transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide initial password' : 'Show initial password'}
                    aria-pressed={showPassword}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-500/40 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
            )}

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
              <button
                type="button"
                onClick={editingProfile ? () => {
                  resetForm();
                  setSuccessMessage('');
                  setActiveTab('list');
                } : onClose}
                className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
              >
                {editingProfile ? 'Cancel edit' : 'Close'}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="text-xs font-semibold bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
              >
                {editingProfile ? <Save className="w-3.5 h-3.5" /> : <UserPlus className="w-3.5 h-3.5" />}
                {isSubmitting ? 'Saving...' : editingProfile ? 'Save Changes' : `Create ${role === 'admin' ? 'Admin' : 'Customer'} Account`}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-3">
            {successMessage && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
              Current registered platform users across the database:
            </p>
            {allProfiles.map((p) => (
              <div
                key={p.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/60 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-900 dark:text-white">{p.fullName}</span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                        p.role === 'admin'
                          ? 'bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                          : 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                      }`}
                    >
                      {p.role.toUpperCase()}
                    </span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${
                          p.isActive === false
                            ? 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                            : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        }`}>
                          {p.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                        </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 flex gap-3">
                    <span>{p.email}</span>
                    {p.companyName && <span>• {p.companyName}</span>}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleEdit(p)}
                  className="ml-3 p-2 text-slate-500 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  title={`Edit ${p.fullName}`}
                  aria-label={`Edit ${p.fullName}`}
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                {p.role === 'customer' && (
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => handleSetActive(p)}
                    className={`p-2 rounded-lg disabled:opacity-50 ${p.isActive === false
                      ? 'text-emerald-700 hover:bg-emerald-50 dark:text-emerald-300 dark:hover:bg-emerald-950/40'
                      : 'text-rose-600 hover:bg-rose-50 dark:text-rose-300 dark:hover:bg-rose-950/40'
                    }`}
                    title={p.isActive === false ? 'Reactivate customer' : 'Deactivate customer'}
                    aria-label={`${p.isActive === false ? 'Reactivate' : 'Deactivate'} ${p.fullName}`}
                  >
                    {p.isActive === false
                      ? <CircleCheck className="w-3.5 h-3.5" />
                      : <CircleOff className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, 
  User, 
  Building, 
  LogOut, 
  UserPlus, 
  Database, 
  HelpCircle, 
  RotateCcw,
  Sparkles,
  ChevronDown,
  Briefcase
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateAccount: () => void;
  onOpenAssumptions: () => void;
  onOpenSupabaseSettings: () => void;
  onResetData: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateAccount,
  onOpenAssumptions,
  onOpenSupabaseSettings,
  onResetData,
}) => {
  const { 
    currentUser, 
    effectiveUser, 
    impersonatedCustomer, 
    setImpersonatedCustomer, 
    allProfiles, 
    logout, 
    isSupabaseConfigured,
    switchUserRoleDemo
  } = useAuth();

  const isAdmin = currentUser?.role === 'admin';
  const customerProfiles = allProfiles.filter((p) => p.role === 'customer');

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
      {/* Amber banner if Admin is acting on behalf of a customer */}
      {isAdmin && impersonatedCustomer && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-semibold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="bg-black/20 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
              Admin Masquerade
            </span>
            <span>
              You are acting on behalf of <strong>{impersonatedCustomer.companyName || impersonatedCustomer.fullName}</strong> ({impersonatedCustomer.email}). All actions are saved under this customer.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setImpersonatedCustomer(null)}
            className="bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold px-2.5 py-1 rounded transition-colors"
          >
            Exit Customer View
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
            ⚡
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-base tracking-tight">Mini ATS</span>
              <span className="bg-indigo-50 text-indigo-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-indigo-200">
                v1.0 Live
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-blue-500 animate-pulse'}`} />
              <span>{isSupabaseConfigured ? 'Supabase Connected' : 'Local Demo Persistence'}</span>
            </div>
          </div>
        </div>

        {/* Center: Admin "Act on Behalf of" Customer Switcher */}
        {isAdmin && (
          <div className="hidden md:flex items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500 pl-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-600" />
              Customer Context:
            </span>
            <select
              value={impersonatedCustomer ? impersonatedCustomer.id : 'all'}
              onChange={(e) => {
                if (e.target.value === 'all') {
                  setImpersonatedCustomer(null);
                } else {
                  const target = customerProfiles.find((c) => c.id === e.target.value);
                  setImpersonatedCustomer(target || null);
                }
              }}
              className="text-xs font-semibold py-1 px-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">Admin Overview (All Customers)</option>
              {customerProfiles.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || c.fullName} ({c.email})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Right side actions */}
        <div className="flex items-center gap-2">
          {/* Admin Create Account Button */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateAccount}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 px-3 py-1.5 rounded-xl transition-colors"
              title="Create new Admin or Customer accounts"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Create Account</span>
            </button>
          )}

          {/* Assumptions & Design decisions */}
          <button
            type="button"
            onClick={onOpenAssumptions}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
            title="Read Assumptions, Decisions & Demo Outline"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Supabase status modal */}
          <button
            type="button"
            onClick={onOpenSupabaseSettings}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-xl transition-colors"
            title="Supabase Database Settings"
          >
            <Database className="w-4 h-4" />
          </button>

          {/* Quick Demo Role Switcher (Admin <-> Customer) */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => switchUserRoleDemo('admin')}
              className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors ${
                currentUser?.role === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Admin Mode
            </button>
            <button
              type="button"
              onClick={() => switchUserRoleDemo('customer')}
              className={`text-[11px] font-semibold px-2 py-1 rounded-lg transition-colors ${
                currentUser?.role === 'customer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Customer Mode
            </button>
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 leading-tight">
                {currentUser?.fullName}
              </div>
              <div className="text-[10px] text-slate-500 flex items-center justify-end gap-1">
                <span
                  className={`inline-block w-1.5 h-1.5 rounded-full ${
                    currentUser?.role === 'admin' ? 'bg-purple-600' : 'bg-indigo-600'
                  }`}
                />
                <span className="capitalize">{currentUser?.role}</span>
                {currentUser?.companyName && <span>({currentUser.companyName})</span>}
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
              title="Log out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

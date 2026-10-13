import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Shield, 
  LogOut, 
  UserPlus, 
  Database, 
  HelpCircle, 
  Sun,
  Moon,
  Sparkles,
  Zap,
  Bell,
  BookOpen
} from 'lucide-react';

interface NavbarProps {
  onOpenCreateAccount: () => void;
  onOpenAssumptions: () => void;
  onOpenDatabaseWizard: () => void;
  onOpenUserManual: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenCreateAccount,
  onOpenAssumptions,
  onOpenDatabaseWizard,
  onOpenUserManual,
}) => {
  const { 
    currentUser, 
    impersonatedCustomer, 
    setImpersonatedCustomer, 
    allProfiles, 
    logout, 
    isSupabaseConfigured,
    switchUserRoleDemo
  } = useAuth();

  const { theme, setTheme, toggleTheme } = useTheme();

  const isAdmin = currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.email?.trim().toLowerCase() === 'vzirimwabagabo0@gmail.com';
  const customerProfiles = allProfiles.filter((p) => p.role === 'customer');

  return (
    <header className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 transition-colors">
      {/* Amber banner if Admin is acting on behalf of a customer */}
      {isAdmin && impersonatedCustomer && (
        <div className="bg-amber-500 text-slate-950 px-4 py-1.5 text-xs font-bold flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <span className="bg-black/20 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wide">
              Admin Delegation Active
            </span>
            <span>
              Acting on behalf of <strong>{impersonatedCustomer.companyName || impersonatedCustomer.fullName}</strong> ({impersonatedCustomer.email}). Jobs & candidates will be attributed to this customer.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setImpersonatedCustomer(null)}
            className="bg-slate-950 text-white hover:bg-slate-800 text-[11px] font-bold px-2.5 py-1 rounded-lg transition-colors"
          >
            Exit Customer View
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="brand-mark w-9 h-9 rounded-xl flex items-center justify-center shadow-md">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-slate-900 dark:text-white text-base tracking-tight">Mini ATS</span>
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full shadow-xs">
                PRO
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className={`w-2 h-2 rounded-full ${isSupabaseConfigured ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
              <span>{isSupabaseConfigured ? 'Supabase Live' : 'Local Demo Engine'}</span>
            </div>
          </div>
        </div>

        {/* Center: Admin "Act on Behalf of" Customer Switcher */}
        {isAdmin && (
          <div className="hidden md:flex items-center gap-2 bg-slate-50 dark:bg-slate-800/80 p-1.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 pl-1 flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
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
              className="text-xs font-bold py-1 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="all">Admin Overview (All Accounts)</option>
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
          {/* Real Database Setup Wizard Trigger (Restricted to Super Admin) */}
          {isSuperAdmin && (
            <button
              type="button"
              onClick={onOpenDatabaseWizard}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs ${
                isSupabaseConfigured
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                  : 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:opacity-95'
              }`}
              title="Super Admin: Database Engine & Credentials"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">
                {isSupabaseConfigured ? 'Database Live' : 'Connect Real DB'}
              </span>
            </button>
          )}

          {/* Admin Create Account Button with pending approvals notification */}
          {isAdmin && (
            <button
              type="button"
              onClick={onOpenCreateAccount}
              className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition-all shadow-xs ${
                allProfiles.some((p) => p.role === 'customer' && p.isActive === false)
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 ring-2 ring-amber-400/80 animate-pulse font-extrabold'
                  : 'bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
              }`}
              title={
                allProfiles.filter((p) => p.role === 'customer' && p.isActive === false).length > 0
                  ? `${allProfiles.filter((p) => p.role === 'customer' && p.isActive === false).length} customer account(s) awaiting approval`
                  : 'Create new Admin or Customer accounts'
              }
            >
              {allProfiles.some((p) => p.role === 'customer' && p.isActive === false) ? (
                <Bell className="w-3.5 h-3.5 text-slate-950" />
              ) : (
                <UserPlus className="w-3.5 h-3.5" />
              )}
              <span className="hidden sm:inline">Accounts</span>
              {allProfiles.filter((p) => p.role === 'customer' && p.isActive === false).length > 0 && (
                <span className="bg-slate-950 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5 shadow-xs">
                  {allProfiles.filter((p) => p.role === 'customer' && p.isActive === false).length} pending
                </span>
              )}
            </button>
          )}

          {/* Theme switcher segmented control */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                theme === 'light'
                  ? 'bg-white text-slate-900 shadow-xs ring-1 ring-slate-200'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
              title="Light: White, black, blue"
            >
              <Sun className="w-3.5 h-3.5 text-amber-500" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                theme === 'dark'
                  ? 'bg-slate-900 text-white shadow-xs ring-1 ring-indigo-500/50'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
              title="Dark: Black and white"
            >
              <Moon className="w-3.5 h-3.5 text-indigo-400" />
            </button>
            <button
              type="button"
              onClick={() => setTheme('midnight')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${
                theme === 'midnight'
                  ? 'bg-[#0a272c] text-emerald-300 shadow-xs ring-1 ring-emerald-500'
                  : 'text-slate-500 dark:text-slate-400 hover:text-white'
              }`}
              title="Colorful: Midnight teal"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </button>
          </div>

          {/* User Guide & Interactive Tour */}
          <button
            type="button"
            onClick={onOpenUserManual}
            className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors shadow-2xs"
            title="User Manual & Interactive Tour"
          >
            <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">User Guide</span>
          </button>

          {/* Assumptions & Design decisions */}
          <button
            type="button"
            onClick={onOpenAssumptions}
            className="p-2 text-slate-500 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
            title="Read Assumptions & Architecture"
          >
            <HelpCircle className="w-4 h-4" />
          </button>

          {/* Quick Demo Role Switcher */}
          {!isSupabaseConfigured && import.meta.env.DEV && <div className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => switchUserRoleDemo('admin')}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                currentUser?.role === 'admin'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Admin
            </button>
            <button
              type="button"
              onClick={() => switchUserRoleDemo('customer')}
              className={`text-[11px] font-bold px-2 py-1 rounded-lg transition-colors ${
                currentUser?.role === 'customer'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Customer
            </button>
          </div>}

          {/* User profile capsule */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-200 dark:border-slate-700">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                {currentUser?.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-end gap-1">
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
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
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

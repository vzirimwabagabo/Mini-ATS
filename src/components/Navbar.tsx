import React, { useState, useEffect } from 'react';
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
  Bell, 
  BookOpen,
  Menu,
  X,
  ChevronRight
} from 'lucide-react';
import { AtsLogo } from './AtsLogo';

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

  const { theme, setTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isAdmin = currentUser?.role === 'admin';
  const isSuperAdmin = currentUser?.email?.trim().toLowerCase() === 'vzirimwabagabo0@gmail.com';
  const customerProfiles = allProfiles.filter((p) => p.role === 'customer');
  const pendingApprovalsCount = allProfiles.filter((p) => p.role === 'customer' && p.isActive === false).length;

  // Close menu on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsMenuOpen(false);
    };
    if (isMenuOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMenuOpen]);

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
            className="text-[11px] underline hover:no-underline font-extrabold cursor-pointer"
          >
            Exit Customer View
          </button>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand & Logo */}
        <div className="flex items-center gap-3">
          <div className="brand-mark w-9 h-9 rounded-xl flex items-center justify-center shadow-md">
            <AtsLogo className="w-6 h-6" />
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

        {/* Center: Admin "Act on Behalf of" Customer Switcher (Wide screens) */}
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

        {/* Right side: Clean, spacious layout with the 3-lines menu button */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick pending approvals alert pill for Admin */}
          {isAdmin && pendingApprovalsCount > 0 && (
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenCreateAccount();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-black px-2.5 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs animate-pulse transition-transform"
              title={`${pendingApprovalsCount} customer account(s) awaiting approval`}
            >
              <Bell className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">{pendingApprovalsCount} Pending Approval</span>
              <span className="sm:hidden font-mono">{pendingApprovalsCount}</span>
            </button>
          )}

          {/* User profile capsule */}
          <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-black text-[11px] flex items-center justify-center">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            <div className="text-left">
              <div className="text-xs font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[120px]">
                {currentUser?.fullName}
              </div>
              <div className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                {currentUser?.role} {currentUser?.companyName ? `• ${currentUser.companyName}` : ''}
              </div>
            </div>
          </div>

          {/* 3-Lines Hamburger Menu Button */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open workspace menu"
            className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 shadow-2xs transition-all flex items-center justify-center group"
            title="Menu: Admin, Themes, User Guide & Settings"
          >
            <Menu className="w-5 h-5 group-hover:scale-105 transition-transform" />
            {pendingApprovalsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-pulse" />
            )}
          </button>
        </div>
      </div>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 transition-opacity animate-in fade-in duration-150"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Slide-over 3-Lines Menu Drawer */}
      <aside
        aria-label="Workspace navigation menu"
        className={`fixed inset-y-0 right-0 w-80 sm:w-96 bg-white dark:bg-slate-900 shadow-2xl z-50 flex flex-col border-l border-slate-200 dark:border-slate-800 transition-transform duration-250 ease-out ${
          isMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <AtsLogo className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-extrabold text-slate-900 dark:text-white">Workspace Menu</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">Settings & Administration</div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsMenuOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* User Profile Card */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Signed In As</span>
              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                isAdmin ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
              }`}>
                {currentUser?.role}
              </span>
            </div>
            <div>
              <div className="font-bold text-slate-900 dark:text-white text-sm">{currentUser?.fullName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400 font-mono truncate">{currentUser?.email}</div>
              {currentUser?.companyName && (
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 mt-0.5">
                  🏢 {currentUser.companyName}
                </div>
              )}
            </div>
          </div>

          {/* Admin Tools Section */}
          {isAdmin && (
            <div className="space-y-2">
              <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Administration
              </div>

              {/* Manage Accounts */}
              <button
                type="button"
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenCreateAccount();
                }}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Account Management</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">Create, edit, & approve customers</div>
                  </div>
                </div>
                {pendingApprovalsCount > 0 ? (
                  <span className="bg-amber-500 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow-xs">
                    {pendingApprovalsCount} pending
                  </span>
                ) : (
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                )}
              </button>

              {/* Database Config (Super Admin) */}
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenDatabaseWizard();
                  }}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group shadow-2xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                      <Database className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white">Database Engine</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {isSupabaseConfigured ? 'Connected to live Supabase' : 'Connect real database'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSupabaseConfigured
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800'
                  }`}>
                    {isSupabaseConfigured ? 'Live' : 'Setup'}
                  </span>
                </button>
              )}

              {/* Mobile Context Switcher */}
              <div className="md:hidden p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  Acting Customer Context:
                </label>
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
                  className="w-full text-xs font-bold py-1.5 px-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100"
                >
                  <option value="all">Admin Overview (All Accounts)</option>
                  {customerProfiles.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.companyName || c.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Theme & Display Section */}
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Appearance & Themes
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === 'light'
                    ? 'bg-blue-50 dark:bg-blue-950/40 border-blue-500 text-blue-700 dark:text-blue-300 ring-2 ring-blue-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500" />
                <span className="text-[11px] font-bold">Light</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === 'dark'
                    ? 'bg-slate-900 border-indigo-500 text-white ring-2 ring-indigo-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400" />
                <span className="text-[11px] font-bold">Dark</span>
              </button>
              <button
                type="button"
                onClick={() => setTheme('midnight')}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center gap-1.5 ${
                  theme === 'midnight'
                    ? 'bg-[#082328] border-emerald-500 text-emerald-200 ring-2 ring-emerald-500/20 shadow-xs'
                    : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span className="text-[11px] font-bold">Midnight</span>
              </button>
            </div>
          </div>

          {/* Guidance & Help Section */}
          <div className="space-y-2">
            <div className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              Guidance & Documentation
            </div>

            {/* User Manual & Tour */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenUserManual();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">User Manual & Tour</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Feature walkthrough & workflows</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>

            {/* Architecture & Assumptions */}
            <button
              type="button"
              onClick={() => {
                setIsMenuOpen(false);
                onOpenAssumptions();
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/90 hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition-colors group shadow-2xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">Architecture & Assumptions</div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">Design choices & security model</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

          {/* Quick Demo Role Switcher (in local dev mode) */}
          {!isSupabaseConfigured && import.meta.env.DEV && (
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400">
                Demo Role Simulation:
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => switchUserRoleDemo('admin')}
                  className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                    currentUser?.role === 'admin'
                      ? 'bg-purple-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => switchUserRoleDemo('customer')}
                  className={`text-xs font-bold py-1.5 px-3 rounded-lg transition-colors ${
                    currentUser?.role === 'customer'
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                >
                  Customer
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer: Sign Out */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-900 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign Out of Account
          </button>
        </div>
      </aside>
    </header>
  );
};

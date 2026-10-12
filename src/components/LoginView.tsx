import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight, Sparkles, Building, CheckCircle2, Eye, EyeOff, Zap, Sun, Moon, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export const LoginView: React.FC = () => {
  const { login, createAccount, requestPasswordReset, isSupabaseConfigured } = useAuth();
  const { theme, setTheme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [pendingRegisteredInfo, setPendingRegisteredInfo] = useState<{ email: string; fullName: string; companyName: string } | null>(null);

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPendingRegisteredInfo(null);
    try {
      await login(demoEmail);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPendingRegisteredInfo(null);
    try {
      await requestPasswordReset(email.trim());
      setSuccessMsg(`Password reset instructions sent to ${email.trim()}. Please check your inbox.`);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to send reset instructions');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');
    setPendingRegisteredInfo(null);
    try {
      if (isSignUp) {
        const cleanEmail = email.trim();
        const cleanName = fullName.trim() || email.split('@')[0];
        const cleanCompany = companyName.trim() || 'My Company';
        await createAccount(
          cleanEmail,
          password,
          cleanName,
          'customer',
          cleanCompany
        );
        setIsSignUp(false);
        setPassword('');
        setPendingRegisteredInfo({
          email: cleanEmail,
          fullName: cleanName,
          companyName: cleanCompany,
        });
      } else {
        const ok = await login(email.trim(), password);
        if (!ok) {
          setErrorMsg('Invalid email or credentials. Please check spelling or sign up.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4 relative">
      <div className="absolute top-4 right-4 flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-sm" aria-label="Color theme">
        <button
          type="button"
          onClick={() => setTheme('light')}
          aria-label="Use light theme"
          aria-pressed={theme === 'light'}
          title="Light: white, black, and blue"
          className={`p-2 rounded-lg transition-colors ${theme === 'light' ? 'bg-blue-600 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Sun className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme('dark')}
          aria-label="Use dark theme"
          aria-pressed={theme === 'dark'}
          title="Dark: black and white"
          className={`p-2 rounded-lg transition-colors ${theme === 'dark' ? 'bg-slate-900 text-white ring-1 ring-slate-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Moon className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={() => setTheme('midnight')}
          aria-label="Use colorful midnight theme"
          aria-pressed={theme === 'midnight'}
          title="Colorful: midnight teal"
          className={`p-2 rounded-lg transition-colors ${theme === 'midnight' ? 'bg-emerald-800 text-emerald-100 ring-1 ring-emerald-500' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          <Sparkles className="w-4 h-4" />
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="brand-mark w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-3">
          <Zap className="w-6 h-6" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mini ATS</h2>
        <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
          Fast, AI-Screened Applicant Tracking for Modern Teams
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          {/* Local role simulation is only available in development without Supabase. */}
          {!isSupabaseConfigured && import.meta.env.DEV && <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/50 dark:from-slate-800/60 dark:to-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                1-Click Evaluator Access
              </span>
              <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-100/60 dark:bg-indigo-900/50 px-2 py-0.5 rounded-full">
                Pre-Configured
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-3 leading-relaxed">
              Click below to immediately authenticate and test full roles without entering passwords:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@miniats.com')}
                disabled={loading}
                className="p-2.5 rounded-lg border border-purple-200 dark:border-purple-800/60 bg-purple-50/70 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-purple-900 dark:text-purple-200">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Admin
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-purple-700/80 dark:text-purple-300/80 mt-0.5 truncate">
                  admin@miniats.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah@techwave.io')}
                disabled={loading}
                className="p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800/60 bg-indigo-50/70 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900 dark:text-indigo-200">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    Customer
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-indigo-700/80 dark:text-indigo-300/80 mt-0.5 truncate">
                  sarah@techwave.io
                </div>
              </button>
            </div>
          </div>}

          {pendingRegisteredInfo ? (
            <div className="space-y-4 text-center py-2 animate-in fade-in zoom-in-95 duration-200">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700/80 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-md">
                <Clock className="w-7 h-7" />
              </div>

              <div>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                  <Clock className="w-3 h-3" />
                  Status: Pending Approval
                </span>
                <h3 className="mt-2 text-lg font-black text-slate-900 dark:text-white">
                  Registration Received!
                </h3>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                  Your organization account has been created and is waiting for administrator approval before access is granted.
                </p>
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/80 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Organization:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{pendingRegisteredInfo.companyName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Contact Name:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{pendingRegisteredInfo.fullName}</span>
                </div>
                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                  <span>Registered Email:</span>
                  <span className="font-mono text-[11px] text-slate-800 dark:text-slate-200">{pendingRegisteredInfo.email}</span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 rounded-xl text-left text-xs text-amber-900 dark:text-amber-200 space-y-1.5 leading-relaxed">
                <div className="font-bold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
                  <Shield className="w-3.5 h-3.5" />
                  Why is approval required?
                </div>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                  To safeguard job candidates and prevent fraudulent openings, all customer companies must be verified by a system administrator.
                </p>
                <p className="text-[11px] text-amber-800/90 dark:text-amber-300/90">
                  The administrator has been notified. Once approved, you can sign in directly with your email and password.
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setPendingRegisteredInfo(null);
                  setIsSignUp(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="w-full py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors flex items-center justify-center gap-1.5"
              >
                ← Return to Sign In
              </button>
            </div>
          ) : (
            <>
          <div className="mb-5 text-center text-xs text-slate-500 dark:text-slate-400">
            {isForgotPassword 
              ? 'Reset your password'
              : isSignUp 
                ? 'Create your customer account' 
                : 'Sign in with credentials'}
          </div>

          {errorMsg && (
            <div className={`mb-4 p-3 rounded-lg border text-xs flex items-start gap-2 ${
              errorMsg.includes('pending administrator approval')
                ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200'
                : 'bg-rose-50 dark:bg-rose-950/50 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
            }`}>
              {errorMsg.includes('pending administrator approval') ? (
                <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              )}
              <div>
                {errorMsg.includes('pending administrator approval') && (
                  <div className="font-bold mb-0.5">Account Pending Approval</div>
                )}
                <span>{errorMsg}</span>
              </div>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Account Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="Enter your registered email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  We'll send a password recovery link to this address.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
              >
                {loading ? 'Sending...' : 'Send Password Reset Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {isSignUp && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Sarah Connor"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Company / Organization Name *
                    </label>
                    <div className="relative">
                      <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        required
                        placeholder="TechWave AI"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    placeholder="admin@miniats.com or you@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  {!isSignUp && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setErrorMsg('');
                        setSuccessMsg('');
                      }}
                      className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full text-xs pl-8 pr-10 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    aria-pressed={showPassword}
                    title={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 rounded"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
              >
                {loading ? 'Processing...' : isSignUp ? 'Submit Customer Registration' : 'Sign In'}
              </button>
            </form>
          )}

          <div className="mt-4 text-center space-y-2">
            {isForgotPassword ? (
              <button
                type="button"
                onClick={() => {
                  setIsForgotPassword(false);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold"
              >
                ← Back to Sign In
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setErrorMsg('');
                  setSuccessMsg('');
                }}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold"
              >
                {isSignUp ? 'Already have an account? Sign in' : 'New customer? Create an account'}
              </button>
            )}
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  );
};

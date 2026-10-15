import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight, Sparkles, Building, CheckCircle2, Eye, EyeOff, Zap, Sun, Moon, Clock, AlertCircle, CheckCircle, Trophy, TrendingUp, Award, Layers } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { ResetPasswordModal } from './ResetPasswordModal';
import { AtsLogo } from './AtsLogo';

export const LoginView: React.FC = () => {
  const { login, createAccount, requestPasswordReset, isSupabaseConfigured, isPasswordRecovery, setIsPasswordRecovery, sessionTimedOut, clearSessionTimeoutAlert } = useAuth();
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
        if (password.length < 6) {
          setErrorMsg('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (!companyName.trim()) {
          setErrorMsg('Company / Organization Name is required.');
          setLoading(false);
          return;
        }
        const cleanEmail = email.trim();
        const cleanName = fullName.trim() || email.split('@')[0];
        const cleanCompany = companyName.trim();
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
    <div className="login-screen min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-8 sm:py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Background Ambient Glows */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-4 right-4 z-20 flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 shadow-sm" aria-label="Color theme">
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

      <div className="w-full max-w-6xl mx-auto my-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center z-10">
        {/* Left Column: Form & Quick Access (lg:col-span-5) */}
        <div className="w-full max-w-md mx-auto lg:max-w-none lg:col-span-5">
          <div className="text-center mb-6">
            <div className="brand-mark w-12 h-12 rounded-2xl mx-auto flex items-center justify-center shadow-xl mb-3">
              <AtsLogo className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Mini ATS</h2>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              Fast, AI-Screened Applicant Tracking for Modern Teams
            </p>
          </div>

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

          {sessionTimedOut && !errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in duration-200">
              <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <div className="font-bold mb-0.5">Session Timed Out</div>
                <span>You were automatically signed out after 30 minutes of inactivity to protect your account. Please sign in again to continue.</span>
              </div>
            </div>
          )}

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

        {/* Right Column: High-Impact Product & AI Intelligence Showcase (lg:col-span-7) */}
        <div className="hidden lg:flex flex-col justify-center space-y-6 lg:col-span-7 pl-2 xl:pl-6">
          {/* Header pill & ATS Emblem */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-600 to-indigo-800 flex items-center justify-center shadow-xl shadow-indigo-500/20 ring-1 ring-white/20">
              <AtsLogo className="w-8 h-8 text-white" />
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/15 text-indigo-300 border border-indigo-400/25">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                Live Candidate Intelligence
              </span>
            </div>
          </div>

          <div>
            <h1 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Hire the top 1% with{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-300">
                AI-screened precision
              </span>.
            </h1>
            <p className="mt-2 text-sm text-slate-300 leading-relaxed max-w-xl">
              Real-time resume ingestion, multi-dimensional candidate evaluation, calibrated stage recommendations, and high-velocity Kanban pipelines.
            </p>
          </div>

          {/* Floating Live Product Mockup Card (Maya Lin - Rank #1) */}
          <div className="relative rounded-2xl p-5 bg-slate-900/80 backdrop-blur-xl border border-slate-700/80 shadow-2xl shadow-indigo-950/50 space-y-4">
            {/* Ambient card corner glow */}
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow">
                    ML
                  </div>
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Maya Lin</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-400/15 text-amber-300 border border-amber-400/30">
                      <Trophy className="w-3 h-3 text-amber-400" />
                      #1 Rank
                    </span>
                  </div>
                  <span className="text-xs text-slate-400">Senior Full Stack Engineer</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-extrabold text-xs">
                <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                94% Match
              </div>
            </div>

            {/* Dimensional Fit Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 pt-1">
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Technical Depth</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">96% • Exceptional</div>
                <div className="w-full bg-slate-700/60 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-indigo-400 h-1 rounded-full w-[96%]" />
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Seniority Alignment</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">94% • Strong Match</div>
                <div className="w-full bg-slate-700/60 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-purple-400 h-1 rounded-full w-[94%]" />
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                <div className="text-[10px] text-slate-400 font-medium">Quantified Impact</div>
                <div className="text-xs font-bold text-slate-200 mt-0.5">92% • Metrics Driven</div>
                <div className="w-full bg-slate-700/60 rounded-full h-1 mt-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-1 rounded-full w-[92%]" />
                </div>
              </div>
            </div>

            {/* AI Recommendation Pill */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-950/60 border border-indigo-800/60 text-xs">
              <div className="flex items-center gap-2 text-indigo-200">
                <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
                <div>
                  <span className="font-bold text-white">AI Stage Recommendation:</span>{' '}
                  <span className="text-slate-300">Advance candidate to</span>{' '}
                  <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30 uppercase text-[10px]">
                    Offer
                  </span>
                </div>
              </div>
              <span className="text-[11px] font-semibold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                1-Click Advance
              </span>
            </div>

            {/* Pipeline Stage Tracker */}
            <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-400" />
                <span>Live Pipeline Velocity</span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono">
                <span className="text-slate-500">Sourced (14)</span>
                <span>→</span>
                <span className="text-slate-500">Screening (8)</span>
                <span>→</span>
                <span className="text-slate-500">Interview (4)</span>
                <span>→</span>
                <span className="text-emerald-400 font-bold">Offer (2)</span>
              </div>
            </div>
          </div>

          {/* Three Feature Guarantees */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Shield className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Row-Level Security (RLS)</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <Zap className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Dual-Engine AI Matching</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Zero-Leakage Privacy</span>
            </div>
          </div>
        </div>
      </div>

      <ResetPasswordModal
        isOpen={isPasswordRecovery}
        onClose={() => setIsPasswordRecovery(false)}
      />
    </div>
  );
};

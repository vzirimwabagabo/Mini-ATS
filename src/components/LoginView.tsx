import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Shield, User, Lock, Mail, ArrowRight, Sparkles, Building, CheckCircle2 } from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, createAccount, isSupabaseConfigured } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleQuickLogin = async (demoEmail: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      await login(demoEmail, 'password123');
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      if (isSignUp) {
        await createAccount(
          email.trim(),
          password,
          fullName.trim() || email.split('@')[0],
          'customer',
          companyName.trim() || 'My Company'
        );
        await login(email.trim(), password);
      } else {
        const ok = await login(email.trim(), password);
        if (!ok) {
          setErrorMsg('Invalid email or credentials. Use Quick Login or check spelling.');
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 px-4">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-500 mx-auto flex items-center justify-center text-white font-black text-2xl shadow-xl shadow-indigo-500/20 mb-3">
          ⚡
        </div>
        <h2 className="text-2xl font-black text-white tracking-tight">Mini ATS</h2>
        <p className="mt-1 text-xs text-slate-400">
          Fast, AI-Screened Applicant Tracking for Modern Teams
        </p>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white/95 backdrop-blur-md py-8 px-6 sm:px-8 shadow-2xl rounded-2xl border border-white/20">
          {/* Quick Demo Access Box */}
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-br from-slate-50 to-indigo-50/50 border border-indigo-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                1-Click Evaluator Access
              </span>
              <span className="text-[10px] text-indigo-600 font-semibold bg-indigo-100/60 px-2 py-0.5 rounded-full">
                Pre-Configured
              </span>
            </div>
            <p className="text-[11px] text-slate-500 mb-3 leading-relaxed">
              Click below to immediately authenticate and test full roles without entering passwords:
            </p>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin@miniats.com')}
                disabled={loading}
                className="p-2.5 rounded-lg border border-purple-200 bg-purple-50/70 hover:bg-purple-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-purple-900">
                  <span className="flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-purple-600" />
                    Admin
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-purple-700/80 mt-0.5 truncate">
                  admin@miniats.com
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('sarah@techwave.io')}
                disabled={loading}
                className="p-2.5 rounded-lg border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-left transition-all group"
              >
                <div className="flex items-center justify-between text-xs font-bold text-indigo-900">
                  <span className="flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    Customer
                  </span>
                  <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
                <div className="text-[10px] text-indigo-700/80 mt-0.5 truncate">
                  sarah@techwave.io
                </div>
              </button>
            </div>
          </div>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-2 bg-white text-slate-400">or sign in with credentials</span>
            </div>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Sarah Connor"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      placeholder="TechWave AI"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
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
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl shadow-sm text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors"
            >
              {loading ? 'Processing...' : isSignUp ? 'Create Customer Account' : 'Sign In'}
            </button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              {isSignUp ? 'Already have an account? Sign in' : 'New customer? Create an account'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

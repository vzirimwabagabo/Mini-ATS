import React, { useState } from 'react';
import schemaSql from '../../supabase/schema.sql?raw';
import { getSupabaseConfig, updateSupabaseCredentials, getSupabaseClient } from '../lib/supabase';
import { 
  X, 
  Database, 
  CheckCircle, 
  Copy, 
  ExternalLink, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  Play,
  Terminal,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { saveJob, saveCandidate } from '../lib/storage';

interface DatabaseSetupWizardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DatabaseSetupWizardModal: React.FC<DatabaseSetupWizardModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.key);
  const [copiedSql, setCopiedSql] = useState(false);
  const [testStatus, setTestStatus] = useState<{
    tested: boolean;
    success: boolean;
    message: string;
    stats?: { profiles: number; jobs: number; candidates: number };
  } | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [activeTab, setActiveTab] = useState<'guide' | 'connect'>('guide');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(schemaSql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleTestConnection = async () => {
    if (!url.trim() || !anonKey.trim()) {
      setTestStatus({
        tested: true,
        success: false,
        message: 'Please provide both Project URL and Anon Public Key.'
      });
      return;
    }

    setIsTesting(true);
    setTestStatus(null);
    try {
      updateTransitionalCredentials(url.trim(), anonKey.trim());
      const client = getSupabaseClient();
      if (!client) throw new Error('Could not instantiate Supabase client.');

      // Check profiles table
      const { data: profiles, error: pErr } = await client.from('profiles').select('id', { count: 'exact' });
      if (pErr) {
        setTestStatus({
          tested: true,
          success: false,
          message: `Connected to Supabase, but encountered error: ${pErr.message}. Have you run the SQL migration schema yet?`
        });
        return;
      }

      const { data: jobs } = await client.from('jobs').select('id', { count: 'exact' });
      const { data: candidates } = await client.from('candidates').select('id', { count: 'exact' });

      setTestStatus({
        tested: true,
        success: true,
        message: 'Connected to Supabase and required tables are available. Run supabase/security_tests.sql against a test database to verify tenant RLS.',
        stats: {
          profiles: profiles?.length || 0,
          jobs: jobs?.length || 0,
          candidates: candidates?.length || 0
        }
      });
    } catch (err: any) {
      setTestStatus({
        tested: true,
        success: false,
        message: `Connection failed: ${err.message || 'Unknown network error'}`
      });
    } finally {
      setIsTesting(false);
    }
  };

  const updateTransitionalCredentials = (u: string, k: string) => {
    localStorage.setItem('ats_supabase_url', u);
    localStorage.setItem('ats_supabase_anon_key', k);
  };

  const handleApplyAndReload = () => {
    updateSupabaseCredentials(url.trim(), anonKey.trim());
    window.location.reload();
  };

  const handleRevertToLocal = () => {
    updateSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    setTestStatus({
      tested: true,
      success: true,
      message: 'Switched back to local demo persistence engine.'
    });
    setTimeout(() => window.location.reload(), 800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 text-slate-800 dark:text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-600 text-white rounded-xl shadow-xs">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold tracking-tight">Real Database Setup Wizard</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Connect your free Supabase PostgreSQL cloud database in 2 minutes
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/30 gap-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('guide')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'guide'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            Step-by-Step Guide & SQL
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('connect')}
            className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'connect'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            Connect & Live Test
          </button>
        </div>

        {activeTab === 'guide' ? (
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
            {/* Step 1 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">1</span>
                  Create Free Supabase Project
                </span>
                <a
                  href="https://supabase.com/dashboard/projects"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  Open Supabase <ExternalLink className="w-3 h-3" />
                </a>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                Head over to <strong>Supabase.com</strong>, click <strong>"New Project"</strong>, pick any project name (e.g. <code>mini-ats</code>) and set a database password. It deploys in ~40 seconds.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">2</span>
                  Run the Database SQL Schema
                </span>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white px-2.5 py-1 rounded-md transition-colors shadow-xs"
                >
                  {copiedSql ? (
                    <>
                      <Check className="w-3 h-3" />
                      SQL Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      Copy Schema SQL
                    </>
                  )}
                </button>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                In your Supabase project dashboard, click <strong>"SQL Editor"</strong> in the left sidebar, click <strong>"New Query"</strong>, paste the copied SQL schema, and hit <strong>"RUN"</strong>. This creates the <code>profiles</code>, <code>jobs</code>, and <code>candidates</code> tables, indexes, and RLS policies.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
              <span className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[11px] flex items-center justify-center font-bold">3</span>
                Copy API Credentials
              </span>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                In Supabase, navigate to <strong>Project Settings → API</strong>. Copy your <strong>Project URL</strong> and <strong>Project API key (anon / public)</strong>.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('connect')}
                  className="inline-flex items-center gap-1.5 font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  Proceed to Step 4: Connect & Test
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-6 space-y-4 text-xs">
            {testStatus && (
              <div
                className={`p-3.5 rounded-xl border flex items-start gap-2.5 ${
                  testStatus.success
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 text-emerald-800 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 text-rose-800 dark:text-rose-300'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-bold">{testStatus.message}</p>
                  {testStatus.stats && (
                    <p className="text-[11px] mt-1 opacity-90">
                      Live Cloud Rows: {testStatus.stats.profiles} Profiles, {testStatus.stats.jobs} Jobs, {testStatus.stats.candidates} Candidates.
                    </p>
                  )}
                </div>
              </div>
            )}

            <div>
              <label className="block font-semibold mb-1">
                Supabase Project URL *
              </label>
              <input
                type="text"
                placeholder="https://xyzcompany.supabase.co"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold mb-1">
                Supabase Anon Public Key *
              </label>
              <input
                type="password"
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                className="w-full p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-mono text-xs"
              />
            </div>

            <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800 gap-2">
              <button
                type="button"
                onClick={handleRevertToLocal}
                className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline"
              >
                Use Local Demo Engine
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition-colors flex items-center gap-1.5"
                >
                  {isTesting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  Test Connection
                </button>

                <button
                  type="button"
                  onClick={handleApplyAndReload}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                >
                  Save & Reload App
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { getSupabaseConfig, updateSupabaseCredentials } from '../lib/supabase';
import { X, Database, CheckCircle, ExternalLink, Key, AlertTriangle } from 'lucide-react';

interface SupabaseSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSettingsModal: React.FC<SupabaseSettingsModalProps> = ({ isOpen, onClose }) => {
  const currentConfig = getSupabaseConfig();
  const [url, setUrl] = useState(currentConfig.url);
  const [anonKey, setAnonKey] = useState(currentConfig.key);
  const [statusMsg, setStatusMsg] = useState('');

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseCredentials(url, anonKey);
    setStatusMsg('Supabase credentials saved! Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  const handleResetToDemo = () => {
    updateSupabaseCredentials('', '');
    setUrl('');
    setAnonKey('');
    setStatusMsg('Switched back to local demo persistence engine. Reloading...');
    setTimeout(() => {
      window.location.reload();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-600 text-white rounded-lg">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Supabase Connection Settings</h2>
              <p className="text-xs text-slate-500">
                Connect to a live Supabase project or use local demo mode
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {statusMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{statusMsg}</span>
            </div>
          )}

          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-800">Connection Mode:</span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  currentConfig.isConfigured
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-blue-100 text-blue-800'
                }`}
              >
                {currentConfig.isConfigured ? 'Live Supabase Cloud' : 'Local Demo Storage (Active)'}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              The app functions out of the box with realistic mock data. To link your remote Supabase project, paste your Project URL and Anon Key below, and execute <code>supabase/schema.sql</code> in your Supabase SQL editor.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Project URL
            </label>
            <input
              type="text"
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Anon / Public Key
            </label>
            <input
              type="password"
              placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
              value={anonKey}
              onChange={(e) => setAnonKey(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-mono text-xs"
            />
          </div>

          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={handleResetToDemo}
              className="text-slate-500 hover:text-slate-800 underline text-xs"
            >
              Clear & Use Local Storage
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg shadow-xs"
              >
                Save & Connect
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

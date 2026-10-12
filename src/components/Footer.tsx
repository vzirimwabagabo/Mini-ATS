import React from 'react';
import { Job, Candidate } from '../types';
import { useAuth } from '../context/AuthContext';
import { 
  Database, 
  Sparkles, 
  Shield, 
  Briefcase, 
  Users, 
  ExternalLink, 
  GitBranch, 
  HelpCircle,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';

interface FooterProps {
  jobs: Job[];
  candidates: Candidate[];
  onOpenAssumptions: () => void;
  onOpenDatabaseWizard: () => void;
  onResetData: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  jobs,
  candidates,
  onOpenAssumptions,
  onOpenDatabaseWizard,
  onResetData
}) => {
  const { currentUser, impersonatedCustomer, isSupabaseConfigured } = useAuth();

  const hiredCount = candidates.filter(c => c.stage === 'hired').length;
  const interviewCount = candidates.filter(c => c.stage === 'interview').length;
  const offerCount = candidates.filter(c => c.stage === 'offer').length;

  return (
    <footer className="shrink-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2.5 text-xs text-slate-500 dark:text-slate-400 transition-colors z-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5">
        {/* Left: System Status Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Brand & Version */}
          <div className="flex items-center gap-1.5 font-bold text-slate-800 dark:text-slate-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Mini ATS</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              v1.2.0
            </span>
          </div>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          {/* Database Status Button */}
          <button
            type="button"
            onClick={onOpenDatabaseWizard}
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border transition-all ${
              isSupabaseConfigured
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800 hover:bg-blue-100'
            }`}
            title="Configure Supabase Database"
          >
            <Database className="w-3 h-3" />
            <span>{isSupabaseConfigured ? 'Supabase Live' : 'Local Storage'}</span>
          </button>

          {/* Gemini AI Status */}
          <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Gemini 3.8 Flash AI</span>
          </div>

          {/* Active Context */}
          {impersonatedCustomer ? (
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
              <Shield className="w-3 h-3 text-amber-600" />
              <span>Acting for: {impersonatedCustomer.companyName || impersonatedCustomer.fullName}</span>
            </div>
          ) : (
            <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
              <span>Signed in as <strong className="text-slate-700 dark:text-slate-200">{currentUser?.fullName}</strong> ({currentUser?.role})</span>
            </div>
          )}
        </div>

        {/* Center: Live Pipeline Stats */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <Briefcase className="w-3 h-3 text-indigo-500" />
            <span><strong>{jobs.length}</strong> Jobs</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1">
            <Users className="w-3 h-3 text-blue-500" />
            <span><strong>{candidates.length}</strong> Candidates</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-purple-600 dark:text-purple-400 font-medium">
            <span>{interviewCount} Interview</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
            <span>{offerCount} Offer</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
            <CheckCircle2 className="w-3 h-3" />
            <span>{hiredCount} Hired</span>
          </div>
        </div>

        {/* Right: Quick Action Links & GitHub */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onOpenAssumptions}
            className="inline-flex items-center gap-1 text-[11px] text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="View Architecture & Assumptions"
          >
            <HelpCircle className="w-3 h-3" />
            <span className="hidden sm:inline">Assumptions</span>
          </button>

          <button
            type="button"
            onClick={() => {
              if (confirm('Reset demo jobs and candidate records to fresh initial state?')) {
                onResetData();
              }
            }}
            className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
            title="Reset to fresh demo dataset"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>

          <span className="text-slate-300 dark:text-slate-700">|</span>

          <a
            href="https://github.com/vzirimwabagabo/Mini-ATS"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            title="View public repository on GitHub"
          >
            <GitBranch className="w-3 h-3" />
            <span>GitHub</span>
            <ExternalLink className="w-2.5 h-2.5 opacity-60" />
          </a>
        </div>
      </div>
    </footer>
  );
};

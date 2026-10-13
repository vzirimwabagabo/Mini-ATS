import React from 'react';
import { Job, Candidate } from '../types';
import { useAuth } from '../context/AuthContext';
import { LegalDocType } from './LegalModal';
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
  CheckCircle2,
  Lock,
  Scale,
  FileText,
  AlertCircle,
  Building2,
  Server,
  HeartHandshake,
  BookOpen
} from 'lucide-react';

interface FooterProps {
  jobs: Job[];
  candidates: Candidate[];
  onOpenAssumptions: () => void;
  onOpenDatabaseWizard: () => void;
  onOpenLegal: (doc: LegalDocType) => void;
  onResetData: () => void;
  onOpenUserManual: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  jobs,
  candidates,
  onOpenAssumptions,
  onOpenDatabaseWizard,
  onOpenLegal,
  onResetData,
  onOpenUserManual
}) => {
  const { currentUser, impersonatedCustomer, isSupabaseConfigured } = useAuth();

  const hiredCount = candidates.filter(c => c.stage === 'hired').length;
  const interviewCount = candidates.filter(c => c.stage === 'interview').length;
  const offerCount = candidates.filter(c => c.stage === 'offer').length;

  return (
    <footer className="w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs transition-colors mt-auto">
      {/* Upper Section: 4-Column SaaS Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Col 1: Platform Brand & Mission */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
                M
              </div>
              <span className="font-extrabold text-sm text-slate-900 dark:text-white tracking-tight">Mini ATS</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold border border-indigo-200 dark:border-indigo-800">
                Enterprise B2B
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              High-velocity Applicant Tracking System designed for fast-growing startups, agencies, and enterprise recruiting teams.
            </p>
            <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Systems Operational (99.9% Uptime)
              </span>
            </div>
          </div>

          {/* Col 2: Product & Capabilities */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Briefcase className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Product &amp; Engine
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                  Visual Kanban Pipeline (Compact &amp; Comfortable)
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                  Content-Aware Auto-Shrinking Stages
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                  Gemini 3.8 Flash AI Screening &amp; Radar
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                  PDF &amp; DOCX Client-Side Resume Extraction
                </span>
              </li>
              <li>
                <span className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-default">
                  Admin Delegation ("Act on Customer Behalf")
                </span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenUserManual}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold"
                >
                  <BookOpen className="w-3 h-3" />
                  User Manual &amp; Interactive Tour
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenAssumptions}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:underline"
                >
                  <HelpCircle className="w-3 h-3" />
                  Product Assumptions &amp; Specs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: Legal, Privacy & Compliance (Legally Accepted) */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Legal &amp; Compliance
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('privacy')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-left"
                >
                  <Shield className="w-3 h-3 text-slate-400" />
                  Privacy Policy (GDPR &amp; CCPA)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('terms')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-left"
                >
                  <FileText className="w-3 h-3 text-slate-400" />
                  Terms of Service &amp; Master Agreement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('ai-ethics')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-left"
                >
                  <AlertCircle className="w-3 h-3 text-purple-500" />
                  AI Transparency (EU AI Act &amp; EEOC)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('security')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-left"
                >
                  <Lock className="w-3 h-3 text-emerald-500" />
                  Security &amp; Data Processing Agreement
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegal('cookies')}
                  className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors flex items-center gap-1 text-left"
                >
                  <CheckCircle2 className="w-3 h-3 text-slate-400" />
                  Cookie Policy &amp; Storage Preferences
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Security, Database & Support */}
          <div className="space-y-2.5">
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
              <Server className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              Security &amp; Operations
            </h4>
            <div className="space-y-2 text-xs">
              <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">Database Engine:</span>
                  {currentUser?.email?.trim().toLowerCase() === 'vzirimwabagabo0@gmail.com' && (
                    <button
                      type="button"
                      onClick={onOpenDatabaseWizard}
                      className="font-bold text-[10px] text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Configure
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                  <Database className="w-3 h-3 text-emerald-500" />
                  <span>{isSupabaseConfigured ? 'PostgreSQL Supabase (RLS Active)' : 'Local Storage Fallback'}</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-500">Live Workspace:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 text-[11px]">
                  {jobs.length} Jobs &bull; {candidates.length} Applicants
                </span>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {!isSupabaseConfigured && (
                  <>
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
                      <span>Reset Demo Data</span>
                    </button>
                    <span className="text-slate-300 dark:text-slate-700">&bull;</span>
                  </>
                )}

                <a
                  href="https://github.com/vzirimwabagabo/Mini-ATS"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-700 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
                >
                  <GitBranch className="w-3 h-3" />
                  <span>GitHub Repo</span>
                  <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lower Bar: Copyright, Compliance Badges, & Impersonation Banner */}
      <div className="border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-950/70 px-4 sm:px-6 lg:px-8 py-3 text-[11px]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3 text-slate-500 dark:text-slate-400">
            <span>&copy; {new Date().getFullYear()} Mini ATS Inc. All rights reserved.</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1">
              <Lock className="w-3 h-3 text-emerald-500" />
              <span>TLS 1.3 / AES-256 Encrypted</span>
            </span>
            <span>&bull;</span>
            <span>SOC 2 Type II Ready</span>
            <span>&bull;</span>
            <span>Human-in-the-Loop AI Assurance</span>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {impersonatedCustomer ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 font-bold border border-amber-300 dark:border-amber-700">
                <Shield className="w-3 h-3" />
                Delegated Session: {impersonatedCustomer.companyName || impersonatedCustomer.fullName}
              </span>
            ) : (
              <span className="text-slate-500 dark:text-slate-400">
                User: <strong className="text-slate-700 dark:text-slate-200">{currentUser?.fullName}</strong> ({currentUser?.role})
              </span>
            )}

            <button
              type="button"
              onClick={() => onOpenLegal('privacy')}
              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Privacy
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('terms')}
              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Terms
            </button>
            <button
              type="button"
              onClick={() => onOpenLegal('ai-ethics')}
              className="text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              AI Disclosure
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

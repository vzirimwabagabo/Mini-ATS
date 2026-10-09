import React, { useState } from 'react';
import { X, Check, Copy, FileText, Brain, Shield, Users, Layers } from 'lucide-react';

interface AssumptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AssumptionsModal: React.FC<AssumptionsModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const emailSummaryText = `Subject: Mini ATS - Assumptions, Architecture & AI Assessment Approach

Hi,

Here is the summary of assumptions made while designing and building the Mini ATS platform for our first customer release:

1. TARGET CUSTOMER & USE CASE:
- Fast-growing tech startups, SMBs, and boutique recruitment agencies who need a lightweight, intuitive pipeline without the bloated complexity of legacy ATS systems (Greenhouse/Workday).
- Customers prioritize speed: posting a job in under 60 seconds, adding candidate profiles directly with their LinkedIn links, and reviewing applicants in a compact visual Kanban board.

2. MULTI-TENANCY & ADMIN DELEGATION ("ACT ON BEHALF"):
- Customer accounts own their jobs and candidates.
- Administrators possess dual functionality: global system administration (creating customer & admin accounts) AND full delegation/impersonation.
- The Admin can select any customer from the "Customer Context" dropdown to view the workspace precisely as that customer, posting jobs and managing applicants on their behalf.

3. KANBAN DESIGN & COMPACT MODE:
- Recruiters review dozens of candidates daily, making vertical screen real-estate critical. We built a native toggle between "Compact View" (high information density) and "Comfortable View" (card tags & notes preview).
- Six-stage pipeline: Sourced -> Screening -> Interview -> Offer -> Hired -> Archived, complete with drag-and-drop and one-click stage advance arrows.

4. AI-BASED CV ASSESSMENT APPROACH:
- Feature implemented: Intelligent CV & LinkedIn profile matcher evaluating applicants against job requirements.
- Core metrics generated: 0-100% Suitability Match Score, Executive Summary, Key Strengths, and Identified Gaps/Probes.
- Architectural approach for production:
  a. Ingestion: OCR / PDF text extraction of candidate resumes + LinkedIn profile scraping.
  b. Structured Embedding & LLM Scoring: Prompting an LLM (e.g. Gemini 1.5 Flash) with strict JSON schema to evaluate qualification overlap without demographic bias.
  c. Human-in-the-loop: AI acts strictly as an advisory copilot; recruiter always retains final stage advancement authority.

5. BACKEND & SUPABASE ARCHITECTURE:
- Supabase (PostgreSQL) backend with Row Level Security (RLS) policies enforcing multi-tenancy.
- Dual persistence: Works natively with real Supabase credentials, with a pre-seeded local persistence layer for immediate, friction-free testing.

Platform Access:
- Admin Login: admin@miniats.com / password123
- Customer Login: sarah@techwave.io / password123

Best regards,
Mini ATS Engineering Team`;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(emailSummaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Assumptions, Architecture & AI Approach
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Product decisions and copyable email summary for delivery
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-5 text-xs text-slate-700 leading-relaxed">
          {/* Quick Copy Email Button */}
          <div className="p-3.5 bg-indigo-50 border border-indigo-200 rounded-xl flex items-center justify-between">
            <div>
              <span className="font-bold text-indigo-950 block">Ready-to-Send Email Summary</span>
              <span className="text-[11px] text-indigo-700">
                Click below to copy the complete assumptions email text to your clipboard.
              </span>
            </div>
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors shadow-xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  Copy Email
                </>
              )}
            </button>
          </div>

          {/* Section 1: Customer Needs & Preferences */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-indigo-600" />
              1. Customer Needs & Preferences
            </h3>
            <p>
              We assumed our first customer is an early-stage startup founder or agency recruiter who values speed above all else. They do not want bloated enterprise workflows; they want to post a role in 30 seconds, paste a LinkedIn URL or candidate bio, and immediately view a responsive Kanban pipeline.
            </p>
          </div>

          {/* Section 2: Admin Delegation */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-600" />
              2. Admin Delegation ("Act on Behalf of Customer")
            </h3>
            <p>
              Admins have a top-bar <strong>"Customer Context"</strong> switcher. Selecting a customer activates an amber masquerade banner, allowing the admin to post jobs and move candidate stages directly in that customer's account without requiring access to their private credentials.
            </p>
          </div>

          {/* Section 3: Compact Kanban & UX */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              3. Compact Kanban Layout
            </h3>
            <p>
              To satisfy high-density recruiter demands, we implemented both a <strong>Compact View</strong> (single-line candidate cards for scanning 50+ candidates) and a <strong>Comfortable View</strong> (showing tags, notes, and AI match badges). Both modes support drag-and-drop and one-click directional stage advance.
            </p>
          </div>

          {/* Section 4: AI Resume Screening */}
          <div className="space-y-2">
            <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-emerald-600" />
              4. AI-Based CV Assessment Strategy
            </h3>
            <p>
              Our solution includes a real-time AI CV screening function (`evaluateCandidateCV`). It computes:
            </p>
            <ul className="list-disc list-inside space-y-1 pl-2 text-slate-600">
              <li><strong>Match Score (0-100%)</strong> based on skills and experience overlap.</li>
              <li><strong>Executive Summary</strong> highlighting suitability for the role.</li>
              <li><strong>Key Strengths & Identified Gaps</strong> for recruiter interview probing.</li>
              <li><strong>Recommended Next Stage</strong> with a 1-click "Apply Recommendation" action.</li>
            </ul>
            <p className="mt-2 italic text-slate-500">
              In production, we recommend deploying an LLM Edge Function on Supabase using Gemini/Claude with blinded resume parsing (removing candidate names, gender pronouns, and photos) to eliminate demographic bias.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

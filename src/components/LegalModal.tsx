import React, { useState } from 'react';
import { X, Shield, FileText, Scale, Lock, CheckCircle2, AlertCircle } from 'lucide-react';

export type LegalDocType = 'privacy' | 'terms' | 'ai-ethics' | 'security' | 'cookies';

interface LegalModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDoc?: LegalDocType;
}

export const LegalModal: React.FC<LegalModalProps> = ({ isOpen, onClose, initialDoc = 'privacy' }) => {
  const [activeTab, setActiveTab] = useState<LegalDocType>(initialDoc);

  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialDoc);
    }
  }, [isOpen, initialDoc]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Legal, Privacy & Compliance Center</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official regulatory disclosures, data protection agreements, and terms of service
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

        {/* Document Navigation Tabs */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 text-xs font-semibold px-4 sm:px-6 pt-2 bg-slate-50/50 dark:bg-slate-900/40 gap-2 sm:gap-4 overflow-x-auto shrink-0">
          {[
            { id: 'privacy' as LegalDocType, icon: Shield, label: 'Privacy Policy' },
            { id: 'terms' as LegalDocType, icon: FileText, label: 'Terms of Service' },
            { id: 'ai-ethics' as LegalDocType, icon: AlertCircle, label: 'AI Transparency & Ethics' },
            { id: 'security' as LegalDocType, icon: Lock, label: 'Security & DPA' },
            { id: 'cookies' as LegalDocType, icon: CheckCircle2, label: 'Cookie Policy' },
          ].map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 shrink-0 ${
                activeTab === id
                  ? 'border-indigo-600 text-indigo-700 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
            </button>
          ))}
        </div>

        {/* Document Body */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-900/60 rounded-xl">
                <p className="font-semibold text-indigo-950 dark:text-indigo-200">
                  Last Updated: October 2026 | Compliant with GDPR (EU), CCPA (California), and Global Data Protection Standards
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Information We Collect</h3>
              <p>
                Mini ATS ("the Platform") processes candidate and customer information strictly for employment recruitment and talent pipeline management. This data includes:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Candidate Profile Data:</strong> Full name, email address, phone number, LinkedIn URL, portfolio link, and uploaded resumes (PDF, DOCX).</li>
                <li><strong>Recruitment Data:</strong> Job opening titles, compensation ranges, recruiter notes, interview stages, and evaluation history.</li>
                <li><strong>Customer & Account Data:</strong> Account credentials, business contact emails, and organizational affiliations.</li>
              </ul>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Lawful Basis & Use of Data</h3>
              <p>
                Candidate information is processed under legitimate interest for candidate evaluation or consent where provided by applicants. We do not sell, rent, or monetize personal information. Candidate information is never used for advertising or marketing profiling.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Third-Party Sub-Processors</h3>
              <p>
                Data is stored and processed with industry-leading infrastructure partners:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li><strong>Supabase Inc.:</strong> Cloud PostgreSQL database hosting with Row-Level Security (RLS) and encryption-at-rest.</li>
                <li><strong>Google Cloud (Gemini API):</strong> Resume parsing and heuristic assistance. Candidate data sent via API is processed statelessly and is NOT stored or used to train Google's base foundation models.</li>
              </ul>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Data Subject Rights (GDPR / CCPA)</h3>
              <p>
                Candidates and users have the right to request access to their stored personal data, request rectification of inaccurate records, or demand permanent erasure ("Right to be Forgotten"). Contact <strong>privacy@miniats.com</strong> to exercise these rights.
              </p>
            </div>
          )}

          {activeTab === 'terms' && (
            <div className="space-y-4">
              <div className="p-3 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                <p className="font-semibold text-slate-800 dark:text-slate-200">
                  Mini ATS B2B Master Services Agreement & Terms of Use
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Service Scope & License</h3>
              <p>
                Mini ATS provides a software-as-a-service (SaaS) applicant tracking platform allowing organizations to post job openings, manage candidates, and organize interview stages. Subject to these terms, customers are granted a non-exclusive, non-transferable license to access and use the platform.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. User Accounts & Admin Delegation</h3>
              <p>
                Organizations may provision Admin and Customer user roles. Administrators possess delegation authority to manage jobs and candidates on behalf of customer accounts. Customers are solely responsible for keeping account credentials confidential and for all actions executed within their tenancy.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Fair Employment & Non-Discrimination</h3>
              <p>
                Customers agree to use the platform in strict compliance with all applicable labor laws, including Title VII of the Civil Rights Act, the Americans with Disabilities Act, and the Equal Employment Opportunity Commission (EEOC) regulations. Posting discriminatory requirements or using the platform for unlawful screening is strictly prohibited and grounds for immediate termination.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">4. Availability & SLA</h3>
              <p>
                The platform is architected for 99.9% uptime. Scheduled maintenance will be announced with prior notice. Neither party shall be liable for indirect, incidental, or consequential damages.
              </p>
            </div>
          )}

          {activeTab === 'ai-ethics' && (
            <div className="space-y-4">
              <div className="p-3 bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 rounded-xl">
                <p className="font-semibold text-purple-950 dark:text-purple-200">
                  AI Transparency Disclosure — Compliant with the EU AI Act (High-Risk Employment Systems) & EEOC Guidelines
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Human-in-the-Loop Principle</h3>
              <p>
                <strong>The Mini ATS AI assessment tool is strictly an advisory assistant.</strong> The AI does NOT automatically reject candidates, hire candidates, or advance stages. All stage transitions, hiring decisions, and candidate communications are made exclusively by authorized human recruiters.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Objective Competency Matching</h3>
              <p>
                Our assessment algorithm evaluates qualification alignment based solely on:
              </p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Explicit skill keyword overlap against stated job requirements.</li>
                <li>Duration of relevant domain experience.</li>
                <li>Quantified measurable achievements in previous employment.</li>
              </ul>
              <p>
                The model is explicitly instructed to disregard demographic variables, age, gender, race, nationality, or personal identifiers.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Calibrated Scoring & Auditability</h3>
              <p>
                Scores are calibrated against an objective radar (Technical Depth, Experience Relevance, Seniority Alignment, Achievement Quality, and CV Clarity). The AI provides explicit scoring rationales and suggests probe questions to verify candidate claims during human interviews.
              </p>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 rounded-xl">
                <p className="font-semibold text-emerald-950 dark:text-emerald-200">
                  Data Protection Agreement (DPA) & Infrastructure Security Measures
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Encryption & Data Isolation</h3>
              <p>
                All data is encrypted in transit using TLS 1.3 and at rest using AES-256. Multi-tenancy is enforced at the PostgreSQL database layer via Row Level Security (RLS) policies, preventing unauthorized cross-tenant data leakage.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. SOC 2 Type II & ISO 27001 Alignment</h3>
              <p>
                Infrastructure hosted by Supabase and Google Cloud operates under SOC 2 Type II, ISO 27001, and HIPAA compliance certifications. Automated backups are captured daily with point-in-time recovery.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">3. Access Controls & Audit Trails</h3>
              <p>
                Access to candidate records is role-gated. Sensitive administrative actions, candidate deletions, and account creations are logged with timestamps.
              </p>
            </div>
          )}

          {activeTab === 'cookies' && (
            <div className="space-y-4">
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 rounded-xl">
                <p className="font-semibold text-blue-950 dark:text-blue-200">
                  Cookie & Local Storage Usage Disclosure
                </p>
              </div>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">1. Strictly Necessary Storage</h3>
              <p>
                Mini ATS uses browser LocalStorage solely to maintain authenticated session tokens, user theme preferences (Light/Dark/Midnight), and active customer impersonation state.
              </p>

              <h3 className="text-sm font-bold text-slate-900 dark:text-white">2. Zero Tracking or Advertising Cookies</h3>
              <p>
                We do NOT deploy third-party advertising cookies, cross-site trackers, or marketing analytics beacons. Your recruitment data is never monitored by third-party ad networks.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <span className="text-[11px] text-slate-400">
            Mini ATS Legal Operations &copy; 2026. All Rights Reserved.
          </span>
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-semibold px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-xs"
          >
            Acknowledge & Close
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, 
  BookOpen, 
  Compass, 
  Sparkles, 
  Shield, 
  Briefcase, 
  Users, 
  Lock, 
  Clock, 
  Search, 
  ArrowRight, 
  ArrowLeft, 
  CheckCircle2, 
  FileText, 
  Building, 
  Eye, 
  Key, 
  Check, 
  Layers, 
  SlidersHorizontal,
  ChevronRight,
  HelpCircle,
  Zap,
  Info
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'tour' | 'manual';
}

const STORAGE_KEY_TOUR_COMPLETED = 'mini_ats_tour_completed';

interface TourStep {
  title: string;
  role: 'both' | 'customer' | 'admin';
  icon: React.ReactNode;
  badge: string;
  badgeColor: string;
  summary: string;
  bulletPoints: string[];
  proTip: string;
}

const TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Mini ATS',
    role: 'both',
    icon: <Zap className="w-6 h-6 text-indigo-500" />,
    badge: 'Platform Overview',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    summary: 'Mini ATS is a high-speed, modern Applicant Tracking System engineered with AI-powered resume screening, compact Kanban workflows, and strict multi-tenant data isolation.',
    bulletPoints: [
      'Two distinct roles: Administrators oversee the platform; Customers manage company hiring.',
      'Operates seamlessly with real Supabase cloud backends or offline instant demo storage.',
      'Theme flexibility: Switch effortlessly between Light (Clean Blue), Dark (Monochrome), and Midnight (Deep Teal).'
    ],
    proTip: 'You can switch themes anytime using the Sun / Moon / Sparkles icons in the top navigation bar.'
  },
  {
    title: 'Customer: Creating & Managing Job Openings',
    role: 'customer',
    icon: <Briefcase className="w-6 h-6 text-blue-500" />,
    badge: 'Customer Core',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    summary: 'Customers can post and maintain unlimited job openings tailored to their specific hiring pipelines.',
    bulletPoints: [
      'Click "+ New Job" in the dashboard header to create an opening with title, department, location, and salary.',
      'Add key requirement tags (e.g. "React", "TypeScript", "PostgreSQL") used by the AI engine to evaluate candidates.',
      'Edit or close jobs from the "Manage Openings" menu without losing candidate application histories.'
    ],
    proTip: 'Make requirements specific: our AI evaluator compares candidate CVs directly against the job requirements list.'
  },
  {
    title: 'Customer: Sourcing & Adding Candidates',
    role: 'customer',
    icon: <Users className="w-6 h-6 text-emerald-500" />,
    badge: 'Candidate Pipeline',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    summary: 'Add candidates manually or upload resumes (PDF, Word DOCX, TXT) with automatic client-side text extraction.',
    bulletPoints: [
      'Click "+ Add Candidate" to select the job opening, name, email, and optional phone or LinkedIn profile link.',
      'Drop a resume file to automatically extract full text and populate application details.',
      'All external URLs are strictly validated for safe, credential-free HTTPS web navigation.'
    ],
    proTip: 'Uploaded PDF resumes are processed client-side via Mozilla pdf.js worker — zero third-party data leaks.'
  },
  {
    title: 'AI Candidate Evaluation & Match Scoring',
    role: 'both',
    icon: <Sparkles className="w-6 h-6 text-purple-500" />,
    badge: 'AI Screening',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    summary: 'Instant automated assessment that scores candidates from 0 to 100 based on job requirement alignment.',
    bulletPoints: [
      'Click "Run AI Screening" in candidate details to generate a match score, summary, key strengths, and gaps.',
      'Recommends optimal pipeline stages (e.g., Screening, Technical Interview, or Offer) based on verified skills.',
      'Operates securely with fallback heuristic algorithms when external AI keys are unavailable.'
    ],
    proTip: 'Check the "Strengths & Gaps" section in the Candidate Drawer before scheduling your interview round.'
  },
  {
    title: 'Compact Kanban Board & Stage Transitions',
    role: 'both',
    icon: <Layers className="w-6 h-6 text-cyan-500" />,
    badge: 'Visual Pipeline',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    summary: 'Track candidate progress across 6 distinct stages: Sourced, Screening, Interview, Offer, Hired, and Rejected.',
    bulletPoints: [
      'Drag and drop candidate cards across columns to advance them through the hiring process.',
      'Toggle "Compact View" to auto-shrink empty stages and maximize screen density on laptops.',
      'Real-time filter bar lets you search candidates by name, job title, and stage instantly.'
    ],
    proTip: 'Click any candidate card to open their detail drawer, read notes, update stage, or review their CV text.'
  },
  {
    title: 'Admin: Account Management & Approval',
    role: 'admin',
    icon: <Shield className="w-6 h-6 text-amber-500" />,
    badge: 'Administrator Control',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    summary: 'Administrators have full governance over the platform, safeguarding candidate data from unauthorized job postings.',
    bulletPoints: [
      'New customer signups default to "Pending Approval" — admins review and click "Approve" to grant access.',
      'Admins can provision new Customer and Administrator accounts directly from the Accounts modal.',
      'Deactivate or permanently delete accounts with automatic cascading cleanup of jobs and candidates.'
    ],
    proTip: 'The primary super admin (vzirimwabagabo0@gmail.com) is permanently protected against deletion or deactivation.'
  },
  {
    title: 'Admin: Acting on Behalf of Customers',
    role: 'admin',
    icon: <Compass className="w-6 h-6 text-purple-600" />,
    badge: 'Admin Delegation',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    summary: 'Admins can do everything a customer can do on their behalf without needing customer passwords.',
    bulletPoints: [
      'Select any customer company from the "Customer Context" dropdown in the navbar.',
      'A prominent amber banner confirms delegation mode: all created jobs and candidates are credited to that customer.',
      'Click "Exit Customer View" anytime to return to platform-wide administration overview.'
    ],
    proTip: 'Delegation allows hiring agencies or platform support to assist customers in real time with complete auditability.'
  },
  {
    title: 'Platform Security & 30-Minute Inactivity Logout',
    role: 'both',
    icon: <Clock className="w-6 h-6 text-rose-500" />,
    badge: 'Security & Compliance',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    summary: 'Built with enterprise-grade data privacy and proactive session monitoring.',
    bulletPoints: [
      'Automatic Inactivity Timeout: sessions automatically expire after 30 minutes of inactivity to protect sensitive candidate PII.',
      'Warning Banner: a friendly notification appears 2 minutes before expiration, allowing you to click "Stay Signed In".',
      'Password Reset: securely request reset links sent to your verified email with one-click token clearing.'
    ],
    proTip: 'Moving your mouse, typing, or clicking automatically keeps your session alive while actively working.'
  }
];

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'manual'
}) => {
  const { currentUser } = useAuth();
  const [mode, setMode] = useState<'tour' | 'manual'>(initialMode);
  const [tourIndex, setTourIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeManualTab, setActiveManualTab] = useState<'all' | 'customer' | 'admin' | 'ai' | 'security'>('all');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setTourIndex(0);
      setSearchQuery('');
    }
  }, [isOpen, initialMode]);

  const handleFinishTour = () => {
    if (dontShowAgain) {
      localStorage.setItem(STORAGE_KEY_TOUR_COMPLETED, 'true');
    }
    onClose();
  };

  const handleNextStep = () => {
    if (tourIndex < TOUR_STEPS.length - 1) {
      setTourIndex(tourIndex + 1);
    } else {
      handleFinishTour();
    }
  };

  const handlePrevStep = () => {
    if (tourIndex > 0) {
      setTourIndex(tourIndex - 1);
    }
  };

  // Filtered manual sections for search
  const manualSections = useMemo(() => {
    const sections = [
      {
        id: 'cust-jobs',
        category: 'customer',
        title: 'Posting & Managing Jobs',
        roles: ['Customer', 'Admin on Behalf'],
        content: `
Customers can post job openings with specific departmental requirements, salary ranges, and remote/on-site designations. 
1. Click **+ New Job** in the dashboard action bar.
2. Enter Job Title, Department, Location, Job Type, and Salary Range.
3. Provide descriptive requirements (e.g., 'React', 'TypeScript', 'Node.js'). These requirement tags are directly evaluated by the AI CV assessment engine.
4. Jobs can be paused, closed, or reactivated anytime from the **Manage Openings** modal.
        `
      },
      {
        id: 'cust-candidates',
        category: 'customer',
        title: 'Candidate Intake & Resume Parsing',
        roles: ['Customer', 'Admin on Behalf'],
        content: `
Add applicants with complete profile details, links, and uploaded CV documents:
1. Click **+ Add Candidate** and pick the relevant job opening.
2. Enter full name, email, phone number, and verified LinkedIn URL.
3. Upload resume files (.pdf, .docx, .txt). Text is extracted client-side with a 10MB safety boundary.
4. Candidate details are securely stored in the candidate pipeline with instant search indexing.
        `
      },
      {
        id: 'cust-ai',
        category: 'ai',
        title: 'AI CV Assessment & Scoring Algorithm',
        roles: ['Customer', 'Admin'],
        content: `
Mini ATS features automated resume screening:
1. **Match Score (0–100%)**: Evaluates candidate experience, technical skills, and educational qualifications against job requirements.
2. **Strengths & Gaps**: Pinpoints exact candidate proficiencies (e.g., 'Direct Supabase expertise') and flag missing requirements (e.g., 'Check AWS experience').
3. **Stage Recommendation**: The AI suggests whether to advance candidate to Screening, Technical Interview, or Offer.
4. **Triggering**: Click 'Run AI Screening' inside any candidate drawer to re-evaluate on demand.
        `
      },
      {
        id: 'cust-kanban',
        category: 'customer',
        title: 'Operating the Kanban Pipeline',
        roles: ['Customer', 'Admin'],
        content: `
Visual stage tracking:
1. **6 Pipeline Stages**: Sourced → Screening → Interview → Offer → Hired → Rejected.
2. **Drag & Drop**: Pick up any candidate card and drop it into another column to instantly update their stage in the database.
3. **Density Toggles**: Switch between Compact (collapses empty columns) and Comfortable views.
4. **Instant Filters**: Filter by Job Opening, candidate name, or tag directly in the top search bar.
        `
      },
      {
        id: 'adm-accounts',
        category: 'admin',
        title: 'Account Provisioning & Approvals',
        roles: ['Admin Only'],
        content: `
Enterprise user management:
1. **Approval Workflow**: Self-registered customer organizations require administrator activation before they can log in.
2. **Pending Notice**: Admins see a highlighted 'Pending Accounts' pill in the navigation bar.
3. **Provisioning**: Create new Customer or Administrator accounts with initial passwords (minimum 12 characters for cloud mode).
4. **Deactivation & Deletion**: Deactivate suspicious accounts or permanently delete accounts with Postgres cascade cleanup.
        `
      },
      {
        id: 'adm-superadmin',
        category: 'admin',
        title: 'Super Admin Permanent Protection',
        roles: ['Admin Only'],
        content: `
To prevent accidental or malicious lockouts:
1. The primary super admin account (**vzirimwabagabo0@gmail.com**) is permanently protected at the database and Edge Function level.
2. It cannot be deleted, deactivated, or demoted by any administrator.
3. Logged-in admins are protected against self-deletion.
4. The system prohibits deleting the last remaining administrator account.
        `
      },
      {
        id: 'adm-delegation',
        category: 'admin',
        title: 'Customer Impersonation (Act on Behalf)',
        roles: ['Admin Only'],
        content: `
Admins have full authority to act on behalf of any customer:
1. In the navigation bar, select any company from the **Customer Context** dropdown.
2. An amber delegation banner confirms active customer mode.
3. All job postings and candidate additions created while in this mode are attributed to the chosen customer organization.
4. Click 'Exit Customer View' to return to administrator overview.
        `
      },
      {
        id: 'sec-timeout',
        category: 'security',
        title: '30-Minute Inactivity Session Timeout',
        roles: ['Both Roles'],
        content: `
Protecting candidate PII:
1. User activity is automatically monitored across browser tabs.
2. After **30 minutes of inactivity**, the session is invalidated, auth tokens are deleted, and the user is redirected to login.
3. A warning toast appears at **2 minutes remaining**, letting you click 'Stay Signed In'.
4. Login view alerts you when a session timed out due to inactivity.
        `
      },
      {
        id: 'sec-themes',
        category: 'security',
        title: 'Themes & Visual Accessibility',
        roles: ['Both Roles'],
        content: `
Choose between three handcrafted visual themes:
1. **Light**: Crisp white background with royal blue accents and high-contrast typography.
2. **Dark**: Pure deep monochrome dark mode with subtle slate borders.
3. **Midnight**: Rich teal and emerald dark theme with cyan badges.
Switch anytime using the sun/moon/sparkles control in the top-right header.
        `
      }
    ];

    return sections.filter((s) => {
      const matchesCategory = activeManualTab === 'all' || s.category === activeManualTab;
      const matchesSearch = 
        !searchQuery.trim() ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.roles.some((r) => r.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCategory && matchesSearch;
    });
  }, [activeManualTab, searchQuery]);

  if (!isOpen) return null;

  const currentStep = TOUR_STEPS[tourIndex];

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
              {mode === 'tour' ? <Compass className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {mode === 'tour' ? 'Interactive Platform Tour' : 'Mini ATS User Manual & Guide'}
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  {currentUser?.role === 'admin' ? 'Admin Access' : 'Customer Access'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'tour' ? 'Step-by-step walkthrough of platform capabilities' : 'Complete reference manual for all features and workflows'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Mode switch */}
            <div className="flex bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setMode('tour')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  mode === 'tour'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Tour
              </button>
              <button
                type="button"
                onClick={() => setMode('manual')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  mode === 'manual'
                    ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                Manual
              </button>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors ml-1"
              aria-label="Close user guide modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tour Mode */}
        {mode === 'tour' ? (
          <div className="p-6 overflow-y-auto flex-1 flex flex-col justify-between space-y-6">
            <div>
              {/* Progress dots & counter */}
              <div className="flex items-center justify-between mb-4">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentStep.badgeColor}`}>
                  {currentStep.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Step {tourIndex + 1} of {TOUR_STEPS.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mb-6 overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${((tourIndex + 1) / TOUR_STEPS.length) * 100}%` }}
                />
              </div>

              {/* Step Card */}
              <div className="space-y-4">
                <div className="flex items-start gap-3.5">
                  <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-2xl shrink-0">
                    {currentStep.icon}
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
                      {currentStep.title}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                      {currentStep.summary}
                    </p>
                  </div>
                </div>

                {/* Key Bullet points */}
                <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-700/80 space-y-2.5">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    How it works:
                  </span>
                  {currentStep.bulletPoints.map((pt, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 dark:text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>

                {/* Pro tip callout */}
                <div className="p-3 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                  <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Pro Tip: </span>
                    <span>{currentStep.proTip}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tour Footer Controls */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 cursor-pointer">
                <input
                  type="checkbox"
                  checked={dontShowAgain}
                  onChange={(e) => setDontShowAgain(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Don't show tour automatically again</span>
              </label>

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Skip Tour
                </button>
                {tourIndex > 0 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors flex items-center gap-1"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleNextStep}
                  className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <span>{tourIndex === TOUR_STEPS.length - 1 ? 'Finish & Explore' : 'Next Step'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Manual Reference Mode */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Search & Categories Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search manual (e.g. 'Kanban', 'AI scoring', 'Inactivity', 'Impersonation')..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full text-xs pl-9 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {/* Category tabs */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold no-scrollbar">
                {[
                  { id: 'all', label: 'All Topics' },
                  { id: 'customer', label: 'Customer Guides' },
                  { id: 'admin', label: 'Admin Guides' },
                  { id: 'ai', label: 'AI Evaluation' },
                  { id: 'security', label: 'Security & Session' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveManualTab(tab.id as any)}
                    className={`px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors ${
                      activeManualTab === tab.id
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Content List */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1">
              {manualSections.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <HelpCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs">No manual topics match your search query.</p>
                </div>
              ) : (
                manualSections.map((section) => (
                  <div
                    key={section.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 space-y-2 hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {section.title}
                      </h4>
                      <div className="flex gap-1">
                        {section.roles.map((r, i) => (
                          <span
                            key={i}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                          >
                            {r}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line font-normal">
                      {section.content.trim()}
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Manual Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => setMode('tour')}
                className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <Compass className="w-3.5 h-3.5" />
                Launch Step-by-Step Interactive Tour
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-white bg-slate-900 dark:bg-slate-700 hover:bg-slate-800 rounded-xl transition-colors"
              >
                Close Manual
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

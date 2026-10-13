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
  UserCheck,
  UserCog
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface UserManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'tour' | 'manual';
}

interface TourStep {
  title: string;
  badge: string;
  badgeColor: string;
  icon: React.ReactNode;
  summary: string;
  bulletPoints: string[];
  proTip: string;
}

// 1. CUSTOMER-SPECIFIC TOUR STEPS
const CUSTOMER_TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome to Your Hiring Workspace',
    badge: 'Customer Workspace',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: <Briefcase className="w-6 h-6 text-indigo-600" />,
    summary: 'Welcome to Mini ATS! As an approved customer organization, you can post open positions, add applicants, run automated AI resume screenings, and track hiring stages.',
    bulletPoints: [
      'Your jobs and candidates are strictly isolated to your company profile.',
      'Access real-time visual hiring boards and automated candidate scoring.',
      'Customize your display with Light, Dark, or Midnight colorful themes in the header.'
    ],
    proTip: 'Everything you create is saved in real-time, whether operating against cloud Supabase or local offline storage.'
  },
  {
    title: 'Posting & Managing Job Openings',
    badge: 'Job Management',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: <Building className="w-6 h-6 text-blue-600" />,
    summary: 'Create and tailor unlimited job postings for your team.',
    bulletPoints: [
      'Click "+ New Job" in the dashboard action bar to define the job title, department, location, and salary.',
      'Add key skill requirements (e.g. "React", "TypeScript", "PostgreSQL").',
      'The AI resume evaluator compares uploaded applicant CVs directly against your requirements list.',
      'Pause, close, or reactivate openings at any time from "Manage Openings" without losing candidate history.'
    ],
    proTip: 'Be specific with requirement keywords: clear skill tags dramatically improve AI candidate match precision.'
  },
  {
    title: 'Adding Candidates & Uploading Resumes',
    badge: 'Candidate Intake',
    badgeColor: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    icon: <Users className="w-6 h-6 text-emerald-600" />,
    summary: 'Collect applications with rich contact details, verified professional links, and uploaded CV files.',
    bulletPoints: [
      'Click "+ Add Candidate" and select the relevant job opening from your list.',
      'Enter candidate name, email, phone number, and verified LinkedIn profile link.',
      'Upload resumes in PDF, Word (.docx), or TXT format with automatic client-side text extraction (10 MB max).',
      'Extracted resume text is instantly parsed and stored for keyword search and AI evaluation.'
    ],
    proTip: 'PDF extraction runs 100% inside your browser via Mozilla pdf.js worker — zero third-party leakage of applicant documents.'
  },
  {
    title: 'AI CV Evaluation & Match Scoring',
    badge: 'AI Candidate Screening',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: <Sparkles className="w-6 h-6 text-purple-600" />,
    summary: 'Instant automated assessment that scores candidates from 0 to 100% against your job requirements.',
    bulletPoints: [
      'Open any candidate card and click "Run AI Screening" in their profile drawer.',
      'Calculates an objective match percentage, executive assessment summary, key strengths, and missing skill gaps.',
      'Recommends optimal pipeline stages (Screening, Interview, or Offer) based on verified qualifications.',
      'Includes fallback algorithms so screening operates reliably even if third-party AI keys are unavailable.'
    ],
    proTip: 'Review the "Strengths & Gaps" section before interview rounds to ask targeted technical questions.'
  },
  {
    title: 'Operating Your Kanban Hiring Pipeline',
    badge: 'Visual Kanban',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: <Layers className="w-6 h-6 text-cyan-600" />,
    summary: 'Monitor and transition candidates across 6 pipeline stages: Sourced, Screening, Interview, Offer, Hired, and Rejected.',
    bulletPoints: [
      'Drag and drop cards across stage columns to immediately update their hiring status.',
      'Filter candidates in real-time by Job Opening, candidate name, or tag directly in the top search bar.',
      'Toggle "Compact View" to auto-collapse empty columns and maximize screen space on laptops.'
    ],
    proTip: 'Click any candidate card to open their detail drawer, leave notes, inspect their CV text, or update stages.'
  },
  {
    title: 'Session Privacy & Inactivity Auto-Logout',
    badge: 'Security & Compliance',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: <Clock className="w-6 h-6 text-rose-600" />,
    summary: 'Your organization account is protected with automated inactivity monitoring to safeguard sensitive applicant PII.',
    bulletPoints: [
      'Sessions automatically expire after 30 minutes of inactivity.',
      'A friendly notification appears 2 minutes before expiration, allowing you to click "Stay Signed In".',
      'Forgot password? Click "Forgot password?" on the sign-in screen to receive a secure password recovery link.'
    ],
    proTip: 'Moving your mouse, typing, or clicking automatically keeps your session active while you work.'
  }
];

// 2. ADMINISTRATOR-SPECIFIC TOUR STEPS
const ADMIN_TOUR_STEPS: TourStep[] = [
  {
    title: 'Welcome, Platform Administrator!',
    badge: 'Admin Overview',
    badgeColor: 'bg-purple-50 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    icon: <Shield className="w-6 h-6 text-purple-600" />,
    summary: 'As a system administrator, you have complete governance over the platform: approving organizations, managing customer pipelines, provisioning users, and enforcing security policies.',
    bulletPoints: [
      'Multi-tenant oversight: view system-wide candidates and job openings across all customer companies.',
      'Full administrative delegation: act on behalf of any customer to post jobs or screen applicants.',
      'Real-time account lifecycle management with Supabase Auth integration.'
    ],
    proTip: 'You can switch between system-wide "All Accounts" view or specific customer contexts anytime in the top navbar.'
  },
  {
    title: 'Reviewing & Approving Customer Registrations',
    badge: 'Account Approvals',
    badgeColor: 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    icon: <UserCheck className="w-6 h-6 text-amber-600" />,
    summary: 'To prevent fraudulent or spam job openings, all self-registered customer companies arrive in "Pending Approval" status.',
    bulletPoints: [
      'Whenever new customers sign up, an amber "Sign-Up Alert" banner appears at the top of your dashboard.',
      'Click "Review & Approve" (or open "Accounts" in the header) to inspect customer credentials.',
      'Click "Approve" to activate their account so they can sign in and begin posting jobs.',
      'Unapproved accounts are blocked at the Row Level Security (RLS) database layer from accessing any platform data.'
    ],
    proTip: 'You can also temporarily deactivate existing customer companies if an organization is paused or suspicious.'
  },
  {
    title: 'Admin Delegation: Act on Behalf of Customers',
    badge: 'Customer Impersonation',
    badgeColor: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    icon: <UserCog className="w-6 h-6 text-indigo-600" />,
    summary: 'Admins can perform every single customer action on their behalf without needing customer passwords.',
    bulletPoints: [
      'In the top header, select any customer company from the "Customer Context" dropdown.',
      'An amber banner confirms delegation mode: all jobs created and candidates added are attributed to that specific customer.',
      'Click "Exit Customer View" at any time to return to full platform-wide administration.'
    ],
    proTip: 'Delegation is ideal for recruiting agencies and enterprise support agents helping hiring managers in real time.'
  },
  {
    title: 'Account Provisioning, Deactivations & Deletions',
    badge: 'User Lifecycle',
    badgeColor: 'bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
    icon: <Users className="w-6 h-6 text-blue-600" />,
    summary: 'Create and delete both Customer and Administrator accounts with full safety guardrails.',
    bulletPoints: [
      'Click "Accounts" in the navbar to provision new Customer or Admin accounts with secure initial credentials.',
      'Permanent Deletion: clicking the red trash icon removes the account from Supabase Auth and database tables.',
      'Cascading Cleanup: deleting a customer cleanly cascades and deletes their jobs and candidates (Postgres ON DELETE CASCADE).',
      'Lockout Protections: you cannot delete your own signed-in account, and you cannot delete the last remaining admin.'
    ],
    proTip: 'Customer initial passwords in cloud mode require a minimum of 12 characters to enforce enterprise password standards.'
  },
  {
    title: 'Super Admin Permanent Immunity',
    badge: 'Super Admin Safeguard',
    badgeColor: 'bg-amber-50 text-amber-800 dark:bg-amber-950/60 dark:text-amber-200 border-amber-300 dark:border-amber-700',
    icon: <Lock className="w-6 h-6 text-amber-600" />,
    summary: 'The primary super admin account is permanently locked down to ensure the platform can never be orphaned or hijacked.',
    bulletPoints: [
      'The super admin email (vzirimwabagabo0@gmail.com) is permanently protected against deletion, deactivation, and role demotion.',
      'Enforced at both the UI layer (golden SUPER ADMIN badge with lock indicator) and the backend Edge Function / database triggers.',
      'Even other authenticated administrators cannot delete or demote the super administrator.'
    ],
    proTip: 'Super Admin protection guarantees continuous, uninterrupted administrative sovereignty.'
  },
  {
    title: 'AI Screening & System Kanban Governance',
    badge: 'Pipeline Oversight',
    badgeColor: 'bg-cyan-50 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
    icon: <Layers className="w-6 h-6 text-cyan-600" />,
    summary: 'Inspect candidate evaluations and manage pipelines across all customer organizations.',
    bulletPoints: [
      'Switch between "Admin Overview (All Accounts)" to see global candidate volumes or isolate to a single customer.',
      'Trigger AI evaluations across any candidate to audit applicant scoring and candidate suitability.',
      'Move candidate cards across Kanban columns on behalf of hiring managers.'
    ],
    proTip: 'Use candidate tags (e.g. Senior, React, Architect) to quickly filter global candidate pools across all openings.'
  },
  {
    title: 'Session Security & Inactivity Safeguards',
    badge: 'Security Controls',
    badgeColor: 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
    icon: <Clock className="w-6 h-6 text-rose-600" />,
    summary: 'Strict session management prevents unauthorized administrative access.',
    bulletPoints: [
      'Administrator sessions automatically terminate after 30 minutes of inactivity.',
      'A 2-minute countdown banner warns you when a session is about to expire, with a 1-click "Stay Signed In" button.',
      'Local tokens are securely purged on sign out (scope: local) to prevent 403 authorization conflicts.'
    ],
    proTip: 'The 30-minute session limit helps meet SOC2, HIPAA, and GDPR recruitment data security standards.'
  }
];

export const UserManualModal: React.FC<UserManualModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'manual'
}) => {
  const { currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [mode, setMode] = useState<'tour' | 'manual'>(initialMode);
  // Allow admins to preview the customer tour or view admin tour
  const [selectedTourRole, setSelectedTourRole] = useState<'customer' | 'admin'>(
    isAdmin ? 'admin' : 'customer'
  );
  const [tourIndex, setTourIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeManualTab, setActiveManualTab] = useState<'all' | 'customer' | 'admin' | 'ai' | 'security'>('all');
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setSelectedTourRole(isAdmin ? 'admin' : 'customer');
      setTourIndex(0);
      setSearchQuery('');
    }
  }, [isOpen, initialMode, isAdmin]);

  const activeSteps = selectedTourRole === 'admin' ? ADMIN_TOUR_STEPS : CUSTOMER_TOUR_STEPS;
  const currentStep = activeSteps[tourIndex] || activeSteps[0];

  const handleFinishTour = () => {
    if (dontShowAgain && currentUser?.role) {
      const storageKey = `mini_ats_tour_completed_${currentUser.role}`;
      localStorage.setItem(storageKey, 'true');
      localStorage.setItem('mini_ats_tour_completed', 'true');
    }
    onClose();
  };

  const handleNextStep = () => {
    if (tourIndex < activeSteps.length - 1) {
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
2. **Strengths & Gaps**: Pinpoints exact candidate proficiencies (e.g., 'Direct Supabase expertise') and flags missing requirements (e.g., 'Check AWS experience').
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
            <div className={`p-2 rounded-xl shadow-xs text-white ${selectedTourRole === 'admin' ? 'bg-purple-600' : 'bg-indigo-600'}`}>
              {mode === 'tour' ? <Compass className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {mode === 'tour' 
                    ? selectedTourRole === 'admin' ? 'Administrator Guided Tour' : 'Customer Hiring Guide'
                    : 'Mini ATS User Manual & Reference'}
                </h2>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                  selectedTourRole === 'admin'
                    ? 'bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800'
                    : 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800'
                }`}>
                  {selectedTourRole === 'admin' ? 'Admin Tour' : 'Customer Tour'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {mode === 'tour' 
                  ? `Customized walkthrough for ${selectedTourRole === 'admin' ? 'System Administrators' : 'Hiring Customer Organizations'}`
                  : 'Complete reference manual for all features and workflows'}
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
              {/* Role Toggle for Admins to preview customer tour */}
              {isAdmin && (
                <div className="mb-4 p-2 bg-slate-100 dark:bg-slate-800/80 rounded-xl flex items-center justify-between text-xs">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 pl-1">
                    Select Tour Perspective:
                  </span>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTourRole('admin');
                        setTourIndex(0);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedTourRole === 'admin'
                          ? 'bg-purple-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Admin Tour ({ADMIN_TOUR_STEPS.length} Steps)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTourRole('customer');
                        setTourIndex(0);
                      }}
                      className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                        selectedTourRole === 'customer'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                      }`}
                    >
                      Customer Tour ({CUSTOMER_TOUR_STEPS.length} Steps)
                    </button>
                  </div>
                </div>
              )}

              {/* Progress dots & counter */}
              <div className="flex items-center justify-between mb-3">
                <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${currentStep.badgeColor}`}>
                  {currentStep.badge}
                </span>
                <span className="text-xs font-semibold text-slate-400">
                  Step {tourIndex + 1} of {activeSteps.length}
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full mb-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-300 ${
                    selectedTourRole === 'admin' ? 'bg-purple-600' : 'bg-indigo-600'
                  }`}
                  style={{ width: `${((tourIndex + 1) / activeSteps.length) * 100}%` }}
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
                    What you can do:
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
                  className={`px-4 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors flex items-center gap-1.5 ${
                    selectedTourRole === 'admin'
                      ? 'bg-purple-600 hover:bg-purple-700'
                      : 'bg-indigo-600 hover:bg-indigo-700'
                  }`}
                >
                  <span>{tourIndex === activeSteps.length - 1 ? 'Finish & Explore' : 'Next Step'}</span>
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
                Launch {selectedTourRole === 'admin' ? 'Administrator' : 'Customer'} Tour
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

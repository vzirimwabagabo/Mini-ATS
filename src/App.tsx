import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Candidate, CandidateStage, Job } from './types';
import { 
  fetchJobs, 
  fetchCandidates, 
  saveJob, 
  deleteJob, 
  saveCandidate, 
  updateCandidateStage, 
  deleteCandidate,
  resetDemoData 
} from './lib/storage';
import { Navbar } from './components/Navbar';
import { AnalyticsHeader } from './components/AnalyticsHeader';
import { KanbanBoard } from './components/KanbanBoard';
import { LoginView } from './components/LoginView';
import { CandidateDetailDrawer } from './components/CandidateDetailDrawer';
import { CandidateModal } from './components/CandidateModal';
import { JobModal } from './components/JobModal';
import { JobListModal } from './components/JobListModal';
import { AdminAccountModal } from './components/AdminAccountModal';
import { AssumptionsModal } from './components/AssumptionsModal';
import { DatabaseSetupWizardModal } from './components/DatabaseSetupWizardModal';
import { Footer } from './components/Footer';
import { LegalModal, LegalDocType } from './components/LegalModal';
import { ResetPasswordModal } from './components/ResetPasswordModal';
import { UserManualModal } from './components/UserManualModal';
import { Bell, Shield, Clock } from 'lucide-react';

const ATSApp: React.FC = () => {
  const { currentUser, effectiveUser, impersonatedCustomer, allProfiles, refreshProfiles, isPasswordRecovery, setIsPasswordRecovery, sessionWarningOpen, stayLoggedIn } = useAuth();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);

  // Modals state
  const [selectedCandidateForDrawer, setSelectedCandidateForDrawer] = useState<Candidate | null>(null);
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState<boolean>(false);
  const [candidateDefaultStage, setCandidateDefaultStage] = useState<CandidateStage>('sourced');
  const [candidateToEdit, setCandidateToEdit] = useState<Candidate | null>(null);

  const [isJobModalOpen, setIsJobModalOpen] = useState<boolean>(false);
  const [jobToEdit, setJobToEdit] = useState<Job | null>(null);
  const [isJobListModalOpen, setIsJobListModalOpen] = useState<boolean>(false);
  const [isAdminAccountModalOpen, setIsAdminAccountModalOpen] = useState<boolean>(false);
  const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState<boolean>(false);
  const [isDatabaseWizardOpen, setIsDatabaseWizardOpen] = useState<boolean>(false);
  const [isLegalModalOpen, setIsLegalModalOpen] = useState<boolean>(false);
  const [legalDocType, setLegalDocType] = useState<LegalDocType>('privacy');
  const [isUserManualOpen, setIsUserManualOpen] = useState<boolean>(false);

  // Auto-launch guided tour for new users who haven't completed it yet
  useEffect(() => {
    if (currentUser) {
      const tourCompleted = localStorage.getItem('mini_ats_tour_completed');
      if (!tourCompleted) {
        const timer = setTimeout(() => {
          setIsUserManualOpen(true);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [currentUser?.id]);

  // Load data whenever effectiveUser changes
  useEffect(() => {
    if (!currentUser) return;

    const loadData = async () => {
      setLoadingData(true);
      try {
        const customerId = currentUser.role === 'admin' && !impersonatedCustomer 
          ? undefined 
          : effectiveUser?.id;

        const [loadedJobs, loadedCandidates] = await Promise.all([
          fetchJobs(customerId),
          fetchCandidates(customerId)
        ]);

        setJobs(loadedJobs);
        setCandidates(loadedCandidates);
      } catch (err) {
        console.error('Failed to load ATS data', err);
      } finally {
        setLoadingData(false);
      }
    };

    loadData();
  }, [currentUser, effectiveUser, impersonatedCustomer]);

  // Periodic background check for admin to detect newly registered customer accounts
  useEffect(() => {
    if (currentUser?.role !== 'admin') return;

    const handleFocus = () => {
      refreshProfiles().catch(() => {});
    };
    window.addEventListener('focus', handleFocus);

    const interval = setInterval(() => {
      refreshProfiles().catch(() => {});
    }, 25000);

    return () => {
      window.removeEventListener('focus', handleFocus);
      clearInterval(interval);
    };
  }, [currentUser?.role, refreshProfiles]);

  const pendingCustomerApprovals = allProfiles.filter((p) => p.role === 'customer' && p.isActive === false);

  if (!currentUser) {
    return <LoginView />;
  }

  // Candidate actions
  const handleStageChange = async (candidateId: string, stage: CandidateStage) => {
    try {
      await updateCandidateStage(candidateId, stage);
    } catch (err) {
      alert(`Could not update candidate stage: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage, updatedAt: new Date().toISOString() } : c))
    );

    if (selectedCandidateForDrawer && selectedCandidateForDrawer.id === candidateId) {
      setSelectedCandidateForDrawer((prev) => (prev ? { ...prev, stage } : null));
    }

  };

  const handleCandidateSaved = async (saved: Candidate) => {
    const updated = await saveCandidate(saved as any);
    setCandidates((prev) => {
      const idx = prev.findIndex((c) => c.id === updated.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx] = updated;
        return copy;
      }
      return [updated, ...prev];
    });

    if (selectedCandidateForDrawer && selectedCandidateForDrawer.id === updated.id) {
      setSelectedCandidateForDrawer(updated);
    }
  };

  const handleDeleteCandidate = async (candidateId: string) => {
    try {
      await deleteCandidate(candidateId);
    } catch (err) {
      alert(`Could not delete candidate: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    if (selectedCandidateForDrawer && selectedCandidateForDrawer.id === candidateId) {
      setSelectedCandidateForDrawer(null);
    }
  };

  // Job actions
  const handleJobSaved = async (newJob: Job) => {
    const saved = await saveJob(newJob as any);
    setJobs((prev) => {
      const existingIndex = prev.findIndex((job) => job.id === saved.id);
      if (existingIndex === -1) return [saved, ...prev];
      const next = [...prev];
      next[existingIndex] = saved;
      return next;
    });
  };

  const handleDeleteJob = async (jobId: string) => {
    try {
      await deleteJob(jobId);
    } catch (err) {
      alert(`Could not delete job: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return;
    }

    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setCandidates((prev) => prev.filter((c) => c.jobId !== jobId));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        onOpenCreateAccount={() => setIsAdminAccountModalOpen(true)}
        onOpenAssumptions={() => setIsAssumptionsModalOpen(true)}
        onOpenDatabaseWizard={() => setIsDatabaseWizardOpen(true)}
        onOpenUserManual={() => setIsUserManualOpen(true)}
      />

      {currentUser?.role === 'admin' && pendingCustomerApprovals.length > 0 && (
        <aside
          aria-label="Pending customer accounts approval alert"
          className="bg-gradient-to-r from-amber-500/20 via-orange-500/15 to-amber-500/20 border-b border-amber-300 dark:border-amber-700/60 px-4 py-2.5 text-xs animate-in fade-in duration-150"
        >
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
              <span className="p-1 bg-amber-500 text-slate-950 rounded-lg font-black text-[10px] uppercase tracking-wide flex items-center gap-1 shadow-xs shrink-0">
                <Bell className="w-3.5 h-3.5" />
                Sign-Up Alert
              </span>
              <span className="leading-snug">
                <strong>{pendingCustomerApprovals.length} new customer organization{pendingCustomerApprovals.length > 1 ? 's' : ''}</strong> ({pendingCustomerApprovals.map(p => p.companyName || p.fullName).slice(0, 3).join(', ')}{pendingCustomerApprovals.length > 3 ? '...' : ''}) registered and {pendingCustomerApprovals.length > 1 ? 'are' : 'is'} awaiting administrator approval before posting jobs.
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsAdminAccountModalOpen(true)}
              className="bg-amber-600 hover:bg-amber-700 text-white font-bold px-3 py-1.5 rounded-lg text-xs transition-colors shadow-xs flex items-center gap-1.5 self-start sm:self-auto shrink-0"
            >
              <Shield className="w-3.5 h-3.5" />
              Review & Approve ({pendingCustomerApprovals.length}) →
            </button>
          </div>
        </aside>
      )}

      <AnalyticsHeader candidates={candidates} jobs={jobs} />

      {loadingData ? (
        <div className="flex-1 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400 py-20">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
            Loading Recruitment Pipelines...
          </div>
        </div>
      ) : (
        <KanbanBoard
          candidates={candidates}
          jobs={jobs}
          onOpenCandidateDetail={(candidate) => setSelectedCandidateForDrawer(candidate)}
          onOpenNewCandidate={(stage) => {
            setCandidateDefaultStage(stage || 'sourced');
            setCandidateToEdit(null);
            setIsCandidateModalOpen(true);
          }}
          onOpenNewJob={() => {
            setJobToEdit(null);
            setIsJobModalOpen(true);
          }}
          onOpenManageJobs={() => setIsJobListModalOpen(true)}
          onStageChange={handleStageChange}
          onDeleteCandidate={handleDeleteCandidate}
        />
      )}
      <Footer
        jobs={jobs}
        candidates={candidates}
        onOpenAssumptions={() => setIsAssumptionsModalOpen(true)}
        onOpenDatabaseWizard={() => setIsDatabaseWizardOpen(true)}
        onOpenLegal={(doc) => {
          setLegalDocType(doc);
          setIsLegalModalOpen(true);
        }}
        onResetData={resetDemoData}
        onOpenUserManual={() => setIsUserManualOpen(true)}
      />

      {/* Candidate Profile & AI Intelligence Drawer */}
      <CandidateDetailDrawer
        key={selectedCandidateForDrawer?.id || 'no-candidate'}
        candidate={selectedCandidateForDrawer}
        jobs={jobs}
        onClose={() => setSelectedCandidateForDrawer(null)}
        onEditCandidate={(candidate) => {
          setCandidateToEdit(candidate);
          setCandidateDefaultStage(candidate.stage);
          setSelectedCandidateForDrawer(null);
          setIsCandidateModalOpen(true);
        }}
        onUpdateCandidate={handleCandidateSaved}
      />

      {/* Add / Edit Candidate Modal */}
      <CandidateModal
        key={candidateToEdit?.id || 'new-candidate'}
        isOpen={isCandidateModalOpen}
        onClose={() => {
          setIsCandidateModalOpen(false);
          setCandidateToEdit(null);
        }}
        jobs={jobs}
        profiles={allProfiles}
        currentCustomerId={effectiveUser?.id || currentUser.id}
        onCandidateSaved={handleCandidateSaved}
        candidateToEdit={candidateToEdit}
        defaultStage={candidateDefaultStage}
      />

      {/* Post Job Modal */}
      <JobModal
        key={jobToEdit?.id || 'new-job'}
        isOpen={isJobModalOpen}
        onClose={() => {
          setIsJobModalOpen(false);
          setJobToEdit(null);
        }}
        onJobSaved={handleJobSaved}
        currentCustomerId={effectiveUser?.id || currentUser.id}
        isAdmin={currentUser.role === 'admin'}
        allProfiles={allProfiles}
        jobToEdit={jobToEdit}
      />

      {/* Manage Jobs Modal */}
      <JobListModal
        isOpen={isJobListModalOpen}
        onClose={() => setIsJobListModalOpen(false)}
        jobs={jobs}
        candidates={candidates}
        onOpenNewJob={() => {
          setJobToEdit(null);
          setIsJobModalOpen(true);
        }}
        onEditJob={(job) => {
          setJobToEdit(job);
          setIsJobListModalOpen(false);
          setIsJobModalOpen(true);
        }}
        onDeleteJob={handleDeleteJob}
      />

      {/* Admin Create Account Modal */}
      <AdminAccountModal
        isOpen={isAdminAccountModalOpen}
        onClose={() => setIsAdminAccountModalOpen(false)}
      />

      {/* Assumptions & Design Document Modal */}
      <AssumptionsModal
        isOpen={isAssumptionsModalOpen}
        onClose={() => setIsAssumptionsModalOpen(false)}
      />

      {/* Real Database Setup Wizard Modal */}
      <DatabaseSetupWizardModal
        isOpen={isDatabaseWizardOpen}
        onClose={() => setIsDatabaseWizardOpen(false)}
      />

      {/* Legal & Regulatory Compliance Center */}
      <LegalModal
        isOpen={isLegalModalOpen}
        onClose={() => setIsLegalModalOpen(false)}
        initialDoc={legalDocType}
      />

      {/* Password Recovery Modal */}
      <ResetPasswordModal
        isOpen={isPasswordRecovery}
        onClose={() => setIsPasswordRecovery(false)}
      />

      {/* Platform User Manual & Guided Tour Modal */}
      <UserManualModal
        isOpen={isUserManualOpen}
        onClose={() => setIsUserManualOpen(false)}
      />

      {/* Session Inactivity Expiration Warning */}
      {sessionWarningOpen && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 rounded-xl">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white">Session Expiring Soon</h4>
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                You will be automatically signed out in 2 minutes due to inactivity. Click below to stay signed in.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={stayLoggedIn}
                  className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors"
                >
                  Stay Signed In
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ATSApp />
      </AuthProvider>
    </ThemeProvider>
  );
}

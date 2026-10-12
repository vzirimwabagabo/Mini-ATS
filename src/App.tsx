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

const ATSApp: React.FC = () => {
  const { currentUser, effectiveUser, impersonatedCustomer, allProfiles } = useAuth();

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
        onResetData={resetDemoData}
      />

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
          onResetDemoData={resetDemoData}
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

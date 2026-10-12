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
  const [isJobListModalOpen, setIsJobListModalOpen] = useState<boolean>(false);
  const [isAdminAccountModalOpen, setIsAdminAccountModalOpen] = useState<boolean>(false);
  const [isAssumptionsModalOpen, setIsAssumptionsModalOpen] = useState<boolean>(false);
  const [isDatabaseWizardOpen, setIsDatabaseWizardOpen] = useState<boolean>(false);

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
    setCandidates((prev) =>
      prev.map((c) => (c.id === candidateId ? { ...c, stage, updatedAt: new Date().toISOString() } : c))
    );

    if (selectedCandidateForDrawer && selectedCandidateForDrawer.id === candidateId) {
      setSelectedCandidateForDrawer((prev) => (prev ? { ...prev, stage } : null));
    }

    await updateCandidateStage(candidateId, stage);
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
    setCandidates((prev) => prev.filter((c) => c.id !== candidateId));
    if (selectedCandidateForDrawer && selectedCandidateForDrawer.id === candidateId) {
      setSelectedCandidateForDrawer(null);
    }
    await deleteCandidate(candidateId);
  };

  // Job actions
  const handleJobSaved = async (newJob: Job) => {
    const saved = await saveJob(newJob as any);
    setJobs((prev) => [saved, ...prev]);
  };

  const handleDeleteJob = async (jobId: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
    setCandidates((prev) => prev.filter((c) => c.jobId !== jobId));
    await deleteJob(jobId);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      <Navbar
        onOpenCreateAccount={() => setIsAdminAccountModalOpen(true)}
        onOpenAssumptions={() => setIsAssumptionsModalOpen(true)}
        onOpenDatabaseWizard={() => setIsDatabaseWizardOpen(true)}
        onResetData={resetDemoData}
      />

      <AnalyticsHeader candidates={candidates} jobs={jobs} />

      {loadingData ? (
        <div className="flex-1 flex items-center justify-center text-xs font-bold text-slate-500 dark:text-slate-400">
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
          onOpenNewJob={() => setIsJobModalOpen(true)}
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
        onResetData={resetDemoData}
      />

      {/* Candidate Profile & AI Intelligence Drawer */}
      <CandidateDetailDrawer
        candidate={selectedCandidateForDrawer}
        jobs={jobs}
        onClose={() => setSelectedCandidateForDrawer(null)}
        onUpdateCandidate={handleCandidateSaved}
      />

      {/* Add / Edit Candidate Modal */}
      <CandidateModal
        isOpen={isCandidateModalOpen}
        onClose={() => setIsCandidateModalOpen(false)}
        jobs={jobs}
        currentCustomerId={effectiveUser?.id || currentUser.id}
        onCandidateSaved={handleCandidateSaved}
        candidateToEdit={candidateToEdit}
        defaultStage={candidateDefaultStage}
      />

      {/* Post Job Modal */}
      <JobModal
        isOpen={isJobModalOpen}
        onClose={() => setIsJobModalOpen(false)}
        onJobSaved={handleJobSaved}
        currentCustomerId={effectiveUser?.id || currentUser.id}
        isAdmin={currentUser.role === 'admin'}
        allProfiles={allProfiles}
      />

      {/* Manage Jobs Modal */}
      <JobListModal
        isOpen={isJobListModalOpen}
        onClose={() => setIsJobListModalOpen(false)}
        jobs={jobs}
        candidates={candidates}
        onOpenNewJob={() => setIsJobModalOpen(true)}
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

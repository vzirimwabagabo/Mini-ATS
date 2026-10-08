import React, { useState } from 'react';
import { Candidate, CandidateStage, Job } from '../types';
import { CandidateCard } from './CandidateCard';
import { 
  Search, 
  Filter, 
  LayoutGrid, 
  Rows3, 
  Plus, 
  Briefcase, 
  Users, 
  Sparkles,
  RefreshCw,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface KanbanBoardProps {
  candidates: Candidate[];
  jobs: Job[];
  onOpenCandidateDetail: (candidate: Candidate) => void;
  onOpenNewCandidate: (defaultStage?: CandidateStage) => void;
  onOpenNewJob: () => void;
  onOpenManageJobs: () => void;
  onStageChange: (candidateId: string, stage: CandidateStage) => void;
  onDeleteCandidate: (candidateId: string) => void;
  onResetDemoData: () => void;
}

const COLUMNS: { id: CandidateStage; title: string; color: string; badge: string; bg: string }[] = [
  { id: 'sourced', title: 'Sourced', color: 'border-slate-300', badge: 'bg-slate-100 text-slate-700', bg: 'bg-slate-50/60' },
  { id: 'screening', title: 'Screening', color: 'border-blue-400', badge: 'bg-blue-100 text-blue-700', bg: 'bg-blue-50/30' },
  { id: 'interview', title: 'Interview', color: 'border-indigo-400', badge: 'bg-indigo-100 text-indigo-700', bg: 'bg-indigo-50/30' },
  { id: 'offer', title: 'Offer', color: 'border-amber-400', badge: 'bg-amber-100 text-amber-800', bg: 'bg-amber-50/30' },
  { id: 'hired', title: 'Hired 🎉', color: 'border-emerald-400', badge: 'bg-emerald-100 text-emerald-800', bg: 'bg-emerald-50/40' },
  { id: 'rejected', title: 'Archived', color: 'border-rose-300', badge: 'bg-rose-100 text-rose-700', bg: 'bg-rose-50/30' },
];

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  candidates,
  jobs,
  onOpenCandidateDetail,
  onOpenNewCandidate,
  onOpenNewJob,
  onOpenManageJobs,
  onStageChange,
  onDeleteCandidate,
  onResetDemoData,
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [compactMode, setCompactMode] = useState<boolean>(true);
  const [draggingOverStage, setDraggingOverStage] = useState<CandidateStage | null>(null);

  // Filter candidates according to user criteria: Job and Candidate Name (or email)
  const filteredCandidates = candidates.filter((cand) => {
    // 1. Job filter
    if (selectedJobId !== 'all' && cand.jobId !== selectedJobId) {
      return false;
    }

    // 2. Candidate name filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const nameMatch = cand.name.toLowerCase().includes(q);
      const emailMatch = cand.email.toLowerCase().includes(q);
      const tagMatch = (cand.tags || []).some(t => t.toLowerCase().includes(q));
      if (!nameMatch && !emailMatch && !tagMatch) {
        return false;
      }
    }

    return true;
  });

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent, stageId: CandidateStage) => {
    e.preventDefault();
    if (draggingOverStage !== stageId) {
      setDraggingOverStage(stageId);
    }
  };

  const handleDragLeave = () => {
    setDraggingOverStage(null);
  };

  const handleDrop = (e: React.DragEvent, targetStage: CandidateStage) => {
    e.preventDefault();
    setDraggingOverStage(null);
    const candidateId = e.dataTransfer.getData('text/plain');
    if (candidateId) {
      if (targetStage === 'hired') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.65 } });
      }
      onStageChange(candidateId, targetStage);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100/70 p-4 sm:p-6 overflow-hidden">
      {/* Filters and Controls Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200/90 shadow-xs mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Left Side: Job filter & Search */}
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          {/* Job Filter Dropdown */}
          <div className="relative min-w-[200px] sm:min-w-[240px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Briefcase className="w-4 h-4 text-slate-400" />
            </div>
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="w-full text-xs font-semibold pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            >
              <option value="all">All Jobs ({candidates.length} candidates)</option>
              {jobs.map((j) => {
                const count = candidates.filter((c) => c.jobId === j.id).length;
                return (
                  <option key={j.id} value={j.id}>
                    {j.title} ({count})
                  </option>
                );
              })}
            </select>
          </div>

          {/* Candidate Name Search */}
          <div className="relative flex-1 min-w-[220px]">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Filter by candidate name, email, or skill..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-9 pr-8 py-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-slate-800"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Right Side: Compact View Toggle & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Compact View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setCompactMode(true)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                compactMode
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Compact Kanban layout"
            >
              <Rows3 className="w-3.5 h-3.5" />
              Compact View
            </button>
            <button
              type="button"
              onClick={() => setCompactMode(false)}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                !compactMode
                  ? 'bg-white text-indigo-700 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Comfortable Cards with Details"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              Comfortable
            </button>
          </div>

          {/* Manage Jobs */}
          <button
            type="button"
            onClick={onOpenManageJobs}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            Jobs ({jobs.length})
          </button>

          {/* Post Job */}
          <button
            type="button"
            onClick={onOpenNewJob}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            Post Job
          </button>

          {/* Add Candidate */}
          <button
            type="button"
            onClick={() => onOpenNewCandidate()}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Candidate
          </button>
        </div>
      </div>

      {/* Active Filter Notice */}
      {(selectedJobId !== 'all' || searchQuery.trim() !== '') && (
        <div className="flex items-center justify-between text-xs text-slate-500 mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-indigo-600" />
            <span>
              Showing <strong>{filteredCandidates.length}</strong> of{' '}
              <strong>{candidates.length}</strong> candidates
            </span>
            {selectedJobId !== 'all' && (
              <span className="bg-indigo-50 text-indigo-700 font-medium px-2 py-0.5 rounded-md border border-indigo-200">
                Job: {jobs.find((j) => j.id === selectedJobId)?.title}
              </span>
            )}
            {searchQuery && (
              <span className="bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md border border-slate-200">
                "{searchQuery}"
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              setSelectedJobId('all');
              setSearchQuery('');
            }}
            className="text-indigo-600 hover:text-indigo-800 font-medium text-xs underline"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Kanban Board Columns Container */}
      <div className="flex-1 overflow-x-auto min-h-0 pb-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5 min-w-[1100px] h-full">
          {COLUMNS.map((col) => {
            const columnCandidates = filteredCandidates.filter((c) => c.stage === col.id);
            const isOver = draggingOverStage === col.id;

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl border transition-all h-full max-h-[calc(100vh-210px)] overflow-hidden ${
                  col.bg
                } ${
                  isOver
                    ? 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/50'
                    : 'border-slate-200/90'
                }`}
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-b bg-white/80 backdrop-blur-xs flex items-center justify-between border-t-4 ${col.color}`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-xs text-slate-900 tracking-tight">
                      {col.title}
                    </h3>
                    <span
                      className={`text-[11px] font-bold px-1.5 py-0.5 rounded-full ${col.badge}`}
                    >
                      {columnCandidates.length}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => onOpenNewCandidate(col.id)}
                    className="p-1 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                    title={`Add candidate directly to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Cards List with Scroll */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                  {columnCandidates.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-200 rounded-xl flex items-center justify-center text-center p-3 text-[11px] text-slate-400">
                      <span>Drag candidates here</span>
                    </div>
                  ) : (
                    columnCandidates.map((cand) => {
                      const candJob = jobs.find((j) => j.id === cand.jobId);
                      return (
                        <CandidateCard
                          key={cand.id}
                          candidate={cand}
                          job={candJob}
                          compactMode={compactMode}
                          onOpenDetail={onOpenCandidateDetail}
                          onStageChange={onStageChange}
                          onDelete={onDeleteCandidate}
                        />
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

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
  X,
  Shrink,
  Maximize2
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
  { 
    id: 'sourced', 
    title: 'Sourced', 
    color: 'border-slate-400 dark:border-slate-600', 
    badge: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300', 
    bg: 'bg-slate-50/70 dark:bg-slate-900/40' 
  },
  { 
    id: 'screening', 
    title: 'Screening', 
    color: 'border-blue-500 dark:border-blue-400', 
    badge: 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300', 
    bg: 'bg-blue-50/30 dark:bg-slate-900/40' 
  },
  { 
    id: 'interview', 
    title: 'Interview', 
    color: 'border-indigo-500 dark:border-indigo-400', 
    badge: 'bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300', 
    bg: 'bg-indigo-50/30 dark:bg-slate-900/40' 
  },
  { 
    id: 'offer', 
    title: 'Offer', 
    color: 'border-amber-500 dark:border-amber-400', 
    badge: 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300', 
    bg: 'bg-amber-50/30 dark:bg-slate-900/40' 
  },
  { 
    id: 'hired', 
    title: 'Hired 🎉', 
    color: 'border-emerald-500 dark:border-emerald-400', 
    badge: 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300', 
    bg: 'bg-emerald-50/30 dark:bg-slate-900/40' 
  },
  { 
    id: 'rejected', 
    title: 'Archived', 
    color: 'border-rose-400 dark:border-rose-500', 
    badge: 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300', 
    bg: 'bg-rose-50/20 dark:bg-slate-900/40' 
  },
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
}) => {
  const [selectedJobId, setSelectedJobId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [compactMode, setCompactMode] = useState<boolean>(true);
  const [autoShrink, setAutoShrink] = useState<boolean>(true);
  const [manuallyExpanded, setManuallyExpanded] = useState<Record<string, boolean>>({});
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
    setDraggingOverStage(stageId);
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
        confetti({ particleCount: 80, spread: 70, origin: { y: 0.65 } });
      }
      onStageChange(candidateId, targetStage);
    }
  };

  const toggleColumnManualExpand = (stageId: string) => {
    setManuallyExpanded((prev) => ({
      ...prev,
      [stageId]: !prev[stageId],
    }));
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-100/90 dark:bg-slate-950 p-3 sm:p-4 md:p-6 overflow-hidden transition-colors">
      {/* Filters and Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs mb-3 sm:mb-4 flex flex-col lg:flex-row lg:items-center justify-between gap-3 transition-colors">
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
              className="w-full text-xs font-bold pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700/60 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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
              placeholder="Filter by candidate name, email, or skill tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-medium pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
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

        {/* Right Side: View Controls, Auto-Shrink Toggle, & Quick Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Auto-Shrink Empty Columns Toggle */}
          <button
            type="button"
            onClick={() => setAutoShrink(!autoShrink)}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              autoShrink
                ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:text-slate-900'
            }`}
            title="Automatically shrink empty columns to focus space on active candidates"
          >
            {autoShrink ? (
              <>
                <Shrink className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span className="hidden sm:inline">Auto-Shrink Empty</span>
                <span className="sm:hidden">Auto-Shrink</span>
              </>
            ) : (
              <>
                <Maximize2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Equal Widths</span>
              </>
            )}
          </button>

          {/* Compact View Toggle */}
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setCompactMode(true)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                compactMode
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Compact Kanban layout (dense cards)"
            >
              <Rows3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Compact</span>
            </button>
            <button
              type="button"
              onClick={() => setCompactMode(false)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                !compactMode
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
              title="Comfortable Cards with Tags & Bio Preview"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Comfortable</span>
            </button>
          </div>

          {/* Manage Jobs */}
          <button
            type="button"
            onClick={onOpenManageJobs}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors shadow-xs"
          >
            <Briefcase className="w-3.5 h-3.5 text-slate-500" />
            <span>Jobs ({jobs.length})</span>
          </button>

          {/* Post Job */}
          <button
            type="button"
            onClick={onOpenNewJob}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800 rounded-xl transition-colors shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Post Job</span>
          </button>

          {/* Add Candidate */}
          <button
            type="button"
            onClick={() => onOpenNewCandidate()}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Candidate</span>
          </button>
        </div>
      </div>

      {/* Active Filter Notice */}
      {(selectedJobId !== 'all' || searchQuery.trim() !== '') && (
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-2 px-1">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Filter className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>
              Showing <strong>{filteredCandidates.length}</strong> of{' '}
              <strong>{candidates.length}</strong> candidates
            </span>
            {selectedJobId !== 'all' && (
              <span className="bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800">
                Job: {jobs.find((j) => j.id === selectedJobId)?.title}
              </span>
            )}
            {searchQuery && (
              <span className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
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
            className="text-indigo-600 dark:text-indigo-400 hover:underline font-bold text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* Kanban Board Columns Container — Content-Aware Auto-Shrinking */}
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex items-start gap-3.5 min-w-[780px]">
          {COLUMNS.map((col) => {
            const columnCandidates = filteredCandidates.filter((c) => c.stage === col.id);
            const isOver = draggingOverStage === col.id;
            const isEmpty = columnCandidates.length === 0;
            const isManuallyExpanded = manuallyExpanded[col.id];

            // If autoShrink is active, empty column shrinks unless it's being dragged over or manually expanded
            const isShrunk = autoShrink && isEmpty && !isOver && !isManuallyExpanded;

            if (isShrunk) {
              return (
                <div
                  key={col.id}
                  onDragOver={(e) => handleDragOver(e, col.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDrop(e, col.id)}
                  onClick={() => toggleColumnManualExpand(col.id)}
                  className={`flex flex-col items-center justify-between py-3.5 px-2 rounded-2xl border transition-all duration-300 ease-in-out cursor-pointer group select-none self-start h-auto min-h-[160px] ${
                    col.bg
                  } border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:bg-indigo-50/30 dark:hover:bg-slate-900 w-14 sm:w-16 min-w-[56px] sm:min-w-[64px] shrink-0 border-t-4 ${col.color}`}
                  title={`${col.title} (Empty — click or drag candidate to expand)`}
                >
                  {/* Top: Count & indicator */}
                  <div className="flex flex-col items-center gap-1">
                    <span
                      className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${col.badge}`}
                    >
                      0
                    </span>
                  </div>

                  {/* Middle: Vertical Title */}
                  <div className="flex-1 flex items-center justify-center my-4">
                    <span className="[writing-mode:vertical-rl] rotate-180 font-bold text-[11px] text-slate-500 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-300 tracking-wider uppercase transition-colors">
                      {col.title}
                    </span>
                  </div>

                  {/* Bottom: Quick Add Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenNewCandidate(col.id);
                    }}
                    className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors"
                    title={`Add candidate directly to ${col.title}`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            }

            return (
              <div
                key={col.id}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.id)}
                className={`flex flex-col rounded-2xl border transition-all duration-300 ease-in-out self-start h-auto min-h-[160px] overflow-hidden flex-1 min-w-[240px] sm:min-w-[260px] ${
                  col.bg
                } ${
                  isOver
                    ? 'border-indigo-500 ring-2 ring-indigo-400/40 bg-indigo-50/50 dark:bg-indigo-950/40 scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-800'
                }`}
              >
                {/* Column Header */}
                <div
                  className={`p-3 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs flex items-center justify-between border-t-4 ${col.color}`}
                >
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-xs text-slate-900 dark:text-white tracking-tight">
                      {col.title}
                    </h3>
                    <span
                      className={`text-[11px] font-black px-1.5 py-0.5 rounded-full ${col.badge}`}
                    >
                      {columnCandidates.length}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {isEmpty && autoShrink && (
                      <button
                        type="button"
                        onClick={() => toggleColumnManualExpand(col.id)}
                        className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-md transition-colors text-[10px]"
                        title="Shrink empty column"
                      >
                        <Shrink className="w-3 h-3" />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => onOpenNewCandidate(col.id)}
                      className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                      title={`Add candidate directly to ${col.title}`}
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Cards List with Scroll */}
                <div className="flex-1 p-2.5 overflow-y-auto space-y-2.5">
                  {columnCandidates.length === 0 ? (
                    <div className="h-28 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex items-center justify-center text-center p-3 text-[11px] text-slate-400 dark:text-slate-500">
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

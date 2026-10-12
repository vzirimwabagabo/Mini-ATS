import React from 'react';
import { Candidate, CandidateStage, Job } from '../types';
import { ExternalLink, Sparkles, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { LinkedinIcon } from './Icons';
import confetti from 'canvas-confetti';
import { safeExternalUrl } from '../lib/safeExternalUrl';

interface CandidateCardProps {
  candidate: Candidate;
  job?: Job;
  compactMode: boolean;
  onOpenDetail: (candidate: Candidate) => void;
  onStageChange: (candidateId: string, newStage: CandidateStage) => void;
  onDelete: (candidateId: string) => void;
}

const STAGES: CandidateStage[] = ['sourced', 'screening', 'interview', 'offer', 'hired', 'rejected'];

export const CandidateCard: React.FC<CandidateCardProps> = ({
  candidate,
  job,
  compactMode,
  onOpenDetail,
  onStageChange,
  onDelete
}) => {
  const currentStageIndex = STAGES.indexOf(candidate.stage);
  const linkedinUrl = safeExternalUrl(candidate.linkedinUrl);
  const portfolioUrl = safeExternalUrl(candidate.portfolioUrl);

  const handleNextStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStageIndex < STAGES.length - 2) {
      const nextStage = STAGES[currentStageIndex + 1];
      if (nextStage === 'hired') {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.7 } });
      }
      onStageChange(candidate.id, nextStage);
    }
  };

  const handlePrevStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStageIndex > 0) {
      onStageChange(candidate.id, STAGES[currentStageIndex - 1]);
    }
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', candidate.id);
  };

  const score = candidate.aiEvaluation?.score;
  const scoreColor = score
    ? score >= 85
      ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
      : score >= 70
      ? 'bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800'
      : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';

  if (compactMode) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => onOpenDetail(candidate)}
        className="group relative bg-white dark:bg-slate-800/90 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-md transition-all cursor-pointer flex flex-col gap-1.5"
      >
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs text-slate-900 dark:text-white truncate max-w-[140px]" title={candidate.name}>
            {candidate.name}
          </span>
          {score !== undefined && (
            <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${scoreColor}`}>
              {score}%
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
          <span className="truncate max-w-[130px] font-medium">{job?.title || 'General Pool'}</span>
          {linkedinUrl && (
            <a
              href={linkedinUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-300"
              title="Open LinkedIn"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-slate-700/60 text-[10px] text-slate-400">
          <div className="flex gap-1">
            {currentStageIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevStage}
                className="hover:text-slate-700 dark:hover:text-slate-200 p-0.5"
                title="Previous stage"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}
            {currentStageIndex < STAGES.length - 2 && (
              <button
                type="button"
                onClick={handleNextStage}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5"
                title="Next stage"
              >
                <ChevronRight className="w-3 h-3" />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove ${candidate.name}?`)) onDelete(candidate.id);
            }}
            className="opacity-0 group-hover:opacity-100 text-rose-500 hover:text-rose-700 p-0.5 transition-opacity"
            title="Delete candidate"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>
    );
  }

  // Comfortable mode
  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={() => onOpenDetail(candidate)}
      className="group relative bg-white dark:bg-slate-800/90 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-lg dark:hover:shadow-indigo-950/30 transition-all cursor-pointer flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {candidate.name}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[170px] mt-0.5 font-medium">
            {job?.title || 'Unassigned Job'}
          </p>
        </div>

        {score !== undefined ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${scoreColor}`}
            title="AI CV Match Score"
          >
            <Sparkles className="w-3 h-3" />
            {score}%
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Unscreened</span>
        )}
      </div>

      {/* Tags and Socials */}
      <div className="flex flex-wrap items-center gap-1.5">
        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/60 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800 transition-colors"
          >
            <LinkedinIcon className="w-3 h-3" />
            LinkedIn
          </a>
        )}
        {portfolioUrl && (
          <a
            href={portfolioUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-700/50 hover:bg-slate-100 dark:hover:bg-slate-700 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Portfolio
          </a>
        )}
        {(candidate.tags || []).slice(0, 2).map((tag, i) => (
          <span
            key={i}
            className="text-[10px] bg-slate-100 dark:bg-slate-700/60 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700"
          >
            {tag}
          </span>
        ))}
      </div>

      {candidate.notes && (
        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 italic bg-slate-50/70 dark:bg-slate-900/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800">
          "{candidate.notes}"
        </p>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-700/60 text-xs">
        <div className="flex items-center gap-1">
          {currentStageIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevStage}
              className="p-1 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors"
              title="Move to previous stage"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {currentStageIndex < STAGES.length - 2 && (
            <button
              type="button"
              onClick={handleNextStage}
              className="inline-flex items-center gap-0.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 px-2.5 py-0.5 rounded-md transition-colors"
              title="Move to next stage"
            >
              Advance
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            if (confirm(`Delete candidate ${candidate.name}?`)) onDelete(candidate.id);
          }}
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-md transition-all"
          title="Delete candidate"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

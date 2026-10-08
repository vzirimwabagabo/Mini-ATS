import React from 'react';
import { Candidate, CandidateStage, Job } from '../types';
import { ExternalLink, Sparkles, ChevronRight, ChevronLeft, Trash2 } from 'lucide-react';
import { LinkedinIcon } from './Icons';
import confetti from 'canvas-confetti';

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

  const handleNextStage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (currentStageIndex < STAGES.length - 2) {
      const nextStage = STAGES[currentStageIndex + 1];
      if (nextStage === 'hired') {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
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
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : score >= 70
      ? 'bg-amber-50 text-amber-700 border-amber-200'
      : 'bg-rose-50 text-rose-700 border-rose-200'
    : 'bg-slate-100 text-slate-600 border-slate-200';

  if (compactMode) {
    return (
      <div
        draggable
        onDragStart={handleDragStart}
        onClick={() => onOpenDetail(candidate)}
        className="group relative bg-white p-2.5 rounded-lg border border-slate-200 hover:border-indigo-400 hover:shadow-sm transition-all cursor-pointer flex flex-col gap-1.5"
      >
        <div className="flex items-center justify-between">
          <span className="font-semibold text-xs text-slate-900 truncate max-w-[140px]" title={candidate.name}>
            {candidate.name}
          </span>
          {score && (
            <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${scoreColor}`}>
              {score}%
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500">
          <span className="truncate max-w-[130px]">{job?.title || 'General Pool'}</span>
          {candidate.linkedinUrl && (
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-blue-600 hover:text-blue-800"
              title="Open LinkedIn"
            >
              <LinkedinIcon className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px] text-slate-400">
          <div className="flex gap-1">
            {currentStageIndex > 0 && (
              <button
                type="button"
                onClick={handlePrevStage}
                className="hover:text-slate-700 p-0.5"
                title="Previous stage"
              >
                <ChevronLeft className="w-3 h-3" />
              </button>
            )}
            {currentStageIndex < STAGES.length - 2 && (
              <button
                type="button"
                onClick={handleNextStage}
                className="hover:text-indigo-600 p-0.5"
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
      className="group relative bg-white p-3.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-md transition-all cursor-pointer flex flex-col gap-2.5"
    >
      <div className="flex items-start justify-between gap-2">
        <div>
          <h4 className="font-semibold text-sm text-slate-900 group-hover:text-indigo-600 transition-colors">
            {candidate.name}
          </h4>
          <p className="text-xs text-slate-500 truncate max-w-[170px] mt-0.5">
            {job?.title || 'Unassigned Job'}
          </p>
        </div>

        {score !== undefined ? (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${scoreColor}`}
            title="AI CV Match Score"
          >
            <Sparkles className="w-3 h-3" />
            {score}%
          </span>
        ) : (
          <span className="text-[10px] text-slate-400 font-mono">Not Screened</span>
        )}
      </div>

      {/* Tags and Socials */}
      <div className="flex flex-wrap items-center gap-1.5">
        {candidate.linkedinUrl && (
          <a
            href={candidate.linkedinUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-2 py-0.5 rounded border border-blue-200 transition-colors"
          >
            <LinkedinIcon className="w-3 h-3" />
            LinkedIn
          </a>
        )}
        {candidate.portfolioUrl && (
          <a
            href={candidate.portfolioUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 px-2 py-0.5 rounded border border-slate-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            Portfolio
          </a>
        )}
        {(candidate.tags || []).slice(0, 2).map((tag, i) => (
          <span
            key={i}
            className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200"
          >
            {tag}
          </span>
        ))}
      </div>

      {candidate.notes && (
        <p className="text-[11px] text-slate-500 line-clamp-2 italic bg-slate-50/70 p-1.5 rounded border border-slate-100">
          "{candidate.notes}"
        </p>
      )}

      {/* Card Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
        <div className="flex items-center gap-1">
          {currentStageIndex > 0 && (
            <button
              type="button"
              onClick={handlePrevStage}
              className="p-1 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded transition-colors"
              title="Move to previous stage"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
          )}
          {currentStageIndex < STAGES.length - 2 && (
            <button
              type="button"
              onClick={handleNextStage}
              className="inline-flex items-center gap-0.5 text-[11px] font-medium text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2 py-0.5 rounded transition-colors"
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
          className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all"
          title="Delete candidate"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

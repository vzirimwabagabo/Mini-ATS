import React, { useState } from 'react';
import { Candidate, Job } from '../types';
import { Sparkles, TrendingUp, Users, Award, ChevronDown, ChevronUp, Clock, CheckCircle2 } from 'lucide-react';

interface AnalyticsHeaderProps {
  candidates: Candidate[];
  jobs: Job[];
}

export const AnalyticsHeader: React.FC<AnalyticsHeaderProps> = ({ candidates, jobs }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const screened = candidates.filter((c) => c.aiEvaluation?.score !== undefined);
  const avgScore = screened.length > 0
    ? Math.round(screened.reduce((acc, c) => acc + (c.aiEvaluation?.score || 0), 0) / screened.length)
    : 0;

  const hiredCount = candidates.filter((c) => c.stage === 'hired').length;
  const inOfferCount = candidates.filter((c) => c.stage === 'offer').length;
  const inInterviewCount = candidates.filter((c) => c.stage === 'interview').length;

  return (
    <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between text-xs">
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Users className="w-3.5 h-3.5 text-indigo-500" />
            <span>Total Talent Pool:</span>
            <strong className="text-slate-900 dark:text-white font-bold">{candidates.length}</strong>
          </div>

          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>Avg. AI Fit Score:</span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 font-bold border border-emerald-200 dark:border-emerald-800 text-[11px]">
              {avgScore > 0 ? `${avgScore}%` : 'N/A'}
            </span>
          </div>

          <div className="hidden md:flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            <span>Hired / Offers:</span>
            <span className="text-slate-900 dark:text-white font-bold">
              {hiredCount} Hired • {inOfferCount} Offers
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
        >
          {isExpanded ? (
            <>
              Hide Breakdown <ChevronUp className="w-3.5 h-3.5" />
            </>
          ) : (
            <>
              Pipeline Metrics <ChevronDown className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>

      {isExpanded && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-3 pt-1 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs border-t border-slate-100 dark:border-slate-800/80 animate-in fade-in">
          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Active Jobs</span>
            <span className="text-base font-black text-slate-900 dark:text-white">{jobs.filter(j => j.status === 'active').length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Recruiting positions</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">In Interviews</span>
            <span className="text-base font-black text-indigo-600 dark:text-indigo-400">{inInterviewCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Active evaluations</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">AI Screened</span>
            <span className="text-base font-black text-emerald-600 dark:text-emerald-400">{screened.length}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">{Math.round((screened.length / Math.max(candidates.length, 1)) * 100)}% of candidates</span>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/70 dark:border-slate-800">
            <span className="text-slate-500 dark:text-slate-400 text-[10px] uppercase font-bold block">Hiring Velocity</span>
            <span className="text-base font-black text-amber-600 dark:text-amber-400">12 Days</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Avg. Time-to-Offer</span>
          </div>
        </div>
      )}
    </div>
  );
};

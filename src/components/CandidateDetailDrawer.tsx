import React, { useState } from 'react';
import { Candidate, CandidateStage, Job } from '../types';
import { evaluateCandidateCV } from '../lib/aiAssessment';
import { 
  X, 
  ExternalLink, 
  Mail, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileText,
  Save,
  Check,
  HelpCircle,
  Send,
  Copy,
  Layers,
  Award
} from 'lucide-react';
import { LinkedinIcon } from './Icons';
import confetti from 'canvas-confetti';

interface CandidateDetailDrawerProps {
  candidate: Candidate | null;
  jobs: Job[];
  onClose: () => void;
  onUpdateCandidate: (candidate: Candidate) => void;
}

const STAGES: { id: CandidateStage; label: string }[] = [
  { id: 'sourced', label: 'Sourced' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  candidate,
  jobs,
  onClose,
  onUpdateCandidate,
}) => {
  if (!candidate) return null;

  const currentJob = jobs.find((j) => j.id === candidate.jobId);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [notes, setNotes] = useState(candidate.notes || '');
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'resume' | 'outreach'>('ai');

  const handleStageSelect = (stage: CandidateStage) => {
    if (stage === 'hired') {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }
    const updated = { ...candidate, stage };
    onUpdateCandidate(updated);
  };

  const handleRunAiEvaluation = async () => {
    if (!currentJob) return;
    setIsEvaluating(true);
    try {
      const evaluation = await evaluateCandidateCV(candidate, currentJob);
      const updated: Candidate = {
        ...candidate,
        aiEvaluation: evaluation,
      };
      onUpdateCandidate(updated);
    } catch (err) {
      console.error('Failed to run AI evaluation', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveNotes = () => {
    const updated: Candidate = { ...candidate, notes };
    onUpdateCandidate(updated);
    setIsSavedNotes(true);
    setTimeout(() => setIsSavedNotes(false), 2000);
  };

  const handleCopyOutreach = () => {
    if (candidate.aiEvaluation?.draftOutreachEmail) {
      navigator.clipboard.writeText(candidate.aiEvaluation.draftOutreachEmail);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  const ai = candidate.aiEvaluation;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/60">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">{candidate.name}</h2>
              {ai && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  ai.score >= 85 
                    ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' 
                    : ai.score >= 70 
                    ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700' 
                    : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {ai.score}% Fit Match
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 mt-1">
              {currentJob ? currentJob.title : 'General Talent Pool'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pipeline Stage Quick Changer */}
        <div className="px-6 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
          <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Pipeline Stage
          </label>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {STAGES.map((s) => {
              const isActive = candidate.stage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStageSelect(s.id)}
                  className={`py-1.5 px-1 text-xs font-semibold rounded-lg border text-center transition-all ${
                    isActive
                      ? s.id === 'hired'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : s.id === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-6 gap-6 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/40">
          <button
            type="button"
            onClick={() => setActiveTab('ai')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'ai'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            AI Intelligence & Radar
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resume')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'resume'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            Resume & Bio
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('outreach')}
            className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'outreach'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
            AI Outreach & Pitch
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Contact & Links Header */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3.5 border border-slate-200 dark:border-slate-700/70 grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="flex items-center gap-2 truncate">
              <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <a href={`mailto:${candidate.email}`} className="hover:text-indigo-600 truncate underline">
                {candidate.email}
              </a>
            </div>

            {candidate.phone && (
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>{candidate.phone}</span>
              </div>
            )}

            {candidate.linkedinUrl && (
              <div className="flex items-center gap-2">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}

            {candidate.portfolioUrl && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 dark:text-indigo-400 hover:underline truncate"
                >
                  Portfolio / GitHub
                </a>
              </div>
            )}
          </div>

          {activeTab === 'ai' && (
            <div className="space-y-5">
              {/* AI Trigger Bar */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    AI CV Match Intelligence
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Calculated against requirements for <strong>{currentJob?.title}</strong>
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleRunAiEvaluation}
                  disabled={isEvaluating}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isEvaluating ? (
                    <>
                      <span className="animate-spin">⟳</span>
                      Evaluating CV...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      {ai ? 'Re-Evaluate Fit' : 'Run AI Screening'}
                    </>
                  )}
                </button>
              </div>

              {ai ? (
                <div className="space-y-4 text-xs">
                  {/* Multi-Dimensional Competency Breakdown */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 space-y-3">
                    <span className="font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Multi-Dimensional Fit Radar
                    </span>

                    <div className="grid grid-cols-2 gap-3 text-[11px]">
                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Hard Skills Overlap</span>
                          <span className="font-bold">{ai.skillsMatch || ai.score}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${ai.skillsMatch || ai.score}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Experience & Seniority</span>
                          <span className="font-bold">{ai.experienceMatch || 85}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${ai.experienceMatch || 85}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Tech Stack Relevance</span>
                          <span className="font-bold">{ai.seniorityMatch || 80}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full" style={{ width: `${ai.seniorityMatch || 80}%` }} />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between mb-1">
                          <span className="text-slate-600 dark:text-slate-400">Profile & Footprint Depth</span>
                          <span className="font-bold">{ai.cultureMatch || 88}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                          <div className="h-full bg-amber-500 rounded-full" style={{ width: `${ai.cultureMatch || 88}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-800 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white block mb-1">Executive Summary:</strong>
                    <p className="text-slate-600 dark:text-slate-300">{ai.summary}</p>
                  </div>

                  {/* Strengths & Gaps */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                      <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Key Strengths
                      </span>
                      <ul className="space-y-1.5 text-emerald-800 dark:text-emerald-400 list-disc list-inside">
                        {ai.strengths.map((s, idx) => (
                          <li key={idx} className="leading-snug">{s}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        Areas to Probe
                      </span>
                      <ul className="space-y-1.5 text-amber-800 dark:text-amber-400 list-disc list-inside">
                        {ai.gaps.map((g, idx) => (
                          <li key={idx} className="leading-snug">{g}</li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Tailored Interview Questions */}
                  {ai.tailoredInterviewQuestions && ai.tailoredInterviewQuestions.length > 0 && (
                    <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                      <span className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                        AI-Generated Tailored Interview Questions
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        Ask these during the interview to test gaps identified in the CV:
                      </p>
                      <ul className="space-y-1.5 text-purple-900 dark:text-purple-300">
                        {ai.tailoredInterviewQuestions.map((q, idx) => (
                          <li key={idx} className="p-2 bg-white/70 dark:bg-slate-800/80 rounded-lg border border-purple-100 dark:border-purple-800/50">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Advance to Recommended Stage action */}
                  {ai.recommendedStage && ai.recommendedStage !== candidate.stage && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                      <span className="font-medium text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        Recommended Next Stage: <strong className="capitalize underline">{ai.recommendedStage}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStageSelect(ai.recommendedStage)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-xs"
                      >
                        Apply Stage
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-xs text-slate-400">
                  <Sparkles className="w-8 h-8 mx-auto mb-2 text-indigo-400 opacity-60" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">No AI evaluation run yet</p>
                  <p className="mt-1">Click "Run AI Screening" above to generate multidimensional scores and interview questions.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'resume' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-96 overflow-y-auto">
                {candidate.resumeText || 'No resume text or bio has been attached.'}
              </div>
            </div>
          )}

          {activeTab === 'outreach' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                  Personalized Recruiter Outreach Email
                </span>
                <button
                  type="button"
                  onClick={handleCopyOutreach}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md transition-colors"
                >
                  {copiedEmail ? (
                    <>
                      <Check className="w-3 h-3" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" /> Copy Email
                    </>
                  )}
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200">
                {candidate.aiEvaluation?.draftOutreachEmail || 
                  `Hi ${candidate.name.split(' ')[0]},\n\nI was reviewing your profile and was very impressed by your qualifications for our ${currentJob?.title || 'open role'}.\n\nWould you be open to a 15-minute introductory call this week?\n\nBest regards,\nRecruiting Team`}
              </div>
            </div>
          )}

          {/* Recruiter Notes with Save */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Internal Recruiter Notes
              </label>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isSavedNotes ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="text-emerald-500">Saved</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    Save Notes
                  </>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Candidate interview feedback, timeline, comp expectations..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

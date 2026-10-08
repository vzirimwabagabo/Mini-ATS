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
  Check
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

  const handleStageSelect = (stage: CandidateStage) => {
    if (stage === 'hired') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
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

  const ai = candidate.aiEvaluation;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-2xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/70">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-xl font-bold text-slate-900">{candidate.name}</h2>
              {ai && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                  ai.score >= 85 
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                    : ai.score >= 70 
                    ? 'bg-amber-100 text-amber-800 border-amber-300' 
                    : 'bg-rose-100 text-rose-800 border-rose-300'
                }`}>
                  <Sparkles className="w-3.5 h-3.5" />
                  {ai.score}% AI Match
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-indigo-600 mt-1">
              {currentJob ? currentJob.title : 'General Talent Pool'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/60 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stage Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
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
                    className={`py-2 px-1 text-xs font-medium rounded-lg border text-center transition-all ${
                      isActive
                        ? s.id === 'hired'
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                          : s.id === 'rejected'
                          ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                          : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/30'
                    }`}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Contact & Links */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-slate-700 truncate">
              <Mail className="w-4 h-4 text-slate-400 shrink-0" />
              <a href={`mailto:${candidate.email}`} className="hover:text-indigo-600 truncate underline">
                {candidate.email}
              </a>
            </div>

            {candidate.phone && (
              <div className="flex items-center gap-2 text-slate-700">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span>{candidate.phone}</span>
              </div>
            )}

            {candidate.linkedinUrl && (
              <div className="flex items-center gap-2 text-slate-700">
                <LinkedinIcon className="w-4 h-4 text-blue-600 shrink-0" />
                <a
                  href={candidate.linkedinUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  LinkedIn Profile
                </a>
              </div>
            )}

            {candidate.portfolioUrl && (
              <div className="flex items-center gap-2 text-slate-700">
                <ExternalLink className="w-4 h-4 text-slate-500 shrink-0" />
                <a
                  href={candidate.portfolioUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline truncate"
                >
                  Portfolio / GitHub
                </a>
              </div>
            )}
          </div>

          {/* AI CV Assessment Section */}
          <div className="border border-indigo-100 bg-gradient-to-br from-indigo-50/40 via-white to-purple-50/30 rounded-2xl p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">AI CV Screening & Evaluation</h3>
                  <p className="text-xs text-slate-500">Automated match scoring against job requirements</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRunAiEvaluation}
                disabled={isEvaluating}
                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-3 py-1.5 rounded-lg shadow-xs transition-colors"
              >
                {isEvaluating ? (
                  <>
                    <span className="animate-spin text-sm">⟳</span>
                    Analyzing CV...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    {ai ? 'Re-run Evaluation' : 'Run AI Screening'}
                  </>
                )}
              </button>
            </div>

            {ai ? (
              <div className="space-y-4">
                {/* Score bar */}
                <div>
                  <div className="flex justify-between items-center text-xs font-semibold mb-1">
                    <span className="text-slate-700">Suitability Match Score</span>
                    <span className={ai.score >= 80 ? 'text-emerald-700 font-bold' : 'text-amber-700 font-bold'}>
                      {ai.score}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-700 rounded-full ${
                        ai.score >= 85
                          ? 'bg-emerald-500'
                          : ai.score >= 70
                          ? 'bg-amber-500'
                          : 'bg-rose-500'
                      }`}
                      style={{ width: `${ai.score}%` }}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/80 p-3.5 rounded-xl border border-indigo-100 text-xs text-slate-700 leading-relaxed">
                  <p className="font-semibold text-slate-900 mb-1">AI Recommendation Summary:</p>
                  <p>{ai.summary}</p>
                </div>

                {/* Strengths and Gaps */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                    <span className="font-semibold text-emerald-900 flex items-center gap-1 mb-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Key Strengths
                    </span>
                    <ul className="space-y-1 text-emerald-800 list-disc list-inside">
                      {ai.strengths.map((str, idx) => (
                        <li key={idx} className="leading-snug">{str}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                    <span className="font-semibold text-amber-900 flex items-center gap-1 mb-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                      Areas to Probe / Gaps
                    </span>
                    <ul className="space-y-1 text-amber-800 list-disc list-inside">
                      {ai.gaps.map((gap, idx) => (
                        <li key={idx} className="leading-snug">{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Recommended Stage Quick Action */}
                {ai.recommendedStage && ai.recommendedStage !== candidate.stage && (
                  <div className="flex items-center justify-between p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
                    <span className="text-indigo-900 font-medium flex items-center gap-1.5">
                      <TrendingUp className="w-4 h-4 text-indigo-600" />
                      AI recommends moving candidate to: <strong className="capitalize">{ai.recommendedStage}</strong>
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStageSelect(ai.recommendedStage)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-2.5 py-1 rounded-md transition-colors"
                    >
                      Apply Stage
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-6 bg-white/60 rounded-xl border border-dashed border-indigo-200 text-xs text-slate-500">
                <Sparkles className="w-6 h-6 mx-auto mb-2 text-indigo-400 opacity-60" />
                <p className="font-medium text-slate-700">No AI evaluation has been run for this candidate yet.</p>
                <p className="mt-1">Click "Run AI Screening" above to evaluate CV keywords, relevance, and fit.</p>
              </div>
            )}
          </div>

          {/* Resume / CV Text */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              Resume & Profile Background
            </label>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-mono whitespace-pre-wrap max-h-48 overflow-y-auto">
              {candidate.resumeText || 'No resume text or bio attached for this candidate.'}
            </div>
          </div>

          {/* Recruiter Notes */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Recruiter Notes & Feedback
              </label>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
              >
                {isSavedNotes ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">Saved</span>
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
              placeholder="Add interview feedback, salary expectations, timeline notes..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

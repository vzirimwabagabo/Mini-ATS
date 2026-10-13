import React, { useState } from 'react';
import { Candidate, CandidateStage, Job } from '../types';
import { evaluateCandidateCV } from '../lib/aiAssessment';
import {
  X, ExternalLink, Mail, Phone, Sparkles, CheckCircle2, AlertCircle,
  TrendingUp, FileText, Save, Check, HelpCircle, Send, Copy,
  Layers, ShieldAlert, Star, MessageSquareWarning, Target,
  Loader2, BookOpen, Zap,
} from 'lucide-react';
import { LinkedinIcon } from './Icons';
import confetti from 'canvas-confetti';
import { safeExternalUrl } from '../lib/safeExternalUrl';

interface CandidateDetailDrawerProps {
  candidate: Candidate | null;
  jobs: Job[];
  onClose: () => void;
  onEditCandidate: (candidate: Candidate) => void;
  onUpdateCandidate: (candidate: Candidate) => Promise<void> | void;
}

const STAGES: { id: CandidateStage; label: string }[] = [
  { id: 'sourced', label: 'Sourced' },
  { id: 'screening', label: 'Screening' },
  { id: 'interview', label: 'Interview' },
  { id: 'offer', label: 'Offer' },
  { id: 'hired', label: 'Hired' },
  { id: 'rejected', label: 'Rejected' },
];

// ─── Tier badge config ────────────────────────────────────────────────────────
const TIER_CONFIG = {
  strong_yes: {
    label: '★ Strong Yes',
    bg: 'bg-emerald-100 dark:bg-emerald-950/60',
    text: 'text-emerald-800 dark:text-emerald-300',
    border: 'border-emerald-300 dark:border-emerald-700',
    dot: 'bg-emerald-500',
  },
  yes: {
    label: '✓ Yes',
    bg: 'bg-blue-100 dark:bg-blue-950/60',
    text: 'text-blue-800 dark:text-blue-300',
    border: 'border-blue-300 dark:border-blue-700',
    dot: 'bg-blue-500',
  },
  maybe: {
    label: '~ Maybe',
    bg: 'bg-amber-100 dark:bg-amber-950/60',
    text: 'text-amber-800 dark:text-amber-300',
    border: 'border-amber-300 dark:border-amber-700',
    dot: 'bg-amber-500',
  },
  no: {
    label: '✗ No',
    bg: 'bg-rose-100 dark:bg-rose-950/60',
    text: 'text-rose-800 dark:text-rose-300',
    border: 'border-rose-300 dark:border-rose-700',
    dot: 'bg-rose-500',
  },
  strong_no: {
    label: '✗✗ Strong No',
    bg: 'bg-rose-200 dark:bg-rose-950/80',
    text: 'text-rose-900 dark:text-rose-200',
    border: 'border-rose-400 dark:border-rose-700',
    dot: 'bg-rose-700',
  },
};

// ─── Score bar component ──────────────────────────────────────────────────────
const ScoreBar: React.FC<{
  label: string;
  value: number;
  color?: string;
  hint?: string;
}> = ({ label, value, color = 'bg-indigo-500', hint }) => {
  const barColor = value >= 75 ? 'bg-emerald-500' : value >= 55 ? 'bg-amber-500' : 'bg-rose-500';
  return (
    <div>
      <div className="flex justify-between items-center mb-1">
        <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
          {label}
          {hint && <span className="text-slate-400 ml-1 text-[10px]">— {hint}</span>}
        </span>
        <span
          className={`text-[11px] font-bold ${
            value >= 75
              ? 'text-emerald-700 dark:text-emerald-400'
              : value >= 55
              ? 'text-amber-700 dark:text-amber-400'
              : 'text-rose-600 dark:text-rose-400'
          }`}
        >
          {value}
        </span>
      </div>
      <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all duration-700`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

// ─── Main Drawer ──────────────────────────────────────────────────────────────
export const CandidateDetailDrawer: React.FC<CandidateDetailDrawerProps> = ({
  candidate,
  jobs,
  onClose,
  onEditCandidate,
  onUpdateCandidate,
}) => {
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [notes, setNotes] = useState('');
  const [isSavedNotes, setIsSavedNotes] = useState(false);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [activeTab, setActiveTab] = useState<'ai' | 'resume' | 'outreach'>('ai');

  if (!candidate) return null;

  const currentJob = jobs.find((j) => j.id === candidate.jobId);
  const linkedinUrl = safeExternalUrl(candidate.linkedinUrl);
  const portfolioUrl = safeExternalUrl(candidate.portfolioUrl);

  const ai = candidate.aiEvaluation;
  const tier = ai?.tier;
  const tierConfig = tier ? TIER_CONFIG[tier] : null;
  const handleStageSelect = async (stage: CandidateStage) => {
    if (stage === 'hired') {
      confetti({ particleCount: 90, spread: 75, origin: { y: 0.6 } });
    }
    try {
      await onUpdateCandidate({ ...candidate, stage });
    } catch (err) {
      alert(`Could not update candidate stage: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleRunAiEvaluation = async () => {
    if (!currentJob) return;
    setIsEvaluating(true);
    try {
      const evaluation = await evaluateCandidateCV(candidate, currentJob);
      await onUpdateCandidate({ ...candidate, aiEvaluation: evaluation });
    } catch (err) {
      alert(`Could not save the assessment: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleSaveNotes = async () => {
    try {
      await onUpdateCandidate({ ...candidate, notes });
      setIsSavedNotes(true);
      setTimeout(() => setIsSavedNotes(false), 2000);
    } catch (err) {
      alert(`Could not save notes: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  };

  const handleCopyOutreach = () => {
    const text = ai?.draftOutreachEmail;
    if (text) {
      navigator.clipboard.writeText(text);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 h-full shadow-2xl flex flex-col border-l border-slate-200 dark:border-slate-800 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-start justify-between bg-slate-50/70 dark:bg-slate-900/60 shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                {candidate.name}
              </h2>
              {/* Overall score badge */}
              {ai && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                    ai.score >= 80
                      ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700'
                      : ai.score >= 60
                      ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
                      : ai.score >= 45
                      ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700'
                      : 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-700'
                  }`}
                >
                  <Sparkles className="w-3 h-3" />
                  {ai.score}/100
                </span>
              )}
              {/* Tier verdict badge */}
              {tierConfig && (
                <span
                  className={`inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full border ${tierConfig.bg} ${tierConfig.text} ${tierConfig.border}`}
                >
                  {tierConfig.label}
                </span>
              )}
              {/* LLM badge */}
              {ai?.usedLLM && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700">
                  <Zap className="w-2.5 h-2.5" /> Gemini AI
                </span>
              )}
            </div>
            <p className="text-sm font-semibold text-indigo-600 dark:text-indigo-400">
              {currentJob ? currentJob.title : 'General Talent Pool'}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEditCandidate(candidate)}
              className="p-2 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-300 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-lg transition-colors shrink-0"
              title="Edit candidate profile"
              aria-label="Edit candidate profile"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 rounded-full transition-colors shrink-0"
              aria-label="Close candidate details"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ── Pipeline Stage Changer ── */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
          <div className="flex items-center justify-between mb-2">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Pipeline Stage
            </label>
            {ai?.recommendedStage && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  AI Recommendation:
                </span>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold capitalize bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  <TrendingUp className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
                  {ai.recommendedStage}
                </span>
                {ai.recommendedStage !== candidate.stage && (
                  <button
                    type="button"
                    onClick={() => handleStageSelect(ai.recommendedStage)}
                    className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
                    title={`Advance candidate to AI recommended stage (${ai.recommendedStage})`}
                  >
                    Advance to {ai.recommendedStage}
                  </button>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-6 gap-1.5">
            {STAGES.map((s) => {
              const isActive = candidate.stage === s.id;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => handleStageSelect(s.id)}
                  className={`py-1.5 text-[11px] font-bold rounded-lg border text-center transition-all ${
                    isActive
                      ? s.id === 'hired'
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                        : s.id === 'rejected'
                        ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                        : 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-slate-100 dark:border-slate-800 px-5 gap-5 text-xs font-semibold bg-slate-50/50 dark:bg-slate-900/40 shrink-0">
          {(
            [
              { id: 'ai', icon: Sparkles, label: 'AI Assessment' },
              { id: 'resume', icon: FileText, label: 'Resume' },
              { id: 'outreach', icon: Send, label: 'Outreach' },
            ] as const
          ).map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`py-3 border-b-2 flex items-center gap-1.5 transition-colors ${
                activeTab === id
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 font-bold'
                  : 'border-transparent text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Contact strip */}
          <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-3 border border-slate-200 dark:border-slate-700/70 grid grid-cols-2 gap-2 text-xs">
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
            {linkedinUrl && (
              <div className="flex items-center gap-2">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <a href={linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline truncate">
                  LinkedIn Profile
                </a>
              </div>
            )}
            {portfolioUrl && (
              <div className="flex items-center gap-2">
                <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <a href={portfolioUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 hover:underline truncate">
                  Portfolio / GitHub
                </a>
              </div>
            )}
          </div>

          {/* ════════════ AI TAB ════════════ */}
          {activeTab === 'ai' && (
            <div className="space-y-4 text-xs">
              {/* Run / Re-run button */}
              <div className="p-4 rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-indigo-950/30 dark:via-slate-900 dark:to-purple-950/20 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    AI CV Assessment Engine
                    <span className="text-[10px] font-normal text-slate-400 ml-1">Local engine</span>
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Calibrated fit scoring against <strong>{currentJob?.title}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRunAiEvaluation}
                  disabled={isEvaluating || !currentJob}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
                >
                  {isEvaluating ? (
                    <><Loader2 className="w-3.5 h-3.5 animate-spin" />Evaluating…</>
                  ) : (
                    <><Sparkles className="w-3.5 h-3.5" />{ai ? 'Re-Evaluate' : 'Run Assessment'}</>
                  )}
                </button>
              </div>

              {ai ? (
                <div className="space-y-4">
                  {/* ── Scoring Rationale (honest) ── */}
                  {ai.scoringRationale && (
                    <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                        Scoring Rationale
                      </span>
                      <p className="text-slate-600 dark:text-slate-300 leading-relaxed">{ai.scoringRationale}</p>
                    </div>
                  )}

                  {/* ── Executive Summary ── */}
                  <div className="p-3.5 rounded-xl border border-indigo-100 dark:border-indigo-900/60 bg-white dark:bg-slate-800 leading-relaxed">
                    <strong className="text-slate-900 dark:text-white block mb-1">Assessment Summary</strong>
                    <p className="text-slate-600 dark:text-slate-300">{ai.summary}</p>
                  </div>

                  {/* ── 5-Dimension Radar ── */}
                  <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 space-y-3">
                    <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5 text-indigo-500" />
                      Competency Radar
                      <span className="text-[10px] font-normal text-slate-400 ml-1">(honest, calibrated scoring)</span>
                    </span>
                    <div className="grid grid-cols-1 gap-2.5">
                      <ScoreBar label="Technical Depth" value={ai.technicalDepthScore ?? ai.skillsMatch ?? 50} hint="hands-on skill evidence in CV" />
                      <ScoreBar label="Experience Relevance" value={ai.experienceRelevanceScore ?? ai.experienceMatch ?? 50} hint="years + domain match" />
                      <ScoreBar label="Seniority Alignment" value={ai.seniorityAlignmentScore ?? ai.seniorityMatch ?? 50} hint="level vs job requirement" />
                      <ScoreBar label="Achievement Quality" value={ai.achievementQualityScore ?? 50} hint="quantified results vs vague claims" />
                      <ScoreBar label="CV Clarity" value={ai.communicationClarityScore ?? ai.cultureMatch ?? 50} hint="how clearly experience is communicated" />
                    </div>
                  </div>

                  {/* ── Red Flags (blockers) ── */}
                  {(ai.redFlags?.length ?? 0) > 0 && (
                    <div className="p-3.5 rounded-xl bg-rose-50/80 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/60">
                      <span className="font-bold text-rose-800 dark:text-rose-300 flex items-center gap-1.5 mb-2">
                        <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                        Red Flags — Investigate Before Proceeding
                      </span>
                      <ul className="space-y-1">
                        {ai.redFlags!.map((f, i) => (
                          <li key={i} className="flex items-start gap-2 text-rose-700 dark:text-rose-400">
                            <span className="mt-0.5 text-rose-500 shrink-0">⚑</span>
                            {f}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Green Flags + Strengths ── */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(ai.greenFlags?.length ?? 0) > 0 && (
                      <div className="p-3.5 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800">
                        <span className="font-bold text-emerald-900 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
                          <Star className="w-3.5 h-3.5 text-emerald-600" />
                          Green Flags
                        </span>
                        <ul className="space-y-1.5 text-emerald-800 dark:text-emerald-400">
                          {ai.greenFlags!.map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                              {f}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                      <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 mb-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                        Strengths
                      </span>
                      <ul className="space-y-1.5 text-slate-600 dark:text-slate-400">
                        {ai.strengths.map((s, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
                            {s}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* ── Critical Gaps (blockers) ── */}
                  {(ai.criticalGaps?.length ?? 0) > 0 && (
                    <div className="p-3.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800">
                      <span className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5 mb-2">
                        <Target className="w-3.5 h-3.5 text-amber-600" />
                        Critical Gaps — Must-Have Requirements Not Met
                      </span>
                      <ul className="space-y-1.5 text-amber-800 dark:text-amber-400">
                        {ai.criticalGaps!.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-600" />
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── General Gaps ── */}
                  {ai.gaps.length > 0 && (
                    <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/50">
                      <span className="font-bold text-orange-900 dark:text-orange-300 flex items-center gap-1.5 mb-2">
                        <MessageSquareWarning className="w-3.5 h-3.5 text-orange-500" />
                        Areas to Probe / Validate
                      </span>
                      <ul className="space-y-1.5 text-orange-800 dark:text-orange-400">
                        {ai.gaps.map((g, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="mt-0.5 shrink-0 text-orange-400">–</span>
                            {g}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Interview Questions (from probeQuestions + tailored) ── */}
                  {((ai.probeQuestions?.length ?? 0) > 0 || (ai.tailoredInterviewQuestions?.length ?? 0) > 0) && (
                    <div className="p-4 rounded-xl border border-purple-200 dark:border-purple-900/60 bg-purple-50/40 dark:bg-purple-950/20 space-y-2">
                      <span className="font-bold text-purple-950 dark:text-purple-300 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-purple-600" />
                        Interview Probe Questions
                        <span className="text-[10px] font-normal text-slate-400 ml-1">designed to expose gaps &amp; verify depth</span>
                      </span>
                      <ul className="space-y-2 text-purple-900 dark:text-purple-300">
                        {[...(ai.probeQuestions || []), ...(ai.tailoredInterviewQuestions || [])]
                          .slice(0, 5)
                          .map((q, i) => (
                            <li key={i} className="p-2.5 bg-white/70 dark:bg-slate-800/80 rounded-lg border border-purple-100 dark:border-purple-800/50 leading-snug">
                              <span className="text-purple-500 font-bold mr-1.5">Q{i + 1}.</span>
                              {q}
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}

                  {/* ── Advance to recommended stage ── */}
                  {ai.recommendedStage && ai.recommendedStage !== candidate.stage && (
                    <div className="p-3 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 rounded-xl flex items-center justify-between">
                      <span className="font-medium text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-indigo-600" />
                        AI recommends: <strong className="capitalize ml-1 underline">{ai.recommendedStage}</strong>
                      </span>
                      <button
                        type="button"
                        onClick={() => handleStageSelect(ai.recommendedStage)}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg transition-colors shadow-xs"
                      >
                        Apply
                      </button>
                    </div>
                  )}

                  {/* Last evaluated */}
                  <p className="text-[10px] text-slate-400 text-center">
                    Evaluated {new Date(ai.evaluatedAt).toLocaleString()} ·{' '}
                    {ai.usedLLM ? 'Gemini AI engine' : 'Local heuristic engine'}
                  </p>
                </div>
              ) : (
                <div className="text-center py-14 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  <Sparkles className="w-10 h-10 mx-auto mb-3 text-indigo-300 opacity-60" />
                  <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No assessment run yet</p>
                  <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                    Click "Run Assessment" above to get calibrated scores, red flags, green flags, and interview probe questions.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ════════════ RESUME TAB ════════════ */}
          {activeTab === 'resume' && (
            <div className="space-y-3">
              {/* Tags */}
              {(candidate.tags || []).length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {candidate.tags!.map((tag, i) => (
                    <span key={i} className="text-[11px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800/50 px-2 py-0.5 rounded-md font-medium">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 text-xs font-mono leading-relaxed whitespace-pre-wrap max-h-[55vh] overflow-y-auto text-slate-700 dark:text-slate-200">
                {candidate.resumeText || 'No resume text or bio has been attached to this candidate.'}
              </div>
            </div>
          )}

          {/* ════════════ OUTREACH TAB ════════════ */}
          {activeTab === 'outreach' && (
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-indigo-500" />
                  {ai?.tier === 'no' || ai?.tier === 'strong_no'
                    ? 'Polite Decline Template'
                    : 'Personalized Outreach Email'
                  }
                </span>
                <button
                  type="button"
                  onClick={handleCopyOutreach}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-2.5 py-1 rounded-md transition-colors"
                >
                  {copiedEmail ? <><Check className="w-3 h-3" /> Copied!</> : <><Copy className="w-3 h-3" /> Copy</>}
                </button>
              </div>
              {!ai && (
                <p className="text-slate-400 text-[11px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-2.5">
                  Run the AI Assessment first to generate a personalized, context-aware email.
                </p>
              )}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 font-mono whitespace-pre-wrap leading-relaxed text-slate-700 dark:text-slate-200 min-h-48">
                {ai?.draftOutreachEmail ||
                  `Hi ${candidate.name.split(' ')[0]},\n\nI came across your profile and wanted to reach out regarding our ${currentJob?.title || 'open role'} position.\n\nWould you be open to a brief 20-minute call this week?\n\nBest regards,\nTalent Team`}
              </div>
            </div>
          )}

          {/* ── Recruiter Notes ── */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                Internal Notes
              </label>
              <button
                type="button"
                onClick={handleSaveNotes}
                className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {isSavedNotes ? (
                  <><Check className="w-3.5 h-3.5 text-emerald-500" /><span className="text-emerald-500">Saved</span></>
                ) : (
                  <><Save className="w-3.5 h-3.5" />Save Notes</>
                )}
              </button>
            </div>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Interview feedback, timeline, compensation expectations, referral source…"
              className="w-full text-xs p-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

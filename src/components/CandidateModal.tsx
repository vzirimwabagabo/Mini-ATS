import React, { useState } from 'react';
import { Candidate, CandidateStage, Job } from '../types';
import { evaluateCandidateCV } from '../lib/aiAssessment';
import { X, UserPlus, Link, Mail, Phone, FileText, Sparkles } from 'lucide-react';
import { LinkedinIcon } from './Icons';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  currentCustomerId: string;
  onCandidateSaved: (candidate: Candidate) => void;
  candidateToEdit?: Candidate | null;
  defaultStage?: CandidateStage;
}

const SAMPLE_RESUMES = [
  {
    label: 'Senior Full Stack CV',
    text: `Full Stack Engineer with 7 years experience designing scalable web platforms with React, TypeScript, Node.js, and PostgreSQL / Supabase.
- Led front-end architecture for real-time collaborative workspace used by 80k MAU.
- Expert in Supabase Row Level Security, Edge Functions, and state synchronization.
- Bachelor's in Computer Science from UC Berkeley.`
  },
  {
    label: 'Product Manager CV',
    text: `Product Leader with 5 years managing enterprise SaaS and Generative AI workflows.
- Partnered with engineering to deliver LLM-powered candidate screening assistant.
- Increased user retention by 34% through iterative user interview cycles and clean UX prototypes in Figma.
- Skilled in Agile, data-driven prioritization, and roadmapping.`
  },
  {
    label: 'Enterprise AE CV',
    text: `Enterprise Account Executive with 6 years experience selling B2B SaaS solutions to Fortune 1000 accounts.
- Attained 138% of annual quota ($1.8M ARR closed).
- Proficient in MEDDPICC sales methodology and contract negotiation.`
  }
];

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  jobs,
  currentCustomerId,
  onCandidateSaved,
  candidateToEdit,
  defaultStage = 'sourced',
}) => {
  if (!isOpen) return null;

  const defaultJobId = candidateToEdit?.jobId || (jobs.length > 0 ? jobs[0].id : '');

  const [name, setName] = useState(candidateToEdit?.name || '');
  const [email, setEmail] = useState(candidateToEdit?.email || '');
  const [phone, setPhone] = useState(candidateToEdit?.phone || '');
  const [jobId, setJobId] = useState(defaultJobId);
  const [stage, setStage] = useState<CandidateStage>(candidateToEdit?.stage || defaultStage);
  const [linkedinUrl, setLinkedinUrl] = useState(candidateToEdit?.linkedinUrl || '');
  const [portfolioUrl, setPortfolioUrl] = useState(candidateToEdit?.portfolioUrl || '');
  const [resumeText, setResumeText] = useState(candidateToEdit?.resumeText || '');
  const [notes, setNotes] = useState(candidateToEdit?.notes || '');
  const [tagsInput, setTagsInput] = useState((candidateToEdit?.tags || []).join(', '));
  const [autoRunAi, setAutoRunAi] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !jobId) return;

    setIsSubmitting(true);
    try {
      const selectedJob = jobs.find((j) => j.id === jobId);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const candidateBase: Candidate = {
        id: candidateToEdit?.id || 'cand-' + Date.now(),
        customerId: candidateToEdit?.customerId || currentCustomerId,
        jobId,
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim() || undefined,
        linkedinUrl: linkedinUrl.trim() || undefined,
        portfolioUrl: portfolioUrl.trim() || undefined,
        resumeText: resumeText.trim() || undefined,
        stage,
        notes: notes.trim() || undefined,
        tags,
        createdAt: candidateToEdit?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (autoRunAi && selectedJob) {
        const evaluation = await evaluateCandidateCV(candidateBase, selectedJob);
        candidateBase.aiEvaluation = evaluation;
      }

      onCandidateSaved(candidateBase);
      onClose();
    } catch (err) {
      console.error('Error saving candidate', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {candidateToEdit ? 'Edit Candidate Profile' : 'Add Candidate'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Enter candidate background, LinkedIn link, and CV text
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Target Job & Initial Stage */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Job Position *
              </label>
              <select
                required
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                {jobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} ({j.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CandidateStage)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="sourced">Sourced</option>
                <option value="screening">Screening</option>
                <option value="interview">Interview</option>
                <option value="offer">Offer</option>
                <option value="hired">Hired</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          {/* Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Henderson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address *
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  placeholder="alex@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Phone & LinkedIn URL */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-600 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Portfolio & Tags */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Portfolio / GitHub Link
              </label>
              <div className="relative">
                <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Skills / Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="React, TypeScript, AWS"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Resume Text & Quick Samples */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Candidate Resume / Bio Text
              </label>
              <div className="flex gap-1.5">
                <span className="text-[11px] text-slate-400">Quick Fill:</span>
                {SAMPLE_RESUMES.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setResumeText(sample.text)}
                    className="text-[10px] text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              placeholder="Paste candidate resume text, skills, past experience, or education..."
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono"
            />
          </div>

          {/* Recruiter Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Internal Recruiter Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Referred by CTO; available immediately"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          {/* Auto AI screening checkbox */}
          <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <label htmlFor="autoRunAi" className="text-xs font-medium text-indigo-950 cursor-pointer">
                Automatically run AI CV Screening upon saving
              </label>
            </div>
            <input
              type="checkbox"
              id="autoRunAi"
              checked={autoRunAi}
              onChange={(e) => setAutoRunAi(e.target.checked)}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-700 hover:bg-slate-100 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {isSubmitting ? 'Saving Candidate...' : 'Save Candidate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

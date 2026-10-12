import React, { useState, useRef, useCallback } from 'react';
import { Candidate, CandidateStage, Job, UserProfile } from '../types';
import { evaluateCandidateCV } from '../lib/aiAssessment';
import { extractTextFromFile, FileExtractionResult } from '../lib/cvParser';
import { parseStructuredCV, ParsedCV, parsedCVToResumeText } from '../lib/cvStructure';
import {
  X, UserPlus, Link, Mail, Phone, FileText, Sparkles,
  Upload, CheckCircle2, AlertCircle, Loader2, Brain,
  ChevronDown, ChevronUp, FileSearch,
} from 'lucide-react';
import { LinkedinIcon } from './Icons';

interface CandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  profiles: UserProfile[];
  currentCustomerId: string;
  onCandidateSaved: (candidate: Candidate) => Promise<void> | void;
  candidateToEdit?: Candidate | null;
  defaultStage?: CandidateStage;
}

const SAMPLE_RESUMES = [
  {
    label: 'Full Stack CV',
    text: `Alex Rivera — alex.rivera@gmail.com | +1 (415) 555-0190 | linkedin.com/in/alex-rivera-dev | github.com/alexrivera

Senior Full Stack Engineer with 7 years experience designing scalable platforms using React, TypeScript, Node.js, and PostgreSQL / Supabase.
- Led front-end architecture for a real-time collaborative workspace used by 80k MAU.
- Expert in Supabase Row Level Security, Edge Functions, and WebSocket state synchronization.
- BSc Computer Science, UC Berkeley (2017).`,
  },
  {
    label: 'Product Manager CV',
    text: `Jordan Kim — jordan.kim@example.com | +44 7700 900123 | linkedin.com/in/jordan-kim-pm

Product Leader with 5 years managing enterprise SaaS and Generative AI workflows.
- Partnered with engineering to deliver an LLM-powered candidate screening assistant (GPT-4, Gemini).
- Increased user retention by 34% through iterative research cycles and Figma prototypes.
- MBA, Stanford Graduate School of Business (2019).
Skills: Product Strategy, Agile, Figma, SQL, A/B Testing, B2B SaaS, User Research.`,
  },
  {
    label: 'Enterprise AE CV',
    text: `Casey Thompson — casey.t@example.com | +1 (628) 555-0177 | linkedin.com/in/caseythompson-ae

Enterprise Account Executive with 6 years selling B2B SaaS to Fortune 1000 accounts.
- Attained 138% of $1.8M ARR annual quota.
- Proficient in MEDDPICC, Salesforce CRM, and multi-thread executive engagement.
- BA Business Administration, University of Michigan (2018).
Skills: Enterprise Sales, CRM, Contract Negotiation, Pipeline Management, HubSpot.`,
  },
];

// ---------------------------------------------------------------------------
// CV Upload Zone Component
// ---------------------------------------------------------------------------

type ParseStatus = 'idle' | 'extracting' | 'parsing' | 'done' | 'error';

interface CVUploadZoneProps {
  onParsed: (result: ParsedCV, rawText: string) => void;
}

const CVUploadZone: React.FC<CVUploadZoneProps> = ({ onParsed }) => {
  const [status, setStatus] = useState<ParseStatus>('idle');
  const [statusMsg, setStatusMsg] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [parseResult, setParseResult] = useState<{ usedLLM: boolean; fileName: string } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setStatus('extracting');
      setStatusMsg(`Reading ${file.name}…`);
      setParseResult(null);

      // Step 1: Extract text from file
      const extraction: FileExtractionResult = await extractTextFromFile(file);

      if (extraction.error || !extraction.text) {
        setStatus('error');
        setStatusMsg(extraction.error || 'Could not extract text from file.');
        return;
      }

      setStatus('parsing');
      setStatusMsg('Parsing with local heuristic engine…');

      // Step 2: Local structured extraction
      const { parsed, usedLLM, error } = await parseStructuredCV(extraction.text);

      setStatus('done');
      setParseResult({ usedLLM, fileName: file.name });
      setStatusMsg(
        usedLLM
          ? `✓ Gemini AI extracted structured data from ${file.name}`
          : `✓ Local parser extracted data from ${file.name}${error ? ' (LLM unavailable)' : ''}`
      );

      onParsed(parsed, extraction.text);
    },
    [onParsed]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
      e.target.value = '';
    },
    [processFile]
  );

  return (
    <div className="space-y-2">
      {/* Drop Zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-5 text-center cursor-pointer
          transition-all duration-200 select-none group
          ${dragOver
            ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-950/30 scale-[1.01]'
            : 'border-slate-200 dark:border-slate-700 hover:border-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20'
          }
          ${status === 'done' ? 'border-emerald-400 bg-emerald-50/60 dark:bg-emerald-950/20' : ''}
          ${status === 'error' ? 'border-rose-300 bg-rose-50/60 dark:bg-rose-950/20' : ''}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,.docx,.txt"
          onChange={handleFileInput}
          className="hidden"
        />

        {status === 'idle' && (
          <div className="flex flex-col items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                Drop CV here or <span className="text-indigo-600 underline">click to upload</span>
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">PDF · DOCX · TXT — up to 10 MB</p>
            </div>
            <div className="flex items-center gap-1.5 mt-1 bg-indigo-600/10 dark:bg-indigo-500/20 px-3 py-1 rounded-full">
              <Brain className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
              <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-300">
                Smart local parser → auto-fills all fields
              </span>
            </div>
          </div>
        )}

        {(status === 'extracting' || status === 'parsing') && (
          <div className="flex flex-col items-center gap-2 py-1">
            <Loader2 className="w-7 h-7 text-indigo-600 dark:text-indigo-400 animate-spin" />
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{statusMsg}</p>
            <div className="w-48 h-1 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-indigo-500 rounded-full animate-pulse"
                style={{ width: status === 'extracting' ? '40%' : '80%' }}
              />
            </div>
          </div>
        )}

        {status === 'done' && (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <CheckCircle2 className="w-7 h-7 text-emerald-500" />
            <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">{statusMsg}</p>
            {parseResult?.usedLLM && (
              <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-semibold">
                ✦ Gemini AI parsed
              </span>
            )}
            <p className="text-[11px] text-slate-400">Click to upload a different file</p>
          </div>
        )}

        {status === 'error' && (
          <div className="flex flex-col items-center gap-1.5 py-1">
            <AlertCircle className="w-7 h-7 text-rose-500" />
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{statusMsg}</p>
            <p className="text-[11px] text-slate-400">Click to try another file</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Parsed CV Preview Component
// ---------------------------------------------------------------------------

interface ParsedCVPreviewProps {
  parsed: ParsedCV;
}

const ParsedCVPreview: React.FC<ParsedCVPreviewProps> = ({ parsed }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-gradient-to-br from-indigo-50/80 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/20 border border-indigo-200 dark:border-indigo-800/50 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3.5 py-2.5 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/30 transition-colors"
      >
        <div className="flex items-center gap-2">
          <FileSearch className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xs font-bold text-indigo-800 dark:text-indigo-200">
            AI Extracted Data Preview
          </span>
          <span className="text-[10px] bg-indigo-200/80 dark:bg-indigo-800/50 text-indigo-700 dark:text-indigo-300 px-1.5 py-0.5 rounded-full font-semibold">
            {parsed.skills.length} skills · {parsed.workExperience.length} jobs · {parsed.education.length} edu
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
        ) : (
          <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
        )}
      </button>

      {expanded && (
        <div className="px-3.5 pb-3.5 space-y-3 text-xs">
          {/* Contact */}
          {(parsed.fullName || parsed.email || parsed.phone) && (
            <div>
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">Contact</p>
              <div className="space-y-0.5">
                {parsed.fullName && <p><span className="text-slate-500">Name:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{parsed.fullName}</span></p>}
                {parsed.email && <p><span className="text-slate-500">Email:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{parsed.email}</span></p>}
                {parsed.phone && <p><span className="text-slate-500">Phone:</span> <span className="font-medium text-slate-800 dark:text-slate-200">{parsed.phone}</span></p>}
                {parsed.linkedinUrl && <p><span className="text-slate-500">LinkedIn:</span> <span className="font-medium text-blue-600 break-all">{parsed.linkedinUrl}</span></p>}
              </div>
            </div>
          )}

          {/* Skills */}
          {parsed.skills.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">Skills ({parsed.skills.length})</p>
              <div className="flex flex-wrap gap-1">
                {parsed.skills.slice(0, 20).map((s, i) => (
                  <span key={i} className="bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 rounded text-[10px] font-medium">
                    {s}
                  </span>
                ))}
                {parsed.skills.length > 20 && (
                  <span className="text-slate-400 text-[10px] px-1">+{parsed.skills.length - 20} more</span>
                )}
              </div>
            </div>
          )}

          {/* Work Experience */}
          {parsed.workExperience.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">Work Experience</p>
              <div className="space-y-1.5">
                {parsed.workExperience.slice(0, 4).map((w, i) => (
                  <div key={i} className="bg-white/60 dark:bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{w.title}</p>
                    <p className="text-slate-500 dark:text-slate-400">{w.company}{w.startDate ? ` · ${w.startDate} – ${w.endDate || 'Present'}` : ''}</p>
                    {w.description && <p className="text-slate-500 dark:text-slate-500 mt-0.5 text-[11px]">{w.description}</p>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {parsed.education.length > 0 && (
            <div>
              <p className="text-[10px] font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-1">Education</p>
              <div className="space-y-1">
                {parsed.education.map((e, i) => (
                  <div key={i} className="bg-white/60 dark:bg-slate-800/40 rounded-lg px-2.5 py-1.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{e.institution}</p>
                    {(e.degree || e.field) && (
                      <p className="text-slate-500 dark:text-slate-400">
                        {[e.degree, e.field].filter(Boolean).join(' in ')}
                        {e.graduationYear ? ` · ${e.graduationYear}` : ''}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Seniority & Experience */}
          {(parsed.seniorityLevel || parsed.totalYearsExperience) && (
            <div className="flex items-center gap-3">
              {parsed.seniorityLevel && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Seniority:</span>
                  <span className="capitalize font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-900/40 px-2 py-0.5 rounded-full text-[10px]">
                    {parsed.seniorityLevel}
                  </span>
                </div>
              )}
              {parsed.totalYearsExperience && (
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-slate-500">Experience:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px]">
                    {parsed.totalYearsExperience}+ years
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Main CandidateModal Component
// ---------------------------------------------------------------------------

export const CandidateModal: React.FC<CandidateModalProps> = ({
  isOpen,
  onClose,
  jobs,
  profiles,
  currentCustomerId,
  onCandidateSaved,
  candidateToEdit,
  defaultStage = 'sourced',
}) => {
  const defaultJobId = candidateToEdit?.jobId || (jobs.length > 0 ? jobs[0].id : '');
  const availableJobs = candidateToEdit
    ? jobs.filter((job) => job.customerId === candidateToEdit.customerId)
    : jobs;

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

  // CV Parsing state
  const [parsedCV, setParsedCV] = useState<ParsedCV | null>(null);
  const [showUploadZone, setShowUploadZone] = useState(!candidateToEdit);
  const selectedJob = availableJobs.find((job) => job.id === jobId);
  const selectedCustomer = profiles.find((profile) => profile.id === selectedJob?.customerId);

  /** Called when CV upload + parse completes — auto-fills form fields */
  const handleCVParsed = useCallback((parsed: ParsedCV, rawText: string) => {
    setParsedCV(parsed);

    // Auto-fill fields only if they are currently empty
    if (!name && parsed.fullName) setName(parsed.fullName);
    if (!email && parsed.email) setEmail(parsed.email);
    if (!phone && parsed.phone) setPhone(parsed.phone);
    if (!linkedinUrl && parsed.linkedinUrl) setLinkedinUrl(parsed.linkedinUrl);
    if (!portfolioUrl && parsed.portfolioUrl) setPortfolioUrl(parsed.portfolioUrl);

    // Build skills tags (merge with existing)
    if (parsed.skills.length > 0) {
      const existingTags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);
      const newTags = parsed.skills.slice(0, 15); // Cap at 15 tags
      const merged = Array.from(new Set([...existingTags, ...newTags]));
      setTagsInput(merged.join(', '));
    }

    // Build a rich resume text summary and store raw text
    const structuredSummary = parsedCVToResumeText(parsed);
    const fullText = [structuredSummary, '\n\n--- Raw CV Text ---\n', rawText]
      .filter(Boolean)
      .join('\n')
      .trim();
    setResumeText(fullText);
  }, [name, email, phone, linkedinUrl, portfolioUrl, tagsInput]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !jobId) return;

    setIsSubmitting(true);
    try {
      const selectedJob = availableJobs.find((j) => j.id === jobId);
      const tags = tagsInput
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      const candidateBase: Candidate = {
        id: candidateToEdit?.id || 'cand-' + Date.now(),
        customerId: candidateToEdit?.customerId || selectedJob?.customerId || currentCustomerId,
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

      await onCandidateSaved(candidateBase);
      onClose();
    } catch (err) {
      alert(`Could not save candidate: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-gradient-to-br from-indigo-600 to-purple-600 text-white rounded-lg shadow-sm">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {candidateToEdit ? 'Edit Candidate Profile' : 'Add Candidate'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Upload a CV to auto-fill · or fill manually below
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

        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          {/* ── CV Upload Zone ── */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Brain className="w-3.5 h-3.5 text-indigo-500" />
                AI CV Parser
              </label>
              <button
                type="button"
                onClick={() => setShowUploadZone((v) => !v)}
                className="text-[11px] text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                {showUploadZone ? 'Hide upload zone' : 'Show upload zone'}
              </button>
            </div>

            {showUploadZone && (
              <CVUploadZone onParsed={handleCVParsed} />
            )}

            {/* Parsed CV Preview */}
            {parsedCV && <div className="mt-2"><ParsedCVPreview parsed={parsedCV} /></div>}
          </div>

          {/* Divider */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            <span>Candidate Details</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
          </div>

          {/* ── Target Job & Initial Stage ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Choose Job Opening *
              </label>
              <select
                required
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              >
                {availableJobs.length === 0 && <option value="">No job openings available</option>}
                {availableJobs.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.title} — {profiles.find((profile) => profile.id === j.customerId)?.companyName || profiles.find((profile) => profile.id === j.customerId)?.fullName || 'Customer'} — {j.department}
                  </option>
                ))}
              </select>
              {selectedJob && (
                <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                  {selectedCustomer?.companyName || selectedCustomer?.fullName || 'Customer'} · {selectedJob.location}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pipeline Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value as CandidateStage)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
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

          {/* ── Name & Email ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Henderson"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
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
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* ── Phone & LinkedIn ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <LinkedinIcon className="w-3.5 h-3.5 text-blue-600 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* ── Portfolio & Tags ── */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Portfolio / GitHub
              </label>
              <div className="relative">
                <Link className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="url"
                  placeholder="https://github.com/username"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Skills / Tags
                <span className="ml-1 text-slate-400 font-normal">(comma separated)</span>
              </label>
              <input
                type="text"
                placeholder="React, TypeScript, AWS"
                value={tagsInput}
                onChange={(e) => setTagsInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>

          {/* ── Resume Text ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                Resume / CV Text
              </label>
              <div className="flex gap-1.5">
                <span className="text-[11px] text-slate-400">Quick Fill:</span>
                {SAMPLE_RESUMES.map((sample, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setResumeText(sample.text)}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 px-1.5 py-0.5 rounded transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>
            <textarea
              rows={4}
              placeholder="CV text appears here after upload, or paste/type the candidate's resume…"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-mono bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* ── Recruiter Notes ── */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Internal Recruiter Notes
            </label>
            <input
              type="text"
              placeholder="e.g. Referred by CTO; available immediately"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100"
            />
          </div>

          {/* ── Auto AI Assessment ── */}
          <div className="bg-gradient-to-r from-indigo-50/70 to-purple-50/50 dark:from-indigo-950/30 dark:to-purple-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/40 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <label htmlFor="autoRunAi" className="text-xs font-medium text-indigo-950 dark:text-indigo-200 cursor-pointer">
                Run AI CV Screening automatically on save
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

          {/* ── Actions ── */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 px-4 py-2 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="text-xs font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 hover:opacity-95 disabled:opacity-60 text-white px-6 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving…
                </>
              ) : (
                candidateToEdit ? 'Update Candidate' : 'Add Candidate'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

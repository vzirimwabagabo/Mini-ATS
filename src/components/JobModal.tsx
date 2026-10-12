import React, { useState } from 'react';
import { Job, UserProfile } from '../types';
import { X, Briefcase, Plus, Sparkles, Save } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: (job: Job) => Promise<void> | void;
  currentCustomerId: string;
  isAdmin: boolean;
  allProfiles: UserProfile[];
  jobToEdit?: Job | null;
}

const SAMPLE_JOB_TEMPLATES = [
  {
    title: 'Senior Frontend Engineer',
    department: 'Engineering',
    location: 'Remote (Global)',
    type: 'Full-time' as const,
    salaryRange: '$130k - $160k',
    requirements: 'React 19, TypeScript, Next.js, Tailwind CSS, Web Vitals, Jest',
    description: 'Lead modern interface engineering for our mission-critical SaaS dashboard. Focus on speed, intuitive UX, responsive design, and smooth animations.'
  },
  {
    title: 'Senior Backend Engineer',
    department: 'Infrastructure',
    location: 'San Francisco, CA / Remote',
    type: 'Full-time' as const,
    salaryRange: '$145k - $180k',
    requirements: 'Node.js, PostgreSQL, Supabase, Redis, Docker, System Design',
    description: 'Build robust real-time data sync, high-throughput APIs, and database migrations. Optimize Postgres queries and ensure high availability.'
  },
  {
    title: 'Growth Marketing Lead',
    department: 'Marketing',
    location: 'New York, NY',
    type: 'Full-time' as const,
    salaryRange: '$110k - $140k',
    requirements: 'B2B SaaS Marketing, Funnel Optimization, SEO, Paid Ads, Analytics',
    description: 'Scale our customer acquisition engine from 0 to 100k accounts through organic content, paid campaigns, and product-led growth experiments.'
  }
];

export const JobModal: React.FC<JobModalProps> = ({
  isOpen,
  onClose,
  onJobSaved,
  currentCustomerId,
  isAdmin,
  allProfiles,
  jobToEdit
}) => {
  const customerProfiles = allProfiles.filter((p) => p.role === 'customer' && p.isActive !== false);

  const [targetCustomerId, setTargetCustomerId] = useState(
    jobToEdit?.customerId || (isAdmin ? customerProfiles[0]?.id : undefined) || currentCustomerId
  );
  const [title, setTitle] = useState(jobToEdit?.title || '');
  const [department, setDepartment] = useState(jobToEdit?.department || 'Engineering');
  const [location, setLocation] = useState(jobToEdit?.location || 'Remote');
  const [type, setType] = useState<Job['type']>(jobToEdit?.type || 'Full-time');
  const [salaryRange, setSalaryRange] = useState(jobToEdit?.salaryRange || '');
  const [description, setDescription] = useState(jobToEdit?.description || '');
  const [requirementsInput, setRequirementsInput] = useState(jobToEdit?.requirements.join(', ') || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (tmpl: typeof SAMPLE_JOB_TEMPLATES[0]) => {
    setTitle(tmpl.title);
    setDepartment(tmpl.department);
    setLocation(tmpl.location);
    setType(tmpl.type);
    setSalaryRange(tmpl.salaryRange);
    setRequirementsInput(tmpl.requirements);
    setDescription(tmpl.description);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const requirements = requirementsInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const newJob: Job = {
        id: jobToEdit?.id || 'job-' + Date.now(),
        customerId: jobToEdit?.customerId || targetCustomerId || currentCustomerId,
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        type,
        salaryRange: salaryRange.trim() || undefined,
        description: description.trim(),
        requirements,
        status: jobToEdit?.status || 'active',
        createdAt: jobToEdit?.createdAt || new Date().toISOString()
      };

      await onJobSaved(newJob);
      onClose();
    } catch (err) {
      alert(`Could not save job: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">{jobToEdit ? 'Edit Job Opening' : 'Post a New Job Opening'}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define title, requirements, and job description
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
          {/* Quick template loader */}
          {!jobToEdit && <div className="bg-indigo-50/60 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/60 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900 dark:text-indigo-300">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Quick Templates:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_JOB_TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="text-[11px] font-medium bg-white dark:bg-slate-800 hover:bg-indigo-100/60 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 px-2.5 py-1 rounded-md transition-colors shadow-2xs"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>}

          {/* Admin Assign Customer */}
          {isAdmin && !jobToEdit && customerProfiles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Posting on Behalf of Customer:
              </label>
              <select
                value={targetCustomerId}
                onChange={(e) => setTargetCustomerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-amber-300 dark:border-amber-700/60 bg-amber-50/70 dark:bg-amber-950/40 font-medium text-amber-950 dark:text-amber-200 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {customerProfiles.map((c) => (
                  <option key={c.id} value={c.id} className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">
                    {c.companyName || c.fullName} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="Engineering, Product, Sales..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Location & Type & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Remote, NYC, SF..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Job['type'])}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              >
                <option value="Full-time" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Full-time</option>
                <option value="Part-time" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Part-time</option>
                <option value="Contract" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Contract</option>
                <option value="Remote" className="bg-white dark:bg-slate-900 text-slate-900 dark:text-white">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                placeholder="$120k - $150k"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
              />
            </div>
          </div>

          {/* Requirements (comma separated) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Required Skills / Keywords (comma separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Supabase, System Design, GraphQL"
              value={requirementsInput}
              onChange={(e) => setRequirementsInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              These keywords will be automatically evaluated during candidate CV screening!
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Job Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Outline role responsibilities, team structure, and qualifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
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
              className="text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-lg shadow-sm transition-colors flex items-center gap-1.5"
            >
              {jobToEdit ? <Save className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              {isSubmitting ? 'Saving...' : jobToEdit ? 'Save Changes' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { Job, UserProfile } from '../types';
import { X, Briefcase, Plus, Sparkles } from 'lucide-react';

interface JobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onJobSaved: (job: Job) => void;
  currentCustomerId: string;
  isAdmin: boolean;
  allProfiles: UserProfile[];
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
  allProfiles
}) => {
  if (!isOpen) return null;

  const customerProfiles = allProfiles.filter((p) => p.role === 'customer');

  const [targetCustomerId, setTargetCustomerId] = useState(currentCustomerId);
  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [location, setLocation] = useState('Remote');
  const [type, setType] = useState<Job['type']>('Full-time');
  const [salaryRange, setSalaryRange] = useState('');
  const [description, setDescription] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) return;

    setIsSubmitting(true);
    try {
      const requirements = requirementsInput
        .split(',')
        .map((r) => r.trim())
        .filter(Boolean);

      const newJob: Job = {
        id: 'job-' + Date.now(),
        customerId: targetCustomerId || currentCustomerId,
        title: title.trim(),
        department: department.trim(),
        location: location.trim(),
        type,
        salaryRange: salaryRange.trim() || undefined,
        description: description.trim(),
        requirements,
        status: 'active',
        createdAt: new Date().toISOString()
      };

      onJobSaved(newJob);
      onClose();
    } catch (err) {
      console.error('Error saving job', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Post a New Job Opening</h2>
              <p className="text-xs text-slate-500">
                Define title, requirements, and job description
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Quick template loader */}
          <div className="bg-indigo-50/60 p-3 rounded-xl border border-indigo-100 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-900">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Quick Templates:</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SAMPLE_JOB_TEMPLATES.map((tmpl, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => applyTemplate(tmpl)}
                  className="text-[11px] font-medium bg-white hover:bg-indigo-100/60 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md transition-colors"
                >
                  {tmpl.title}
                </button>
              ))}
            </div>
          </div>

          {/* Admin Assign Customer */}
          {isAdmin && customerProfiles.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Posting on Behalf of Customer:
              </label>
              <select
                value={targetCustomerId}
                onChange={(e) => setTargetCustomerId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-amber-300 bg-amber-50/50 font-medium text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              >
                {customerProfiles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.companyName || c.fullName} ({c.email})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Title & Department */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Frontend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="Engineering, Product, Sales..."
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Location & Type & Salary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location
              </label>
              <input
                type="text"
                placeholder="Remote, NYC, SF..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Employment Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as Job['type'])}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
              >
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Remote">Remote</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Salary Range
              </label>
              <input
                type="text"
                placeholder="$120k - $150k"
                value={salaryRange}
                onChange={(e) => setSalaryRange(e.target.value)}
                className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Requirements (comma separated) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Required Skills / Keywords (comma separated)
            </label>
            <input
              type="text"
              placeholder="React, TypeScript, Supabase, System Design, GraphQL"
              value={requirementsInput}
              onChange={(e) => setRequirementsInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              These keywords will be automatically matched during AI CV Screening!
            </p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Job Description *
            </label>
            <textarea
              required
              rows={4}
              placeholder="Outline role responsibilities, team structure, and qualifications..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
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
              <Plus className="w-3.5 h-3.5" />
              {isSubmitting ? 'Posting...' : 'Publish Job'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

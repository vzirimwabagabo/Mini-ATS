import React from 'react';
import { Candidate, Job } from '../types';
import { X, Briefcase, Plus, Trash2, MapPin, DollarSign, Users, Pencil } from 'lucide-react';

interface JobListModalProps {
  isOpen: boolean;
  onClose: () => void;
  jobs: Job[];
  candidates: Candidate[];
  onOpenNewJob: () => void;
  onEditJob: (job: Job) => void;
  onDeleteJob: (jobId: string) => void;
}

export const JobListModal: React.FC<JobListModalProps> = ({
  isOpen,
  onClose,
  jobs,
  candidates,
  onOpenNewJob,
  onEditJob,
  onDeleteJob,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div 
        className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-900/60">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 text-white rounded-lg shadow-xs">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">Manage Job Openings</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View posted jobs and active candidate pipelines
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

        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              Active Positions ({jobs.length})
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenNewJob();
              }}
              className="inline-flex items-center gap-1.5 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg transition-colors shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              Post New Job
            </button>
          </div>

          {jobs.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-500 dark:text-slate-400 text-xs">
              <Briefcase className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
              No jobs posted yet. Click "Post New Job" to begin hiring!
            </div>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => {
                const jobCandidates = candidates.filter((c) => c.jobId === job.id);
                return (
                  <div
                    key={job.id}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-600 bg-white dark:bg-slate-800/80 hover:bg-indigo-50/20 dark:hover:bg-slate-800 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-slate-900 dark:text-white">{job.title}</h3>
                        <span className="text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 px-2 py-0.5 rounded-full capitalize">
                          {job.status}
                        </span>
                        <span className="text-[10px] font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-2 py-0.5 rounded">
                          {job.department}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-slate-400" />
                          {job.location} ({job.type})
                        </span>
                        {job.salaryRange && (
                          <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                            {job.salaryRange}
                          </span>
                        )}
                        <span className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          {jobCandidates.length} Candidates
                        </span>
                      </div>

                      {job.requirements && job.requirements.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {job.requirements.map((req, i) => (
                            <span
                              key={i}
                              className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded"
                            >
                              {req}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => onEditJob(job)}
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 rounded-lg transition-colors"
                        title={`Edit ${job.title}`}
                        aria-label={`Edit ${job.title}`}
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (
                            confirm(
                              `Delete "${job.title}" and its ${jobCandidates.length} attached candidates?`
                            )
                          ) {
                            onDeleteJob(job.id);
                          }
                        }}
                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                        title="Delete Job"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

import { Candidate, CandidateStage, Job, UserProfile, UserRole } from '../types';
import { getSupabaseClient } from './supabase';
import { getFunctionErrorMessage } from './functionError';

const STORAGE_KEY_PROFILES = 'mini_ats_profiles_v1';
const STORAGE_KEY_JOBS = 'mini_ats_jobs_v1';
const STORAGE_KEY_CANDIDATES = 'mini_ats_candidates_v1';

// Seed Initial Mock Data
const INITIAL_PROFILES: UserProfile[] = [
  {
    id: 'user-admin-1',
    email: 'admin@miniats.com',
    role: 'admin',
    fullName: 'Alex Morgan (Admin)',
    companyName: 'Mini ATS Platform',
    createdAt: '2026-10-01T10:00:00Z'
  },
  {
    id: 'user-customer-1',
    email: 'sarah@techwave.io',
    role: 'customer',
    fullName: 'Sarah Connor',
    companyName: 'TechWave AI',
    createdAt: '2026-10-02T11:30:00Z'
  },
  {
    id: 'user-customer-2',
    email: 'david@acmecorp.com',
    role: 'customer',
    fullName: 'David Brent',
    companyName: 'Acme Enterprise',
    createdAt: '2026-10-03T09:15:00Z'
  }
];

const INITIAL_JOBS: Job[] = [
  {
    id: 'job-1',
    customerId: 'user-customer-1',
    title: 'Senior Full Stack Engineer',
    department: 'Engineering',
    location: 'Remote (US/EU)',
    type: 'Full-time',
    description: 'We are seeking an experienced Full Stack Engineer to lead architecture across our React, TypeScript, and Supabase backend systems. You will work on real-time data pipelines and high-performance web applications.',
    requirements: ['React', 'TypeScript', 'Node.js', 'PostgreSQL / Supabase', 'Tailwind CSS', 'REST / GraphQL'],
    salaryRange: '$140k - $175k',
    status: 'active',
    createdAt: '2026-10-02T12:00:00Z'
  },
  {
    id: 'job-2',
    customerId: 'user-customer-1',
    title: 'AI Product Manager',
    department: 'Product',
    location: 'San Francisco, CA (Hybrid)',
    type: 'Full-time',
    description: 'Lead discovery and execution for our generative AI product workflows. Translate user feedback into intuitive UI patterns and partner closely with machine learning engineers.',
    requirements: ['3+ years in B2B SaaS Product Management', 'Experience with Generative AI / LLMs', 'User research & Wireframing', 'Agile delivery'],
    salaryRange: '$150k - $185k',
    status: 'active',
    createdAt: '2026-10-03T14:20:00Z'
  },
  {
    id: 'job-3',
    customerId: 'user-customer-2',
    title: 'Enterprise Account Executive',
    department: 'Sales',
    location: 'New York, NY',
    type: 'Full-time',
    description: 'Drive high-velocity enterprise deals for our cloud observability suite. Target Fortune 500 tech leaders and manage end-to-end sales pipeline.',
    requirements: ['5+ years B2B enterprise software sales', 'Track record of exceeding quota', 'Strong contract negotiation skills'],
    salaryRange: '$120k base + uncapped commission',
    status: 'active',
    createdAt: '2026-10-04T08:00:00Z'
  }
];

const INITIAL_CANDIDATES: Candidate[] = [
  {
    id: 'cand-1',
    customerId: 'user-customer-1',
    jobId: 'job-1',
    name: 'Maya Lin',
    email: 'maya.lin@example.com',
    phone: '+1 (555) 234-5678',
    linkedinUrl: 'https://linkedin.com/in/maya-lin-dev',
    portfolioUrl: 'https://github.com/mayalin',
    resumeText: 'Senior Full Stack Developer with 6 years building modern React & TypeScript web apps. Extensive experience with Supabase, PostgreSQL, Tailwind, and Node.js microservices. Led migration to cloud serverless backend.',
    stage: 'interview',
    notes: 'Impressed in technical screening! Deep understanding of Supabase RLS and React concurrency.',
    tags: ['React', 'TypeScript', 'Supabase', 'Senior'],
    aiEvaluation: {
      score: 94,
      summary: 'Outstanding match for Senior Full Stack Engineer. Excellent alignment on React, TypeScript, and Supabase database architecture.',
      strengths: ['Direct hands-on expertise with Supabase & Postgres', 'Strong TypeScript full stack background', 'Proven technical leadership'],
      gaps: ['Confirm cloud architecture preference during final round'],
      recommendedStage: 'offer',
      evaluatedAt: '2026-10-04T10:00:00Z'
    },
    createdAt: '2026-10-03T09:00:00Z',
    updatedAt: '2026-10-04T10:00:00Z'
  },
  {
    id: 'cand-2',
    customerId: 'user-customer-1',
    jobId: 'job-1',
    name: 'Leo Vance',
    email: 'leo.vance@example.com',
    phone: '+1 (555) 345-6789',
    linkedinUrl: 'https://linkedin.com/in/leovance-tech',
    resumeText: 'Software Engineer with 4 years experience in Vue and Node.js. Transitioning to React and TypeScript recently. Built several REST APIs and Dockerized services.',
    stage: 'screening',
    notes: 'Good problem solver, checking depth on React hooks & state machines.',
    tags: ['Node.js', 'PostgreSQL', 'Docker'],
    aiEvaluation: {
      score: 76,
      summary: 'Solid foundational software engineer. Strong backend skills with Node.js, but primarily Vue background rather than deep React specialization.',
      strengths: ['Strong backend database & API fundamentals', 'Verified professional presence via LinkedIn profile'],
      gaps: ['Check hands-on depth with: React, Supabase'],
      recommendedStage: 'screening',
      evaluatedAt: '2026-10-04T11:15:00Z'
    },
    createdAt: '2026-10-03T11:00:00Z',
    updatedAt: '2026-10-04T11:15:00Z'
  },
  {
    id: 'cand-3',
    customerId: 'user-customer-1',
    jobId: 'job-1',
    name: 'Marcus Sterling',
    email: 'marcus.s@example.com',
    phone: '+1 (555) 890-1234',
    linkedinUrl: 'https://linkedin.com/in/marcus-sterling-engineer',
    resumeText: 'Staff Software Architect with 8+ years in React, Next.js, TypeScript, PostgreSQL, and AWS. Previously tech lead at Fintech startup.',
    stage: 'offer',
    notes: 'Candidate of the quarter. Offer letter sent at $165k base + equity package.',
    tags: ['Staff', 'Architect', 'TypeScript'],
    aiEvaluation: {
      score: 97,
      summary: 'Exceptional profile with complete coverage of all tech requirements and proven architectural leadership in high-scale systems.',
      strengths: ['8+ years production React & TypeScript', 'System design expertise', 'Fintech security & scale experience'],
      gaps: ['Competitive offer scenario - fast follow-up required'],
      recommendedStage: 'offer',
      evaluatedAt: '2026-10-05T09:00:00Z'
    },
    createdAt: '2026-10-02T15:00:00Z',
    updatedAt: '2026-10-05T09:00:00Z'
  },
  {
    id: 'cand-4',
    customerId: 'user-customer-1',
    jobId: 'job-2',
    name: 'Chloe Dupont',
    email: 'chloe.dupont@example.com',
    linkedinUrl: 'https://linkedin.com/in/chloedupont-pm',
    resumeText: 'Product Manager with 5 years leading AI-assisted software tools. Led prompt engineering workflows, UI/UX interaction design, and user interviews for enterprise SaaS.',
    stage: 'interview',
    notes: 'Completed case study presentation. Very structured thinking and user-centric approach.',
    tags: ['AI Product', 'B2B SaaS', 'Wireframing'],
    aiEvaluation: {
      score: 91,
      summary: 'High suitability candidate for AI Product Manager. Direct expertise in AI workflows, prompt design, and B2B SaaS product lifecycles.',
      strengths: ['Direct experience in generative AI tooling', 'Strong wireframing and user interview process'],
      gaps: ['Verify technical depth with API integrations'],
      recommendedStage: 'interview',
      evaluatedAt: '2026-10-05T14:00:00Z'
    },
    createdAt: '2026-10-04T09:30:00Z',
    updatedAt: '2026-10-05T14:00:00Z'
  },
  {
    id: 'cand-5',
    customerId: 'user-customer-1',
    jobId: 'job-2',
    name: 'Rachel Green',
    email: 'rachel.green@example.com',
    linkedinUrl: 'https://linkedin.com/in/rachelgreen-ai',
    resumeText: 'Senior Product Manager with 4 years in LLM developer platforms. Successfully launched two AI features driving 40% user engagement increase.',
    stage: 'hired',
    notes: 'Accepted offer! Start date set for Nov 1st.',
    tags: ['Hired', 'AI Specialist'],
    aiEvaluation: {
      score: 95,
      summary: 'Ideal match for AI Product Manager position with proven product growth metrics.',
      strengths: ['Launched 2 high-impact LLM products', 'Excellent cross-functional alignment'],
      gaps: ['None identified'],
      recommendedStage: 'offer',
      evaluatedAt: '2026-10-01T12:00:00Z'
    },
    createdAt: '2026-10-01T10:00:00Z',
    updatedAt: '2026-10-06T10:00:00Z'
  },
  {
    id: 'cand-6',
    customerId: 'user-customer-1',
    jobId: 'job-1',
    name: 'Devon Smith',
    email: 'devon.smith@example.com',
    linkedinUrl: 'https://linkedin.com/in/devonsmith-dev',
    resumeText: 'Junior Front-End Developer with 1 year experience in HTML, CSS, JavaScript, and some React.',
    stage: 'sourced',
    notes: 'Sourced from local meetup, may be better suited for Junior opening.',
    tags: ['Junior', 'Frontend'],
    aiEvaluation: {
      score: 52,
      summary: 'Candidate shows good foundational interest but lacks senior experience and Supabase/backend architectural depth required for this role.',
      strengths: ['Front-end foundations in HTML/CSS/JS'],
      gaps: ['Check hands-on depth with: TypeScript, Node.js, Supabase, System Design'],
      recommendedStage: 'sourced',
      evaluatedAt: '2026-10-05T16:00:00Z'
    },
    createdAt: '2026-10-05T15:00:00Z',
    updatedAt: '2026-10-05T16:00:00Z'
  },
  {
    id: 'cand-7',
    customerId: 'user-customer-2',
    jobId: 'job-3',
    name: 'Samuel Kim',
    email: 'samuel.kim@example.com',
    linkedinUrl: 'https://linkedin.com/in/samuelkim-sales',
    resumeText: 'Senior Account Executive with 6 years enterprise software sales at Salesforce ecosystem partner. Closed $1.4M ARR last fiscal year.',
    stage: 'screening',
    notes: 'Initial call scheduled for tomorrow.',
    tags: ['Enterprise Sales', 'Quota Crusher'],
    createdAt: '2026-10-05T17:00:00Z',
    updatedAt: '2026-10-05T17:00:00Z'
  }
];

// Helper to initialize local storage if empty
export const initLocalStorageIfEmpty = () => {
  if (!localStorage.getItem(STORAGE_KEY_PROFILES)) {
    localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
  }
  if (!localStorage.getItem(STORAGE_KEY_JOBS)) {
    localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOBS));
  }
  if (!localStorage.getItem(STORAGE_KEY_CANDIDATES)) {
    localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
  }
};

// Reset to fresh demo data
export const resetDemoData = () => {
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(INITIAL_PROFILES));
  localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(INITIAL_JOBS));
  localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(INITIAL_CANDIDATES));
  window.location.reload();
};

export const getStoredProfiles = (): UserProfile[] => {
  initLocalStorageIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILES) || '[]');
  } catch {
    return INITIAL_PROFILES;
  }
};

export const getStoredJobs = (): Job[] => {
  initLocalStorageIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_JOBS) || '[]');
  } catch {
    return INITIAL_JOBS;
  }
};

export const getStoredCandidates = (): Candidate[] => {
  initLocalStorageIfEmpty();
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_CANDIDATES) || '[]');
  } catch {
    return INITIAL_CANDIDATES;
  }
};

// -------------------------------------------------------------
// Unified Data API (Supabase or Local Persistence)
// -------------------------------------------------------------

let tablesMissingInSupabase = false;

export const areTablesMissingInSupabase = () => tablesMissingInSupabase;

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    if (tablesMissingInSupabase) throw new Error('Supabase tables are unavailable; local demo data is disabled in cloud mode.');
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          tablesMissingInSupabase = true;
        }
        throw new Error('Could not load profiles from Supabase.');
      } else if (data) {
        return data.map((d: any) => ({
          id: d.id,
          email: d.email,
          role: d.role,
          isActive: d.is_active ?? true,
          fullName: d.full_name,
          companyName: d.company_name,
          createdAt: d.created_at
        }));
      }
    } catch {
      throw new Error('Could not load profiles from Supabase.');
    }
  }
  return getStoredProfiles();
}

export async function fetchJobs(customerId?: string): Promise<Job[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    if (tablesMissingInSupabase) throw new Error('Supabase tables are unavailable; local demo data is disabled in cloud mode.');
    try {
      let query = supabase.from('jobs').select('*').order('created_at', { ascending: false });
      if (customerId && customerId !== 'all') {
        query = query.eq('customer_id', customerId);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          tablesMissingInSupabase = true;
        }
        throw new Error('Could not load jobs from Supabase.');
      } else if (data) {
        return data.map((d: any) => ({
          id: d.id,
          customerId: d.customer_id,
          title: d.title,
          department: d.department,
          location: d.location,
          type: d.type,
          description: d.description,
          requirements: d.requirements || [],
          salaryRange: d.salary_range,
          status: d.status,
          createdAt: d.created_at
        }));
      }
    } catch {
      throw new Error('Could not load jobs from Supabase.');
    }
  }

  const jobs = getStoredJobs();
  if (customerId && customerId !== 'all') {
    return jobs.filter(j => j.customerId === customerId);
  }
  return jobs;
}

export async function fetchCandidates(customerId?: string, jobId?: string): Promise<Candidate[]> {
  const supabase = getSupabaseClient();
  if (supabase) {
    if (tablesMissingInSupabase) throw new Error('Supabase tables are unavailable; local demo data is disabled in cloud mode.');
    try {
      let query = supabase.from('candidates').select('*').order('created_at', { ascending: false });
      if (customerId && customerId !== 'all') {
        query = query.eq('customer_id', customerId);
      }
      if (jobId && jobId !== 'all') {
        query = query.eq('job_id', jobId);
      }
      const { data, error } = await query;
      if (error) {
        if (error.code === 'PGRST205' || error.message?.includes('Could not find the table')) {
          tablesMissingInSupabase = true;
        }
        throw new Error('Could not load candidates from Supabase.');
      } else if (data) {
        return data.map((d: any) => ({
          id: d.id,
          customerId: d.customer_id,
          jobId: d.job_id,
          name: d.name,
          email: d.email,
          phone: d.phone,
          linkedinUrl: d.linkedin_url,
          portfolioUrl: d.portfolio_url,
          resumeText: d.resume_text,
          stage: d.stage,
          notes: d.notes,
          tags: d.tags || [],
          aiEvaluation: d.ai_evaluation,
          createdAt: d.created_at,
          updatedAt: d.updated_at
        }));
      }
    } catch {
      throw new Error('Could not load candidates from Supabase.');
    }
  }

  let candidates = getStoredCandidates();
  if (customerId && customerId !== 'all') {
    candidates = candidates.filter(c => c.customerId === customerId);
  }
  if (jobId && jobId !== 'all') {
    candidates = candidates.filter(c => c.jobId === jobId);
  }
  return candidates;
}

export async function saveJob(jobData: Partial<Job> & { customerId: string }): Promise<Job> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const payload: any = {
        customer_id: jobData.customerId,
        title: jobData.title,
        department: jobData.department || 'General',
        location: jobData.location || 'Remote',
        type: jobData.type || 'Full-time',
        description: jobData.description || '',
        requirements: jobData.requirements || [],
        salary_range: jobData.salaryRange,
        status: jobData.status || 'active'
      };

      const isExistingSupabaseId = Boolean(jobData.id && !jobData.id.startsWith('job-'));
      if (isExistingSupabaseId) {
        const { data, error } = await supabase
          .from('jobs')
          .update(payload)
          .eq('id', jobData.id)
          .select()
          .single();
        if (error || !data) throw new Error('Supabase did not save the job.');
        return {
            id: data.id,
            customerId: data.customer_id,
            title: data.title,
            department: data.department,
            location: data.location,
            type: data.type,
            description: data.description,
            requirements: data.requirements || [],
            salaryRange: data.salary_range,
            status: data.status,
            createdAt: data.created_at
          };
      } else {
        const { data, error } = await supabase
          .from('jobs')
          .insert(payload)
          .select()
          .single();
        if (error || !data) throw new Error('Supabase did not save the job.');
        return {
            id: data.id,
            customerId: data.customer_id,
            title: data.title,
            department: data.department,
            location: data.location,
            type: data.type,
            description: data.description,
            requirements: data.requirements || [],
            salaryRange: data.salary_range,
            status: data.status,
            createdAt: data.created_at
          };
      }
    } catch {
      throw new Error('Could not save the job to Supabase.');
    }
  }

  // Local Storage fallback
  const jobs = getStoredJobs();
  if (jobData.id) {
    const idx = jobs.findIndex(j => j.id === jobData.id);
    if (idx !== -1) {
      const updated = { ...jobs[idx], ...jobData } as Job;
      jobs[idx] = updated;
      localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
      return updated;
    }
  }

  const newJob: Job = {
    id: 'job-' + Date.now(),
    customerId: jobData.customerId,
    title: jobData.title || 'Untitled Job',
    department: jobData.department || 'General',
    location: jobData.location || 'Remote',
    type: jobData.type || 'Full-time',
    description: jobData.description || '',
    requirements: jobData.requirements || [],
    salaryRange: jobData.salaryRange || '',
    status: jobData.status || 'active',
    createdAt: now
  };
  jobs.unshift(newJob);
  localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));
  return newJob;
}

export async function saveCandidate(candidateData: Partial<Candidate> & { customerId: string; jobId: string }): Promise<Candidate> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase) {
    try {
      const payload: any = {
        customer_id: candidateData.customerId,
        job_id: candidateData.jobId,
        name: candidateData.name,
        email: candidateData.email,
        phone: candidateData.phone,
        linkedin_url: candidateData.linkedinUrl,
        portfolio_url: candidateData.portfolioUrl,
        resume_text: candidateData.resumeText,
        stage: candidateData.stage || 'sourced',
        notes: candidateData.notes,
        tags: candidateData.tags || [],
        ai_evaluation: candidateData.aiEvaluation,
        updated_at: now
      };

      const isExistingSupabaseId = Boolean(candidateData.id && !candidateData.id.startsWith('cand-'));
      if (isExistingSupabaseId) {
        const { data, error } = await supabase
          .from('candidates')
          .update(payload)
          .eq('id', candidateData.id)
          .select()
          .single();
        if (error || !data) throw new Error('Supabase did not save the candidate.');
        return {
            id: data.id,
            customerId: data.customer_id,
            jobId: data.job_id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            linkedinUrl: data.linkedin_url,
            portfolioUrl: data.portfolio_url,
            resumeText: data.resume_text,
            stage: data.stage,
            notes: data.notes,
            tags: data.tags || [],
            aiEvaluation: data.ai_evaluation,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
      } else {
        const { data, error } = await supabase
          .from('candidates')
          .insert(payload)
          .select()
          .single();
        if (error || !data) throw new Error('Supabase did not save the candidate.');
        return {
            id: data.id,
            customerId: data.customer_id,
            jobId: data.job_id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            linkedinUrl: data.linkedin_url,
            portfolioUrl: data.portfolio_url,
            resumeText: data.resume_text,
            stage: data.stage,
            notes: data.notes,
            tags: data.tags || [],
            aiEvaluation: data.ai_evaluation,
            createdAt: data.created_at,
            updatedAt: data.updated_at
          };
      }
    } catch {
      throw new Error('Could not save the candidate to Supabase.');
    }
  }

  // Local Storage fallback
  const candidates = getStoredCandidates();
  if (candidateData.id) {
    const idx = candidates.findIndex(c => c.id === candidateData.id);
    if (idx !== -1) {
      const updated = { ...candidates[idx], ...candidateData, updatedAt: now } as Candidate;
      candidates[idx] = updated;
      localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
      return updated;
    }
  }

  const newCand: Candidate = {
    id: 'cand-' + Date.now(),
    customerId: candidateData.customerId,
    jobId: candidateData.jobId,
    name: candidateData.name || 'Anonymous Candidate',
    email: candidateData.email || 'candidate@example.com',
    phone: candidateData.phone || '',
    linkedinUrl: candidateData.linkedinUrl || '',
    portfolioUrl: candidateData.portfolioUrl || '',
    resumeText: candidateData.resumeText || '',
    stage: candidateData.stage || 'sourced',
    notes: candidateData.notes || '',
    tags: candidateData.tags || [],
    aiEvaluation: candidateData.aiEvaluation,
    createdAt: now,
    updatedAt: now
  };
  candidates.unshift(newCand);
  localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
  return newCand;
}

export async function updateCandidateStage(candidateId: string, stage: CandidateStage): Promise<void> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase) {
    const { error } = await supabase
      .from('candidates')
      .update({ stage, updated_at: now })
      .eq('id', candidateId);
    if (error) throw new Error('Could not update the candidate stage in Supabase.');
    return;
  }

  const candidates = getStoredCandidates();
  const idx = candidates.findIndex(c => c.id === candidateId);
  if (idx !== -1) {
    candidates[idx].stage = stage;
    candidates[idx].updatedAt = now;
    localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
  }
}

export async function deleteCandidate(candidateId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('candidates').delete().eq('id', candidateId);
    if (error) throw new Error('Could not delete the candidate from Supabase.');
    return;
  }

  const candidates = getStoredCandidates().filter(c => c.id !== candidateId);
  localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
}

export async function deleteJob(jobId: string): Promise<void> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { error } = await supabase.from('jobs').delete().eq('id', jobId);
    if (error) throw new Error('Could not delete the job from Supabase.');
    return;
  }

  const jobs = getStoredJobs().filter(j => j.id !== jobId);
  localStorage.setItem(STORAGE_KEY_JOBS, JSON.stringify(jobs));

  // Also remove candidates attached to this job
  const candidates = getStoredCandidates().filter(c => c.jobId !== jobId);
  localStorage.setItem(STORAGE_KEY_CANDIDATES, JSON.stringify(candidates));
}

export async function createAccountAsAdmin(
  email: string,
  password: string,
  fullName: string,
  role: UserRole,
  companyName?: string
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  if (!supabase) throw new Error('Supabase is not configured.');

  const { data, error } = await supabase.functions.invoke('admin-create-account', {
    body: { email, password, fullName, role, companyName }
  });

  if (error) {
    throw new Error(await getFunctionErrorMessage(error));
  }
  if (!data?.profile) {
    throw new Error('The Edge Function returned no account profile. Check its logs for this request.');
  }

  return data.profile as UserProfile;
}

export async function updateAccountAsAdmin(
  userId: string,
  fullName: string,
  role: UserRole,
  companyName?: string
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.functions.invoke('admin-create-account', {
      body: { action: 'update', userId, fullName, role, companyName }
    });

    if (error) throw new Error(await getFunctionErrorMessage(error));
    if (!data?.profile) throw new Error('The Edge Function returned no updated profile.');
    return data.profile as UserProfile;
  }

  if (!import.meta.env.DEV) throw new Error('Configure Supabase before editing accounts.');

  const profiles = getStoredProfiles();
  const index = profiles.findIndex((profile) => profile.id === userId);
  if (index === -1) throw new Error('Account not found.');

  profiles[index] = {
    ...profiles[index],
    fullName: fullName.trim(),
    role,
    companyName: companyName?.trim() || undefined,
  };
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  return profiles[index];
}

export async function setAccountActiveAsAdmin(userId: string, isActive: boolean): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  if (supabase) {
    const { data, error } = await supabase.functions.invoke('admin-create-account', {
      body: { action: 'set-active', userId, isActive }
    });

    if (error) throw new Error(await getFunctionErrorMessage(error));
    if (!data?.profile) throw new Error('The Edge Function returned no updated account status.');
    return data.profile as UserProfile;
  }

  if (!import.meta.env.DEV) throw new Error('Configure Supabase before editing accounts.');

  const profiles = getStoredProfiles();
  const index = profiles.findIndex((profile) => profile.id === userId);
  if (index === -1) throw new Error('Account not found.');
  if (profiles[index].role !== 'customer') throw new Error('Only customer accounts can be deactivated.');

  profiles[index] = { ...profiles[index], isActive };
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  return profiles[index];
}

export async function createNewAccount(
  email: string,
  _password: string,
  fullName: string,
  role: UserRole,
  companyName?: string
): Promise<UserProfile> {
  const supabase = getSupabaseClient();
  const now = new Date().toISOString();

  if (supabase) {
    const { data: authData, error: authErr } = await supabase.auth.signUp({
      email,
      password: _password,
      options: {
        data: {
          full_name: fullName,
          company_name: companyName || ''
        }
      }
    });

    if (authErr) {
      if ((authErr as any).status === 429 || authErr.message?.toLowerCase().includes('rate limit') || authErr.message?.toLowerCase().includes('security purposes')) {
        throw new Error('Supabase email rate limit reached. On free tier Supabase accounts, auth emails and signups are rate-limited. Please wait a minute (or up to an hour if hourly SMTP quota was hit) before trying again.');
      }
      if ((authErr as any).status === 400 && authErr.message?.toLowerCase().includes('password')) {
        throw new Error('Password does not meet requirements. Please enter at least 6 characters.');
      }
      if (authErr.message?.toLowerCase().includes('database error saving new user')) {
        throw new Error('Database trigger error: Please verify the latest SQL migrations (profiles table and on_auth_user_created trigger) are applied in your Supabase project.');
      }
      throw new Error(authErr.message || 'Cloud account creation failed. Verify the email and password requirements, then try again.');
    }
    if (!authData?.user) {
      throw new Error('Cloud account creation failed. No user was returned by Supabase.');
    }
    if (authData.user.identities && authData.user.identities.length === 0) {
      throw new Error('An account with this email address already exists. Please sign in or use password reset.');
    }

    // Always clear session locally so unapproved customer accounts are not left active in browser
    await supabase.auth.signOut({ scope: 'local' });

    return {
      id: authData.user.id,
      email,
      fullName,
      role: 'customer',
      isActive: false, // Default to false until administrator approves
      companyName,
      createdAt: now
    };
  }

  if (!import.meta.env.DEV) {
    throw new Error('Configure Supabase before creating accounts in a production build.');
  }

  // Local storage creation
  const profiles = getStoredProfiles();
  const newProfile: UserProfile = {
    id: 'user-' + Date.now(),
    email: email.trim().toLowerCase(),
    role,
    fullName: fullName.trim(),
    companyName: companyName?.trim() || (role === 'admin' ? 'Mini ATS Admin' : 'Hiring Company'),
    createdAt: now
  };

  profiles.push(newProfile);
  localStorage.setItem(STORAGE_KEY_PROFILES, JSON.stringify(profiles));
  return newProfile;
}

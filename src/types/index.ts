export type UserRole = 'admin' | 'customer';

export type CandidateStage = 
  | 'sourced'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  fullName: string;
  companyName?: string;
  createdAt: string;
}

export interface Job {
  id: string;
  customerId: string; // The customer who owns this job
  title: string;
  department: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Remote';
  description: string;
  requirements: string[];
  salaryRange?: string;
  status: 'active' | 'paused' | 'closed';
  createdAt: string;
}

export interface AICVEvaluation {
  score: number; // 0 - 100
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendedStage: CandidateStage;
  evaluatedAt: string;
}

export interface Candidate {
  id: string;
  customerId: string; // The customer who owns this candidate
  jobId: string;
  name: string;
  email: string;
  phone?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  resumeText?: string;
  stage: CandidateStage;
  notes?: string;
  tags?: string[];
  aiEvaluation?: AICVEvaluation;
  createdAt: string;
  updatedAt: string;
}

export interface KanbanColumn {
  id: CandidateStage;
  title: string;
  color: string;
  badgeBg: string;
}

export interface FilterState {
  jobId: string; // 'all' or specific jobId
  searchQuery: string; // search candidate name or email
  stage: string; // 'all' or specific stage
  compactMode: boolean;
}

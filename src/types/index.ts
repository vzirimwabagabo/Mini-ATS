export type UserRole = 'admin' | 'customer';

export type CandidateStage = 
  | 'sourced'
  | 'screening'
  | 'interview'
  | 'offer'
  | 'hired'
  | 'rejected';

export type AppTheme = 'light' | 'dark' | 'midnight';

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
  score: number; // Calibrated 0-100: 85+ = exceptional, 65 = good, 50 = borderline, <40 = weak
  summary: string;
  strengths: string[];
  gaps: string[];
  recommendedStage: CandidateStage;
  evaluatedAt: string;
  // Verdict tier
  tier?: 'strong_yes' | 'yes' | 'maybe' | 'no' | 'strong_no';
  // Core dimensional scores (0-100)
  skillsMatch?: number;
  experienceMatch?: number;
  seniorityMatch?: number;
  cultureMatch?: number;
  // Extended dimensional scores
  technicalDepthScore?: number;
  experienceRelevanceScore?: number;
  seniorityAlignmentScore?: number;
  achievementQualityScore?: number;
  communicationClarityScore?: number;
  // Flags
  redFlags?: string[];
  greenFlags?: string[];
  criticalGaps?: string[];
  // Interview content
  probeQuestions?: string[];
  tailoredInterviewQuestions?: string[];
  draftOutreachEmail?: string;
  // Meta
  scoringRationale?: string;
  usedLLM?: boolean;
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
  /** Structured data extracted by the LLM CV parser (work history, education, skills etc.) */
  parsedCV?: import('../lib/cvStructure').ParsedCV;
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

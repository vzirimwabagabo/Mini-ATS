-- ==============================================================================
-- MINI ATS — PRODUCTION SUPABASE POSTGRES SCHEMA (IDEMPOTENT & READY TO RUN)
-- ==============================================================================
-- INSTRUCTIONS TO SETUP A REAL DATABASE IN 2 MINUTES:
-- 1. Create a free Supabase project at: https://supabase.com/dashboard/projects
-- 2. Click "SQL Editor" in the left sidebar
-- 3. Click "New Query", paste this entire file, and click "RUN" (green button)
-- 4. Go to Project Settings -> API, copy "Project URL" and "anon public key"
-- 5. Paste them into the Mini ATS "Connect Real Database" wizard modal!
-- ==============================================================================

-- 1. Create Enums Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('admin', 'customer');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'candidate_stage') THEN
        CREATE TYPE candidate_stage AS ENUM ('sourced', 'screening', 'interview', 'offer', 'hired', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_type') THEN
        CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Remote');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
        CREATE TYPE job_status AS ENUM ('active', 'paused', 'closed');
    END IF;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    location TEXT NOT NULL,
    type job_type NOT NULL DEFAULT 'Full-time',
    description TEXT NOT NULL,
    requirements TEXT[] DEFAULT '{}',
    salary_range TEXT,
    status job_status NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Candidates Table
CREATE TABLE IF NOT EXISTS public.candidates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID REFERENCES public.jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    linkedin_url TEXT,
    portfolio_url TEXT,
    resume_text TEXT,
    stage candidate_stage NOT NULL DEFAULT 'sourced',
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    ai_evaluation JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 6. Helper Function: Is User Admin?
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin'
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'New customer'),
    'customer',
    NULLIF(NEW.raw_user_meta_data ->> 'company_name', '')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS Policies: customers are tenant-scoped; admins retain delegation access.
DROP POLICY IF EXISTS "Profiles select all" ON public.profiles;
DROP POLICY IF EXISTS "Profiles insert/update" ON public.profiles;
DROP POLICY IF EXISTS "Profiles public policy" ON public.profiles;
DROP POLICY IF EXISTS "Jobs public policy" ON public.jobs;
DROP POLICY IF EXISTS "Candidates public policy" ON public.candidates;
DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;
CREATE POLICY "Profiles select own or admin" ON public.profiles
  FOR SELECT TO authenticated
  USING (id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Jobs tenant access" ON public.jobs;
CREATE POLICY "Jobs tenant access" ON public.jobs
  FOR ALL TO authenticated
  USING (customer_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (customer_id = (SELECT auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Candidates tenant access" ON public.candidates;
CREATE POLICY "Candidates tenant access" ON public.candidates
  FOR ALL TO authenticated
  USING (customer_id = (SELECT auth.uid()) OR public.is_admin())
  WITH CHECK (
    (customer_id = (SELECT auth.uid()) OR public.is_admin())
    AND EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = candidates.job_id
        AND jobs.customer_id = candidates.customer_id
    )
  );

REVOKE ALL ON public.profiles FROM PUBLIC, anon;
REVOKE INSERT, UPDATE, DELETE ON public.profiles FROM authenticated;
REVOKE ALL ON public.jobs, public.candidates FROM PUBLIC, anon;
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs, public.candidates TO authenticated;

-- 8. Helpful Performance Indexes
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_candidates_customer_id ON public.candidates(customer_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON public.candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);

-- 9. Initial Seed Profiles (if table is empty)
INSERT INTO public.profiles (id, email, full_name, role, company_name)
VALUES 
  ('a0000000-0000-0000-0000-000000000001', 'admin@miniats.com', 'Alex Morgan (Admin)', 'admin', 'Mini ATS Platform'),
  ('a0000000-0000-0000-0000-000000000002', 'sarah@techwave.io', 'Sarah Connor', 'customer', 'TechWave AI'),
  ('a0000000-0000-0000-0000-000000000003', 'david@acmecorp.com', 'David Brent', 'customer', 'Acme Enterprise')
ON CONFLICT (email) DO NOTHING;

-- 10. Initial Seed Jobs (if table is empty)
INSERT INTO public.jobs (id, customer_id, title, department, location, type, description, requirements, salary_range, status)
VALUES 
  ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Senior Full Stack Engineer', 'Engineering', 'Remote (Global)', 'Full-time', 'Build real-time React, TypeScript, and Supabase systems with high reliability.', ARRAY['React', 'TypeScript', 'Node.js', 'Supabase', 'PostgreSQL'], '$140k - $175k', 'active'),
  ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'AI Product Manager', 'Product', 'San Francisco / Remote', 'Full-time', 'Lead generative AI product experiments and user research workflows.', ARRAY['B2B SaaS', 'Generative AI / LLMs', 'Figma', 'Agile'], '$150k - $185k', 'active')
ON CONFLICT (id) DO NOTHING;

-- 11. Initial Seed Candidates
INSERT INTO public.candidates (id, customer_id, job_id, name, email, linkedin_url, stage, notes, tags, resume_text, ai_evaluation)
VALUES 
  ('c0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Maya Lin', 'maya.lin@example.com', 'https://linkedin.com/in/maya-lin-dev', 'interview', 'Top recommendation from initial phone screen!', ARRAY['React', 'TypeScript', 'Supabase', 'Senior'], 'Senior Full Stack Developer with 6 years experience in React, TypeScript, and Supabase database architecture.', '{"score": 94, "summary": "Outstanding match for Senior Full Stack Engineer.", "strengths": ["Direct Supabase expertise", "TypeScript full stack proficiency"], "gaps": ["Clarify target start date"], "recommendedStage": "offer"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Leo Vance', 'leo.vance@example.com', 'https://linkedin.com/in/leovance-tech', 'screening', 'Solid fundamentals, checking React depth.', ARRAY['Node.js', 'PostgreSQL', 'Docker'], 'Full stack software engineer with 4 years in Node.js and Postgres backend services.', '{"score": 78, "summary": "Solid foundational software engineer with strong backend skills.", "strengths": ["Strong backend fundamentals"], "gaps": ["Check hands-on depth with React"], "recommendedStage": "screening"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000001', 'Marcus Sterling', 'marcus.s@example.com', 'https://linkedin.com/in/marcus-sterling-engineer', 'offer', 'Offer extended at $165k base.', ARRAY['Staff', 'Architect', 'TypeScript'], 'Staff Software Engineer with 8+ years leading React and Postgres architecture.', '{"score": 97, "summary": "Exceptional profile with complete coverage of technical requirements.", "strengths": ["8+ years production experience", "System design mastery"], "gaps": ["Competitive offer situation"], "recommendedStage": "offer"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Chloe Dupont', 'chloe.dupont@example.com', 'https://linkedin.com/in/chloedupont-pm', 'interview', 'Completed case study. Strong product sense.', ARRAY['AI Product', 'B2B SaaS', 'Figma'], 'Product Manager with 5 years in AI-assisted developer tools and user research.', '{"score": 91, "summary": "High suitability candidate for AI Product Manager.", "strengths": ["Direct generative AI product experience", "Strong user research process"], "gaps": ["Verify technical API depth"], "recommendedStage": "interview"}'::jsonb),
  ('c0000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000002', 'Rachel Green', 'rachel.green@example.com', 'https://linkedin.com/in/rachelgreen-ai', 'hired', 'Accepted offer! Start date set for next month.', ARRAY['Hired', 'AI Specialist'], 'Senior Product Manager with 4 years leading LLM applications.', '{"score": 96, "summary": "Ideal match with proven metrics.", "strengths": ["Launched multiple LLM features"], "gaps": ["None"], "recommendedStage": "hired"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

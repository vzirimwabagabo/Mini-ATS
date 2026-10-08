-- ==============================================================================
-- MINI ATS SUPABASE DATABASE SCHEMA & RLS POLICIES
-- ==============================================================================

-- 1. Create Enums
CREATE TYPE user_role AS ENUM ('admin', 'customer');
CREATE TYPE candidate_stage AS ENUM ('sourced', 'screening', 'interview', 'offer', 'hired', 'rejected');
CREATE TYPE job_type AS ENUM ('Full-time', 'Part-time', 'Contract', 'Remote');
CREATE TYPE job_status AS ENUM ('active', 'paused', 'closed');

-- 2. Profiles Table (Extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    company_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Jobs Table
CREATE TABLE IF NOT EXISTS public.jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
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
    customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    job_id UUID NOT NULL REFERENCES public.jobs(id) ON DELETE CASCADE,
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

-- 5. Helper Function: Check if authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies: Profiles
-- Users can view their own profile, Admins can view all profiles
CREATE POLICY "Profiles view policy"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR public.is_admin());

-- Users can update their own profile, Admins can update all profiles
CREATE POLICY "Profiles update policy"
ON public.profiles FOR UPDATE
USING (auth.uid() = id OR public.is_admin());

-- 8. RLS Policies: Jobs
-- Customers see their own jobs; Admins see all jobs
CREATE POLICY "Jobs select policy"
ON public.jobs FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

-- Customers insert for themselves; Admins can insert on behalf of any customer
CREATE POLICY "Jobs insert policy"
ON public.jobs FOR INSERT
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

-- Customers update their jobs; Admins can update any job
CREATE POLICY "Jobs update policy"
ON public.jobs FOR UPDATE
USING (customer_id = auth.uid() OR public.is_admin());

-- Customers delete their jobs; Admins can delete any job
CREATE POLICY "Jobs delete policy"
ON public.jobs FOR DELETE
USING (customer_id = auth.uid() OR public.is_admin());

-- 9. RLS Policies: Candidates
-- Customers see their candidates; Admins see all candidates
CREATE POLICY "Candidates select policy"
ON public.candidates FOR SELECT
USING (customer_id = auth.uid() OR public.is_admin());

-- Customers insert for their jobs; Admins can insert for any customer
CREATE POLICY "Candidates insert policy"
ON public.candidates FOR INSERT
WITH CHECK (customer_id = auth.uid() OR public.is_admin());

-- Customers update their candidates; Admins can update any candidate
CREATE POLICY "Candidates update policy"
ON public.candidates FOR UPDATE
USING (customer_id = auth.uid() OR public.is_admin());

-- Customers delete their candidates; Admins can delete any candidate
CREATE POLICY "Candidates delete policy"
ON public.candidates FOR DELETE
USING (customer_id = auth.uid() OR public.is_admin());

-- 10. Auto-create Profile Trigger on auth.users Signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role, company_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer'),
    NEW.raw_user_meta_data->>'company_name'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 11. Initial Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON public.jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_candidates_customer_id ON public.candidates(customer_id);
CREATE INDEX IF NOT EXISTS idx_candidates_job_id ON public.candidates(job_id);
CREATE INDEX IF NOT EXISTS idx_candidates_stage ON public.candidates(stage);

-- ==============================================================================
-- LIVE PRODUCTION RLS ENFORCEMENT & ANON ACCESS HARDENING
-- ==============================================================================

-- 1. Explicitly enable and force Row Level Security on all core tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.candidates ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.profiles FORCE ROW LEVEL SECURITY;
ALTER TABLE public.jobs FORCE ROW LEVEL SECURITY;
ALTER TABLE public.candidates FORCE ROW LEVEL SECURITY;

-- 2. Revoke all access from unauthenticated users (anon role and public pseudorole)
REVOKE ALL ON public.profiles FROM PUBLIC, anon;
REVOKE ALL ON public.jobs FROM PUBLIC, anon;
REVOKE ALL ON public.candidates FROM PUBLIC, anon;

-- 3. Explicitly grant permissions only to authenticated users (governed by RLS policies)
GRANT SELECT ON public.profiles TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.jobs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.candidates TO authenticated;

-- 4. Clean up any lingering permissive policies
DROP POLICY IF EXISTS "Jobs public policy" ON public.jobs;
DROP POLICY IF EXISTS "Candidates public policy" ON public.candidates;
DROP POLICY IF EXISTS "Profiles public policy" ON public.profiles;
DROP POLICY IF EXISTS "Allow all for dev" ON public.jobs;
DROP POLICY IF EXISTS "Allow all for dev" ON public.candidates;

-- 5. Enforce strict customer tenant-isolation policies
DROP POLICY IF EXISTS "Profiles select own or admin" ON public.profiles;
CREATE POLICY "Profiles select own or admin" ON public.profiles
  FOR SELECT TO authenticated
  USING ((id = (SELECT auth.uid()) AND is_active) OR public.is_admin());

DROP POLICY IF EXISTS "Jobs tenant access" ON public.jobs;
CREATE POLICY "Jobs tenant access" ON public.jobs
  FOR ALL TO authenticated
  USING ((customer_id = (SELECT auth.uid()) AND public.is_active_user()) OR public.is_admin())
  WITH CHECK ((customer_id = (SELECT auth.uid()) AND public.is_active_user()) OR public.is_admin());

DROP POLICY IF EXISTS "Candidates tenant access" ON public.candidates;
CREATE POLICY "Candidates tenant access" ON public.candidates
  FOR ALL TO authenticated
  USING ((customer_id = (SELECT auth.uid()) AND public.is_active_user()) OR public.is_admin())
  WITH CHECK (
    ((customer_id = (SELECT auth.uid()) AND public.is_active_user()) OR public.is_admin())
    AND EXISTS (
      SELECT 1 FROM public.jobs
      WHERE jobs.id = candidates.job_id
        AND jobs.customer_id = candidates.customer_id
    )
  );

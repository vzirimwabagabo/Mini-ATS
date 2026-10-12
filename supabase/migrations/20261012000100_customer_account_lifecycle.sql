ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND role = 'admin' AND is_active
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

CREATE OR REPLACE FUNCTION public.is_active_user()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = (SELECT auth.uid()) AND is_active
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '';

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
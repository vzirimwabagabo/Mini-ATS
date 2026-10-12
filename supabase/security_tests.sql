-- Run against a non-production Supabase database after applying schema.sql.
-- All fixture inserts are rolled back at the end.
BEGIN;

INSERT INTO public.jobs (
  id, customer_id, title, department, location, type, description, requirements
)
VALUES (
  'e0000000-0000-0000-0000-000000000001',
  'a0000000-0000-0000-0000-000000000003',
  'RLS test job', 'Test', 'Remote', 'Full-time', 'Temporary isolation fixture', '{}'
);

INSERT INTO public.candidates (
  id, customer_id, job_id, name, email, resume_text
)
VALUES (
  'e0000000-0000-0000-0000-000000000002',
  'a0000000-0000-0000-0000-000000000003',
  'e0000000-0000-0000-0000-000000000001',
  'RLS test candidate', 'rls-test@example.invalid', 'Temporary isolation fixture'
);

UPDATE public.profiles
SET is_active = FALSE
WHERE id = 'a0000000-0000-0000-0000-000000000003';

SET LOCAL ROLE authenticated;
SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000002', true);

DO $$
DECLARE
  changed_rows INTEGER;
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id <> auth.uid()) THEN
    RAISE EXCEPTION 'Customer can read another profile';
  END IF;
  IF EXISTS (SELECT 1 FROM public.jobs WHERE customer_id <> auth.uid()) THEN
    RAISE EXCEPTION 'Customer can read another tenant job';
  END IF;
  IF EXISTS (SELECT 1 FROM public.candidates WHERE customer_id <> auth.uid()) THEN
    RAISE EXCEPTION 'Customer can read another tenant candidate';
  END IF;

  UPDATE public.jobs
  SET customer_id = 'a0000000-0000-0000-0000-000000000003'
  WHERE id = 'b0000000-0000-0000-0000-000000000001';
  GET DIAGNOSTICS changed_rows = ROW_COUNT;
  IF changed_rows <> 0 THEN
    RAISE EXCEPTION 'Customer changed another tenant job';
  END IF;

  BEGIN
    INSERT INTO public.candidates (
      customer_id, job_id, name, email
    ) VALUES (
      'a0000000-0000-0000-0000-000000000003',
      'e0000000-0000-0000-0000-000000000001',
      'Unauthorized fixture', 'unauthorized@example.invalid'
    );
    RAISE EXCEPTION 'Customer inserted a candidate into another tenant';
  EXCEPTION WHEN insufficient_privilege THEN
    NULL;
  END;
END;
$$;

SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000003', true);
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid()) THEN
    RAISE EXCEPTION 'Inactive customer can read their profile';
  END IF;
  IF EXISTS (SELECT 1 FROM public.jobs WHERE customer_id = auth.uid()) THEN
    RAISE EXCEPTION 'Inactive customer can read tenant jobs';
  END IF;
  IF EXISTS (SELECT 1 FROM public.candidates WHERE customer_id = auth.uid()) THEN
    RAISE EXCEPTION 'Inactive customer can read tenant candidates';
  END IF;
END;
$$;

SELECT set_config('request.jwt.claim.sub', 'a0000000-0000-0000-0000-000000000001', true);
DO $$
BEGIN
  IF (SELECT count(*) FROM public.jobs) < 2 THEN
    RAISE EXCEPTION 'Admin cannot read cross-tenant jobs';
  END IF;
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Admin role was not recognized';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = 'a0000000-0000-0000-0000-000000000003' AND NOT is_active) THEN
    RAISE EXCEPTION 'Admin cannot inspect inactive customer accounts';
  END IF;
END;
$$;

ROLLBACK;
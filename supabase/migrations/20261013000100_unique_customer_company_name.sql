-- Migration: Enforce unique customer company names (case-insensitive)
-- Ensures that no two customer accounts can register with the same company name.

-- 1. Create a unique index on lowercase trimmed company_name for customer accounts
CREATE UNIQUE INDEX IF NOT EXISTS idx_unique_customer_company_name
ON public.profiles (LOWER(TRIM(company_name)))
WHERE role = 'customer' AND company_name IS NOT NULL AND TRIM(company_name) <> '';

-- 2. Update public.handle_new_user() trigger function to validate unique company name on customer signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_company TEXT;
  v_clean_company TEXT;
BEGIN
  v_company := NULLIF(TRIM(NEW.raw_user_meta_data ->> 'company_name'), '');
  
  -- If customer provided a company name, verify it is not already taken by another customer
  IF v_company IS NOT NULL THEN
    v_clean_company := LOWER(v_company);
    IF EXISTS (
      SELECT 1 FROM public.profiles
      WHERE role = 'customer'
        AND LOWER(TRIM(company_name)) = v_clean_company
        AND id <> NEW.id
    ) THEN
      RAISE EXCEPTION 'A company with the name "%" is already registered. Please check spelling or contact support.', v_company
        USING ERRCODE = 'unique_violation';
    END IF;
  END IF;

  INSERT INTO public.profiles (id, email, full_name, role, company_name, is_active)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email, 'New customer'),
    'customer',
    v_company,
    FALSE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    company_name = EXCLUDED.company_name;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

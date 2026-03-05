-- ============================================================
-- Migration 001 — Extensions & Base Setup
-- ============================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp"      WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pg_trgm"        WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "btree_gin"      WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "unaccent"       WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS "pgcrypto"       WITH SCHEMA extensions;

-- Expose helpers to public search_path
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE p.proname = 'gen_random_uuid' AND n.nspname = 'public'
  ) THEN
    -- gen_random_uuid is available in pg 13+ via pgcrypto or built-in
    NULL;
  END IF;
END;
$$;

-- Shared updated_at trigger function (used by all tables)
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

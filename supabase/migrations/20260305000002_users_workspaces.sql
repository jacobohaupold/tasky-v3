-- ============================================================
-- Migration 002 — Users & Workspaces
-- ============================================================

-- ── profiles ──────────────────────────────────────────────
CREATE TABLE public.profiles (
  id              uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email           text        NOT NULL,
  display_name    text,
  avatar_url      text,
  bio             text,
  role            text        NOT NULL DEFAULT 'user'
                              CHECK (role IN ('user','staff','admin')),
  status          text        NOT NULL DEFAULT 'active'
                              CHECK (status IN ('active','suspended','pending')),
  timezone        text        NOT NULL DEFAULT 'Europe/Madrid',
  locale          text        NOT NULL DEFAULT 'es',
  date_format     text        NOT NULL DEFAULT 'DD/MM/YYYY',
  time_format     text        NOT NULL DEFAULT '24h',
  units           text        NOT NULL DEFAULT 'metric',
  theme           text        NOT NULL DEFAULT 'system',
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ── workspaces ────────────────────────────────────────────
CREATE TABLE public.workspaces (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  slug        text        UNIQUE,
  icon        text,
  cover_url   text,
  owner_id    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  plan        text        NOT NULL DEFAULT 'free'
                          CHECK (plan IN ('free','pro','team')),
  settings    jsonb       NOT NULL DEFAULT '{}',
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_workspaces_owner ON public.workspaces(owner_id);
CREATE INDEX idx_workspaces_slug  ON public.workspaces(slug) WHERE slug IS NOT NULL;

CREATE TRIGGER workspaces_updated_at
  BEFORE UPDATE ON public.workspaces
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.workspaces ENABLE ROW LEVEL SECURITY;

-- ── workspace_members ─────────────────────────────────────
CREATE TABLE public.workspace_members (
  workspace_id  uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role          text        NOT NULL DEFAULT 'member'
                            CHECK (role IN ('owner','admin','member','viewer')),
  invited_by    uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  joined_at     timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (workspace_id, user_id)
);

CREATE INDEX idx_wm_user      ON public.workspace_members(user_id);
CREATE INDEX idx_wm_workspace ON public.workspace_members(workspace_id);

ALTER TABLE public.workspace_members ENABLE ROW LEVEL SECURITY;

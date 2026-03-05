-- ============================================================
-- Migration 009 — Settings, API Tokens & Widget Tokens
-- ============================================================

-- ── user_settings ─────────────────────────────────────────
CREATE TABLE public.user_settings (
  user_id     uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  settings    jsonb       NOT NULL DEFAULT '{}',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ── workspace_settings ────────────────────────────────────
CREATE TABLE public.workspace_settings (
  workspace_id  uuid        PRIMARY KEY REFERENCES public.workspaces(id) ON DELETE CASCADE,
  settings      jsonb       NOT NULL DEFAULT '{}',
  updated_at    timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_settings ENABLE ROW LEVEL SECURITY;

-- ── notification_prefs ────────────────────────────────────
CREATE TABLE public.notification_prefs (
  user_id     uuid        PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  prefs       jsonb       NOT NULL DEFAULT '{}',
  updated_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notification_prefs ENABLE ROW LEVEL SECURITY;

-- ── api_tokens ────────────────────────────────────────────
CREATE TABLE public.api_tokens (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name          text        NOT NULL,
  token_hash    text        UNIQUE NOT NULL, -- sha256 of the raw token; never store in clear
  scopes        text[]      NOT NULL DEFAULT '{}',
  last_used_at  timestamptz,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  revoked_at    timestamptz
);

CREATE INDEX idx_api_tokens_user ON public.api_tokens(user_id)
  WHERE revoked_at IS NULL;

ALTER TABLE public.api_tokens ENABLE ROW LEVEL SECURITY;

-- ── widget_tokens ─────────────────────────────────────────
-- Used by native iOS/macOS widgets to call Edge Function widget-feed
-- without requiring a full web session
CREATE TABLE public.widget_tokens (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  token       text        UNIQUE NOT NULL,
  expires_at  timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_widget_tokens_user ON public.widget_tokens(user_id);
-- Note: partial index on widget_tokens uses expires_at IS NULL only (now() not allowed in index predicates)
CREATE INDEX idx_widget_tokens_token ON public.widget_tokens(token)
  WHERE expires_at IS NULL;

ALTER TABLE public.widget_tokens ENABLE ROW LEVEL SECURITY;

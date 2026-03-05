-- ============================================================
-- Migration 008 — Notifications & Audit Logs
-- ============================================================

-- ── notifications ─────────────────────────────────────────
CREATE TABLE public.notifications (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type        text        NOT NULL,
  title       text        NOT NULL,
  body        text,
  data        jsonb       NOT NULL DEFAULT '{}',
  read_at     timestamptz,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user
  ON public.notifications(user_id, created_at DESC)
  WHERE read_at IS NULL;

CREATE INDEX idx_notifications_user_all
  ON public.notifications(user_id, created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ── audit_logs ────────────────────────────────────────────
CREATE TABLE public.audit_logs (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id    uuid        REFERENCES public.workspaces(id) ON DELETE SET NULL,
  user_id         uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,
  action          text        NOT NULL,
  resource_type   text,
  resource_id     uuid,
  old_data        jsonb,
  new_data        jsonb,
  ip_addr         inet,
  user_agent      text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- Partition-friendly indexes for log queries
CREATE INDEX idx_audit_logs_workspace
  ON public.audit_logs(workspace_id, created_at DESC);

CREATE INDEX idx_audit_logs_user
  ON public.audit_logs(user_id, created_at DESC);

CREATE INDEX idx_audit_logs_resource
  ON public.audit_logs(resource_type, resource_id)
  WHERE resource_id IS NOT NULL;

ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- ── security_events ───────────────────────────────────────
CREATE TABLE public.security_events (
  id          uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid    REFERENCES public.profiles(id) ON DELETE SET NULL,
  event_type  text    NOT NULL
                      CHECK (event_type IN (
                        'login','logout','password_change','email_change',
                        'mfa_enabled','mfa_disabled','suspicious_login',
                        'api_token_created','api_token_revoked'
                      )),
  metadata    jsonb   NOT NULL DEFAULT '{}',
  ip_addr     inet,
  user_agent  text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_security_events_user
  ON public.security_events(user_id, created_at DESC);

CREATE INDEX idx_security_events_type
  ON public.security_events(event_type, created_at DESC);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

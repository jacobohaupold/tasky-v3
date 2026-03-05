-- ============================================================
-- Migration 007 — Calendar
-- ============================================================

-- ── calendar_events ───────────────────────────────────────
CREATE TABLE public.calendar_events (
  id                      uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id            uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  node_id                 uuid        REFERENCES public.nodes(id) ON DELETE SET NULL,
  title                   text        NOT NULL,
  description             text,
  color                   text,
  start_at                timestamptz NOT NULL,
  end_at                  timestamptz,
  is_all_day              bool        NOT NULL DEFAULT false,
  location                text,
  url                     text,
  recurrence_rule         text,
  recurrence_exceptions   date[]      NOT NULL DEFAULT '{}',
  parent_event_id         uuid        REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  created_by              uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  -- Validate end_at >= start_at when end_at is provided
  CONSTRAINT valid_event_duration CHECK (end_at IS NULL OR end_at >= start_at)
);

-- Index for time-range queries (most common calendar access pattern)
CREATE INDEX idx_calendar_events_range
  ON public.calendar_events(workspace_id, start_at, end_at);

-- Index for finding recurring events
CREATE INDEX idx_calendar_events_recurrence
  ON public.calendar_events(workspace_id, recurrence_rule)
  WHERE recurrence_rule IS NOT NULL;

-- Index for child (exception) events
CREATE INDEX idx_calendar_events_parent
  ON public.calendar_events(parent_event_id)
  WHERE parent_event_id IS NOT NULL;

CREATE TRIGGER calendar_events_updated_at
  BEFORE UPDATE ON public.calendar_events
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;

-- ── event_attendees ───────────────────────────────────────
CREATE TABLE public.event_attendees (
  event_id  uuid  NOT NULL REFERENCES public.calendar_events(id) ON DELETE CASCADE,
  user_id   uuid  NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  status    text  NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending','accepted','declined')),
  PRIMARY KEY (event_id, user_id)
);

CREATE INDEX idx_event_attendees_user ON public.event_attendees(user_id);

ALTER TABLE public.event_attendees ENABLE ROW LEVEL SECURITY;

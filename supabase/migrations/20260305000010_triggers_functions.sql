-- ============================================================
-- Migration 010 — Triggers & Helper Functions
-- ============================================================

-- ── handle_new_user ──────────────────────────────────────
-- Fires on every new auth.users row:
--   1. Creates the profiles row
--   2. Creates a personal workspace
--   3. Adds the user as workspace owner
--   4. Initialises user_settings, notification_prefs, sidebar_state
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_workspace_id  uuid := gen_random_uuid();
  v_display_name  text;
BEGIN
  -- Derive display name from metadata or email
  v_display_name := COALESCE(
    (NEW.raw_user_meta_data->>'full_name'),
    (NEW.raw_user_meta_data->>'name'),
    split_part(NEW.email, '@', 1)
  );

  -- 1. Insert profile
  INSERT INTO public.profiles (id, email, display_name, avatar_url, role, status)
  VALUES (
    NEW.id,
    NEW.email,
    v_display_name,
    NEW.raw_user_meta_data->>'avatar_url',
    'user',
    'active'
  )
  ON CONFLICT (id) DO NOTHING;

  -- 2. Create personal workspace
  INSERT INTO public.workspaces (id, name, slug, owner_id, plan)
  VALUES (
    v_workspace_id,
    'Mi Workspace',
    'ws-' || substring(NEW.id::text, 1, 8),
    NEW.id,
    'free'
  );

  -- 3. Add owner membership
  INSERT INTO public.workspace_members (workspace_id, user_id, role)
  VALUES (v_workspace_id, NEW.id, 'owner');

  -- 4. Init user_settings
  INSERT INTO public.user_settings (user_id, settings)
  VALUES (NEW.id, '{}')
  ON CONFLICT (user_id) DO NOTHING;

  -- 5. Init notification_prefs
  INSERT INTO public.notification_prefs (user_id, prefs)
  VALUES (NEW.id, '{
    "email_digest": true,
    "push_enabled": true,
    "desktop_notifications": true,
    "notify_on_mention": true,
    "notify_on_comment": true,
    "notify_on_due_date": true
  }')
  ON CONFLICT (user_id) DO NOTHING;

  -- 6. Init sidebar_state for the personal workspace
  INSERT INTO public.sidebar_state (user_id, workspace_id, expanded_node_ids)
  VALUES (NEW.id, v_workspace_id, '{}')
  ON CONFLICT (user_id, workspace_id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Attach trigger to auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ── cascade_soft_delete ───────────────────────────────────
-- When a node's deleted_at is set, propagate to all descendants
CREATE OR REPLACE FUNCTION public.cascade_soft_delete()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Only act when deleted_at transitions from NULL → non-NULL
  IF OLD.deleted_at IS NULL AND NEW.deleted_at IS NOT NULL THEN
    WITH RECURSIVE descendants AS (
      SELECT id FROM public.nodes
      WHERE parent_id = NEW.id AND deleted_at IS NULL
      UNION ALL
      SELECT n.id FROM public.nodes n
      INNER JOIN descendants d ON n.parent_id = d.id
      WHERE n.deleted_at IS NULL
    )
    UPDATE public.nodes
    SET deleted_at = NEW.deleted_at,
        deleted_by = NEW.deleted_by
    WHERE id IN (SELECT id FROM descendants);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER nodes_cascade_soft_delete
  AFTER UPDATE OF deleted_at ON public.nodes
  FOR EACH ROW EXECUTE FUNCTION public.cascade_soft_delete();

-- ── compute_node_position (fractional indexing) ───────────
-- Returns a position value between two neighbors.
-- If prev_pos IS NULL → place at start (half of next_pos, or 1000)
-- If next_pos IS NULL → place at end (prev_pos + 1000)
-- Otherwise → midpoint
CREATE OR REPLACE FUNCTION public.compute_node_position(
  prev_pos  numeric DEFAULT NULL,
  next_pos  numeric DEFAULT NULL
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
PARALLEL SAFE
AS $$
BEGIN
  IF prev_pos IS NULL AND next_pos IS NULL THEN
    RETURN 1000;
  ELSIF prev_pos IS NULL THEN
    RETURN next_pos / 2;
  ELSIF next_pos IS NULL THEN
    RETURN prev_pos + 1000;
  ELSE
    RETURN (prev_pos + next_pos) / 2;
  END IF;
END;
$$;

-- ── reorder_collection_items ─────────────────────────────
-- Utility function: bulk-reorders items in a collection view
-- Input: collection_id, ordered array of item_ids
CREATE OR REPLACE FUNCTION public.reorder_collection_items(
  p_collection_id uuid,
  p_item_ids      uuid[]
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_pos numeric := 1000;
  v_id  uuid;
BEGIN
  FOREACH v_id IN ARRAY p_item_ids LOOP
    UPDATE public.collection_items
    SET position = v_pos
    WHERE id = v_id AND collection_id = p_collection_id;
    v_pos := v_pos + 1000;
  END LOOP;
END;
$$;

-- ── increment_template_install_count ─────────────────────
-- Called from Edge Functions after a successful template install
CREATE OR REPLACE FUNCTION public.increment_template_install_count(
  p_version_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.template_stats (version_id, install_count, last_30d_installs)
  VALUES (p_version_id, 1, 1)
  ON CONFLICT (version_id) DO UPDATE
  SET install_count     = public.template_stats.install_count + 1,
      last_30d_installs = public.template_stats.last_30d_installs + 1,
      updated_at        = now();
END;
$$;

-- ── is_workspace_member ───────────────────────────────────
-- Helper used by RLS policies to avoid repeating subqueries
CREATE OR REPLACE FUNCTION public.is_workspace_member(
  p_workspace_id  uuid,
  p_user_id       uuid DEFAULT auth.uid()
)
RETURNS bool
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = p_user_id
  );
$$;

-- ── is_workspace_admin ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.is_workspace_admin(
  p_workspace_id  uuid,
  p_user_id       uuid DEFAULT auth.uid()
)
RETURNS bool
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.workspace_members
    WHERE workspace_id = p_workspace_id
      AND user_id = p_user_id
      AND role IN ('owner','admin')
  );
$$;

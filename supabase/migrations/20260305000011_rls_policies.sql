-- ============================================================
-- Migration 011 — Row Level Security Policies
-- ============================================================

-- ═══════════════════════════════════════════════════════════
-- profiles
-- ═══════════════════════════════════════════════════════════

-- Users can read their own profile
CREATE POLICY "profiles: select own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can see profiles of people in shared workspaces
CREATE POLICY "profiles: select workspace peers"
  ON public.profiles FOR SELECT
  USING (
    id IN (
      SELECT wm2.user_id
      FROM public.workspace_members wm1
      JOIN public.workspace_members wm2 USING (workspace_id)
      WHERE wm1.user_id = auth.uid()
    )
  );

-- Users can update their own profile
CREATE POLICY "profiles: update own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ═══════════════════════════════════════════════════════════
-- workspaces
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "workspaces: select if member"
  ON public.workspaces FOR SELECT
  USING (public.is_workspace_member(id));

CREATE POLICY "workspaces: insert if authenticated"
  ON public.workspaces FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workspaces: update if admin"
  ON public.workspaces FOR UPDATE
  USING (public.is_workspace_admin(id))
  WITH CHECK (public.is_workspace_admin(id));

CREATE POLICY "workspaces: delete if owner"
  ON public.workspaces FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = id
        AND user_id = auth.uid()
        AND role = 'owner'
    )
  );

-- ═══════════════════════════════════════════════════════════
-- workspace_members
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "workspace_members: select if member"
  ON public.workspace_members FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_members: insert if admin"
  ON public.workspace_members FOR INSERT
  WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "workspace_members: update if admin"
  ON public.workspace_members FOR UPDATE
  USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "workspace_members: delete if admin or self"
  ON public.workspace_members FOR DELETE
  USING (
    user_id = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

-- ═══════════════════════════════════════════════════════════
-- nodes
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "nodes: select if workspace member"
  ON public.nodes FOR SELECT
  USING (
    public.is_workspace_member(workspace_id)
    AND deleted_at IS NULL
  );

CREATE POLICY "nodes: insert if non-viewer member"
  ON public.nodes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner','admin','member')
    )
  );

CREATE POLICY "nodes: update if creator or admin"
  ON public.nodes FOR UPDATE
  USING (
    created_by = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  )
  WITH CHECK (
    created_by = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "nodes: delete if creator or admin"
  ON public.nodes FOR DELETE
  USING (
    (created_by = auth.uid() OR public.is_workspace_admin(workspace_id))
    AND deleted_at IS NULL
  );

-- ═══════════════════════════════════════════════════════════
-- node_permissions
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "node_permissions: select if node visible"
  ON public.node_permissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nodes n
      WHERE n.id = node_id
        AND public.is_workspace_member(n.workspace_id)
    )
  );

CREATE POLICY "node_permissions: manage if node admin"
  ON public.node_permissions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.nodes n
      WHERE n.id = node_id
        AND (n.created_by = auth.uid() OR public.is_workspace_admin(n.workspace_id))
    )
  );

-- ═══════════════════════════════════════════════════════════
-- user_favorites
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "user_favorites: own only"
  ON public.user_favorites FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- recent_views
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "recent_views: own only"
  ON public.recent_views FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- sidebar_state
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "sidebar_state: own only"
  ON public.sidebar_state FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- blocks
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "blocks: select if can view node"
  ON public.blocks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.nodes n
      WHERE n.id = node_id
        AND public.is_workspace_member(n.workspace_id)
        AND n.deleted_at IS NULL
    )
  );

CREATE POLICY "blocks: modify if can edit node"
  ON public.blocks FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.nodes n
      WHERE n.id = node_id
        AND (n.created_by = auth.uid() OR public.is_workspace_admin(n.workspace_id))
        AND n.deleted_at IS NULL
    )
  );

-- ═══════════════════════════════════════════════════════════
-- collections and sub-tables
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "collections: select if workspace member"
  ON public.collections FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "collections: modify if creator or admin"
  ON public.collections FOR ALL
  USING (
    created_by = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "collection_properties: select if workspace member"
  ON public.collection_properties FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "collection_properties: modify if collection admin"
  ON public.collection_properties FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
        AND (c.created_by = auth.uid() OR public.is_workspace_admin(c.workspace_id))
    )
  );

CREATE POLICY "collection_views: select if workspace member"
  ON public.collection_views FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "collection_views: modify if collection admin"
  ON public.collection_views FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
        AND (c.created_by = auth.uid() OR public.is_workspace_admin(c.workspace_id))
    )
  );

CREATE POLICY "collection_items: select if workspace member"
  ON public.collection_items FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      WHERE c.id = collection_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "collection_items: modify if member (non-viewer)"
  ON public.collection_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collections c
      JOIN public.workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE c.id = collection_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner','admin','member')
    )
  );

CREATE POLICY "collection_item_values: select if workspace member"
  ON public.collection_item_values FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_items ci
      JOIN public.collections c ON c.id = ci.collection_id
      WHERE ci.id = item_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "collection_item_values: modify if member (non-viewer)"
  ON public.collection_item_values FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_items ci
      JOIN public.collections c ON c.id = ci.collection_id
      JOIN public.workspace_members wm ON wm.workspace_id = c.workspace_id
      WHERE ci.id = item_id
        AND wm.user_id = auth.uid()
        AND wm.role IN ('owner','admin','member')
    )
  );

CREATE POLICY "collection_relations: select if workspace member"
  ON public.collection_relations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_properties cp
      JOIN public.collections c ON c.id = cp.collection_id
      WHERE cp.id = from_property_id
        AND public.is_workspace_member(c.workspace_id)
    )
  );

CREATE POLICY "collection_relations: modify if admin"
  ON public.collection_relations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.collection_properties cp
      JOIN public.collections c ON c.id = cp.collection_id
      WHERE cp.id = from_property_id
        AND public.is_workspace_admin(c.workspace_id)
    )
  );

-- ═══════════════════════════════════════════════════════════
-- templates
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "template_products: public read if published"
  ON public.template_products FOR SELECT
  USING (is_published = true OR created_by = auth.uid());

CREATE POLICY "template_products: manage own"
  ON public.template_products FOR ALL
  USING (created_by = auth.uid())
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "template_versions: select if product visible"
  ON public.template_versions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.template_products p
      WHERE p.id = product_id
        AND (p.is_published = true OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "template_versions: manage own product"
  ON public.template_versions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.template_products p
      WHERE p.id = product_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "template_assets: select if product visible"
  ON public.template_assets FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.template_versions tv
      JOIN public.template_products p ON p.id = tv.product_id
      WHERE tv.id = version_id
        AND (p.is_published = true OR p.created_by = auth.uid())
    )
  );

CREATE POLICY "template_assets: manage own product"
  ON public.template_assets FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.template_versions tv
      JOIN public.template_products p ON p.id = tv.product_id
      WHERE tv.id = version_id AND p.created_by = auth.uid()
    )
  );

CREATE POLICY "template_installations: select own"
  ON public.template_installations FOR SELECT
  USING (user_id = auth.uid() OR public.is_workspace_admin(workspace_id));

CREATE POLICY "template_installations: insert if workspace member"
  ON public.template_installations FOR INSERT
  WITH CHECK (
    user_id = auth.uid()
    AND public.is_workspace_member(workspace_id)
  );

CREATE POLICY "template_stats: public read"
  ON public.template_stats FOR SELECT
  USING (true);

-- ═══════════════════════════════════════════════════════════
-- calendar
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "calendar_events: select if workspace member"
  ON public.calendar_events FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "calendar_events: insert if non-viewer"
  ON public.calendar_events FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.workspace_members
      WHERE workspace_id = workspace_id
        AND user_id = auth.uid()
        AND role IN ('owner','admin','member')
    )
  );

CREATE POLICY "calendar_events: update if creator or admin"
  ON public.calendar_events FOR UPDATE
  USING (
    created_by = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "calendar_events: delete if creator or admin"
  ON public.calendar_events FOR DELETE
  USING (
    created_by = auth.uid()
    OR public.is_workspace_admin(workspace_id)
  );

CREATE POLICY "event_attendees: select if workspace member"
  ON public.event_attendees FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.calendar_events ce
      WHERE ce.id = event_id
        AND public.is_workspace_member(ce.workspace_id)
    )
  );

CREATE POLICY "event_attendees: manage own attendance"
  ON public.event_attendees FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- notifications
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "notifications: own only"
  ON public.notifications FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- audit_logs
-- ═══════════════════════════════════════════════════════════

-- Workspace admins can read logs for their workspaces
CREATE POLICY "audit_logs: select if workspace admin"
  ON public.audit_logs FOR SELECT
  USING (
    public.is_workspace_admin(workspace_id)
    OR user_id = auth.uid()
  );

-- No direct INSERT from client — only via Edge Functions (service role)
-- No UPDATE/DELETE from clients

-- ═══════════════════════════════════════════════════════════
-- security_events
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "security_events: select own"
  ON public.security_events FOR SELECT
  USING (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- settings
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "user_settings: own only"
  ON public.user_settings FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "workspace_settings: select if member"
  ON public.workspace_settings FOR SELECT
  USING (public.is_workspace_member(workspace_id));

CREATE POLICY "workspace_settings: update if admin"
  ON public.workspace_settings FOR UPDATE
  USING (public.is_workspace_admin(workspace_id));

CREATE POLICY "workspace_settings: insert if admin"
  ON public.workspace_settings FOR INSERT
  WITH CHECK (public.is_workspace_admin(workspace_id));

CREATE POLICY "notification_prefs: own only"
  ON public.notification_prefs FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- api_tokens
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "api_tokens: own only"
  ON public.api_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- ═══════════════════════════════════════════════════════════
-- widget_tokens
-- ═══════════════════════════════════════════════════════════

CREATE POLICY "widget_tokens: own only"
  ON public.widget_tokens FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

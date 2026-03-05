-- ============================================================
-- Migration 005 — Collections (Notion-style Databases)
-- ============================================================

-- ── collections ───────────────────────────────────────────
CREATE TABLE public.collections (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id  uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  node_id       uuid        NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  name          text,
  description   text,
  icon          text,
  cover_url     text,
  created_by    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_collections_workspace ON public.collections(workspace_id);
CREATE INDEX idx_collections_node      ON public.collections(node_id);

CREATE TRIGGER collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;

-- ── collection_properties ─────────────────────────────────
CREATE TABLE public.collection_properties (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid    NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  key           text    NOT NULL,
  name          text    NOT NULL,
  type          text    NOT NULL
                        CHECK (type IN (
                          'title','text','number','select','multi_select',
                          'date','datetime','checkbox','url','email','phone',
                          'relation','rollup','formula',
                          'created_at','updated_at','created_by','files'
                        )),
  config        jsonb   NOT NULL DEFAULT '{}',
  is_required   bool    NOT NULL DEFAULT false,
  is_computed   bool    NOT NULL DEFAULT false,
  is_hidden     bool    NOT NULL DEFAULT false,
  sort_order    numeric NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (collection_id, key)
);

CREATE INDEX idx_coll_props_collection ON public.collection_properties(collection_id, sort_order);

CREATE TRIGGER collection_properties_updated_at
  BEFORE UPDATE ON public.collection_properties
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.collection_properties ENABLE ROW LEVEL SECURITY;

-- ── collection_views ──────────────────────────────────────
CREATE TABLE public.collection_views (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid    NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  name          text    NOT NULL,
  type          text    NOT NULL
                        CHECK (type IN (
                          'table','board','gallery','list','calendar','timeline'
                        )),
  config        jsonb   NOT NULL DEFAULT '{}',
  is_default    bool    NOT NULL DEFAULT false,
  sort_order    numeric NOT NULL DEFAULT 0,
  created_by    uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_coll_views_collection ON public.collection_views(collection_id, sort_order);

CREATE TRIGGER collection_views_updated_at
  BEFORE UPDATE ON public.collection_views
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.collection_views ENABLE ROW LEVEL SECURITY;

-- ── collection_items ──────────────────────────────────────
CREATE TABLE public.collection_items (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id uuid        NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  node_id       uuid        NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  position      numeric     NOT NULL DEFAULT 0,
  created_by    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  archived_at   timestamptz,
  deleted_at    timestamptz
);

CREATE INDEX idx_coll_items_collection ON public.collection_items(collection_id, position)
  WHERE deleted_at IS NULL;
CREATE INDEX idx_coll_items_node ON public.collection_items(node_id);

CREATE TRIGGER collection_items_updated_at
  BEFORE UPDATE ON public.collection_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.collection_items ENABLE ROW LEVEL SECURITY;

-- ── collection_item_values ────────────────────────────────
CREATE TABLE public.collection_item_values (
  item_id       uuid    NOT NULL REFERENCES public.collection_items(id) ON DELETE CASCADE,
  property_id   uuid    NOT NULL REFERENCES public.collection_properties(id) ON DELETE CASCADE,
  value         jsonb,
  updated_at    timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (item_id, property_id)
);

CREATE INDEX idx_civ_property ON public.collection_item_values(property_id);

ALTER TABLE public.collection_item_values ENABLE ROW LEVEL SECURITY;

-- ── collection_relations ──────────────────────────────────
CREATE TABLE public.collection_relations (
  id                uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  from_property_id  uuid    NOT NULL REFERENCES public.collection_properties(id) ON DELETE CASCADE,
  to_collection_id  uuid    NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  to_property_id    uuid    REFERENCES public.collection_properties(id) ON DELETE SET NULL,
  is_two_way        bool    NOT NULL DEFAULT false
);

CREATE INDEX idx_coll_relations_from ON public.collection_relations(from_property_id);
CREATE INDEX idx_coll_relations_to   ON public.collection_relations(to_collection_id);

ALTER TABLE public.collection_relations ENABLE ROW LEVEL SECURITY;

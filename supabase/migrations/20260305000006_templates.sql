-- ============================================================
-- Migration 006 — Templates Marketplace
-- ============================================================

-- ── template_products ─────────────────────────────────────
CREATE TABLE public.template_products (
  id            uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text        UNIQUE NOT NULL,
  name          text        NOT NULL,
  description   text,
  category      text        NOT NULL DEFAULT 'custom'
                            CHECK (category IN (
                              'productivity','fitness','student','life','business','custom'
                            )),
  tags          text[]      NOT NULL DEFAULT '{}',
  theme         text        NOT NULL DEFAULT 'light'
                            CHECK (theme IN ('light','dark')),
  is_published  bool        NOT NULL DEFAULT false,
  is_featured   bool        NOT NULL DEFAULT false,
  created_by    uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_products_category
  ON public.template_products(category, is_published, is_featured)
  WHERE is_published = true;

CREATE INDEX idx_template_products_tags
  ON public.template_products USING gin(tags);

CREATE TRIGGER template_products_updated_at
  BEFORE UPDATE ON public.template_products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.template_products ENABLE ROW LEVEL SECURITY;

-- ── template_versions ─────────────────────────────────────
CREATE TABLE public.template_versions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  uuid        NOT NULL REFERENCES public.template_products(id) ON DELETE CASCADE,
  version     text        NOT NULL,
  manifest    jsonb       NOT NULL,
  changelog   text,
  is_latest   bool        NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (product_id, version)
);

CREATE INDEX idx_template_versions_product ON public.template_versions(product_id, is_latest);

ALTER TABLE public.template_versions ENABLE ROW LEVEL SECURITY;

-- ── template_assets ───────────────────────────────────────
CREATE TABLE public.template_assets (
  id            uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  version_id    uuid    NOT NULL REFERENCES public.template_versions(id) ON DELETE CASCADE,
  type          text    NOT NULL
                        CHECK (type IN ('cover','screenshot','preview_gif')),
  storage_path  text    NOT NULL,
  sort_order    int     NOT NULL DEFAULT 0,
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_assets_version ON public.template_assets(version_id, sort_order);

ALTER TABLE public.template_assets ENABLE ROW LEVEL SECURITY;

-- ── template_installations ────────────────────────────────
CREATE TABLE public.template_installations (
  id                    uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  workspace_id          uuid        NOT NULL REFERENCES public.workspaces(id) ON DELETE CASCADE,
  user_id               uuid        NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  template_version_id   uuid        NOT NULL REFERENCES public.template_versions(id) ON DELETE RESTRICT,
  root_node_id          uuid        REFERENCES public.nodes(id) ON DELETE SET NULL,
  id_map                jsonb,
  status                text        NOT NULL DEFAULT 'pending'
                                    CHECK (status IN ('pending','running','success','error')),
  error_message         text,
  installed_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_template_installs_workspace ON public.template_installations(workspace_id);
CREATE INDEX idx_template_installs_user      ON public.template_installations(user_id);
CREATE INDEX idx_template_installs_version   ON public.template_installations(template_version_id);

ALTER TABLE public.template_installations ENABLE ROW LEVEL SECURITY;

-- ── template_stats ────────────────────────────────────────
CREATE TABLE public.template_stats (
  version_id        uuid            PRIMARY KEY
                                    REFERENCES public.template_versions(id) ON DELETE CASCADE,
  install_count     int             NOT NULL DEFAULT 0,
  last_30d_installs int             NOT NULL DEFAULT 0,
  rating_avg        numeric(3,2),
  updated_at        timestamptz     NOT NULL DEFAULT now()
);

ALTER TABLE public.template_stats ENABLE ROW LEVEL SECURITY;

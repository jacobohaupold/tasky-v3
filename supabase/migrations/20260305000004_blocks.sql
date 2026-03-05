-- ============================================================
-- Migration 004 — Block Editor
-- ============================================================

CREATE TABLE public.blocks (
  id              uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  node_id         uuid    NOT NULL REFERENCES public.nodes(id) ON DELETE CASCADE,
  parent_block_id uuid    REFERENCES public.blocks(id) ON DELETE CASCADE,
  type            text    NOT NULL
                          CHECK (type IN (
                            'paragraph','heading_1','heading_2','heading_3',
                            'bulleted_list','numbered_list','todo','toggle',
                            'quote','callout','divider',
                            'image','video','embed','code',
                            'table','simple_table','column_list','column',
                            'linked_view','button','database_inline'
                          )),
  position        numeric NOT NULL DEFAULT 0,
  props           jsonb   NOT NULL DEFAULT '{}',
  schema_version  int     NOT NULL DEFAULT 1,
  created_by      uuid    NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- Index for loading all blocks of a node in order
CREATE INDEX idx_blocks_node_pos
  ON public.blocks(node_id, position);

-- Index for nested block tree
CREATE INDEX idx_blocks_parent
  ON public.blocks(node_id, parent_block_id)
  WHERE parent_block_id IS NOT NULL;

CREATE TRIGGER blocks_updated_at
  BEFORE UPDATE ON public.blocks
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.blocks ENABLE ROW LEVEL SECURITY;

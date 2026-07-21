CREATE TABLE IF NOT EXISTS reading_topics (
  id BIGSERIAL PRIMARY KEY,
  topic_key TEXT NOT NULL UNIQUE,
  title_ko TEXT NOT NULL,
  primary_domain TEXT NOT NULL CHECK (primary_domain IN (
    'science', 'math_data', 'society_economy', 'technology_information',
    'health_life', 'ethics_citizenship', 'arts_language', 'environment'
  )),
  related_domains TEXT[] NOT NULL DEFAULT '{}',
  core_question TEXT NOT NULL,
  core_facts JSONB NOT NULL DEFAULT '[]'::JSONB CHECK (JSONB_TYPEOF(core_facts) = 'array'),
  misconceptions JSONB NOT NULL DEFAULT '[]'::JSONB CHECK (JSONB_TYPEOF(misconceptions) = 'array'),
  practical_use TEXT NOT NULL DEFAULT '',
  age_scope JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (JSONB_TYPEOF(age_scope) = 'object'),
  uncertainty_notes TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'retired')),
  created_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  updated_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_sources (
  id BIGSERIAL PRIMARY KEY,
  topic_id BIGINT NOT NULL REFERENCES reading_topics(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  publisher TEXT NOT NULL,
  source_url TEXT NOT NULL,
  source_kind TEXT NOT NULL DEFAULT 'secondary'
    CHECK (source_kind IN ('primary', 'official', 'systematic_review', 'secondary')),
  published_on DATE,
  verified_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  notes TEXT NOT NULL DEFAULT '',
  created_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (topic_id, source_url)
);

CREATE INDEX IF NOT EXISTS reading_sources_topic_idx ON reading_sources(topic_id);
CREATE INDEX IF NOT EXISTS reading_sources_expiry_idx
  ON reading_sources(expires_at) WHERE expires_at IS NOT NULL;

CREATE TABLE IF NOT EXISTS reading_items (
  id BIGSERIAL PRIMARY KEY,
  item_key TEXT NOT NULL UNIQUE,
  topic_id BIGINT NOT NULL REFERENCES reading_topics(id) ON DELETE RESTRICT,
  track TEXT NOT NULL CHECK (track IN ('ko', 'en')),
  target_level SMALLINT NOT NULL CHECK (target_level BETWEEN 1 AND 8),
  question_type TEXT NOT NULL CHECK (question_type IN (
    'explicit', 'main_idea', 'title', 'purpose', 'inference', 'blank',
    'order', 'insertion', 'implication', 'vocabulary', 'summary',
    'content_match', 'data_interpretation'
  )),
  current_published_version_id BIGINT,
  created_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reading_items_filter_idx
  ON reading_items(track, target_level, question_type, topic_id);

CREATE TABLE IF NOT EXISTS reading_item_versions (
  id BIGSERIAL PRIMARY KEY,
  item_id BIGINT NOT NULL REFERENCES reading_items(id) ON DELETE CASCADE,
  version_no INTEGER NOT NULL CHECK (version_no >= 1),
  passage_text TEXT NOT NULL CHECK (LENGTH(BTRIM(passage_text)) > 0),
  prompt_text TEXT NOT NULL CHECK (LENGTH(BTRIM(prompt_text)) > 0),
  choices JSONB NOT NULL CHECK (JSONB_TYPEOF(choices) = 'array')
    CHECK (JSONB_ARRAY_LENGTH(choices) BETWEEN 3 AND 5),
  correct_index SMALLINT NOT NULL CHECK (correct_index >= 0)
    CHECK (correct_index < JSONB_ARRAY_LENGTH(choices)),
  answer_evidence TEXT NOT NULL,
  explanation TEXT NOT NULL,
  distractor_reasons JSONB NOT NULL DEFAULT '[]'::JSONB
    CHECK (JSONB_TYPEOF(distractor_reasons) = 'array'),
  difficulty_meta JSONB NOT NULL DEFAULT '{}'::JSONB
    CHECK (JSONB_TYPEOF(difficulty_meta) = 'object'),
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'auto_checked', 'review_pending', 'changes_requested',
    'approved_for_pilot', 'calibrated', 'published', 'retired'
  )),
  created_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (item_id, version_no),
  UNIQUE (id, item_id)
);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'reading_items_published_version_fk'
  ) THEN
    ALTER TABLE reading_items
      ADD CONSTRAINT reading_items_published_version_fk
      FOREIGN KEY (current_published_version_id, id)
      REFERENCES reading_item_versions(id, item_id)
      ON DELETE RESTRICT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS reading_versions_status_idx
  ON reading_item_versions(status, updated_at DESC);
CREATE INDEX IF NOT EXISTS reading_versions_item_idx
  ON reading_item_versions(item_id, version_no DESC);

CREATE TABLE IF NOT EXISTS reading_auto_checks (
  id BIGSERIAL PRIMARY KEY,
  version_id BIGINT NOT NULL REFERENCES reading_item_versions(id) ON DELETE CASCADE,
  checker_version TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  results JSONB NOT NULL DEFAULT '{}'::JSONB CHECK (JSONB_TYPEOF(results) = 'object'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (version_id, checker_version)
);

CREATE TABLE IF NOT EXISTS reading_audit_events (
  id BIGSERIAL PRIMARY KEY,
  actor_user_id BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  entity_type TEXT NOT NULL,
  entity_id BIGINT NOT NULL,
  action TEXT NOT NULL,
  previous_state JSONB,
  next_state JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reading_audit_entity_idx
  ON reading_audit_events(entity_type, entity_id, created_at DESC);


CREATE TABLE IF NOT EXISTS reading_reviewer_permissions (
  user_id BIGINT PRIMARY KEY REFERENCES classroom_users(id) ON DELETE CASCADE,
  can_edit BOOLEAN NOT NULL DEFAULT FALSE,
  can_review BOOLEAN NOT NULL DEFAULT FALSE,
  can_publish BOOLEAN NOT NULL DEFAULT FALSE,
  granted_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  granted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reading_reviews (
  id BIGSERIAL PRIMARY KEY,
  version_id BIGINT NOT NULL REFERENCES reading_item_versions(id) ON DELETE CASCADE,
  reviewer_user_id BIGINT NOT NULL REFERENCES classroom_users(id) ON DELETE RESTRICT,
  reviewer_answer_index SMALLINT NOT NULL CHECK (reviewer_answer_index BETWEEN 0 AND 4),
  rubric JSONB NOT NULL CHECK (JSONB_TYPEOF(rubric) = 'object'),
  total_score SMALLINT NOT NULL CHECK (total_score BETWEEN 0 AND 20),
  decision TEXT NOT NULL CHECK (decision IN ('pass', 'changes_requested')),
  comment TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (version_id, reviewer_user_id)
);

CREATE INDEX IF NOT EXISTS reading_reviews_version_idx
  ON reading_reviews(version_id, created_at);


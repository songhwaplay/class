CREATE TABLE IF NOT EXISTS reading_pilots (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL CHECK (LENGTH(BTRIM(title)) BETWEEN 1 AND 120),
  class_id BIGINT NOT NULL REFERENCES classroom_classes(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'closed')),
  created_by BIGINT REFERENCES classroom_users(id) ON DELETE SET NULL,
  opened_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS reading_pilots_class_status_idx
  ON reading_pilots(class_id, status, updated_at DESC);

CREATE TABLE IF NOT EXISTS reading_pilot_items (
  pilot_id BIGINT NOT NULL REFERENCES reading_pilots(id) ON DELETE CASCADE,
  version_id BIGINT NOT NULL REFERENCES reading_item_versions(id) ON DELETE RESTRICT,
  position SMALLINT NOT NULL CHECK (position BETWEEN 1 AND 30),
  PRIMARY KEY (pilot_id, version_id),
  UNIQUE (pilot_id, position)
);

CREATE TABLE IF NOT EXISTS reading_pilot_attempts (
  id BIGSERIAL PRIMARY KEY,
  pilot_id BIGINT NOT NULL REFERENCES reading_pilots(id) ON DELETE CASCADE,
  student_user_id BIGINT NOT NULL REFERENCES classroom_users(id) ON DELETE RESTRICT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  submitted_at TIMESTAMPTZ,
  UNIQUE (pilot_id, student_user_id),
  UNIQUE (id, pilot_id)
);

CREATE INDEX IF NOT EXISTS reading_pilot_attempts_student_idx
  ON reading_pilot_attempts(student_user_id, started_at DESC);

CREATE TABLE IF NOT EXISTS reading_pilot_responses (
  id BIGSERIAL PRIMARY KEY,
  attempt_id BIGINT NOT NULL,
  pilot_id BIGINT NOT NULL,
  version_id BIGINT NOT NULL,
  selected_index SMALLINT NOT NULL CHECK (selected_index BETWEEN 0 AND 4),
  is_correct BOOLEAN NOT NULL,
  response_ms INTEGER NOT NULL CHECK (response_ms BETWEEN 250 AND 3600000),
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (attempt_id, version_id),
  FOREIGN KEY (attempt_id, pilot_id)
    REFERENCES reading_pilot_attempts(id, pilot_id) ON DELETE CASCADE,
  FOREIGN KEY (pilot_id, version_id)
    REFERENCES reading_pilot_items(pilot_id, version_id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS reading_pilot_responses_metrics_idx
  ON reading_pilot_responses(pilot_id, version_id, selected_index);

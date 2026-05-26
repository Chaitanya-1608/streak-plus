-- ── Initial tables (run once if not already created) ─────────────────────────

CREATE TABLE IF NOT EXISTS habits (
  id           BIGINT  NOT NULL,
  user_id      TEXT    NOT NULL,
  name         TEXT    NOT NULL,
  emoji        TEXT    NOT NULL DEFAULT '🔥',
  created_at   TEXT    NOT NULL,
  PRIMARY KEY (user_id, id)
);

CREATE TABLE IF NOT EXISTS completions (
  user_id      TEXT    NOT NULL,
  habit_id     BIGINT  NOT NULL,
  completed_on TEXT    NOT NULL,
  PRIMARY KEY (user_id, habit_id, completed_on)
);

-- ── Dual-mode columns (run this block in Supabase SQL Editor) ─────────────────

ALTER TABLE habits ADD COLUMN IF NOT EXISTS mode               TEXT DEFAULT 'maintaining';
ALTER TABLE habits ADD COLUMN IF NOT EXISTS build_stage        INT  DEFAULT 0;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS identity_statement TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS cue                TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS habit_stack        TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS minimum_version    TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS reward             TEXT;
ALTER TABLE habits ADD COLUMN IF NOT EXISTS graduated_at       TEXT;

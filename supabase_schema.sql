-- Run this in your Supabase project → SQL Editor

-- Habits: client-generated id (Date.now() bigint) + user_id
CREATE TABLE IF NOT EXISTS habits (
  id           BIGINT      NOT NULL,
  user_id      TEXT        NOT NULL,   -- matches users.id (works for uuid or bigint)
  name         TEXT        NOT NULL,
  emoji        TEXT        NOT NULL DEFAULT '🔥',
  created_at   TEXT        NOT NULL,   -- local ISO date e.g. '2026-05-26'
  PRIMARY KEY (user_id, id)
);

-- Completions: one row per habit per day completed
CREATE TABLE IF NOT EXISTS completions (
  user_id      TEXT        NOT NULL,
  habit_id     BIGINT      NOT NULL,
  completed_on TEXT        NOT NULL,   -- local ISO date e.g. '2026-05-26'
  PRIMARY KEY (user_id, habit_id, completed_on)
);

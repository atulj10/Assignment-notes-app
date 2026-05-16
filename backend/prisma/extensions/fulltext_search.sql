-- Run this after applying the Prisma migration.
-- Creates a GIN index on the expression to_tsvector for fast full-text search.

CREATE INDEX IF NOT EXISTS idx_notes_search
  ON notes
  USING GIN (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content, '')));

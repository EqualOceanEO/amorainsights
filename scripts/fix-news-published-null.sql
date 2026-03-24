-- Fix: Back-fill is_published for existing news_items rows
-- Problem: ALTER TABLE ADD COLUMN with DEFAULT only sets the default for NEW rows.
--          Existing rows get NULL for is_published, which is filtered out by
--          the API query "WHERE is_published = true" (NULL != true).
-- Fix: Set is_published = TRUE for all existing rows that have NULL.
-- Run this in Supabase SQL Editor.

UPDATE news_items
SET is_published = TRUE
WHERE is_published IS NULL;

-- Verify the fix
SELECT
  count(*)                              AS total_rows,
  count(*) FILTER (WHERE is_published = true)  AS published_rows,
  count(*) FILTER (WHERE is_published IS NULL) AS null_rows
FROM news_items;

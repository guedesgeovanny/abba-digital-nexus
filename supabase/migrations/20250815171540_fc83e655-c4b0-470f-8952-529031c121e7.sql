-- Allow custom status values for conversations to support custom stages
ALTER TABLE conversations DROP CONSTRAINT IF EXISTS conversations_status_check;
ALTER TABLE conversations ALTER COLUMN status TYPE text;
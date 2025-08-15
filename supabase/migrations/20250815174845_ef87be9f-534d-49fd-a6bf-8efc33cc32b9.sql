-- Allow custom status values for contacts to support custom stages
ALTER TABLE contacts DROP CONSTRAINT IF EXISTS contacts_status_check;
ALTER TABLE contacts ALTER COLUMN status TYPE text;
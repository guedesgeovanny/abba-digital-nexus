-- Enable realtime for contacts table
-- This will allow real-time updates when contact data changes

-- Enable replica identity for full row data on updates
ALTER TABLE contacts REPLICA IDENTITY FULL;

-- Add contacts table to realtime publication
-- (conversations table is already in the publication)
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
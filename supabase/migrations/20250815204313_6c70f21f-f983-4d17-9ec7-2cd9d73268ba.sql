-- Enable realtime for contacts and conversations tables
-- This will allow real-time updates when data changes

-- Enable replica identity for full row data on updates
ALTER TABLE contacts REPLICA IDENTITY FULL;
ALTER TABLE conversations REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE conversations;
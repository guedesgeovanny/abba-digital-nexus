-- Add some sample contact-tag relationships for the CRM demo
-- Get some random contacts and tags to create relationships
INSERT INTO contact_tag_relations (contact_id, tag_id)
SELECT c.id, t.id
FROM (
    SELECT id FROM contacts 
    WHERE user_id = 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56' 
    ORDER BY RANDOM() 
    LIMIT 10
) c
CROSS JOIN (
    SELECT id FROM contact_tags 
    WHERE user_id = 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56' 
    ORDER BY RANDOM() 
    LIMIT 3
) t
WHERE RANDOM() < 0.4  -- 40% chance to create each relationship
ON CONFLICT (contact_id, tag_id) DO NOTHING;
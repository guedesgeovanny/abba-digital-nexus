-- Fix contacts table structure for real CRM data
-- 1. The value column should already exist from previous migration, but let's ensure it's there
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='contacts' AND column_name='value') THEN
        ALTER TABLE contacts ADD COLUMN value DECIMAL(10,2) DEFAULT 0;
    END IF;
END $$;

-- 2. Change agent_assigned from text to UUID with foreign key to agents table
ALTER TABLE contacts 
DROP COLUMN IF EXISTS agent_assigned CASCADE;

ALTER TABLE contacts 
ADD COLUMN agent_assigned UUID REFERENCES agents(id) ON DELETE SET NULL;

-- 3. Add indexes for better CRM query performance
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_agent_assigned ON contacts(agent_assigned);
CREATE INDEX IF NOT EXISTS idx_contacts_user_status ON contacts(user_id, status);
CREATE INDEX IF NOT EXISTS idx_contacts_value ON contacts(value);

-- 4. Create some sample agents for testing (using correct enum values)
INSERT INTO agents (id, user_id, name, description, type, status, channel) VALUES
('550e8400-e29b-41d4-a716-446655440001', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Ana Silva', 'Especialista em vendas B2B', 'vendas', 'active', 'whatsapp'),
('550e8400-e29b-41d4-a716-446655440002', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Carlos Santos', 'Consultor de negócios', 'marketing', 'active', 'instagram'),
('550e8400-e29b-41d4-a716-446655440003', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Marina Costa', 'Gerente de relacionamento', 'atendimento', 'active', 'whatsapp'),
('550e8400-e29b-41d4-a716-446655440004', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Roberto Lima', 'Especialista em conversão', 'personalizado', 'inactive', 'messenger')
ON CONFLICT (id) DO NOTHING;

-- 5. Create sample contact tags
INSERT INTO contact_tags (id, user_id, name, color) VALUES
('650e8400-e29b-41d4-a716-446655440001', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'VIP', '#ef4444'),
('650e8400-e29b-41d4-a716-446655440002', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Urgente', '#f97316'),
('650e8400-e29b-41d4-a716-446655440003', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Corporativo', '#3b82f6'),
('650e8400-e29b-41d4-a716-446655440004', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Freelancer', '#10b981'),
('650e8400-e29b-41d4-a716-446655440005', 'b96ed1ff-3414-4f1a-9f9e-476dafe39e56', 'Recorrente', '#8b5cf6')
ON CONFLICT (id) DO NOTHING;

-- 6. Update existing contacts with realistic values and assign agents
UPDATE contacts 
SET 
    value = CASE 
        WHEN status = 'novo' THEN (RANDOM() * 5000 + 2000)::DECIMAL(10,2)
        WHEN status = 'em_andamento' THEN (RANDOM() * 8000 + 5000)::DECIMAL(10,2)
        WHEN status = 'qualificado' THEN (RANDOM() * 15000 + 10000)::DECIMAL(10,2)
        WHEN status = 'convertido' THEN (RANDOM() * 30000 + 15000)::DECIMAL(10,2)
        WHEN status = 'perdido' THEN (RANDOM() * 3000 + 1000)::DECIMAL(10,2)
        ELSE 5000.00
    END,
    agent_assigned = CASE 
        WHEN RANDOM() < 0.8 THEN -- 80% dos contatos terão agentes
            (SELECT id FROM agents WHERE user_id = contacts.user_id ORDER BY RANDOM() LIMIT 1)
        ELSE NULL
    END
WHERE value IS NULL OR value = 0;
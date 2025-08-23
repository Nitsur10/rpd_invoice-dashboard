-- SUPABASE SCHEMA FOR TWILIO ZARA MEMORY AGENT SYSTEM
-- Execute this in your Supabase SQL editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Table: wa_messages (WhatsApp inbound messages)
CREATE TABLE IF NOT EXISTS wa_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    wa_message_sid TEXT UNIQUE NOT NULL,
    wa_id TEXT NOT NULL,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    body TEXT DEFAULT '',
    media_count INTEGER DEFAULT 0,
    media_urls JSONB DEFAULT '[]',
    raw_webhook JSONB NOT NULL,
    received_at TIMESTAMPTZ NOT NULL,
    processed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: wa_responses (WhatsApp outbound responses)
CREATE TABLE IF NOT EXISTS wa_responses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    direction TEXT NOT NULL DEFAULT 'outbound',
    wa_message_sid TEXT,
    response_to_sid TEXT REFERENCES wa_messages(wa_message_sid),
    wa_id TEXT NOT NULL,
    from_number TEXT NOT NULL,
    to_number TEXT NOT NULL,
    body TEXT NOT NULL,
    response_type TEXT DEFAULT 'zara_memory_agent',
    tokens_used INTEGER DEFAULT 0,
    generated_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: client_context (Client information and RPD context)
CREATE TABLE IF NOT EXISTS client_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone TEXT UNIQUE NOT NULL,
    wa_id TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'onboarding', 'completed', 'inactive')),
    rpd_type TEXT, -- residential, commercial, industrial, mixed-use
    company_name TEXT,
    contact_person TEXT,
    preferences JSONB DEFAULT '{}',
    onboarding_completed_at TIMESTAMPTZ,
    last_interaction_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: rpd_projects (Real Property Development projects)
CREATE TABLE IF NOT EXISTS rpd_projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES client_context(id) ON DELETE CASCADE,
    project_code TEXT UNIQUE,
    project_name TEXT NOT NULL,
    project_type TEXT, -- residential, commercial, etc.
    location TEXT,
    units_count INTEGER,
    budget_range TEXT,
    status TEXT DEFAULT 'planning' CHECK (status IN ('planning', 'permits', 'construction', 'completed', 'on-hold')),
    description TEXT,
    requirements JSONB DEFAULT '{}',
    timeline JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: rpd_notes (Contextual notes and updates)
CREATE TABLE IF NOT EXISTS rpd_notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    project_id UUID REFERENCES rpd_projects(id) ON DELETE CASCADE,
    client_id UUID REFERENCES client_context(id) ON DELETE CASCADE,
    message_sid TEXT REFERENCES wa_messages(wa_message_sid),
    note_type TEXT DEFAULT 'general' CHECK (note_type IN ('general', 'update', 'requirement', 'issue', 'milestone')),
    title TEXT,
    content TEXT NOT NULL,
    extracted_entities JSONB DEFAULT '{}',
    importance TEXT DEFAULT 'medium' CHECK (importance IN ('low', 'medium', 'high', 'critical')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: memory_context (AI memory and learning data)
CREATE TABLE IF NOT EXISTS memory_context (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES client_context(id) ON DELETE CASCADE,
    session_id TEXT NOT NULL,
    memory_type TEXT DEFAULT 'conversation' CHECK (memory_type IN ('conversation', 'preference', 'process', 'knowledge')),
    content TEXT NOT NULL,
    embedding VECTOR(1536), -- For OpenAI embeddings
    metadata JSONB DEFAULT '{}',
    relevance_score FLOAT DEFAULT 0.5,
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: wa_sessions (24-hour window tracking for WhatsApp compliance)
CREATE TABLE IF NOT EXISTS wa_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wa_id TEXT NOT NULL,
    phone TEXT NOT NULL,
    session_start TIMESTAMPTZ DEFAULT NOW(),
    session_end TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    message_count INTEGER DEFAULT 0,
    last_message_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Table: whatsapp_templates (Template management)
CREATE TABLE IF NOT EXISTS whatsapp_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_name TEXT UNIQUE NOT NULL,
    template_type TEXT DEFAULT 'utility' CHECK (template_type IN ('utility', 'marketing', 'authentication')),
    language TEXT DEFAULT 'en',
    content TEXT NOT NULL,
    variables JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_wa_messages_wa_id ON wa_messages(wa_id);
CREATE INDEX IF NOT EXISTS idx_wa_messages_received_at ON wa_messages(received_at);
CREATE INDEX IF NOT EXISTS idx_wa_responses_response_to_sid ON wa_responses(response_to_sid);
CREATE INDEX IF NOT EXISTS idx_client_context_phone ON client_context(phone);
CREATE INDEX IF NOT EXISTS idx_rpd_projects_client_id ON rpd_projects(client_id);
CREATE INDEX IF NOT EXISTS idx_rpd_notes_project_id ON rpd_notes(project_id);
CREATE INDEX IF NOT EXISTS idx_memory_context_client_id ON memory_context(client_id);
CREATE INDEX IF NOT EXISTS idx_memory_context_session_id ON memory_context(session_id);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_wa_id ON wa_sessions(wa_id);
CREATE INDEX IF NOT EXISTS idx_wa_sessions_active ON wa_sessions(is_active) WHERE is_active = true;

-- Create vector similarity search index
CREATE INDEX IF NOT EXISTS idx_memory_context_embedding ON memory_context 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Row Level Security (RLS) policies
ALTER TABLE wa_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpd_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE rpd_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE memory_context ENABLE ROW LEVEL SECURITY;
ALTER TABLE wa_sessions ENABLE ROW LEVEL SECURITY;

-- Functions for memory operations (used by n8n workflow)
CREATE OR REPLACE FUNCTION get_active_session(p_wa_id TEXT)
RETURNS TABLE(
    session_id UUID,
    is_within_24h BOOLEAN,
    last_message TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ws.id,
        (NOW() - ws.last_message_at) < INTERVAL '24 hours' as is_within_24h,
        ws.last_message_at
    FROM wa_sessions ws
    WHERE ws.wa_id = p_wa_id 
      AND ws.is_active = true
    ORDER BY ws.last_message_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION create_or_update_session(p_wa_id TEXT, p_phone TEXT)
RETURNS UUID AS $$
DECLARE
    session_uuid UUID;
    existing_session RECORD;
BEGIN
    -- Check for active session within 24 hours
    SELECT * INTO existing_session
    FROM get_active_session(p_wa_id);
    
    IF existing_session.session_id IS NOT NULL AND existing_session.is_within_24h THEN
        -- Update existing session
        UPDATE wa_sessions 
        SET last_message_at = NOW(),
            message_count = message_count + 1
        WHERE id = existing_session.session_id;
        
        RETURN existing_session.session_id;
    ELSE
        -- Close old session if exists
        UPDATE wa_sessions 
        SET is_active = false, session_end = NOW()
        WHERE wa_id = p_wa_id AND is_active = true;
        
        -- Create new session
        INSERT INTO wa_sessions (wa_id, phone, message_count)
        VALUES (p_wa_id, p_phone, 1)
        RETURNING id INTO session_uuid;
        
        RETURN session_uuid;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Function to search memory context using vector similarity
CREATE OR REPLACE FUNCTION search_memory_context(
    p_client_id UUID,
    p_query_embedding VECTOR(1536),
    p_limit INTEGER DEFAULT 5
)
RETURNS TABLE(
    content TEXT,
    metadata JSONB,
    similarity FLOAT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        mc.content,
        mc.metadata,
        1 - (mc.embedding <=> p_query_embedding) as similarity
    FROM memory_context mc
    WHERE mc.client_id = p_client_id
    ORDER BY mc.embedding <=> p_query_embedding
    LIMIT p_limit;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_client_context_updated_at
    BEFORE UPDATE ON client_context
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rpd_projects_updated_at
    BEFORE UPDATE ON rpd_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing
INSERT INTO whatsapp_templates (template_name, template_type, language, content, variables) VALUES
('welcome_message', 'utility', 'en', 'Welcome to ZARA RPD Assistant! I''m here to help you with your Real Property Development needs. Reply with your project type to get started.', '[]'),
('project_status_request', 'utility', 'en', 'Hi {{client_name}}! Could you please provide an update on your {{project_type}} project? I''ll help you track the progress.', '["client_name", "project_type"]'),
('weekly_digest', 'utility', 'en', 'Weekly RPD Summary for {{project_name}}: {{summary}}. Any questions or updates?', '["project_name", "summary"]');

COMMENT ON TABLE wa_messages IS 'Stores all inbound WhatsApp messages received via Twilio';
COMMENT ON TABLE wa_responses IS 'Stores all outbound WhatsApp responses sent by ZARA';
COMMENT ON TABLE client_context IS 'Client profiles and RPD context information';
COMMENT ON TABLE rpd_projects IS 'Real Property Development project details';
COMMENT ON TABLE rpd_notes IS 'Contextual notes extracted from conversations';
COMMENT ON TABLE memory_context IS 'AI memory storage with vector embeddings';
COMMENT ON TABLE wa_sessions IS 'WhatsApp 24-hour session window tracking';
COMMENT ON TABLE whatsapp_templates IS 'Template messages for compliance';

-- Grant necessary permissions (adjust as needed for your setup)
-- GRANT ALL ON ALL TABLES IN SCHEMA public TO your_n8n_user;
-- GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO your_n8n_user;
-- GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO your_n8n_user;
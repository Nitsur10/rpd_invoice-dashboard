-- SUPABASE ZARA SCHEMA DEPLOYMENT
-- Copy and paste this entire script into your Supabase SQL Editor

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

-- Functions for memory operations
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

-- Success message
DO $$
BEGIN
    RAISE NOTICE '✅ ZARA Schema deployed successfully! Tables created: wa_messages, wa_responses, client_context, rpd_projects, rpd_notes, memory_context, wa_sessions';
END $$;
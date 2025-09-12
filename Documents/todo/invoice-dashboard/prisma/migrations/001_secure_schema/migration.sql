-- Enable PostgreSQL extensions for enhanced security
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";

-- Create custom types
CREATE TYPE user_role AS ENUM ('ADMIN', 'EMPLOYEE', 'CLIENT', 'VIEWER');
CREATE TYPE payment_status AS ENUM ('PENDING', 'PROCESSING', 'PAID', 'OVERDUE', 'CANCELLED', 'DISPUTED');
CREATE TYPE import_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIALLY_FAILED');

-- Create encryption function for sensitive data
CREATE OR REPLACE FUNCTION encrypt_sensitive(data text, key text)
RETURNS bytea AS $$
BEGIN
  RETURN pgp_sym_encrypt(data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION decrypt_sensitive(data bytea, key text)
RETURNS text AS $$
BEGIN
  RETURN pgp_sym_decrypt(data, key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Users table with enhanced security
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL, -- bcrypt hash
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  role user_role DEFAULT 'EMPLOYEE',
  is_active BOOLEAN DEFAULT true,
  mfa_secret TEXT, -- Encrypted TOTP secret
  failed_login_attempts INT DEFAULT 0,
  locked_until TIMESTAMP,
  password_changed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Constraints
  CONSTRAINT email_format CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_active ON users(is_active);

-- Sessions table with expiry
CREATE TABLE sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(512) UNIQUE NOT NULL,
  ip_address INET,
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

CREATE INDEX idx_sessions_user_id ON sessions(user_id);
CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_expires ON sessions(expires_at);

-- Main invoices table with partitioning support
CREATE TABLE invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email_id VARCHAR(512) UNIQUE NOT NULL,
  subject TEXT NOT NULL,
  from_email VARCHAR(255),
  from_name VARCHAR(255),
  received_date TIMESTAMP NOT NULL,
  category VARCHAR(100) NOT NULL,
  invoice_number VARCHAR(100) NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount >= 0),
  vendor VARCHAR(255) NOT NULL,
  due_date TIMESTAMP,
  onedrive_link TEXT,
  xero_link TEXT,
  processing_status VARCHAR(50) NOT NULL,
  processed_at TIMESTAMP NOT NULL,
  
  -- Source tracking
  source_tab VARCHAR(50) NOT NULL,
  source_workflow_id VARCHAR(100),
  import_batch_id UUID,
  
  -- Payment tracking
  payment_status payment_status DEFAULT 'PENDING',
  payment_date TIMESTAMP,
  payment_method VARCHAR(50),
  transaction_id VARCHAR(100),
  payment_notes TEXT,
  confirmed_by UUID REFERENCES users(id),
  
  -- Metadata
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_synced_at TIMESTAMP,
  
  -- Row-level security
  row_owner UUID REFERENCES users(id),
  
  -- Constraints
  CONSTRAINT valid_dates CHECK (due_date IS NULL OR due_date >= received_date),
  CONSTRAINT valid_payment CHECK (
    (payment_status = 'PAID' AND payment_date IS NOT NULL) OR
    (payment_status != 'PAID')
  )
) PARTITION BY RANGE (received_date);

-- Create partitions for invoices (monthly)
CREATE TABLE invoices_2024_01 PARTITION OF invoices
  FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');
  
CREATE TABLE invoices_2024_02 PARTITION OF invoices
  FOR VALUES FROM ('2024-02-01') TO ('2024-03-01');
  
-- Continue creating partitions as needed...

-- Create indexes on invoices
CREATE INDEX idx_invoices_email_id ON invoices(email_id);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_vendor ON invoices(vendor);
CREATE INDEX idx_invoices_payment_status ON invoices(payment_status);
CREATE INDEX idx_invoices_source_tab ON invoices(source_tab);
CREATE INDEX idx_invoices_received_date ON invoices(received_date);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_amount ON invoices(amount);

-- Payment updates audit table
CREATE TABLE payment_updates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(50) NOT NULL,
  previous_value JSONB,
  new_value JSONB NOT NULL,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_updates_invoice ON payment_updates(invoice_id);
CREATE INDEX idx_payment_updates_user ON payment_updates(user_id);
CREATE INDEX idx_payment_updates_created ON payment_updates(created_at);

-- Comprehensive audit log
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID NOT NULL,
  action VARCHAR(20) NOT NULL,
  user_id UUID REFERENCES users(id),
  changes JSONB NOT NULL,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);
CREATE INDEX idx_audit_action ON audit_logs(action);

-- Import batch tracking
CREATE TABLE import_batches (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_tab VARCHAR(50) NOT NULL,
  workflow_id VARCHAR(100) NOT NULL,
  total_records INT NOT NULL CHECK (total_records >= 0),
  success_count INT NOT NULL DEFAULT 0 CHECK (success_count >= 0),
  failure_count INT NOT NULL DEFAULT 0 CHECK (failure_count >= 0),
  status import_status NOT NULL DEFAULT 'PENDING',
  started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completed_at TIMESTAMP,
  error_log JSONB,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT valid_counts CHECK (success_count + failure_count <= total_records)
);

CREATE INDEX idx_import_source ON import_batches(source_tab);
CREATE INDEX idx_import_status ON import_batches(status);
CREATE INDEX idx_import_created ON import_batches(created_at);

-- Sync configuration
CREATE TABLE sync_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  source_tab VARCHAR(50) UNIQUE NOT NULL,
  excel_file_url TEXT,
  sheet_name VARCHAR(100) NOT NULL,
  sync_interval INT DEFAULT 900 CHECK (sync_interval >= 60),
  is_active BOOLEAN DEFAULT true,
  last_sync_at TIMESTAMP,
  last_sync_status VARCHAR(50),
  mapping JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_sync_active ON sync_configs(is_active);
CREATE INDEX idx_sync_tab ON sync_configs(source_tab);

-- Client access configuration
CREATE TABLE client_access (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  client_name VARCHAR(255) NOT NULL,
  client_email VARCHAR(255) UNIQUE NOT NULL,
  vendor_filter TEXT[], -- Array of vendor names
  is_active BOOLEAN DEFAULT true,
  access_token VARCHAR(512) UNIQUE,
  last_login_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  CONSTRAINT email_format CHECK (client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

CREATE INDEX idx_client_email ON client_access(client_email);
CREATE INDEX idx_client_token ON client_access(access_token);
CREATE INDEX idx_client_active ON client_access(is_active);

-- Create materialized view for dashboard performance
CREATE MATERIALIZED VIEW invoice_summary AS
SELECT
  DATE_TRUNC('month', received_date) as month,
  source_tab,
  vendor,
  payment_status,
  COUNT(*) as invoice_count,
  SUM(amount) as total_amount,
  AVG(amount) as avg_amount,
  MIN(amount) as min_amount,
  MAX(amount) as max_amount,
  COUNT(CASE WHEN payment_status = 'PAID' THEN 1 END) as paid_count,
  COUNT(CASE WHEN payment_status = 'OVERDUE' THEN 1 END) as overdue_count
FROM invoices
GROUP BY DATE_TRUNC('month', received_date), source_tab, vendor, payment_status;

CREATE INDEX idx_invoice_summary_month ON invoice_summary(month);
CREATE INDEX idx_invoice_summary_vendor ON invoice_summary(vendor);

-- Row Level Security Policies
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

-- Policy for admins (see all)
CREATE POLICY admin_all ON invoices
  FOR ALL
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = current_setting('app.current_user_id')::UUID
      AND users.role = 'ADMIN'
    )
  );

-- Policy for employees (see all, update payment status)
CREATE POLICY employee_view ON invoices
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = current_setting('app.current_user_id')::UUID
      AND users.role IN ('EMPLOYEE', 'ADMIN')
    )
  );

-- Policy for clients (see only their vendors)
CREATE POLICY client_view ON invoices
  FOR SELECT
  TO PUBLIC
  USING (
    EXISTS (
      SELECT 1 FROM client_access ca
      JOIN users u ON u.email = ca.client_email
      WHERE u.id = current_setting('app.current_user_id')::UUID
      AND invoices.vendor = ANY(ca.vendor_filter)
    )
  );

-- Trigger for updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sync_configs_updated_at BEFORE UPDATE ON sync_configs
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_access_updated_at BEFORE UPDATE ON client_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Audit trigger function
CREATE OR REPLACE FUNCTION audit_trigger_function()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO audit_logs (
    entity_type,
    entity_id,
    action,
    user_id,
    changes,
    ip_address,
    user_agent
  ) VALUES (
    TG_TABLE_NAME,
    CASE 
      WHEN TG_OP = 'DELETE' THEN OLD.id
      ELSE NEW.id
    END,
    TG_OP,
    current_setting('app.current_user_id', true)::UUID,
    jsonb_build_object(
      'old', to_jsonb(OLD),
      'new', to_jsonb(NEW)
    ),
    inet_client_addr(),
    current_setting('app.user_agent', true)
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply audit triggers
CREATE TRIGGER audit_invoices AFTER INSERT OR UPDATE OR DELETE ON invoices
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

CREATE TRIGGER audit_payment_updates AFTER INSERT ON payment_updates
  FOR EACH ROW EXECUTE FUNCTION audit_trigger_function();

-- Performance monitoring views
CREATE VIEW database_stats AS
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
  n_live_tup AS row_count,
  n_dead_tup AS dead_rows,
  last_autovacuum
FROM pg_stat_user_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Grants for application user
GRANT USAGE ON SCHEMA public TO invoice_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO invoice_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO invoice_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO invoice_app;

-- Create read-only user for reporting
CREATE USER invoice_readonly WITH PASSWORD 'readonly_password';
GRANT CONNECT ON DATABASE invoice_db TO invoice_readonly;
GRANT USAGE ON SCHEMA public TO invoice_readonly;
GRANT SELECT ON ALL TABLES IN SCHEMA public TO invoice_readonly;
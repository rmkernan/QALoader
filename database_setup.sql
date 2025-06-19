-- QALoader Authentication Tables Setup
-- Run this SQL in your Supabase SQL editor
-- Created: June 16, 2025

-- Drop tables if they exist (for clean setup)
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    is_test_user BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create password reset tokens table
CREATE TABLE password_reset_tokens (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    used BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE password_reset_tokens ENABLE ROW LEVEL SECURITY;

-- Create policies for service role access (adjust as needed)
CREATE POLICY "Service role can manage users" ON users
    FOR ALL USING (true);

CREATE POLICY "Service role can manage tokens" ON password_reset_tokens
    FOR ALL USING (true);

-- Insert test users
-- Password for all test users: 12345678aA1
-- Hash: $2b$12$TYV20m/shDulqFMnp7k46O5TUb5fOEGdg9LoUwSsJGE3vfrU.KtqO
INSERT INTO users (email, username, full_name, password_hash, is_test_user) VALUES
    ('testuser1@dev.com', 'testuser1', 'Test User One', '$2b$12$TYV20m/shDulqFMnp7k46O5TUb5fOEGdg9LoUwSsJGE3vfrU.KtqO', true),
    ('testuser2@dev.com', 'testuser2', 'Test User Two', '$2b$12$TYV20m/shDulqFMnp7k46O5TUb5fOEGdg9LoUwSsJGE3vfrU.KtqO', true),
    ('testuser3@dev.com', 'testuser3', 'Test User Three', '$2b$12$TYV20m/shDulqFMnp7k46O5TUb5fOEGdg9LoUwSsJGE3vfrU.KtqO', true);

-- Insert the existing admin user (optional - remove if not needed)
-- You'll need to generate a proper password hash for the admin
-- For now, using the same password as test users for consistency
INSERT INTO users (email, username, full_name, password_hash, is_test_user) VALUES
    ('admin@qaloader.com', 'admin', 'System Administrator', '$2b$12$TYV20m/shDulqFMnp7k46O5TUb5fOEGdg9LoUwSsJGE3vfrU.KtqO', false);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers to auto-update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Verify the setup
SELECT 
    username, 
    email, 
    full_name, 
    is_test_user,
    created_at
FROM users 
ORDER BY is_test_user DESC, username;

-- Display table structure
-- \d users;
-- \d password_reset_tokens;
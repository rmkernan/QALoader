# Dev Mode Refactoring & Test User Implementation Plan
**Agent 2 - June 16, 2025. 8:20 PM Eastern Time**

## Overview
Complete refactoring of dev mode to implement a test user selection system with proper authentication.

## Current State Analysis
- **Auth System**: Basic JWT with hardcoded admin user only
- **No Supabase Auth**: Using custom backend authentication
- **No User Tables**: Database only has `all_questions` table
- **No Registration**: Login-only system
- **Dev Mode**: Exists in some files but "Enter as Developer" button not implemented

## Phase 1: Database Setup (Priority: Critical)
### 1.1 Create Users Table
```sql
-- Create users table in Supabase
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    full_name VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create index for faster lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- Row Level Security (if needed)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
```

### 1.2 Insert Test Users
```sql
-- NOTE: These are bcrypt hashes for password "12345678aA1"
-- You'll need to generate the actual hash using Python bcrypt
INSERT INTO users (email, username, full_name, password_hash) VALUES
('testuser1@dev.com', 'testuser1', 'Test User One', '$2b$12$[HASH_HERE]'),
('testuser2@dev.com', 'testuser2', 'Test User Two', '$2b$12$[HASH_HERE]'),
('testuser3@dev.com', 'testuser3', 'Test User Three', '$2b$12$[HASH_HERE]');
```

## Phase 2: Backend Authentication Updates (Priority: Critical)
### 2.1 Update auth_service.py
- Remove hardcoded admin user
- Implement database user lookup
- Add password hashing with bcrypt
- Support email-based login

### 2.2 Update auth router
- Modify login endpoint to query users table
- Add user info to JWT token
- Return user profile data

### 2.3 Add User Registration Endpoint
- Create `/api/register` endpoint
- Validate email format
- Hash passwords before storage
- Create user profile

## Phase 3: Frontend Test User Selector (Priority: High)
### 3.1 Create Test User Toggle
- Add "Enable Test Users" toggle to login page
- Only show in development environment
- Store preference in localStorage

### 3.2 Create Test User Dropdown
- Dropdown with 3 test users
- Auto-fill email and password fields
- Quick login functionality

### 3.3 Update LoginView Component
- Add test user UI elements
- Connect to existing login flow
- Maintain current styling

## Phase 4: Remove Old Dev Mode (Priority: High)
### 4.1 Delete Legacy Files
- Remove `/lib/devMode.ts` (if exists in ClickablePrototype)
- Remove any mock data files

### 4.2 Clean API Routes
- Remove all devMode imports
- Remove AUTH_BYPASS_WITH_DB_WRITES logic
- Update error handling

### 4.3 Update Environment Variables
- Remove NEXT_PUBLIC_DEV_MODE
- Remove NEXT_PUBLIC_DEV_DB_WRITES
- Update .env.example

## Phase 5: Additional Features (Priority: Medium)
### 5.1 Password Reset Implementation
- Create password reset endpoint
- Generate reset tokens
- Email integration (or simple token display)

### 5.2 User Profile Management
- Display logged-in user info
- Update profile endpoint
- Session management improvements

## Phase 6: Testing & Documentation (Priority: Medium)
### 6.1 Test All Auth Flows
- Test user login
- Test user registration
- Test password reset
- Verify JWT tokens work

### 6.2 Update Documentation
- Remove dev mode references
- Document test users
- Update setup instructions

## Implementation Order
1. **Phase 1 & 2**: Database and backend (must be done together)
2. **Phase 3**: Frontend test user selector
3. **Phase 4**: Clean up old dev mode
4. **Phase 5**: Additional features (if context allows)
5. **Phase 6**: Testing and docs

## Files to Modify (Key List)
1. `backend/app/services/auth_service.py` - Core auth logic
2. `backend/app/api/auth.py` - Auth endpoints
3. `src/components/LoginView.tsx` - Add test user UI
4. `src/contexts/AppContext.tsx` - Update auth state
5. Various API routes - Remove dev mode references

## SQL Helper Script
```python
# generate_password_hash.py
import bcrypt

password = "12345678aA1"
salt = bcrypt.gensalt()
hash = bcrypt.hashpw(password.encode('utf-8'), salt)
print(f"Password hash: {hash.decode('utf-8')}")
```

## Notes
- Passwords should NEVER be stored in plaintext
- Use bcrypt for password hashing
- Test users should only be available in dev environment
- Maintain backward compatibility during transition
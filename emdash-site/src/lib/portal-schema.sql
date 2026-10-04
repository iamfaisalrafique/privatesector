-- ==============================================================================
-- Application Schema: Portal Authentication, Sessions, & Rate Limiting
-- Target: PostgreSQL 14+ (production and staging)
-- ==============================================================================

-- 1. Portal User Sessions
CREATE TABLE IF NOT EXISTS portal_sessions (
    session_id VARCHAR(64) PRIMARY KEY, -- SHA-256 hash of raw session token
    user_id VARCHAR(64) NOT NULL,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(32) NOT NULL,
    name VARCHAR(255),
    profile_id VARCHAR(64),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS idx_portal_sessions_email ON portal_sessions(email);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_expires_revoked ON portal_sessions(expires_at, revoked);

-- 2. Granular Rate Limiting (IP+Account, Per-IP Cap, and Per-Account Global Cap)
CREATE TABLE IF NOT EXISTS portal_login_attempts (
    lockout_key VARCHAR(128) PRIMARY KEY,
    attempts INTEGER NOT NULL DEFAULT 0,
    locked_until BIGINT NOT NULL DEFAULT 0,
    action_required VARCHAR(32) NOT NULL DEFAULT 'none', -- 'none', 'lockout', 'force_reset'
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Password Reset Tokens (Tokens Stored as SHA-256 Hashes)
CREATE TABLE IF NOT EXISTS portal_password_resets (
    token_hash VARCHAR(64) PRIMARY KEY, -- SHA-256 hash of raw reset token
    email VARCHAR(255) NOT NULL,
    expires_at BIGINT NOT NULL,
    consumed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_portal_password_resets_email ON portal_password_resets(email);

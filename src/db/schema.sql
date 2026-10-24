-- ============================================================================
-- DRIVER PING - Supabase PostgreSQL Database Schema
-- Production-ready schema for anonymous driver notification system
-- ============================================================================

-- Enable pgcrypto / uuid-ossp if available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USERS TABLE
-- Tracks road users with phone or email-based authentication, subscription tier, and SMS settings
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255),
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'paid_owner')),
    sms_opt_in BOOLEAN NOT NULL DEFAULT false,
    sms_monthly_cap_pence INTEGER NOT NULL DEFAULT 500, -- £5.00 / R50.00 default cap
    sms_current_spend_pence INTEGER NOT NULL DEFAULT 0,
    default_plate VARCHAR(50),
    default_province_code VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);

-- 2. OTP AUTHENTICATION CODES
-- Temporary one-time security codes for phone/email login/registration
CREATE TABLE IF NOT EXISTS otps (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    phone VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_otps_phone_code ON otps(phone, code);

-- 3. VEHICLES TABLE
-- Vehicle registry with standardized normalized license plates
CREATE TABLE IF NOT EXISTS vehicles (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    plate_normalized VARCHAR(20) NOT NULL UNIQUE, -- E.g. 'CK45DFGP' (no spaces, uppercase)
    plate_display VARCHAR(30) NOT NULL,          -- E.g. 'CK 45 DF GP'
    make VARCHAR(50),
    model VARCHAR(50),
    color VARCHAR(30),
    verified_owner_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_norm ON vehicles(plate_normalized);

-- 4. VEHICLE DRIVERS TABLE
-- Relationship between users and vehicles (drivers and verified owners)
CREATE TABLE IF NOT EXISTS vehicle_drivers (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'driver' CHECK (role IN ('driver', 'owner')),
    status VARCHAR(30) NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'pending_owner_approval', 'rejected')),
    requested_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    UNIQUE (vehicle_id, user_id)
);
CREATE INDEX IF NOT EXISTS idx_vehicle_drivers_user ON vehicle_drivers(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_drivers_vehicle ON vehicle_drivers(vehicle_id);

-- 5. TRUSTED CONTACTS TABLE
-- Secondary emergency or alert contacts added by verified owners with explicit consent
CREATE TABLE IF NOT EXISTS trusted_contacts (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(255) NOT NULL,
    relationship VARCHAR(50) NOT NULL, -- e.g. 'Spouse', 'Fleet Manager', 'Parent'
    consent_given BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_trusted_contacts_vehicle ON trusted_contacts(vehicle_id);

-- 6. OWNERSHIP VERIFICATIONS TABLE
-- Document submissions for paid plan users claiming verified ownership
CREATE TABLE IF NOT EXISTS ownership_verifications (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    vehicle_id TEXT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_name VARCHAR(255) NOT NULL,
    document_type VARCHAR(50) NOT NULL, -- e.g. 'v5c_logbook', 'title_certificate', 'bill_of_sale'
    document_url TEXT NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    admin_notes TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    reviewed_by_id TEXT REFERENCES users(id) ON DELETE SET NULL
);
CREATE INDEX IF NOT EXISTS idx_ownership_verifications_status ON ownership_verifications(status);

-- 7. REPORTS TABLE
-- Anonymous observations submitted by registered users
-- CRITICAL PRIVACY: reporter_id is strictly restricted to server security audit logs; NEVER exposed in alert responses
CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    idempotency_key VARCHAR(100) UNIQUE,
    plate_normalized VARCHAR(20) NOT NULL,
    category VARCHAR(30) NOT NULL CHECK (category IN ('vehicle_condition', 'driver_behaviour', 'road_violation')),
    issue_code VARCHAR(50) NOT NULL,
    issue_title VARCHAR(150) NOT NULL,
    custom_note TEXT,
    photo_url TEXT,
    reporter_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(30) NOT NULL DEFAULT 'received' CHECK (status IN ('received', 'needs_review', 'resolved', 'disputed', 'flagged_abuse', 'dismissed')),
    dispute_reason TEXT,
    abuse_reason TEXT,
    recipient_action_note TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_reports_plate ON reports(plate_normalized);
CREATE INDEX IF NOT EXISTS idx_reports_created ON reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_reporter ON reports(reporter_id);

-- 8. DELIVERY LOGS TABLE
-- Ensures the rule: "Never say an alert was delivered unless the system actually recorded that it was"
CREATE TABLE IF NOT EXISTS delivery_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    report_id TEXT NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    channel VARCHAR(20) NOT NULL CHECK (channel IN ('in_app', 'sms')),
    recipient_user_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(30) NOT NULL CHECK (status IN ('delivered', 'queued_unclaimed', 'failed', 'capped_limit')),
    cost_pence INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_report ON delivery_logs(report_id);
CREATE INDEX IF NOT EXISTS idx_delivery_logs_recipient ON delivery_logs(recipient_user_id);

-- 9. AUDIT LOGS TABLE
-- Immutable security audit log for sensitive operations (approvals, bans, disputes, rate limits)
CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
    actor_id TEXT REFERENCES users(id) ON DELETE SET NULL,
    action_type VARCHAR(60) NOT NULL,
    target_id VARCHAR(100),
    target_type VARCHAR(50),
    details_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

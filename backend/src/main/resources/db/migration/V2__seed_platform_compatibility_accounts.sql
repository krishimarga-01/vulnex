-- ============================================================================
-- Migration: V2__seed_platform_compatibility_accounts.sql
-- Description: Idempotently seeds standard frontend credentials for live testing
--              (Authority Dashboard & Mobile Application Presets).
-- Compatible with PostgreSQL 16 & existing UUID schema.
-- ============================================================================

INSERT INTO users (user_id, full_name, email, phone_number, password_hash, account_status)
VALUES
('10000000-0000-0000-0000-000000000091', 'Rajesh Sharma (Disaster Commissioner)', 'officer.raj@disasterresponse.gov', '+91-9800000091', '$2a$10$VsoU7Uoasmo4yGBp6NQcpuNtjcXV6/YFwlQ99CI04JDnRd9VBE.kC', 'ACTIVE'),
('10000000-0000-0000-0000-000000000092', 'Central Disaster Admin', 'admin@disasterresponse.gov', '+91-9800000092', '$2a$10$VsoU7Uoasmo4yGBp6NQcpuNtjcXV6/YFwlQ99CI04JDnRd9VBE.kC', 'ACTIVE'),
('10000000-0000-0000-0000-000000000093', 'John Doe (Citizen)', 'john.citizen@example.com', '+91-9800000093', '$2a$10$VsoU7Uoasmo4yGBp6NQcpuNtjcXV6/YFwlQ99CI04JDnRd9VBE.kC', 'ACTIVE'),
('10000000-0000-0000-0000-000000000094', 'Mary Johnson (Caregiver)', 'mary.caregiver@example.com', '+91-9800000094', '$2a$10$VsoU7Uoasmo4yGBp6NQcpuNtjcXV6/YFwlQ99CI04JDnRd9VBE.kC', 'ACTIVE'),
('10000000-0000-0000-0000-000000000095', 'Sarah Connor (Volunteer)', 'sarah.volunteer@example.com', '+91-9800000095', '$2a$10$VsoU7Uoasmo4yGBp6NQcpuNtjcXV6/YFwlQ99CI04JDnRd9VBE.kC', 'ACTIVE')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- Link User Roles
INSERT INTO user_roles (user_id, role_id)
VALUES
('10000000-0000-0000-0000-000000000091', 'a0000000-0000-0000-0000-000000000004'), -- AUTHORITY
('10000000-0000-0000-0000-000000000092', 'a0000000-0000-0000-0000-000000000005'), -- ADMIN
('10000000-0000-0000-0000-000000000093', 'a0000000-0000-0000-0000-000000000001'), -- CITIZEN
('10000000-0000-0000-0000-000000000094', 'a0000000-0000-0000-0000-000000000002'), -- CAREGIVER
('10000000-0000-0000-0000-000000000095', 'a0000000-0000-0000-0000-000000000003')  -- VOLUNTEER
ON CONFLICT (user_id, role_id) DO NOTHING;
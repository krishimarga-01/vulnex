-- ============================================================================
-- Migration: V8__create_notification_management.sql
-- Description: Multi-channel notifications, device tokens, recipients, and delivery logs
-- Author: Senior Database Architect
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Table: device_tokens
-- ----------------------------------------------------------------------------
CREATE TABLE device_tokens (
    token_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    fcm_token VARCHAR(500) NOT NULL,
    device_os VARCHAR(20) NOT NULL,
    app_version VARCHAR(30),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    last_seen_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_device_fcm_token UNIQUE (fcm_token),
    CONSTRAINT chk_device_os CHECK (device_os IN ('ANDROID', 'IOS', 'WEB'))
);

COMMENT ON TABLE device_tokens IS 'Registered Expo and FCM push notification tokens for mobile and web clients';

-- ----------------------------------------------------------------------------
-- 2. Table: notifications
-- ----------------------------------------------------------------------------
CREATE TABLE notifications (
    notification_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    payload JSONB,
    related_weather_alert_id UUID REFERENCES weather_alerts(alert_id) ON DELETE SET NULL,
    related_case_id UUID REFERENCES emergency_cases(case_id) ON DELETE SET NULL,
    created_by_user_id UUID REFERENCES users(user_id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_notification_type CHECK (
        notification_type IN (
            'PUSH',
            'SMS',
            'EMERGENCY_ALERT',
            'WEATHER_WARNING',
            'CASE_STATUS_UPDATE'
        )
    )
);

COMMENT ON TABLE notifications IS 'Parent broadcast intents and targeted notification payloads';

-- ----------------------------------------------------------------------------
-- 3. Table: notification_recipients
-- ----------------------------------------------------------------------------
CREATE TABLE notification_recipients (
    recipient_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    notification_id UUID NOT NULL REFERENCES notifications(notification_id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    phone_number VARCHAR(20),
    target_channel VARCHAR(20) NOT NULL,
    delivery_status VARCHAR(30) NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    read_at TIMESTAMPTZ,
    failure_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_notif_user_channel UNIQUE (notification_id, user_id, target_channel),
    CONSTRAINT chk_target_channel CHECK (target_channel IN ('PUSH', 'SMS', 'IN_APP')),
    CONSTRAINT chk_delivery_status CHECK (
        delivery_status IN (
            'PENDING',
            'SENT',
            'DELIVERED',
            'FAILED',
            'BOUNCED'
        )
    )
);

COMMENT ON TABLE notification_recipients IS 'Recipient dispatch status per channel with strict provider verification states';

-- ----------------------------------------------------------------------------
-- 4. Table: notification_delivery_logs
-- ----------------------------------------------------------------------------
CREATE TABLE notification_delivery_logs (
    log_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipient_id UUID NOT NULL REFERENCES notification_recipients(recipient_id) ON DELETE CASCADE,
    provider_name VARCHAR(50) NOT NULL,
    provider_message_id VARCHAR(150),
    event_type VARCHAR(50) NOT NULL,
    provider_response_code VARCHAR(50),
    provider_raw_response JSONB,
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_provider_event CHECK (
        event_type IN (
            'SENT',
            'ACKNOWLEDGED',
            'DELIVERED',
            'DELIVERY_FAILED'
        )
    )
);

COMMENT ON TABLE notification_delivery_logs IS 'Immutable provider callback receipts validating genuine SMS/Push delivery';

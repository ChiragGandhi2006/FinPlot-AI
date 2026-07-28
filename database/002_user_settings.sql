-- Migration: 002_user_settings
-- Description: Per-user preferences, financial profile, and configuration
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS user_settings (
    id                      BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id                 BIGINT UNSIGNED NOT NULL UNIQUE,
    currency                CHAR(3)         NOT NULL DEFAULT 'INR',
    locale                  VARCHAR(10)     NOT NULL DEFAULT 'en_IN',
    timezone                VARCHAR(50)     NOT NULL DEFAULT 'Asia/Kolkata',
    fiscal_year_start       TINYINT UNSIGNED NOT NULL DEFAULT 4,
    monthly_budget_limit    DECIMAL(15, 2)  NULL,
    theme                   VARCHAR(20)     NOT NULL DEFAULT 'light',
    email_notifications     BOOLEAN         NOT NULL DEFAULT TRUE,
    sms_notifications       BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at              DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_settings_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_user_settings_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
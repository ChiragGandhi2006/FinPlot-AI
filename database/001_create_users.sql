-- Migration: 001_create_users
-- Description: Core users table with authentication and profile fields

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email           VARCHAR(255)    NOT NULL UNIQUE,
    phone           VARCHAR(20)     NULL UNIQUE,
    password_hash   VARCHAR(255)    NOT NULL,
    full_name       VARCHAR(150)    NOT NULL,
    avatar_url      VARCHAR(500)    NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    is_verified     BOOLEAN         NOT NULL DEFAULT FALSE,
    email_verified_at DATETIME      NULL,
    last_login_at   DATETIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_users_email (email),
    INDEX idx_users_phone (phone),
    INDEX idx_users_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Migration: 003_income
-- Description: Income sources and income records
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS income_sources (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    description     TEXT            NULL,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_income_sources_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_income_sources_user (user_id),
    INDEX idx_income_sources_active (user_id, is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS income_records (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    source_id       BIGINT UNSIGNED NULL,
    amount          DECIMAL(15, 2)  NOT NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'INR',
    income_date     DATE            NOT NULL,
    description     TEXT            NULL,
    is_recurring    BOOLEAN         NOT NULL DEFAULT FALSE,
    recurring_freq  ENUM('daily','weekly','monthly','yearly') NULL,
    notes           TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_income_records_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_income_records_source
        FOREIGN KEY (source_id) REFERENCES income_sources(id)
        ON DELETE SET NULL,

    INDEX idx_income_records_user (user_id),
    INDEX idx_income_records_date (user_id, income_date),
    INDEX idx_income_records_source (source_id),
    INDEX idx_income_records_recurring (user_id, is_recurring)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
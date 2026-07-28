-- Migration: 006_goals
-- Description: Financial goal setting and tracking
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS financial_goals (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(200)    NOT NULL,
    description     TEXT            NULL,
    target_amount   DECIMAL(15, 2)  NOT NULL,
    current_amount  DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    currency        CHAR(3)         NOT NULL DEFAULT 'INR',
    goal_type       ENUM('emergency_fund','savings','investment','debt_repayment','travel','purchase','other') NOT NULL DEFAULT 'savings',
    target_date     DATE            NULL,
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    notes           TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_financial_goals_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_financial_goals_user (user_id),
    INDEX idx_financial_goals_active (user_id, is_active),
    INDEX idx_financial_goals_type (user_id, goal_type),
    INDEX idx_financial_goals_target (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
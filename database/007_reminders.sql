-- Migration: 007_reminders
-- Description: Bill reminders, payment alerts, and scheduled notifications
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS reminders (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NULL,
    amount          DECIMAL(15, 2)  NULL,
    currency        CHAR(3)         NULL DEFAULT 'INR',
    reminder_type   ENUM('bill','payment','subscription','investment','goal','general') NOT NULL DEFAULT 'general',
    due_date        DATE            NOT NULL,
    remind_before   INT             NOT NULL DEFAULT 1,
    remind_unit     ENUM('days','hours') NOT NULL DEFAULT 'days',
    is_recurring    BOOLEAN         NOT NULL DEFAULT FALSE,
    recurring_freq  ENUM('daily','weekly','monthly','yearly') NULL,
    is_completed    BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    notified_at     DATETIME        NULL,
    notes           TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_reminders_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_reminders_user (user_id),
    INDEX idx_reminders_due (user_id, due_date),
    INDEX idx_reminders_type (user_id, reminder_type),
    INDEX idx_reminders_active (user_id, is_active),
    INDEX idx_reminders_completed (user_id, is_completed)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
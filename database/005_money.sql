-- Migration: 005_money
-- Description: Money lending and borrowing tracking
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS money_lent (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    borrower_name   VARCHAR(150)    NOT NULL,
    amount          DECIMAL(15, 2)  NOT NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'INR',
    interest_rate   DECIMAL(5, 2)   NULL DEFAULT 0.00,
    lent_date       DATE            NOT NULL,
    due_date        DATE            NULL,
    repaid_amount   DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    status          ENUM('active','settled','defaulted') NOT NULL DEFAULT 'active',
    notes           TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_money_lent_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_money_lent_user (user_id),
    INDEX idx_money_lent_status (user_id, status),
    INDEX idx_money_lent_due (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS money_borrowed (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    lender_name     VARCHAR(150)    NOT NULL,
    amount          DECIMAL(15, 2)  NOT NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'INR',
    interest_rate   DECIMAL(5, 2)   NULL DEFAULT 0.00,
    borrowed_date   DATE            NOT NULL,
    due_date        DATE            NULL,
    repaid_amount   DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    status          ENUM('active','settled','defaulted') NOT NULL DEFAULT 'active',
    notes           TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_money_borrowed_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_money_borrowed_user (user_id),
    INDEX idx_money_borrowed_status (user_id, status),
    INDEX idx_money_borrowed_due (due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
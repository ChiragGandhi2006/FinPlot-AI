-- Migration: 004_expenses
-- Description: Expense categories and expense tracking records
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS expense_categories (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    name            VARCHAR(150)    NOT NULL,
    icon            VARCHAR(50)     NULL,
    color           VARCHAR(7)      NULL,
    monthly_budget  DECIMAL(15, 2)  NULL,
    is_system       BOOLEAN         NOT NULL DEFAULT FALSE,
    is_active       BOOLEAN         NOT NULL DEFAULT TRUE,
    parent_id       BIGINT UNSIGNED NULL,
    sort_order      INT             NOT NULL DEFAULT 0,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_expense_categories_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_expense_categories_parent
        FOREIGN KEY (parent_id) REFERENCES expense_categories(id)
        ON DELETE SET NULL,

    INDEX idx_expense_categories_user (user_id),
    INDEX idx_expense_categories_active (user_id, is_active),
    INDEX idx_expense_categories_parent (parent_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS expenses (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    category_id     BIGINT UNSIGNED NULL,
    amount          DECIMAL(15, 2)  NOT NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'INR',
    expense_date    DATE            NOT NULL,
    description     VARCHAR(500)    NULL,
    merchant        VARCHAR(200)    NULL,
    payment_method  ENUM('cash','credit_card','debit_card','upi','net_banking','wallet','other') NULL,
    is_recurring    BOOLEAN         NOT NULL DEFAULT FALSE,
    recurring_freq  ENUM('daily','weekly','monthly','yearly') NULL,
    receipt_url     VARCHAR(500)    NULL,
    is_tax_related  BOOLEAN         NOT NULL DEFAULT FALSE,
    tax_category    VARCHAR(100)    NULL,
    notes           TEXT            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_expenses_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_expenses_category
        FOREIGN KEY (category_id) REFERENCES expense_categories(id)
        ON DELETE SET NULL,

    INDEX idx_expenses_user (user_id),
    INDEX idx_expenses_date (user_id, expense_date),
    INDEX idx_expenses_category (category_id),
    INDEX idx_expenses_merchant (merchant),
    INDEX idx_expenses_payment_method (payment_method),
    INDEX idx_expenses_tax (user_id, is_tax_related),
    INDEX idx_expenses_recurring (user_id, is_recurring),
    INDEX idx_expenses_date_range (expense_date, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
-- Migration: 008_reports
-- Description: Monthly financial report snapshots
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS monthly_reports (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    year            SMALLINT UNSIGNED NOT NULL,
    month           TINYINT UNSIGNED NOT NULL,
    total_income    DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    total_expenses  DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    net_savings     DECIMAL(15, 2)  NOT NULL DEFAULT 0.00,
    top_category    VARCHAR(150)    NULL,
    top_category_amount DECIMAL(15, 2) NULL,
    currency        CHAR(3)         NOT NULL DEFAULT 'INR',
    is_auto_generated BOOLEAN       NOT NULL DEFAULT TRUE,
    summary_text    TEXT            NULL,
    generated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_monthly_reports_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    UNIQUE INDEX idx_monthly_reports_unique (user_id, year, month),
    INDEX idx_monthly_reports_user (user_id),
    INDEX idx_monthly_reports_date (year, month)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
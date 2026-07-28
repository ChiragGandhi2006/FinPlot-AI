-- Migration: 010_predictions
-- Description: ML prediction history and financial health scoring
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS prediction_history (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    prediction_type ENUM('expense_forecast','income_forecast','savings_forecast','anomaly_detection','category_forecast') NOT NULL,
    predicted_value DECIMAL(15, 2)  NOT NULL,
    confidence      DECIMAL(5, 2)   NULL,
    actual_value    DECIMAL(15, 2)  NULL,
    prediction_date DATE            NOT NULL,
    target_date     DATE            NULL,
    model_version   VARCHAR(50)     NULL,
    features_used   JSON            NULL,
    metadata        JSON            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_prediction_history_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_prediction_history_user (user_id),
    INDEX idx_prediction_history_type (user_id, prediction_type),
    INDEX idx_prediction_history_date (user_id, prediction_date),
    INDEX idx_prediction_history_target (target_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS financial_health_score (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL UNIQUE,
    overall_score   DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    savings_score   DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    expense_score   DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    debt_score      DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    income_score    DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    goal_score      DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    risk_score      DECIMAL(5, 2)   NOT NULL DEFAULT 0.00,
    grade           CHAR(1)         NULL,
    breakdown_json  JSON            NULL,
    calculated_at   DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    CONSTRAINT fk_health_score_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_health_score_user (user_id),
    INDEX idx_health_score_overall (overall_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
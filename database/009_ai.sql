-- Migration: 009_ai
-- Description: AI chat history and generated financial insights
-- Depends on: 001_create_users

CREATE TABLE IF NOT EXISTS ai_chat_history (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    session_id      VARCHAR(100)    NOT NULL,
    role            ENUM('user','assistant','system') NOT NULL,
    content         TEXT            NOT NULL,
    tokens_used     INT             NULL,
    model_used      VARCHAR(50)     NULL,
    metadata        JSON            NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_chat_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_ai_chat_user (user_id),
    INDEX idx_ai_chat_session (user_id, session_id),
    INDEX idx_ai_chat_role (role),
    INDEX idx_ai_chat_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ai_insights (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,
    insight_type    ENUM('spending_pattern','savings_tip','budget_alert','anomaly','goal_suggestion','investment_advice','tax_tip','general') NOT NULL,
    title           VARCHAR(200)    NOT NULL,
    description     TEXT            NOT NULL,
    severity        ENUM('info','warning','critical') NOT NULL DEFAULT 'info',
    is_read         BOOLEAN         NOT NULL DEFAULT FALSE,
    is_dismissed    BOOLEAN         NOT NULL DEFAULT FALSE,
    metadata        JSON            NULL,
    generated_at    DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_ai_insights_user
        FOREIGN KEY (user_id) REFERENCES users(id)
        ON DELETE CASCADE,

    INDEX idx_ai_insights_user (user_id),
    INDEX idx_ai_insights_type (user_id, insight_type),
    INDEX idx_ai_insights_severity (severity),
    INDEX idx_ai_insights_unread (user_id, is_read, is_dismissed),
    INDEX idx_ai_insights_generated (user_id, generated_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
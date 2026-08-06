/**
 * Central JSDoc typedefs describing the FinPilot AI backend contracts.
 */

/**
 * @typedef {Object} Token
 * @property {string} access_token
 * @property {string} token_type
 */

/**
 * @typedef {Object} User
 * @property {number} user_id
 * @property {string} first_name
 * @property {string} last_name
 * @property {string} username
 * @property {string} email
 * @property {string|null} phone
 * @property {string|null} profile_picture
 * @property {string} role
 * @property {boolean} email_verified
 * @property {boolean} is_active
 * @property {string} created_at
 */

/**
 * @typedef {Object} DashboardSummary
 * @property {number} total_income
 * @property {number} total_expense
 * @property {number} current_balance
 * @property {number} total_transactions
 */

/**
 * @typedef {Object} MonthlySummaryItem
 * @property {string} month
 * @property {number} income
 * @property {number} expense
 */

/**
 * @typedef {Object} CategoryExpenseItem
 * @property {string} category
 * @property {number} amount
 */

/**
 * @typedef {Object} Category
 * @property {number} category_id
 * @property {string} category_name
 * @property {boolean} is_default
 * @property {string} created_at
 */

/**
 * @typedef {Object} Income
 * @property {number} income_id
 * @property {number} user_id
 * @property {number} category_id
 * @property {number} amount
 * @property {string} source
 * @property {string|null} description
 * @property {string} payment_method
 * @property {string} income_date
 * @property {string|null} attachment
 * @property {string} created_at
 */

/**
 * @typedef {Object} Expense
 * @property {number} expense_id
 * @property {number} user_id
 * @property {number} category_id
 * @property {number} amount
 * @property {string} merchant
 * @property {string|null} description
 * @property {string} payment_method
 * @property {string} expense_date
 * @property {string|null} attachment
 * @property {string} created_at
 */

/**
 * @typedef {Object} Goal
 * @property {number} goal_id
 * @property {number} user_id
 * @property {string} goal_name
 * @property {number} target_amount
 * @property {number} saved_amount
 * @property {string} target_date
 * @property {string} status
 * @property {string} created_at
 */

/**
 * @typedef {Object} GoalProgress
 * @property {string} goal_name
 * @property {number} target_amount
 * @property {number} saved_amount
 * @property {number} remaining_amount
 * @property {number} progress_percentage
 * @property {string} status
 */

/**
 * @typedef {Object} Insight
 * @property {string} id
 * @property {'positive'|'warning'|'danger'|'goal'|'tip'} type
 * @property {string} title
 * @property {string} message
 */

/**
 * @typedef {Object} AppSettings
 * @property {string} currency
 * @property {string} language
 */

export {}

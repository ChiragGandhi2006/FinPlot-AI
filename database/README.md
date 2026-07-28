# Database Migrations

This directory contains sequential SQL migration files for the FinPilot AI database.

## Convention

Files are prefixed with a 3-digit sequence number:

```
001_create_users.sql
002_user_settings.sql
003_income.sql
004_expenses.sql
```

## Applying Migrations

Run the migrations in order using your preferred tool:

**MySQL CLI:**
```bash
cat database/001_create_users.sql | mysql -u root -p finpilot
```

**Using Alembic:**
After generating the Alembic configuration, each migration can be imported via `run_sql()`.

## Rollback

Rollback scripts are not provided. To revert, use `DROP TABLE` statements in reverse migration order.
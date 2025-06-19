# Database Backup Instructions

This document outlines how to create and manage backups of your Supabase PostgreSQL database.

## Prerequisites

1. PostgreSQL client tools installed (includes `pg_dump` and `psql`)
2. Database connection credentials (from Supabase dashboard)

## Creating a Backup

### Windows (PowerShell or Command Prompt)

1. Open a terminal
2. Navigate to your project directory:
   ```powershell
   cd C:\PythonProjects\QALoader
   ```
3. Run the backup command:
   ```powershell
   $timestamp = Get-Date -Format "yyyy-MM-dd"
   pg_dump "postgresql://postgres:YOUR_PASSWORD@db.xxgrrgmrzhayboraohin.supabase.co:5432/postgres" > backups\supabase-backup-$timestamp.sql
   ```

### Linux/macOS (Terminal)

```bash
timestamp=$(date +"%Y-%m-%d")
pg_dump "postgresql://postgres:YOUR_PASSWORD@db.xxgrrgmrzhayboraohin.supabase.co:5432/postgres" > backups/supabase-backup-${timestamp}.sql
```

## Restoring from a Backup

To restore your database from a backup file:

```powershell
# Windows
psql "postgresql://postgres:YOUR_PASSWORD@db.xxgrrgmrzhayboraohin.supabase.co:5432/postgres" < backups\supabase-backup-2025-06-17.sql

# Linux/macOS
psql "postgresql://postgres:YOUR_PASSWORD@db.xxgrrgmrzhayboraohin.supabase.co:5432/postgres" < backups/supabase-backup-2025-06-17.sql
```

## Important Notes

1. **Security**:
   - Never commit backup files to version control
   - The `backups/` directory is already in `.gitignore`
   - Store your database password securely (consider using environment variables)

2. **Automation**:
   - Consider setting up a scheduled task (Windows) or cron job (Linux/macOS) for regular backups
   - Example Windows Task Scheduler command:
     ```
     schtasks /create /tn "Supabase Backup" /tr "powershell -Command ""& {cd 'C:\PythonProjects\QALoader'; $timestamp = Get-Date -Format 'yyyy-MM-dd'; pg_dump \"postgresql://postgres:YOUR_PASSWORD@db.xxgrrgmrzhayboraohin.supabase.co:5432/postgres\" > backups\supabase-backup-$timestamp.sql}""" /sc daily /st 02:00
     ```

3. **Verification**:
   - Periodically verify your backups by restoring them to a test environment
   - Check backup file sizes to ensure they're not unexpectedly small

## Troubleshooting

- If `pg_dump` is not recognized, ensure PostgreSQL bin directory is in your system PATH
- For connection issues, verify your Supabase database is running and accessible
- Check the Supabase dashboard for any service interruptions

## Backup Retention

- Keep daily backups for 7 days
- Keep weekly backups for 1 month
- Keep monthly backups for 1 year

Manually clean up old backups or set up an automated cleanup script.

#!/bin/bash

# --- Configuration ---
SUPABASE_PROJECT_REF="xxgrrgmrzhayboraohin" # From your .env file
SUPABASE_DB_USER="postgres" # Default Supabase database user
SUPABASE_DB_PASSWORD="I0opTcVB9o250MSg" # Provided by USER
SUPABASE_PROJECT_HOST="db.${SUPABASE_PROJECT_REF}.supabase.co" # Standard Supabase DB host

# Construct the database connection URL (ensure password characters are properly percent-encoded if necessary, though pg_dump/supabase cli often handle common ones)
# For passwords with many special characters, direct use in URL can be tricky.
# Supabase CLI's --db-url might handle this better than raw pg_dump.
# Let's assume standard characters for now. If issues arise, password might need quoting or percent-encoding.
DB_URL="postgresql://${SUPABASE_DB_USER}:${SUPABASE_DB_PASSWORD}@${SUPABASE_PROJECT_HOST}:5432/postgres"

# Directory to store backups
BACKUP_DIR="/mnt/c/pythonprojects/QALoader/backups" # Ensure this directory exists

# Timestamp for the backup file
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
FILENAME="qaloader_db_backup_${TIMESTAMP}.sql"
FULL_BACKUP_PATH="${BACKUP_DIR}/${FILENAME}"

# --- End Configuration ---

echo "Starting Supabase database backup for project ${SUPABASE_PROJECT_REF}..."
echo "Backup will be saved to: ${FULL_BACKUP_PATH}"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"
if [ $? -ne 0 ]; then
    echo "Error: Could not create backup directory ${BACKUP_DIR}. Please check permissions."
    exit 1
fi

# Run Supabase CLI dump command using the full DB URL
# This avoids reliance on 'supabase login' or 'supabase link' for non-interactive scripts.
npx supabase db dump --db-url "${DB_URL}" -f "${FULL_BACKUP_PATH}"

# Check if the dump was successful
if [ $? -eq 0 ]; then
    echo "Database dump successful: ${FULL_BACKUP_PATH}"

    # Optional: Compress the backup
    echo "Compressing backup..."
    gzip "${FULL_BACKUP_PATH}"
    if [ $? -eq 0 ]; then
        echo "Backup compressed: ${FULL_BACKUP_PATH}.gz"
    else
        echo "Warning: Compression failed. The uncompressed backup is still available."
    fi

    # Optional: Remove old backups (e.g., older than 7 days)
    # echo "Removing backups older than 7 days..."
    # find "${BACKUP_DIR}" -name "qaloader_db_backup_*.sql.gz" -mtime +7 -exec echo "Deleting {}" \; -delete
    # find "${BACKUP_DIR}" -name "qaloader_db_backup_*.sql" -mtime +7 -exec echo "Deleting {}" \; -delete # If not compressed

else
    echo "Error: Database dump failed. The Supabase CLI might provide more details."
    echo "Possible reasons: incorrect DB_URL, network issues, or CLI not installed/configured correctly."
    # Consider removing the potentially empty/failed backup file
    # rm -f "${FULL_BACKUP_PATH}" # Uncomment to automatically clean up failed attempts
    exit 1
fi

echo "Supabase backup process completed."
exit 0

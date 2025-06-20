# Database Migrations

**Created:** June 20, 2025. 9:50 AM Eastern Time - Initial migrations directory

This directory contains SQL migration files for the Q&A Loader database schema changes.

## Migration Naming Convention

- `001_description.sql` - Forward migration
- `001_description_rollback.sql` - Rollback migration

## Current Migrations

### 001_staging_workflow_tables.sql
- Creates staging workflow tables: `upload_batches`, `staged_questions`, `staging_duplicates`
- Adds necessary indexes and constraints
- Implements Row Level Security policies
- Enables pg_trgm support for duplicate detection

## Running Migrations

Migrations should be run directly in Supabase SQL editor in sequence.

## Rollback

Each migration has a corresponding rollback file that can be used to undo changes if needed.
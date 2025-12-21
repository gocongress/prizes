#!/bin/bash

# PostgreSQL Database Backup Script with S3 Upload
# This script creates a timestamped, compressed backup of a PostgreSQL database
# and uploads it to an S3 bucket using the AWS CLI

# Early output for debugging cron issues
echo "Script started at $(date)" >&2

# Set a reasonable PATH for cron environments
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
export PATH

set -e  # Exit on error
set -u  # Exit on undefined variable

# Configuration - Set these variables or pass as environment variables
DB_HOST="${DB_HOST:-postgres}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-postgres}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-postgres}"
S3_BUCKET="${S3_BUCKET}"
S3_PATH="${S3_PATH}"  # Path within the bucket
BACKUP_DIR="${BACKUP_DIR:-/database-backups}"
RETENTION_DAYS="${RETENTION_DAYS:-30}"  # Keep backups for 30 days

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="backup_${DB_NAME}_${TIMESTAMP}.sql.gz"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Function to log messages
log() {
    echo -e "[$(date +'%Y-%m-%d %H:%M:%S')] $1"
}

error() {
    echo -e "[ERROR] $1" >&2
}

warn() {
    echo -e "[WARNING] $1"
}

# Check if required commands are available
check_requirements() {
    local missing_commands=()

    if ! command -v pg_dump &> /dev/null; then
        missing_commands+=("pg_dump")
        error "pg_dump not found in PATH: $PATH"
    fi

    if ! command -v aws &> /dev/null; then
        missing_commands+=("aws")
        error "aws not found in PATH: $PATH"
    fi

    if ! command -v gzip &> /dev/null; then
        missing_commands+=("gzip")
        error "gzip not found in PATH: $PATH"
    fi

    if [ ${#missing_commands[@]} -ne 0 ]; then
        error "Missing required commands: ${missing_commands[*]}"
        error "Current PATH: $PATH"
        exit 1
    fi
}

# Create backup directory if it doesn't exist
create_backup_dir() {
    if [ ! -d "$BACKUP_DIR" ]; then
        log "Creating backup directory: $BACKUP_DIR"
        mkdir -p "$BACKUP_DIR"
    fi
}

# Create database backup
create_backup() {
    log "Starting backup of database: $DB_NAME"
    log "Backup file: $BACKUP_PATH"

    # Use pg_dump with compression
    if PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" "$DB_NAME" | gzip > "$BACKUP_PATH"; then
        BACKUP_SIZE=$(du -h "$BACKUP_PATH" | cut -f1)
        log "Backup created successfully (Size: $BACKUP_SIZE)"
    else
        error "Failed to create database backup"
        exit 1
    fi
}

# Upload to S3
upload_to_s3() {
    log "Uploading backup to S3: s3://${S3_BUCKET}/${S3_PATH}/${BACKUP_FILE}"

    if aws s3 cp "$BACKUP_PATH" "s3://${S3_BUCKET}/${S3_PATH}/${BACKUP_FILE}" --storage-class STANDARD_IA; then
        log "Backup uploaded successfully to S3"
    else
        error "Failed to upload backup to S3"
        exit 1
    fi
}

# Clean up old local backups
cleanup_local() {
    log "Cleaning up local backups older than $RETENTION_DAYS days"

    if [ -d "$BACKUP_DIR" ]; then
        find "$BACKUP_DIR" -name "backup_${DB_NAME}_*.sql.gz" -type f -mtime +$RETENTION_DAYS -delete
        log "Local cleanup completed"
    fi
}

# Main execution
main() {
    log "=== PostgreSQL Backup Script Started ==="

    check_requirements
    create_backup_dir
    create_backup
    upload_to_s3
    cleanup_local

    log "=== Backup completed successfully ==="
}

# Run main function and catch any errors
if ! main; then
    exit_code=$?
    echo "Script failed with exit code: $exit_code" >&2
    exit $exit_code
fi

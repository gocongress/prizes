#!/bin/bash
set -euo pipefail

# Function to wait for PostgreSQL to be ready
wait_for_postgres() {
    local host="$1"
    local user="$2"
    local max_attempts=30
    local attempt=1

    echo "Waiting for PostgreSQL to start on $host..."
    while ! pg_isready -h "$host" -U "$user" > /dev/null 2>&1; do
        if (( attempt >= max_attempts )); then
            echo "Error: PostgreSQL did not become ready in time." >&2
            exit 1
        fi
        echo "PostgreSQL not ready yet (attempt $attempt/$max_attempts). Retrying in 2s..."
        sleep 2
        ((attempt++))
    done
    echo "PostgreSQL is ready."
}

# Function to create database and schemas
create_database() {
    local host="$1"
    local user="$2"
    local database="$3"
    local schema="$4"
    local test_schema="${schema}_test"

    echo "Creating database '$database' if it doesn't exist..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$host" -U "$user" -v ON_ERROR_STOP=0 --quiet <<-EOSQL
        CREATE DATABASE "$database";
        GRANT ALL PRIVILEGES ON DATABASE "$database" TO "$user";
EOSQL
    echo "Database '$database' exists."

    echo "Setting up schemas '$schema' and '$test_schema' in '$database'..."
    PGPASSWORD="$POSTGRES_PASSWORD" psql -h "$host" -U "$user" -d "$database" -v ON_ERROR_STOP=0 --quiet <<-EOSQL
        CREATE SCHEMA IF NOT EXISTS "$schema";
        CREATE SCHEMA IF NOT EXISTS "$test_schema";
        ALTER DATABASE "$database" SET search_path TO "$schema", public;
EOSQL
    echo "Schemas created and search_path set for '$database'."
}

# Main execution
main() {
    # Wait for PostgreSQL
    wait_for_postgres postgres "$POSTGRES_USER"

    if [ -z "${DB_NAMES:-}" ] || [ -z "${SCHEMA_NAMES:-}" ]; then
        echo "DB_NAMES and/or SCHEMA_NAMES not set. Skipping database creation."
        return 0
    fi

    # Convert comma-separated strings to arrays
    IFS=',' read -ra db_array <<< "$DB_NAMES"
    IFS=',' read -ra schema_array <<< "$SCHEMA_NAMES"

    for db in "${db_array[@]}"; do
        db=$(echo "$db" | xargs)  # trim whitespace
        [[ -z "$db" ]] && continue

        for schema in "${schema_array[@]}"; do
            schema=$(echo "$schema" | xargs)
            [[ -z "$schema" ]] && continue

            create_database postgres "$POSTGRES_USER" "$db" "$schema"
        done
    done

    echo "All databases and schemas built successfully."
}

main

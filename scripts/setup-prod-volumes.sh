#!/bin/bash

# Setup production volume directories
# This script creates the necessary directories for production volume persistence

set -e

# Source .env.production if it exists
if [ -f .env.production ]; then
    source .env.production
fi

# Set default paths if not specified in .env.prod
DB_VOLUME_PATH=${DB_VOLUME_PATH:-./volumes/prod/db-data}
DB_BUILD_VOLUME_PATH=${DB_BUILD_VOLUME_PATH:-./volumes/prod/build-db-data}

echo "Creating production volume directories..."
echo "  - DB data: ${DB_VOLUME_PATH}"
echo "  - DB build data: ${DB_BUILD_VOLUME_PATH}"

# Create directories
mkdir -p "${DB_VOLUME_PATH}"
mkdir -p "${DB_BUILD_VOLUME_PATH}"

# Set appropriate permissions (PostgreSQL needs specific permissions)
chmod 700 "${DB_VOLUME_PATH}"
chmod 700 "${DB_BUILD_VOLUME_PATH}"

echo "✓ Production volumes initialized successfully!"
echo ""
echo "Note: If using absolute paths like /var/lib/api, you may need to run:"
echo "  sudo chown -R 999:999 ${DB_VOLUME_PATH}"
echo "  sudo chown -R 999:999 ${DB_BUILD_VOLUME_PATH}"
echo "(UID 999 is the default postgres user in the Docker container)"

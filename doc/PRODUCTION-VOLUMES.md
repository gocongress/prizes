# Production Volume Management

This document explains how to manage persistent volumes for production deployments.

## Current Configuration

Production volumes are configured with bind mounts to specific directories, giving you full control over data location and backups.

### Default Locations

By default, volumes are stored in:

- `./volumes/prod/db-data` - Main PostgreSQL database
- `./volumes/prod/build-db-data` - Database build container

### Custom Locations

You can customize volume locations by setting environment variables in `.env.production`:

```bash
# Use absolute paths for production servers
DB_VOLUME_PATH=/var/lib/api/db-data
DB_BUILD_VOLUME_PATH=/var/lib/api/build-db-data
```

## Setup

### 1. Initialize Volumes

```bash
make setup-volumes-prod
```

This creates the necessary directories with correct permissions.

### 2. For Absolute Paths (Production Servers)

If using system directories like `/var/lib/api`:

```bash
# Create directories
sudo mkdir -p /var/lib/api/db-data
sudo mkdir -p /var/lib/api/build-db-data

# Set ownership to postgres user (UID 999 in Docker)
sudo chown -R 999:999 /var/lib/api/db-data
sudo chown -R 999:999 /var/lib/api/build-db-data

# Set permissions
sudo chmod 700 /var/lib/api/db-data
sudo chmod 700 /var/lib/api/build-db-data
```

## Backup Strategies

### Quick Backup

```bash
# If using default paths
tar -czf backup-$(date +%Y%m%d).tar.gz volumes/prod/

# If using custom paths
tar -czf backup-$(date +%Y%m%d).tar.gz /var/lib/api/
```

### Database Dump

```bash
# Connect to running container and dump
docker exec api-prod-postgres-1 pg_dump -U postgres > backup.sql
```

### Restore

```bash
# Stop services
make down-prod

# Restore files
tar -xzf backup-20240101.tar.gz

# Start services
make up-prod
```

## Monitoring Volume Usage

```bash
# Check volume disk usage
du -sh volumes/prod/*

# Or for custom paths
du -sh /var/lib/api/*
```

## Troubleshooting

### Permission Denied Errors

```bash
# For local volumes
chmod 700 volumes/prod/db-data
chmod 700 volumes/prod/build-db-data

# For system paths
sudo chown -R 999:999 /var/lib/api/db-data
sudo chmod 700 /var/lib/api/db-data
```

### Directory Not Found

```bash
# Run the setup script
make setup-volumes-prod

# Or manually
mkdir -p volumes/prod/db-data volumes/prod/build-db-data
```

### Check Current Mounts

```bash
docker compose -f docker-compose.prod.yaml config
```

This shows the resolved configuration including volume paths.

#!/bin/bash

set -e  # Exit on error

echo "========================================="
echo "Starting deployment process..."
echo "========================================="

# Pull latest changes from git
echo ""
echo "[1/2] Pulling latest changes from git..."
git pull

# Start production containers
echo ""
echo "[2/2] Starting latest production containers..."
make prod-up

echo ""
echo "========================================="
echo "Deployment completed successfully! Run 'make prod-logs' to view logs."
echo "========================================="

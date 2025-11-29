#!/bin/bash

set -e  # Exit on error

echo "========================================="
echo "Starting deployment process..."
echo "========================================="

# Pull latest changes from git
echo ""
echo "[1/4] Pulling latest changes from git..."
git pull

# Build production images
echo ""
echo "[2/4] Building production images..."
make prod-build

# Stop running containers
echo ""
echo "[3/4] Stopping production containers..."
make prod-down

# Start production containers
echo ""
echo "[4/4] Starting production containers..."
make prod-up

echo ""
echo "========================================="
echo "Deployment completed successfully!"
echo "========================================="

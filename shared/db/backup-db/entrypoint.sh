#!/bin/sh
set -e

echo "Exporting environment variables to /etc/environment for cron..."

# Export all environment variables to /etc/environment at container startup
# This happens at runtime, so it gets the variables from docker-compose
printenv | grep -v "no_proxy" | sed 's/^\(.*\)$/export \1/g' > /etc/environment

echo "Starting cron daemon..."
exec crond -f -l 2

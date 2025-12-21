#!/bin/sh
set -e

echo "Exporting environment variables to /etc/environment for cron..."

# Export all environment variables to /etc/environment at container startup
# This happens at runtime, so it gets the variables from docker-compose
printenv | grep -v "no_proxy" | sed 's/^\(.*\)$/export \1/g' > /etc/environment

echo "Starting cron daemon..."
# Use -b flag to run in background mode and -L to log to stderr
# This avoids the setpgid issue
crond -b -l 2 -L /dev/stderr

# Keep the container running by tailing the log file
echo "Cron daemon started. Tailing log file..."
tail -f /var/log/cron/backup.log 2>/dev/null || sleep infinity

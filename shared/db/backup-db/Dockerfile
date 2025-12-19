FROM postgres:17-alpine

# Add the tools you need
RUN apk add --no-cache \
    aws-cli \
    bash \
    gzip \
    findutils \
    dcron \
    && rm -rf /var/cache/apk/*

# Create necessary directories
RUN mkdir -p /scripts /database-backups /var/log/cron

# Copy the backup script
COPY backup-database.sh /scripts/backup-database.sh
RUN chmod +x /scripts/backup-database.sh

# Copy and install the crontab
COPY crontab /etc/crontabs/root

# Create a startup script to run cron in foreground
RUN echo '#!/bin/sh' > /entrypoint.sh && \
    echo 'echo "Starting cron daemon..."' >> /entrypoint.sh && \
    echo 'crond -f -l 2' >> /entrypoint.sh && \
    chmod +x /entrypoint.sh

# Set the entrypoint
ENTRYPOINT ["/entrypoint.sh"]

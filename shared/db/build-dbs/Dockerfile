FROM postgres:17-alpine AS client

# Install only the client tools (psql, pg_isready)
# The base image already contains them, but we keep only what we need
RUN apk add --no-cache bash

# Copy the init script
COPY init-db.sh /init-db.sh
RUN chmod +x /init-db.sh

# Entry point
ENTRYPOINT ["/init-db.sh"]

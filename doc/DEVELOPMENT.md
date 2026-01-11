# Development Workflows

## Local Development (Default)

Run the full stack locally with seed data:

```bash
make setup    # Build base image (first time only)
make build    # Build app images
make up       # Start everything
```

Access at http://localhost:3000. Login with `user@example.com` and grab the OTP from container logs.

## Local Frontend with Production API

For UI development against real production data, you can point your local frontend at the production API.

### Setup

1. **Configure local frontend**:
   ```bash
   # In app/admin/ or app/player/, create .env.local:
   VITE_API_URL=https://prizes.gocongress.org
   ```

2. **Run just the frontend**:
   ```bash
   cd app/admin
   npm run dev
   ```

3. **Authenticate**: Your existing browser session cookies from prizes.gocongress.org will authenticate API requests.

### Security Considerations

Adding localhost to production CORS is a minor incremental risk:

- **What it allows**: Code running on a developer's localhost can call the prod API using their browser cookies
- **What still protects you**: JWT authentication - requests without valid tokens are rejected
- **Who can exploit it**: Only someone running code on YOUR machine with YOUR cookies
- **Context**: Anyone can already `curl` the API (CORS only affects browsers)

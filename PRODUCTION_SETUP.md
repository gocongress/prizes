## Production prerequisites

Contact [revgum](https://github.com/revgum) for a copy of `.env.production` files needed for both `app/player` and `app/admin` and `.env.production` (project root) needed for running the applications in production.

The project root .env.production file needs to be placed in `/opt/secrets/prizes.env.production`.

## Running the applications

There are two ways to run the production applications:

### Standard method (using pre-built images from GitHub)

This is the **recommended approach** for production deployments. It uses application images that are built automatically in GitHub and published to the GitHub Container Registry (ghcr.io).

- `make prod-setup-volumes` : Setup DB data volumes to persist database data (one-time setup).
- Copy a valid `.env.production` into the workspace root and into each of the `player` and `admin` apps.
- `make prod-up` : Bring the applications up using pre-built images from GitHub.
- `make prod-logs` : Watch the production logs.
- `make prod-down` : Bring down the applications.

### Local build method (building from local repository)

Use this method when you need to build images from your local code repository, such as when testing changes before they're pushed to GitHub.

- `make prod-setup-volumes` : Setup DB data volumes to persist database data (one-time setup).
- `make prod-setup-local` : Build base image necessary for all applications (one-time setup).
- Copy a valid `.env.production` into the workspace root and into each of the `player` and `admin` apps.
- `make prod-build-local` : Build the individual services from local code.
- `make prod-up-local` : Bring the applications up using locally built images.
- `make prod-logs-local` : Watch the production logs.
- `make prod-down-local` : Bring down the applications.

## Updating applications

### Standard method (pre-built images)

- `git pull` : Pull latest updates.
- `make prod-down` : Bring down the applications.
- `make prod-up` : Bring up the new versions using the latest GitHub images.
- `make prod-logs` : Watch the production logs.

### Local build method

- `git pull` : Pull latest updates.
- `make prod-build-local` : Build the latest versions of the applications from local code.
- `make prod-down-local` : Bring down the applications.
- `make prod-up-local` : Bring the new versions of the applications up.
- `make prod-logs-local` : Watch the production logs.

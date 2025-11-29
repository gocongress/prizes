## Production prerequisites

Contact [revgum](https://github.com/revgum) for a copy of `.env.production` files needed for both `app/player` and `app/admin` and `.env.production` (project root) needed for running the applications in production.

The project root .env.production file needs to be placed in `/opt/secrets/prizes.env.production`.

## Build the applications

- `make prod-setup-volumes` : Setup DB data volumes to persist database data.
- `make prod-setup` : Build base image necessary for all applications, only required 1 time.
- Copy a valid `.env.production` into the workspace root and into each of the `player` and `admin` apps.
- `make prod-build` : Build the individual services.
- `make prod-up` : Bring the applications up.
- `make prod-logs` : Watch the production logs.

## Update applications

- `git pull` : Pull latest updates.
- `make prod-build` : Build the latest versions of the applications.
- `make prod-down` : Bring down the applications.
- `make prod-up` : Bring the new versions of the applications up.
- `make prod-logs` : Watch the production logs.

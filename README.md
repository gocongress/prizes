## Quick start

### Dependencies

- Podman (or Docker)
- Node 22
- Make (for convenience)

## Production Prerequisites

Contact [revgum](https://github.com/revgum) for a copy of `.env.production` files needed for both `app/player` and `app/admin` and `.env.production` (project root) needed for running the applications in production.

### Get Started

**Important** : The user `user@example.com` is a default configuration for a user who is granted "Admin" access to the system and API. See below for login and registration details.

1. Run `make setup` to build the base `microservice-build` image which the apps are built ontop of.
2. Run `make build` to build the apps.
3. Run `make` or `make up` to bring the database, admin application and api application up.
4. Open http://localhost:3000 to login.

### Login / User Registration

The system is built with the the concept of user login being tied to a one-time password emailed to the user rather than traditional email and password management. For the time being, that one-time password is actually persistent and visible to an admin user as well as being logged when a new user is created or an existing user is wanting to login.

Visit http://localhost:3000 and enter the `user@example.com` email address. You should see a log line with the valid code looking something like the following;

```
{"level":20,"time":1762476710543,"pid":69,"hostname":"b20316b56db8","id":"5686f7a3-53e4-4c3d-a5e7-e99b9224cf18","one_time_passes":["Y6mDRwcm"],"msg":"New user created"}
```

Type in "one_time_passes" code (without quotes) found in the log line and click "Submit Code" to login.

## Docker Image Rebuilds

### When to run `make down` and `make build`

You need to rebuild the Docker images when certain configuration files change. The images are built with specific files baked in during the build stage, so changes to these files won't be reflected until you rebuild.

**Required steps:**

1. Run `make down` to stop and remove containers
2. Make your changes to configuration files (e.g., `tsconfig.json`)
3. If adding/updating npm packages to any of the apps: Run `npm install` in workspace root directory to update the npm workspace `package-lock.json`
4. Run `make build` to rebuild the images with the updated files
5. Run `make up` to start the containers with the new images

**Rebuild is required when:**

- **npm packages are updated**: After running `npm install` in any app directory to add, remove, or update packages, you must rebuild.
- **TypeScript configuration changes**: Any modifications to `tsconfig.json` require a rebuild as this file is copied during the build stage.
- **Other Dockerfile.dev changes**: Any files referenced in any of the Dockerfile.dev (such as `package.json` or `tsconfig.json`) need a full rebuild when modified.

**Note:** Source code changes in the `src/` directory for any of the apps do not require a rebuild as they are mounted as volumes and will hot-reload automatically in development mode.

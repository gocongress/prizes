# Use podman if available, otherwise fall back to docker
DOCKER  ?= $(shell command -v podman 2>/dev/null || command -v docker 2>/dev/null || echo docker)

# Set env file path only if production secrets exist
ifneq (,$(wildcard /opt/secrets/prizes.env.production))
    PROD_ENV_FILE := --env-file /opt/secrets/prizes.env.production
else
    PROD_ENV_FILE := --env-file .env.production
endif

# Don't output the makefile errors
.IGNORE:
# Don't output the makefile commands being executed
.SILENT:
# Makefile targets don't correspond to actual files
.PHONY: setup build up up-db down psql routes prod-setup prod-setup-volumes prod-build prod-up prod-down prod-logs

# Default target to bring up a fresh stack
all: up

prune:
	$(DOCKER) builder prune -f
	$(DOCKER) image prune -f

# Build the microservice base image
setup:
	echo "\n\n***Building microservice base image***\n\n"
	$(DOCKER) build -f Dockerfile -t microservice-build .

build:
	$(DOCKER) compose --parallel 3 build

up:
	echo "\n\n***Bringing up the stack***\n\n"
	$(DOCKER) compose up

# Bring up the database, stopping containers and removing anonymous volumes when stopped using CTRL-C
up-db:
	echo "\n\n***Bringing up the db***\n\n"
	$(DOCKER) compose up postgres postgres-build-dbs

down:
	$(DOCKER) compose down

# Run psql to connect to local postgres, default password is "postgres"
psql:
	echo "\n\n***Default user 'postgres' has default password 'postgres'***\n\n"
	$(DOCKER) run -it --rm --network api-net postgres:17-alpine psql -h postgres -U postgres

# Inspect player application and update generated routes
routes:
	npm run generate-routes -w app/player

# Production targets
prod-setup-volumes:
	echo "\n\n***Setting up production volumes***\n\n"
	./scripts/setup-prod-volumes.sh

prod-setup:
	echo "\n\n***Building microservice production base image***\n\n"
	$(DOCKER) build -f Dockerfile -t microservice-prod .

prod-build:
	echo "\n\n***Building production images***\n\n"
	$(DOCKER) compose -f docker-compose.prod.yaml $(PROD_ENV_FILE) build player
	$(DOCKER) compose -f docker-compose.prod.yaml $(PROD_ENV_FILE) build admin
	$(DOCKER) compose -f docker-compose.prod.yaml $(PROD_ENV_FILE) build

prod-up:
	echo "\n\n***Bringing up the production stack***\n\n"
	$(DOCKER) compose -f docker-compose.prod.yaml $(PROD_ENV_FILE) up -d

prod-down:
	$(DOCKER) compose -f docker-compose.prod.yaml down

prod-logs:
	$(DOCKER) compose -f docker-compose.prod.yaml logs -f

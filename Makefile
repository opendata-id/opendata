.PHONY: help install build dev test lint clean deploy sync-public sync-public-push

help:
	@echo "OpenData.id Monorepo Commands"
	@echo ""
	@echo "Development:"
	@echo "  make install           - Install JS dependencies"
	@echo "  make dev               - Run all dev servers"
	@echo "  make build             - Build all apps"
	@echo ""
	@echo "Dashboard:"
	@echo "  make dev-dashboard-web - React frontend (port 5173)"
	@echo "  make dev-dashboard-api - Go Fiber API (port 8081)"
	@echo "  make build-dashboard   - Build dashboard (web + api)"
	@echo ""
	@echo "Costmap:"
	@echo "  make dev-costmap-web   - React frontend (port 4200)"
	@echo "  make dev-costmap-api   - Quarkus API (port 8080)"
	@echo "  make build-costmap     - Build costmap (web + api)"
	@echo ""
	@echo "Landing:"
	@echo "  make dev-landing       - PHP landing (port 3000)"
	@echo ""
	@echo "Database:"
	@echo "  make db-init           - Initialize DuckDB schema"
	@echo "  make db-shell          - Open DuckDB shell"
	@echo ""
	@echo "Deployment:"
	@echo "  make deploy            - Deploy all apps"
	@echo "  make deploy-dashboard  - Deploy dashboard only"
	@echo "  make deploy-landing    - Deploy landing only"
	@echo "  make clean             - Clean build artifacts"
	@echo ""
	@echo "Open Source:"
	@echo "  make sync-public       - Sync to public branch (dry run)"
	@echo "  make sync-public-push  - Sync and push to GitHub"

install:
	bun install

dev:
	@echo "Run these in separate terminals:"
	@echo "  make dev-landing"
	@echo "  make dev-dashboard-web"
	@echo "  make dev-dashboard-api"

# Landing
dev-landing:
	bun nx serve landing

# Dashboard
dev-dashboard-web:
	bun nx dev dashboard-web

dev-dashboard-api:
	cd apps/dashboard/api && go run ./cmd/server

build-dashboard:
	bun nx build dashboard-web
	cd apps/dashboard/api && CGO_ENABLED=1 go build -o dashboard-api ./cmd/server

build-dashboard-linux:
	bun nx build dashboard-web
	docker run --rm --platform linux/amd64 -v "$(PWD)/apps/dashboard/api":/app -w /app golang:1.23 sh -c "CGO_ENABLED=1 go build -o dashboard-api ./cmd/server"

# Costmap
dev-costmap-web:
	bun nx dev costmap-web

dev-costmap-api:
	bun nx dev costmap-api

build-costmap:
	bun nx build costmap-web
	cd apps/costmap/api && ./gradlew build -Dquarkus.package.type=uber-jar

# Build all
build:
	$(MAKE) build-dashboard
	$(MAKE) build-costmap

# Database
db-init:
	duckdb data/duckdb/opendata.db < data/duckdb/schema.sql

db-shell:
	duckdb data/duckdb/opendata.db

# Clean
clean:
	rm -rf dist .nx/cache
	rm -f apps/dashboard/api/dashboard-api
	cd apps/costmap/api && ./gradlew clean 2>/dev/null || true

# Deploy
deploy:
	./tools/scripts/deploy.sh all

deploy-dashboard:
	./tools/scripts/deploy.sh dashboard

deploy-landing:
	./tools/scripts/deploy.sh landing

deploy-costmap:
	./tools/scripts/deploy.sh costmap

# Open Source Sync
sync-public:
	./tools/scripts/sync-public.sh

sync-public-push:
	./tools/scripts/sync-public.sh --push

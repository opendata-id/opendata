#!/bin/bash
set -e

# Configuration (uses ~/.ssh/config host alias)
VPS="opendata-vps"
DEPLOY_PATH="/var/www/opendata"

echo "=== OpenData.id Deployment ==="
echo ""

# Parse arguments
DEPLOY_ALL=false
DEPLOY_DB=false
DEPLOY_TILES=false
DEPLOY_LANDING=false
DEPLOY_DASHBOARD_WEB=false
DEPLOY_DASHBOARD_API=false
DEPLOY_COSTMAP_WEB=false
DEPLOY_COSTMAP_API=false

if [ $# -eq 0 ]; then
    DEPLOY_ALL=true
fi

for arg in "$@"; do
    case $arg in
        all) DEPLOY_ALL=true ;;
        db) DEPLOY_DB=true ;;
        tiles) DEPLOY_TILES=true ;;
        landing) DEPLOY_LANDING=true ;;
        dashboard) DEPLOY_DASHBOARD_WEB=true; DEPLOY_DASHBOARD_API=true ;;
        dashboard-web) DEPLOY_DASHBOARD_WEB=true ;;
        dashboard-api) DEPLOY_DASHBOARD_API=true ;;
        costmap) DEPLOY_COSTMAP_WEB=true; DEPLOY_COSTMAP_API=true ;;
        costmap-web) DEPLOY_COSTMAP_WEB=true ;;
        costmap-api) DEPLOY_COSTMAP_API=true ;;
        *) echo "Unknown: $arg. Use: all, db, tiles, landing, dashboard, dashboard-web, dashboard-api, costmap, costmap-web, costmap-api"; exit 1 ;;
    esac
done

if $DEPLOY_ALL; then
    DEPLOY_DB=true
    DEPLOY_TILES=true
    DEPLOY_LANDING=true
    DEPLOY_DASHBOARD_WEB=true
    DEPLOY_DASHBOARD_API=true
    DEPLOY_COSTMAP_WEB=true
    DEPLOY_COSTMAP_API=true
fi

# Deploy database
if $DEPLOY_DB; then
    echo "[Database] Syncing DuckDB..."
    rsync -avz --progress data/duckdb/opendata.db $VPS:$DEPLOY_PATH/data/duckdb/

    echo "[Database] Fixing permissions..."
    ssh $VPS "sudo chown debian:www-data $DEPLOY_PATH/data/duckdb/opendata.db && sudo chmod 644 $DEPLOY_PATH/data/duckdb/opendata.db"

    echo "[Database] Restarting API services..."
    ssh $VPS "sudo systemctl restart costmap-api 2>/dev/null || true; sudo systemctl restart dashboard-api 2>/dev/null || true"
    echo "[Database] Done"
    echo ""
fi

# Generate and deploy tiles
if $DEPLOY_TILES; then
    echo "[Tiles] Generating PMTiles..."
    python3 tools/scripts/generate_tiles.py

    echo "[Tiles] Syncing to VPS..."
    ssh $VPS "mkdir -p $DEPLOY_PATH/data/tiles"
    rsync -avz --progress data/tiles/indonesia.pmtiles $VPS:$DEPLOY_PATH/data/tiles/

    echo "[Tiles] Fixing permissions..."
    ssh $VPS "sudo chown debian:www-data $DEPLOY_PATH/data/tiles/indonesia.pmtiles && sudo chmod 644 $DEPLOY_PATH/data/tiles/indonesia.pmtiles"
    echo "[Tiles] Done"
    echo ""
fi

# Build and deploy landing
if $DEPLOY_LANDING; then
    echo "[Landing] Syncing files..."
    rsync -avz --delete \
        --exclude='.git' \
        apps/landing/public/ $VPS:$DEPLOY_PATH/apps/landing/public/

    echo "[Landing] Fixing permissions..."
    ssh $VPS "sudo chown -R debian:www-data $DEPLOY_PATH/apps/landing && sudo chmod -R 755 $DEPLOY_PATH/apps/landing"
    echo "[Landing] Done"
    echo ""
fi

# Build and deploy dashboard web
if $DEPLOY_DASHBOARD_WEB; then
    echo "[Dashboard Web] Building..."
    bun nx build dashboard-web

    echo "[Dashboard Web] Syncing files..."
    rsync -avz --delete dist/apps/dashboard/web/ $VPS:$DEPLOY_PATH/dist/apps/dashboard/web/
    echo "[Dashboard Web] Done"
    echo ""
fi

# Build and deploy dashboard API
if $DEPLOY_DASHBOARD_API; then
    echo "[Dashboard API] Building (Linux AMD64 via Docker)..."
    mkdir -p .cache/go/mod .cache/go/build
    docker run --rm --platform linux/amd64 \
        -v "$(pwd)/apps/dashboard/api":/app \
        -v "$(pwd)/.cache/go/mod":/go/pkg/mod \
        -v "$(pwd)/.cache/go/build":/root/.cache/go-build \
        -w /app \
        golang:1.24 sh -c "CGO_ENABLED=1 go build -o dashboard-api ./cmd/server"

    echo "[Dashboard API] Stopping service..."
    ssh $VPS "sudo systemctl stop dashboard-api 2>/dev/null || true"

    echo "[Dashboard API] Syncing binary..."
    scp apps/dashboard/api/dashboard-api $VPS:$DEPLOY_PATH/apps/dashboard/api/

    echo "[Dashboard API] Starting service..."
    ssh $VPS "sudo systemctl start dashboard-api"
    echo "[Dashboard API] Done"
    echo ""
fi

# Build and deploy costmap web
if $DEPLOY_COSTMAP_WEB; then
    echo "[Costmap Web] Building..."
    bun nx build costmap-web

    echo "[Costmap Web] Syncing files..."
    rsync -avz --delete dist/apps/costmap/web/ $VPS:$DEPLOY_PATH/dist/apps/costmap/web/
    echo "[Costmap Web] Done"
    echo ""
fi

# Build and deploy costmap API
if $DEPLOY_COSTMAP_API; then
    echo "[Costmap API] Building..."
    bun nx build costmap-api

    echo "[Costmap API] Stopping service..."
    ssh $VPS "sudo systemctl stop costmap-api 2>/dev/null || true"

    echo "[Costmap API] Syncing files..."
    rsync -avz --delete apps/costmap/api/build/quarkus-app/ $VPS:$DEPLOY_PATH/apps/costmap/api/build/quarkus-app/

    echo "[Costmap API] Starting service..."
    ssh $VPS "sudo systemctl start costmap-api"
    echo "[Costmap API] Done"
    echo ""
fi

# Reload nginx
echo "[Nginx] Reloading..."
ssh $VPS "sudo systemctl reload nginx"

echo ""
echo "=== Deployment Complete ==="
echo "Landing:   https://opendata.id"
echo "Dashboard: https://opendata.id/data"
echo "Costmap:   https://opendata.id/map"

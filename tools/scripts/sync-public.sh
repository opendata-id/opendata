#!/usr/bin/env bash
set -euo pipefail

# Sync main branch to public branch, excluding private files
# Usage: ./tools/scripts/sync-public.sh [--push]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
PUBLIC_BRANCH="public"
PUBLIC_REMOTE="origin"
IGNORE_FILE="$ROOT_DIR/.public-ignore"
TEMP_DIR=""

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
    if [[ -n "$TEMP_DIR" && -d "$TEMP_DIR" ]]; then
        rm -rf "$TEMP_DIR"
    fi
}
trap cleanup EXIT

should_push=false
if [[ "${1:-}" == "--push" ]]; then
    should_push=true
fi

cd "$ROOT_DIR"

if [[ ! -f "$IGNORE_FILE" ]]; then
    log_error ".public-ignore file not found at $IGNORE_FILE"
    exit 1
fi

current_branch=$(git rev-parse --abbrev-ref HEAD)
current_commit=$(git rev-parse --short HEAD)
log_info "Current branch: $current_branch ($current_commit)"

TEMP_DIR=$(mktemp -d)
log_info "Using temp directory: $TEMP_DIR"

log_info "Building rsync exclude patterns from .public-ignore..."
exclude_args=()
while IFS= read -r line || [[ -n "$line" ]]; do
    line=$(echo "$line" | sed 's/#.*//' | xargs)
    if [[ -n "$line" ]]; then
        exclude_args+=("--exclude=$line")
    fi
done < "$IGNORE_FILE"

exclude_args+=("--exclude=.git")
exclude_args+=("--exclude=.public-ignore")

log_info "Copying files (excluding private paths)..."
rsync -a "${exclude_args[@]}" "$ROOT_DIR/" "$TEMP_DIR/"

cd "$TEMP_DIR"
git init -q
git checkout -q -b "$PUBLIC_BRANCH"

log_info "Creating public commit..."
git add -A
commit_msg="Sync from $current_branch ($current_commit)

Source: $current_branch @ $current_commit
Date: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

This is an automated sync. Private files excluded per .public-ignore"

git commit -q -m "$commit_msg"

public_commit=$(git rev-parse --short HEAD)
file_count=$(git ls-files | wc -l | xargs)
log_info "Created commit $public_commit with $file_count files"

cd "$ROOT_DIR"

if ! git show-ref --verify --quiet "refs/heads/$PUBLIC_BRANCH" 2>/dev/null; then
    log_info "Creating local '$PUBLIC_BRANCH' branch..."
    git branch "$PUBLIC_BRANCH" --force $(git commit-tree -m "Initial public branch" $(git hash-object -t tree /dev/null))
fi

log_info "Updating local '$PUBLIC_BRANCH' branch..."
git fetch "$TEMP_DIR" "$PUBLIC_BRANCH":"$PUBLIC_BRANCH" --force 2>/dev/null || {
    cd "$TEMP_DIR"
    git remote add target "$ROOT_DIR" 2>/dev/null || true
    git push target "$PUBLIC_BRANCH" --force
    cd "$ROOT_DIR"
}

if [[ "$should_push" == true ]]; then
    if git remote get-url "$PUBLIC_REMOTE" &>/dev/null; then
        log_info "Pushing to $PUBLIC_REMOTE/$PUBLIC_BRANCH..."
        git push "$PUBLIC_REMOTE" "$PUBLIC_BRANCH" --force
        log_info "Pushed to $PUBLIC_REMOTE/$PUBLIC_BRANCH"
    else
        log_error "Remote '$PUBLIC_REMOTE' not configured"
        log_warn "Add it with: git remote add $PUBLIC_REMOTE <github-url>"
        exit 1
    fi
else
    log_info "Dry run complete. Use --push to push to remote."
    echo ""
    echo "To push manually:"
    echo "  git push $PUBLIC_REMOTE $PUBLIC_BRANCH --force"
fi

echo ""
log_info "Summary:"
echo "  Main branch:   $current_branch ($current_commit)"
echo "  Public branch: $PUBLIC_BRANCH ($public_commit)"
echo "  Files synced:  $file_count"
echo ""
echo "Excluded patterns:"
while IFS= read -r line || [[ -n "$line" ]]; do
    line=$(echo "$line" | sed 's/#.*//' | xargs)
    if [[ -n "$line" ]]; then
        echo "  - $line"
    fi
done < "$IGNORE_FILE"

#!/bin/sh
set -eu

log() {
  printf '%s\n' "$*"
}

fail() {
  printf '%s\n' "$*" >&2
  exit 1
}

wait_for_http() {
  url="$1"
  attempts=75
  delay=2
  i=1

  while [ "$i" -le "$attempts" ]; do
    if curl -fsS "$url" >/dev/null 2>&1; then
      return 0
    fi

    sleep "$delay"
    i=$((i + 1))
  done

  return 1
}

start_frontend() {
  port="$1"
  project="$2"
  FRONTEND_PORT="$port" COMPOSE_PROJECT_NAME="$project" docker compose -f "$APP_COMPOSE_FILE" up -d --build frontend
}

stop_frontend() {
  port="$1"
  project="$2"
  FRONTEND_PORT="$port" COMPOSE_PROJECT_NAME="$project" docker compose -f "$APP_COMPOSE_FILE" down
}

rollback_to_previous() {
  log "Iniciando rollback"
  stop_frontend "$PRODUCTION_PORT" "$APP_PROJECT" >/dev/null 2>&1 || true

  if [ -n "$OLD_RELEASE" ]; then
    FRONTEND_PORT="$PRODUCTION_PORT" COMPOSE_PROJECT_NAME="$OLD_PROJECT" docker compose -f "$APP_COMPOSE_FILE" up -d --build frontend
    if ! wait_for_http "http://127.0.0.1:$PRODUCTION_PORT/api/health"; then
      fail "El rollback no respondió en healthcheck"
    fi
    log "Rollback activado desde $OLD_RELEASE"
  fi
}

RELEASE_DIR=${RELEASE_DIR:-$(pwd)}
CURRENT_LINK=${CURRENT_LINK:-/opt/app/frontend/current}
PREVIOUS_LINK=${PREVIOUS_LINK:-/opt/app/frontend/previous}
SHARED_DIR=${SHARED_DIR:-/opt/app/frontend/shared}
APP_COMPOSE_FILE=${APP_COMPOSE_FILE:-docker-compose.prod.yml}
STAGING_PORT=${STAGING_PORT:-19000}
PRODUCTION_PORT=${PRODUCTION_PORT:-9000}

[ -f "$SHARED_DIR/.env" ] || fail "Falta el archivo compartido de entorno: $SHARED_DIR/.env"

set -a
. "$SHARED_DIR/.env"
set +a

[ -n "${NEXT_PUBLIC_API_URL:-}" ] || fail "Falta NEXT_PUBLIC_API_URL en $SHARED_DIR/.env"

mkdir -p "$RELEASE_DIR"
cd "$RELEASE_DIR"
ln -sfn "$SHARED_DIR/.env" .env

RELEASE_ID=$(basename "$RELEASE_DIR")
APP_PROJECT="frontend-$RELEASE_ID"
STAGING_PROJECT="frontend-$RELEASE_ID-staging"
OLD_RELEASE=""
OLD_PROJECT=""

if [ -L "$CURRENT_LINK" ] || [ -d "$CURRENT_LINK" ]; then
  OLD_RELEASE=$(readlink -f "$CURRENT_LINK" || true)
  if [ -n "$OLD_RELEASE" ]; then
    OLD_PROJECT="frontend-$(basename "$OLD_RELEASE")"
  fi
fi

cleanup_staging() {
  stop_frontend "$STAGING_PORT" "$STAGING_PROJECT" >/dev/null 2>&1 || true
}

trap cleanup_staging EXIT INT TERM

log "Levantando release candidato en puerto $STAGING_PORT"
start_frontend "$STAGING_PORT" "$STAGING_PROJECT"

if ! wait_for_http "http://127.0.0.1:$STAGING_PORT/api/health"; then
  fail "El release candidato no pasó healthcheck"
fi

log "Cortando release anterior"
if [ -n "$OLD_RELEASE" ]; then
  FRONTEND_PORT="$PRODUCTION_PORT" COMPOSE_PROJECT_NAME="$OLD_PROJECT" docker compose -f "$APP_COMPOSE_FILE" down >/dev/null 2>&1 || true
fi

log "Promoviendo release nuevo en puerto $PRODUCTION_PORT"
stop_frontend "$STAGING_PORT" "$STAGING_PROJECT"
FRONTEND_PORT="$PRODUCTION_PORT" COMPOSE_PROJECT_NAME="$APP_PROJECT" docker compose -f "$APP_COMPOSE_FILE" up -d --build frontend

if ! wait_for_http "http://127.0.0.1:$PRODUCTION_PORT/api/health"; then
  rollback_to_previous
  fail "El release promovido no pasó healthcheck"
fi

ln -sfn "$RELEASE_DIR" "$CURRENT_LINK"
if [ -n "$OLD_RELEASE" ]; then
  ln -sfn "$OLD_RELEASE" "$PREVIOUS_LINK"
fi

trap - EXIT INT TERM
log "Despliegue completado correctamente"

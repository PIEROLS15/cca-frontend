#!/bin/sh
set -eu

log() { printf '%s\n' "$*"; }
fail() { printf '%s\n' "$*" >&2; exit 1; }

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

RELEASE_DIR=${RELEASE_DIR:-$(pwd)}
SHARED_DIR=${SHARED_DIR:-/opt/app/frontend-test/shared}
APP_COMPOSE_FILE=${APP_COMPOSE_FILE:-docker-compose.test.yml}
ENV_FILE=${ENV_FILE:-.env}

[ -f "$SHARED_DIR/$ENV_FILE" ] || fail "Falta el archivo compartido de entorno: $SHARED_DIR/$ENV_FILE"

set -a
. "$SHARED_DIR/$ENV_FILE"
set +a

[ -n "${NEXT_PUBLIC_API_URL_TEST:-}" ] || fail "Falta NEXT_PUBLIC_API_URL_TEST en $SHARED_DIR/$ENV_FILE"

mkdir -p "$RELEASE_DIR"
cd "$RELEASE_DIR"
ln -sfn "$SHARED_DIR/$ENV_FILE" "$ENV_FILE"

log "Limpiando entorno de pruebas"
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-cca-frontend-test} docker compose --env-file "$ENV_FILE" -f "$APP_COMPOSE_FILE" down >/dev/null 2>&1 || true

log "Levantando frontend de pruebas"
COMPOSE_PROJECT_NAME=${COMPOSE_PROJECT_NAME:-cca-frontend-test} docker compose --env-file "$ENV_FILE" -f "$APP_COMPOSE_FILE" up -d --build frontend

if ! wait_for_http "http://127.0.0.1:${FRONTEND_TEST_PORT:-9100}/api/health"; then
  fail "El frontend de pruebas no pasó healthcheck"
fi

log "Ejecutando Playwright"
pnpm test:e2e

log "Despliegue de pruebas completado"

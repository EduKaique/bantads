#!/bin/bash
set -e

# ============================================================
#  build.sh — BANTADS
#  Uso: ./build.sh [dev|prod] [--no-cache] [--down]
# ============================================================

# Configuração das cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log()   { echo -e "${BLUE}[INFO]${NC}  $1"; }
ok()    { echo -e "${GREEN}[OK]${NC}    $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

# Variaveis Default
ENV="${1:-dev}"
NO_CACHE=""
BRING_DOWN=false

# Argumentos do comando
for arg in "$@"; do
  case $arg in
    --no-cache) NO_CACHE="--no-cache" ;;
    --down)     BRING_DOWN=true ;;
  esac
done

# Verificação de ambiente
[[ "$ENV" != "dev" && "$ENV" != "prod" ]] && \
  error "Ambiente inválido: '$ENV'. Use: ./build.sh [dev|prod]"

command -v docker >/dev/null 2>&1 || error "Docker não encontrado. Instale o Docker."
docker compose version >/dev/null 2>&1 || error "Docker Compose não encontrado."

# Verificação se existe .env.prod
if [[ "$ENV" == "prod" ]]; then
  [[ ! -f ".env.prod" ]] && \
    error "Arquivo .env.prod não encontrado. Copie .env.prod.example para .env.prod e preencha as variáveis."
  set -a; source .env.prod; set +a
  COMPOSE_FILE="docker-compose.prod.yml"
  log "Ambiente: PRODUÇÃO"
else
  COMPOSE_FILE="docker-compose.yaml"
  log "Ambiente: DESENVOLVIMENTO"
fi

log "Compose file: $COMPOSE_FILE"
echo ""

if [[ "$BRING_DOWN" == true ]]; then
  log "Derrubando containers existentes..."
  docker compose -f "$COMPOSE_FILE" down --remove-orphans
  ok "Containers removidos."
  echo ""
fi

log "Iniciando build das imagens..."
docker compose -f "$COMPOSE_FILE" build $NO_CACHE
echo ""

log "Subindo containers..."
docker compose -f "$COMPOSE_FILE" up -d

echo ""
log "Aguardando serviços iniciarem (30s)..."
sleep 30

log "Status dos containers:"
docker compose -f "$COMPOSE_FILE" ps

echo ""
ok "=== Deploy concluído para ambiente: $ENV ==="
echo ""
echo "  Logs:    docker compose -f $COMPOSE_FILE logs -f"
echo "  Parar:   docker compose -f $COMPOSE_FILE down"
echo "  Rebuild: ./build.sh $ENV --no-cache --down"
echo ""

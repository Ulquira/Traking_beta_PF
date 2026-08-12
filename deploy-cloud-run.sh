#!/bin/bash

# Script para desplegar servicios en Cloud Run con Cloud SQL Proxy
# Uso: ./deploy-cloud-run.sh [capa|api]

PROJECT_ID="dynamic-radar-470920-g9"
REGION="us-east4"
SERVICE_ACCOUNT="default@${PROJECT_ID}.iam.gserviceaccount.com"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🚀 Iniciando deploy a Cloud Run...${NC}"

# Verificar que el servicio fue especificado
if [ -z "$1" ]; then
    echo -e "${RED}Error: Especifica 'capa' o 'api'${NC}"
    echo "Uso: ./deploy-cloud-run.sh [capa|api]"
    exit 1
fi

# Asignar variables según el servicio
if [ "$1" = "capa" ]; then
    SERVICE_NAME="capa-intermedia"
    IMAGE_NAME="capa-intermedia"
    DOCKERFILE="Dockerfile.capa"
    PORT="4001"
    echo -e "${GREEN}📦 Desplegando Capa Intermedia${NC}"
elif [ "$1" = "api" ]; then
    SERVICE_NAME="api-principal"
    IMAGE_NAME="api-principal"
    DOCKERFILE="Dockerfile.api"
    PORT="3001"
    echo -e "${GREEN}📦 Desplegando API Principal${NC}"
else
    echo -e "${RED}Error: Servicio no reconocido. Usa 'capa' o 'api'${NC}"
    exit 1
fi

# Paso 1: Construir imagen
echo -e "${YELLOW}1️⃣  Construyendo imagen...${NC}"
gcloud builds submit --tag gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest -f ${DOCKERFILE} \
    || { echo -e "${RED}Error en build${NC}"; exit 1; }

# Paso 2: Desplegar a Cloud Run
echo -e "${YELLOW}2️⃣  Desplegando a Cloud Run...${NC}"

# Comando base
DEPLOY_CMD="gcloud run deploy ${SERVICE_NAME} \
  --image gcr.io/${PROJECT_ID}/${IMAGE_NAME}:latest \
  --platform managed \
  --region ${REGION} \
  --port ${PORT} \
  --memory 512Mi \
  --set-env-vars DB_USER=Quantum,DB_PASSWORD=Tonoso.33,DB_NAME=BBDD,DB_PORT=3306,PORT=${PORT},SECRET_API_KEY=LLAVE_SECRETA_DEL_TERCERO_123 \
  --no-allow-unauthenticated \
  --service-account=${SERVICE_ACCOUNT}"

# Si es API, agregar CAPA_INTERMEDIA_URL
if [ "$1" = "api" ]; then
    DEPLOY_CMD="${DEPLOY_CMD} \
  --set-env-vars CAPA_INTERMEDIA_URL=https://capa-intermedia-xxxxx.run.app"
fi

eval ${DEPLOY_CMD} || { echo -e "${RED}Error en deploy${NC}"; exit 1; }

echo -e "${GREEN}✅ Deploy completado!${NC}"
echo -e "${GREEN}📍 Servicio: ${SERVICE_NAME}${NC}"
echo -e "${GREEN}🔗 Ver logs: gcloud run logs read ${SERVICE_NAME} --region ${REGION}${NC}"

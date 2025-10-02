#!/bin/bash

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

API_URL="http://localhost:8080/api/v1"

echo -e "${BLUE}=== Test de Send Push Notification ===${NC}\n"

# 1. Login como admin
echo -e "${YELLOW}1. Login como administrador...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "${API_URL}/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.com",
    "password": "admin123"
  }')

# Extraer token
TOKEN=$(echo $LOGIN_RESPONSE | jq -r '.data.token // .token // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✓ Token obtenido${NC}\n"

# 2. Listar notificaciones
echo -e "${YELLOW}2. Listando notificaciones...${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "${API_URL}/admin/notifications" \
  -H "Authorization: Bearer $TOKEN")

NOTIFICATION_ID=$(echo $NOTIFICATIONS_RESPONSE | jq -r '.data[0].id // empty')

if [ -z "$NOTIFICATION_ID" ] || [ "$NOTIFICATION_ID" = "null" ]; then
  # Crear notificación
  CREATE_RESPONSE=$(curl -s -X POST "${API_URL}/admin/notifications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Push",
      "message": "Test message",
      "type": "info"
    }')
  
  NOTIFICATION_ID=$(echo $CREATE_RESPONSE | jq -r '.data.id // .id // empty')
fi

echo -e "${GREEN}✓ ID de notificación: $NOTIFICATION_ID${NC}\n"

# 3. Enviar push
echo -e "${YELLOW}3. Enviando push notification...${NC}"
SEND_RESPONSE=$(curl -s -w "\nHTTP:%{http_code}" -X POST "${API_URL}/admin/notifications/${NOTIFICATION_ID}/send-push" \
  -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$SEND_RESPONSE" | grep "HTTP:" | cut -d: -f2)
BODY=$(echo "$SEND_RESPONSE" | sed 's/HTTP:.*//g')

echo "Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "200" ]; then
  echo -e "${GREEN}✓ SUCCESS!${NC}"
else
  echo -e "${RED}❌ FAILED (Status: $HTTP_CODE)${NC}"
fi

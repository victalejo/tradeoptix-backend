#!/bin/bash

echo "======================================"
echo "Test completo de Send Push Notification"
echo "======================================"

API_URL="http://localhost:8080/api/v1"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo ""
echo "${YELLOW}Paso 1: Login como admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.com",
    "password": "admin123"
  }')

echo "Response: $LOGIN_RESPONSE"

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "${RED}✗ Error: No se pudo obtener el token${NC}"
  echo ""
  echo "${YELLOW}Intentando crear usuario admin...${NC}"
  
  # Intentar crear admin
  CREATE_ADMIN=$(curl -s -X POST "$API_URL/users/register" \
    -H "Content-Type: application/json" \
    -d '{
      "first_name": "Admin",
      "last_name": "System",
      "document_type": "cedula",
      "document_number": "000-0000000-0",
      "email": "admin@tradeoptix.com",
      "phone_number": "+18091234567",
      "address": "Admin Office, Santo Domingo",
      "password": "admin123"
    }')
  
  echo "Respuesta creación admin: $CREATE_ADMIN"
  
  # Intentar login de nuevo
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/users/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "admin@tradeoptix.com",
      "password": "admin123"
    }')
  
  TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*' | sed 's/"token":"//')
  
  if [ -z "$TOKEN" ]; then
    echo "${RED}✗ Error: No se pudo obtener el token después de crear admin${NC}"
    exit 1
  fi
fi

echo "${GREEN}✓ Token obtenido exitosamente${NC}"
echo "Token: ${TOKEN:0:50}..."

echo ""
echo "${YELLOW}Paso 2: Listar notificaciones${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/admin/notifications" \
  -H "Authorization: Bearer $TOKEN")

echo "Notificaciones: $NOTIFICATIONS_RESPONSE"

# Extraer el primer ID de notificación (si existe)
NOTIFICATION_ID=$(echo $NOTIFICATIONS_RESPONSE | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$NOTIFICATION_ID" ]; then
  echo ""
  echo "${YELLOW}No hay notificaciones. Creando una nueva...${NC}"
  
  CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/notifications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "title": "Test Push Notification",
      "content": "Esta es una notificación de prueba para el sistema de push",
      "type": "general",
      "priority": "high"
    }')
  
  echo "Respuesta creación: $CREATE_RESPONSE"
  
  NOTIFICATION_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*' | sed 's/"id":"//')
  
  if [ -z "$NOTIFICATION_ID" ]; then
    echo "${RED}✗ Error: No se pudo crear la notificación${NC}"
    exit 1
  fi
  
  echo "${GREEN}✓ Notificación creada exitosamente${NC}"
fi

echo "${GREEN}✓ ID de notificación: $NOTIFICATION_ID${NC}"

echo ""
echo "${YELLOW}Paso 3: Enviar push notification${NC}"
SEND_PUSH_RESPONSE=$(curl -s -X POST "$API_URL/admin/notifications/$NOTIFICATION_ID/send-push" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nHTTP Status: %{http_code}")

echo "Respuesta: $SEND_PUSH_RESPONSE"

if echo "$SEND_PUSH_RESPONSE" | grep -q "HTTP Status: 200"; then
  echo "${GREEN}✓ Push notification enviada exitosamente${NC}"
else
  echo "${RED}✗ Error al enviar push notification${NC}"
fi

echo ""
echo "${YELLOW}Paso 4: Verificar estado de la notificación${NC}"
VERIFY_RESPONSE=$(curl -s -X GET "$API_URL/admin/notifications/$NOTIFICATION_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "Estado: $VERIFY_RESPONSE"

echo ""
echo "======================================"
echo "Test completado"
echo "======================================"

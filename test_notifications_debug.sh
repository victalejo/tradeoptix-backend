#!/bin/bash

echo "=================================================="
echo "🧪 TEST DE NOTIFICACIONES - DEBUG COMPLETO"
echo "=================================================="
echo ""

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:8080/api/v1"

echo -e "${BLUE}📝 Paso 1: Login de usuario${NC}"
echo "Email: test@example.com"

LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }')

echo "Respuesta de login:"
echo "$LOGIN_RESPONSE" | jq '.'

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty')
USER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.user.id // empty')

if [ -z "$TOKEN" ] || [ "$TOKEN" == "null" ]; then
  echo -e "${RED}❌ Error: No se pudo obtener el token${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Token obtenido${NC}"
echo "Token: ${TOKEN:0:30}..."
echo "User ID: $USER_ID"
echo ""

echo -e "${BLUE}📊 Paso 2: Verificar notificaciones en la base de datos para este usuario${NC}"
PGPASSWORD=nrdys53kzx8amg50 psql -h 194.163.133.7 -p 1138 -U tradeoptix_user -d tradeoptix_db << EOF
SELECT 
  COUNT(*) as total_notificaciones,
  SUM(CASE WHEN user_id = '$USER_ID' THEN 1 ELSE 0 END) as mis_notificaciones,
  SUM(CASE WHEN user_id IS NULL THEN 1 ELSE 0 END) as sin_usuario
FROM notifications;
EOF

echo ""
echo -e "${BLUE}📋 Paso 3: Ver notificaciones específicas del usuario${NC}"
PGPASSWORD=nrdys53kzx8amg50 psql -h 194.163.133.7 -p 1138 -U tradeoptix_user -d tradeoptix_db << EOF
SELECT id, title, message, is_read, created_at 
FROM notifications 
WHERE user_id = '$USER_ID'
ORDER BY created_at DESC 
LIMIT 5;
EOF

echo ""
echo -e "${BLUE}🌐 Paso 4: Probar endpoint /notifications/${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/notifications/?page=1&limit=20&unread_only=false" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Respuesta del servidor:"
echo "$NOTIFICATIONS_RESPONSE" | jq '.'

TOTAL=$(echo "$NOTIFICATIONS_RESPONSE" | jq -r '.total // 0')
DATA_LENGTH=$(echo "$NOTIFICATIONS_RESPONSE" | jq -r '.data | length')

echo ""
echo -e "${YELLOW}📈 Resumen:${NC}"
echo "  - Total de notificaciones: $TOTAL"
echo "  - Notificaciones devueltas: $DATA_LENGTH"

if [ "$DATA_LENGTH" -eq "0" ]; then
  echo -e "${RED}⚠️  No se devolvieron notificaciones${NC}"
else
  echo -e "${GREEN}✅ Notificaciones obtenidas correctamente${NC}"
fi

echo ""
echo -e "${BLUE}📱 Paso 5: Probar contador de no leídas${NC}"
UNREAD_RESPONSE=$(curl -s -X GET "$API_URL/notifications/unread-count" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

echo "Respuesta:"
echo "$UNREAD_RESPONSE" | jq '.'

echo ""
echo "=================================================="
echo "✅ Test completado"
echo "=================================================="

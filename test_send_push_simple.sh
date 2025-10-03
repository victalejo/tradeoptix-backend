#!/bin/bash

# Test completo y simplificado para send-push
# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8080/api/v1"

echo -e "${YELLOW}🧪 Test completo de send-push para notificaciones${NC}\n"

# 1. Crear usuario admin
echo -e "${YELLOW}👤 Creando usuario admin...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST "$BASE_URL/users/register" \
    -H "Content-Type: application/json" \
    -d '{
        "first_name": "Admin",
        "last_name": "User", 
        "cedula": "ADMIN001",
        "email": "admin@tradeoptix.com",
        "password": "admin123",
        "phone": "555-0001",
        "address": "Admin Address"
    }')

echo "Registro: $REGISTER_RESPONSE"

# 2. Hacer login
echo -e "\n${YELLOW}🔐 Haciendo login...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@tradeoptix.com",
        "password": "admin123"
    }')

echo "Login: $LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ No se pudo obtener token${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token obtenido: ${TOKEN:0:20}...${NC}"

# 3. Verificar ruta admin/notifications
echo -e "\n${YELLOW}📋 Verificando ruta admin/notifications...${NC}"
NOTIFICATIONS_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X GET "$BASE_URL/admin/notifications" \
    -H "Authorization: Bearer $TOKEN")

HTTP_CODE=$(echo "$NOTIFICATIONS_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo "$NOTIFICATIONS_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Status Code: $HTTP_CODE"
echo "Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo -e "${GREEN}✅ Ruta admin/notifications funciona${NC}"
else
    echo -e "${YELLOW}⚠️  Status code: $HTTP_CODE (puede ser normal si no hay notificaciones)${NC}"
fi

# 4. Crear notificación de prueba
echo -e "\n${YELLOW}📝 Creando notificación de prueba...${NC}"
CREATE_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/admin/notifications" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Test Push Notification",
        "content": "Esta es una notificación de prueba para send-push",
        "category": "general"
    }')

HTTP_CODE=$(echo "$CREATE_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Create Status Code: $HTTP_CODE"
echo "Create Response: $RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "201" ]; then
    # Intentar extraer ID de la notificación
    NOTIFICATION_ID=$(echo "$RESPONSE_BODY" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
    if [ -z "$NOTIFICATION_ID" ]; then
        NOTIFICATION_ID=$(echo "$RESPONSE_BODY" | grep -o '"notification":{"id":"[^"]*"' | cut -d'"' -f6)
    fi
    
    echo -e "${GREEN}✅ Notificación creada con ID: $NOTIFICATION_ID${NC}"
else
    echo -e "${YELLOW}⚠️  Usando ID ficticio para test de ruta${NC}"
    NOTIFICATION_ID="test-id"
fi

# 5. Probar send-push (la funcionalidad principal)
echo -e "\n${YELLOW}🚀 Probando send-push...${NC}"
SEND_PUSH_RESPONSE=$(curl -s -w "HTTPSTATUS:%{http_code}" -X POST "$BASE_URL/admin/notifications/$NOTIFICATION_ID/send-push" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$SEND_PUSH_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
RESPONSE_BODY=$(echo "$SEND_PUSH_RESPONSE" | sed -e 's/HTTPSTATUS:.*//g')

echo "Send-Push Status Code: $HTTP_CODE"  
echo "Send-Push Response: $RESPONSE_BODY"

# Evaluar resultado
case $HTTP_CODE in
    200|201)
        echo -e "\n${GREEN}🎉 ¡ÉXITO! La funcionalidad send-push está funcionando${NC}"
        echo -e "${GREEN}✅ El problema del frontend (Error 404) ha sido solucionado${NC}"
        ;;
    404)
        echo -e "\n${RED}❌ Error 404: La ruta send-push aún no existe${NC}"
        echo -e "${RED}🔧 Necesitas verificar que la ruta esté configurada en routes.go${NC}"
        exit 1
        ;;
    401|403)
        echo -e "\n${RED}❌ Error de autorización${NC}"
        echo -e "${RED}🔧 Problema con el token o permisos de admin${NC}"
        exit 1
        ;;
    500)
        echo -e "\n${YELLOW}⚠️  Error 500: La ruta existe pero hay un problema interno${NC}"
        echo -e "${YELLOW}🔧 Revisa los logs del servidor para más detalles${NC}"
        ;;
    *)
        echo -e "\n${RED}❌ Error inesperado: $HTTP_CODE${NC}"
        exit 1
        ;;
esac
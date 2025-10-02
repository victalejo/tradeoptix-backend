#!/bin/bash

# Test para verificar la funcionalidad de send-push en notificaciones
# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🧪 Iniciando test de funcionalidad send-push para notificaciones${NC}\n"

# Configuración
BASE_URL="http://localhost:8080/api/v1"

# Función para hacer login y obtener token
get_admin_token() {
    echo -e "${YELLOW}📝 Intentando hacer login como admin...${NC}"
    
    # Intentar con credenciales por defecto
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
        -H "Content-Type: application/json" \
        -d '{
            "email": "admin@tradeoptix.com",
            "password": "admin123"
        }')
    
    # Verificar si el login fue exitoso
    TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        echo -e "${RED}❌ No se pudo obtener token de admin${NC}"
        echo "Response: $LOGIN_RESPONSE"
        
        # Intentar crear admin si no existe
        echo -e "${YELLOW}🔧 Intentando crear usuario admin...${NC}"
        CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/register" \
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
        
        echo "Create response: $CREATE_RESPONSE"
        
        # Intentar login de nuevo
        LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
            -H "Content-Type: application/json" \
            -d '{
                "email": "admin@tradeoptix.com",
                "password": "admin123"
            }')
        
        TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.token // empty' 2>/dev/null)
    fi
    
    if [ -n "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
        echo -e "${GREEN}✅ Token obtenido exitosamente${NC}"
        echo "$TOKEN"
    else
        echo -e "${RED}❌ Error: No se pudo obtener token${NC}"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
}

# Función para verificar si las rutas existen
check_routes() {
    echo -e "\n${YELLOW}📋 Verificando rutas de notificaciones...${NC}"
    
    # Verificar ruta de listar notificaciones
    NOTIFICATIONS_RESPONSE=$(curl -s -w "%{http_code}" -X GET "$BASE_URL/admin/notifications" \
        -H "Authorization: Bearer $1")
    
    HTTP_CODE=$(echo "$NOTIFICATIONS_RESPONSE" | tail -c 4)
    RESPONSE_BODY=$(echo "$NOTIFICATIONS_RESPONSE" | head -c -4)
    
    echo "GET /admin/notifications - Status: $HTTP_CODE"
    
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
        echo -e "${GREEN}✅ Ruta GET /admin/notifications existe${NC}"
    else
        echo -e "${RED}❌ Ruta GET /admin/notifications no encontrada${NC}"
    fi
}

# Función para crear una notificación de prueba
create_test_notification() {
    echo -e "\n${YELLOW}📝 Creando notificación de prueba...${NC}"
    
    CREATE_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/admin/notifications" \
        -H "Authorization: Bearer $1" \
        -H "Content-Type: application/json" \
        -d '{
            "title": "Test Notification",
            "content": "Esta es una notificación de prueba para el sistema send-push",
            "category": "general"
        }')
    
    HTTP_CODE=$(echo "$CREATE_RESPONSE" | tail -c 4)
    RESPONSE_BODY=$(echo "$CREATE_RESPONSE" | head -c -4)
    
    echo "POST /admin/notifications - Status: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    
    if [ "$HTTP_CODE" = "201" ] || [ "$HTTP_CODE" = "200" ]; then
        NOTIFICATION_ID=$(echo "$RESPONSE_BODY" | jq -r '.id // .notification.id // empty' 2>/dev/null)
        echo -e "${GREEN}✅ Notificación creada con ID: $NOTIFICATION_ID${NC}"
        echo "$NOTIFICATION_ID"
    else
        echo -e "${RED}❌ Error creando notificación${NC}"
        return 1
    fi
}

# Función para probar send-push
test_send_push() {
    local token=$1
    local notification_id=$2
    
    echo -e "\n${YELLOW}🚀 Probando funcionalidad send-push...${NC}"
    
    SEND_PUSH_RESPONSE=$(curl -s -w "%{http_code}" -X POST "$BASE_URL/admin/notifications/$notification_id/send-push" \
        -H "Authorization: Bearer $token" \
        -H "Content-Type: application/json")
    
    HTTP_CODE=$(echo "$SEND_PUSH_RESPONSE" | tail -c 4)
    RESPONSE_BODY=$(echo "$SEND_PUSH_RESPONSE" | head -c -4)
    
    echo "POST /admin/notifications/$notification_id/send-push - Status: $HTTP_CODE"
    echo "Response: $RESPONSE_BODY"
    
    case $HTTP_CODE in
        200|201)
            echo -e "${GREEN}✅ Send-push ejecutado exitosamente${NC}"
            return 0
            ;;
        404)
            echo -e "${RED}❌ Error 404: Ruta send-push no encontrada${NC}"
            return 1
            ;;
        401|403)
            echo -e "${RED}❌ Error de autorización${NC}"
            return 1
            ;;
        *)
            echo -e "${RED}❌ Error inesperado: $HTTP_CODE${NC}"
            return 1
            ;;
    esac
}

# Función principal
main() {
    echo -e "${YELLOW}🔍 Verificando si el servidor está ejecutándose...${NC}"
    
    # Verificar si el servidor responde
    if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
        echo -e "${RED}❌ El servidor no está respondiendo en $BASE_URL${NC}"
        echo -e "${YELLOW}💡 Asegúrate de que el servidor esté ejecutándose en el puerto 8080${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}✅ Servidor está respondiendo${NC}\n"
    
    # Obtener token de admin
    TOKEN=$(get_admin_token)
    
    if [ -z "$TOKEN" ]; then
        exit 1
    fi
    
    # Verificar rutas
    check_routes "$TOKEN"
    
    # Crear notificación de prueba
    NOTIFICATION_ID=$(create_test_notification "$TOKEN")
    
    if [ -z "$NOTIFICATION_ID" ]; then
        echo -e "${YELLOW}⚠️  No se pudo crear notificación, probando send-push con ID ficticio...${NC}"
        NOTIFICATION_ID="test-notification-id"
    fi
    
    # Probar send-push
    if test_send_push "$TOKEN" "$NOTIFICATION_ID"; then
        echo -e "\n${GREEN}🎉 Test completado exitosamente${NC}"
        echo -e "${GREEN}✅ La funcionalidad send-push está funcionando correctamente${NC}"
    else
        echo -e "\n${RED}❌ Test falló - La funcionalidad send-push necesita corrección${NC}"
        exit 1
    fi
}

# Ejecutar función principal
main "$@"
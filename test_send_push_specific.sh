#!/bin/bash

# Script para testear específicamente la nueva funcionalidad send-push

echo "🔧 Testeando endpoint /send-push corregido..."

# URL del API
API_URL="https://api.tradeoptix.app/api/v1"

echo "📝 1. Login como admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/users/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "admin@tradeoptix.com",
        "password": "admin123"
    }')

TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ Error: No se pudo obtener el token"
    echo "$LOGIN_RESPONSE"
    exit 1
fi

echo "✅ Token obtenido"

echo ""
echo "📤 2. Crear notificación de prueba..."
CREATE_RESPONSE=$(curl -s -X POST "$API_URL/admin/notifications/" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "title": "Test Push Notification",
        "message": "Esta es una notificación para testear send-push",
        "type": "info",
        "category": "system"
    }')

echo "Response: $CREATE_RESPONSE"
NOTIFICATION_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$NOTIFICATION_ID" ]; then
    echo "❌ Error: No se pudo crear la notificación"
    exit 1
fi

echo "✅ Notificación creada con ID: $NOTIFICATION_ID"

echo ""
echo "🚀 3. Testear endpoint send-push (NUEVO)..."
PUSH_RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/admin/notifications/$NOTIFICATION_ID/send-push" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$PUSH_RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$PUSH_RESPONSE" | sed 's/HTTP_CODE:.*$//')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "200" ]; then
    echo "✅ ¡Endpoint send-push funcionando correctamente!"
else
    echo "❌ Error en endpoint send-push (HTTP $HTTP_CODE)"
fi

echo ""
echo "📋 4. Verificar que la notificación fue marcada como enviada..."
LIST_RESPONSE=$(curl -s -X GET "$API_URL/admin/notifications/?page=1&limit=1" \
    -H "Authorization: Bearer $TOKEN")

echo "Latest notifications: $LIST_RESPONSE"

if echo "$LIST_RESPONSE" | grep -q '"is_push_sent":true'; then
    echo "✅ Notificación marcada correctamente como push enviada"
else
    echo "⚠️  La notificación podría no haberse marcado como enviada"
fi

echo ""
echo "🎯 Test completado!"
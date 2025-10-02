#!/bin/bash

# Test simple para verificar que el endpoint send-push existe

echo "🔧 Verificando que el endpoint send-push existe..."

API_URL="https://api.tradeoptix.app/api/v1"

echo "📍 Testeando ruta send-push sin autenticación (debería dar 401)..."

# Usar un ID dummy para testear que la ruta existe
DUMMY_ID="550e8400-e29b-41d4-a716-446655440000"

RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" -X POST "$API_URL/admin/notifications/$DUMMY_ID/send-push" \
    -H "Content-Type: application/json")

HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed 's/HTTP_CODE:.*$//')

echo "HTTP Status: $HTTP_CODE"
echo "Response: $BODY"

if [ "$HTTP_CODE" = "401" ]; then
    echo "✅ ¡Endpoint send-push existe! (401 = no autenticado, como esperado)"
    echo "✅ Corrección implementada exitosamente"
elif [ "$HTTP_CODE" = "404" ]; then
    echo "❌ Endpoint send-push no existe (404 Not Found)"
    echo "❌ La corrección no se ha deployado aún"
else
    echo "⚠️  Status inesperado: $HTTP_CODE"
    echo "Response: $BODY"
fi

echo ""
echo "📋 Para referencia, el error original era:"
echo "Request URL: https://api.tradeoptix.app/api/v1/admin/notifications/74a426a7-f6ef-42d8-bb78-93b02cda1d56/send-push"
echo "Status Code: 404 Not Found"
echo ""
echo "🎯 Test completado!"
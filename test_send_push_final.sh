#!/bin/bash

echo "=== Test de Send Push Notification ==="
echo ""

# 1. Login como admin
echo "1. Autenticando como admin..."
LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.com",
    "password": "admin123"
  }')

echo "Response: $LOGIN_RESPONSE"
echo ""

# Extraer token (sin jq, usando grep y sed)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | sed 's/"token":"//')

if [ -z "$TOKEN" ]; then
  echo "❌ Error: No se pudo obtener el token de autenticación"
  echo "Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token obtenido: ${TOKEN:0:50}..."
echo ""

# 2. Listar notificaciones
echo "2. Obteniendo lista de notificaciones..."
NOTIFICATIONS=$(curl -s -X GET http://localhost:8080/api/v1/admin/notifications \
  -H "Authorization: Bearer $TOKEN")

echo "Notificaciones disponibles:"
echo "$NOTIFICATIONS" | head -20
echo ""

# Obtener el primer ID de notificación
NOTIFICATION_ID=$(echo "$NOTIFICATIONS" | grep -o '"id":"[^"]*' | head -1 | sed 's/"id":"//')

if [ -z "$NOTIFICATION_ID" ]; then
  echo "❌ Error: No se encontraron notificaciones"
  exit 1
fi

echo "✅ Usando notificación ID: $NOTIFICATION_ID"
echo ""

# 3. Enviar push notification
echo "3. Enviando push notification..."
SEND_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST \
  "http://localhost:8080/api/v1/admin/notifications/$NOTIFICATION_ID/send-push" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Separar el cuerpo del código de estado
BODY=$(echo "$SEND_RESPONSE" | sed -e 's/HTTP_STATUS\:.*//g')
HTTP_CODE=$(echo "$SEND_RESPONSE" | tr -d '\n' | sed -e 's/.*HTTP_STATUS://')

echo "Status Code: $HTTP_CODE"
echo "Response Body: $BODY"
echo ""

# 4. Verificar resultado
if [ "$HTTP_CODE" = "200" ]; then
  echo "✅ Push notification enviada exitosamente!"
  echo ""
  echo "=== TEST EXITOSO ==="
else
  echo "❌ Error al enviar push notification"
  echo "Status: $HTTP_CODE"
  echo "Body: $BODY"
  echo ""
  echo "=== TEST FALLIDO ==="
  exit 1
fi

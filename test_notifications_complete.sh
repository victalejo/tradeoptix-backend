#!/bin/bash

# Test completo del sistema de notificaciones
echo "🧪 Testeando sistema completo de notificaciones..."

BASE_URL="https://api.tradeoptix.app/api/v1"

# 1. Test de health check
echo "1️⃣ Verificando que el servidor esté funcionando..."
curl -X GET "$BASE_URL/health" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# 2. Test de login (necesitamos token)
echo "2️⃣ Intentando login con diferentes credenciales..."

# Probar con admin/admin123
echo "Probando admin/admin123..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.com",
    "password": "admin123"
  }')

echo "Response: $LOGIN_RESPONSE"

# Extraer token si existe
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener token con admin/admin123"
    
    # Probar con admin/password
    echo "Probando admin/password..."
    LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
      -H "Content-Type: application/json" \
      -d '{
        "email": "admin@tradeoptix.com",
        "password": "password"
      }')
    
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
    
    if [ -z "$TOKEN" ]; then
        echo "❌ No se pudo obtener token con admin/password"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
fi

echo "✅ Token obtenido: ${TOKEN:0:20}..."

# 3. Test de listar notificaciones
echo -e "\n3️⃣ Testeando listado de notificaciones..."
curl -X GET "$BASE_URL/admin/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

# 4. Test de crear notificación
echo "4️⃣ Testeando creación de notificación..."
CREATE_RESPONSE=$(curl -s -X POST "$BASE_URL/admin/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Notification",
    "message": "Esta es una notificación de prueba para verificar el sistema",
    "type": "info"
  }')

echo "Response: $CREATE_RESPONSE"

# Extraer ID de la notificación creada
NOTIFICATION_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*' | cut -d'"' -f4)

if [ -n "$NOTIFICATION_ID" ]; then
    echo "✅ Notificación creada con ID: $NOTIFICATION_ID"
    
    # 5. Test de enviar push notification
    echo -e "\n5️⃣ Testeando envío de push notification..."
    curl -X POST "$BASE_URL/admin/notifications/$NOTIFICATION_ID/send-push" \
      -H "Authorization: Bearer $TOKEN" \
      -H "Content-Type: application/json" \
      -w "\nStatus: %{http_code}\n\n"
else
    echo "❌ No se pudo crear la notificación para testear send-push"
fi

# 6. Test de todas las rutas admin disponibles
echo "6️⃣ Verificando todas las rutas admin disponibles..."
echo "GET /admin/users:"
curl -X GET "$BASE_URL/admin/users" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "GET /admin/notifications:"
curl -X GET "$BASE_URL/admin/notifications" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -w "\nStatus: %{http_code}\n\n"

echo "🔍 Test completado!"
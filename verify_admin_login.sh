#!/bin/bash

echo "🔍 Verificando login del administrador..."
echo ""

# Configuración
BASE_URL="https://api.tradeoptix.app/api/v1"
EMAIL="admin@tradeoptix.com"
PASSWORD="admin123"

echo "📧 Email: $EMAIL"
echo "🔑 Password: $PASSWORD"
echo "🌐 URL: $BASE_URL/users/login"
echo ""

# Intentar login
echo "⏳ Intentando login..."
RESPONSE=$(curl -s -X POST "$BASE_URL/users/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"$PASSWORD\"
  }")

echo "📨 Respuesta del servidor:"
echo "$RESPONSE" | jq . 2>/dev/null || echo "$RESPONSE"
echo ""

# Verificar si se obtuvo token
TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

if [ -n "$TOKEN" ]; then
    echo "✅ LOGIN EXITOSO"
    echo "🎫 Token obtenido: ${TOKEN:0:30}..."
    
    # Verificar perfil
    echo ""
    echo "🔍 Verificando perfil del administrador..."
    PROFILE_RESPONSE=$(curl -s "$BASE_URL/users/profile" \
      -H "Authorization: Bearer $TOKEN")
    
    echo "👤 Perfil:"
    echo "$PROFILE_RESPONSE" | jq . 2>/dev/null || echo "$PROFILE_RESPONSE"
else
    echo "❌ ERROR DE LOGIN"
    echo "No se pudo obtener el token de autenticación"
fi

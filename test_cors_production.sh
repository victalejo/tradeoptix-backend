#!/bin/bash

# Test directo contra la API de producción para verificar CORS

echo "🔍 Testeando CORS en API de producción..."

BASE_URL="https://api.tradeoptix.app"

# Función para hacer login como admin y obtener token
get_admin_token() {
    echo "🔐 Obteniendo token de administrador..."
    
    RESPONSE=$(curl -s -X POST "$BASE_URL/api/v1/users/login" \
        -H "Content-Type: application/json" \
        -H "Origin: https://admin.tradeoptix.app" \
        -d '{
            "email": "admin@tradeoptix.app",
            "password": "admin123"
        }')
    
    # Intentar extraer token con diferentes métodos
    TOKEN=$(echo "$RESPONSE" | jq -r '.token // empty' 2>/dev/null)
    
    # Si jq no funciona, usar grep y sed
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*"' | sed 's/"token":"\([^"]*\)"/\1/')
    fi
    
    if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
        echo "❌ No se pudo obtener token de admin"
        echo "Respuesta: $RESPONSE"
        return 1
    fi
    
    echo "✅ Token obtenido exitosamente"
    return 0
}

# Test específico para noticias sin trailing slash
test_news_without_trailing_slash() {
    echo "📰 Testeando GET para /api/v1/admin/news (sin trailing slash)..."
    
    RESPONSE=$(curl -i -s -X GET "$BASE_URL/api/v1/admin/news?page=1&limit=50" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    echo "Respuesta:"
    echo "$RESPONSE"
    echo "---"
    
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Header Access-Control-Allow-Origin presente"
    else
        echo "❌ Header Access-Control-Allow-Origin FALTANTE"
    fi
    
    if echo "$RESPONSE" | grep -q "HTTP/1.1 301"; then
        echo "⚠️  Redirect 301 detectado"
    fi
}

# Test específico para noticias con trailing slash
test_news_with_trailing_slash() {
    echo "📰 Testeando GET para /api/v1/admin/news/ (con trailing slash)..."
    
    RESPONSE=$(curl -i -s -X GET "$BASE_URL/api/v1/admin/news/?page=1&limit=50" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    echo "Respuesta:"
    echo "$RESPONSE"
    echo "---"
    
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Header Access-Control-Allow-Origin presente"
    else
        echo "❌ Header Access-Control-Allow-Origin FALTANTE"
    fi
}

# Test específico para notificaciones
test_notifications() {
    echo "🔔 Testeando GET para /api/v1/admin/notifications..."
    
    RESPONSE=$(curl -i -s -X GET "$BASE_URL/api/v1/admin/notifications?page=1&limit=50" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    echo "Respuesta:"
    echo "$RESPONSE"
    echo "---"
    
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Header Access-Control-Allow-Origin presente"
    else
        echo "❌ Header Access-Control-Allow-Origin FALTANTE"
    fi
}

# Ejecutar tests
get_admin_token

if [ $? -eq 0 ]; then
    echo "================================================"
    echo "🧪 TESTING PRODUCCIÓN"
    echo "================================================"
    
    test_news_without_trailing_slash
    echo ""
    test_news_with_trailing_slash
    echo ""
    test_notifications
    
    echo "================================================"
    echo "🏁 TESTS COMPLETADOS"
    echo "================================================"
fi
#!/bin/bash

# Script para diagnosticar el problema de CORS específico con noticias y notificaciones

echo "🔍 Diagnosticando problema de CORS en rutas de noticias y notificaciones..."

# Verificar servidor
echo "📡 Verificando que el servidor esté ejecutándose..."
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Servidor local en puerto 8080 está activo"
elif curl -s https://api.tradeoptix.app/health > /dev/null 2>&1; then
    echo "✅ Servidor en producción está activo"
    BASE_URL="https://api.tradeoptix.app"
else
    echo "❌ No se puede conectar al servidor"
    exit 1
fi

# URL base
BASE_URL="${BASE_URL:-http://localhost:8080}"

echo "🌐 Usando BASE_URL: $BASE_URL"

# Función para hacer login como admin y obtener token
get_admin_token() {
    echo "🔐 Obteniendo token de administrador..."
    
    # Intentar login con credenciales de admin
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

# Test de preflight OPTIONS para noticias
test_news_preflight() {
    echo "🚀 Testeando preflight OPTIONS para /api/v1/admin/news..."
    
    RESPONSE=$(curl -i -s -X OPTIONS "$BASE_URL/api/v1/admin/news" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Authorization,Content-Type")
    
    echo "Respuesta OPTIONS:"
    echo "$RESPONSE"
    echo "---"
    
    # Verificar headers CORS en respuesta
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Header Access-Control-Allow-Origin presente en OPTIONS"
    else
        echo "❌ Header Access-Control-Allow-Origin FALTANTE en OPTIONS"
    fi
}

# Test de GET real para noticias
test_news_get() {
    echo "📰 Testeando GET real para /api/v1/admin/news..."
    
    if [ -z "$TOKEN" ]; then
        echo "❌ No hay token disponible para el test"
        return 1
    fi
    
    RESPONSE=$(curl -i -s -X GET "$BASE_URL/api/v1/admin/news?page=1&limit=50" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    echo "Respuesta GET:"
    echo "$RESPONSE"
    echo "---"
    
    # Verificar headers CORS en respuesta
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Header Access-Control-Allow-Origin presente en GET"
    else
        echo "❌ Header Access-Control-Allow-Origin FALTANTE en GET"
    fi
}

# Test de preflight OPTIONS para notificaciones
test_notifications_preflight() {
    echo "🔔 Testeando preflight OPTIONS para /api/v1/admin/notifications..."
    
    RESPONSE=$(curl -i -s -X OPTIONS "$BASE_URL/api/v1/admin/notifications" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Access-Control-Request-Method: GET" \
        -H "Access-Control-Request-Headers: Authorization,Content-Type")
    
    echo "Respuesta OPTIONS:"
    echo "$RESPONSE"
    echo "---"
    
    # Verificar headers CORS en respuesta
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Header Access-Control-Allow-Origin presente en OPTIONS"
    else
        echo "❌ Header Access-Control-Allow-Origin FALTANTE en OPTIONS"
    fi
}

# Test de comparación con ruta que funciona (dashboard)
test_dashboard_comparison() {
    echo "📊 Testeando ruta que funciona (dashboard) para comparación..."
    
    if [ -z "$TOKEN" ]; then
        echo "❌ No hay token disponible para el test"
        return 1
    fi
    
    RESPONSE=$(curl -i -s -X GET "$BASE_URL/api/v1/admin/dashboard/stats" \
        -H "Origin: https://admin.tradeoptix.app" \
        -H "Authorization: Bearer $TOKEN" \
        -H "Content-Type: application/json")
    
    echo "Respuesta Dashboard:"
    echo "$RESPONSE"
    echo "---"
    
    # Verificar headers CORS en respuesta
    if echo "$RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
        echo "✅ Dashboard tiene Access-Control-Allow-Origin"
    else
        echo "❌ Dashboard NO tiene Access-Control-Allow-Origin"
    fi
}

# Ejecutar tests
get_admin_token

echo "================================================"
echo "🧪 INICIANDO TESTS DE CORS"
echo "================================================"

test_news_preflight
echo ""
test_news_get
echo ""
test_notifications_preflight
echo ""
test_dashboard_comparison

echo "================================================"
echo "🏁 DIAGNÓSTICO COMPLETADO"
echo "================================================"
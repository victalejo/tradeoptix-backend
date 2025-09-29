#!/bin/bash

# Script para probar las funcionalidades de noticias y notificaciones del panel admin

API_URL="http://localhost:8080/api/v1"

echo "=== Prueba de Funcionalidades Admin ==="
echo ""

# Obtener token de admin (necesitas tener un usuario admin creado)
echo "1. Probando login de admin..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/users/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.app",
    "password": "admin123"
  }')

# Extraer token del response (esto es simplificado, en producción usarías jq)
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo "❌ No se pudo obtener el token de admin"
    echo "Respuesta: $LOGIN_RESPONSE"
    echo ""
    echo "Para crear un admin, ejecuta:"
    echo "PGPASSWORD=nrdys53kzx8amg50 psql -h 194.163.133.7 -p 1138 -U tradeoptix_user -d tradeoptix_db -f create_admin.sql"
    exit 1
fi

echo "✅ Token obtenido exitosamente"
echo ""

# Probar crear noticia
echo "2. Probando creación de noticia..."
CREATE_NEWS_RESPONSE=$(curl -s -X POST "$API_URL/admin/news" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Noticia de prueba desde API",
    "content": "Esta es una noticia creada desde el script de prueba para verificar que la funcionalidad funciona correctamente.",
    "summary": "Noticia de prueba creada via API",
    "category": "general",
    "priority": 5,
    "is_active": true
  }')

echo "Respuesta crear noticia: $CREATE_NEWS_RESPONSE"
echo ""

# Probar crear notificación
echo "3. Probando creación de notificación..."
CREATE_NOTIFICATION_RESPONSE=$(curl -s -X POST "$API_URL/admin/notifications" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Notificación de prueba desde API",
    "message": "Esta es una notificación creada desde el script de prueba para verificar que la funcionalidad funciona correctamente.",
    "type": "info",
    "category": "general"
  }')

echo "Respuesta crear notificación: $CREATE_NOTIFICATION_RESPONSE"
echo ""

# Probar obtener noticias
echo "4. Probando obtención de noticias..."
GET_NEWS_RESPONSE=$(curl -s -X GET "$API_URL/admin/news?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta obtener noticias (primeras 100 chars):"
echo "${GET_NEWS_RESPONSE:0:100}..."
echo ""

# Probar obtener estadísticas de noticias
echo "5. Probando estadísticas de noticias..."
NEWS_STATS_RESPONSE=$(curl -s -X GET "$API_URL/admin/news/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Estadísticas de noticias: $NEWS_STATS_RESPONSE"
echo ""

# Probar obtener notificaciones
echo "6. Probando obtención de notificaciones..."
GET_NOTIFICATIONS_RESPONSE=$(curl -s -X GET "$API_URL/admin/notifications?page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN")

echo "Respuesta obtener notificaciones (primeras 100 chars):"
echo "${GET_NOTIFICATIONS_RESPONSE:0:100}..."
echo ""

# Probar obtener estadísticas de notificaciones
echo "7. Probando estadísticas de notificaciones..."
NOTIFICATION_STATS_RESPONSE=$(curl -s -X GET "$API_URL/admin/notifications/stats" \
  -H "Authorization: Bearer $TOKEN")

echo "Estadísticas de notificaciones: $NOTIFICATION_STATS_RESPONSE"
echo ""

echo "=== Pruebas completadas ==="
echo ""
echo "Para acceder al panel admin web, ve a: http://localhost:3004"
echo "Para probar la app móvil, ve a: http://localhost:8082"
#!/bin/bash

# Script para probar la corrección de notificaciones
echo "🔧 Probando la corrección del endpoint de notificaciones..."

# Token de prueba (usar un token válido en producción)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFkbWluQHRyYWRlb3B0aXguYXBwIiwiZXhwIjoxNzU5Mjg0ODU0LCJyb2xlIjoiYWRtaW4iLCJ1c2VyX2lkIjoiNWIxNTY2NmMtN2E1ZC00ZGI1LWI1YTQtODE3MzEzNmM5ZTNhIn0.x_bckj5XlMRnUoQNXCv4R1SrP8aUvBy1sGSsychrkac"

echo "📍 Probando servidor local..."
echo "1. Ruta de health:"
curl -s http://localhost:8080/health || echo "❌ Error en health local"

echo -e "\n2. Notificaciones locales (con trailing slash):"
curl -s -H "Authorization: Bearer $TOKEN" "http://localhost:8080/api/v1/notifications/" || echo "❌ Error en notificaciones local"

echo -e "\n📍 Probando servidor de producción..."
echo "1. Ruta de health:"
curl -s https://api.tradeoptix.app/health || echo "❌ Error en health producción"

echo -e "\n2. Notificaciones producción (con trailing slash):"
curl -s -H "Authorization: Bearer $TOKEN" "https://api.tradeoptix.app/api/v1/notifications/" || echo "❌ Error en notificaciones producción"

echo -e "\n3. Notificaciones producción con parámetros (CORREGIDO):"
curl -s -H "Authorization: Bearer $TOKEN" "https://api.tradeoptix.app/api/v1/notifications/?page=1&limit=20&unread_only=false" || echo "❌ Error en notificaciones con parámetros"

echo -e "\n4. Contador de no leídas:"
curl -s -H "Authorization: Bearer $TOKEN" "https://api.tradeoptix.app/api/v1/notifications/unread-count" || echo "❌ Error en contador"

echo -e "\n✅ Pruebas completadas. Si todos los endpoints devuelven JSON válido, la corrección fue exitosa."
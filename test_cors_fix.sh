#!/bin/bash

echo "🔧 Probando configuración CORS..."

# Probar health check
echo "1. Verificando que el backend esté funcionando..."
HEALTH=$(curl -s http://localhost:8080/health)
if [[ $? -eq 0 ]]; then
    echo "   ✅ Backend funcionando correctamente"
else
    echo "   ❌ Backend no está respondiendo"
    exit 1
fi

# Probar CORS para localhost:3001
echo "2. Probando CORS para localhost:3001..."
CORS_RESPONSE=$(curl -s -H "Origin: http://localhost:3001" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    -X OPTIONS \
    http://localhost:8080/api/v1/admin/news \
    -w "HTTP_CODE:%{http_code}")

if [[ $CORS_RESPONSE =~ "HTTP_CODE:204" ]]; then
    echo "   ✅ CORS configurado correctamente para localhost:3001"
else
    echo "   ❌ CORS no está funcionando correctamente"
    echo "   Respuesta: $CORS_RESPONSE"
fi

# Probar CORS para admin.tradeoptix.app
echo "3. Probando CORS para admin.tradeoptix.app..."
CORS_RESPONSE2=$(curl -s -H "Origin: https://admin.tradeoptix.app" \
    -H "Access-Control-Request-Method: GET" \
    -H "Access-Control-Request-Headers: Content-Type,Authorization" \
    -X OPTIONS \
    http://localhost:8080/api/v1/admin/news \
    -w "HTTP_CODE:%{http_code}")

if [[ $CORS_RESPONSE2 =~ "HTTP_CODE:204" ]]; then
    echo "   ✅ CORS configurado correctamente para admin.tradeoptix.app"
else
    echo "   ❌ CORS no está funcionando para admin.tradeoptix.app"
    echo "   Respuesta: $CORS_RESPONSE2"
fi

echo ""
echo "🌐 URLs disponibles:"
echo "   Frontend Admin: http://localhost:3001"
echo "   Backend API: http://localhost:8080"
echo "   Documentación: http://localhost:8080/docs/"
echo ""
echo "🎯 Para probar:"
echo "   1. Ve a http://localhost:3001"
echo "   2. Inicia sesión con tus credenciales de admin"
echo "   3. Navega a Noticias o Notificaciones"
echo "   4. El error de CORS debería estar resuelto"
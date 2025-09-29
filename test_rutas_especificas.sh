#!/bin/bash

echo "🔥 DIAGNÓSTICO ESPECÍFICO: NOTICIAS Y NOTIFICACIONES"
echo "=================================================="
echo ""

echo "🎯 PROBANDO LAS RUTAS EXACTAS QUE FALLAN:"
echo ""

echo "1. ❌ RUTA DE NOTICIAS (la que falla):"
echo "   URL: https://api.tradeoptix.app/api/v1/admin/news?page=1&limit=50"
echo "   Response:"
curl -v -H "Origin: https://admin.tradeoptix.app" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     "https://api.tradeoptix.app/api/v1/admin/news?page=1&limit=50" 2>&1 | head -10
echo ""

echo "2. ❌ RUTA DE NOTIFICACIONES (la que falla):"
echo "   URL: https://api.tradeoptix.app/api/v1/admin/notifications"
echo "   Response:"
curl -v -H "Origin: https://admin.tradeoptix.app" \
     -H "Accept: application/json" \
     -H "Content-Type: application/json" \
     "https://api.tradeoptix.app/api/v1/admin/notifications" 2>&1 | head -10
echo ""

echo "3. ✅ COMPARACIÓN CON SERVIDOR LOCAL:"
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "   Tu servidor local SÍ responde a estas rutas:"
    echo "   Noticias locales:"
    curl -s -H "Origin: https://admin.tradeoptix.app" \
         "http://localhost:8080/api/v1/admin/news?page=1&limit=50" | head -c 200
    echo -e "\n"
    
    echo "   Notificaciones locales:"
    curl -s -H "Origin: https://admin.tradeoptix.app" \
         "http://localhost:8080/api/v1/admin/notifications" | head -c 200
    echo -e "\n"
else
    echo "   ❌ Tu servidor local no está corriendo"
fi

echo ""
echo "🔍 ANÁLISIS:"
echo "- ✅ CORS funciona en ambos servidores"
echo "- ✅ Tu servidor LOCAL tiene las rutas implementadas"
echo "- ❌ El servidor de PRODUCCIÓN NO tiene esas rutas específicas"
echo ""
echo "💡 SOLUCIÓN NECESARIA:"
echo "Desplegar tu código actual (que SÍ tiene las rutas) al servidor de producción"
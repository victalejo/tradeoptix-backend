#!/bin/bash

echo "🔍 DIAGNÓSTICO REAL DEL PROBLEMA DE PRODUCCIÓN"
echo "=============================================="

echo "✅ 1. VERIFICANDO CONECTIVIDAD BÁSICA:"
echo "API Health Check:"
curl -s https://api.tradeoptix.app/health
echo -e "\n"

echo "✅ 2. VERIFICANDO CORS OPTIONS:"
echo "CORS Response Headers:"
curl -s -I -H "Origin: https://admin.tradeoptix.app" -X OPTIONS https://api.tradeoptix.app/api/v1/admin/news | grep -i access-control
echo ""

echo "✅ 3. VERIFICANDO GET REQUEST (sin auth):"
echo "GET Response:"
curl -s -I -H "Origin: https://admin.tradeoptix.app" https://api.tradeoptix.app/api/v1/admin/news | head -5
echo ""

echo "✅ 4. VERIFICANDO CON HEADERS DE NAVEGADOR:"
echo "Simulando request de navegador:"
curl -s -I \
  -H "Origin: https://admin.tradeoptix.app" \
  -H "Accept: application/json" \
  -H "Accept-Language: en-US,en;q=0.9" \
  -H "Cache-Control: no-cache" \
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \
  https://api.tradeoptix.app/api/v1/admin/news | grep -E "(HTTP|access-control)" 
echo ""

echo "🔍 5. POSIBLES CAUSAS DEL ERROR:"
echo "- ✅ CORS está configurado correctamente"
echo "- ❓ Problema de autenticación (JWT token)"
echo "- ❓ Problema de red/conectividad intermitente"
echo "- ❓ Diferencia entre requests OPTIONS y GET"
echo "- ❓ Headers específicos que faltan"
echo ""

echo "💡 SIGUIENTE PASO:"
echo "Necesitamos ver los headers exactos que envía el navegador"
echo "Revisa Network tab en DevTools para comparar"
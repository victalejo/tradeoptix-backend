#!/bin/bash

echo "🔧 Probando CORS y funcionalidad completa del sistema TradeOptix..."

API_URL="http://localhost:8080"
ADMIN_URL="http://localhost:3001"

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}1. Verificando que el servidor backend esté corriendo...${NC}"
if curl -s "$API_URL/health" > /dev/null; then
    echo -e "${GREEN}✅ Backend está corriendo en $API_URL${NC}"
else
    echo -e "${RED}❌ Backend no está corriendo. Iniciándolo...${NC}"
    make run &
    sleep 5
fi

echo -e "${YELLOW}2. Probando CORS headers para admin frontend...${NC}"
CORS_RESPONSE=$(curl -s -I -X OPTIONS \
  -H "Origin: http://localhost:3001" \
  -H "Access-Control-Request-Method: GET" \
  -H "Access-Control-Request-Headers: Authorization,Content-Type" \
  "$API_URL/api/v1/admin/news")

if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
    echo -e "${GREEN}✅ CORS headers están presentes${NC}"
    echo "$CORS_RESPONSE" | grep "Access-Control"
else
    echo -e "${RED}❌ CORS headers no encontrados${NC}"
    echo "Response: $CORS_RESPONSE"
fi

echo -e "${YELLOW}3. Probando endpoints principales...${NC}"

# Test health endpoint
echo "Probando /health..."
curl -s "$API_URL/health" | head -c 100
echo

# Test CORS en rutas específicas
echo -e "${YELLOW}4. Probando CORS específico para noticias y notificaciones...${NC}"

echo "Probando GET /api/v1/admin/news con CORS..."
curl -s -I -H "Origin: http://localhost:3001" "$API_URL/api/v1/admin/news" | grep -E "(HTTP|Access-Control)"

echo "Probando GET /api/v1/admin/notifications con CORS..."
curl -s -I -H "Origin: http://localhost:3001" "$API_URL/api/v1/admin/notifications" | grep -E "(HTTP|Access-Control)"

echo -e "${YELLOW}5. Verificando que el admin frontend esté corriendo...${NC}"
if curl -s "$ADMIN_URL" > /dev/null; then
    echo -e "${GREEN}✅ Admin frontend está corriendo en $ADMIN_URL${NC}"
else
    echo -e "${RED}❌ Admin frontend no está corriendo en $ADMIN_URL${NC}"
    echo "Para iniciarlo, ejecuta:"
    echo "cd admin-frontend && npm run dev"
fi

echo -e "${YELLOW}6. Resumen de configuración:${NC}"
echo "• Backend: $API_URL"
echo "• Admin Frontend: $ADMIN_URL"
echo "• CORS configurado para: http://localhost:3000, http://localhost:3001"
echo "• Variables de entorno en admin-frontend/.env.local:"
cat admin-frontend/.env.local 2>/dev/null || echo "  (archivo no encontrado)"

echo -e "\n${GREEN}🎯 PASOS PARA PROBAR:${NC}"
echo "1. Abre el navegador en: $ADMIN_URL"
echo "2. Inicia sesión con tus credenciales de admin"
echo "3. Ve a la sección de Noticias o Notificaciones"
echo "4. Verifica que no aparezcan errores de CORS"

echo -e "\n${YELLOW}💡 Si sigues teniendo problemas:${NC}"
echo "• Verifica la consola del navegador (F12)"
echo "• Asegúrate de que ambos servidores estén corriendo"
echo "• Revisa que las URLs en el frontend coincidan con las del backend"
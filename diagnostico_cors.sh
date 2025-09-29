#!/bin/bash

echo "🔍 DIAGNÓSTICO DEL PROBLEMA CORS"
echo "================================"
echo ""

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${YELLOW}📊 INFORMACIÓN DETECTADA:${NC}"
echo ""
echo "❌ ERROR REPORTADO:"
echo "• Origin: https://admin.tradeoptix.app (PRODUCCIÓN)"
echo "• Target: https://api.tradeoptix.app (PRODUCCIÓN)"
echo "• Problem: No 'Access-Control-Allow-Origin' header"
echo ""

echo -e "${BLUE}🔍 ANÁLISIS:${NC}"
echo "Estás usando la aplicación de PRODUCCIÓN, no la local."
echo "El servidor local que configuramos NO afecta el servidor de producción."
echo ""

echo -e "${YELLOW}💡 SOLUCIONES DISPONIBLES:${NC}"
echo ""
echo -e "${GREEN}OPCIÓN 1: USAR DESARROLLO LOCAL (Recomendado)${NC}"
echo "• Acceder a: http://localhost:3001"
echo "• Backend: http://localhost:8080"
echo "• CORS: Ya configurado y funcionando"
echo ""

echo -e "${BLUE}OPCIÓN 2: CONFIGURAR PRODUCCIÓN${NC}"
echo "• Configurar CORS en el servidor de producción (api.tradeoptix.app)"
echo "• Requiere acceso al servidor de producción"
echo "• Más complejo de implementar"
echo ""

echo -e "${YELLOW}🚀 PASOS INMEDIATOS:${NC}"
echo ""
echo "1. PARA DESARROLLO LOCAL:"
echo "   • Abre: http://localhost:3001"
echo "   • Inicia sesión"
echo "   • Prueba Noticias y Notificaciones"
echo ""

echo "2. VERIFICAR SERVICIOS LOCALES:"
# Verificar backend
echo -n "   Backend (8080): "
if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${RED}❌ NO DISPONIBLE${NC}"
    echo "     Ejecutar: make run"
fi

# Verificar frontend
echo -n "   Frontend (3001): "
if curl -s http://localhost:3001 > /dev/null 2>&1; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
else
    echo -e "${RED}❌ NO DISPONIBLE${NC}"
    echo "     Ejecutar: cd admin-frontend && npm run dev"
fi

echo ""
echo -e "${YELLOW}3. VERIFICAR CORS LOCAL:${NC}"
CORS_TEST=$(curl -s -H "Origin: http://localhost:3001" -X OPTIONS http://localhost:8080/api/v1/admin/news 2>/dev/null | grep -c "Access-Control-Allow-Origin")
if [ "$CORS_TEST" -gt 0 ]; then
    echo -e "   ${GREEN}✅ CORS LOCAL: FUNCIONANDO${NC}"
else
    echo -e "   ${RED}❌ CORS LOCAL: NO DISPONIBLE${NC}"
fi

echo ""
echo -e "${BLUE}📋 CONFIGURACIÓN ACTUAL:${NC}"
echo "• Variables de entorno locales:"
if [ -f "admin-frontend/.env.local" ]; then
    cat admin-frontend/.env.local | grep -E "(NEXT_PUBLIC_API_URL|NEXT_PUBLIC_APP_NAME)" | sed 's/^/  /'
fi

echo ""
echo -e "${GREEN}🎯 RECOMENDACIÓN:${NC}"
echo "Usa el entorno de desarrollo local para resolver el problema CORS:"
echo "• Más fácil de debuggear"
echo "• CORS ya configurado"
echo "• Misma funcionalidad que producción"
echo ""
echo "Una vez que funcione en local, podemos replicar la configuración a producción."
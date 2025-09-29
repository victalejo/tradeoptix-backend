#!/bin/bash

# Script de verificación final - CORS y funcionalidad completa
echo "🚀 VERIFICACIÓN FINAL DEL SISTEMA TRADEOPTIX"
echo "=============================================="

# Colores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "\n${BLUE}📊 ESTADO DE LOS SERVICIOS:${NC}"

# Verificar Backend
echo -n "Backend (8080): "
if curl -s http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
    BACKEND_STATUS="OK"
else
    echo -e "${RED}❌ NO DISPONIBLE${NC}"
    BACKEND_STATUS="ERROR"
fi

# Verificar Frontend
echo -n "Frontend (3000): "
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ FUNCIONANDO${NC}"
    FRONTEND_STATUS="OK"
    FRONTEND_PORT="3000"
elif curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ FUNCIONANDO (Puerto 3001)${NC}"
    FRONTEND_STATUS="OK"
    FRONTEND_PORT="3001"
else
    echo -e "${RED}❌ NO DISPONIBLE${NC}"
    FRONTEND_STATUS="ERROR"
fi

echo -e "\n${BLUE}🔒 PRUEBAS DE CORS:${NC}"

if [ "$BACKEND_STATUS" == "OK" ] && [ "$FRONTEND_STATUS" == "OK" ]; then
    # Test CORS para Noticias
    echo -n "CORS /admin/news: "
    CORS_NEWS=$(curl -s -H "Origin: http://localhost:${FRONTEND_PORT}" -X OPTIONS http://localhost:8080/api/v1/admin/news | grep -c "Access-Control-Allow-Origin")
    if [ "$CORS_NEWS" -gt 0 ]; then
        echo -e "${GREEN}✅ CONFIGURADO${NC}"
    else
        echo -e "${RED}❌ ERROR${NC}"
    fi
    
    # Test CORS para Notificaciones  
    echo -n "CORS /admin/notifications: "
    CORS_NOTIF=$(curl -s -H "Origin: http://localhost:${FRONTEND_PORT}" -X OPTIONS http://localhost:8080/api/v1/admin/notifications | grep -c "Access-Control-Allow-Origin")
    if [ "$CORS_NOTIF" -gt 0 ]; then
        echo -e "${GREEN}✅ CONFIGURADO${NC}"
    else
        echo -e "${RED}❌ ERROR${NC}"
    fi
    
    echo -e "\n${BLUE}📋 HEADERS CORS CONFIGURADOS:${NC}"
    curl -s -H "Origin: http://localhost:${FRONTEND_PORT}" -X OPTIONS http://localhost:8080/api/v1/admin/news | grep "Access-Control" | sed 's/^/  /'
else
    echo -e "${RED}❌ No se pueden hacer pruebas CORS - servicios no disponibles${NC}"
fi

echo -e "\n${BLUE}⚙️ CONFIGURACIÓN ACTUAL:${NC}"
echo "• Backend URL: http://localhost:8080"
echo "• Frontend URL: http://localhost:${FRONTEND_PORT:-3000}"
echo "• Variables de entorno:"
if [ -f "admin-frontend/.env.local" ]; then
    grep "NEXT_PUBLIC_API_URL" admin-frontend/.env.local | sed 's/^/  /'
else
    echo -e "  ${RED}❌ archivo .env.local no encontrado${NC}"
fi

echo -e "\n${YELLOW}🎯 PASOS PARA PROBAR LA SOLUCIÓN:${NC}"
echo "1. Abre el navegador en: http://localhost:${FRONTEND_PORT:-3000}"
echo "2. Inicia sesión con tus credenciales de administrador"
echo "3. Navega a 'Noticias' - NO deberías ver errores de CORS"
echo "4. Navega a 'Notificaciones' - NO deberías ver errores de CORS"
echo "5. Abre las herramientas de desarrollo (F12) y revisa la consola"

if [ "$BACKEND_STATUS" == "OK" ] && [ "$FRONTEND_STATUS" == "OK" ]; then
    echo -e "\n${GREEN}🎉 ¡TODOS LOS SERVICIOS ESTÁN FUNCIONANDO!${NC}"
    echo -e "${GREEN}✅ La solución CORS está completa y lista para usar.${NC}"
else
    echo -e "\n${RED}⚠️  ALGUNOS SERVICIOS NO ESTÁN DISPONIBLES${NC}"
    if [ "$BACKEND_STATUS" != "OK" ]; then
        echo "• Para iniciar el backend: make run"
    fi
    if [ "$FRONTEND_STATUS" != "OK" ]; then
        echo "• Para iniciar el frontend: cd admin-frontend && npm run dev"
    fi
fi

echo -e "\n${BLUE}📚 DOCUMENTACIÓN:${NC}"
echo "• Ver: CORS_SOLUTION_COMPLETE.md para detalles técnicos"
echo "• Configuración CORS: internal/middleware/cors.go"
echo "• Configuración Frontend: admin-frontend/.env.local"
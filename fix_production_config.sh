#!/bin/bash

echo "🔧 CORRIENDO CONFIGURACIÓN DE PRODUCCIÓN"
echo "========================================"

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}📋 Verificando configuración actual...${NC}"

# Verificar si estamos en el servidor correcto
if ! curl -s --max-time 5 http://localhost:8080/health > /dev/null; then
    echo -e "${RED}❌ El servidor no está corriendo en localhost:8080${NC}"
    echo -e "${YELLOW}💡 Asegúrate de que el servidor esté ejecutándose${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Servidor corriendo en localhost:8080${NC}"

# Crear archivo .env con configuración correcta
echo -e "${YELLOW}📝 Creando configuración de producción...${NC}"

cat > .env << 'EOF'
# Variables de entorno para producción
PORT=8080
ENVIRONMENT=production
DATABASE_URL=postgresql://tradeoptix_user:nrdys53kzx8amg50@194.163.133.7:1138/tradeoptix_db?sslmode=disable
JWT_SECRET=dJxPh6PwKyyZcVRnVkbzMY51SftP37fy

# Configuración de base de datos
DB_HOST=194.163.133.7
DB_PORT=1138
DB_USER=tradeoptix_user
DB_PASSWORD=nrdys53kzx8amg50
DB_NAME=tradeoptix_db

# Configuración de archivos
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880

# Configuración CORS para producción
ALLOWED_ORIGINS=https://admin.tradeoptix.app,https://app.tradeoptix.app,https://tradeoptix.app,http://localhost:3000,http://localhost:3004,http://localhost:8082,http://localhost:3001

# Configuración de logging
LOG_LEVEL=info
EOF

echo -e "${GREEN}✅ Archivo .env creado con configuración correcta${NC}"

# Reiniciar el servidor
echo -e "${YELLOW}🔄 Reiniciando servidor...${NC}"

# Matar proceso anterior si existe
pkill -f "tradeoptix-server" || true

# Esperar un momento
sleep 2

# Iniciar servidor en background
nohup ./bin/tradeoptix-server > server.log 2>&1 &

# Esperar que inicie
sleep 3

# Verificar que esté corriendo
if curl -s --max-time 5 http://localhost:8080/health > /dev/null; then
    echo -e "${GREEN}✅ Servidor reiniciado correctamente${NC}"

    # Probar login
    echo -e "${YELLOW}🔐 Probando login del admin...${NC}"
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:8080/api/v1/users/login \
        -H "Content-Type: application/json" \
        -d '{"email": "admin@tradeoptix.com", "password": "admin123"}')

    if echo "$LOGIN_RESPONSE" | grep -q "token"; then
        echo -e "${GREEN}✅ Login funcionando correctamente${NC}"
        echo -e "${GREEN}🎉 ¡PRODUCCIÓN CONFIGURADA CORRECTAMENTE!${NC}"
    else
        echo -e "${RED}❌ Error en login: $LOGIN_RESPONSE${NC}"
    fi
else
    echo -e "${RED}❌ Error al reiniciar el servidor${NC}"
    echo -e "${YELLOW}📋 Revisa los logs:${NC}"
    tail -20 server.log
fi

echo ""
echo -e "${YELLOW}📊 URLs disponibles en producción:${NC}"
echo "  🌐 Health: http://localhost:8080/health"
echo "  🔐 Login: http://localhost:8080/api/v1/users/login"
echo "  👑 Admin: http://localhost:8080/api/v1/admin/*"
echo ""
echo -e "${GREEN}🚀 ¡Listo para producción!${NC}"
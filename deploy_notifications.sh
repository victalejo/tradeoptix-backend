#!/bin/bash

echo "🚀 Deployment de Solución de Notificaciones"
echo "==========================================="
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Compilar el backend
echo -e "${YELLOW}📦 Paso 1: Compilando el backend...${NC}"
cd /home/victalejo/tradeoptix-back
go build -o bin/tradeoptix-server cmd/server/main.go

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backend compilado exitosamente${NC}"
else
    echo -e "${RED}❌ Error al compilar el backend${NC}"
    exit 1
fi
echo ""

# 2. Verificar que el binario existe
echo -e "${YELLOW}🔍 Paso 2: Verificando binario...${NC}"
if [ -f "bin/tradeoptix-server" ]; then
    echo -e "${GREEN}✅ Binario encontrado${NC}"
    ls -lh bin/tradeoptix-server
else
    echo -e "${RED}❌ Binario no encontrado${NC}"
    exit 1
fi
echo ""

# 3. Detener el servidor actual (si está ejecutándose)
echo -e "${YELLOW}🛑 Paso 3: Deteniendo servidor actual...${NC}"
pkill tradeoptix-server 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Servidor detenido${NC}"
else
    echo -e "${YELLOW}⚠️  No había servidor ejecutándose${NC}"
fi
sleep 2
echo ""

# 4. Verificar configuración
echo -e "${YELLOW}⚙️  Paso 4: Verificando configuración...${NC}"
if [ -f ".env" ]; then
    echo -e "${GREEN}✅ Archivo .env encontrado${NC}"
    echo "Configuración de base de datos:"
    cat .env | grep -E "DB_HOST|DB_USER|DB_NAME" | sed 's/^/  /'
else
    echo -e "${RED}❌ Archivo .env no encontrado${NC}"
    exit 1
fi
echo ""

# 5. Iniciar el servidor
echo -e "${YELLOW}🚀 Paso 5: Iniciando servidor...${NC}"
nohup ./bin/tradeoptix-server > server.log 2>&1 &
SERVER_PID=$!
echo "PID del servidor: $SERVER_PID"
sleep 3

# Verificar que el servidor esté ejecutándose
if ps -p $SERVER_PID > /dev/null; then
    echo -e "${GREEN}✅ Servidor iniciado correctamente${NC}"
else
    echo -e "${RED}❌ Error al iniciar el servidor${NC}"
    echo "Últimas líneas del log:"
    tail -20 server.log
    exit 1
fi
echo ""

# 6. Verificar las rutas
echo -e "${YELLOW}🔍 Paso 6: Verificando rutas...${NC}"
sleep 2
HEALTH_CHECK=$(curl -s http://localhost:8080/health)
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Health check exitoso: $HEALTH_CHECK${NC}"
else
    echo -e "${RED}❌ Health check falló${NC}"
    exit 1
fi
echo ""

# 7. Verificar que la nueva ruta esté disponible
echo -e "${YELLOW}🔍 Paso 7: Verificando nueva ruta /send-push...${NC}"
grep -q "notifications/:id/send-push" server.log
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Ruta /send-push registrada correctamente${NC}"
    grep "notifications/:id/send-push" server.log | tail -1
else
    echo -e "${RED}❌ Ruta /send-push no encontrada en los logs${NC}"
fi
echo ""

# 8. Mostrar todas las rutas de notificaciones
echo -e "${YELLOW}📋 Rutas de notificaciones disponibles:${NC}"
grep "notifications" server.log | grep -E "POST|GET|PUT|DELETE" | sed 's/^/  /'
echo ""

# 9. Resumen final
echo "==========================================="
echo -e "${GREEN}✅ DEPLOYMENT COMPLETADO${NC}"
echo "==========================================="
echo ""
echo "📊 Información del servidor:"
echo "  - PID: $SERVER_PID"
echo "  - Puerto: 8080"
echo "  - Log: server.log"
echo ""
echo "🧪 Para probar la nueva funcionalidad, ejecuta:"
echo "  ./test_send_push_final.sh"
echo ""
echo "📝 Ver logs en tiempo real:"
echo "  tail -f server.log"
echo ""

#!/bin/bash

# Script para solucionar problemas de CORS en TradeOptix

echo "🔧 TradeOptix - Solucionador de CORS"
echo "===================================="

# Función para mostrar el menú
show_menu() {
    echo ""
    echo "Selecciona una opción:"
    echo "1. Configurar para desarrollo (localhost)"
    echo "2. Configurar para producción (tradeoptix.app)"
    echo "3. Configurar CORS personalizado"
    echo "4. Probar conectividad API"
    echo "5. Reconstruir y reiniciar backend"
    echo "6. Salir"
    echo ""
}

# Función para desarrollo
setup_development() {
    echo "📦 Configurando para DESARROLLO..."
    
    # Cargar variables de desarrollo
    if [ -f ".env.development" ]; then
        source .env.development
        echo "✅ Variables de desarrollo cargadas"
    fi
    
    # Compilar backend
    echo "🔨 Compilando backend..."
    make build
    
    # Iniciar backend en background
    echo "🚀 Iniciando backend en puerto 8080..."
    ./bin/tradeoptix-server > server.log 2>&1 &
    
    echo "✅ Backend configurado para desarrollo"
    echo "   - API URL: http://localhost:8080"
    echo "   - CORS permitido: localhost:3000, localhost:3004, localhost:8082"
}

# Función para producción
setup_production() {
    echo "📦 Configurando para PRODUCCIÓN..."
    
    # Cargar variables de producción
    if [ -f ".env.production" ]; then
        source .env.production
        echo "✅ Variables de producción cargadas"
    fi
    
    # Compilar backend
    echo "🔨 Compilando backend..."
    make build
    
    echo "✅ Backend configurado para producción"
    echo "   - API URL: https://api.tradeoptix.app"
    echo "   - CORS permitido: admin.tradeoptix.app, app.tradeoptix.app"
}

# Función para CORS personalizado
setup_custom_cors() {
    echo "🎯 Configuración CORS personalizada"
    echo ""
    echo "Ingresa los orígenes permitidos separados por comas:"
    echo "Ejemplo: https://admin.tradeoptix.app,https://app.tradeoptix.app"
    read -p "Orígenes: " custom_origins
    
    export ALLOWED_ORIGINS="$custom_origins"
    echo "✅ CORS configurado con: $custom_origins"
    
    # Reconstruir
    make build
    echo "✅ Backend recompilado con nueva configuración CORS"
}

# Función para probar conectividad
test_connectivity() {
    echo "🔍 Probando conectividad API..."
    
    # Probar localhost
    echo "Probando localhost:8080..."
    curl -s -o /dev/null -w "%{http_code}" http://localhost:8080/health
    local local_status=$?
    
    if [ $local_status -eq 0 ]; then
        echo "✅ Backend local responde correctamente"
    else
        echo "❌ Backend local no responde"
    fi
    
    # Probar CORS con curl
    echo ""
    echo "Probando CORS desde admin.tradeoptix.app..."
    curl -H "Origin: https://admin.tradeoptix.app" \
         -H "Access-Control-Request-Method: GET" \
         -H "Access-Control-Request-Headers: X-Requested-With" \
         -X OPTIONS \
         http://localhost:8080/api/v1/admin/news
    
    echo ""
    echo "Si ves 'Access-Control-Allow-Origin' en la respuesta, CORS está funcionando ✅"
}

# Función para reconstruir backend
rebuild_backend() {
    echo "🔄 Reconstruyendo y reiniciando backend..."
    
    # Matar procesos existentes
    pkill -f tradeoptix-server || echo "No hay procesos previos"
    
    # Limpiar y reconstruir
    make clean 2>/dev/null || echo "Limpieza completada"
    make build
    
    # Reiniciar
    echo "🚀 Reiniciando backend..."
    ./bin/tradeoptix-server > server.log 2>&1 &
    
    sleep 2
    
    # Verificar que está corriendo
    if pgrep -f tradeoptix-server > /dev/null; then
        echo "✅ Backend reiniciado exitosamente"
        echo "📋 Ver logs: tail -f server.log"
    else
        echo "❌ Error al reiniciar backend"
        echo "📋 Ver errores: cat server.log"
    fi
}

# Loop principal
while true; do
    show_menu
    read -p "Opción: " choice
    
    case $choice in
        1)
            setup_development
            ;;
        2)
            setup_production
            ;;
        3)
            setup_custom_cors
            ;;
        4)
            test_connectivity
            ;;
        5)
            rebuild_backend
            ;;
        6)
            echo "👋 ¡Hasta luego!"
            exit 0
            ;;
        *)
            echo "❌ Opción inválida"
            ;;
    esac
done
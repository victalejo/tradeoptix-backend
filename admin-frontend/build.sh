#!/bin/bash

# Script de build para diferentes entornos

echo "🚀 TradeOptix Admin - Script de Build"
echo "======================================"

# Función para desarrollo
build_dev() {
    echo "📦 Construyendo para DESARROLLO..."
    echo "API URL: http://localhost:8080"
    NODE_ENV=development npm run build
}

# Función para producción
build_prod() {
    echo "📦 Construyendo para PRODUCCIÓN..."
    echo "API URL: https://api.tradeoptix.app"
    NODE_ENV=production npm run build
}

# Función para ejecutar en desarrollo
dev() {
    echo "🔥 Ejecutando en modo DESARROLLO..."
    echo "API URL: http://localhost:8080"
    npm run dev
}

# Función para ejecutar en producción
start_prod() {
    echo "🚀 Ejecutando en modo PRODUCCIÓN..."
    echo "API URL: https://api.tradeoptix.app"
    npm start
}

# Verificar argumentos
case "$1" in
    "dev")
        dev
        ;;
    "build:dev")
        build_dev
        ;;
    "build:prod")
        build_prod
        ;;
    "start:prod")
        start_prod
        ;;
    *)
        echo "Uso: $0 {dev|build:dev|build:prod|start:prod}"
        echo ""
        echo "Comandos disponibles:"
        echo "  dev         - Ejecutar en modo desarrollo (localhost:8080)"
        echo "  build:dev   - Construir para desarrollo"
        echo "  build:prod  - Construir para producción (api.tradeoptix.app)"
        echo "  start:prod  - Ejecutar en modo producción"
        echo ""
        echo "Ejemplos:"
        echo "  $0 dev                    # Desarrollo local"
        echo "  $0 build:prod            # Build para producción"
        echo "  $0 start:prod            # Ejecutar en producción"
        exit 1
        ;;
esac
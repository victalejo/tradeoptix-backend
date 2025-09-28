#!/bin/bash

# TradeOptix - Comandos de desarrollo para todo el stack

echo "=== TradeOptix Full Stack Development Commands ==="

# Función para mostrar ayuda
show_help() {
    echo "Uso: ./dev-commands.sh [comando]"
    echo ""
    echo "🔧 Comandos Backend (Go):"
    echo "  backend:build      - Compilar backend"
    echo "  backend:run        - Ejecutar backend"
    echo "  backend:test       - Tests backend"
    echo "  backend:clean      - Limpiar compilados"
    echo ""
    echo "💻 Comandos Admin Frontend (Next.js):"
    echo "  admin:dev          - Servidor desarrollo admin"
    echo "  admin:build        - Compilar admin"
    echo "  admin:start        - Ejecutar admin en producción"
    echo ""
    echo "📱 Comandos Mobile App (React Native):"
    echo "  mobile:dev         - Servidor desarrollo móvil"
    echo "  mobile:android     - Ejecutar en Android"
    echo "  mobile:ios         - Ejecutar en iOS"
    echo "  mobile:build       - Build para producción"
    echo ""
    echo "🚀 Comandos Completos:"
    echo "  setup             - Configurar todo el proyecto"
    echo "  dev               - Iniciar todo en desarrollo"
    echo "  build:all         - Compilar todo"
    echo "  clean:all         - Limpiar todo"
    echo "  help              - Mostrar esta ayuda"
}

# === BACKEND COMMANDS ===
backend_build() {
    echo "🔨 Compilando backend..."
    go build -o bin/tradeoptix-server cmd/server/main.go
    echo "✅ Backend compilado"
}

backend_run() {
    echo "🚀 Iniciando backend..."
    go run cmd/server/main.go
}

backend_test() {
    echo "🧪 Ejecutando tests backend..."
    go test ./...
}

backend_clean() {
    echo "🧹 Limpiando backend..."
    rm -f bin/*
    echo "✅ Backend limpio"
}

# === ADMIN FRONTEND COMMANDS ===
admin_dev() {
    echo "💻 Iniciando servidor desarrollo admin..."
    cd admin-frontend && npm run dev
}

admin_build() {
    echo "🔨 Compilando admin frontend..."
    cd admin-frontend && npm run build
    echo "✅ Admin frontend compilado"
}

admin_start() {
    echo "🚀 Iniciando admin en producción..."
    cd admin-frontend && npm run start
}

# === MOBILE APP COMMANDS ===
mobile_dev() {
    echo "📱 Iniciando servidor desarrollo móvil..."
    cd tradeoptix-app && npx expo start
}

mobile_android() {
    echo "📱 Ejecutando en Android..."
    cd tradeoptix-app && npx expo start --android
}

mobile_ios() {
    echo "📱 Ejecutando en iOS..."
    cd tradeoptix-app && npx expo start --ios
}

mobile_build() {
    echo "🔨 Build móvil para producción..."
    cd tradeoptix-app && npx eas build --platform all
}

# === SETUP COMMANDS ===
setup_project() {
    echo "🛠️ Configurando proyecto completo..."
    
    # Backend
    echo "📦 Instalando dependencias backend..."
    go mod tidy
    
    # Admin Frontend
    echo "💻 Instalando dependencias admin frontend..."
    cd admin-frontend && npm install && cd ..
    
    # Mobile App
    echo "📱 Instalando dependencias móvil..."
    cd tradeoptix-app && npm install && cd ..
    
    echo "✅ Setup completo"
}

dev_all() {
    echo "🚀 Iniciando desarrollo completo..."
    echo "Esto iniciará:"
    echo "- Backend en puerto 8080"
    echo "- Admin Frontend en puerto 3000"
    echo "- Mobile App con Expo"
    echo ""
    
    # Iniciar backend en background
    echo "🔧 Iniciando backend..."
    go run cmd/server/main.go &
    BACKEND_PID=$!
    
    sleep 3
    
    # Iniciar admin frontend en background
    echo "💻 Iniciando admin frontend..."
    cd admin-frontend && npm run dev &
    ADMIN_PID=$!
    
    sleep 3
    
    # Iniciar mobile app
    echo "📱 Iniciando mobile app..."
    cd tradeoptix-app && npx expo start
    
    # Cleanup al salir
    trap "kill $BACKEND_PID $ADMIN_PID" EXIT
}

build_all() {
    echo "🔨 Compilando todo el stack..."
    backend_build
    admin_build
    mobile_build
    echo "✅ Todo compilado"
}

clean_all() {
    echo "🧹 Limpiando todo..."
    backend_clean
    
    # Limpiar admin
    if [ -d "admin-frontend" ]; then
        cd admin-frontend && rm -rf .next && cd ..
    fi
    
    # Limpiar mobile
    if [ -d "tradeoptix-app" ]; then
        cd tradeoptix-app && rm -rf .expo && cd ..
    fi
    
    echo "✅ Todo limpio"
}

# Procesar argumentos
case "$1" in
    # Backend
    "backend:build")
        backend_build
        ;;
    "backend:run")
        backend_run
        ;;
    "backend:test")
        backend_test
        ;;
    "backend:clean")
        backend_clean
        ;;
    
    # Admin Frontend
    "admin:dev")
        admin_dev
        ;;
    "admin:build")
        admin_build
        ;;
    "admin:start")
        admin_start
        ;;
    
    # Mobile App
    "mobile:dev")
        mobile_dev
        ;;
    "mobile:android")
        mobile_android
        ;;
    "mobile:ios")
        mobile_ios
        ;;
    "mobile:build")
        mobile_build
        ;;
    
    # Comandos completos
    "setup")
        setup_project
        ;;
    "dev")
        dev_all
        ;;
    "build:all")
        build_all
        ;;
    "clean:all")
        clean_all
        ;;
    
    "help"|"")
        show_help
        ;;
    *)
        echo "❌ Comando desconocido: $1"
        show_help
        exit 1
        ;;
esac
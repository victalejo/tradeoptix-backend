#!/bin/bash

# TradeOptix Backend - Script de comandos útiles
# Ejecutar: chmod +x dev-commands.sh && ./dev-commands.sh

echo "🚀 TradeOptix Backend - Comandos de Desarrollo"
echo "=============================================="

function show_help() {
    echo ""
    echo "Comandos disponibles:"
    echo "  setup     - Configuración inicial completa"
    echo "  start     - Iniciar servidor de desarrollo"
    echo "  test      - Ejecutar tests"
    echo "  build     - Compilar aplicación"
    echo "  docs      - Generar documentación Swagger"
    echo "  db-setup  - Configurar base de datos"
    echo "  health    - Verificar estado del servidor"
    echo "  demo      - Ejecutar demo completo"
    echo ""
}

function setup() {
    echo "🔧 Configurando entorno de desarrollo..."
    
    # Verificar que PostgreSQL esté instalado
    if ! command -v psql &> /dev/null; then
        echo "❌ PostgreSQL no está instalado. Instalando..."
        sudo apt update && sudo apt install -y postgresql postgresql-contrib
    fi
    
    # Configurar base de datos
    echo "📊 Configurando base de datos..."
    sudo -u postgres psql -f docs/database_setup.sql
    
    # Instalar dependencias
    echo "📦 Instalando dependencias..."
    go mod tidy
    
    # Crear archivo .env si no existe
    if [ ! -f .env ]; then
        cp .env.example .env
        echo "📝 Archivo .env creado. Edítalo según tu configuración."
    fi
    
    echo "✅ Configuración completada!"
}

function start_server() {
    echo "🚀 Iniciando servidor de desarrollo..."
    go run cmd/server/main.go
}

function run_tests() {
    echo "🧪 Ejecutando tests..."
    go test -v ./...
}

function build_app() {
    echo "🔨 Compilando aplicación..."
    make build
}

function generate_docs() {
    echo "📚 Generando documentación Swagger..."
    if command -v swag &> /dev/null; then
        swag init -g cmd/server/main.go
        echo "✅ Documentación generada en docs/swagger/"
    else
        echo "❌ swag no está instalado. Instale con: go install github.com/swaggo/swag/cmd/swag@latest"
    fi
}

function setup_db() {
    echo "📊 Configurando base de datos..."
    sudo -u postgres psql -f docs/database_setup.sql
}

function health_check() {
    echo "🏥 Verificando estado del servidor..."
    if curl -f http://localhost:8080/health 2>/dev/null; then
        echo ""
        echo "✅ Servidor funcionando correctamente"
    else
        echo "❌ Servidor no está disponible en puerto 8080"
    fi
}

function demo() {
    echo "🎭 Ejecutando demo completo..."
    
    # Compilar
    echo "1. Compilando..."
    make build
    
    # Iniciar servidor en background
    echo "2. Iniciando servidor..."
    ./bin/tradeoptix-server &
    SERVER_PID=$!
    sleep 3
    
    # Health check
    echo "3. Verificando health..."
    curl -s http://localhost:8080/health | head -5
    
    # Registro de usuario de prueba
    echo -e "\n4. Registrando usuario de prueba..."
    curl -X POST http://localhost:8080/api/v1/users/register \
      -H "Content-Type: application/json" \
      -d '{
        "first_name": "Demo",
        "last_name": "Usuario",
        "document_type": "cedula",
        "document_number": "demo123456",
        "email": "demo@tradeoptix.com",
        "phone_number": "+573001234567",
        "address": "Calle Demo 123, Bogotá",
        "password": "demo123456"
      }' | head -5
    
    # Login
    echo -e "\n5. Iniciando sesión..."
    curl -X POST http://localhost:8080/api/v1/users/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "demo@tradeoptix.com",
        "password": "demo123456"
      }' | head -5
    
    # Detener servidor
    echo -e "\n6. Deteniendo servidor..."
    kill $SERVER_PID 2>/dev/null
    
    echo -e "\n✅ Demo completado!"
    echo "📖 Ver documentación completa en: http://localhost:8080/docs/index.html"
    echo "📚 Leer README.md para más información"
}

# Procesar argumentos
case $1 in
    setup)
        setup
        ;;
    start)
        start_server
        ;;
    test)
        run_tests
        ;;
    build)
        build_app
        ;;
    docs)
        generate_docs
        ;;
    db-setup)
        setup_db
        ;;
    health)
        health_check
        ;;
    demo)
        demo
        ;;
    *)
        show_help
        ;;
esac
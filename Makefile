# TradeOptix Backend - Makefile

.PHONY: help build run test clean install-deps migrate-up migrate-down docs

# Variables
BINARY_NAME=tradeoptix-server
BUILD_DIR=bin
MAIN_PATH=cmd/server/main.go
MIGRATION_PATH=migrations
DB_URL=postgres://tradeoptix_user:tradeoptix_pass@localhost:5432/tradeoptix_db?sslmode=disable

# Colores para output
RED=\033[0;31m
GREEN=\033[0;32m
YELLOW=\033[1;33m
NC=\033[0m # No Color

help: ## Mostrar ayuda
	@echo "$(GREEN)TradeOptix Backend - Comandos disponibles:$(NC)"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(YELLOW)%-15s$(NC) %s\n", $$1, $$2}'

install-deps: ## Instalar dependencias de Go
	@echo "$(GREEN)Instalando dependencias...$(NC)"
	go mod tidy
	go mod download

build: ## Compilar la aplicación
	@echo "$(GREEN)Compilando aplicación...$(NC)"
	@mkdir -p $(BUILD_DIR)
	go build -o $(BUILD_DIR)/$(BINARY_NAME) $(MAIN_PATH)
	@echo "$(GREEN)✓ Aplicación compilada en $(BUILD_DIR)/$(BINARY_NAME)$(NC)"

run: ## Ejecutar la aplicación en modo desarrollo
	@echo "$(GREEN)Ejecutando servidor en modo desarrollo...$(NC)"
	go run $(MAIN_PATH)

run-prod: build ## Ejecutar la aplicación compilada
	@echo "$(GREEN)Ejecutando servidor en modo producción...$(NC)"
	./$(BUILD_DIR)/$(BINARY_NAME)

test: ## Ejecutar tests
	@echo "$(GREEN)Ejecutando tests...$(NC)"
	go test -v ./...

test-coverage: ## Ejecutar tests con cobertura
	@echo "$(GREEN)Ejecutando tests con cobertura...$(NC)"
	go test -v -coverprofile=coverage.out ./...
	go tool cover -html=coverage.out -o coverage.html
	@echo "$(GREEN)✓ Reporte de cobertura generado en coverage.html$(NC)"

clean: ## Limpiar archivos compilados
	@echo "$(GREEN)Limpiando archivos...$(NC)"
	rm -rf $(BUILD_DIR)
	rm -f coverage.out coverage.html
	@echo "$(GREEN)✓ Limpieza completada$(NC)"

fmt: ## Formatear código Go
	@echo "$(GREEN)Formateando código...$(NC)"
	go fmt ./...
	@echo "$(GREEN)✓ Código formateado$(NC)"

lint: ## Verificar calidad del código
	@echo "$(GREEN)Verificando código...$(NC)"
	go vet ./...
	@echo "$(GREEN)✓ Verificación completada$(NC)"

docs: ## Generar documentación Swagger
	@echo "$(GREEN)Generando documentación Swagger...$(NC)"
	swag init -g $(MAIN_PATH) -o ./docs/swagger
	@echo "$(GREEN)✓ Documentación generada en docs/swagger/$(NC)"

setup-db: ## Configurar base de datos PostgreSQL
	@echo "$(GREEN)Configurando base de datos...$(NC)"
	sudo -u postgres psql -f docs/database_setup.sql
	@echo "$(GREEN)✓ Base de datos configurada$(NC)"

migrate-up: ## Ejecutar migraciones hacia arriba
	@echo "$(GREEN)Ejecutando migraciones...$(NC)"
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" up
	@echo "$(GREEN)✓ Migraciones ejecutadas$(NC)"

migrate-down: ## Revertir migraciones
	@echo "$(YELLOW)Revirtiendo migraciones...$(NC)"
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" down
	@echo "$(YELLOW)✓ Migraciones revertidas$(NC)"

migrate-force: ## Forzar migración a una versión específica
	@read -p "Ingrese la versión: " version; \
	migrate -path $(MIGRATION_PATH) -database "$(DB_URL)" force $$version

docker-build: ## Construir imagen Docker
	@echo "$(GREEN)Construyendo imagen Docker...$(NC)"
	docker build -t tradeoptix-backend .
	@echo "$(GREEN)✓ Imagen Docker construida$(NC)"

docker-run: ## Ejecutar contenedor Docker
	@echo "$(GREEN)Ejecutando contenedor Docker...$(NC)"
	docker run -p 8080:8080 --env-file .env tradeoptix-backend

dev-setup: install-deps setup-db migrate-up ## Configuración completa para desarrollo
	@echo "$(GREEN)✓ Configuración de desarrollo completada$(NC)"
	@echo "$(YELLOW)Ejecute 'make run' para iniciar el servidor$(NC)"

health-check: ## Verificar que el servidor esté funcionando
	@echo "$(GREEN)Verificando estado del servidor...$(NC)"
	@curl -f http://localhost:8080/health || echo "$(RED)❌ Servidor no disponible$(NC)"

all: fmt lint test build ## Ejecutar todos los checks y compilar

# Crear directorio de uploads si no existe
$(shell mkdir -p uploads)

# Mensaje por defecto
default: help
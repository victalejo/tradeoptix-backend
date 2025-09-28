# Guía de Instalación - TradeOptix Backend

## Prerrequisitos

### 1. Instalar Go (1.21+)
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install golang-go

# Verificar instalación
go version
```

### 2. Instalar PostgreSQL
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# Iniciar servicio
sudo systemctl start postgresql
sudo systemctl enable postgresql

# Verificar instalación
sudo -u postgres psql -c "SELECT version();"
```

### 3. Instalar herramientas adicionales (opcional)
```bash
# Para migraciones de base de datos
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Para generación de documentación Swagger
go install github.com/swaggo/swag/cmd/swag@latest
```

## Configuración del Proyecto

### 1. Configurar Base de Datos
```bash
# Conectar como usuario postgres
sudo -u postgres psql

# Ejecutar el script de configuración
\i docs/database_setup.sql

# Salir
\q
```

### 2. Configurar Variables de Entorno
```bash
# Copiar archivo de configuración
cp .env.example .env

# Editar variables según tu entorno
nano .env
```

### 3. Instalar Dependencias
```bash
go mod tidy
```

### 4. Ejecutar Migraciones
Las migraciones se ejecutan automáticamente al iniciar la aplicación.

### 5. Compilar Proyecto
```bash
go build -o bin/server cmd/server/main.go
```

### 6. Ejecutar Servidor
```bash
./bin/server
# O directamente:
go run cmd/server/main.go
```

## Verificación

### 1. Health Check
```bash
curl http://localhost:8080/health
```

### 2. Documentación API
Abrir en navegador: `http://localhost:8080/docs/index.html`

### 3. Registro de Usuario de Prueba
```bash
curl -X POST http://localhost:8080/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Juan",
    "last_name": "Pérez",
    "document_type": "cedula",
    "document_number": "12345678",
    "email": "juan@example.com",
    "phone_number": "+573001234567",
    "address": "Calle 123 #45-67, Bogotá",
    "password": "password123"
  }'
```

### 4. Login
```bash
curl -X POST http://localhost:8080/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "juan@example.com",
    "password": "password123"
  }'
```

## Desarrollo

### Estructura del Proyecto
```
tradeoptix-back/
├── cmd/server/          # Punto de entrada
├── internal/            # Código interno
│   ├── config/         # Configuración
│   ├── database/       # Base de datos
│   ├── handlers/       # Controladores HTTP
│   ├── middleware/     # Middleware personalizado
│   ├── models/         # Modelos de datos
│   ├── routes/         # Rutas API
│   └── services/       # Lógica de negocio
├── migrations/          # Migraciones SQL
├── uploads/            # Archivos subidos
└── docs/               # Documentación
```

### Comandos Útiles
```bash
# Compilar
go build -o bin/server cmd/server/main.go

# Ejecutar tests
go test ./...

# Formatear código
go fmt ./...

# Verificar código
go vet ./...

# Generar documentación Swagger
swag init -g cmd/server/main.go

# Crear nueva migración
migrate create -ext sql -dir migrations -seq nombre_migracion
```

## Troubleshooting

### Error de Conexión a PostgreSQL
1. Verificar que PostgreSQL esté ejecutándose
2. Verificar credenciales en `.env`
3. Verificar que el usuario tenga permisos

### Error de Permisos en Uploads
```bash
mkdir -p uploads
chmod 755 uploads
```

### Error de Dependencias
```bash
go mod tidy
go mod download
```
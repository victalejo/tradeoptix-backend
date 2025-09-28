# TradeOptix

Plataforma completa de inversión con backend en Go, frontend administrativo en Next.js 15 y aplicación móvil en React Native.

## 📱 Componentes del Sistema

### 🔧 Backend API (Go)
Backend principal con API REST, autenticación JWT y base de datos PostgreSQL.

### 💻 Admin Frontend (Next.js 15)
Panel administrativo para gestión de usuarios y validación KYC.
- Ubicación: `/admin-frontend`
- Puerto: 3000
- Tecnologías: Next.js 15, TypeScript, Tailwind CSS

### 📱 Mobile App (React Native + Expo)
Aplicación móvil principal para usuarios finales.
- Ubicación: `/tradeoptix-app`
- Tecnologías: React Native, Expo SDK 54, TypeScript

## 🚀 Características

- ✅ **Registro completo de usuarios** con validación de datos
- ✅ **Sistema KYC** para validación de identidad con documentos
- ✅ **Área administrativa** para gestión de usuarios y aprobación KYC
- ✅ **Autenticación JWT** segura
- ✅ **Base de datos PostgreSQL** con migraciones automáticas
- ✅ **API REST** bien documentada con Swagger
- ✅ **Arquitectura limpia** y modular
- ✅ **Middleware de seguridad** y validaciones

## 📋 Requisitos

- Go 1.21+
- PostgreSQL 12+
- Git

## 🛠️ Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd tradeoptix-back
```

### 2. Configurar variables de entorno

```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

### 3. Configurar base de datos PostgreSQL

```sql
-- Conectar a PostgreSQL como superusuario
CREATE DATABASE tradeoptix_db;
CREATE USER tradeoptix_user WITH ENCRYPTED PASSWORD 'tradeoptix_pass';
GRANT ALL PRIVILEGES ON DATABASE tradeoptix_db TO tradeoptix_user;
```

### 4. Instalar dependencias

```bash
go mod tidy
```

### 5. Ejecutar migraciones

Las migraciones se ejecutan automáticamente al iniciar la aplicación.

### 6. Ejecutar la aplicación

```bash
go run cmd/server/main.go
```

La API estará disponible en: `http://localhost:8080`

## 📚 Documentación de la API

Una vez que la aplicación esté en funcionamiento, puedes acceder a la documentación Swagger en:

```
http://localhost:8080/docs/index.html
```

## 🔐 Autenticación

La API utiliza JWT (JSON Web Tokens) para la autenticación. 

### Usuario administrador por defecto:
- **Email**: `admin@tradeoptix.com`
- **Contraseña**: `admin123`

## 🏗️ Estructura del Proyecto

```
tradeoptix-back/
├── cmd/
│   └── server/          # Punto de entrada de la aplicación
├── internal/
│   ├── config/          # Configuración de la aplicación
│   ├── database/        # Conexión y migraciones de DB
│   ├── handlers/        # Controladores HTTP
│   ├── middleware/      # Middleware personalizado
│   ├── models/          # Modelos de datos
│   ├── routes/          # Definición de rutas
│   └── services/        # Lógica de negocio
├── migrations/          # Migraciones de base de datos
├── uploads/             # Archivos subidos (documentos KYC)
├── docs/               # Documentación
├── .env.example        # Variables de entorno de ejemplo
└── go.mod              # Dependencias de Go
```

## 🔄 Flujo de Registro y KYC

### 1. Registro de Usuario
```
POST /api/v1/users/register
```

### 2. Inicio de Sesión
```
POST /api/v1/users/login
```

### 3. Subida de Documentos KYC
```
POST /api/v1/kyc/upload
```

Documentos requeridos:
- `cedula_front`: Cédula lado frontal
- `cedula_back`: Cédula lado posterior  
- `face_photo`: Foto facial del usuario

### 4. Validación por Administrador
```
PUT /api/v1/admin/kyc/{id}/approve
PUT /api/v1/admin/kyc/{id}/reject
```

## 🛡️ Seguridad

- Contraseñas hasheadas con bcrypt
- Validación de datos de entrada
- Middleware de autenticación JWT
- Control de acceso basado en roles
- Validación de tipos de archivos para documentos
- Límites de tamaño de archivos (5MB)

## 🗄️ Modelos de Base de Datos

### Usuarios
- Información personal completa
- Tipo y número de documento
- Redes sociales (opcional)
- Estado de KYC
- Rol (user/admin)

### Documentos KYC
- Archivos de cédula (frente y atrás)
- Foto facial
- Estado de validación
- Metadatos del archivo

## 🚀 Deployment

### Variables de entorno para producción:
```bash
ENVIRONMENT=production
JWT_SECRET=your-super-secret-production-key
DATABASE_URL=postgres://user:pass@host:5432/db?sslmode=require
```

### Docker (opcional)
```bash
docker build -t tradeoptix-back .
docker run -p 8080:8080 tradeoptix-back
```

## 📱 Desarrollo de Aplicación Móvil

### Configuración del entorno móvil

```bash
# Instalar Expo CLI globalmente
npm install -g @expo/cli

# Navegar al directorio de la app móvil
cd tradeoptix-app

# Instalar dependencias
npm install

# Iniciar el servidor de desarrollo
npx expo start
```

### Funcionalidades de la App Móvil

- ✅ **Autenticación completa**: Login, registro y logout
- ✅ **Navegación intuitiva**: Stack y Tab navigation
- ✅ **Verificación KYC**: Subida de documentos con cámara/galería
- ✅ **Dashboard de usuario**: Panel principal personalizado
- ✅ **UI/UX moderna**: Componentes personalizados con gradientes
- ✅ **TypeScript**: Tipado completo para mejor desarrollo
- ✅ **Gestión de estado**: Context API para autenticación global

### Pantallas disponibles

1. **WelcomeScreen**: Pantalla de bienvenida con introducción
2. **LoginScreen**: Autenticación de usuarios
3. **RegisterScreen**: Registro completo con validaciones
4. **HomeScreen**: Dashboard principal del usuario  
5. **KYCScreen**: Verificación de identidad con documentos

### Configuración de la API

La app móvil se conecta automáticamente con el backend. Asegúrate de que el servidor esté ejecutándose en `http://localhost:8080`.

### Deployment móvil

```bash
# Build para desarrollo
npx expo start

# Build para producción Android
npx eas build --platform android

# Build para producción iOS  
npx eas build --platform ios
```

## 💻 Desarrollo del Frontend Admin

### Configuración del admin panel

```bash
# Navegar al directorio del admin frontend
cd admin-frontend

# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El panel administrativo estará disponible en: `http://localhost:3000`

### Funcionalidades del Admin Panel

- ✅ **Dashboard administrativo**: Métricas y resumen
- ✅ **Gestión de usuarios**: Lista y detalles de usuarios
- ✅ **Validación KYC**: Aprobación/rechazo de documentos
- ✅ **Configuración**: Ajustes del sistema
- ✅ **Autenticación**: Login administrativo seguro

## 🧪 Testing

```bash
# Backend tests
go test ./...

# Frontend admin tests
cd admin-frontend && npm test

# Mobile app tests
cd tradeoptix-app && npm test
```

## 📝 API Endpoints

### Públicos
- `POST /api/v1/users/register` - Registrar usuario
- `POST /api/v1/users/login` - Iniciar sesión
- `GET /health` - Health check

### Autenticados (requieren JWT)
- `GET /api/v1/users/profile` - Obtener perfil
- `POST /api/v1/kyc/upload` - Subir documento KYC
- `GET /api/v1/kyc/documents` - Obtener documentos del usuario
- `GET /api/v1/kyc/documents/{id}/download` - Descargar documento

### Administrador
- `GET /api/v1/admin/users` - Listar todos los usuarios
- `PUT /api/v1/admin/kyc/{id}/approve` - Aprobar documento
- `PUT /api/v1/admin/kyc/{id}/reject` - Rechazar documento

## 🤝 Contribución

1. Fork el proyecto
2. Crea tu rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para detalles.

## 🆘 Soporte

Si tienes alguna pregunta o problema, por favor abre un issue en GitHub.
# TradeOptix Admin Frontend

Panel administrativo para la gestión de usuarios y procesos KYC de TradeOptix, desarrollado con Next.js 15, TypeScript y Tailwind CSS.

## 🚀 Características

- ✅ **Dashboard completo** con métricas y estadísticas
- ✅ **Gestión de usuarios** con búsqueda y filtros
- ✅ **Sistema KYC** para revisar documentos de identidad
- ✅ **Autenticación JWT** integrada con el backend
- ✅ **Interfaz responsive** optimizada para desktop y móvil
- ✅ **TypeScript** para tipado estático y mejor desarrollo
- ✅ **Tailwind CSS** para estilos modernos y consistentes
- ✅ **Componentes reutilizables** con diseño modular

## 📋 Requisitos

- Node.js 18+
- npm o yarn
- Backend de TradeOptix ejecutándose en `localhost:8080`

## 🛠️ Instalación

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd tradeoptix-back/admin-frontend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

```bash
cp .env.example .env.local
```

Editar `.env.local` con las configuraciones necesarias:

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
NODE_ENV=development
NEXT_PUBLIC_APP_NAME=TradeOptix Admin
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### 4. Iniciar el servidor de desarrollo

```bash
npm run dev
```

La aplicación estará disponible en: `http://localhost:3000`

## 📚 Uso

### Credenciales de Administrador

- **Email**: `admin@tradeoptix.com`
- **Contraseña**: `admin123`

### Funcionalidades Principales

#### Dashboard
- Vista general del sistema
- Estadísticas de usuarios y KYC
- Accesos rápidos a funcionalidades principales
- Usuarios recientes registrados

#### Gestión de Usuarios
- Lista completa de usuarios registrados
- Búsqueda por nombre, email o documento
- Visualización detallada de perfiles
- Estados de verificación KYC

#### Sistema KYC
- Revisión de documentos de identidad
- Aprobación y rechazo de documentos
- Vista previa de archivos subidos
- Gestión de razones de rechazo

#### Configuración
- Información del sistema
- Configuraciones de KYC
- Enlaces útiles a documentación

## 🏗️ Estructura del Proyecto

```
admin-frontend/
├── src/
│   ├── app/                 # App Router de Next.js 15
│   │   ├── dashboard/       # Página principal del dashboard
│   │   ├── users/          # Gestión de usuarios
│   │   ├── kyc/            # Sistema KYC
│   │   ├── settings/       # Configuración
│   │   ├── login/          # Página de login
│   │   ├── layout.tsx      # Layout principal
│   │   └── page.tsx        # Página de inicio (redirección)
│   ├── components/         # Componentes React reutilizables
│   │   ├── layout/         # Componentes de layout
│   │   │   ├── DashboardLayout.tsx
│   │   │   ├── Header.tsx
│   │   │   └── Sidebar.tsx
│   │   └── ui/            # Componentes de UI
│   │       ├── Badge.tsx
│   │       ├── Button.tsx
│   │       └── Card.tsx
│   ├── lib/               # Utilidades y configuraciones
│   │   ├── api.ts         # Cliente HTTP y servicios API
│   │   └── utils.ts       # Utilidades generales
│   └── types/             # Definiciones de TypeScript
│       └── api.ts         # Tipos de la API
├── public/                # Archivos estáticos
├── .env.example          # Variables de entorno de ejemplo
├── next.config.ts        # Configuración de Next.js
├── tailwind.config.ts    # Configuración de Tailwind CSS
└── tsconfig.json         # Configuración de TypeScript
```

## 🔗 Integración con Backend

### Servicios API

El frontend se comunica con el backend a través de servicios organizados:

- **authService**: Autenticación y manejo de sesiones
- **userService**: Gestión de usuarios
- **kycService**: Manejo de documentos KYC
- **dashboardService**: Estadísticas y métricas

### Endpoints Utilizados

```typescript
// Autenticación
POST /api/v1/users/login

// Usuarios (requiere token de admin)
GET /api/v1/admin/users
GET /api/v1/users/profile

// KYC (requiere token de admin)
GET /api/v1/admin/kyc/pending
PUT /api/v1/admin/kyc/:id/approve
PUT /api/v1/admin/kyc/:id/reject

// Sistema
GET /health
```

## 🎨 Componentes UI

### Componentes Base

- **Button**: Botones con variantes (primary, secondary, success, danger, outline)
- **Badge**: Etiquetas de estado con colores temáticos
- **Card**: Contenedores con diferentes configuraciones de padding

### Layout

- **DashboardLayout**: Layout principal con sidebar y header
- **Sidebar**: Navegación lateral con rutas activas
- **Header**: Barra superior con información del usuario

## 🔐 Autenticación

El sistema utiliza JWT tokens para la autenticación:

1. Login con credenciales de administrador
2. Token almacenado en localStorage
3. Token enviado automáticamente en requests
4. Redirección automática si el token expira
5. Verificación de rol de administrador

## 🚀 Comandos de Desarrollo

```bash
# Desarrollo
npm run dev

# Producción
npm run build
npm start

# Linting
npm run lint

# Verificación de tipos
npm run type-check
```

## 🎯 Demo y Pruebas

1. **Iniciar el backend**: `cd ../backend && go run cmd/server/main.go`
2. **Iniciar el frontend**: `npm run dev`
3. **Acceder**: `http://localhost:3000`
4. **Login**: Usar credenciales admin@tradeoptix.com / admin123
5. **Explorar**: Dashboard, usuarios, KYC y configuración

## 📱 Responsive Design

La interfaz está optimizada para:

- **Desktop**: Vista completa con sidebar expandido
- **Tablet**: Adaptación de columnas y espaciado
- **Mobile**: Navegación colapsible y layouts apilados

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama de feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Crear Pull Request

¡El frontend administrativo de TradeOptix está listo para usar! 🎉
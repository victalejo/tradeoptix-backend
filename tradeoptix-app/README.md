# TradeOptix Mobile App

Aplicación móvil principal de TradeOptix desarrollada con React Native y Expo.

## 🚀 Características

- ✅ **Autenticación completa**: Registro, login y gestión de sesiones
- ✅ **Verificación KYC**: Subida de documentos de identidad
- ✅ **Navegación intuitiva**: Tabs y stack navigation
- ✅ **UI Moderna**: Componentes personalizados con gradientes
- ✅ **Gestión de estado**: Context API para autenticación
- ✅ **Integración con API**: Comunicación con backend Go
- ✅ **TypeScript**: Tipado fuerte para mejor desarrollo

## 🏗️ Estructura del Proyecto

```
src/
├── components/          # Componentes reutilizables
│   ├── Button.tsx      # Botón personalizado con gradientes
│   └── Input.tsx       # Input con validación
├── context/            # Context providers
│   └── AuthContext.tsx # Gestión de autenticación
├── navigation/         # Configuración de navegación
│   └── AppNavigator.tsx # Navegador principal
├── screens/           # Pantallas de la aplicación
│   ├── WelcomeScreen.tsx   # Pantalla de bienvenida
│   ├── LoginScreen.tsx     # Inicio de sesión
│   ├── RegisterScreen.tsx  # Registro de usuarios
│   ├── HomeScreen.tsx      # Dashboard principal
│   └── KYCScreen.tsx       # Verificación de identidad
├── services/          # Servicios externos
│   └── api.ts         # Cliente API REST
└── types/             # Definiciones de tipos
    ├── index.ts       # Tipos principales
    └── navigation.ts  # Tipos de navegación
```

## 📱 Pantallas

### 1. **WelcomeScreen** - Bienvenida
- Introducción a la aplicación
- Navegación a Login/Registro
- Diseño atractivo con gradientes

### 2. **LoginScreen** - Inicio de Sesión
- Autenticación con email/contraseña
- Validación de formularios
- Recordar credenciales
- Navegación a registro

### 3. **RegisterScreen** - Registro
- Formulario completo de usuario
- Validaciones en tiempo real
- Selección de país y documento
- Términos y condiciones

### 4. **HomeScreen** - Dashboard
- Panel principal del usuario
- Resumen de cuenta
- Accesos rápidos
- Navegación a funciones principales

### 5. **KYCScreen** - Verificación
- Subida de documentos
- Estados de verificación
- Instrucciones detalladas
- Seguimiento del proceso

## 🔧 Instalación y Configuración

### Prerrequisitos

```bash
# Node.js 18+ y npm
node --version
npm --version

# Expo CLI
npm install -g @expo/cli
```

### Instalación

```bash
# Instalar dependencias
cd tradeoptix-app
npm install

# Iniciar en modo desarrollo
npx expo start

# Compilar para producción
npx expo start --no-dev --minify
```

### Dependencias Principales

```json
{
  "@react-navigation/native": "^6.x",
  "@react-navigation/stack": "^6.x",
  "@react-navigation/bottom-tabs": "^6.x",
  "expo": "^54.0.0",
  "expo-linear-gradient": "^14.x",
  "expo-image-picker": "^16.x",
  "expo-secure-store": "^14.x",
  "@expo/vector-icons": "^14.x",
  "@react-native-picker/picker": "^2.x",
  "react-native-screens": "^4.x",
  "react-native-safe-area-context": "^5.x"
}
```

## 🔐 Autenticación

El sistema de autenticación utiliza:

- **JWT tokens** para autenticación
- **SecureStore** para almacenamiento seguro
- **Context API** para gestión global de estado
- **Validaciones** de formularios
- **Manejo de errores** personalizado

```typescript
const { login, register, logout, isAuthenticated, user } = useAuth();
```

## 📡 API Integration

La aplicación se comunica con el backend Go a través de:

```typescript
// Configuración base
const API_BASE_URL = 'http://localhost:8080/api/v1';

// Servicios disponibles
ApiService.login(email, password)
ApiService.register(userData)
ApiService.uploadKYCDocument(token, type, uri, filename)
ApiService.getKYCDocuments(token)
```

## 🎨 UI/UX

### Colores Principales
- **Azul Principal**: `#007AFF`
- **Azul Secundario**: `#0056CC`
- **Azul Oscuro**: `#003D99`
- **Verde Éxito**: `#34C759`
- **Rojo Error**: `#FF3B30`
- **Naranja Advertencia**: `#FF9500`

### Componentes Personalizados
- **Button**: Botón con gradientes y variantes
- **Input**: Campo de entrada con validación
- **Cards**: Tarjetas con sombras y bordes
- **StatusBadges**: Indicadores de estado

## 📝 Desarrollo

### Scripts Disponibles

```bash
# Desarrollo
npm start                 # Iniciar Expo
npm run android          # Ejecutar en Android
npm run ios              # Ejecutar en iOS
npm run web              # Ejecutar en web

# Build
npm run build            # Compilar para producción
```

### TypeScript

La aplicación está completamente tipada con TypeScript:

```typescript
// Tipos principales
interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  kyc_status: 'pending' | 'approved' | 'rejected';
}

// Props de componentes
interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  disabled?: boolean;
}
```

## 🔄 Estado de Desarrollo

### ✅ Completado
- [x] Estructura básica del proyecto
- [x] Sistema de autenticación completo
- [x] Navegación entre pantallas
- [x] Componentes UI personalizados
- [x] Integración con API backend
- [x] Sistema KYC con subida de documentos
- [x] Validaciones de formularios
- [x] Manejo de estados y errores
- [x] TypeScript y tipado completo

### 🔄 En Progreso
- [ ] Testing unitario
- [ ] Optimizaciones de rendimiento
- [ ] Funcionalidades adicionales

### 📋 Por Hacer
- [ ] Pantallas de trading
- [ ] Notificaciones push
- [ ] Modo oscuro
- [ ] Internacionalización
- [ ] Analytics

## 🚀 Deployment

### Expo Build

```bash
# Build para Android
npx eas build --platform android

# Build para iOS
npx eas build --platform ios

# Build universal
npx eas build --platform all
```

### Variables de Entorno

Crear archivo `.env`:

```env
API_BASE_URL=https://api.tradeoptix.com
EXPO_PUBLIC_API_URL=https://api.tradeoptix.com
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es parte del sistema TradeOptix y es de uso privado.

---

**TradeOptix Mobile App** - Desarrollado con ❤️ usando React Native y Expo
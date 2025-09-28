# TradeOptix Backend - Copilot Instructions

## Proyecto
Backend en Go para aplicación de inversión con:
- ✅ Registro completo de usuarios 
- ✅ Sistema KYC (Know Your Customer)
- ✅ Área administrativa
- ✅ API REST con autenticación JWT
- ✅ Base de datos PostgreSQL
- ✅ Arquitectura limpia y modular

## Progreso de Configuración
- [x] Clarificar requerimientos del proyecto
- [x] Crear estructura del proyecto
- [x] Personalizar el proyecto según requerimientos
- [x] Instalar extensiones requeridas (No requeridas)
- [x] Compilar el proyecto
- [x] Crear y ejecutar tareas
- [x] Lanzar el proyecto
- [x] Completar documentación

## Estructura del Proyecto
- `/cmd` - Punto de entrada de la aplicación
- `/internal` - Código interno de la aplicación
- `/pkg` - Paquetes reutilizables
- `/api` - Definiciones de API
- `/configs` - Archivos de configuración
- `/migrations` - Migraciones de base de datos
- `/uploads` - Archivos subidos (documentos KYC)
- `/docs` - Documentación

## Funcionalidades Principales
1. **Registro de Usuarios**: Nombres, apellidos, cédula/pasaporte, correo, teléfono, dirección, redes sociales
2. **KYC**: Subida de documentos (cédula ambos lados, foto facial)
3. **Administración**: Panel para gestión de usuarios y validación KYC
4. **Autenticación**: JWT tokens
5. **Seguridad**: Validaciones, middleware, encriptación
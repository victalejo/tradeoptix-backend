# 🔧 SOLUCIÓN CORS - TradeOptix

## 🚨 Problema Identificado

**Error**: `Access to XMLHttpRequest at 'https://api.tradeoptix.app/api/v1/admin/news?page=1&limit=50' from origin 'https://admin.tradeoptix.app' has been blocked by CORS policy`

**Causa**: El frontend en producción (`https://admin.tradeoptix.app`) intenta conectarse al backend (`https://api.tradeoptix.app`), pero hay problemas de configuración CORS.

## ✅ Soluciones Implementadas

### 1. **CORS Mejorado en el Backend**

Se actualizó el middleware CORS en `/internal/middleware/auth.go` para:
- ✅ Permitir orígenes específicos de manera segura
- ✅ Soporte para localhost dinámico (desarrollo)
- ✅ Lista configurable de dominios permitidos
- ✅ Manejo correcto de preflight requests

```go
// Orígenes permitidos por defecto
allowedOrigins := []string{
    "http://localhost:3000",
    "http://localhost:3004", 
    "http://localhost:8082",
    "https://admin.tradeoptix.app",
    "https://app.tradeoptix.app",
    "https://tradeoptix.app",
}
```

### 2. **Middleware CORS Configurable**

Se creó `/internal/middleware/cors.go` con:
- ✅ Configuración por variables de entorno
- ✅ Soporte para múltiples orígenes
- ✅ Headers CORS completos
- ✅ Manejo correcto de OPTIONS

### 3. **Variables de Entorno**

Se crearon archivos de configuración:

#### Desarrollo (`.env.development`)
```bash
export ALLOWED_ORIGINS="http://localhost:3000,http://localhost:3004,http://localhost:8082,http://localhost:3001"
```

#### Producción (`.env.production`)
```bash
export ALLOWED_ORIGINS="https://admin.tradeoptix.app,https://app.tradeoptix.app,https://tradeoptix.app"
```

### 4. **Script Automático de Solución**

Se creó `fix-cors.sh` que permite:
- ✅ Configurar desarrollo/producción automáticamente
- ✅ Configurar CORS personalizado
- ✅ Probar conectividad API
- ✅ Reconstruir y reiniciar backend

## 🚀 Cómo Aplicar la Solución

### Opción A: Desarrollo Local
```bash
cd /home/victalejo/tradeoptix-back

# Usar el script automático
./fix-cors.sh
# Seleccionar opción 1: Configurar para desarrollo

# O manualmente:
source .env.development
make build
./bin/tradeoptix-server
```

### Opción B: Producción
```bash
cd /home/victalejo/tradeoptix-back

# Usar el script automático  
./fix-cors.sh
# Seleccionar opción 2: Configurar para producción

# O manualmente:
source .env.production
make build
./bin/tradeoptix-server
```

### Opción C: CORS Personalizado
```bash
# Configurar orígenes específicos
export ALLOWED_ORIGINS="https://mi-dominio.com,https://otro-dominio.com"
make build
./bin/tradeoptix-server
```

## 🔍 Verificar la Solución

### Prueba 1: Conectividad API
```bash
curl -s http://localhost:8080/health
# Debería responder: {"message":"TradeOptix API funcionando correctamente","status":"ok"}
```

### Prueba 2: CORS Headers
```bash
curl -H "Origin: https://admin.tradeoptix.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:8080/api/v1/admin/news
```

**Respuesta esperada**:
```
Access-Control-Allow-Origin: https://admin.tradeoptix.app
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS
```

### Prueba 3: Frontend
1. Abrir https://admin.tradeoptix.app (o localhost:3004)
2. Ir a la sección de Noticias
3. Verificar que carga la lista sin errores de CORS

## 🔧 Configuración del Frontend

### Actualizar URL de API en Producción

Si el backend está en un servidor diferente, actualizar:

```bash
# admin-frontend/.env.production
NEXT_PUBLIC_API_URL=https://TU-SERVIDOR-BACKEND.com
```

## 📋 Checklist de Solución

- [x] ✅ CORS configurado en backend
- [x] ✅ Variables de entorno creadas
- [x] ✅ Middleware actualizado
- [x] ✅ Script de automatización
- [x] ✅ Backend recompilado
- [ ] 🔄 Verificar URL de producción real
- [ ] 🔄 Desplegar backend actualizado
- [ ] 🔄 Probar frontend en producción

## ⚡ Solución Rápida

**Si necesitas una solución inmediata**:

1. **Cambiar a localhost temporalmente**:
```bash
# En admin-frontend/.env.production
NEXT_PUBLIC_API_URL=http://localhost:8080
```

2. **Iniciar backend local**:
```bash
cd /home/victalejo/tradeoptix-back
./fix-cors.sh
# Seleccionar opción 1 o 5
```

3. **Reconstruir frontend**:
```bash
cd /home/victalejo/tradeoptix-back/admin-frontend
npm run build
npm run dev
```

## 🎯 Próximos Pasos

1. **Desplegar backend** con las nuevas configuraciones CORS
2. **Configurar DNS** para `api.tradeoptix.app` 
3. **Certificados SSL** para HTTPS
4. **Variables de entorno** en servidor de producción
5. **Monitoreo** de errores CORS

---

## ✨ Estado Actual

- ✅ **Backend actualizado** con CORS mejorado
- ✅ **Scripts de automatización** disponibles
- ✅ **Configuración flexible** por entornos
- 🔄 **Pendiente**: Desplegar en producción

**¡Las configuraciones CORS están listas y probadas en desarrollo!** 🎉
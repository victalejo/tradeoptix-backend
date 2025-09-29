#!/bin/bash

echo "🚀 Deployando solución de CORS para noticias y notificaciones..."

# Configurar variables
REPO_URL="https://github.com/victalejo/tradeoptix-backend.git"
DEPLOY_DIR="/tmp/tradeoptix-deploy"
SERVICE_NAME="tradeoptix-server"

# Función para hacer commit y push de los cambios
deploy_changes() {
    echo "📝 Haciendo commit y push de los cambios..."
    
    git add .
    git commit -m "fix: Resolver problema de CORS en rutas de noticias y notificaciones

- Deshabilitar redirects automáticos de Gin (RedirectTrailingSlash = false)
- Registrar rutas tanto con como sin trailing slash para /news y /notifications
- Mejorar middleware CORS para manejar redirects
- Evitar error 'Access-Control-Allow-Origin' header missing

Fixes: Frontend no puede acceder a /api/v1/admin/news y /api/v1/admin/notifications
por redirect 301 que pierde headers CORS"
    
    git push origin main
    
    if [ $? -eq 0 ]; then
        echo "✅ Cambios enviados al repositorio exitosamente"
    else
        echo "❌ Error enviando cambios al repositorio"
        return 1
    fi
}

# Función para verificar el deploy
verify_deploy() {
    echo "🔍 Verificando que el deploy funcione..."
    
    # Esperar un poco para que el servicio se reinicie
    sleep 5
    
    # Verificar health check
    if curl -s https://api.tradeoptix.app/health > /dev/null; then
        echo "✅ Servicio está respondiendo"
        
        # Verificar rutas específicas de CORS
        echo "🧪 Testeando CORS en rutas de noticias..."
        
        # Hacer un test OPTIONS
        CORS_RESPONSE=$(curl -s -I -X OPTIONS "https://api.tradeoptix.app/api/v1/admin/news" \
            -H "Origin: https://admin.tradeoptix.app" \
            -H "Access-Control-Request-Method: GET")
        
        if echo "$CORS_RESPONSE" | grep -q "Access-Control-Allow-Origin"; then
            echo "✅ CORS funcionando correctamente"
            return 0
        else
            echo "❌ CORS aún no funciona correctamente"
            echo "Respuesta: $CORS_RESPONSE"
            return 1
        fi
    else
        echo "❌ Servicio no está respondiendo"
        return 1
    fi
}

# Ejecutar deploy
echo "🔄 Iniciando proceso de deploy..."

# Hacer commit y push de los cambios locales
deploy_changes

if [ $? -eq 0 ]; then
    echo "✅ Deploy completado"
    echo "⏳ Esperando que el servicio se actualice automáticamente..."
    
    # Railway y otros servicios suelen tomar unos minutos para rebuild
    echo "🕐 Esperando 30 segundos para que el servicio se reinicie..."
    sleep 30
    
    # Verificar que todo funcione
    verify_deploy
    
    if [ $? -eq 0 ]; then
        echo "🎉 Deploy exitoso! El problema de CORS debería estar resuelto."
        echo "📱 Puedes probar ahora en el panel de administración:"
        echo "   https://admin.tradeoptix.app"
    else
        echo "⚠️  Deploy completado pero verificación falló. Puede tomar más tiempo."
        echo "🔧 Si el problema persiste, revisar logs del servicio."
    fi
else
    echo "❌ Deploy falló"
    exit 1
fi
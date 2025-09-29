#!/bin/bash

echo "🔄 SOLUCIÓN TEMPORAL: PROXY A SERVIDOR LOCAL"
echo "==========================================="
echo ""
echo "🎯 CONCEPTO:"
echo "Hacer que https://api.tradeoptix.app redirija requests a tu servidor local"
echo ""
echo "📋 OPCIONES:"
echo ""
echo "1. NGROK (Más fácil):"
echo "   # Instalar ngrok"
echo "   # Exponer puerto local 8080"
echo "   ngrok http 8080"
echo "   # Configurar DNS api.tradeoptix.app -> ngrok URL"
echo ""
echo "2. SSH TUNNEL:"
echo "   # Desde tu servidor de producción:"
echo "   ssh -R 8080:localhost:8080 usuario@tu-ip-local"
echo ""
echo "3. CLOUDFLARE TUNNEL:"
echo "   # Más robusto para producción"
echo "   cloudflared tunnel create tradeoptix"
echo ""
echo "⚠️  NOTA: Estas son soluciones temporales"
echo "La solución real es desplegar el código a producción"

# Verificar si el servidor local tiene todas las rutas
echo ""
echo "🔍 VERIFICANDO SERVIDOR LOCAL:"
echo "Rutas disponibles en tu servidor local:"

if curl -s http://localhost:8080/health > /dev/null 2>&1; then
    echo "✅ Health: Funciona"
    
    # Test admin routes
    if curl -s -H "Origin: https://admin.tradeoptix.app" http://localhost:8080/api/v1/admin/news > /dev/null 2>&1; then
        echo "✅ Admin News: Disponible localmente" 
    else
        echo "❌ Admin News: No disponible localmente"
    fi
    
    if curl -s -H "Origin: https://admin.tradeoptix.app" http://localhost:8080/api/v1/admin/notifications > /dev/null 2>&1; then
        echo "✅ Admin Notifications: Disponible localmente"
    else  
        echo "❌ Admin Notifications: No disponible localmente"
    fi
else
    echo "❌ Servidor local no está corriendo"
    echo "Ejecuta: make run"
fi
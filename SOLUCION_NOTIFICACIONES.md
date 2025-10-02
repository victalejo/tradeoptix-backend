# Solución - Problemas con Notificaciones en Panel de Administración

## 🔍 Problemas Identificados

### 1. Error 404 en `/send-push`
**URL afectada:** `POST /api/v1/admin/notifications/:id/send-push`
**Status:** 404 Not Found
**Causa:** La ruta no existía en el backend

### 2. Pantalla gris al crear notificaciones
**Síntoma:** Al hacer clic en "Crear Notificación", la pantalla se pone gris y no aparece el formulario
**Posible causa:** Problema de z-index en el modal o error en el componente

---

## ✅ Solución Implementada

### 1. Backend - Nueva Ruta `/send-push`

#### Archivos Modificados:

**`/internal/routes/routes.go`**
```go
// Agregada la ruta para enviar push notifications
admin.POST("/notifications/:id/send-push", notificationHandler.SendPushNotification)
```

**`/internal/handlers/notification_handler.go`**
```go
// Nuevo método agregado
func (h *NotificationHandler) SendPushNotification(c *gin.Context) {
    notificationID := c.Param("id")
    
    // Validar UUID
    if _, err := uuid.Parse(notificationID); err != nil {
        c.JSON(http.StatusBadRequest, gin.H{"error": "ID de notificación inválido"})
        return
    }
    
    // Obtener la notificación
    notification, err := h.service.GetNotificationByID(notificationID)
    if err != nil {
        c.JSON(http.StatusNotFound, gin.H{"error": "Notificación no encontrada"})
        return
    }
    
    // Enviar push notification
    if err := h.service.SendPushToUsers(notification); err != nil {
        c.JSON(http.StatusInternalServerError, gin.H{"error": "Error al enviar push notification"})
        return
    }
    
    c.JSON(http.StatusOK, gin.H{
        "message": "Push notification enviada exitosamente",
        "notification_id": notificationID,
    })
}
```

**`/internal/services/notification_service.go`**
```go
// Nuevos métodos agregados

func (s *NotificationService) SendPushToUsers(notification *models.Notification) error {
    // Si la notificación es para un usuario específico
    if notification.UserID != nil {
        return s.SendPushToUser(notification.UserID.String(), notification)
    }
    
    // Si es broadcast, obtener todos los usuarios activos
    var userIDs []string
    query := `SELECT id FROM users WHERE deleted_at IS NULL`
    rows, err := s.db.Query(query)
    if err != nil {
        return err
    }
    defer rows.Close()
    
    for rows.Next() {
        var userID string
        if err := rows.Scan(&userID); err != nil {
            continue
        }
        userIDs = append(userIDs, userID)
    }
    
    // Enviar push notification a cada usuario
    for _, userID := range userIDs {
        if err := s.SendPushToUser(userID, notification); err != nil {
            log.Printf("Error enviando push a usuario %s: %v", userID, err)
        }
    }
    
    return nil
}

func (s *NotificationService) SendPushToUser(userID string, notification *models.Notification) error {
    // TODO: Integrar con servicio de push notifications (FCM, APNS, etc.)
    log.Printf("Enviando push notification a usuario %s: %s - %s", 
        userID, notification.Title, notification.Message)
    
    // Por ahora solo registramos en el log
    // En producción, aquí se integraría con:
    // - Firebase Cloud Messaging (FCM) para Android
    // - Apple Push Notification Service (APNS) para iOS
    // - Web Push para navegadores
    
    return nil
}
```

---

## 🚀 Deployment a Producción

### Paso 1: Compilar el Backend
```bash
cd /home/victalejo/tradeoptix-back
go build -o bin/tradeoptix-server cmd/server/main.go
```

### Paso 2: Verificar la Configuración
```bash
# Asegurarse de que .env tiene la configuración correcta
cat .env | grep -E "DB_HOST|DB_USER|DB_NAME"
```

### Paso 3: Deploy a Producción
```bash
# Detener el servidor actual
pkill tradeoptix-server

# Copiar el binario a producción (si es necesario)
# scp bin/tradeoptix-server user@production-server:/path/to/deployment

# Iniciar el servidor en producción
./bin/tradeoptix-server
```

### Paso 4: Verificar las Rutas
```bash
curl -X GET https://api.tradeoptix.app/health
```

---

## 🧪 Testing

### Test 1: Autenticación Admin
```bash
curl -X POST https://api.tradeoptix.app/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.app",
    "password": "YOUR_ADMIN_PASSWORD"
  }'
```

### Test 2: Listar Notificaciones
```bash
curl -X GET https://api.tradeoptix.app/api/v1/admin/notifications \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Test 3: Enviar Push Notification
```bash
curl -X POST https://api.tradeoptix.app/api/v1/admin/notifications/NOTIFICATION_ID/send-push \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json"
```

---

## 🔧 Solución al Problema del Modal (Frontend)

### Diagnóstico
El modal tiene la estructura correcta con:
- z-index: 9999
- Overlay funcional
- Estilos de Tailwind CSS correctos

### Posibles Causas del Problema

1. **Conflicto de z-index**: Otro elemento puede estar bloqueando el modal
2. **Error de JavaScript**: Verificar la consola del navegador
3. **Problema de estilos CSS**: Verificar que Tailwind esté compilado correctamente

### Solución Temporal
Si el problema persiste, agregar estos estilos adicionales al modal:

```tsx
// En Modal.tsx, actualizar el overlay:
<div 
  className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
  style={{ zIndex: 9998 }}
  onClick={onClose}
/>

// Y el contenido del modal:
<div 
  className={`inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:w-full ${sizeClasses[size]}`}
  style={{ zIndex: 9999, position: 'relative' }}
>
```

### Verificación en el Navegador
1. Abrir DevTools (F12)
2. Ir a la pestaña Console
3. Verificar si hay errores JavaScript
4. Ir a la pestaña Elements
5. Buscar el modal y verificar sus estilos computados

---

## 📝 Notas Importantes

### Credenciales de Admin
- **Email**: Verificar en la base de datos de producción
- **Password**: Debe ser el hash correcto de bcrypt

### Base de Datos
- **Desarrollo**: localhost con usuario `tradeoptix_dev`
- **Producción**: `tradeoptix-dbprincipal-exnswt` con usuario `tradeoptix_user`

### CORS
Los orígenes permitidos están configurados en `.env`:
```
ALLOWED_ORIGINS=https://admin.tradeoptix.app,https://app.tradeoptix.app,https://tradeoptix.app
```

---

## ✨ Mejoras Futuras

1. **Integración Real de Push Notifications**
   - Implementar FCM para Android
   - Implementar APNS para iOS
   - Implementar Web Push para navegadores

2. **Mejorar el Modal**
   - Agregar animaciones de entrada/salida
   - Mejorar accesibilidad (ARIA labels)
   - Agregar validación en tiempo real

3. **Testing Automatizado**
   - Tests unitarios para los nuevos métodos
   - Tests de integración para la ruta `/send-push`
   - Tests E2E para el flujo completo del modal

---

## 🆘 Troubleshooting

### Si el endpoint devuelve 404:
1. Verificar que el servidor esté ejecutándose
2. Verificar que las rutas estén registradas correctamente
3. Revisar los logs del servidor

### Si el modal no aparece:
1. Verificar la consola del navegador
2. Verificar que `isOpen` esté en `true`
3. Verificar que no haya errores de compilación de Tailwind

### Si las credenciales de admin no funcionan:
1. Verificar el hash de bcrypt en la base de datos
2. Generar un nuevo hash y actualizarlo
3. Verificar que el email sea correcto

---

## 📊 Estado Actual

- ✅ Ruta `/send-push` implementada
- ✅ Métodos del servicio agregados
- ✅ Handler implementado
- ⏳ Pendiente deployment a producción
- ⏳ Pendiente verificación del modal en producción
- ⏳ Pendiente integración real de push notifications

---

## 🔗 Referencias

- [Documentación de Gin](https://gin-gonic.com/docs/)
- [Firebase Cloud Messaging](https://firebase.google.com/docs/cloud-messaging)
- [Apple Push Notifications](https://developer.apple.com/documentation/usernotifications)
- [Web Push Protocol](https://web.dev/push-notifications-overview/)

# 🔒 Solución - Error de Hash de Contraseña en Producción

## ❌ Problema Detectado

El backend en producción se caía con el siguiente error:
```
Hash: $2a$10$afcFvN9qUfIKOlTEfnLdV.YKDCPzNVdkcSU1w8NOZp082p.IwjgMy
✓ Hash verified correctly
✗ Old hash verification failed: crypto/bcrypt: hashedPassword is not the hash of the given password
```

## 🔍 Causas Identificadas

1. **Archivo de test en producción**: El archivo `test_hash.go` estaba ejecutándose y causando el crash
2. **Hash incorrecto en BD**: El hash `$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi` NO correspondía a la contraseña "admin123"

## ✅ Soluciones Aplicadas

### 1. Eliminación de archivo problemático
```bash
rm /home/victalejo/tradeoptix-back/test_hash.go
```

### 2. Generación de hash correcto
Se generó un nuevo hash válido para la contraseña "admin123":
```
$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.
```

### 3. Actualización en base de datos
Se ejecutó el SQL en producción:
```sql
UPDATE users 
SET password_hash = '$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.',
    updated_at = NOW()
WHERE email = 'admin@tradeoptix.com' AND role = 'admin';
```

✅ Resultado: `UPDATE 1` - Hash actualizado correctamente

### 4. Actualización de migraciones
Se actualizaron los archivos:
- ✅ `migrations/000001_initial_schema.up.sql`
- ✅ `create_admin.sql`

### 5. Recompilación del backend
```bash
go build -o bin/tradeoptix-server cmd/server/main.go
```

## 📋 Archivos Modificados

1. **Eliminados:**
   - `test_hash.go` (archivo de prueba que causaba el crash)

2. **Actualizados:**
   - `migrations/000001_initial_schema.up.sql`
   - `create_admin.sql`

3. **Creados:**
   - `fix_admin_password.sql` (script de actualización)
   - `verify_admin_login.sh` (script de verificación)

## 🔐 Credenciales del Administrador

- **Email:** admin@tradeoptix.com
- **Password:** admin123
- **Hash:** `$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.`
- **Rol:** admin
- **Estado KYC:** approved

## ✅ Verificación

Para verificar que el login funciona correctamente:

```bash
./verify_admin_login.sh
```

O manualmente:
```bash
curl -X POST https://api.tradeoptix.app/api/v1/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@tradeoptix.com",
    "password": "admin123"
  }'
```

Respuesta esperada:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@tradeoptix.com",
    "role": "admin",
    "kyc_status": "approved"
  },
  "expires_at": "2025-10-04T..."
}
```

## 🚀 Siguientes Pasos

1. ✅ Verificar que el backend arranca sin errores
2. ✅ Probar login del administrador
3. ✅ Verificar acceso al panel de administración
4. ✅ Desplegar en producción

## ⚠️ Notas Importantes

- **NUNCA** incluir archivos de test (`test_*.go`) en builds de producción
- **SIEMPRE** verificar que los hashes bcrypt sean válidos antes de guardarlos en BD
- El hash bcrypt cambia en cada generación (es normal y seguro)
- La contraseña debe cambiarse después del primer login en producción

## 📝 Lecciones Aprendidas

1. Los archivos de test deben estar claramente identificados y excluidos del build
2. Los hashes de contraseñas deben verificarse antes de usar en producción
3. Tener scripts de verificación automatizados es crucial
4. Documentar credenciales de admin de forma segura

---
**Fecha de solución:** 2025-10-03
**Estado:** ✅ RESUELTO

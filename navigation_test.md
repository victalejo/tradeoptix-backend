# Script de Prueba - Barra de Navegación Condicional

## Comportamiento Esperado

### Usuario NO Verificado (kyc_status != 'approved')
- ✅ Muestra barra de navegación inferior con 2 pestañas:
  - "Inicio" (Home)
  - "Verificación" (KYC)
- ✅ Muestra sección "Estado de Verificación" en HomeScreen
- ✅ Muestra botón "Verificar" en "Acciones Rápidas"
- ✅ Las tarjetas de acción ocupan 22% de ancho cada una

### Usuario Verificado (kyc_status === 'approved')
- ✅ NO muestra barra de navegación inferior 
- ✅ Usa Stack Navigator (navegación solo por programación)
- ✅ NO muestra sección "Estado de Verificación" en HomeScreen
- ✅ NO muestra botón "Verificar" en "Acciones Rápidas"
- ✅ Las tarjetas de acción ocupan 30% de ancho cada una (3 elementos)

## Cómo Probar

### Opción 1: Cambiar estado en Base de Datos
```sql
-- Marcar usuario como verificado
UPDATE users SET kyc_status = 'approved' WHERE id = 'USER_ID';

-- Marcar usuario como no verificado
UPDATE users SET kyc_status = 'pending' WHERE id = 'USER_ID';
```

### Opción 2: Usar Admin Frontend
1. Ir a http://localhost:3000/users
2. Buscar el usuario deseado
3. Cambiar el estado KYC desde el panel

### Opción 3: Modificar temporalmente AuthContext (para pruebas rápidas)
```tsx
// En src/context/AuthContext.tsx, cambiar temporalmente:
const [user, setUser] = useState<User | null>({
  // ... otros campos
  kyc_status: 'approved' // o 'pending' para probar
});
```

## Flujo de Navegación

### Stack Navigator (Usuario Verificado)
```
Home Screen → (programáticamente) → KYC Screen
```

### Tab Navigator (Usuario No Verificado)  
```
[Inicio] [Verificación] ← Barra inferior siempre visible
   ↕           ↕
Home Screen  KYC Screen
```

## Archivos Afectados
- `src/navigation/AppNavigator.tsx` - Lógica condicional de navegadores
- `src/screens/HomeScreen.tsx` - UI condicional
- `src/context/AuthContext.tsx` - Estado del usuario
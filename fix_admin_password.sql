-- Actualizar el hash de la contraseña del admin con un hash válido
-- Contraseña: admin123
-- Hash generado: $2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.

UPDATE users 
SET password_hash = '$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.',
    updated_at = NOW()
WHERE email = 'admin@tradeoptix.com' AND role = 'admin';

-- Verificar la actualización
SELECT email, role, 
       CASE 
           WHEN password_hash = '$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.' THEN '✓ Actualizado correctamente'
           ELSE '✗ Hash antiguo o incorrecto'
       END as estado
FROM users 
WHERE email = 'admin@tradeoptix.com';

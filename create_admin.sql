-- Verificar si existe un usuario administrador
SELECT * FROM users WHERE role = 'admin';

-- Si no existe, crear un usuario administrador
-- Contraseña: admin123 (hash bcrypt)
INSERT INTO users (
    id,
    first_name, 
    last_name, 
    document_type, 
    document_number, 
    email, 
    phone_number, 
    address, 
    password_hash,
    role, 
    kyc_status, 
    email_verified,
    created_at,
    updated_at
)
VALUES (
    gen_random_uuid(),
    'Admin', 
    'TradeOptix', 
    'cedula', 
    'ADM-001', 
    'admin@tradeoptix.com', 
    '+58-000-0000000', 
    'Caracas, Venezuela',
    '$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.', -- admin123
    'admin', 
    'approved', 
    true,
    NOW(),
    NOW()
)
ON CONFLICT (email) DO UPDATE SET
    password_hash = EXCLUDED.password_hash,
    updated_at = NOW();
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
) VALUES (
    gen_random_uuid(),
    'Admin',
    'TradeOptix',
    'cedula',
    'ADMIN001',
    'admin@tradeoptix.com',
    '+1234567890',
    'Admin Address',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- admin123
    'admin',
    'approved',
    true,
    NOW(),
    NOW()
) ON CONFLICT (email) DO NOTHING;
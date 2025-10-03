CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de usuarios
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula', 'pasaporte')),
    document_number VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    phone_number VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    facebook_profile VARCHAR(200),
    instagram_profile VARCHAR(200),
    twitter_profile VARCHAR(200),
    linkedin_profile VARCHAR(200),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    kyc_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (kyc_status IN ('pending', 'approved', 'rejected')),
    email_verified BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Tabla de documentos KYC
CREATE TABLE kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    document_type VARCHAR(20) NOT NULL CHECK (document_type IN ('cedula_front', 'cedula_back', 'face_photo')),
    file_path VARCHAR(500) NOT NULL,
    original_name VARCHAR(200) NOT NULL,
    file_size BIGINT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    rejection_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    UNIQUE(user_id, document_type)
);

-- Índices para mejorar performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_document_number ON users(document_number);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_kyc_documents_user_id ON kyc_documents(user_id);
CREATE INDEX idx_kyc_documents_status ON kyc_documents(status);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    
CREATE TRIGGER update_kyc_documents_updated_at BEFORE UPDATE ON kyc_documents 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insertar usuario administrador por defecto
INSERT INTO users (first_name, last_name, document_type, document_number, email, phone_number, address, password_hash, role, kyc_status, email_verified)
VALUES (
    'Admin', 'TradeOptix', 'cedula', 'ADM-001', 'admin@tradeoptix.com', '+58-000-0000000', 'Caracas, Venezuela',
    '$2a$10$pl50mBe9o4alXi9T/LaJz.xmYdGkVwN.NMUiRRVAmmRPO1dpmDgH.', -- password: "admin123"
    'admin', 'approved', true
)
ON CONFLICT (email) DO NOTHING;
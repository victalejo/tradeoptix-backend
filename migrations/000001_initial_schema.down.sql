-- Eliminar triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
DROP TRIGGER IF EXISTS update_kyc_documents_updated_at ON kyc_documents;

-- Eliminar función
DROP FUNCTION IF EXISTS update_updated_at_column();

-- Eliminar índices
DROP INDEX IF EXISTS idx_users_email;
DROP INDEX IF EXISTS idx_users_document_number;
DROP INDEX IF EXISTS idx_users_kyc_status;
DROP INDEX IF EXISTS idx_kyc_documents_user_id;
DROP INDEX IF EXISTS idx_kyc_documents_status;

-- Eliminar tablas
DROP TABLE IF EXISTS kyc_documents;
DROP TABLE IF EXISTS users;

-- Eliminar extensión
DROP EXTENSION IF EXISTS "uuid-ossp";
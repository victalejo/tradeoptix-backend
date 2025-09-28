-- Configuración de PostgreSQL para TradeOptix
-- Ejecutar estos comandos como usuario postgres

-- 1. Crear base de datos y usuario
CREATE DATABASE tradeoptix_db;
CREATE USER tradeoptix_user WITH ENCRYPTED PASSWORD 'tradeoptix_pass';

-- 2. Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE tradeoptix_db TO tradeoptix_user;
ALTER USER tradeoptix_user CREATEDB;

-- 3. Conectar a la base de datos y otorgar permisos en el schema
\c tradeoptix_db;
GRANT ALL ON SCHEMA public TO tradeoptix_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tradeoptix_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tradeoptix_user;

-- 4. Configuración adicional para desarrollo
ALTER DATABASE tradeoptix_db SET timezone TO 'UTC';

-- Para verificar la instalación:
-- SELECT current_database(), current_user;
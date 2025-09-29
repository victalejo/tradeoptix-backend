-- Tabla de noticias del mercado
CREATE TABLE IF NOT EXISTS market_news (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    summary VARCHAR(500),
    image_url VARCHAR(500),
    category VARCHAR(100) DEFAULT 'general',
    priority INTEGER DEFAULT 1, -- 1=baja, 2=media, 3=alta
    is_active BOOLEAN DEFAULT true,
    published_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'info', -- info, warning, success, error
    category VARCHAR(100) DEFAULT 'general', -- general, kyc, market, system
    data JSONB, -- datos adicionales para la notificación
    is_read BOOLEAN DEFAULT false,
    is_push_sent BOOLEAN DEFAULT false,
    push_sent_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE
);

-- Índices para optimización
CREATE INDEX IF NOT EXISTS idx_market_news_active_published ON market_news(is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_market_news_category ON market_news(category);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_category ON notifications(category);

-- Insertar noticias de ejemplo
INSERT INTO market_news (title, content, summary, category, priority) VALUES 
('Mercados en Alza', 'Los principales índices bursátiles muestran una tendencia positiva durante la sesión de hoy...', 'Tendencia alcista en los mercados principales', 'markets', 2),
('Bitcoin Alcanza Nuevos Máximos', 'La criptomoneda líder continúa su rally alcanzando precios históricos...', 'BTC rompe resistencias importantes', 'crypto', 3),
('Análisis Semanal del S&P 500', 'Revisión técnica y fundamental del índice más importante de Wall Street...', 'Perspectivas del índice americano', 'analysis', 1),
('Nuevas Regulaciones Financieras', 'Las autoridades anuncian cambios importantes en la regulación del mercado...', 'Impacto regulatorio en el sector', 'regulation', 2);
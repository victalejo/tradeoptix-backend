-- Rollback para noticias y notificaciones
DROP INDEX IF EXISTS idx_notifications_category;
DROP INDEX IF EXISTS idx_notifications_created_at;
DROP INDEX IF EXISTS idx_notifications_user_read;
DROP INDEX IF EXISTS idx_market_news_category;
DROP INDEX IF EXISTS idx_market_news_active_published;

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS market_news;
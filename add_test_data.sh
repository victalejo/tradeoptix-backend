#!/bin/bash

# Script para agregar noticias y notificaciones de prueba

DB_HOST="194.163.133.7"
DB_PORT="1138"
DB_NAME="tradeoptix_db"
DB_USER="tradeoptix_user"
DB_PASSWORD="nrdys53kzx8amg50"

echo "Agregando noticias de prueba..."

# Insertar noticias de prueba
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF

-- Insertar noticias de prueba
INSERT INTO market_news (id, title, content, summary, category, priority, is_active, published_at, created_at, updated_at) VALUES
(gen_random_uuid(), 
 'Bitcoin alcanza nuevo máximo histórico', 
 'El Bitcoin ha superado los \$75,000 por primera vez en su historia, impulsado por una mayor adopción institucional y las expectativas de aprobación de ETFs spot. Los analistas sugieren que este rally podría continuar hasta finales del año, con algunos prediciendo que podría alcanzar los \$100,000.',
 'Bitcoin supera los \$75,000 por primera vez, impulsado por adopción institucional.',
 'crypto', 
 8, 
 true, 
 NOW(), 
 NOW(), 
 NOW()
),
(gen_random_uuid(), 
 'Fed mantiene tasas de interés estables', 
 'La Reserva Federal de Estados Unidos decidió mantener las tasas de interés en el rango del 5.25-5.50%, cumpliendo con las expectativas del mercado. El presidente de la Fed indicó que están monitoreando de cerca los datos de inflación antes de tomar decisiones futuras sobre las tasas.',
 'La Fed mantiene las tasas de interés sin cambios, esperando más datos de inflación.',
 'markets', 
 7, 
 true, 
 NOW() - INTERVAL '2 hours', 
 NOW() - INTERVAL '2 hours', 
 NOW() - INTERVAL '2 hours'
),
(gen_random_uuid(), 
 'Nueva regulación para criptomonedas en la UE', 
 'La Unión Europea ha aprobado una nueva regulación (MiCA) que entrará en vigor en enero de 2025, estableciendo marcos claros para la operación de exchanges y stablecoins. Esta regulación busca proporcionar mayor seguridad a los inversores mientras fomenta la innovación en el sector.',
 'UE aprueba nueva regulación MiCA para criptomonedas, vigente desde enero 2025.',
 'regulation', 
 6, 
 true, 
 NOW() - INTERVAL '4 hours', 
 NOW() - INTERVAL '4 hours', 
 NOW() - INTERVAL '4 hours'
),
(gen_random_uuid(), 
 'Análisis técnico: S&P 500 en zona de resistencia', 
 'El índice S&P 500 se encuentra actualmente en una zona crítica de resistencia en los 5,800 puntos. Los indicadores técnicos muestran señales mixtas, con el RSI en territorio de sobrecompra pero el MACD manteniendo tendencia alcista. Los traders están atentos a una posible corrección o ruptura alcista.',
 'S&P 500 enfrenta resistencia clave en 5,800 puntos con señales técnicas mixtas.',
 'analysis', 
 5, 
 true, 
 NOW() - INTERVAL '6 hours', 
 NOW() - INTERVAL '6 hours', 
 NOW() - INTERVAL '6 hours'
),
(gen_random_uuid(), 
 'Actualización del sistema TradeOptix', 
 'Hemos implementado mejoras en la seguridad del sistema y nuevas funcionalidades en la interfaz de usuario. La actualización incluye un mejor sistema de notificaciones, análisis de portafolio mejorado y nuevas herramientas de gestión de riesgo.',
 'Nuevas funcionalidades y mejoras de seguridad implementadas en TradeOptix.',
 'general', 
 4, 
 true, 
 NOW() - INTERVAL '8 hours', 
 NOW() - INTERVAL '8 hours', 
 NOW() - INTERVAL '8 hours'
);

EOF

echo "Agregando notificaciones de prueba..."

# Insertar notificaciones de prueba (globales)
PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME << EOF

-- Insertar notificaciones de prueba (para todos los usuarios)
INSERT INTO notifications (id, title, message, type, category, is_read, is_push_sent, created_at, expires_at) VALUES
(gen_random_uuid(),
 'Verificación de identidad requerida',
 'Para acceder a todas las funcionalidades de trading, es necesario completar el proceso de verificación KYC. Sube los documentos requeridos en la sección de verificación.',
 'warning',
 'kyc',
 false,
 false,
 NOW(),
 NOW() + INTERVAL '30 days'
),
(gen_random_uuid(),
 'Mantenimiento programado',
 'El sistema estará en mantenimiento el domingo de 2:00 AM a 4:00 AM. Durante este tiempo, algunas funcionalidades podrían no estar disponibles.',
 'info',
 'system',
 false,
 false,
 NOW() - INTERVAL '1 hour',
 NOW() + INTERVAL '7 days'
),
(gen_random_uuid(),
 'Alerta de volatilidad del mercado',
 'Los mercados están experimentando alta volatilidad debido a eventos macroeconómicos. Se recomienda revisar las posiciones abiertas y considerar estrategias de gestión de riesgo.',
 'warning',
 'market',
 false,
 true,
 NOW() - INTERVAL '30 minutes',
 NOW() + INTERVAL '24 hours'
),
(gen_random_uuid(),
 'Nuevas funcionalidades disponibles',
 'Hemos agregado nuevas herramientas de análisis técnico y reportes de rendimiento en tu panel de control. Explora las nuevas funcionalidades en la sección de análisis.',
 'success',
 'general',
 true,
 true,
 NOW() - INTERVAL '2 hours',
 NOW() + INTERVAL '14 days'
),
(gen_random_uuid(),
 'Error en el procesamiento de depósito',
 'Hemos detectado un problema con tu último depósito. Por favor, contacta al soporte técnico para resolver esta incidencia lo antes posible.',
 'error',
 'general',
 false,
 false,
 NOW() - INTERVAL '3 hours',
 NOW() + INTERVAL '3 days'
);

EOF

echo "¡Datos de prueba agregados exitosamente!"
echo "Se agregaron 5 noticias y 5 notificaciones de prueba."
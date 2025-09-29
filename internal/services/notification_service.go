package services

import (
	"database/sql"
	"fmt"
	"time"

	"tradeoptix-back/internal/models"

	"github.com/google/uuid"
)

type NotificationService struct {
	DB *sql.DB
}

func NewNotificationService(db *sql.DB) *NotificationService {
	return &NotificationService{DB: db}
}

// CreateNotification crea una nueva notificación
func (s *NotificationService) CreateNotification(req models.CreateNotificationRequest) (*models.Notification, error) {
	var dataJSON *string
	if req.Data != nil {
		dataJSON = req.Data
	}

	query := `
		INSERT INTO notifications (user_id, title, message, type, category, data)
		VALUES ($1, $2, $3, $4, $5, $6)
		RETURNING id, user_id, title, message, type, category, data, is_read, 
		         is_push_sent, push_sent_at, created_at, expires_at
	`

	var notification models.Notification
	err := s.DB.QueryRow(
		query, req.UserID, req.Title, req.Message, req.Type, req.Category, dataJSON,
	).Scan(
		&notification.ID, &notification.UserID, &notification.Title, &notification.Message,
		&notification.Type, &notification.Category, &notification.Data, &notification.IsRead,
		&notification.IsPushSent, &notification.PushSentAt, &notification.CreatedAt,
		&notification.ExpiresAt,
	)

	if err != nil {
		return nil, fmt.Errorf("error creando notificación: %v", err)
	}

	// Si se debe enviar push notification, marcarla como enviada
	if req.SendPush {
		err = s.markPushNotificationSent(notification.ID)
		if err != nil {
			// No fallar por esto, pero log el error
			fmt.Printf("Error marcando push notification como enviada: %v\n", err)
		} else {
			notification.IsPushSent = true
			now := time.Now()
			notification.PushSentAt = &now
		}
	}

	return &notification, nil
}

// CreateBroadcastNotification crea una notificación para todos los usuarios
func (s *NotificationService) CreateBroadcastNotification(req models.CreateNotificationRequest) error {
	// Obtener todos los usuarios activos
	userQuery := "SELECT id FROM users WHERE role = 'user'"
	rows, err := s.DB.Query(userQuery)
	if err != nil {
		return fmt.Errorf("error obteniendo usuarios: %v", err)
	}
	defer rows.Close()

	var userIDs []uuid.UUID
	for rows.Next() {
		var userID uuid.UUID
		if err := rows.Scan(&userID); err != nil {
			return fmt.Errorf("error escaneando usuario: %v", err)
		}
		userIDs = append(userIDs, userID)
	}

	// Crear notificación para cada usuario
	for _, userID := range userIDs {
		notificationReq := req
		notificationReq.UserID = &userID
		_, err := s.CreateNotification(notificationReq)
		if err != nil {
			fmt.Printf("Error creando notificación para usuario %v: %v\n", userID, err)
			// Continuar con otros usuarios
		}
	}

	return nil
}

// GetUserNotifications obtiene las notificaciones de un usuario
func (s *NotificationService) GetUserNotifications(userID uuid.UUID, page, limit int, unreadOnly bool) ([]models.Notification, int, error) {
	offset := (page - 1) * limit

	whereClause := "WHERE user_id = $1"
	args := []interface{}{userID}
	argIndex := 2

	if unreadOnly {
		whereClause += fmt.Sprintf(" AND is_read = $%d", argIndex)
		args = append(args, false)
		argIndex++
	}

	// Contar total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM notifications %s", whereClause)
	var total int
	err := s.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("error contando notificaciones: %v", err)
	}

	// Obtener notificaciones
	query := fmt.Sprintf(`
		SELECT id, user_id, title, message, type, category, data, is_read,
		       is_push_sent, push_sent_at, created_at, expires_at
		FROM notifications 
		%s 
		ORDER BY created_at DESC 
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("error obteniendo notificaciones: %v", err)
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(
			&notification.ID, &notification.UserID, &notification.Title, &notification.Message,
			&notification.Type, &notification.Category, &notification.Data, &notification.IsRead,
			&notification.IsPushSent, &notification.PushSentAt, &notification.CreatedAt,
			&notification.ExpiresAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("error escaneando notificación: %v", err)
		}
		notifications = append(notifications, notification)
	}

	return notifications, total, nil
}

// MarkNotificationAsRead marca una notificación como leída
func (s *NotificationService) MarkNotificationAsRead(userID, notificationID uuid.UUID) error {
	query := `
		UPDATE notifications 
		SET is_read = true 
		WHERE id = $1 AND user_id = $2
	`

	result, err := s.DB.Exec(query, notificationID, userID)
	if err != nil {
		return fmt.Errorf("error marcando notificación como leída: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("notificación no encontrada")
	}

	return nil
}

// MarkAllNotificationsAsRead marca todas las notificaciones de un usuario como leídas
func (s *NotificationService) MarkAllNotificationsAsRead(userID uuid.UUID) error {
	query := `
		UPDATE notifications 
		SET is_read = true 
		WHERE user_id = $1 AND is_read = false
	`

	_, err := s.DB.Exec(query, userID)
	if err != nil {
		return fmt.Errorf("error marcando todas las notificaciones como leídas: %v", err)
	}

	return nil
}

// GetUnreadCount obtiene el número de notificaciones no leídas de un usuario
func (s *NotificationService) GetUnreadCount(userID uuid.UUID) (int, error) {
	query := `
		SELECT COUNT(*) 
		FROM notifications 
		WHERE user_id = $1 AND is_read = false
	`

	var count int
	err := s.DB.QueryRow(query, userID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("error obteniendo contador de no leídas: %v", err)
	}

	return count, nil
}

// DeleteNotification elimina una notificación
func (s *NotificationService) DeleteNotification(userID, notificationID uuid.UUID) error {
	query := `
		DELETE FROM notifications 
		WHERE id = $1 AND user_id = $2
	`

	result, err := s.DB.Exec(query, notificationID, userID)
	if err != nil {
		return fmt.Errorf("error eliminando notificación: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("notificación no encontrada")
	}

	return nil
}

// CleanupExpiredNotifications elimina notificaciones expiradas
func (s *NotificationService) CleanupExpiredNotifications() error {
	query := `
		DELETE FROM notifications 
		WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP
	`

	_, err := s.DB.Exec(query)
	if err != nil {
		return fmt.Errorf("error limpiando notificaciones expiradas: %v", err)
	}

	return nil
}

// markPushNotificationSent marca una notificación como enviada por push
func (s *NotificationService) markPushNotificationSent(notificationID uuid.UUID) error {
	query := `
		UPDATE notifications 
		SET is_push_sent = true, push_sent_at = CURRENT_TIMESTAMP 
		WHERE id = $1
	`

	_, err := s.DB.Exec(query, notificationID)
	return err
}

// GetNotificationStats obtiene estadísticas de notificaciones
func (s *NotificationService) GetNotificationStats() (*models.NotificationStats, error) {
	stats := &models.NotificationStats{}

	// Total de notificaciones
	err := s.DB.QueryRow("SELECT COUNT(*) FROM notifications").Scan(&stats.TotalNotifications)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo total de notificaciones: %v", err)
	}

	// Notificaciones no leídas
	err = s.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE is_read = false").Scan(&stats.UnreadNotifications)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo notificaciones no leídas: %v", err)
	}

	// Notificaciones de hoy
	err = s.DB.QueryRow(`
		SELECT COUNT(*) FROM notifications 
		WHERE DATE(created_at) = CURRENT_DATE
	`).Scan(&stats.TodayNotifications)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo notificaciones de hoy: %v", err)
	}

	// Push notifications enviadas
	err = s.DB.QueryRow("SELECT COUNT(*) FROM notifications WHERE is_push_sent = true").Scan(&stats.PushNotificationsSent)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo push notifications enviadas: %v", err)
	}

	return stats, nil
}

// GetAllNotifications obtiene todas las notificaciones para admin
func (s *NotificationService) GetAllNotifications(page, limit int, category string) ([]models.Notification, int, error) {
	offset := (page - 1) * limit

	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if category != "" {
		whereClause += fmt.Sprintf(" AND category = $%d", argIndex)
		args = append(args, category)
		argIndex++
	}

	// Contar total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM notifications %s", whereClause)
	var total int
	err := s.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("error contando notificaciones: %v", err)
	}

	// Obtener notificaciones
	query := fmt.Sprintf(`
		SELECT id, user_id, title, message, type, category, data, is_read,
		       is_push_sent, push_sent_at, created_at, expires_at
		FROM notifications 
		%s 
		ORDER BY created_at DESC 
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("error obteniendo notificaciones: %v", err)
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var notification models.Notification
		err := rows.Scan(
			&notification.ID, &notification.UserID, &notification.Title, &notification.Message,
			&notification.Type, &notification.Category, &notification.Data, &notification.IsRead,
			&notification.IsPushSent, &notification.PushSentAt, &notification.CreatedAt,
			&notification.ExpiresAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("error escaneando notificación: %v", err)
		}
		notifications = append(notifications, notification)
	}

	return notifications, total, nil
}
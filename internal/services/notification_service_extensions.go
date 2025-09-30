package services

import (
	"database/sql"
	"fmt"

	"tradeoptix-back/internal/models"

	"github.com/google/uuid"
)

// GetNotificationByID obtiene una notificación por su ID
func (s *NotificationService) GetNotificationByID(notificationID uuid.UUID) (*models.Notification, error) {
	query := `
		SELECT id, user_id, title, message, type, category, data, is_read,
		       is_push_sent, push_sent_at, created_at, expires_at
		FROM notifications 
		WHERE id = $1
	`

	var notification models.Notification
	err := s.DB.QueryRow(query, notificationID).Scan(
		&notification.ID, &notification.UserID, &notification.Title, &notification.Message,
		&notification.Type, &notification.Category, &notification.Data, &notification.IsRead,
		&notification.IsPushSent, &notification.PushSentAt, &notification.CreatedAt,
		&notification.ExpiresAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("notificación no encontrada")
		}
		return nil, fmt.Errorf("error obteniendo notificación: %v", err)
	}

	return &notification, nil
}

// SendPushNotification simula el envío de una notificación push
// En el futuro se puede integrar con Firebase Cloud Messaging o similar
func (s *NotificationService) SendPushNotification(notificationID uuid.UUID, title, message string) error {
	// Por ahora solo marcar como enviada
	// En el futuro aquí se integraría con el servicio de push notifications
	
	query := `
		UPDATE notifications 
		SET is_push_sent = true, push_sent_at = CURRENT_TIMESTAMP 
		WHERE id = $1
	`

	result, err := s.DB.Exec(query, notificationID)
	if err != nil {
		return fmt.Errorf("error marcando push notification como enviada: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("notificación no encontrada para envío push")
	}

	// Aquí se podría hacer log del envío exitoso
	fmt.Printf("Push notification enviada: ID=%v, Título=%s\n", notificationID, title)

	return nil
}
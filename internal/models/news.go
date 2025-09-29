package models

import (
	"time"

	"github.com/google/uuid"
)

// MarketNews representa una noticia del mercado
type MarketNews struct {
	ID          uuid.UUID  `json:"id" db:"id"`
	Title       string     `json:"title" db:"title"`
	Content     string     `json:"content" db:"content"`
	Summary     *string    `json:"summary" db:"summary"`
	ImageURL    *string    `json:"image_url" db:"image_url"`
	Category    string     `json:"category" db:"category"`
	Priority    int        `json:"priority" db:"priority"`
	IsActive    bool       `json:"is_active" db:"is_active"`
	PublishedAt time.Time  `json:"published_at" db:"published_at"`
	CreatedBy   *uuid.UUID `json:"created_by" db:"created_by"`
	CreatedAt   time.Time  `json:"created_at" db:"created_at"`
	UpdatedAt   time.Time  `json:"updated_at" db:"updated_at"`
}

// CreateNewsRequest representa la petición para crear una noticia
type CreateNewsRequest struct {
	Title    string  `json:"title" binding:"required" validate:"min=3,max=255"`
	Content  string  `json:"content" binding:"required" validate:"min=10"`
	Summary  *string `json:"summary" validate:"max=500"`
	ImageURL *string `json:"image_url" validate:"url"`
	Category string  `json:"category" validate:"oneof=general markets crypto analysis regulation"`
	Priority int     `json:"priority" validate:"min=1,max=3"`
}

// UpdateNewsRequest representa la petición para actualizar una noticia
type UpdateNewsRequest struct {
	Title    *string `json:"title" validate:"min=3,max=255"`
	Content  *string `json:"content" validate:"min=10"`
	Summary  *string `json:"summary" validate:"max=500"`
	ImageURL *string `json:"image_url" validate:"url"`
	Category *string `json:"category" validate:"oneof=general markets crypto analysis regulation"`
	Priority *int    `json:"priority" validate:"min=1,max=3"`
	IsActive *bool   `json:"is_active"`
}

// Notification representa una notificación del sistema
type Notification struct {
	ID         uuid.UUID  `json:"id" db:"id"`
	UserID     *uuid.UUID `json:"user_id" db:"user_id"`
	Title      string     `json:"title" db:"title"`
	Message    string     `json:"message" db:"message"`
	Type       string     `json:"type" db:"type"`
	Category   string     `json:"category" db:"category"`
	Data       *string    `json:"data" db:"data"`
	IsRead     bool       `json:"is_read" db:"is_read"`
	IsPushSent bool       `json:"is_push_sent" db:"is_push_sent"`
	PushSentAt *time.Time `json:"push_sent_at" db:"push_sent_at"`
	CreatedAt  time.Time  `json:"created_at" db:"created_at"`
	ExpiresAt  *time.Time `json:"expires_at" db:"expires_at"`
}

// CreateNotificationRequest representa la petición para crear una notificación
type CreateNotificationRequest struct {
	UserID   *uuid.UUID `json:"user_id"`
	Title    string     `json:"title" binding:"required" validate:"min=3,max=255"`
	Message  string     `json:"message" binding:"required" validate:"min=5"`
	Type     string     `json:"type" validate:"oneof=info warning success error"`
	Category string     `json:"category" validate:"oneof=general kyc market system"`
	Data     *string    `json:"data"`
	SendPush bool       `json:"send_push"`
}

// NotificationStats representa estadísticas de notificaciones
type NotificationStats struct {
	TotalNotifications    int `json:"total_notifications"`
	UnreadNotifications   int `json:"unread_notifications"`
	TodayNotifications    int `json:"today_notifications"`
	PushNotificationsSent int `json:"push_notifications_sent"`
}

// NewsStats representa estadísticas de noticias
type NewsStats struct {
	TotalNews      int            `json:"total_news"`
	ActiveNews     int            `json:"active_news"`
	TodayNews      int            `json:"today_news"`
	NewsByCategory map[string]int `json:"news_by_category"`
}

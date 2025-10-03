package handlers

import (
	"log"
	"net/http"
	"strconv"

	"tradeoptix-back/internal/models"
	"tradeoptix-back/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NotificationHandler struct {
	NotificationService *services.NotificationService
}

func NewNotificationHandler(notificationService *services.NotificationService) *NotificationHandler {
	return &NotificationHandler{
		NotificationService: notificationService,
	}
}

// CreateNotification crea una nueva notificación (solo admins)
func (h *NotificationHandler) CreateNotification(c *gin.Context) {
	var req models.CreateNotificationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	// Valores por defecto
	if req.Type == "" {
		req.Type = "info"
	}
	if req.Category == "" {
		req.Category = "general"
	}

	// Si no se especifica usuario, es broadcast
	if req.UserID == nil {
		err := h.NotificationService.CreateBroadcastNotification(req)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando notificación broadcast", "details": err.Error()})
			return
		}
		c.JSON(http.StatusCreated, gin.H{"message": "Notificación enviada a todos los usuarios"})
		return
	}

	notification, err := h.NotificationService.CreateNotification(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando notificación", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, notification)
}

// GetUserNotifications obtiene notificaciones del usuario autenticado
func (h *NotificationHandler) GetUserNotifications(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		log.Printf("❌ Usuario no autenticado - user_id no encontrado en contexto")
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	log.Printf("🔍 GetUserNotifications - UserID: %v", userID)

	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	unreadOnlyStr := c.DefaultQuery("unread_only", "false")
	unreadOnly := unreadOnlyStr == "true"

	log.Printf("📄 Parámetros - Page: %d, Limit: %d, UnreadOnly: %v", page, limit, unreadOnly)

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	notifications, total, err := h.NotificationService.GetUserNotifications(
		userID.(uuid.UUID), page, limit, unreadOnly,
	)
	if err != nil {
		log.Printf("❌ Error obteniendo notificaciones: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificaciones", "details": err.Error()})
		return
	}

	log.Printf("✅ Notificaciones obtenidas - Total: %d, Devueltas: %d", total, len(notifications))

	totalPages := (total + limit - 1) / limit

	response := gin.H{
		"data":        notifications,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GetUnreadCount obtiene el contador de notificaciones no leídas
func (h *NotificationHandler) GetUnreadCount(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	count, err := h.NotificationService.GetUnreadCount(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo contador", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"unread_count": count})
}

// MarkAsRead marca una notificación como leída
func (h *NotificationHandler) MarkAsRead(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	notificationIDStr := c.Param("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de notificación inválido"})
		return
	}

	err = h.NotificationService.MarkNotificationAsRead(userID.(uuid.UUID), notificationID)
	if err != nil {
		if err.Error() == "notificación no encontrada" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notificación no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando como leída", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notificación marcada como leída"})
}

// MarkAllAsRead marca todas las notificaciones como leídas
func (h *NotificationHandler) MarkAllAsRead(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	err := h.NotificationService.MarkAllNotificationsAsRead(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando todas como leídas", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Todas las notificaciones marcadas como leídas"})
}

// DeleteNotification elimina una notificación
func (h *NotificationHandler) DeleteNotification(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	notificationIDStr := c.Param("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de notificación inválido"})
		return
	}

	err = h.NotificationService.DeleteNotification(userID.(uuid.UUID), notificationID)
	if err != nil {
		if err.Error() == "notificación no encontrada" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notificación no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando notificación", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notificación eliminada exitosamente"})
}

// GetAllNotifications obtiene todas las notificaciones para admin
func (h *NotificationHandler) GetAllNotifications(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "20"))
	category := c.Query("category")

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}

	notifications, total, err := h.NotificationService.GetAllNotifications(page, limit, category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificaciones", "details": err.Error()})
		return
	}

	totalPages := (total + limit - 1) / limit

	response := gin.H{
		"data":        notifications,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GetNotificationStats obtiene estadísticas de notificaciones (solo admins)
func (h *NotificationHandler) GetNotificationStats(c *gin.Context) {
	stats, err := h.NotificationService.GetNotificationStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// CleanupExpired limpia notificaciones expiradas (solo admins)
func (h *NotificationHandler) CleanupExpired(c *gin.Context) {
	err := h.NotificationService.CleanupExpiredNotifications()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error limpiando notificaciones", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Notificaciones expiradas limpiadas exitosamente"})
}

// SendPushNotification envía una notificación push a los dispositivos registrados (solo admins)
func (h *NotificationHandler) SendPushNotification(c *gin.Context) {
	notificationIDStr := c.Param("id")
	notificationID, err := uuid.Parse(notificationIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de notificación inválido"})
		return
	}

	// Verificar que la notificación existe
	notification, err := h.NotificationService.GetNotificationByID(notificationID)
	if err != nil {
		if err.Error() == "notificación no encontrada" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Notificación no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo notificación", "details": err.Error()})
		return
	}

	// Por ahora, simular el envío de push notification
	// En el futuro aquí se integraría con Firebase Cloud Messaging o similar
	err = h.NotificationService.SendPushNotification(notificationID, notification.Title, notification.Message)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error enviando notificación push", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message":         "Notificación push enviada exitosamente",
		"notification_id": notificationID,
		"title":           notification.Title,
	})
}

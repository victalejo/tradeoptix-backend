package handlers

import (
	"net/http"
	"tradeoptix-back/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	UserService *services.UserService
	KYCService  *services.KYCService
}

func NewAdminHandler(userService *services.UserService, kycService *services.KYCService) *AdminHandler {
	return &AdminHandler{
		UserService: userService,
		KYCService:  kycService,
	}
}

// GetAllUsers godoc
// @Summary Obtener todos los usuarios (Admin)
// @Description Obtiene una lista de todos los usuarios registrados
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.User
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /admin/users [get]
func (h *AdminHandler) GetAllUsers(c *gin.Context) {
	users, err := h.UserService.GetAllUsers()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuarios"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  users,
		"total": len(users),
		"page":  1,
		"limit": len(users),
	})
}

// ApproveDocument godoc
// @Summary Aprobar documento KYC (Admin)
// @Description Aprueba un documento KYC específico
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del documento"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /admin/kyc/{id}/approve [put]
func (h *AdminHandler) ApproveDocument(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	docIDStr := c.Param("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento inválido"})
		return
	}

	err = h.KYCService.ApproveDocument(docID, adminID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error aprobando documento"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Documento aprobado exitosamente"})
}

// RejectDocument godoc
// @Summary Rechazar documento KYC (Admin)
// @Description Rechaza un documento KYC con una razón específica
// @Tags admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param id path string true "ID del documento"
// @Param body body object{reason=string} true "Razón del rechazo"
// @Success 200 {object} map[string]string
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Failure 403 {object} map[string]string
// @Router /admin/kyc/{id}/reject [put]
func (h *AdminHandler) RejectDocument(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	docIDStr := c.Param("id")
	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento inválido"})
		return
	}

	var requestBody struct {
		Reason string `json:"reason" binding:"required"`
	}

	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Razón de rechazo requerida"})
		return
	}

	err = h.KYCService.RejectDocument(docID, requestBody.Reason, adminID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error rechazando documento"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Documento rechazado exitosamente"})
}

// GetDashboardStats godoc
// @Summary Obtener estadísticas del dashboard (Admin)
// @Description Obtiene estadísticas generales del sistema
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} map[string]interface{}
// @Router /admin/dashboard/stats [get]
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.UserService.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

// GetUsersByKYCStatus godoc
// @Summary Obtener usuarios por estado KYC (Admin)
// @Description Obtiene usuarios filtrados por estado KYC
// @Tags admin
// @Produce json
// @Security BearerAuth
// @Param status query string false "Estado KYC (pending, approved, rejected)"
// @Success 200 {array} models.User
// @Router /admin/users/kyc [get]
func (h *AdminHandler) GetUsersByKYCStatus(c *gin.Context) {
	status := c.Query("status")

	users, err := h.UserService.GetUsersByKYCStatus(status)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo usuarios"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  users,
		"total": len(users),
	})
}

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

func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.UserService.GetDashboardStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}

	c.JSON(http.StatusOK, stats)
}

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

func (h *AdminHandler) GetPendingDocuments(c *gin.Context) {
	documents, err := h.KYCService.GetPendingDocuments()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo documentos pendientes"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"data":  documents,
		"total": len(documents),
	})
}

func (h *AdminHandler) ServeDocument(c *gin.Context) {
	docIDStr := c.Param("id")
	if docIDStr == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento requerido"})
		return
	}

	docID, err := uuid.Parse(docIDStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento inválido"})
		return
	}

	// Obtener documento por ID (admin puede ver cualquier documento)
	document, err := h.KYCService.GetDocumentByID(docID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Documento no encontrado"})
		return
	}

	// Servir el archivo para vista previa
	c.Header("Content-Type", document.MimeType)
	c.Header("Cache-Control", "max-age=3600")
	c.File(document.FilePath)
}

package handlers

import (
	"net/http"
	"path/filepath"
	"tradeoptix-back/internal/models"
	"tradeoptix-back/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type KYCHandler struct {
	KYCService *services.KYCService
}

func NewKYCHandler(kycService *services.KYCService) *KYCHandler {
	return &KYCHandler{
		KYCService: kycService,
	}
}

// UploadDocument godoc
// @Summary Subir documento KYC
// @Description Sube un documento para el proceso KYC (cédula frente/atrás o foto facial)
// @Tags KYC
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param document_type formData string true "Tipo de documento" Enums(cedula_front, cedula_back, face_photo)
// @Param file formData file true "Archivo de imagen"
// @Success 201 {object} models.KYCDocument
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /kyc/upload [post]
func (h *KYCHandler) UploadDocument(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	documentType := c.PostForm("document_type")
	if documentType == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Tipo de documento requerido"})
		return
	}

	file, err := c.FormFile("file")
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Archivo requerido"})
		return
	}

	doc, err := h.KYCService.UploadDocument(userID.(uuid.UUID), documentType, file)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message":  "Documento subido exitosamente",
		"document": doc,
	})
}

// GetUserDocuments godoc
// @Summary Obtener documentos del usuario
// @Description Obtiene todos los documentos KYC del usuario autenticado
// @Tags KYC
// @Produce json
// @Security BearerAuth
// @Success 200 {array} models.KYCDocument
// @Failure 401 {object} map[string]string
// @Router /kyc/documents [get]
func (h *KYCHandler) GetUserDocuments(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	documents, err := h.KYCService.GetUserDocuments(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo documentos"})
		return
	}

	c.JSON(http.StatusOK, documents)
}

// ServeDocument godoc
// @Summary Descargar documento
// @Description Descarga un documento KYC del usuario
// @Tags KYC
// @Produce application/octet-stream
// @Security BearerAuth
// @Param id path string true "ID del documento"
// @Success 200 {file} binary
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /kyc/documents/{id}/download [get]
func (h *KYCHandler) ServeDocument(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	docID := c.Param("id")
	if docID == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de documento requerido"})
		return
	}

	// Verificar que el documento pertenezca al usuario
	documents, err := h.KYCService.GetUserDocuments(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error verificando documento"})
		return
	}

	var targetDoc *models.KYCDocument
	for _, doc := range documents {
		if doc.ID.String() == docID {
			targetDoc = &doc
			break
		}
	}

	if targetDoc == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Documento no encontrado"})
		return
	}

	// Servir el archivo
	filename := filepath.Base(targetDoc.FilePath)
	c.Header("Content-Disposition", "attachment; filename="+filename)
	c.Header("Content-Type", targetDoc.MimeType)
	c.File(targetDoc.FilePath)
}

// ServeDocumentAdmin godoc
// @Summary Servir documento para admin (vista previa)
// @Description Sirve un documento KYC para vista previa por parte de administradores
// @Tags admin
// @Produce application/octet-stream
// @Security BearerAuth
// @Param id path string true "ID del documento"
// @Success 200 {file} binary
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /admin/kyc/documents/{id}/preview [get]
func (h *KYCHandler) ServeDocumentAdmin(c *gin.Context) {
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

	// Obtener documento por ID (sin restricción de usuario para admin)
	document, err := h.KYCService.GetDocumentByID(docID)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Documento no encontrado"})
		return
	}

	// Verificar que el archivo existe
	// Servir el archivo para vista previa (inline, no como descarga)
	c.Header("Content-Type", document.MimeType)
	c.Header("Cache-Control", "max-age=3600") // Cache por 1 hora
	c.File(document.FilePath)
}
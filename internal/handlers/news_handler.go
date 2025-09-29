package handlers

import (
	"net/http"
	"strconv"

	"tradeoptix-back/internal/models"
	"tradeoptix-back/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type NewsHandler struct {
	NewsService *services.NewsService
}

func NewNewsHandler(newsService *services.NewsService) *NewsHandler {
	return &NewsHandler{
		NewsService: newsService,
	}
}

// CreateNews crea una nueva noticia (solo admins)
func (h *NewsHandler) CreateNews(c *gin.Context) {
	adminID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	var req models.CreateNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	// Valores por defecto
	if req.Category == "" {
		req.Category = "general"
	}
	if req.Priority == 0 {
		req.Priority = 1
	}

	news, err := h.NewsService.CreateNews(req, adminID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error creando noticia", "details": err.Error()})
		return
	}

	c.JSON(http.StatusCreated, news)
}

// GetNews obtiene todas las noticias con paginación (admin)
func (h *NewsHandler) GetNews(c *gin.Context) {
	page, _ := strconv.Atoi(c.DefaultQuery("page", "1"))
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "10"))
	category := c.Query("category")
	activeOnlyStr := c.DefaultQuery("active_only", "false")
	activeOnly := activeOnlyStr == "true"

	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 10
	}

	news, total, err := h.NewsService.GetNews(page, limit, category, activeOnly)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo noticias", "details": err.Error()})
		return
	}

	totalPages := (total + limit - 1) / limit

	response := gin.H{
		"data":        news,
		"total":       total,
		"page":        page,
		"limit":       limit,
		"total_pages": totalPages,
	}

	c.JSON(http.StatusOK, response)
}

// GetLatestNews obtiene las últimas noticias activas (para app móvil)
func (h *NewsHandler) GetLatestNews(c *gin.Context) {
	limit, _ := strconv.Atoi(c.DefaultQuery("limit", "5"))
	if limit < 1 || limit > 50 {
		limit = 5
	}

	news, err := h.NewsService.GetLatestNews(limit)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo noticias", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"data": news})
}

// GetNewsByID obtiene una noticia por ID
func (h *NewsHandler) GetNewsByID(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de noticia inválido"})
		return
	}

	news, err := h.NewsService.GetNewsByID(id)
	if err != nil {
		if err.Error() == "noticia no encontrada" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Noticia no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo noticia", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, news)
}

// UpdateNews actualiza una noticia (solo admins)
func (h *NewsHandler) UpdateNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de noticia inválido"})
		return
	}

	var req models.UpdateNewsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	err = h.NewsService.UpdateNews(id, req)
	if err != nil {
		if err.Error() == "noticia no encontrada" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Noticia no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error actualizando noticia", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Noticia actualizada exitosamente"})
}

// DeleteNews elimina una noticia (solo admins)
func (h *NewsHandler) DeleteNews(c *gin.Context) {
	idStr := c.Param("id")
	id, err := uuid.Parse(idStr)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID de noticia inválido"})
		return
	}

	err = h.NewsService.DeleteNews(id)
	if err != nil {
		if err.Error() == "noticia no encontrada" {
			c.JSON(http.StatusNotFound, gin.H{"error": "Noticia no encontrada"})
			return
		}
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error eliminando noticia", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "Noticia eliminada exitosamente"})
}

// GetNewsStats obtiene estadísticas de noticias (solo admins)
func (h *NewsHandler) GetNewsStats(c *gin.Context) {
	stats, err := h.NewsService.GetNewsStats()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas", "details": err.Error()})
		return
	}

	c.JSON(http.StatusOK, stats)
}
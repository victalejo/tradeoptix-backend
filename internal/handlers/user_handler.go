package handlers

import (
	"net/http"
	"tradeoptix-back/internal/models"
	"tradeoptix-back/internal/services"

	"github.com/gin-gonic/gin"
	"github.com/go-playground/validator/v10"
	"github.com/google/uuid"
)

type UserHandler struct {
	UserService *services.UserService
	Validator   *validator.Validate
}

func NewUserHandler(userService *services.UserService) *UserHandler {
	return &UserHandler{
		UserService: userService,
		Validator:   validator.New(),
	}
}

// RegisterUser godoc
// @Summary Registrar nuevo usuario
// @Description Crea un nuevo usuario en el sistema
// @Tags usuarios
// @Accept json
// @Produce json
// @Param user body models.UserRegistrationRequest true "Datos del usuario"
// @Success 201 {object} models.User
// @Failure 400 {object} map[string]string
// @Failure 409 {object} map[string]string
// @Router /users/register [post]
func (h *UserHandler) RegisterUser(c *gin.Context) {
	var req models.UserRegistrationRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validación fallida", "details": err.Error()})
		return
	}

	user, err := h.UserService.RegisterUser(req)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{"error": err.Error()})
		return
	}

	// No devolver el hash de la contraseña
	user.PasswordHash = ""
	
	c.JSON(http.StatusCreated, gin.H{
		"message": "Usuario registrado exitosamente",
		"user":    user,
	})
}

// LoginUser godoc
// @Summary Iniciar sesión
// @Description Autentica un usuario y devuelve un token JWT
// @Tags usuarios
// @Accept json
// @Produce json
// @Param credentials body models.UserLoginRequest true "Credenciales de acceso"
// @Success 200 {object} models.LoginResponse
// @Failure 400 {object} map[string]string
// @Failure 401 {object} map[string]string
// @Router /users/login [post]
func (h *UserHandler) LoginUser(c *gin.Context) {
	var req models.UserLoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Datos inválidos", "details": err.Error()})
		return
	}

	if err := h.Validator.Struct(req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Validación fallida", "details": err.Error()})
		return
	}

	loginResponse, err := h.UserService.LoginUser(req)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": err.Error()})
		return
	}

	// No devolver el hash de la contraseña
	loginResponse.User.PasswordHash = ""

	c.JSON(http.StatusOK, loginResponse)
}

// GetProfile godoc
// @Summary Obtener perfil del usuario
// @Description Obtiene el perfil del usuario autenticado
// @Tags usuarios
// @Produce json
// @Security BearerAuth
// @Success 200 {object} models.User
// @Failure 401 {object} map[string]string
// @Failure 404 {object} map[string]string
// @Router /users/profile [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	userID, exists := c.Get("user_id")
	if !exists {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Usuario no autenticado"})
		return
	}

	user, err := h.UserService.GetUserByID(userID.(uuid.UUID))
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Usuario no encontrado"})
		return
	}

	// No devolver el hash de la contraseña
	user.PasswordHash = ""
	
	c.JSON(http.StatusOK, user)
}
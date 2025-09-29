package middleware

import (
	"net/http"
	"strings"
	"tradeoptix-back/internal/models"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
)

func JWTAuth(jwtSecret string) gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token de autorización requerido"})
			c.Abort()
			return
		}

		// Remover el prefijo "Bearer "
		if strings.HasPrefix(tokenString, "Bearer ") {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return []byte(jwtSecret), nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Token inválido"})
			c.Abort()
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Claims inválidos"})
			c.Abort()
			return
		}

		userID, err := uuid.Parse(claims["user_id"].(string))
		if err != nil {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "ID de usuario inválido"})
			c.Abort()
			return
		}

		c.Set("user_id", userID)
		c.Set("user_email", claims["email"].(string))
		c.Set("user_role", claims["role"].(string))
		c.Next()
	}
}

func AdminAuth() gin.HandlerFunc {
	return func(c *gin.Context) {
		role, exists := c.Get("user_role")
		if !exists {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Rol de usuario no encontrado"})
			c.Abort()
			return
		}

		if role != string(models.UserRoleAdmin) {
			c.JSON(http.StatusForbidden, gin.H{"error": "Acceso denegado. Requiere permisos de administrador"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func CORS() gin.HandlerFunc {
	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")

		// Lista de orígenes permitidos
		allowedOrigins := []string{
			"http://localhost:3000",
			"http://localhost:3004",
			"http://localhost:8082",
			"https://admin.tradeoptix.app",
			"https://app.tradeoptix.app",
			"https://tradeoptix.app",
		}

		// Verificar si el origen está permitido
		allowed := false
		for _, allowedOrigin := range allowedOrigins {
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		// En desarrollo, permitir localhost dinámicamente
		if strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "https://localhost:") {
			allowed = true
		}

		// Si está permitido, establecer el header CORS específico
		if allowed {
			c.Header("Access-Control-Allow-Origin", origin)
		} else {
			// Para orígenes no reconocidos, usar * (menos seguro pero funcional)
			c.Header("Access-Control-Allow-Origin", "*")
		}

		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE, PATCH")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

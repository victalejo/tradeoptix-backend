package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/gin-gonic/gin"
)

// CORSConfig configuración para CORS
type CORSConfig struct {
	AllowOrigins     []string
	AllowMethods     []string
	AllowHeaders     []string
	AllowCredentials bool
}

// DefaultCORSConfig configuración por defecto de CORS
func DefaultCORSConfig() *CORSConfig {
	// Obtener orígenes permitidos desde variable de entorno
	allowedOrigins := os.Getenv("ALLOWED_ORIGINS")
	if allowedOrigins == "" {
		// Configuración por defecto
		allowedOrigins = "http://localhost:3000,http://localhost:3004,http://localhost:8082,https://admin.tradeoptix.app,https://app.tradeoptix.app,https://tradeoptix.app"
	}

	// Limpiar espacios en blanco y filtrar orígenes vacíos
	var origins []string
	for _, origin := range strings.Split(allowedOrigins, ",") {
		trimmed := strings.TrimSpace(origin)
		if trimmed != "" {
			origins = append(origins, trimmed)
		}
	}

	return &CORSConfig{
		AllowOrigins: origins,
		AllowMethods: []string{
			"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS",
		},
		AllowHeaders: []string{
			"Content-Type", "Content-Length", "Accept-Encoding",
			"X-CSRF-Token", "Authorization", "accept", "origin",
			"Cache-Control", "X-Requested-With",
		},
		AllowCredentials: true,
	}
}

// NewCORS crea un middleware CORS con configuración personalizada
func NewCORS(config *CORSConfig) gin.HandlerFunc {
	if config == nil {
		config = DefaultCORSConfig()
	}

	return func(c *gin.Context) {
		origin := c.Request.Header.Get("Origin")
		method := c.Request.Method

		// Logging de debugging mejorado
		if origin != "" {
			println("CORS Request: Method =", method, ", Origin =", origin)
			println("CORS Allowed Origins:", strings.Join(config.AllowOrigins, ", "))
		}

		// Verificar si el origen está permitido
		allowed := false
		for _, allowedOrigin := range config.AllowOrigins {
			allowedOrigin = strings.TrimSpace(allowedOrigin)
			if origin == allowedOrigin {
				allowed = true
				break
			}
		}

		// En desarrollo, permitir localhost dinámicamente
		if !allowed && (strings.HasPrefix(origin, "http://localhost:") || strings.HasPrefix(origin, "https://localhost:")) {
			allowed = true
			println("CORS: Permitiendo localhost dinámicamente:", origin)
		}

		// Logging para debugging
		if origin != "" {
			if allowed {
				println("CORS: ✅ Origen permitido:", origin)
			} else {
				println("CORS: ❌ Origen NO permitido:", origin)
				println("CORS: Orígenes válidos:", strings.Join(config.AllowOrigins, ", "))
			}
		}

		// Función helper para establecer headers CORS
		setCORSHeaders := func() {
			if allowed && origin != "" {
				c.Header("Access-Control-Allow-Origin", origin)
			} else if len(config.AllowOrigins) > 0 && config.AllowOrigins[0] == "*" {
				c.Header("Access-Control-Allow-Origin", "*")
			}

			if config.AllowCredentials {
				c.Header("Access-Control-Allow-Credentials", "true")
			}

			c.Header("Access-Control-Allow-Methods", strings.Join(config.AllowMethods, ", "))
			c.Header("Access-Control-Allow-Headers", strings.Join(config.AllowHeaders, ", "))
			c.Header("Vary", "Origin")
		}

		// Establecer headers CORS inicialmente
		setCORSHeaders()

		// Manejar preflight requests (OPTIONS)
		if c.Request.Method == "OPTIONS" {
			c.Header("Access-Control-Max-Age", "86400") // 24 horas
			println("CORS: Respondiendo OPTIONS con código 204")
			c.AbortWithStatus(http.StatusNoContent)
			return
		}

		// Procesar la petición
		c.Next()

		// Re-establecer headers CORS después del procesamiento (importante para redirects)
		setCORSHeaders()
	}
}

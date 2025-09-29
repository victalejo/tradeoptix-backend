package services

import (
	"database/sql"
	"fmt"
	"time"

	"tradeoptix-back/internal/models"

	"github.com/google/uuid"
)

type NewsService struct {
	DB *sql.DB
}

func NewNewsService(db *sql.DB) *NewsService {
	return &NewsService{DB: db}
}

// CreateNews crea una nueva noticia
func (s *NewsService) CreateNews(req models.CreateNewsRequest, adminID uuid.UUID) (*models.MarketNews, error) {
	query := `
		INSERT INTO market_news (title, content, summary, image_url, category, priority, created_by)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id, title, content, summary, image_url, category, priority, is_active, 
		         published_at, created_by, created_at, updated_at
	`

	var news models.MarketNews
	err := s.DB.QueryRow(
		query, req.Title, req.Content, req.Summary, req.ImageURL, 
		req.Category, req.Priority, adminID,
	).Scan(
		&news.ID, &news.Title, &news.Content, &news.Summary, &news.ImageURL,
		&news.Category, &news.Priority, &news.IsActive, &news.PublishedAt,
		&news.CreatedBy, &news.CreatedAt, &news.UpdatedAt,
	)

	if err != nil {
		return nil, fmt.Errorf("error creando noticia: %v", err)
	}

	return &news, nil
}

// GetNews obtiene todas las noticias con paginación
func (s *NewsService) GetNews(page, limit int, category string, activeOnly bool) ([]models.MarketNews, int, error) {
	offset := (page - 1) * limit
	
	whereClause := "WHERE 1=1"
	args := []interface{}{}
	argIndex := 1

	if category != "" {
		whereClause += fmt.Sprintf(" AND category = $%d", argIndex)
		args = append(args, category)
		argIndex++
	}

	if activeOnly {
		whereClause += fmt.Sprintf(" AND is_active = $%d", argIndex)
		args = append(args, true)
		argIndex++
	}

	// Contar total
	countQuery := fmt.Sprintf("SELECT COUNT(*) FROM market_news %s", whereClause)
	var total int
	err := s.DB.QueryRow(countQuery, args...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("error contando noticias: %v", err)
	}

	// Obtener noticias
	query := fmt.Sprintf(`
		SELECT id, title, content, summary, image_url, category, priority, is_active,
		       published_at, created_by, created_at, updated_at
		FROM market_news 
		%s 
		ORDER BY priority DESC, published_at DESC 
		LIMIT $%d OFFSET $%d
	`, whereClause, argIndex, argIndex+1)

	args = append(args, limit, offset)

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("error obteniendo noticias: %v", err)
	}
	defer rows.Close()

	var newsList []models.MarketNews
	for rows.Next() {
		var news models.MarketNews
		err := rows.Scan(
			&news.ID, &news.Title, &news.Content, &news.Summary, &news.ImageURL,
			&news.Category, &news.Priority, &news.IsActive, &news.PublishedAt,
			&news.CreatedBy, &news.CreatedAt, &news.UpdatedAt,
		)
		if err != nil {
			return nil, 0, fmt.Errorf("error escaneando noticia: %v", err)
		}
		newsList = append(newsList, news)
	}

	return newsList, total, nil
}

// GetNewsByID obtiene una noticia por ID
func (s *NewsService) GetNewsByID(id uuid.UUID) (*models.MarketNews, error) {
	query := `
		SELECT id, title, content, summary, image_url, category, priority, is_active,
		       published_at, created_by, created_at, updated_at
		FROM market_news 
		WHERE id = $1
	`

	var news models.MarketNews
	err := s.DB.QueryRow(query, id).Scan(
		&news.ID, &news.Title, &news.Content, &news.Summary, &news.ImageURL,
		&news.Category, &news.Priority, &news.IsActive, &news.PublishedAt,
		&news.CreatedBy, &news.CreatedAt, &news.UpdatedAt,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, fmt.Errorf("noticia no encontrada")
		}
		return nil, fmt.Errorf("error obteniendo noticia: %v", err)
	}

	return &news, nil
}

// UpdateNews actualiza una noticia
func (s *NewsService) UpdateNews(id uuid.UUID, req models.UpdateNewsRequest) error {
	setParts := []string{}
	args := []interface{}{}
	argIndex := 1

	if req.Title != nil {
		setParts = append(setParts, fmt.Sprintf("title = $%d", argIndex))
		args = append(args, *req.Title)
		argIndex++
	}

	if req.Content != nil {
		setParts = append(setParts, fmt.Sprintf("content = $%d", argIndex))
		args = append(args, *req.Content)
		argIndex++
	}

	if req.Summary != nil {
		setParts = append(setParts, fmt.Sprintf("summary = $%d", argIndex))
		args = append(args, *req.Summary)
		argIndex++
	}

	if req.ImageURL != nil {
		setParts = append(setParts, fmt.Sprintf("image_url = $%d", argIndex))
		args = append(args, *req.ImageURL)
		argIndex++
	}

	if req.Category != nil {
		setParts = append(setParts, fmt.Sprintf("category = $%d", argIndex))
		args = append(args, *req.Category)
		argIndex++
	}

	if req.Priority != nil {
		setParts = append(setParts, fmt.Sprintf("priority = $%d", argIndex))
		args = append(args, *req.Priority)
		argIndex++
	}

	if req.IsActive != nil {
		setParts = append(setParts, fmt.Sprintf("is_active = $%d", argIndex))
		args = append(args, *req.IsActive)
		argIndex++
	}

	if len(setParts) == 0 {
		return fmt.Errorf("no hay campos para actualizar")
	}

	setParts = append(setParts, fmt.Sprintf("updated_at = $%d", argIndex))
	args = append(args, time.Now())
	argIndex++

	args = append(args, id)

	query := fmt.Sprintf(`
		UPDATE market_news 
		SET %s 
		WHERE id = $%d
	`, fmt.Sprintf("%v", setParts)[1:len(fmt.Sprintf("%v", setParts))-1], argIndex)

	result, err := s.DB.Exec(query, args...)
	if err != nil {
		return fmt.Errorf("error actualizando noticia: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("noticia no encontrada")
	}

	return nil
}

// DeleteNews elimina una noticia
func (s *NewsService) DeleteNews(id uuid.UUID) error {
	query := "DELETE FROM market_news WHERE id = $1"
	result, err := s.DB.Exec(query, id)
	if err != nil {
		return fmt.Errorf("error eliminando noticia: %v", err)
	}

	rowsAffected, _ := result.RowsAffected()
	if rowsAffected == 0 {
		return fmt.Errorf("noticia no encontrada")
	}

	return nil
}

// GetLatestNews obtiene las últimas noticias activas
func (s *NewsService) GetLatestNews(limit int) ([]models.MarketNews, error) {
	query := `
		SELECT id, title, content, summary, image_url, category, priority, is_active,
		       published_at, created_by, created_at, updated_at
		FROM market_news 
		WHERE is_active = true 
		ORDER BY priority DESC, published_at DESC 
		LIMIT $1
	`

	rows, err := s.DB.Query(query, limit)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo últimas noticias: %v", err)
	}
	defer rows.Close()

	var newsList []models.MarketNews
	for rows.Next() {
		var news models.MarketNews
		err := rows.Scan(
			&news.ID, &news.Title, &news.Content, &news.Summary, &news.ImageURL,
			&news.Category, &news.Priority, &news.IsActive, &news.PublishedAt,
			&news.CreatedBy, &news.CreatedAt, &news.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("error escaneando noticia: %v", err)
		}
		newsList = append(newsList, news)
	}

	return newsList, nil
}

// GetNewsStats obtiene estadísticas de noticias
func (s *NewsService) GetNewsStats() (*models.NewsStats, error) {
	stats := &models.NewsStats{
		NewsByCategory: make(map[string]int),
	}

	// Total de noticias
	err := s.DB.QueryRow("SELECT COUNT(*) FROM market_news").Scan(&stats.TotalNews)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo total de noticias: %v", err)
	}

	// Noticias activas
	err = s.DB.QueryRow("SELECT COUNT(*) FROM market_news WHERE is_active = true").Scan(&stats.ActiveNews)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo noticias activas: %v", err)
	}

	// Noticias de hoy
	err = s.DB.QueryRow(`
		SELECT COUNT(*) FROM market_news 
		WHERE DATE(published_at) = CURRENT_DATE
	`).Scan(&stats.TodayNews)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo noticias de hoy: %v", err)
	}

	// Noticias por categoría
	rows, err := s.DB.Query(`
		SELECT category, COUNT(*) 
		FROM market_news 
		WHERE is_active = true 
		GROUP BY category
	`)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo noticias por categoría: %v", err)
	}
	defer rows.Close()

	for rows.Next() {
		var category string
		var count int
		if err := rows.Scan(&category, &count); err != nil {
			return nil, fmt.Errorf("error escaneando categoría: %v", err)
		}
		stats.NewsByCategory[category] = count
	}

	return stats, nil
}
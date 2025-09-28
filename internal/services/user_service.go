package services

import (
	"database/sql"
	"errors"
	"time"
	"tradeoptix-back/internal/models"

	"github.com/golang-jwt/jwt/v5"
	"github.com/google/uuid"
	"golang.org/x/crypto/bcrypt"
)

type UserService struct {
	DB        *sql.DB
	JWTSecret string
}

func NewUserService(db *sql.DB, jwtSecret string) *UserService {
	return &UserService{
		DB:        db,
		JWTSecret: jwtSecret,
	}
}

func (s *UserService) RegisterUser(req models.UserRegistrationRequest) (*models.User, error) {
	// Verificar si el email ya existe
	var exists bool
	err := s.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE email = $1)", req.Email).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("el email ya está registrado")
	}

	// Verificar si el documento ya existe
	err = s.DB.QueryRow("SELECT EXISTS(SELECT 1 FROM users WHERE document_number = $1)", req.DocumentNumber).Scan(&exists)
	if err != nil {
		return nil, err
	}
	if exists {
		return nil, errors.New("el documento ya está registrado")
	}

	// Hash de la contraseña
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		return nil, err
	}

	// Crear usuario
	user := &models.User{
		ID:               uuid.New(),
		FirstName:        req.FirstName,
		LastName:         req.LastName,
		DocumentType:     models.DocumentType(req.DocumentType),
		DocumentNumber:   req.DocumentNumber,
		Email:            req.Email,
		PhoneNumber:      req.PhoneNumber,
		Address:          req.Address,
		FacebookProfile:  req.FacebookProfile,
		InstagramProfile: req.InstagramProfile,
		TwitterProfile:   req.TwitterProfile,
		LinkedinProfile:  req.LinkedinProfile,
		PasswordHash:     string(hashedPassword),
		Role:             models.UserRoleUser,
		KYCStatus:        models.KYCStatusPending,
		EmailVerified:    false,
		CreatedAt:        time.Now(),
		UpdatedAt:        time.Now(),
	}

	// Insertar en base de datos
	query := `
		INSERT INTO users (
			id, first_name, last_name, document_type, document_number,
			email, phone_number, address, facebook_profile, instagram_profile,
			twitter_profile, linkedin_profile, password_hash, role, kyc_status,
			email_verified, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18
		)`

	_, err = s.DB.Exec(query,
		user.ID, user.FirstName, user.LastName, user.DocumentType, user.DocumentNumber,
		user.Email, user.PhoneNumber, user.Address, user.FacebookProfile, user.InstagramProfile,
		user.TwitterProfile, user.LinkedinProfile, user.PasswordHash, user.Role, user.KYCStatus,
		user.EmailVerified, user.CreatedAt, user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return user, nil
}

func (s *UserService) LoginUser(req models.UserLoginRequest) (*models.LoginResponse, error) {
	var user models.User
	query := `
		SELECT id, first_name, last_name, document_type, document_number,
		       email, phone_number, address, facebook_profile, instagram_profile,
		       twitter_profile, linkedin_profile, password_hash, role, kyc_status,
		       email_verified, created_at, updated_at
		FROM users WHERE email = $1
	`

	err := s.DB.QueryRow(query, req.Email).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.DocumentType, &user.DocumentNumber,
		&user.Email, &user.PhoneNumber, &user.Address, &user.FacebookProfile, &user.InstagramProfile,
		&user.TwitterProfile, &user.LinkedinProfile, &user.PasswordHash, &user.Role, &user.KYCStatus,
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, errors.New("credenciales inválidas")
		}
		return nil, err
	}

	// Verificar contraseña
	err = bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(req.Password))
	if err != nil {
		return nil, errors.New("credenciales inválidas")
	}

	// Generar JWT token
	token, expiresAt, err := s.GenerateJWT(user.ID, user.Email, user.Role)
	if err != nil {
		return nil, err
	}

	return &models.LoginResponse{
		Token:     token,
		User:      user,
		ExpiresAt: expiresAt,
	}, nil
}

func (s *UserService) GenerateJWT(userID uuid.UUID, email string, role models.UserRole) (string, time.Time, error) {
	expiresAt := time.Now().Add(24 * time.Hour)

	claims := jwt.MapClaims{
		"user_id": userID.String(),
		"email":   email,
		"role":    string(role),
		"exp":     expiresAt.Unix(),
	}

	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString([]byte(s.JWTSecret))
	if err != nil {
		return "", time.Time{}, err
	}

	return tokenString, expiresAt, nil
}

func (s *UserService) GetUserByID(userID uuid.UUID) (*models.User, error) {
	var user models.User
	query := `
		SELECT id, first_name, last_name, document_type, document_number,
		       email, phone_number, address, facebook_profile, instagram_profile,
		       twitter_profile, linkedin_profile, role, kyc_status,
		       email_verified, created_at, updated_at
		FROM users WHERE id = $1
	`

	err := s.DB.QueryRow(query, userID).Scan(
		&user.ID, &user.FirstName, &user.LastName, &user.DocumentType, &user.DocumentNumber,
		&user.Email, &user.PhoneNumber, &user.Address, &user.FacebookProfile, &user.InstagramProfile,
		&user.TwitterProfile, &user.LinkedinProfile, &user.Role, &user.KYCStatus,
		&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

func (s *UserService) GetAllUsers() ([]models.User, error) {
	var users []models.User
	query := `
		SELECT id, first_name, last_name, document_type, document_number,
		       email, phone_number, address, facebook_profile, instagram_profile,
		       twitter_profile, linkedin_profile, role, kyc_status,
		       email_verified, created_at, updated_at
		FROM users 
		ORDER BY created_at DESC
	`

	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.DocumentType, &user.DocumentNumber,
			&user.Email, &user.PhoneNumber, &user.Address, &user.FacebookProfile, &user.InstagramProfile,
			&user.TwitterProfile, &user.LinkedinProfile, &user.Role, &user.KYCStatus,
			&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

func (s *UserService) GetDashboardStats() (map[string]interface{}, error) {
	stats := make(map[string]interface{})

	// Total de usuarios
	var totalUsers int
	err := s.DB.QueryRow("SELECT COUNT(*) FROM users").Scan(&totalUsers)
	if err != nil {
		return nil, err
	}
	stats["total_users"] = totalUsers

	// Usuarios por estado KYC
	var pendingKYC, approvedKYC, rejectedKYC int
	err = s.DB.QueryRow("SELECT COUNT(*) FROM users WHERE kyc_status = 'pending'").Scan(&pendingKYC)
	if err != nil {
		return nil, err
	}
	stats["pending_kyc"] = pendingKYC

	err = s.DB.QueryRow("SELECT COUNT(*) FROM users WHERE kyc_status = 'approved'").Scan(&approvedKYC)
	if err != nil {
		return nil, err
	}
	stats["approved_kyc"] = approvedKYC

	err = s.DB.QueryRow("SELECT COUNT(*) FROM users WHERE kyc_status = 'rejected'").Scan(&rejectedKYC)
	if err != nil {
		return nil, err
	}
	stats["rejected_kyc"] = rejectedKYC

	// Nuevos usuarios hoy
	var newUsersToday int
	err = s.DB.QueryRow("SELECT COUNT(*) FROM users WHERE DATE(created_at) = CURRENT_DATE").Scan(&newUsersToday)
	if err != nil {
		return nil, err
	}
	stats["new_users_today"] = newUsersToday

	// Nuevos usuarios esta semana
	var newUsersWeek int
	err = s.DB.QueryRow("SELECT COUNT(*) FROM users WHERE created_at >= DATE_TRUNC('week', CURRENT_DATE)").Scan(&newUsersWeek)
	if err != nil {
		return nil, err
	}
	stats["new_users_this_week"] = newUsersWeek

	// Nuevos usuarios este mes
	var newUsersMonth int
	err = s.DB.QueryRow("SELECT COUNT(*) FROM users WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)").Scan(&newUsersMonth)
	if err != nil {
		return nil, err
	}
	stats["new_users_this_month"] = newUsersMonth

	return stats, nil
}

func (s *UserService) GetUsersByKYCStatus(status string) ([]models.User, error) {
	var users []models.User
	query := `
		SELECT id, first_name, last_name, document_type, document_number,
		       email, phone_number, address, facebook_profile, instagram_profile,
		       twitter_profile, linkedin_profile, role, kyc_status,
		       email_verified, created_at, updated_at
		FROM users 
	`

	args := []interface{}{}
	if status != "" {
		query += " WHERE kyc_status = $1"
		args = append(args, status)
	}

	query += " ORDER BY created_at DESC"

	rows, err := s.DB.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var user models.User
		err := rows.Scan(
			&user.ID, &user.FirstName, &user.LastName, &user.DocumentType, &user.DocumentNumber,
			&user.Email, &user.PhoneNumber, &user.Address, &user.FacebookProfile, &user.InstagramProfile,
			&user.TwitterProfile, &user.LinkedinProfile, &user.Role, &user.KYCStatus,
			&user.EmailVerified, &user.CreatedAt, &user.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}

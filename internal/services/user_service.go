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
package models

import (
	"time"

	"github.com/google/uuid"
)

type DocumentType string

const (
	DocumentTypeCedula    DocumentType = "cedula"
	DocumentTypePasaporte DocumentType = "pasaporte"
)

type KYCStatus string

const (
	KYCStatusPending  KYCStatus = "pending"
	KYCStatusApproved KYCStatus = "approved"
	KYCStatusRejected KYCStatus = "rejected"
)

type UserRole string

const (
	UserRoleUser  UserRole = "user"
	UserRoleAdmin UserRole = "admin"
)

type User struct {
	ID               uuid.UUID    `json:"id" db:"id"`
	FirstName        string       `json:"first_name" db:"first_name" validate:"required,min=2,max=50"`
	LastName         string       `json:"last_name" db:"last_name" validate:"required,min=2,max=50"`
	DocumentType     DocumentType `json:"document_type" db:"document_type" validate:"required,oneof=cedula pasaporte"`
	DocumentNumber   string       `json:"document_number" db:"document_number" validate:"required,min=5,max=20"`
	Email            string       `json:"email" db:"email" validate:"required,email"`
	PhoneNumber      string       `json:"phone_number" db:"phone_number" validate:"required,min=10,max=20"`
	Address          string       `json:"address" db:"address" validate:"required,min=10,max=200"`
	FacebookProfile  *string      `json:"facebook_profile,omitempty" db:"facebook_profile"`
	InstagramProfile *string      `json:"instagram_profile,omitempty" db:"instagram_profile"`
	TwitterProfile   *string      `json:"twitter_profile,omitempty" db:"twitter_profile"`
	LinkedinProfile  *string      `json:"linkedin_profile,omitempty" db:"linkedin_profile"`
	PasswordHash     string       `json:"-" db:"password_hash"`
	Role             UserRole     `json:"role" db:"role"`
	KYCStatus        KYCStatus    `json:"kyc_status" db:"kyc_status"`
	EmailVerified    bool         `json:"email_verified" db:"email_verified"`
	CreatedAt        time.Time    `json:"created_at" db:"created_at"`
	UpdatedAt        time.Time    `json:"updated_at" db:"updated_at"`
}

type KYCDocument struct {
	ID              uuid.UUID `json:"id" db:"id"`
	UserID          uuid.UUID `json:"user_id" db:"user_id"`
	DocumentType    string    `json:"document_type" db:"document_type"` // "cedula_front", "cedula_back", "face_photo"
	FilePath        string    `json:"file_path" db:"file_path"`
	OriginalName    string    `json:"original_name" db:"original_name"`
	FileSize        int64     `json:"file_size" db:"file_size"`
	MimeType        string    `json:"mime_type" db:"mime_type"`
	Status          KYCStatus `json:"status" db:"status"`
	RejectionReason *string   `json:"rejection_reason,omitempty" db:"rejection_reason"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time `json:"updated_at" db:"updated_at"`
}

type UserRegistrationRequest struct {
	FirstName        string  `json:"first_name" validate:"required,min=2,max=50"`
	LastName         string  `json:"last_name" validate:"required,min=2,max=50"`
	DocumentType     string  `json:"document_type" validate:"required,oneof=cedula pasaporte"`
	DocumentNumber   string  `json:"document_number" validate:"required,min=5,max=20"`
	Email            string  `json:"email" validate:"required,email"`
	PhoneNumber      string  `json:"phone_number" validate:"required,min=10,max=20"`
	Address          string  `json:"address" validate:"required,min=10,max=200"`
	Password         string  `json:"password" validate:"required,min=8"`
	FacebookProfile  *string `json:"facebook_profile,omitempty"`
	InstagramProfile *string `json:"instagram_profile,omitempty"`
	TwitterProfile   *string `json:"twitter_profile,omitempty"`
	LinkedinProfile  *string `json:"linkedin_profile,omitempty"`
}

type UserLoginRequest struct {
	Email    string `json:"email" validate:"required,email"`
	Password string `json:"password" validate:"required"`
}

type LoginResponse struct {
	Token     string    `json:"token"`
	User      User      `json:"user"`
	ExpiresAt time.Time `json:"expires_at"`
}

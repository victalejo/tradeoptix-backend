package services

import (
	"database/sql"
	"fmt"
	"io"
	"mime/multipart"
	"os"
	"path/filepath"
	"strings"
	"time"
	"tradeoptix-back/internal/models"

	"github.com/google/uuid"
)

type KYCService struct {
	DB        *sql.DB
	UploadDir string
}

func NewKYCService(db *sql.DB, uploadDir string) *KYCService {
	return &KYCService{
		DB:        db,
		UploadDir: uploadDir,
	}
}

func (s *KYCService) UploadDocument(userID uuid.UUID, documentType string, file *multipart.FileHeader) (*models.KYCDocument, error) {
	// Validar tipo de documento
	validTypes := []string{"cedula_front", "cedula_back", "face_photo"}
	if !contains(validTypes, documentType) {
		return nil, fmt.Errorf("tipo de documento inválido: %s", documentType)
	}

	// Validar tipo de archivo
	if !isValidImageType(file.Header.Get("Content-Type")) {
		return nil, fmt.Errorf("tipo de archivo no permitido. Solo se permiten imágenes JPG, PNG")
	}

	// Validar tamaño de archivo (max 5MB)
	if file.Size > 5*1024*1024 {
		return nil, fmt.Errorf("archivo demasiado grande. Máximo 5MB")
	}

	// Generar nombre único para el archivo
	ext := filepath.Ext(file.Filename)
	filename := fmt.Sprintf("%s_%s_%d%s", userID.String(), documentType, time.Now().Unix(), ext)

	// Crear directorio del usuario si no existe
	userDir := filepath.Join(s.UploadDir, userID.String())
	if err := os.MkdirAll(userDir, 0755); err != nil {
		return nil, fmt.Errorf("error creando directorio: %v", err)
	}

	filePath := filepath.Join(userDir, filename)

	// Abrir archivo cargado
	src, err := file.Open()
	if err != nil {
		return nil, fmt.Errorf("error abriendo archivo: %v", err)
	}
	defer src.Close()

	// Crear archivo destino
	dst, err := os.Create(filePath)
	if err != nil {
		return nil, fmt.Errorf("error creando archivo: %v", err)
	}
	defer dst.Close()

	// Copiar contenido
	if _, err = io.Copy(dst, src); err != nil {
		return nil, fmt.Errorf("error guardando archivo: %v", err)
	}

	// Crear registro en base de datos
	doc := &models.KYCDocument{
		ID:           uuid.New(),
		UserID:       userID,
		DocumentType: documentType,
		FilePath:     filePath,
		OriginalName: file.Filename,
		FileSize:     file.Size,
		MimeType:     file.Header.Get("Content-Type"),
		Status:       models.KYCStatusPending,
		CreatedAt:    time.Now(),
		UpdatedAt:    time.Now(),
	}

	query := `
		INSERT INTO kyc_documents (
			id, user_id, document_type, file_path, original_name,
			file_size, mime_type, status, created_at, updated_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
	`

	_, err = s.DB.Exec(query,
		doc.ID, doc.UserID, doc.DocumentType, doc.FilePath, doc.OriginalName,
		doc.FileSize, doc.MimeType, doc.Status, doc.CreatedAt, doc.UpdatedAt,
	)
	if err != nil {
		// Eliminar archivo si falla la inserción en DB
		os.Remove(filePath)
		return nil, fmt.Errorf("error guardando en base de datos: %v", err)
	}

	return doc, nil
}

func (s *KYCService) GetUserDocuments(userID uuid.UUID) ([]models.KYCDocument, error) {
	query := `
		SELECT id, user_id, document_type, file_path, original_name,
		       file_size, mime_type, status, rejection_reason, created_at, updated_at
		FROM kyc_documents WHERE user_id = $1 ORDER BY created_at DESC
	`

	rows, err := s.DB.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []models.KYCDocument
	for rows.Next() {
		var doc models.KYCDocument
		err := rows.Scan(
			&doc.ID, &doc.UserID, &doc.DocumentType, &doc.FilePath, &doc.OriginalName,
			&doc.FileSize, &doc.MimeType, &doc.Status, &doc.RejectionReason, &doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}
		documents = append(documents, doc)
	}

	return documents, nil
}

func (s *KYCService) ApproveDocument(docID uuid.UUID, adminID uuid.UUID) error {
	query := `
		UPDATE kyc_documents 
		SET status = $1, updated_at = $2, rejection_reason = NULL
		WHERE id = $3
	`

	_, err := s.DB.Exec(query, models.KYCStatusApproved, time.Now(), docID)
	if err != nil {
		return err
	}

	// Verificar si todos los documentos del usuario están aprobados
	return s.updateUserKYCStatus(docID)
}

func (s *KYCService) RejectDocument(docID uuid.UUID, reason string, adminID uuid.UUID) error {
	query := `
		UPDATE kyc_documents 
		SET status = $1, rejection_reason = $2, updated_at = $3
		WHERE id = $4
	`

	_, err := s.DB.Exec(query, models.KYCStatusRejected, reason, time.Now(), docID)
	if err != nil {
		return err
	}

	// Actualizar estado KYC del usuario
	return s.updateUserKYCStatus(docID)
}

func (s *KYCService) updateUserKYCStatus(docID uuid.UUID) error {
	// Obtener user_id del documento
	var userID uuid.UUID
	err := s.DB.QueryRow("SELECT user_id FROM kyc_documents WHERE id = $1", docID).Scan(&userID)
	if err != nil {
		return err
	}

	// Verificar el estado de todos los documentos del usuario
	query := `
		SELECT COUNT(*) as total,
		       COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved,
		       COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected
		FROM kyc_documents WHERE user_id = $1
	`

	var total, approved, rejected int
	err = s.DB.QueryRow(query, userID).Scan(&total, &approved, &rejected)
	if err != nil {
		return err
	}

	var kycStatus models.KYCStatus
	if rejected > 0 {
		kycStatus = models.KYCStatusRejected
	} else if total >= 3 && approved == total { // Requiere cédula frente, atrás y foto
		kycStatus = models.KYCStatusApproved
	} else {
		kycStatus = models.KYCStatusPending
	}

	// Actualizar estado KYC del usuario
	_, err = s.DB.Exec("UPDATE users SET kyc_status = $1, updated_at = $2 WHERE id = $3",
		kycStatus, time.Now(), userID)
	return err
}

func contains(slice []string, item string) bool {
	for _, s := range slice {
		if s == item {
			return true
		}
	}
	return false
}

func isValidImageType(contentType string) bool {
	validTypes := []string{"image/jpeg", "image/jpg", "image/png"}
	contentType = strings.ToLower(contentType)
	for _, validType := range validTypes {
		if contentType == validType {
			return true
		}
	}
	return false
}

func (s *KYCService) GetAllPendingDocuments() ([]models.KYCDocument, error) {
	query := `
		SELECT id, user_id, document_type, file_path, original_name, 
		       file_size, mime_type, status, rejection_reason, 
		       created_at, updated_at
		FROM kyc_documents 
		WHERE status = 'pending'
		ORDER BY created_at DESC
	`

	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var documents []models.KYCDocument
	for rows.Next() {
		var doc models.KYCDocument

		err := rows.Scan(
			&doc.ID, &doc.UserID, &doc.DocumentType, &doc.FilePath, &doc.OriginalName,
			&doc.FileSize, &doc.MimeType, &doc.Status, &doc.RejectionReason,
			&doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		documents = append(documents, doc)
	}

	return documents, nil
}

func (s *KYCService) GetDocumentByID(docID uuid.UUID) (*models.KYCDocument, error) {
	var doc models.KYCDocument

	query := `
		SELECT d.id, d.user_id, d.document_type, d.file_path, d.original_name,
		       d.file_size, d.mime_type, d.status, d.rejection_reason,
		       d.created_at, d.updated_at
		FROM kyc_documents d
		WHERE d.id = $1
	`

	err := s.DB.QueryRow(query, docID).Scan(
		&doc.ID, &doc.UserID, &doc.DocumentType, &doc.FilePath, &doc.OriginalName,
		&doc.FileSize, &doc.MimeType, &doc.Status, &doc.RejectionReason,
		&doc.CreatedAt, &doc.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}

	return &doc, nil
}

func (s *KYCService) GetPendingDocuments() ([]models.KYCDocument, error) {
	var documents []models.KYCDocument

	query := `
		SELECT d.id, d.user_id, d.document_type, d.file_path, d.original_name,
		       d.file_size, d.mime_type, d.status, d.rejection_reason,
		       d.created_at, d.updated_at
		FROM kyc_documents d
		WHERE d.status = 'pending'
		ORDER BY d.created_at ASC
	`

	rows, err := s.DB.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	for rows.Next() {
		var doc models.KYCDocument
		err := rows.Scan(
			&doc.ID, &doc.UserID, &doc.DocumentType, &doc.FilePath, &doc.OriginalName,
			&doc.FileSize, &doc.MimeType, &doc.Status, &doc.RejectionReason,
			&doc.CreatedAt, &doc.UpdatedAt,
		)
		if err != nil {
			return nil, err
		}

		documents = append(documents, doc)
	}

	return documents, nil
}

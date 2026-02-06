package models

import "time"

// VerificationStatus estado de verificación
type VerificationStatus string

const (
	VerificationNone     VerificationStatus = "none"
	VerificationPending  VerificationStatus = "pending"
	VerificationApproved VerificationStatus = "approved"
	VerificationRejected VerificationStatus = "rejected"
)

// UserVerification documentos de verificación KYC
type UserVerification struct {
	ID              int64              `json:"id" db:"id"`
	UserID          int64              `json:"user_id" db:"user_id"`
	DocumentType    string             `json:"document_type" db:"document_type"`
	DocumentFront   string             `json:"document_front" db:"document_front"`
	DocumentBack    string             `json:"document_back" db:"document_back"`
	SelfieWithDoc   string             `json:"selfie_with_doc" db:"selfie_with_doc"`
	Status          VerificationStatus `json:"status" db:"status"`
	RejectionReason string             `json:"rejection_reason,omitempty" db:"rejection_reason"`
	ReviewedBy      *int64             `json:"reviewed_by,omitempty" db:"reviewed_by"`
	ReviewedAt      *time.Time         `json:"reviewed_at,omitempty" db:"reviewed_at"`
	CreatedAt       time.Time          `json:"created_at" db:"created_at"`
	UpdatedAt       time.Time          `json:"updated_at" db:"updated_at"`
}

// KYCStatus estado general de verificación
type KYCStatus struct {
	ID                int64              `json:"id" db:"id"`
	UserID            int64              `json:"user_id" db:"user_id"`
	Status            VerificationStatus `json:"status" db:"status"`
	IdentityVerified  bool               `json:"identity_verified" db:"identity_verified"`
	AddressVerified   bool               `json:"address_verified" db:"address_verified"`
	SelfieVerified    bool               `json:"selfie_verified" db:"selfie_verified"`
	VerificationLevel int                `json:"verification_level" db:"verification_level"`
	UpdatedAt         time.Time          `json:"updated_at" db:"updated_at"`
}

// LoginHistory historial de inicios de sesión
type LoginHistory struct {
	ID            int64     `json:"id" db:"id"`
	UserID        int64     `json:"user_id" db:"user_id"`
	IPAddress     string    `json:"ip_address" db:"ip_address"`
	Device        string    `json:"device" db:"device"`
	Location      string    `json:"location" db:"location"`
	Status        string    `json:"status" db:"status"` // success, failed, blocked
	FailureReason string    `json:"failure_reason,omitempty" db:"failure_reason"`
	CreatedAt     time.Time `json:"created_at" db:"created_at"`
}

// UserSession sesiones activas del usuario
type UserSession struct {
	ID           int64     `json:"id" db:"id"`
	UserID       int64     `json:"user_id" db:"user_id"`
	Device       string    `json:"device" db:"device"`
	IPAddress    string    `json:"ip_address" db:"ip_address"`
	Location     string    `json:"location" db:"location"`
	Token        string    `json:"-" db:"token"`
	IsCurrent    bool      `json:"is_current" db:"is_current"`
	LastActiveAt time.Time `json:"last_active_at" db:"last_active_at"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
	ExpiresAt    time.Time `json:"expires_at" db:"expires_at"`
}

// SecurityEvent eventos de seguridad
type SecurityEvent struct {
	ID          int64                  `json:"id" db:"id"`
	UserID      int64                  `json:"user_id" db:"user_id"`
	EventType   string                 `json:"event_type" db:"event_type"`
	Description string                 `json:"description" db:"description"`
	IPAddress   string                 `json:"ip_address" db:"ip_address"`
	Metadata    map[string]interface{} `json:"metadata" db:"metadata"`
	CreatedAt   time.Time              `json:"created_at" db:"created_at"`
}

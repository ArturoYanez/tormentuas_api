package repositories

import "tormentus/internal/models"

// VerificationRepository interface para verificación KYC
type VerificationRepository interface {
	// KYC Documents
	CreateVerification(verification *models.UserVerification) error
	GetVerificationByUserID(userID int64) (*models.UserVerification, error)
	UpdateVerificationStatus(userID int64, status models.VerificationStatus, rejectionReason string) error
	GetPendingVerifications() ([]*models.UserVerification, error)
	
	// KYC Status
	GetKYCStatus(userID int64) (*models.KYCStatus, error)
	UpdateKYCStatus(userID int64, status *models.KYCStatus) error
	
	// Login History
	RecordLogin(userID int64, ipAddress, device, location string, success bool, failureReason string) error
	GetLoginHistory(userID int64, limit int) ([]*models.LoginHistory, error)
	
	// User Sessions
	CreateSession(session *models.UserSession) error
	GetActiveSessions(userID int64) ([]*models.UserSession, error)
	InvalidateSession(sessionID int64, userID int64) error
	InvalidateAllSessions(userID int64) error
	UpdateSessionActivity(sessionID int64) error
	
	// Security Events
	RecordSecurityEvent(userID int64, eventType, description, ipAddress string, metadata map[string]interface{}) error
	GetSecurityEvents(userID int64, limit int) ([]*models.SecurityEvent, error)
}

package repositories

import (
	"context"
	"encoding/json"
	"tormentus/internal/models"

	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresVerificationRepository struct {
	db *pgxpool.Pool
}

func NewPostgresVerificationRepository(db *pgxpool.Pool) *PostgresVerificationRepository {
	return &PostgresVerificationRepository{db: db}
}

// CreateVerification crea una nueva solicitud de verificación
func (r *PostgresVerificationRepository) CreateVerification(v *models.UserVerification) error {
	query := `
		INSERT INTO kyc_documents (user_id, document_type, document_front, document_back, selfie_with_doc, status, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
		RETURNING id, created_at`
	
	return r.db.QueryRow(context.Background(), query,
		v.UserID, v.DocumentType, v.DocumentFront, v.DocumentBack, v.SelfieWithDoc, models.VerificationPending,
	).Scan(&v.ID, &v.CreatedAt)
}

// GetVerificationByUserID obtiene la verificación de un usuario
func (r *PostgresVerificationRepository) GetVerificationByUserID(userID int64) (*models.UserVerification, error) {
	query := `
		SELECT id, user_id, document_type, document_front, document_back, selfie_with_doc, 
		       status, rejection_reason, reviewed_by, reviewed_at, created_at, updated_at
		FROM kyc_documents
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT 1`
	
	var v models.UserVerification
	err := r.db.QueryRow(context.Background(), query, userID).Scan(
		&v.ID, &v.UserID, &v.DocumentType, &v.DocumentFront, &v.DocumentBack, &v.SelfieWithDoc,
		&v.Status, &v.RejectionReason, &v.ReviewedBy, &v.ReviewedAt, &v.CreatedAt, &v.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &v, nil
}

// UpdateVerificationStatus actualiza el estado de verificación
func (r *PostgresVerificationRepository) UpdateVerificationStatus(userID int64, status models.VerificationStatus, rejectionReason string) error {
	query := `
		UPDATE kyc_documents 
		SET status = $2, rejection_reason = $3, reviewed_at = NOW(), updated_at = NOW()
		WHERE user_id = $1 AND status = 'pending'`
	
	_, err := r.db.Exec(context.Background(), query, userID, status, rejectionReason)
	if err != nil {
		return err
	}

	// Actualizar también kyc_status
	statusQuery := `
		INSERT INTO kyc_status (user_id, status, identity_verified, selfie_verified, verification_level, updated_at)
		VALUES ($1, $2, $3, $3, CASE WHEN $2 = 'approved' THEN 1 ELSE 0 END, NOW())
		ON CONFLICT (user_id) DO UPDATE SET 
			status = $2, 
			identity_verified = $3,
			selfie_verified = $3,
			verification_level = CASE WHEN $2 = 'approved' THEN 1 ELSE 0 END,
			updated_at = NOW()`
	
	isApproved := status == models.VerificationApproved
	_, err = r.db.Exec(context.Background(), statusQuery, userID, status, isApproved)
	
	// Actualizar is_verified en users
	if isApproved {
		_, _ = r.db.Exec(context.Background(), 
			`UPDATE users SET is_verified = true, verification_status = 'approved' WHERE id = $1`, userID)
	}
	
	return err
}

// GetPendingVerifications obtiene verificaciones pendientes
func (r *PostgresVerificationRepository) GetPendingVerifications() ([]*models.UserVerification, error) {
	query := `
		SELECT kd.id, kd.user_id, kd.document_type, kd.document_front, kd.document_back, 
		       kd.selfie_with_doc, kd.status, kd.rejection_reason, kd.reviewed_by, 
		       kd.reviewed_at, kd.created_at, kd.updated_at
		FROM kyc_documents kd
		WHERE kd.status = 'pending'
		ORDER BY kd.created_at ASC`
	
	rows, err := r.db.Query(context.Background(), query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var verifications []*models.UserVerification
	for rows.Next() {
		var v models.UserVerification
		if err := rows.Scan(
			&v.ID, &v.UserID, &v.DocumentType, &v.DocumentFront, &v.DocumentBack,
			&v.SelfieWithDoc, &v.Status, &v.RejectionReason, &v.ReviewedBy,
			&v.ReviewedAt, &v.CreatedAt, &v.UpdatedAt,
		); err != nil {
			continue
		}
		verifications = append(verifications, &v)
	}
	return verifications, nil
}

// GetKYCStatus obtiene el estado KYC de un usuario
func (r *PostgresVerificationRepository) GetKYCStatus(userID int64) (*models.KYCStatus, error) {
	query := `
		SELECT id, user_id, status, identity_verified, address_verified, selfie_verified, 
		       verification_level, updated_at
		FROM kyc_status
		WHERE user_id = $1`
	
	var s models.KYCStatus
	err := r.db.QueryRow(context.Background(), query, userID).Scan(
		&s.ID, &s.UserID, &s.Status, &s.IdentityVerified, &s.AddressVerified,
		&s.SelfieVerified, &s.VerificationLevel, &s.UpdatedAt,
	)
	if err != nil {
		// Retornar estado por defecto si no existe
		return &models.KYCStatus{
			UserID:            userID,
			Status:            models.VerificationNone,
			VerificationLevel: 0,
		}, nil
	}
	return &s, nil
}

// UpdateKYCStatus actualiza el estado KYC
func (r *PostgresVerificationRepository) UpdateKYCStatus(userID int64, status *models.KYCStatus) error {
	query := `
		INSERT INTO kyc_status (user_id, status, identity_verified, address_verified, selfie_verified, verification_level, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		ON CONFLICT (user_id) DO UPDATE SET 
			status = $2, identity_verified = $3, address_verified = $4, 
			selfie_verified = $5, verification_level = $6, updated_at = NOW()`
	
	_, err := r.db.Exec(context.Background(), query,
		userID, status.Status, status.IdentityVerified, status.AddressVerified,
		status.SelfieVerified, status.VerificationLevel,
	)
	return err
}

// RecordLogin registra un intento de login
func (r *PostgresVerificationRepository) RecordLogin(userID int64, ipAddress, device, location string, success bool, failureReason string) error {
	status := "success"
	if !success {
		status = "failed"
	}
	
	query := `
		INSERT INTO login_history (user_id, ip_address, device, location, status, failure_reason, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())`
	
	_, err := r.db.Exec(context.Background(), query, userID, ipAddress, device, location, status, failureReason)
	return err
}

// GetLoginHistory obtiene el historial de logins
func (r *PostgresVerificationRepository) GetLoginHistory(userID int64, limit int) ([]*models.LoginHistory, error) {
	query := `
		SELECT id, user_id, ip_address, device, location, status, failure_reason, created_at
		FROM login_history
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2`
	
	rows, err := r.db.Query(context.Background(), query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var history []*models.LoginHistory
	for rows.Next() {
		var h models.LoginHistory
		if err := rows.Scan(&h.ID, &h.UserID, &h.IPAddress, &h.Device, &h.Location, &h.Status, &h.FailureReason, &h.CreatedAt); err != nil {
			continue
		}
		history = append(history, &h)
	}
	return history, nil
}


// CreateSession crea una nueva sesión de usuario
func (r *PostgresVerificationRepository) CreateSession(session *models.UserSession) error {
	query := `
		INSERT INTO user_sessions (user_id, device, ip_address, location, token, is_current, last_active_at, created_at, expires_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW(), $7)
		RETURNING id`
	
	return r.db.QueryRow(context.Background(), query,
		session.UserID, session.Device, session.IPAddress, session.Location,
		session.Token, session.IsCurrent, session.ExpiresAt,
	).Scan(&session.ID)
}

// GetActiveSessions obtiene las sesiones activas de un usuario
func (r *PostgresVerificationRepository) GetActiveSessions(userID int64) ([]*models.UserSession, error) {
	query := `
		SELECT id, user_id, device, ip_address, location, is_current, last_active_at, created_at, expires_at
		FROM user_sessions
		WHERE user_id = $1 AND expires_at > NOW()
		ORDER BY last_active_at DESC`
	
	rows, err := r.db.Query(context.Background(), query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var sessions []*models.UserSession
	for rows.Next() {
		var s models.UserSession
		if err := rows.Scan(&s.ID, &s.UserID, &s.Device, &s.IPAddress, &s.Location, &s.IsCurrent, &s.LastActiveAt, &s.CreatedAt, &s.ExpiresAt); err != nil {
			continue
		}
		sessions = append(sessions, &s)
	}
	return sessions, nil
}

// InvalidateSession invalida una sesión específica
func (r *PostgresVerificationRepository) InvalidateSession(sessionID int64, userID int64) error {
	query := `DELETE FROM user_sessions WHERE id = $1 AND user_id = $2`
	_, err := r.db.Exec(context.Background(), query, sessionID, userID)
	return err
}

// InvalidateAllSessions invalida todas las sesiones de un usuario
func (r *PostgresVerificationRepository) InvalidateAllSessions(userID int64) error {
	query := `DELETE FROM user_sessions WHERE user_id = $1`
	_, err := r.db.Exec(context.Background(), query, userID)
	return err
}

// UpdateSessionActivity actualiza la última actividad de una sesión
func (r *PostgresVerificationRepository) UpdateSessionActivity(sessionID int64) error {
	query := `UPDATE user_sessions SET last_active_at = NOW() WHERE id = $1`
	_, err := r.db.Exec(context.Background(), query, sessionID)
	return err
}

// RecordSecurityEvent registra un evento de seguridad
func (r *PostgresVerificationRepository) RecordSecurityEvent(userID int64, eventType, description, ipAddress string, metadata map[string]interface{}) error {
	metadataJSON, _ := json.Marshal(metadata)
	
	query := `
		INSERT INTO security_events (user_id, event_type, description, ip_address, metadata, created_at)
		VALUES ($1, $2, $3, $4, $5, NOW())`
	
	_, err := r.db.Exec(context.Background(), query, userID, eventType, description, ipAddress, metadataJSON)
	return err
}

// GetSecurityEvents obtiene los eventos de seguridad de un usuario
func (r *PostgresVerificationRepository) GetSecurityEvents(userID int64, limit int) ([]*models.SecurityEvent, error) {
	query := `
		SELECT id, user_id, event_type, description, ip_address, metadata, created_at
		FROM security_events
		WHERE user_id = $1
		ORDER BY created_at DESC
		LIMIT $2`
	
	rows, err := r.db.Query(context.Background(), query, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var events []*models.SecurityEvent
	for rows.Next() {
		var e models.SecurityEvent
		var metadataJSON []byte
		if err := rows.Scan(&e.ID, &e.UserID, &e.EventType, &e.Description, &e.IPAddress, &metadataJSON, &e.CreatedAt); err != nil {
			continue
		}
		if len(metadataJSON) > 0 {
			json.Unmarshal(metadataJSON, &e.Metadata)
		}
		events = append(events, &e)
	}
	return events, nil
}

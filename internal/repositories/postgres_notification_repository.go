package repositories

import (
	"database/sql"
	"time"
	"tormentus/internal/models"
)

type PostgresNotificationRepository struct {
	db *sql.DB
}

func NewPostgresNotificationRepository(db *sql.DB) *PostgresNotificationRepository {
	return &PostgresNotificationRepository{db: db}
}

func (r *PostgresNotificationRepository) GetNotifications(userID int64, notifType string, limit, offset int) ([]models.Notification, error) {
	query := `SELECT id, user_id, type, title, COALESCE(message,'') as message, 
		COALESCE(data::text,'{}') as data, is_read, read_at, created_at
		FROM notifications WHERE user_id = $1`
	args := []interface{}{userID}
	
	if notifType != "" && notifType != "all" {
		query += " AND type = $2"
		args = append(args, notifType)
	}
	
	query += " ORDER BY created_at DESC"
	if limit > 0 {
		query += " LIMIT $" + string(rune('0'+len(args)+1))
		args = append(args, limit)
	}
	if offset > 0 {
		query += " OFFSET $" + string(rune('0'+len(args)+1))
		args = append(args, offset)
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var notifications []models.Notification
	for rows.Next() {
		var n models.Notification
		err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.Data, &n.IsRead, &n.ReadAt, &n.CreatedAt)
		if err != nil {
			return nil, err
		}
		notifications = append(notifications, n)
	}
	return notifications, nil
}

func (r *PostgresNotificationRepository) GetUnreadCount(userID int64) (int, error) {
	var count int
	err := r.db.QueryRow(`SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND is_read = false`, userID).Scan(&count)
	return count, err
}

func (r *PostgresNotificationRepository) CreateNotification(notification *models.Notification) error {
	query := `INSERT INTO notifications (user_id, type, title, message, data) VALUES ($1, $2, $3, $4, $5) RETURNING id`
	return r.db.QueryRow(query, notification.UserID, notification.Type, notification.Title, notification.Message, notification.Data).Scan(&notification.ID)
}

func (r *PostgresNotificationRepository) MarkAsRead(userID, notificationID int64) error {
	now := time.Now()
	_, err := r.db.Exec(`UPDATE notifications SET is_read = true, read_at = $1 WHERE id = $2 AND user_id = $3`, now, notificationID, userID)
	return err
}

func (r *PostgresNotificationRepository) MarkAllAsRead(userID int64) error {
	now := time.Now()
	_, err := r.db.Exec(`UPDATE notifications SET is_read = true, read_at = $1 WHERE user_id = $2 AND is_read = false`, now, userID)
	return err
}

func (r *PostgresNotificationRepository) DeleteNotification(userID, notificationID int64) error {
	_, err := r.db.Exec(`DELETE FROM notifications WHERE id = $1 AND user_id = $2`, notificationID, userID)
	return err
}

func (r *PostgresNotificationRepository) DeleteAllNotifications(userID int64) error {
	_, err := r.db.Exec(`DELETE FROM notifications WHERE user_id = $1`, userID)
	return err
}


func (r *PostgresNotificationRepository) GetSettings(userID int64) (*models.NotificationSettings, error) {
	query := `SELECT id, user_id, email_enabled, push_enabled, sms_enabled, trades_enabled,
		deposits_enabled, withdrawals_enabled, promotions_enabled, news_enabled, price_alerts_enabled,
		created_at, updated_at FROM notification_settings WHERE user_id = $1`
	
	var s models.NotificationSettings
	err := r.db.QueryRow(query, userID).Scan(&s.ID, &s.UserID, &s.EmailEnabled, &s.PushEnabled,
		&s.SmsEnabled, &s.TradesEnabled, &s.DepositsEnabled, &s.WithdrawalsEnabled,
		&s.PromotionsEnabled, &s.NewsEnabled, &s.PriceAlertsEnabled, &s.CreatedAt, &s.UpdatedAt)
	
	if err == sql.ErrNoRows {
		// Create default settings
		s = models.NotificationSettings{
			UserID: userID, EmailEnabled: true, PushEnabled: true, TradesEnabled: true,
			DepositsEnabled: true, WithdrawalsEnabled: true, PriceAlertsEnabled: true,
		}
		r.db.Exec(`INSERT INTO notification_settings (user_id) VALUES ($1)`, userID)
		return &s, nil
	}
	if err != nil {
		return nil, err
	}
	return &s, nil
}

func (r *PostgresNotificationRepository) UpdateSettings(userID int64, settings *models.NotificationSettings) error {
	query := `UPDATE notification_settings SET 
		email_enabled = $1, push_enabled = $2, sms_enabled = $3, trades_enabled = $4,
		deposits_enabled = $5, withdrawals_enabled = $6, promotions_enabled = $7,
		news_enabled = $8, price_alerts_enabled = $9, updated_at = NOW()
		WHERE user_id = $10`
	
	result, err := r.db.Exec(query, settings.EmailEnabled, settings.PushEnabled, settings.SmsEnabled,
		settings.TradesEnabled, settings.DepositsEnabled, settings.WithdrawalsEnabled,
		settings.PromotionsEnabled, settings.NewsEnabled, settings.PriceAlertsEnabled, userID)
	if err != nil {
		return err
	}
	
	rows, _ := result.RowsAffected()
	if rows == 0 {
		// Insert if not exists
		_, err = r.db.Exec(`INSERT INTO notification_settings (user_id, email_enabled, push_enabled, sms_enabled,
			trades_enabled, deposits_enabled, withdrawals_enabled, promotions_enabled, news_enabled, price_alerts_enabled)
			VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
			userID, settings.EmailEnabled, settings.PushEnabled, settings.SmsEnabled,
			settings.TradesEnabled, settings.DepositsEnabled, settings.WithdrawalsEnabled,
			settings.PromotionsEnabled, settings.NewsEnabled, settings.PriceAlertsEnabled)
	}
	return err
}

func (r *PostgresNotificationRepository) GetPriceAlerts(userID int64) ([]models.PriceAlert, error) {
	query := `SELECT id, user_id, symbol, condition, price, active, triggered, created_at, triggered_at
		FROM price_alerts WHERE user_id = $1 ORDER BY created_at DESC`
	
	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var alerts []models.PriceAlert
	for rows.Next() {
		var a models.PriceAlert
		err := rows.Scan(&a.ID, &a.UserID, &a.Symbol, &a.Condition, &a.Price, &a.Active, &a.Triggered, &a.CreatedAt, &a.TriggeredAt)
		if err != nil {
			return nil, err
		}
		alerts = append(alerts, a)
	}
	return alerts, nil
}

func (r *PostgresNotificationRepository) CreatePriceAlert(alert *models.PriceAlert) error {
	query := `INSERT INTO price_alerts (user_id, symbol, condition, price, active) VALUES ($1, $2, $3, $4, true) RETURNING id`
	return r.db.QueryRow(query, alert.UserID, alert.Symbol, alert.Condition, alert.Price).Scan(&alert.ID)
}

func (r *PostgresNotificationRepository) TogglePriceAlert(userID, alertID int64) error {
	_, err := r.db.Exec(`UPDATE price_alerts SET active = NOT active WHERE id = $1 AND user_id = $2`, alertID, userID)
	return err
}

func (r *PostgresNotificationRepository) DeletePriceAlert(userID, alertID int64) error {
	_, err := r.db.Exec(`DELETE FROM price_alerts WHERE id = $1 AND user_id = $2`, alertID, userID)
	return err
}

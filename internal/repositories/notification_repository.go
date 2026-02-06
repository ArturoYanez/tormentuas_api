package repositories

import "tormentus/internal/models"

type NotificationRepository interface {
	GetNotifications(userID int64, notifType string, limit, offset int) ([]models.Notification, error)
	GetUnreadCount(userID int64) (int, error)
	CreateNotification(notification *models.Notification) error
	MarkAsRead(userID, notificationID int64) error
	MarkAllAsRead(userID int64) error
	DeleteNotification(userID, notificationID int64) error
	DeleteAllNotifications(userID int64) error
	GetSettings(userID int64) (*models.NotificationSettings, error)
	UpdateSettings(userID int64, settings *models.NotificationSettings) error
	GetPriceAlerts(userID int64) ([]models.PriceAlert, error)
	CreatePriceAlert(alert *models.PriceAlert) error
	TogglePriceAlert(userID, alertID int64) error
	DeletePriceAlert(userID, alertID int64) error
}

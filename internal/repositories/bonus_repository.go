package repositories

import "tormentus/internal/models"

type BonusRepository interface {
	GetAvailableBonuses() ([]models.Bonus, error)
	GetBonusByID(id int64) (*models.Bonus, error)
	GetBonusByCode(code string) (*models.Bonus, error)
	GetUserBonuses(userID int64, status string) ([]models.UserBonus, error)
	GetActiveUserBonus(userID int64) (*models.UserBonus, error)
	GetUserBonusStats(userID int64) (*models.BonusStats, error)
	ClaimBonus(userID, bonusID int64, amount, rolloverRequired float64) error
	ApplyPromoCode(userID int64, code string) (*models.UserBonus, error)
	CancelUserBonus(userID, bonusID int64) error
	UpdateRolloverProgress(userBonusID int64, amount float64) error
}

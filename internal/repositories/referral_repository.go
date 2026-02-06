package repositories

import "tormentus/internal/models"

type ReferralRepository interface {
	GetReferralStats(userID int64) (*models.ReferralStats, error)
	GetReferrals(userID int64) ([]models.Referral, error)
	GetCommissions(userID int64, status string, limit, offset int) ([]models.ReferralCommission, error)
	GetTiers() ([]models.ReferralTier, error)
	GetUserTier(userID int64) (*models.ReferralTier, error)
	GetReferralCode(userID int64) (string, error)
	GenerateReferralCode(userID int64) (string, error)
}

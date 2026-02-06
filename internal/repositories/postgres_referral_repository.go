package repositories

import (
	"crypto/rand"
	"database/sql"
	"encoding/hex"
	"strings"
	"time"
	"tormentus/internal/models"
)

type PostgresReferralRepository struct {
	db *sql.DB
}

func NewPostgresReferralRepository(db *sql.DB) *PostgresReferralRepository {
	return &PostgresReferralRepository{db: db}
}

func (r *PostgresReferralRepository) GetReferralStats(userID int64) (*models.ReferralStats, error) {
	stats := &models.ReferralStats{}

	// Get referral code
	r.db.QueryRow(`SELECT COALESCE(referral_code,'') FROM users WHERE id = $1`, userID).Scan(&stats.ReferralCode)

	// Total referrals
	r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE referred_by = $1`, userID).Scan(&stats.TotalReferrals)

	// Active referrals (with deposits)
	r.db.QueryRow(`SELECT COUNT(DISTINCT u.id) FROM users u 
		JOIN transactions t ON u.id = t.user_id AND t.type = 'deposit' AND t.status = 'completed'
		WHERE u.referred_by = $1`, userID).Scan(&stats.ActiveReferrals)

	// Total commissions
	r.db.QueryRow(`SELECT COALESCE(SUM(amount),0) FROM referral_commissions WHERE user_id = $1 AND status = 'paid'`, userID).Scan(&stats.TotalCommissions)

	// Pending commissions
	r.db.QueryRow(`SELECT COALESCE(SUM(amount),0) FROM referral_commissions WHERE user_id = $1 AND status = 'pending'`, userID).Scan(&stats.PendingCommissions)

	// This month
	startOfMonth := time.Now().Format("2006-01-01")
	r.db.QueryRow(`SELECT COALESCE(SUM(amount),0) FROM referral_commissions WHERE user_id = $1 AND created_at >= $2`, userID, startOfMonth).Scan(&stats.ThisMonth)

	// Get current tier
	tier, _ := r.GetUserTier(userID)
	if tier != nil {
		stats.CurrentTier = tier.Name
		stats.CommissionRate = tier.DepositCommission
	}

	return stats, nil
}

func (r *PostgresReferralRepository) GetReferrals(userID int64) ([]models.Referral, error) {
	query := `SELECT u.id, u.email, COALESCE(u.name,'') as name, u.status, u.created_at,
		COALESCE((SELECT SUM(amount) FROM transactions WHERE user_id = u.id AND type = 'deposit' AND status = 'completed'), 0) as total_deposits,
		COALESCE((SELECT SUM(amount) FROM referral_commissions WHERE referral_id = u.id AND user_id = $1), 0) as commission
		FROM users u WHERE u.referred_by = $1 ORDER BY u.created_at DESC`

	rows, err := r.db.Query(query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var referrals []models.Referral
	for rows.Next() {
		var ref models.Referral
		err := rows.Scan(&ref.ID, &ref.Email, &ref.Name, &ref.Status, &ref.CreatedAt, &ref.TotalDeposits, &ref.Commission)
		if err != nil {
			return nil, err
		}
		// Mask email
		parts := strings.Split(ref.Email, "@")
		if len(parts) == 2 && len(parts[0]) > 2 {
			ref.Email = parts[0][:2] + "***@" + parts[1]
		}
		referrals = append(referrals, ref)
	}
	return referrals, nil
}

func (r *PostgresReferralRepository) GetCommissions(userID int64, status string, limit, offset int) ([]models.ReferralCommission, error) {
	query := `SELECT rc.id, rc.user_id, rc.referral_id, COALESCE(u.name, u.email) as referral_name,
		rc.type, rc.amount, COALESCE(rc.source_amount,0), rc.status, rc.paid_at, rc.created_at
		FROM referral_commissions rc
		LEFT JOIN users u ON rc.referral_id = u.id
		WHERE rc.user_id = $1`
	
	args := []interface{}{userID}
	if status != "" && status != "all" {
		query += " AND rc.status = $2"
		args = append(args, status)
	}
	query += " ORDER BY rc.created_at DESC"
	if limit > 0 {
		query += " LIMIT " + string(rune('0'+limit))
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var commissions []models.ReferralCommission
	for rows.Next() {
		var c models.ReferralCommission
		err := rows.Scan(&c.ID, &c.UserID, &c.ReferralID, &c.ReferralName, &c.Type, &c.Amount, &c.SourceAmount, &c.Status, &c.PaidAt, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		commissions = append(commissions, c)
	}
	return commissions, nil
}

func (r *PostgresReferralRepository) GetTiers() ([]models.ReferralTier, error) {
	query := `SELECT id, name, min_referrals, deposit_commission, trade_commission, COALESCE(signup_bonus,0)
		FROM referral_tiers ORDER BY min_referrals ASC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tiers []models.ReferralTier
	for rows.Next() {
		var t models.ReferralTier
		err := rows.Scan(&t.ID, &t.Name, &t.MinReferrals, &t.DepositCommission, &t.TradeCommission, &t.SignupBonus)
		if err != nil {
			return nil, err
		}
		tiers = append(tiers, t)
	}
	return tiers, nil
}

func (r *PostgresReferralRepository) GetUserTier(userID int64) (*models.ReferralTier, error) {
	var count int
	r.db.QueryRow(`SELECT COUNT(*) FROM users WHERE referred_by = $1`, userID).Scan(&count)

	query := `SELECT id, name, min_referrals, deposit_commission, trade_commission, COALESCE(signup_bonus,0)
		FROM referral_tiers WHERE min_referrals <= $1 ORDER BY min_referrals DESC LIMIT 1`

	var t models.ReferralTier
	err := r.db.QueryRow(query, count).Scan(&t.ID, &t.Name, &t.MinReferrals, &t.DepositCommission, &t.TradeCommission, &t.SignupBonus)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *PostgresReferralRepository) GetReferralCode(userID int64) (string, error) {
	var code string
	err := r.db.QueryRow(`SELECT COALESCE(referral_code,'') FROM users WHERE id = $1`, userID).Scan(&code)
	if err != nil {
		return "", err
	}
	if code == "" {
		return r.GenerateReferralCode(userID)
	}
	return code, nil
}

func (r *PostgresReferralRepository) GenerateReferralCode(userID int64) (string, error) {
	bytes := make([]byte, 4)
	rand.Read(bytes)
	code := "REF" + strings.ToUpper(hex.EncodeToString(bytes))

	_, err := r.db.Exec(`UPDATE users SET referral_code = $1 WHERE id = $2`, code, userID)
	if err != nil {
		return "", err
	}
	return code, nil
}

package repositories

import (
	"database/sql"
	"errors"
	"time"
	"tormentus/internal/models"
)

type PostgresBonusRepository struct {
	db *sql.DB
}

func NewPostgresBonusRepository(db *sql.DB) *PostgresBonusRepository {
	return &PostgresBonusRepository{db: db}
}

func (r *PostgresBonusRepository) GetAvailableBonuses() ([]models.Bonus, error) {
	query := `SELECT id, name, COALESCE(description,'') as description, type, 
		COALESCE(amount,0) as amount, COALESCE(percentage,0) as percentage,
		COALESCE(min_deposit,0) as min_deposit, COALESCE(max_bonus,0) as max_bonus,
		rollover_multiplier, COALESCE(code,'') as code, is_active, starts_at, expires_at, created_at
		FROM bonuses WHERE is_active = true 
		AND (starts_at IS NULL OR starts_at <= NOW())
		AND (expires_at IS NULL OR expires_at > NOW())
		ORDER BY created_at DESC`
	
	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bonuses []models.Bonus
	for rows.Next() {
		var b models.Bonus
		err := rows.Scan(&b.ID, &b.Name, &b.Description, &b.Type, &b.Amount, &b.Percentage,
			&b.MinDeposit, &b.MaxBonus, &b.RolloverMultiplier, &b.Code, &b.IsActive,
			&b.StartsAt, &b.ExpiresAt, &b.CreatedAt)
		if err != nil {
			return nil, err
		}
		bonuses = append(bonuses, b)
	}
	return bonuses, nil
}

func (r *PostgresBonusRepository) GetBonusByID(id int64) (*models.Bonus, error) {
	query := `SELECT id, name, COALESCE(description,'') as description, type,
		COALESCE(amount,0) as amount, COALESCE(percentage,0) as percentage,
		COALESCE(min_deposit,0) as min_deposit, COALESCE(max_bonus,0) as max_bonus,
		rollover_multiplier, COALESCE(code,'') as code, is_active, starts_at, expires_at, created_at
		FROM bonuses WHERE id = $1`
	
	var b models.Bonus
	err := r.db.QueryRow(query, id).Scan(&b.ID, &b.Name, &b.Description, &b.Type, &b.Amount, &b.Percentage,
		&b.MinDeposit, &b.MaxBonus, &b.RolloverMultiplier, &b.Code, &b.IsActive,
		&b.StartsAt, &b.ExpiresAt, &b.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}

func (r *PostgresBonusRepository) GetBonusByCode(code string) (*models.Bonus, error) {
	query := `SELECT id, name, COALESCE(description,'') as description, type,
		COALESCE(amount,0) as amount, COALESCE(percentage,0) as percentage,
		COALESCE(min_deposit,0) as min_deposit, COALESCE(max_bonus,0) as max_bonus,
		rollover_multiplier, COALESCE(code,'') as code, is_active, starts_at, expires_at, created_at
		FROM bonuses WHERE code = $1 AND is_active = true
		AND (starts_at IS NULL OR starts_at <= NOW())
		AND (expires_at IS NULL OR expires_at > NOW())`
	
	var b models.Bonus
	err := r.db.QueryRow(query, code).Scan(&b.ID, &b.Name, &b.Description, &b.Type, &b.Amount, &b.Percentage,
		&b.MinDeposit, &b.MaxBonus, &b.RolloverMultiplier, &b.Code, &b.IsActive,
		&b.StartsAt, &b.ExpiresAt, &b.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &b, nil
}


func (r *PostgresBonusRepository) GetUserBonuses(userID int64, status string) ([]models.UserBonus, error) {
	query := `SELECT ub.id, ub.user_id, ub.bonus_id, ub.amount, 
		COALESCE(ub.rollover_required,0), COALESCE(ub.rollover_completed,0),
		ub.status, ub.activated_at, ub.completed_at, ub.expires_at, ub.created_at,
		b.name as bonus_name, b.type as bonus_type, COALESCE(b.code,'') as bonus_code
		FROM user_bonuses ub
		JOIN bonuses b ON ub.bonus_id = b.id
		WHERE ub.user_id = $1`
	
	args := []interface{}{userID}
	if status != "" && status != "all" {
		query += " AND ub.status = $2"
		args = append(args, status)
	}
	query += " ORDER BY ub.created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var bonuses []models.UserBonus
	for rows.Next() {
		var ub models.UserBonus
		err := rows.Scan(&ub.ID, &ub.UserID, &ub.BonusID, &ub.Amount,
			&ub.RolloverRequired, &ub.RolloverCompleted, &ub.Status,
			&ub.ActivatedAt, &ub.CompletedAt, &ub.ExpiresAt, &ub.CreatedAt,
			&ub.BonusName, &ub.BonusType, &ub.BonusCode)
		if err != nil {
			return nil, err
		}
		bonuses = append(bonuses, ub)
	}
	return bonuses, nil
}

func (r *PostgresBonusRepository) GetActiveUserBonus(userID int64) (*models.UserBonus, error) {
	query := `SELECT ub.id, ub.user_id, ub.bonus_id, ub.amount,
		COALESCE(ub.rollover_required,0), COALESCE(ub.rollover_completed,0),
		ub.status, ub.activated_at, ub.completed_at, ub.expires_at, ub.created_at,
		b.name as bonus_name, b.type as bonus_type, COALESCE(b.code,'') as bonus_code
		FROM user_bonuses ub
		JOIN bonuses b ON ub.bonus_id = b.id
		WHERE ub.user_id = $1 AND ub.status = 'active'
		LIMIT 1`
	
	var ub models.UserBonus
	err := r.db.QueryRow(query, userID).Scan(&ub.ID, &ub.UserID, &ub.BonusID, &ub.Amount,
		&ub.RolloverRequired, &ub.RolloverCompleted, &ub.Status,
		&ub.ActivatedAt, &ub.CompletedAt, &ub.ExpiresAt, &ub.CreatedAt,
		&ub.BonusName, &ub.BonusType, &ub.BonusCode)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}
	return &ub, nil
}

func (r *PostgresBonusRepository) GetUserBonusStats(userID int64) (*models.BonusStats, error) {
	stats := &models.BonusStats{}
	
	// Total earned from completed bonuses
	r.db.QueryRow(`SELECT COALESCE(SUM(amount),0) FROM user_bonuses WHERE user_id = $1 AND status = 'completed'`, userID).Scan(&stats.TotalEarned)
	
	// Active bonus amount
	r.db.QueryRow(`SELECT COALESCE(SUM(amount),0) FROM user_bonuses WHERE user_id = $1 AND status = 'active'`, userID).Scan(&stats.ActiveBonus)
	
	// Pending rollover
	r.db.QueryRow(`SELECT COALESCE(SUM(rollover_required - rollover_completed),0) FROM user_bonuses WHERE user_id = $1 AND status = 'active'`, userID).Scan(&stats.PendingRollover)
	
	// Completed count
	r.db.QueryRow(`SELECT COUNT(*) FROM user_bonuses WHERE user_id = $1 AND status = 'completed'`, userID).Scan(&stats.CompletedBonuses)
	
	return stats, nil
}

func (r *PostgresBonusRepository) ClaimBonus(userID, bonusID int64, amount, rolloverRequired float64) error {
	// Check if user already has active bonus
	active, _ := r.GetActiveUserBonus(userID)
	if active != nil {
		return errors.New("ya tienes un bono activo")
	}

	query := `INSERT INTO user_bonuses (user_id, bonus_id, amount, rollover_required, status, activated_at)
		VALUES ($1, $2, $3, $4, 'active', NOW())`
	_, err := r.db.Exec(query, userID, bonusID, amount, rolloverRequired)
	return err
}

func (r *PostgresBonusRepository) ApplyPromoCode(userID int64, code string) (*models.UserBonus, error) {
	bonus, err := r.GetBonusByCode(code)
	if err != nil {
		return nil, errors.New("código promocional inválido")
	}

	rolloverRequired := bonus.Amount * float64(bonus.RolloverMultiplier)
	err = r.ClaimBonus(userID, bonus.ID, bonus.Amount, rolloverRequired)
	if err != nil {
		return nil, err
	}

	return r.GetActiveUserBonus(userID)
}

func (r *PostgresBonusRepository) CancelUserBonus(userID, bonusID int64) error {
	query := `UPDATE user_bonuses SET status = 'cancelled', completed_at = NOW() 
		WHERE user_id = $1 AND id = $2 AND status = 'active'`
	result, err := r.db.Exec(query, userID, bonusID)
	if err != nil {
		return err
	}
	rows, _ := result.RowsAffected()
	if rows == 0 {
		return errors.New("bono no encontrado o ya no está activo")
	}
	return nil
}

func (r *PostgresBonusRepository) UpdateRolloverProgress(userBonusID int64, amount float64) error {
	query := `UPDATE user_bonuses SET rollover_completed = rollover_completed + $1 WHERE id = $2`
	_, err := r.db.Exec(query, amount, userBonusID)
	if err != nil {
		return err
	}

	// Check if rollover is complete
	var required, completed float64
	r.db.QueryRow(`SELECT rollover_required, rollover_completed FROM user_bonuses WHERE id = $1`, userBonusID).Scan(&required, &completed)
	if completed >= required {
		now := time.Now()
		r.db.Exec(`UPDATE user_bonuses SET status = 'completed', completed_at = $1 WHERE id = $2`, now, userBonusID)
	}
	return nil
}

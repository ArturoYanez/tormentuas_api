package repositories

import (
	"database/sql"
	"time"
	"tormentus/internal/models"
)

type PostgresTournamentRepository struct {
	db *sql.DB
}

func NewPostgresTournamentRepository(db *sql.DB) *PostgresTournamentRepository {
	return &PostgresTournamentRepository{db: db}
}

func (r *PostgresTournamentRepository) GetAll(status string) ([]models.Tournament, error) {
	query := `
		SELECT t.id, t.title, t.description, t.type, t.entry_fee, t.prize_pool, 
			   t.initial_balance, t.max_participants, t.min_participants, t.status, 
			   t.starts_at, t.ends_at, t.created_at,
			   (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participants
		FROM tournaments t
		WHERE ($1 = '' OR $1 = 'all' OR t.status = $1)
		ORDER BY t.starts_at ASC`

	rows, err := r.db.Query(query, status)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tournaments []models.Tournament
	for rows.Next() {
		var t models.Tournament
		err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Type, &t.EntryFee, &t.PrizePool,
			&t.InitialBalance, &t.MaxParticipants, &t.MinParticipants, &t.Status,
			&t.StartsAt, &t.EndsAt, &t.CreatedAt, &t.Participants)
		if err != nil {
			continue
		}
		tournaments = append(tournaments, t)
	}
	return tournaments, nil
}

func (r *PostgresTournamentRepository) GetByID(id int64) (*models.Tournament, error) {
	var t models.Tournament
	err := r.db.QueryRow(`
		SELECT t.id, t.title, t.description, t.type, t.entry_fee, t.prize_pool, 
			   t.initial_balance, t.max_participants, t.min_participants, t.status, 
			   t.starts_at, t.ends_at, t.created_at,
			   (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participants
		FROM tournaments t WHERE t.id = $1
	`, id).Scan(&t.ID, &t.Title, &t.Description, &t.Type, &t.EntryFee, &t.PrizePool,
		&t.InitialBalance, &t.MaxParticipants, &t.MinParticipants, &t.Status,
		&t.StartsAt, &t.EndsAt, &t.CreatedAt, &t.Participants)
	if err != nil {
		return nil, err
	}
	return &t, nil
}

func (r *PostgresTournamentRepository) Join(tournamentID, userID int64) (*models.TournamentParticipant, error) {
	// Get tournament initial balance
	var initialBalance float64
	err := r.db.QueryRow("SELECT initial_balance FROM tournaments WHERE id = $1", tournamentID).Scan(&initialBalance)
	if err != nil {
		return nil, err
	}

	// Check if already joined
	var exists int
	r.db.QueryRow("SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2", tournamentID, userID).Scan(&exists)
	if exists > 0 {
		return r.GetParticipant(tournamentID, userID)
	}

	// Get current rank
	var currentCount int
	r.db.QueryRow("SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = $1", tournamentID).Scan(&currentCount)

	participant := &models.TournamentParticipant{
		TournamentID: tournamentID,
		UserID:       userID,
		Balance:      initialBalance,
		Profit:       0,
		Rank:         currentCount + 1,
		TradesCount:  0,
		JoinedAt:     time.Now(),
	}

	err = r.db.QueryRow(`
		INSERT INTO tournament_participants (tournament_id, user_id, balance, profit, rank, trades_count, joined_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
		RETURNING id
	`, tournamentID, userID, initialBalance, 0, currentCount+1, 0, participant.JoinedAt).Scan(&participant.ID)

	if err != nil {
		return nil, err
	}
	return participant, nil
}

func (r *PostgresTournamentRepository) GetParticipant(tournamentID, userID int64) (*models.TournamentParticipant, error) {
	var p models.TournamentParticipant
	err := r.db.QueryRow(`
		SELECT id, tournament_id, user_id, balance, profit, rank, trades_count, joined_at
		FROM tournament_participants WHERE tournament_id = $1 AND user_id = $2
	`, tournamentID, userID).Scan(&p.ID, &p.TournamentID, &p.UserID, &p.Balance, &p.Profit, &p.Rank, &p.TradesCount, &p.JoinedAt)
	if err != nil {
		return nil, err
	}

	// Calculate profit percent
	var initialBalance float64
	r.db.QueryRow("SELECT initial_balance FROM tournaments WHERE id = $1", tournamentID).Scan(&initialBalance)
	if initialBalance > 0 {
		p.ProfitPct = (p.Profit / initialBalance) * 100
	}

	return &p, nil
}

func (r *PostgresTournamentRepository) GetLeaderboard(tournamentID int64, limit int) ([]models.TournamentParticipant, error) {
	if limit <= 0 {
		limit = 20
	}

	rows, err := r.db.Query(`
		SELECT tp.id, tp.tournament_id, tp.user_id, tp.balance, tp.profit, tp.trades_count, tp.joined_at,
			   COALESCE(u.first_name, 'Trader') || ' ' || COALESCE(LEFT(u.last_name, 1), '') as username
		FROM tournament_participants tp
		LEFT JOIN users u ON tp.user_id = u.id
		WHERE tp.tournament_id = $1
		ORDER BY tp.balance DESC
		LIMIT $2
	`, tournamentID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var initialBalance float64
	r.db.QueryRow("SELECT initial_balance FROM tournaments WHERE id = $1", tournamentID).Scan(&initialBalance)

	var participants []models.TournamentParticipant
	rank := 0
	for rows.Next() {
		rank++
		var p models.TournamentParticipant
		err := rows.Scan(&p.ID, &p.TournamentID, &p.UserID, &p.Balance, &p.Profit, &p.TradesCount, &p.JoinedAt, &p.Username)
		if err != nil {
			continue
		}
		p.Rank = rank
		if initialBalance > 0 {
			p.ProfitPct = (p.Profit / initialBalance) * 100
		}
		participants = append(participants, p)
	}
	return participants, nil
}

func (r *PostgresTournamentRepository) GetUserTournaments(userID int64) ([]models.Tournament, error) {
	rows, err := r.db.Query(`
		SELECT t.id, t.title, t.description, t.type, t.entry_fee, t.prize_pool, 
			   t.initial_balance, t.max_participants, t.min_participants, t.status, 
			   t.starts_at, t.ends_at, t.created_at,
			   (SELECT COUNT(*) FROM tournament_participants WHERE tournament_id = t.id) as participants
		FROM tournaments t
		INNER JOIN tournament_participants tp ON t.id = tp.tournament_id
		WHERE tp.user_id = $1
		ORDER BY t.starts_at DESC
	`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var tournaments []models.Tournament
	for rows.Next() {
		var t models.Tournament
		err := rows.Scan(&t.ID, &t.Title, &t.Description, &t.Type, &t.EntryFee, &t.PrizePool,
			&t.InitialBalance, &t.MaxParticipants, &t.MinParticipants, &t.Status,
			&t.StartsAt, &t.EndsAt, &t.CreatedAt, &t.Participants)
		if err != nil {
			continue
		}
		tournaments = append(tournaments, t)
	}
	return tournaments, nil
}

func (r *PostgresTournamentRepository) UpdateParticipantBalance(tournamentID, userID int64, balance, profit float64) error {
	_, err := r.db.Exec(`
		UPDATE tournament_participants 
		SET balance = $1, profit = $2, trades_count = trades_count + 1
		WHERE tournament_id = $3 AND user_id = $4
	`, balance, profit, tournamentID, userID)
	return err
}

func (r *PostgresTournamentRepository) Rebuy(tournamentID, userID int64, initialBalance float64) error {
	_, err := r.db.Exec(`
		UPDATE tournament_participants 
		SET balance = $1, profit = 0, trades_count = 0
		WHERE tournament_id = $2 AND user_id = $3
	`, initialBalance, tournamentID, userID)
	return err
}

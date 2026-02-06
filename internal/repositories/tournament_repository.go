package repositories

import "tormentus/internal/models"

type TournamentRepository interface {
	GetAll(status string) ([]models.Tournament, error)
	GetByID(id int64) (*models.Tournament, error)
	Join(tournamentID, userID int64) (*models.TournamentParticipant, error)
	GetParticipant(tournamentID, userID int64) (*models.TournamentParticipant, error)
	GetLeaderboard(tournamentID int64, limit int) ([]models.TournamentParticipant, error)
	GetUserTournaments(userID int64) ([]models.Tournament, error)
	UpdateParticipantBalance(tournamentID, userID int64, balance, profit float64) error
	Rebuy(tournamentID, userID int64, initialBalance float64) error
}

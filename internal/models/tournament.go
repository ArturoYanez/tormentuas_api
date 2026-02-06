package models

import "time"

type TournamentStatus string

const (
	TournamentUpcoming TournamentStatus = "upcoming"
	TournamentActive   TournamentStatus = "active"
	TournamentFinished TournamentStatus = "finished"
)

type Tournament struct {
	ID              int64            `json:"id"`
	Title           string           `json:"title"`
	Description     string           `json:"description"`
	Type            string           `json:"type"`
	EntryFee        float64          `json:"entry_fee"`
	PrizePool       float64          `json:"prize_pool"`
	InitialBalance  float64          `json:"initial_balance"`
	MaxParticipants int              `json:"max_participants"`
	MinParticipants int              `json:"min_participants"`
	Status          TournamentStatus `json:"status"`
	StartsAt        time.Time        `json:"starts_at"`
	EndsAt          time.Time        `json:"ends_at"`
	CreatedAt       time.Time        `json:"created_at"`
	Participants    int              `json:"participants"`
}

type TournamentParticipant struct {
	ID           int64     `json:"id"`
	TournamentID int64     `json:"tournament_id"`
	UserID       int64     `json:"user_id"`
	Username     string    `json:"username,omitempty"`
	Balance      float64   `json:"balance"`
	Profit       float64   `json:"profit"`
	ProfitPct    float64   `json:"profit_percent"`
	Rank         int       `json:"rank"`
	TradesCount  int       `json:"trades_count"`
	WinsCount    int       `json:"wins_count"`
	JoinedAt     time.Time `json:"joined_at"`
}

type TournamentPrize struct {
	Position   int     `json:"position"`
	Amount     float64 `json:"amount"`
	Percentage float64 `json:"percentage"`
}

var DefaultPrizeDistribution = []TournamentPrize{
	{Position: 1, Percentage: 50},
	{Position: 2, Percentage: 20},
	{Position: 3, Percentage: 10},
	{Position: 4, Percentage: 7},
	{Position: 5, Percentage: 5},
	{Position: 6, Percentage: 3},
	{Position: 7, Percentage: 2},
	{Position: 8, Percentage: 1.5},
	{Position: 9, Percentage: 1},
	{Position: 10, Percentage: 0.5},
}

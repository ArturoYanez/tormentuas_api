package models

import "time"

type Watchlist struct {
	ID        int64     `json:"id"`
	UserID    int64     `json:"user_id"`
	Name      string    `json:"name"`
	IsDefault bool      `json:"is_default"`
	CreatedAt time.Time `json:"created_at"`
	Items     []string  `json:"items,omitempty"`
}

type WatchlistItem struct {
	ID          int64     `json:"id"`
	WatchlistID int64     `json:"watchlist_id"`
	Symbol      string    `json:"symbol"`
	Position    int       `json:"position"`
	AddedAt     time.Time `json:"added_at"`
}

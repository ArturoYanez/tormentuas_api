package models

import "time"

type Course struct {
	ID              int64     `json:"id" db:"id"`
	Title           string    `json:"title" db:"title"`
	Description     string    `json:"description" db:"description"`
	Category        string    `json:"category" db:"category"`
	Level           string    `json:"level" db:"level"`
	DurationMinutes int       `json:"duration_minutes" db:"duration_minutes"`
	ThumbnailURL    string    `json:"thumbnail_url" db:"thumbnail_url"`
	IsPremium       bool      `json:"is_premium" db:"is_premium"`
	IsActive        bool      `json:"is_active" db:"is_active"`
	Position        int       `json:"position" db:"position"`
	LessonsCount    int       `json:"lessons_count" db:"lessons_count"`
	Rating          float64   `json:"rating" db:"rating"`
	CreatedAt       time.Time `json:"created_at" db:"created_at"`
	// User progress
	Progress int `json:"progress" db:"progress"`
}

type Lesson struct {
	ID          int64     `json:"id" db:"id"`
	CourseID    int64     `json:"course_id" db:"course_id"`
	Title       string    `json:"title" db:"title"`
	Content     string    `json:"content" db:"content"`
	VideoURL    string    `json:"video_url" db:"video_url"`
	Duration    int       `json:"duration" db:"duration"`
	Position    int       `json:"position" db:"position"`
	CreatedAt   time.Time `json:"created_at" db:"created_at"`
	IsCompleted bool      `json:"is_completed" db:"is_completed"`
}

type TutorialVideo struct {
	ID           int64     `json:"id" db:"id"`
	Title        string    `json:"title" db:"title"`
	Description  string    `json:"description" db:"description"`
	VideoURL     string    `json:"video_url" db:"video_url"`
	ThumbnailURL string    `json:"thumbnail_url" db:"thumbnail_url"`
	Duration     string    `json:"duration" db:"duration"`
	Category     string    `json:"category" db:"category"`
	ViewsCount   int       `json:"views_count" db:"views_count"`
	CreatedAt    time.Time `json:"created_at" db:"created_at"`
}

type GlossaryTerm struct {
	ID         int64  `json:"id" db:"id"`
	Term       string `json:"term" db:"term"`
	Definition string `json:"definition" db:"definition"`
	Category   string `json:"category" db:"category"`
}

type AcademyStats struct {
	CompletedCourses int     `json:"completed_courses"`
	TotalProgress    int     `json:"total_progress"`
	HoursLearned     float64 `json:"hours_learned"`
	Certificates     int     `json:"certificates"`
}

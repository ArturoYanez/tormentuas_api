package repositories

import (
	"database/sql"
	"tormentus/internal/models"
)

type PostgresAcademyRepository struct {
	db *sql.DB
}

func NewPostgresAcademyRepository(db *sql.DB) *PostgresAcademyRepository {
	return &PostgresAcademyRepository{db: db}
}

func (r *PostgresAcademyRepository) GetCourses(category, level string) ([]models.Course, error) {
	query := `SELECT c.id, c.title, COALESCE(c.description,'') as description, c.category, c.level,
		COALESCE(c.duration_minutes,0) as duration_minutes, COALESCE(c.thumbnail_url,'') as thumbnail_url,
		c.is_premium, c.is_active, c.position,
		(SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
		4.5 as rating, c.created_at
		FROM courses c WHERE c.is_active = true`
	
	args := []interface{}{}
	argNum := 1
	
	if category != "" && category != "all" {
		query += " AND c.category = $" + string(rune('0'+argNum))
		args = append(args, category)
		argNum++
	}
	if level != "" && level != "all" {
		query += " AND c.level = $" + string(rune('0'+argNum))
		args = append(args, level)
	}
	query += " ORDER BY c.position ASC, c.created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var courses []models.Course
	for rows.Next() {
		var c models.Course
		err := rows.Scan(&c.ID, &c.Title, &c.Description, &c.Category, &c.Level,
			&c.DurationMinutes, &c.ThumbnailURL, &c.IsPremium, &c.IsActive, &c.Position,
			&c.LessonsCount, &c.Rating, &c.CreatedAt)
		if err != nil {
			return nil, err
		}
		courses = append(courses, c)
	}
	return courses, nil
}

func (r *PostgresAcademyRepository) GetCourse(id int64) (*models.Course, error) {
	query := `SELECT c.id, c.title, COALESCE(c.description,'') as description, c.category, c.level,
		COALESCE(c.duration_minutes,0) as duration_minutes, COALESCE(c.thumbnail_url,'') as thumbnail_url,
		c.is_premium, c.is_active, c.position,
		(SELECT COUNT(*) FROM lessons WHERE course_id = c.id) as lessons_count,
		4.5 as rating, c.created_at
		FROM courses c WHERE c.id = $1`

	var c models.Course
	err := r.db.QueryRow(query, id).Scan(&c.ID, &c.Title, &c.Description, &c.Category, &c.Level,
		&c.DurationMinutes, &c.ThumbnailURL, &c.IsPremium, &c.IsActive, &c.Position,
		&c.LessonsCount, &c.Rating, &c.CreatedAt)
	if err != nil {
		return nil, err
	}
	return &c, nil
}

func (r *PostgresAcademyRepository) GetCourseLessons(courseID int64) ([]models.Lesson, error) {
	query := `SELECT id, course_id, title, COALESCE(content,'') as content, 
		COALESCE(video_url,'') as video_url, COALESCE(duration,0) as duration, position, created_at
		FROM lessons WHERE course_id = $1 ORDER BY position ASC`

	rows, err := r.db.Query(query, courseID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var lessons []models.Lesson
	for rows.Next() {
		var l models.Lesson
		err := rows.Scan(&l.ID, &l.CourseID, &l.Title, &l.Content, &l.VideoURL, &l.Duration, &l.Position, &l.CreatedAt)
		if err != nil {
			return nil, err
		}
		lessons = append(lessons, l)
	}
	return lessons, nil
}

func (r *PostgresAcademyRepository) GetUserCourseProgress(userID, courseID int64) (int, error) {
	var totalLessons, completedLessons int
	r.db.QueryRow(`SELECT COUNT(*) FROM lessons WHERE course_id = $1`, courseID).Scan(&totalLessons)
	r.db.QueryRow(`SELECT COUNT(*) FROM user_lesson_progress WHERE user_id = $1 AND lesson_id IN (SELECT id FROM lessons WHERE course_id = $2) AND completed = true`, userID, courseID).Scan(&completedLessons)
	
	if totalLessons == 0 {
		return 0, nil
	}
	return (completedLessons * 100) / totalLessons, nil
}

func (r *PostgresAcademyRepository) MarkLessonComplete(userID, lessonID int64) error {
	query := `INSERT INTO user_lesson_progress (user_id, lesson_id, completed, completed_at) 
		VALUES ($1, $2, true, NOW()) ON CONFLICT (user_id, lesson_id) DO UPDATE SET completed = true, completed_at = NOW()`
	_, err := r.db.Exec(query, userID, lessonID)
	return err
}

func (r *PostgresAcademyRepository) GetVideos(category string) ([]models.TutorialVideo, error) {
	query := `SELECT id, title, COALESCE(description,'') as description, video_url, 
		COALESCE(thumbnail_url,'') as thumbnail_url, COALESCE(duration,'') as duration,
		COALESCE(category,'') as category, views_count, created_at
		FROM tutorial_videos WHERE is_active = true`
	
	args := []interface{}{}
	if category != "" && category != "all" {
		query += " AND category = $1"
		args = append(args, category)
	}
	query += " ORDER BY created_at DESC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var videos []models.TutorialVideo
	for rows.Next() {
		var v models.TutorialVideo
		err := rows.Scan(&v.ID, &v.Title, &v.Description, &v.VideoURL, &v.ThumbnailURL, &v.Duration, &v.Category, &v.ViewsCount, &v.CreatedAt)
		if err != nil {
			return nil, err
		}
		videos = append(videos, v)
	}
	return videos, nil
}

func (r *PostgresAcademyRepository) IncrementVideoViews(videoID int64) error {
	_, err := r.db.Exec(`UPDATE tutorial_videos SET views_count = views_count + 1 WHERE id = $1`, videoID)
	return err
}

func (r *PostgresAcademyRepository) GetGlossary(search string) ([]models.GlossaryTerm, error) {
	query := `SELECT id, term, definition, COALESCE(category,'') as category FROM glossary_terms WHERE 1=1`
	args := []interface{}{}
	if search != "" {
		query += " AND (term ILIKE $1 OR definition ILIKE $1)"
		args = append(args, "%"+search+"%")
	}
	query += " ORDER BY term ASC"

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var terms []models.GlossaryTerm
	for rows.Next() {
		var t models.GlossaryTerm
		err := rows.Scan(&t.ID, &t.Term, &t.Definition, &t.Category)
		if err != nil {
			return nil, err
		}
		terms = append(terms, t)
	}
	return terms, nil
}

func (r *PostgresAcademyRepository) GetUserStats(userID int64) (*models.AcademyStats, error) {
	stats := &models.AcademyStats{}
	r.db.QueryRow(`SELECT COUNT(DISTINCT course_id) FROM user_lesson_progress ulp 
		JOIN lessons l ON ulp.lesson_id = l.id WHERE ulp.user_id = $1 AND ulp.completed = true
		AND NOT EXISTS (SELECT 1 FROM lessons l2 WHERE l2.course_id = l.course_id 
		AND NOT EXISTS (SELECT 1 FROM user_lesson_progress ulp2 WHERE ulp2.lesson_id = l2.id AND ulp2.user_id = $1 AND ulp2.completed = true))`, userID).Scan(&stats.CompletedCourses)
	
	r.db.QueryRow(`SELECT COUNT(*) FROM user_certificates WHERE user_id = $1`, userID).Scan(&stats.Certificates)
	
	// Calculate total progress and hours (simplified)
	stats.TotalProgress = stats.CompletedCourses * 15
	stats.HoursLearned = float64(stats.CompletedCourses) * 1.5
	
	return stats, nil
}

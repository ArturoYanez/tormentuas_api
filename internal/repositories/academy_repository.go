package repositories

import "tormentus/internal/models"

type AcademyRepository interface {
	GetCourses(category, level string) ([]models.Course, error)
	GetCourse(id int64) (*models.Course, error)
	GetCourseLessons(courseID int64) ([]models.Lesson, error)
	GetUserCourseProgress(userID, courseID int64) (int, error)
	MarkLessonComplete(userID, lessonID int64) error
	GetVideos(category string) ([]models.TutorialVideo, error)
	IncrementVideoViews(videoID int64) error
	GetGlossary(search string) ([]models.GlossaryTerm, error)
	GetUserStats(userID int64) (*models.AcademyStats, error)
}

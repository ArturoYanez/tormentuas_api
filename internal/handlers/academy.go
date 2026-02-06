package handlers

import (
	"net/http"
	"strconv"
	"tormentus/internal/repositories"

	"github.com/gin-gonic/gin"
)

type AcademyHandler struct {
	academyRepo repositories.AcademyRepository
}

func NewAcademyHandler(academyRepo repositories.AcademyRepository) *AcademyHandler {
	return &AcademyHandler{academyRepo: academyRepo}
}

func (h *AcademyHandler) GetCourses(c *gin.Context) {
	category := c.DefaultQuery("category", "all")
	level := c.DefaultQuery("level", "all")

	courses, err := h.academyRepo.GetCourses(category, level)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo cursos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"courses": courses})
}

func (h *AcademyHandler) GetCourse(c *gin.Context) {
	id, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	course, err := h.academyRepo.GetCourse(id)
	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Curso no encontrado"})
		return
	}

	lessons, _ := h.academyRepo.GetCourseLessons(id)
	c.JSON(http.StatusOK, gin.H{"course": course, "lessons": lessons})
}

func (h *AcademyHandler) GetCourseLessons(c *gin.Context) {
	courseID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	lessons, err := h.academyRepo.GetCourseLessons(courseID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo lecciones"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"lessons": lessons})
}

func (h *AcademyHandler) MarkLessonComplete(c *gin.Context) {
	userID := c.GetInt64("user_id")
	lessonID, err := strconv.ParseInt(c.Param("lessonId"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	if err := h.academyRepo.MarkLessonComplete(userID, lessonID); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error marcando lección"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"message": "Lección completada"})
}

func (h *AcademyHandler) GetVideos(c *gin.Context) {
	category := c.DefaultQuery("category", "all")

	videos, err := h.academyRepo.GetVideos(category)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo videos"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"videos": videos})
}

func (h *AcademyHandler) IncrementVideoViews(c *gin.Context) {
	videoID, err := strconv.ParseInt(c.Param("id"), 10, 64)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "ID inválido"})
		return
	}

	h.academyRepo.IncrementVideoViews(videoID)
	c.JSON(http.StatusOK, gin.H{"message": "Vista registrada"})
}

func (h *AcademyHandler) GetGlossary(c *gin.Context) {
	search := c.DefaultQuery("search", "")

	terms, err := h.academyRepo.GetGlossary(search)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo glosario"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"terms": terms})
}

func (h *AcademyHandler) GetStats(c *gin.Context) {
	userID := c.GetInt64("user_id")

	stats, err := h.academyRepo.GetUserStats(userID)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Error obteniendo estadísticas"})
		return
	}
	c.JSON(http.StatusOK, gin.H{"stats": stats})
}

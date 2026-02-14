package main

import (
	"context"
	"log"
	"time"

	"tormentus/internal/auth"
	"tormentus/internal/database"
	"tormentus/internal/handlers"
	"tormentus/internal/middleware"
	"tormentus/internal/repositories"
	"tormentus/internal/services"
	"tormentus/internal/trading"
	"tormentus/internal/websocket"
	"tormentus/pkg/config"

	"github.com/gin-gonic/gin"
	"github.com/jackc/pgx/v5"
)

// UserRepoWrapper adapta el repositorio de usuarios para las interfaces del trading
type UserRepoWrapper struct {
	repo *repositories.PostgresUserRepository
	conn *pgx.Conn
}

func (w *UserRepoWrapper) UpdateBalance(ctx context.Context, userID int64, amount float64, isDemo bool) error {
	return w.repo.UpdateBalance(ctx, userID, amount, isDemo)
}

func (w *UserRepoWrapper) UpdateTradeStats(ctx context.Context, userID int64, won bool) error {
	return w.repo.UpdateTradeStats(ctx, userID, won)
}

func (w *UserRepoWrapper) GetBalance(ctx context.Context, userID int64, isDemo bool) (float64, error) {
	return w.repo.GetBalance(ctx, userID, isDemo)
}

func main() {
	// Cargar configuración
	cfg := config.Load()
	if err := cfg.Validate(); err != nil {
		log.Fatal("Configuración inválida:", err)
	}

	// Conectar a la base de datos
	db, err := database.NewDB(cfg)
	if err != nil {
		log.Fatal("Error conectando a la base de datos", err)
	}
	defer db.Close()

	log.Println("Conectado a PostgreSQL exitosamente")

	// Ejecución de migraciones
	if err := database.RunMigrations(db.SQL, "./migrations"); err != nil {
		log.Fatal(err)
	}

	// Obtener una conexión del pool
	conn, err := db.Pool.Acquire(context.Background())
	if err != nil {
		log.Fatal("Error obteniendo conexión", err)
	}
	defer conn.Release()

	log.Println("Conexión adquirida del pool")

	// Inicializar JWT Manager
	jwtManager := auth.NewJWTManager(
		"mi-clave-secreta-muy-segura-para-jwt",
		24*time.Hour,
	)

	// Inicializar WebSocket Hub
	wsHub := websocket.NewHub()
	go wsHub.Run()
	wsHub.StartHeartbeat()
	log.Println("WebSocket Hub iniciado")

	// Inicializar servicios
	priceService := services.NewPriceService(wsHub)
	go priceService.Start(context.Background())
	log.Println("Servicio de precios iniciado")

	// Inicializar repositorios
	userRepo := repositories.NewPostgresUserRepository(conn.Conn())
	tradeRepo := repositories.NewPostgresTradeRepository(db.Pool)
	log.Println("Repositorios inicializados")

	// Crear wrapper para user repo que implemente la interfaz del trading engine
	userRepoWrapper := &UserRepoWrapper{repo: userRepo, conn: conn.Conn()}

	// Inicializar motor de trading con repositorios
	tradingEngine := trading.NewTradingEngine(wsHub, db.Pool, tradeRepo, userRepoWrapper)
	go tradingEngine.Start(context.Background())
	log.Println("Motor de trading iniciado")

	// Inicializar repositorio de wallet
	walletRepo := repositories.NewPostgresWalletRepository(db.Pool)
	log.Println("Repositorio de wallet inicializado")

	// Inicializar repositorio de bonuses
	bonusRepo := repositories.NewPostgresBonusRepository(db.SQL)
	log.Println("Repositorio de bonuses inicializado")

	// Inicializar repositorio de notificaciones
	notifRepo := repositories.NewPostgresNotificationRepository(db.SQL)
	log.Println("Repositorio de notificaciones inicializado")

	// Inicializar repositorio de referidos
	referralRepo := repositories.NewPostgresReferralRepository(db.SQL)
	log.Println("Repositorio de referidos inicializado")

	// Inicializar repositorio de academia
	academyRepo := repositories.NewPostgresAcademyRepository(db.SQL)
	log.Println("Repositorio de academia inicializado")

	// Inicializar repositorio de soporte
	supportRepo := repositories.NewPostgresSupportRepository(db.SQL)
	log.Println("Repositorio de soporte inicializado")

	// Inicializar repositorio de torneos
	tournamentRepo := repositories.NewPostgresTournamentRepository(db.SQL)
	log.Println("Repositorio de torneos inicializado")

	// Inicializar repositorio de watchlist
	watchlistRepo := repositories.NewPostgresWatchlistRepository(db.SQL)
	log.Println("Repositorio de watchlist inicializado")

	// Inicializar repositorio de verificación
	verificationRepo := repositories.NewPostgresVerificationRepository(db.Pool)
	log.Println("Repositorio de verificación inicializado")

	// Inicializar repositorio de chart
	chartRepo := repositories.NewPostgresChartRepository(db.Pool)
	log.Println("Repositorio de chart inicializado")

	// Inicializar handlers
	authHandler := handlers.NewAuthHandler(userRepo, jwtManager)
	wsHandler := handlers.NewWebSocketHandler(wsHub)
	tradingHandler := handlers.NewTradingHandler(tradingEngine, priceService, tradeRepo, userRepoWrapper)
	tournamentHandler := handlers.NewTournamentDBHandler(tournamentRepo)
	walletHandler := handlers.NewWalletHandler(walletRepo)
	profileHandler := handlers.NewProfileHandler(userRepo)
	bonusHandler := handlers.NewBonusHandler(bonusRepo)
	notificationHandler := handlers.NewNotificationHandler(notifRepo)
	referralHandler := handlers.NewReferralHandler(referralRepo)
	academyHandler := handlers.NewAcademyHandler(academyRepo)
	supportHandler := handlers.NewSupportHandler(supportRepo)
	watchlistHandler := handlers.NewWatchlistHandler(watchlistRepo)
	verificationDBHandler := handlers.NewVerificationDBHandler(verificationRepo)
	chartHandler := handlers.NewChartHandler(chartRepo)
	twoFactorHandler := handlers.NewTwoFactorHandler()
	pinHandler := handlers.NewPinHandler()
	liveChatHandler := handlers.NewLiveChatHandler()

	log.Println("Handlers inicializados")

	// Inicializar el router
	r := gin.Default()

	// Configuración de CORS
	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	// Servir archivos estáticos
	r.Static("/static", "./frontend/dist/assets")
	r.LoadHTMLGlob("./frontend/dist/index.html")

	// ============ RUTAS PÚBLICAS ============

	// Landing page
	r.GET("/", func(c *gin.Context) {
		c.HTML(200, "index.html", gin.H{
			"title": "Tormentus - Trading Platform",
		})
	})

	// Página de login
	r.GET("/login", func(c *gin.Context) {
		c.HTML(200, "login.html", gin.H{
			"title": "Iniciar Sesión - Tormentus",
		})
	})

	// Página de registro
	r.GET("/register", func(c *gin.Context) {
		c.HTML(200, "register.html", gin.H{
			"title": "Registrarse - Tormentus",
		})
	})

	// Dashboard de trading
	r.GET("/dashboard", func(c *gin.Context) {
		c.HTML(200, "dashboard.html", gin.H{
			"title": "Dashboard - Tormentus",
		})
	})

	// Ruta para el archivo index.html
	r.NoRoute(func(c *gin.Context) {
		c.File("./frontend/dist/index.html")
	})

	// WebSocket (público para precios)
	r.GET("/ws", wsHandler.HandleWebSocket)

	// ============ API PÚBLICA ============
	api := r.Group("/api")
	{
		// Auth
		authGroup := api.Group("/auth")
		{
			authGroup.POST("/login", authHandler.Login)
			authGroup.POST("/register", authHandler.Register)
		}

		// Precios públicos
		api.GET("/prices", tradingHandler.GetPrices)
		api.GET("/prices/:symbol", tradingHandler.GetPrice)
		api.GET("/markets", tradingHandler.GetMarkets)
		api.GET("/markets/:market/prices", tradingHandler.GetPricesByMarket)
		api.GET("/candles/:symbol", tradingHandler.GetCandles)

		// Torneos públicos
		api.GET("/tournaments", tournamentHandler.GetTournaments)
		api.GET("/tournaments/:id", tournamentHandler.GetTournament)
		api.GET("/tournaments/:id/leaderboard", tournamentHandler.GetLeaderboard)
		api.GET("/tournaments/prizes", tournamentHandler.GetPrizeDistribution)

		// Stats WebSocket
		api.GET("/ws/stats", wsHandler.GetConnectionStats)
	}

	// ============ RUTAS PROTEGIDAS ============
	protected := api.Group("/protected")
	protected.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Perfil
		protected.GET("/profile", authHandler.GetProfile)
		protected.PUT("/profile", profileHandler.UpdateProfile)
		protected.POST("/profile/password", profileHandler.ChangePassword)
		protected.GET("/profile/stats", profileHandler.GetUserStats)
		protected.GET("/profile/settings", profileHandler.GetUserSettings)
		protected.PUT("/profile/settings", profileHandler.UpdateUserSettings)

		// Verificación
		protected.GET("/verification/status", verificationDBHandler.GetVerificationStatus)
		protected.GET("/verification/check", verificationDBHandler.CheckVerificationRequired)
		protected.POST("/verification/submit", verificationDBHandler.SubmitVerification)

		// Trading
		protected.POST("/trades", tradingHandler.PlaceTrade)
		protected.GET("/trades/active", tradingHandler.GetActiveTrades)
		protected.GET("/trades/history", tradingHandler.GetTradeHistory)
		protected.GET("/trades/stats", tradingHandler.GetTradeStats)
		protected.DELETE("/trades/:id", tradingHandler.CancelTrade)

		// Torneos
		protected.POST("/tournaments/:id/join", tournamentHandler.JoinTournament)
		protected.GET("/tournaments/my", tournamentHandler.GetMyTournaments)
		protected.GET("/tournaments/:id/participation", tournamentHandler.GetMyParticipation)
		protected.POST("/tournaments/:id/rebuy", tournamentHandler.Rebuy)

		// Wallet
		protected.GET("/wallet/summary", walletHandler.GetWalletSummary)
		protected.GET("/wallet/wallets", walletHandler.GetWallets)
		protected.GET("/wallet/transactions", walletHandler.GetTransactions)
		protected.GET("/wallet/deposit-address", walletHandler.GetDepositAddress)
		protected.GET("/wallet/crypto-options", walletHandler.GetCryptoOptions)
		protected.POST("/wallet/withdraw", walletHandler.RequestWithdrawal)
		protected.GET("/wallet/withdrawals", walletHandler.GetWithdrawals)
		protected.DELETE("/wallet/withdrawals/:id", walletHandler.CancelWithdrawal)

		// Bonuses
		protected.GET("/bonuses", bonusHandler.GetAvailableBonuses)
		protected.GET("/bonuses/my", bonusHandler.GetUserBonuses)
		protected.GET("/bonuses/active", bonusHandler.GetActiveBonus)
		protected.GET("/bonuses/stats", bonusHandler.GetBonusStats)
		protected.POST("/bonuses/:id/claim", bonusHandler.ClaimBonus)
		protected.POST("/bonuses/promo", bonusHandler.ApplyPromoCode)
		protected.DELETE("/bonuses/:id", bonusHandler.CancelBonus)

		// Notifications
		protected.GET("/notifications", notificationHandler.GetNotifications)
		protected.GET("/notifications/unread", notificationHandler.GetUnreadCount)
		protected.POST("/notifications/:id/read", notificationHandler.MarkAsRead)
		protected.POST("/notifications/read-all", notificationHandler.MarkAllAsRead)
		protected.DELETE("/notifications/:id", notificationHandler.DeleteNotification)
		protected.DELETE("/notifications", notificationHandler.DeleteAllNotifications)
		protected.GET("/notifications/settings", notificationHandler.GetSettings)
		protected.PUT("/notifications/settings", notificationHandler.UpdateSettings)
		protected.GET("/notifications/alerts", notificationHandler.GetPriceAlerts)
		protected.POST("/notifications/alerts", notificationHandler.CreatePriceAlert)
		protected.POST("/notifications/alerts/:id/toggle", notificationHandler.TogglePriceAlert)
		protected.DELETE("/notifications/alerts/:id", notificationHandler.DeletePriceAlert)

		// Referrals
		protected.GET("/referrals/stats", referralHandler.GetStats)
		protected.GET("/referrals", referralHandler.GetReferrals)
		protected.GET("/referrals/commissions", referralHandler.GetCommissions)
		protected.GET("/referrals/tiers", referralHandler.GetTiers)
		protected.GET("/referrals/code", referralHandler.GetReferralCode)

		// Academy
		protected.GET("/academy/courses", academyHandler.GetCourses)
		protected.GET("/academy/courses/:id", academyHandler.GetCourse)
		protected.GET("/academy/courses/:id/lessons", academyHandler.GetCourseLessons)
		protected.POST("/academy/lessons/:lessonId/complete", academyHandler.MarkLessonComplete)
		protected.GET("/academy/videos", academyHandler.GetVideos)
		protected.POST("/academy/videos/:id/view", academyHandler.IncrementVideoViews)
		protected.GET("/academy/glossary", academyHandler.GetGlossary)
		protected.GET("/academy/stats", academyHandler.GetStats)

		// Support
		protected.POST("/support/tickets", supportHandler.CreateTicket)
		protected.GET("/support/tickets", supportHandler.GetTickets)
		protected.GET("/support/tickets/:id", supportHandler.GetTicket)
		protected.POST("/support/tickets/:id/close", supportHandler.CloseTicket)
		protected.POST("/support/tickets/:id/messages", supportHandler.AddMessage)
		protected.GET("/support/stats", supportHandler.GetStats)

		// Live Chat
		protected.POST("/support/chat/start", liveChatHandler.StartChat)
		protected.POST("/support/chat/message", liveChatHandler.SendMessage)
		protected.POST("/support/chat/end", liveChatHandler.EndChat)
		protected.GET("/support/chat/:sessionId/history", liveChatHandler.GetChatHistory)

		// Watchlist
		protected.GET("/watchlist", watchlistHandler.GetWatchlist)
		protected.POST("/watchlist/add", watchlistHandler.AddSymbol)
		protected.POST("/watchlist/remove", watchlistHandler.RemoveSymbol)

		// Chart - Drawings, Favorites, Layouts, Indicators
		protected.GET("/chart/drawings", chartHandler.GetDrawings)
		protected.POST("/chart/drawings", chartHandler.CreateDrawing)
		protected.DELETE("/chart/drawings/:id", chartHandler.DeleteDrawing)
		protected.DELETE("/chart/drawings", chartHandler.ClearDrawings)
		protected.GET("/chart/favorites", chartHandler.GetFavorites)
		protected.POST("/chart/favorites", chartHandler.AddFavorite)
		protected.DELETE("/chart/favorites", chartHandler.RemoveFavorite)
		protected.PUT("/chart/favorites/reorder", chartHandler.ReorderFavorites)
		protected.GET("/chart/layouts", chartHandler.GetLayouts)
		protected.POST("/chart/layouts", chartHandler.SaveLayout)
		protected.DELETE("/chart/layouts/:id", chartHandler.DeleteLayout)
		protected.POST("/chart/layouts/:id/default", chartHandler.SetDefaultLayout)
		protected.GET("/chart/indicators", chartHandler.GetIndicators)
		protected.POST("/chart/indicators", chartHandler.SaveIndicator)
		protected.POST("/chart/indicators/:id/toggle", chartHandler.ToggleIndicator)
		protected.DELETE("/chart/indicators/:id", chartHandler.DeleteIndicator)
		protected.GET("/chart/markers", chartHandler.GetTradeMarkers)

		// Security - Sessions, Login History, Security Events
		protected.GET("/security/sessions", verificationDBHandler.GetActiveSessions)
		protected.POST("/security/sessions/invalidate", verificationDBHandler.InvalidateSession)
		protected.POST("/security/sessions/invalidate-all", verificationDBHandler.InvalidateAllSessions)
		protected.GET("/security/login-history", verificationDBHandler.GetLoginHistory)
		protected.GET("/security/events", verificationDBHandler.GetSecurityEvents)

		// 2FA - Two Factor Authentication
		protected.GET("/security/2fa/setup", twoFactorHandler.GenerateSetup)
		protected.POST("/security/2fa/enable", twoFactorHandler.VerifyAndEnable)
		protected.POST("/security/2fa/disable", twoFactorHandler.Disable)
		protected.POST("/security/2fa/verify", twoFactorHandler.VerifyCode)

		// PIN - Security PIN
		protected.GET("/security/pin/status", pinHandler.GetPinStatus)
		protected.POST("/security/pin/setup", pinHandler.SetupPin)
		protected.POST("/security/pin/verify", pinHandler.VerifyPin)
		protected.POST("/security/pin/disable", pinHandler.DisablePin)
		protected.POST("/security/pin/change", pinHandler.ChangePin)
	}

	// ============ RUTAS ADMIN ============
	admin := api.Group("/admin")
	admin.Use(middleware.AuthMiddleware(jwtManager))
	// TODO: Agregar middleware de verificación de admin
	{
		admin.GET("/verifications/pending", verificationDBHandler.GetPendingVerifications)
		admin.POST("/verifications/approve", verificationDBHandler.AdminApproveVerification)
		admin.POST("/verifications/reject", verificationDBHandler.AdminRejectVerification)
	}

	// ============ RUTAS SUPPORT AGENT ============
	// Inicializar repositorio y handler de soporte con BD
	supportAgentRepo := repositories.NewSupportAgentRepository(db.Pool)
	supportAgentDBHandler := handlers.NewSupportAgentDBHandler(supportAgentRepo)
	supportAgent := api.Group("/support-agent")
	supportAgent.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Dashboard
		supportAgent.GET("/dashboard/stats", supportAgentDBHandler.GetDashboardStats)

		// Tickets
		supportAgent.GET("/tickets", supportAgentDBHandler.GetAllTickets)
		supportAgent.GET("/tickets/:id", supportAgentDBHandler.GetTicketByID)
		supportAgent.PUT("/tickets/:id", supportAgentDBHandler.UpdateTicket)
		supportAgent.POST("/tickets/:id/reply", supportAgentDBHandler.ReplyToTicket)
		supportAgent.POST("/tickets/:id/note", supportAgentDBHandler.AddInternalNote)
		supportAgent.POST("/tickets/:id/escalate", supportAgentDBHandler.EscalateTicket)

		// Live Chats
		supportAgent.GET("/chats", supportAgentDBHandler.GetLiveChats)
		supportAgent.GET("/chats/:id", supportAgentDBHandler.GetLiveChatByID)
		supportAgent.POST("/chats/:id/accept", supportAgentDBHandler.AcceptChat)
		supportAgent.POST("/chats/:id/message", supportAgentDBHandler.SendChatMessage)
		supportAgent.POST("/chats/:id/end", supportAgentDBHandler.EndLiveChat)

		// FAQs
		supportAgent.GET("/faqs", supportAgentDBHandler.GetFAQs)
		supportAgent.POST("/faqs", supportAgentDBHandler.CreateFAQ)
		supportAgent.PUT("/faqs/:id", supportAgentDBHandler.UpdateFAQ)
		supportAgent.DELETE("/faqs/:id", supportAgentDBHandler.DeleteFAQ)

		// Templates
		supportAgent.GET("/templates", supportAgentDBHandler.GetTemplates)
		supportAgent.POST("/templates", supportAgentDBHandler.CreateTemplate)
		supportAgent.PUT("/templates/:id", supportAgentDBHandler.UpdateTemplate)
		supportAgent.DELETE("/templates/:id", supportAgentDBHandler.DeleteTemplate)

		// Knowledge Base
		supportAgent.GET("/knowledge", supportAgentDBHandler.GetKnowledgeArticles)
		supportAgent.POST("/knowledge", supportAgentDBHandler.CreateKnowledgeArticle)
		supportAgent.PUT("/knowledge/:id", supportAgentDBHandler.UpdateKnowledgeArticle)
		supportAgent.DELETE("/knowledge/:id", supportAgentDBHandler.DeleteKnowledgeArticle)

		// Users
		supportAgent.GET("/users", supportAgentDBHandler.GetUsers)
		supportAgent.GET("/users/:id", supportAgentDBHandler.GetUserByID)
		supportAgent.POST("/users/:id/note", supportAgentDBHandler.AddUserNote)

		// Notifications
		supportAgent.GET("/notifications", supportAgentDBHandler.GetNotifications)
		supportAgent.GET("/notifications/unread", supportAgentDBHandler.GetUnreadCount)
		supportAgent.POST("/notifications/:id/read", supportAgentDBHandler.MarkNotificationRead)
		supportAgent.POST("/notifications/read-all", supportAgentDBHandler.MarkAllNotificationsRead)

		// Canned Responses
		supportAgent.GET("/canned-responses", supportAgentDBHandler.GetCannedResponses)
		supportAgent.POST("/canned-responses", supportAgentDBHandler.CreateCannedResponse)
		supportAgent.PUT("/canned-responses/:id", supportAgentDBHandler.UpdateCannedResponse)
		supportAgent.DELETE("/canned-responses/:id", supportAgentDBHandler.DeleteCannedResponse)

		// Macros
		supportAgent.GET("/macros", supportAgentDBHandler.GetMacros)
		supportAgent.POST("/macros", supportAgentDBHandler.CreateMacro)
		supportAgent.PUT("/macros/:id", supportAgentDBHandler.UpdateMacro)
		supportAgent.DELETE("/macros/:id", supportAgentDBHandler.DeleteMacro)

		// Agents
		supportAgent.GET("/agents", supportAgentDBHandler.GetAgentsList)
		supportAgent.PUT("/agents/status", supportAgentDBHandler.UpdateAgentStatus)

		// Internal Chat
		supportAgent.GET("/internal/messages", supportAgentDBHandler.GetInternalMessages)
		supportAgent.POST("/internal/messages", supportAgentDBHandler.SendInternalMessage)

		// Settings
		supportAgent.GET("/settings", supportAgentDBHandler.GetAgentSettings)
		supportAgent.PUT("/settings", supportAgentDBHandler.UpdateAgentSettings)

		// Reports
		supportAgent.GET("/reports/stats", supportAgentDBHandler.GetReportStats)

		// Ticket Tags
		supportAgent.POST("/tickets/:id/tags", supportAgentDBHandler.AddTicketTag)
		supportAgent.DELETE("/tickets/:id/tags/:tag", supportAgentDBHandler.RemoveTicketTag)

		// Ticket Collaborators
		supportAgent.POST("/tickets/:id/collaborators", supportAgentDBHandler.AddCollaborator)
		supportAgent.DELETE("/tickets/:id/collaborators/:agentId", supportAgentDBHandler.RemoveCollaborator)

		// Merge Tickets
		supportAgent.POST("/tickets/:id/merge", supportAgentDBHandler.MergeTickets)

		// Ticket Rating
		supportAgent.POST("/tickets/:id/request-rating", supportAgentDBHandler.RequestTicketRating)

		// Transfer Ticket
		supportAgent.POST("/tickets/:id/transfer", supportAgentDBHandler.TransferTicket)

		// Template Favorites & Usage
		supportAgent.POST("/templates/:id/favorite", supportAgentDBHandler.ToggleTemplateFavorite)
		supportAgent.POST("/templates/:id/use", supportAgentDBHandler.IncrementTemplateUsage)

		// Agent Personal Notes
		supportAgent.GET("/agent-notes", supportAgentDBHandler.GetAgentNotes)
		supportAgent.POST("/agent-notes", supportAgentDBHandler.CreateAgentNote)
		supportAgent.DELETE("/agent-notes/:id", supportAgentDBHandler.DeleteAgentNote)

		// Chat Notes
		supportAgent.GET("/chats/:id/notes", supportAgentDBHandler.GetChatNotes)
		supportAgent.POST("/chats/:id/notes", supportAgentDBHandler.AddChatNote)

		// Create Ticket from Chat
		supportAgent.POST("/chats/:id/create-ticket", supportAgentDBHandler.CreateTicketFromChat)

		// Chat Rating
		supportAgent.POST("/chats/:id/request-rating", supportAgentDBHandler.RequestChatRating)

		// Bulk Operations
		supportAgent.POST("/tickets/bulk-assign", supportAgentDBHandler.BulkAssignTickets)
		supportAgent.POST("/tickets/bulk-escalate", supportAgentDBHandler.BulkEscalateTickets)

		// Agent Schedule
		supportAgent.GET("/schedule", supportAgentDBHandler.GetAgentSchedule)
		supportAgent.PUT("/schedule", supportAgentDBHandler.UpdateAgentSchedule)
		supportAgent.GET("/breaks", supportAgentDBHandler.GetAgentBreaks)
		supportAgent.POST("/breaks", supportAgentDBHandler.CreateAgentBreak)
		supportAgent.DELETE("/breaks/:id", supportAgentDBHandler.DeleteAgentBreak)
		supportAgent.GET("/vacations", supportAgentDBHandler.GetAgentVacations)
		supportAgent.POST("/vacations", supportAgentDBHandler.CreateAgentVacation)

		// SLA Policies
		supportAgent.GET("/sla-policies", supportAgentDBHandler.GetSLAPolicies)
		supportAgent.POST("/sla-policies", supportAgentDBHandler.CreateSLAPolicy)
		supportAgent.PUT("/sla-policies/:id", supportAgentDBHandler.UpdateSLAPolicy)

		// Ticket Attachments
		supportAgent.GET("/tickets/:id/attachments", supportAgentDBHandler.GetTicketAttachments)
		supportAgent.POST("/tickets/:id/attachments", supportAgentDBHandler.AddTicketAttachment)
		supportAgent.DELETE("/tickets/:id/attachments/:attachmentId", supportAgentDBHandler.DeleteTicketAttachment)

		// Chat Transfers
		supportAgent.POST("/chats/:id/transfer", supportAgentDBHandler.TransferChat)
		supportAgent.GET("/chat-transfers/pending", supportAgentDBHandler.GetPendingChatTransfers)
		supportAgent.POST("/chat-transfers/:id/accept", supportAgentDBHandler.AcceptChatTransfer)

		// Quick Replies
		supportAgent.GET("/quick-replies", supportAgentDBHandler.GetQuickReplies)
		supportAgent.POST("/quick-replies", supportAgentDBHandler.CreateQuickReply)
		supportAgent.DELETE("/quick-replies/:id", supportAgentDBHandler.DeleteQuickReply)

		// Ticket Categories
		supportAgent.GET("/categories", supportAgentDBHandler.GetTicketCategories)

		// FAQ Feedback
		supportAgent.GET("/faqs/:id/feedback", supportAgentDBHandler.GetFAQFeedback)
		supportAgent.POST("/faqs/:id/feedback", supportAgentDBHandler.AddFAQFeedback)

		// Ticket History
		supportAgent.GET("/tickets/:id/history", supportAgentDBHandler.GetTicketHistory)

		// Chat Attachments
		supportAgent.GET("/chats/:id/attachments", supportAgentDBHandler.GetChatAttachments)
		supportAgent.POST("/chats/:id/attachments", supportAgentDBHandler.AddChatAttachment)
		supportAgent.DELETE("/chats/:id/attachments/:attachmentId", supportAgentDBHandler.DeleteChatAttachment)

		// Agent Performance
		supportAgent.GET("/performance/me", supportAgentDBHandler.GetAgentPerformance)
		supportAgent.GET("/performance/team", supportAgentDBHandler.GetTeamPerformance)

		// SLA Breaches
		supportAgent.GET("/sla-breaches", supportAgentDBHandler.GetSLABreaches)
		supportAgent.POST("/sla-breaches/:id/acknowledge", supportAgentDBHandler.AcknowledgeSLABreach)
		supportAgent.GET("/sla-breaches/unacknowledged/count", supportAgentDBHandler.GetUnacknowledgedBreachCount)

		// Activity Logs
		supportAgent.GET("/activity-logs", supportAgentDBHandler.GetActivityLogs)
		supportAgent.GET("/activity-logs/me", supportAgentDBHandler.GetMyActivityLogs)

		// Announcements
		supportAgent.GET("/announcements", supportAgentDBHandler.GetAnnouncements)
		supportAgent.POST("/announcements", supportAgentDBHandler.CreateAnnouncement)
		supportAgent.POST("/announcements/:id/read", supportAgentDBHandler.MarkAnnouncementRead)
		supportAgent.DELETE("/announcements/:id", supportAgentDBHandler.DeleteAnnouncement)

		// FAQ Categories
		supportAgent.GET("/faq-categories", supportAgentDBHandler.GetFAQCategories)
		supportAgent.POST("/faq-categories", supportAgentDBHandler.CreateFAQCategory)
		supportAgent.PUT("/faq-categories/:id", supportAgentDBHandler.UpdateFAQCategory)
		supportAgent.DELETE("/faq-categories/:id", supportAgentDBHandler.DeleteFAQCategory)

		// Internal Chat Rooms
		supportAgent.GET("/chat-rooms", supportAgentDBHandler.GetChatRooms)
		supportAgent.POST("/chat-rooms", supportAgentDBHandler.CreateChatRoom)
		supportAgent.GET("/chat-rooms/:id/messages", supportAgentDBHandler.GetChatRoomMessages)
		supportAgent.POST("/chat-rooms/:id/messages", supportAgentDBHandler.SendChatRoomMessage)
		supportAgent.POST("/chat-rooms/:id/join", supportAgentDBHandler.JoinChatRoom)
		supportAgent.POST("/chat-rooms/:id/leave", supportAgentDBHandler.LeaveChatRoom)

		// Chat Reactions & Mentions
		supportAgent.POST("/messages/:messageId/reactions", supportAgentDBHandler.AddReaction)
		supportAgent.DELETE("/messages/:messageId/reactions/:emoji", supportAgentDBHandler.RemoveReaction)
		supportAgent.GET("/mentions/unread", supportAgentDBHandler.GetUnreadMentions)
		supportAgent.POST("/mentions/read", supportAgentDBHandler.MarkMentionsRead)

		// Agent Sessions
		supportAgent.GET("/sessions", supportAgentDBHandler.GetAgentSessions)
		supportAgent.DELETE("/sessions/:id", supportAgentDBHandler.InvalidateAgentSession)
		supportAgent.DELETE("/sessions", supportAgentDBHandler.InvalidateAllAgentSessions)

		// Login History
		supportAgent.GET("/login-history", supportAgentDBHandler.GetAgentLoginHistory)

		// API Tokens
		supportAgent.GET("/api-tokens", supportAgentDBHandler.GetAPITokens)
		supportAgent.POST("/api-tokens", supportAgentDBHandler.CreateAPIToken)
		supportAgent.DELETE("/api-tokens/:id", supportAgentDBHandler.RevokeAPIToken)

		// Webhooks
		supportAgent.GET("/webhooks", supportAgentDBHandler.GetWebhooks)
		supportAgent.POST("/webhooks", supportAgentDBHandler.CreateWebhook)
		supportAgent.DELETE("/webhooks/:id", supportAgentDBHandler.DeleteWebhook)

		// Global Search
		supportAgent.GET("/search", supportAgentDBHandler.GlobalSearch)

		// Keyboard Shortcuts
		supportAgent.GET("/shortcuts", supportAgentDBHandler.GetKeyboardShortcuts)
		supportAgent.PUT("/shortcuts", supportAgentDBHandler.UpdateKeyboardShortcut)
		supportAgent.DELETE("/shortcuts/:action", supportAgentDBHandler.ResetKeyboardShortcut)

		// Video Calls
		supportAgent.GET("/video-calls", supportAgentDBHandler.GetVideoCalls)
		supportAgent.POST("/video-calls", supportAgentDBHandler.ScheduleVideoCall)
		supportAgent.PUT("/video-calls/:id/status", supportAgentDBHandler.UpdateVideoCallStatus)

		// AI Suggestions
		supportAgent.GET("/tickets/:id/ai-suggestions", supportAgentDBHandler.GetAISuggestions)
		supportAgent.POST("/ai-suggestions/:id/use", supportAgentDBHandler.MarkAISuggestionUsed)

		// Roles & Permissions
		supportAgent.GET("/roles", supportAgentDBHandler.GetSupportRoles)
		supportAgent.GET("/roles/me", supportAgentDBHandler.GetAgentRoles)
		supportAgent.POST("/roles/assign", supportAgentDBHandler.AssignRole)
		supportAgent.POST("/roles/remove", supportAgentDBHandler.RemoveRole)
		supportAgent.GET("/permissions", supportAgentDBHandler.GetSupportPermissions)

		// Auto Assignment Rules
		supportAgent.GET("/assignment-rules", supportAgentDBHandler.GetAutoAssignmentRules)
		supportAgent.POST("/assignment-rules", supportAgentDBHandler.CreateAutoAssignmentRule)
		supportAgent.POST("/assignment-rules/:id/toggle", supportAgentDBHandler.ToggleAutoAssignmentRule)
		supportAgent.DELETE("/assignment-rules/:id", supportAgentDBHandler.DeleteAutoAssignmentRule)

		// Agent Workload
		supportAgent.GET("/workload", supportAgentDBHandler.GetAgentWorkload)
		supportAgent.PUT("/workload", supportAgentDBHandler.UpdateAgentWorkload)

		// Data Exports
		supportAgent.GET("/exports", supportAgentDBHandler.GetDataExports)
		supportAgent.POST("/exports", supportAgentDBHandler.CreateDataExport)

		// CSAT/NPS Surveys
		supportAgent.GET("/surveys/csat", supportAgentDBHandler.GetCSATSurveys)
		supportAgent.GET("/surveys/nps", supportAgentDBHandler.GetNPSScores)
		supportAgent.GET("/surveys/nps/summary", supportAgentDBHandler.GetNPSSummary)

		// Saved Filters
		supportAgent.GET("/filters", supportAgentDBHandler.GetSavedFilters)
		supportAgent.POST("/filters", supportAgentDBHandler.CreateSavedFilter)
		supportAgent.DELETE("/filters/:id", supportAgentDBHandler.DeleteSavedFilter)
		supportAgent.POST("/filters/:id/use", supportAgentDBHandler.UseSavedFilter)

		// Dashboard Widgets
		supportAgent.GET("/widgets", supportAgentDBHandler.GetDashboardWidgets)
		supportAgent.POST("/widgets", supportAgentDBHandler.SaveDashboardWidget)
		supportAgent.PUT("/widgets/:id", supportAgentDBHandler.UpdateDashboardWidget)
		supportAgent.DELETE("/widgets/:id", supportAgentDBHandler.DeleteDashboardWidget)

		// Typing Indicators
		supportAgent.POST("/typing", supportAgentDBHandler.SetTypingIndicator)
		supportAgent.GET("/typing", supportAgentDBHandler.GetTypingIndicators)
	}

	// ============ RUTAS ACCOUNTANT (CONTADOR) ============
	accountantRepo := repositories.NewAccountantRepository(db.Pool)
	accountantDBHandler := handlers.NewAccountantDBHandler(accountantRepo)
	accountant := api.Group("/accountant")
	accountant.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Dashboard
		accountant.GET("/dashboard/stats", accountantDBHandler.GetDashboardStats)

		// Withdrawals
		accountant.GET("/withdrawals", accountantDBHandler.GetWithdrawals)
		accountant.GET("/withdrawals/:id", accountantDBHandler.GetWithdrawalByID)
		accountant.POST("/withdrawals/:id/approve", accountantDBHandler.ApproveWithdrawal)
		accountant.POST("/withdrawals/:id/reject", accountantDBHandler.RejectWithdrawal)

		// Deposits
		accountant.GET("/deposits", accountantDBHandler.GetDeposits)
		accountant.POST("/deposits/:id/confirm", accountantDBHandler.ConfirmDeposit)
		accountant.POST("/deposits/:id/reject", accountantDBHandler.RejectDeposit)

		// Tournament Prizes
		accountant.GET("/prizes", accountantDBHandler.GetTournamentPrizes)
		accountant.POST("/prizes/:id/pay", accountantDBHandler.PayPrize)

		// User Financial Profiles
		accountant.GET("/users/financial", accountantDBHandler.GetUserFinancialProfiles)
		accountant.POST("/users/:userId/balance/adjust", accountantDBHandler.AdjustUserBalance)

		// Commissions
		accountant.GET("/commissions", accountantDBHandler.GetCommissions)
		accountant.GET("/commissions/types", accountantDBHandler.GetCommissionTypes)

		// Invoices
		accountant.GET("/invoices", accountantDBHandler.GetInvoices)
		accountant.POST("/invoices", accountantDBHandler.CreateInvoice)
		accountant.POST("/invoices/:id/pay", accountantDBHandler.MarkInvoicePaid)

		// Vendors
		accountant.GET("/vendors", accountantDBHandler.GetVendors)
		accountant.POST("/vendors", accountantDBHandler.CreateVendor)

		// Bank Accounts
		accountant.GET("/bank-accounts", accountantDBHandler.GetBankAccounts)

		// Reconciliations
		accountant.GET("/reconciliations", accountantDBHandler.GetReconciliations)
		accountant.POST("/reconciliations", accountantDBHandler.CreateReconciliation)
		accountant.POST("/reconciliations/:id/resolve", accountantDBHandler.ResolveReconciliation)

		// Financial Reports
		accountant.GET("/reports", accountantDBHandler.GetFinancialReports)
		accountant.POST("/reports/generate", accountantDBHandler.GenerateFinancialReport)

		// Daily/Monthly Summaries
		accountant.GET("/summaries/daily", accountantDBHandler.GetDailySummaries)
		accountant.GET("/summaries/monthly", accountantDBHandler.GetMonthlySummaries)

		// Audit Logs
		accountant.GET("/audit-logs", accountantDBHandler.GetAuditLogs)

		// Suspicious Alerts
		accountant.GET("/alerts", accountantDBHandler.GetSuspiciousAlerts)
		accountant.POST("/alerts/:id/review", accountantDBHandler.ReviewAlert)
		accountant.POST("/alerts/:id/escalate", accountantDBHandler.EscalateAlert)

		// Fraud Investigations
		accountant.GET("/investigations", accountantDBHandler.GetFraudInvestigations)
		accountant.POST("/investigations", accountantDBHandler.CreateFraudInvestigation)
		accountant.POST("/investigations/:id/close", accountantDBHandler.CloseFraudInvestigation)

		// Settings
		accountant.GET("/settings", accountantDBHandler.GetAccountantSettings)
		accountant.PUT("/settings", accountantDBHandler.UpdateAccountantSettings)

		// Notifications
		accountant.GET("/notifications", accountantDBHandler.GetAccountantNotifications)
		accountant.POST("/notifications/:id/read", accountantDBHandler.MarkAccountantNotificationRead)
		accountant.GET("/notifications/unread/count", accountantDBHandler.GetUnreadNotificationCount)

		// Platform Metrics
		accountant.GET("/metrics", accountantDBHandler.GetPlatformMetrics)

		// Expense Categories
		accountant.GET("/expense-categories", accountantDBHandler.GetExpenseCategories)

		// Operating Expenses
		accountant.GET("/expenses", accountantDBHandler.GetOperatingExpenses)
		accountant.POST("/expenses", accountantDBHandler.CreateOperatingExpense)
		accountant.POST("/expenses/:id/approve", accountantDBHandler.ApproveExpense)

		// Payment Providers
		accountant.GET("/payment-providers", accountantDBHandler.GetPaymentProviders)

		// Tasks
		accountant.GET("/tasks", accountantDBHandler.GetAccountantTasks)
		accountant.POST("/tasks", accountantDBHandler.CreateAccountantTask)
		accountant.POST("/tasks/:id/complete", accountantDBHandler.CompleteTask)

		// Cash Flow
		accountant.GET("/cash-flow", accountantDBHandler.GetCashFlowRecords)

		// Data Exports
		accountant.GET("/exports", accountantDBHandler.GetDataExports)
		accountant.POST("/exports", accountantDBHandler.CreateDataExport)
	}

	// ============ RUTAS OPERATOR (OPERADOR) ============
	operatorRepo := repositories.NewOperatorRepository(db.Pool)
	operatorDBHandler := handlers.NewOperatorDBHandler(operatorRepo)
	operator := api.Group("/operator")
	operator.Use(middleware.AuthMiddleware(jwtManager))
	{
		// Dashboard
		operator.GET("/dashboard/stats", operatorDBHandler.GetDashboardStats)

		// Operators Management
		operator.GET("/operators", operatorDBHandler.GetOperators)
		operator.GET("/operators/:id", operatorDBHandler.GetOperatorByID)
		operator.GET("/me", operatorDBHandler.GetMyProfile)
		operator.PUT("/status", operatorDBHandler.UpdateOperatorStatus)

		// Sessions
		operator.GET("/sessions", operatorDBHandler.GetOperatorSessions)
		operator.DELETE("/sessions/:id", operatorDBHandler.InvalidateOperatorSession)
		operator.DELETE("/sessions", operatorDBHandler.InvalidateAllOperatorSessions)

		// Settings
		operator.GET("/settings", operatorDBHandler.GetOperatorSettings)
		operator.PUT("/settings", operatorDBHandler.UpdateOperatorSettings)

		// Work Schedule
		operator.GET("/schedule", operatorDBHandler.GetOperatorWorkSchedule)
		operator.PUT("/schedule", operatorDBHandler.UpdateOperatorWorkSchedule)

		// Roles & Permissions
		operator.GET("/roles", operatorDBHandler.GetOperatorRoles)
		operator.GET("/roles/me", operatorDBHandler.GetMyRoles)
		operator.POST("/roles/assign", operatorDBHandler.AssignRole)
		operator.POST("/roles/remove", operatorDBHandler.RemoveRole)
		operator.GET("/permissions", operatorDBHandler.GetAllPermissions)
		operator.GET("/permissions/me", operatorDBHandler.GetMyPermissions)

		// ========== PART 2: Tournament Management ==========
		operator.GET("/tournaments/actions", operatorDBHandler.GetTournamentActions)
		operator.POST("/tournaments/actions", operatorDBHandler.LogTournamentAction)
		operator.GET("/tournaments/assignments", operatorDBHandler.GetMyTournamentAssignments)
		operator.POST("/tournaments/assign", operatorDBHandler.AssignTournament)
		operator.GET("/tournaments/disqualifications", operatorDBHandler.GetDisqualifications)
		operator.POST("/tournaments/disqualify", operatorDBHandler.DisqualifyParticipant)
		operator.POST("/tournaments/add-user", operatorDBHandler.AddUserToTournament)

		// ========== PART 2: User Management ==========
		operator.GET("/users/:userId/notes", operatorDBHandler.GetUserNotes)
		operator.POST("/users/:userId/notes", operatorDBHandler.AddUserNote)
		operator.DELETE("/users/:userId/notes/:noteId", operatorDBHandler.DeleteUserNote)
		operator.GET("/balance-adjustments", operatorDBHandler.GetBalanceAdjustments)
		operator.POST("/balance-adjustments", operatorDBHandler.CreateBalanceAdjustment)
		operator.POST("/balance-adjustments/:id/approve", operatorDBHandler.ApproveBalanceAdjustment)
		operator.POST("/balance-adjustments/:id/reject", operatorDBHandler.RejectBalanceAdjustment)
		operator.GET("/users/:userId/status-changes", operatorDBHandler.GetUserStatusChanges)
		operator.POST("/users/:userId/status", operatorDBHandler.ChangeUserStatus)
		operator.GET("/users/:userId/trading-blocks", operatorDBHandler.GetTradingBlocks)
		operator.POST("/users/:userId/trading-blocks", operatorDBHandler.CreateTradingBlock)
		operator.DELETE("/users/:userId/trading-blocks/:blockId", operatorDBHandler.RemoveTradingBlock)
		operator.GET("/users/:userId/risk-assessments", operatorDBHandler.GetRiskAssessments)
		operator.POST("/users/:userId/risk-assessments", operatorDBHandler.CreateRiskAssessment)
		operator.GET("/monitored-users", operatorDBHandler.GetMonitoredUsers)
		operator.POST("/monitored-users", operatorDBHandler.AddMonitoredUser)
		operator.DELETE("/monitored-users/:id", operatorDBHandler.RemoveMonitoredUser)

		// ========== PART 3: Trade Control ==========
		operator.GET("/trade-interventions", operatorDBHandler.GetTradeInterventions)
		operator.POST("/trade-interventions", operatorDBHandler.CreateTradeIntervention)
		operator.POST("/trade-interventions/:id/revert", operatorDBHandler.RevertTradeIntervention)
		operator.GET("/trade-flags", operatorDBHandler.GetTradeFlags)
		operator.POST("/trade-flags", operatorDBHandler.CreateTradeFlag)
		operator.POST("/trade-flags/:id/resolve", operatorDBHandler.ResolveTradeFlag)
		operator.POST("/trade-flags/:id/dismiss", operatorDBHandler.DismissTradeFlag)
		operator.POST("/trade-flags/:id/escalate", operatorDBHandler.EscalateTradeFlag)
		operator.GET("/trade-cancellations", operatorDBHandler.GetTradeCancellations)
		operator.POST("/trade-cancellations", operatorDBHandler.CreateTradeCancellation)
		operator.POST("/trade-cancellations/:id/process", operatorDBHandler.ProcessTradeCancellation)
		operator.GET("/forced-results", operatorDBHandler.GetForcedTradeResults)
		operator.POST("/forced-results", operatorDBHandler.CreateForcedTradeResult)
		operator.POST("/forced-results/:id/approve", operatorDBHandler.ApproveForcedResult)
		operator.POST("/forced-results/:id/revert", operatorDBHandler.RevertForcedResult)
		operator.GET("/trade-review-queue", operatorDBHandler.GetTradeReviewQueue)
		operator.POST("/trade-review-queue/:id/assign", operatorDBHandler.AssignTradeReview)
		operator.POST("/trade-review-queue/:id/complete", operatorDBHandler.CompleteTradeReview)
		operator.GET("/trade-patterns", operatorDBHandler.GetTradePatterns)
		operator.POST("/trade-patterns", operatorDBHandler.ReportTradePattern)
		operator.PUT("/trade-patterns/:id", operatorDBHandler.UpdatePatternStatus)
		operator.GET("/trade-limit-overrides", operatorDBHandler.GetTradeLimitOverrides)
		operator.POST("/trade-limit-overrides", operatorDBHandler.CreateTradeLimitOverride)
		operator.DELETE("/trade-limit-overrides/:id", operatorDBHandler.DeactivateTradeLimitOverride)

		// ========== PART 4: Alert System ==========
		operator.GET("/alerts", operatorDBHandler.GetOperatorAlerts)
		operator.GET("/alerts/:id", operatorDBHandler.GetAlertByID)
		operator.POST("/alerts", operatorDBHandler.CreateOperatorAlert)
		operator.POST("/alerts/:id/acknowledge", operatorDBHandler.AcknowledgeAlert)
		operator.POST("/alerts/:id/assign", operatorDBHandler.AssignAlert)
		operator.POST("/alerts/:id/resolve", operatorDBHandler.ResolveAlert)
		operator.POST("/alerts/:id/dismiss", operatorDBHandler.DismissAlert)
		operator.POST("/alerts/:id/read", operatorDBHandler.MarkAlertRead)
		operator.GET("/alerts/unread/count", operatorDBHandler.GetUnreadAlertCount)
		operator.POST("/alerts/:id/escalate", operatorDBHandler.EscalateAlert)
		operator.GET("/alerts/:id/escalations", operatorDBHandler.GetAlertEscalations)
		operator.GET("/alerts/:id/comments", operatorDBHandler.GetAlertComments)
		operator.POST("/alerts/:id/comments", operatorDBHandler.AddAlertComment)
		operator.GET("/alert-rules", operatorDBHandler.GetAlertRules)
		operator.POST("/alert-rules", operatorDBHandler.CreateAlertRule)
		operator.POST("/alert-rules/:id/toggle", operatorDBHandler.ToggleAlertRule)
		operator.DELETE("/alert-rules/:id", operatorDBHandler.DeleteAlertRule)
		operator.GET("/alert-subscriptions", operatorDBHandler.GetAlertSubscriptions)
		operator.PUT("/alert-subscriptions", operatorDBHandler.UpdateAlertSubscription)
		operator.GET("/alert-stats", operatorDBHandler.GetAlertStats)

		// ========== PART 5: Asset Configuration ==========
		operator.GET("/asset-categories", operatorDBHandler.GetAssetCategories)
		operator.POST("/asset-categories", operatorDBHandler.CreateAssetCategory)
		operator.PUT("/asset-categories/:id", operatorDBHandler.UpdateAssetCategory)
		operator.GET("/trading-assets", operatorDBHandler.GetTradingAssets)
		operator.POST("/trading-assets", operatorDBHandler.CreateTradingAsset)
		operator.PUT("/trading-assets/:id", operatorDBHandler.UpdateTradingAsset)
		operator.POST("/trading-assets/:id/toggle", operatorDBHandler.ToggleAssetStatus)
		operator.GET("/trading-assets/:id/payout-rules", operatorDBHandler.GetAssetPayoutRules)
		operator.POST("/trading-assets/:id/payout-rules", operatorDBHandler.CreateAssetPayoutRule)
		operator.DELETE("/trading-assets/:id/payout-rules/:ruleId", operatorDBHandler.DeleteAssetPayoutRule)

		// ========== PART 5: Team Chat ==========
		operator.GET("/chat/channels", operatorDBHandler.GetChatChannels)
		operator.POST("/chat/channels", operatorDBHandler.CreateChatChannel)
		operator.POST("/chat/channels/:id/join", operatorDBHandler.JoinChatChannel)
		operator.POST("/chat/channels/:id/leave", operatorDBHandler.LeaveChatChannel)
		operator.GET("/chat/channels/:id/messages", operatorDBHandler.GetChannelMessages)
		operator.POST("/chat/channels/:id/messages", operatorDBHandler.SendChannelMessage)
		operator.PUT("/chat/messages/:messageId", operatorDBHandler.EditChannelMessage)
		operator.DELETE("/chat/messages/:messageId", operatorDBHandler.DeleteChannelMessage)
		operator.POST("/chat/messages/:messageId/pin", operatorDBHandler.PinChannelMessage)
		operator.POST("/chat/messages/:messageId/reactions", operatorDBHandler.AddChatMessageReaction)
		operator.DELETE("/chat/messages/:messageId/reactions/:emoji", operatorDBHandler.RemoveChatMessageReaction)
		operator.GET("/chat/dm/:operatorId", operatorDBHandler.GetDirectMessages)
		operator.POST("/chat/dm/:operatorId", operatorDBHandler.SendDirectMessage)
		operator.POST("/chat/dm/:operatorId/read", operatorDBHandler.MarkDirectMessagesRead)
		operator.GET("/chat/dm/unread/count", operatorDBHandler.GetUnreadDMCount)

		// ========== PART 6: Activity Logs ==========
		operator.GET("/activity-logs", operatorDBHandler.GetActivityLogs)
		operator.GET("/activity-logs/me", operatorDBHandler.GetMyActivityLogs)
		operator.GET("/audit-trail", operatorDBHandler.GetAuditTrail)
		operator.GET("/login-attempts", operatorDBHandler.GetLoginAttempts)

		// ========== PART 6: Real-time Monitoring ==========
		operator.GET("/monitoring/metrics", operatorDBHandler.GetPlatformMetrics)
		operator.GET("/monitoring/metrics/latest", operatorDBHandler.GetLatestMetrics)
		operator.GET("/monitoring/users", operatorDBHandler.GetActiveUsersMonitor)
		operator.GET("/monitoring/trades", operatorDBHandler.GetActiveTradesMonitor)
		operator.GET("/monitoring/health", operatorDBHandler.GetSystemHealth)
		operator.GET("/monitoring/realtime-alerts", operatorDBHandler.GetRealtimeAlerts)
		operator.GET("/monitoring/thresholds", operatorDBHandler.GetMonitoringThresholds)
		operator.POST("/monitoring/thresholds", operatorDBHandler.CreateMonitoringThreshold)
		operator.PUT("/monitoring/thresholds/:id", operatorDBHandler.UpdateMonitoringThreshold)
		operator.DELETE("/monitoring/thresholds/:id", operatorDBHandler.DeleteMonitoringThreshold)
		operator.GET("/monitoring/summary", operatorDBHandler.GetMonitoringSummary)

		// Part 7: Reports
		operator.GET("/reports", operatorDBHandler.GetReports)
		operator.POST("/reports", operatorDBHandler.CreateReport)
		operator.GET("/report-templates", operatorDBHandler.GetReportTemplates)
		operator.GET("/summaries/daily", operatorDBHandler.GetDailySummaries)
		operator.GET("/summaries/monthly", operatorDBHandler.GetMonthlySummaries)
		operator.GET("/performance-metrics", operatorDBHandler.GetOperatorPerformanceMetrics)
		operator.GET("/exports", operatorDBHandler.GetDataExports)
		operator.POST("/exports", operatorDBHandler.CreateDataExport)
		operator.GET("/dashboards", operatorDBHandler.GetCustomDashboards)
		operator.POST("/dashboards", operatorDBHandler.CreateCustomDashboard)
		operator.PUT("/dashboards/:id", operatorDBHandler.UpdateCustomDashboard)
		operator.DELETE("/dashboards/:id", operatorDBHandler.DeleteCustomDashboard)

		// Part 8: Security
		operator.GET("/security/sessions", operatorDBHandler.GetSecuritySessions)
		operator.DELETE("/security/sessions/:id", operatorDBHandler.TerminateSecuritySession)
		operator.DELETE("/security/sessions", operatorDBHandler.TerminateAllSecuritySessions)
		operator.GET("/security/login-history", operatorDBHandler.GetSecurityLoginHistory)
		operator.GET("/security/api-tokens", operatorDBHandler.GetAPITokens)
		operator.POST("/security/api-tokens", operatorDBHandler.CreateAPIToken)
		operator.DELETE("/security/api-tokens/:id", operatorDBHandler.RevokeAPIToken)
		operator.GET("/security/settings", operatorDBHandler.GetSecuritySettings)
		operator.PUT("/security/settings", operatorDBHandler.UpdateSecuritySettings)
		operator.GET("/security/ip-blocks", operatorDBHandler.GetIPBlocks)
		operator.POST("/security/ip-blocks", operatorDBHandler.CreateIPBlock)
		operator.DELETE("/security/ip-blocks/:id", operatorDBHandler.RemoveIPBlock)
		operator.GET("/security/events", operatorDBHandler.GetSecurityEvents)
		operator.POST("/security/events/:id/resolve", operatorDBHandler.ResolveSecurityEvent)
		operator.GET("/security/trusted-devices", operatorDBHandler.GetTrustedDevices)
		operator.DELETE("/security/trusted-devices/:id", operatorDBHandler.RemoveTrustedDevice)
		operator.GET("/security/password-policies", operatorDBHandler.GetPasswordPolicies)

		// Part 9: Notifications & Statistics
		operator.GET("/notifications", operatorDBHandler.GetOperatorNotifications)
		operator.GET("/notifications/unread/count", operatorDBHandler.GetUnreadNotificationCount)
		operator.POST("/notifications/:id/read", operatorDBHandler.MarkNotificationRead)
		operator.POST("/notifications/read-all", operatorDBHandler.MarkAllNotificationsRead)
		operator.POST("/notifications/:id/archive", operatorDBHandler.ArchiveNotification)
		operator.DELETE("/notifications/:id", operatorDBHandler.DeleteNotification)
		operator.GET("/notification-preferences", operatorDBHandler.GetNotificationPreferences)
		operator.PUT("/notification-preferences", operatorDBHandler.UpdateNotificationPreferences)
		operator.GET("/stats/platform", operatorDBHandler.GetPlatformStats)
		operator.GET("/stats/kpis", operatorDBHandler.GetKPIs)
		operator.GET("/stats/assets", operatorDBHandler.GetAssetStats)
		operator.GET("/stats/trading", operatorDBHandler.GetTradingStatsAggregate)
		operator.GET("/stats/financial", operatorDBHandler.GetFinancialStatsAggregate)

		// Part 10: Final Features
		operator.GET("/search-history", operatorDBHandler.GetSearchHistory)
		operator.POST("/search-history", operatorDBHandler.SaveSearchHistory)
		operator.DELETE("/search-history", operatorDBHandler.ClearSearchHistory)
		operator.GET("/quick-access", operatorDBHandler.GetQuickAccess)
		operator.POST("/quick-access", operatorDBHandler.AddQuickAccess)
		operator.DELETE("/quick-access/:id", operatorDBHandler.RemoveQuickAccess)
		operator.POST("/quick-access/:id/pin", operatorDBHandler.ToggleQuickAccessPin)
		operator.GET("/webhooks", operatorDBHandler.GetWebhooks)
		operator.POST("/webhooks", operatorDBHandler.CreateWebhook)
		operator.PUT("/webhooks/:id", operatorDBHandler.UpdateWebhook)
		operator.DELETE("/webhooks/:id", operatorDBHandler.DeleteWebhook)
		operator.GET("/quick-notes", operatorDBHandler.GetQuickNotes)
		operator.POST("/quick-notes", operatorDBHandler.CreateQuickNote)
		operator.PUT("/quick-notes/:id", operatorDBHandler.UpdateQuickNote)
		operator.DELETE("/quick-notes/:id", operatorDBHandler.DeleteQuickNote)
		operator.GET("/tasks", operatorDBHandler.GetOperatorTasks)
		operator.POST("/tasks", operatorDBHandler.CreateOperatorTask)
		operator.PUT("/tasks/:id/status", operatorDBHandler.UpdateOperatorTaskStatus)
		operator.DELETE("/tasks/:id", operatorDBHandler.DeleteOperatorTask)
		operator.GET("/keyboard-shortcuts", operatorDBHandler.GetKeyboardShortcuts)
		operator.PUT("/keyboard-shortcuts", operatorDBHandler.UpdateKeyboardShortcut)
		operator.GET("/quick-responses", operatorDBHandler.GetQuickResponses)
		operator.POST("/quick-responses", operatorDBHandler.CreateQuickResponse)
		operator.DELETE("/quick-responses/:id", operatorDBHandler.DeleteQuickResponse)
	}

	log.Println("Servidor iniciado en http://localhost:" + cfg.ServerPort)
	r.Run(":" + cfg.ServerPort)
}

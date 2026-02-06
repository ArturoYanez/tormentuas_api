import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor para manejar errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth';
    }
    return Promise.reject(error);
  }
);

// Tipos para trading
interface PlaceTradeData {
  symbol: string;
  direction: string;
  amount: number;
  duration: number;
  is_demo?: boolean;
}

// Auth
export const authAPI = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { email, password }),
  register: (data: { email: string; password: string; first_name: string; last_name: string }) => 
    api.post('/auth/register', data),
  getProfile: () => 
    api.get('/protected/profile')
};

// Trading
export const tradingAPI = {
  getPrices: () => api.get('/prices'),
  getPrice: (symbol: string) => api.get(`/prices/${symbol}`),
  getMarkets: () => api.get('/markets'),
  getMarketPrices: (market: string) => api.get(`/markets/${market}/prices`),
  getCandles: (symbol: string, timeframe?: string, limit?: number) => 
    api.get(`/candles/${encodeURIComponent(symbol)}`, { params: { timeframe, limit } }),
  placeTrade: (data: PlaceTradeData) => api.post('/protected/trades', data),
  getActiveTrades: () => api.get('/protected/trades/active'),
  getTradeHistory: (limit?: number, offset?: number) => 
    api.get('/protected/trades/history', { params: { limit, offset } }),
  getTradeStats: () => api.get('/protected/trades/stats'),
  cancelTrade: (id: number) => api.delete(`/protected/trades/${id}`)
};

// Verification
export const verificationAPI = {
  getStatus: () => api.get('/protected/verification/status'),
  check: () => api.get('/protected/verification/check'),
  submit: (data: { document_type: string; document_front: string; document_back?: string; selfie_with_doc: string }) => 
    api.post('/protected/verification/submit', data)
};

// Tournaments
export const tournamentAPI = {
  getAll: (status?: string) => api.get('/tournaments', { params: { status } }),
  getOne: (id: number) => api.get(`/tournaments/${id}`),
  getLeaderboard: (id: number, limit?: number) => api.get(`/tournaments/${id}/leaderboard`, { params: { limit } }),
  join: (id: number) => api.post(`/protected/tournaments/${id}/join`),
  getMyTournaments: () => api.get('/protected/tournaments/my'),
  getMyParticipation: (id: number) => api.get(`/protected/tournaments/${id}/participation`),
  rebuy: (id: number) => api.post(`/protected/tournaments/${id}/rebuy`),
  getPrizeDistribution: () => api.get('/tournaments/prizes')
};

// Admin
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  getPendingVerifications: () => api.get('/admin/verifications/pending'),
  approveVerification: (userId: number) => api.post('/admin/verifications/approve', { user_id: userId }),
  rejectVerification: (userId: number, reason: string) => 
    api.post('/admin/verifications/reject', { user_id: userId, reason })
};

// Wallet
export const walletAPI = {
  getSummary: () => api.get('/protected/wallet/summary'),
  getWallets: () => api.get('/protected/wallet/wallets'),
  getTransactions: (type?: string, limit?: number, offset?: number) => 
    api.get('/protected/wallet/transactions', { params: { type, limit, offset } }),
  getDepositAddress: (currency: string, network: string) => 
    api.get('/protected/wallet/deposit-address', { params: { currency, network } }),
  getCryptoOptions: () => api.get('/protected/wallet/crypto-options'),
  requestWithdrawal: (data: { amount: number; currency: string; network?: string; address: string }) => 
    api.post('/protected/wallet/withdraw', data),
  getWithdrawals: (status?: string, limit?: number, offset?: number) => 
    api.get('/protected/wallet/withdrawals', { params: { status, limit, offset } }),
  cancelWithdrawal: (id: number) => api.delete(`/protected/wallet/withdrawals/${id}`)
};

// Profile
export const profileAPI = {
  getProfile: () => api.get('/protected/profile'),
  updateProfile: (data: { first_name?: string; last_name?: string; phone?: string; country?: string }) => 
    api.put('/protected/profile', data),
  changePassword: (data: { current_password: string; new_password: string }) => 
    api.post('/protected/profile/password', data),
  getStats: () => api.get('/protected/profile/stats'),
  getSettings: () => api.get('/protected/profile/settings'),
  updateSettings: (data: {
    theme?: string;
    language?: string;
    timezone?: string;
    currency?: string;
    sound_effects?: boolean;
    show_balance?: boolean;
    confirm_trades?: boolean;
    default_amount?: number;
    default_duration?: number;
  }) => api.put('/protected/profile/settings', data)
};

// Bonuses
export const bonusAPI = {
  getAvailable: () => api.get('/protected/bonuses'),
  getMyBonuses: (status?: string) => api.get('/protected/bonuses/my', { params: { status } }),
  getActive: () => api.get('/protected/bonuses/active'),
  getStats: () => api.get('/protected/bonuses/stats'),
  claim: (id: number) => api.post(`/protected/bonuses/${id}/claim`),
  applyPromo: (code: string) => api.post('/protected/bonuses/promo', { code }),
  cancel: (id: number) => api.delete(`/protected/bonuses/${id}`)
};

// Notifications
export const notificationAPI = {
  getAll: (type?: string, limit?: number, offset?: number) => 
    api.get('/protected/notifications', { params: { type, limit, offset } }),
  getUnreadCount: () => api.get('/protected/notifications/unread'),
  markAsRead: (id: number) => api.post(`/protected/notifications/${id}/read`),
  markAllAsRead: () => api.post('/protected/notifications/read-all'),
  delete: (id: number) => api.delete(`/protected/notifications/${id}`),
  deleteAll: () => api.delete('/protected/notifications'),
  getSettings: () => api.get('/protected/notifications/settings'),
  updateSettings: (data: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    sms_enabled?: boolean;
    trades_enabled?: boolean;
    deposits_enabled?: boolean;
    withdrawals_enabled?: boolean;
    promotions_enabled?: boolean;
    news_enabled?: boolean;
    price_alerts_enabled?: boolean;
  }) => api.put('/protected/notifications/settings', data),
  getPriceAlerts: () => api.get('/protected/notifications/alerts'),
  createPriceAlert: (data: { symbol: string; condition: string; price: number }) => 
    api.post('/protected/notifications/alerts', data),
  togglePriceAlert: (id: number) => api.post(`/protected/notifications/alerts/${id}/toggle`),
  deletePriceAlert: (id: number) => api.delete(`/protected/notifications/alerts/${id}`)
};

// Referrals
export const referralAPI = {
  getStats: () => api.get('/protected/referrals/stats'),
  getReferrals: () => api.get('/protected/referrals'),
  getCommissions: (status?: string, limit?: number, offset?: number) => 
    api.get('/protected/referrals/commissions', { params: { status, limit, offset } }),
  getTiers: () => api.get('/protected/referrals/tiers'),
  getCode: () => api.get('/protected/referrals/code')
};

// Academy
export const academyAPI = {
  getCourses: (category?: string, level?: string) => 
    api.get('/protected/academy/courses', { params: { category, level } }),
  getCourse: (id: number) => api.get(`/protected/academy/courses/${id}`),
  getCourseLessons: (courseId: number) => api.get(`/protected/academy/courses/${courseId}/lessons`),
  markLessonComplete: (lessonId: number) => api.post(`/protected/academy/lessons/${lessonId}/complete`),
  getVideos: (category?: string) => api.get('/protected/academy/videos', { params: { category } }),
  incrementVideoViews: (id: number) => api.post(`/protected/academy/videos/${id}/view`),
  getGlossary: (search?: string) => api.get('/protected/academy/glossary', { params: { search } }),
  getStats: () => api.get('/protected/academy/stats')
};

// Support
export const supportAPI = {
  createTicket: (data: { subject: string; description: string; category: string; priority?: string }) => 
    api.post('/protected/support/tickets', data),
  getTickets: (status?: string, limit?: number, offset?: number) => 
    api.get('/protected/support/tickets', { params: { status, limit, offset } }),
  getTicket: (id: number) => api.get(`/protected/support/tickets/${id}`),
  closeTicket: (id: number) => api.post(`/protected/support/tickets/${id}/close`),
  addMessage: (ticketId: number, message: string) => 
    api.post(`/protected/support/tickets/${ticketId}/messages`, { message }),
  getStats: () => api.get('/protected/support/stats'),
  // Live Chat
  startChat: () => api.post('/protected/support/chat/start'),
  sendChatMessage: (sessionId: string, message: string) => 
    api.post('/protected/support/chat/message', { session_id: sessionId, message }),
  endChat: (sessionId: string) => api.post('/protected/support/chat/end', { session_id: sessionId }),
  getChatHistory: (sessionId: string) => api.get(`/protected/support/chat/${sessionId}/history`)
};

// Watchlist
export const watchlistAPI = {
  get: () => api.get('/protected/watchlist'),
  addSymbol: (symbol: string) => api.post('/protected/watchlist/add', { symbol }),
  removeSymbol: (symbol: string) => api.post('/protected/watchlist/remove', { symbol })
};

// Chart - Dibujos, Favoritos, Layouts, Indicadores
export const chartAPI = {
  // Drawings
  getDrawings: (symbol: string) => api.get('/protected/chart/drawings', { params: { symbol } }),
  createDrawing: (data: { symbol: string; type: string; data: object; color: string }) => 
    api.post('/protected/chart/drawings', data),
  deleteDrawing: (id: number) => api.delete(`/protected/chart/drawings/${id}`),
  clearDrawings: (symbol: string) => api.delete('/protected/chart/drawings', { params: { symbol } }),
  
  // Favorites
  getFavorites: () => api.get('/protected/chart/favorites'),
  addFavorite: (symbol: string) => api.post('/protected/chart/favorites', { symbol }),
  removeFavorite: (symbol: string) => api.delete('/protected/chart/favorites', { data: { symbol } }),
  reorderFavorites: (symbols: string[]) => api.put('/protected/chart/favorites/reorder', { symbols }),
  
  // Layouts
  getLayouts: () => api.get('/protected/chart/layouts'),
  saveLayout: (data: { id?: number; name: string; symbol: string; timeframe: string; settings: object; is_default?: boolean }) => 
    api.post('/protected/chart/layouts', data),
  deleteLayout: (id: number) => api.delete(`/protected/chart/layouts/${id}`),
  setDefaultLayout: (id: number) => api.post(`/protected/chart/layouts/${id}/default`),
  
  // Indicators
  getIndicators: (symbol?: string) => api.get('/protected/chart/indicators', { params: { symbol } }),
  saveIndicator: (data: { id?: number; symbol: string; name: string; settings: object; enabled: boolean }) => 
    api.post('/protected/chart/indicators', data),
  toggleIndicator: (id: number) => api.post(`/protected/chart/indicators/${id}/toggle`),
  deleteIndicator: (id: number) => api.delete(`/protected/chart/indicators/${id}`),
  
  // Trade Markers
  getTradeMarkers: (symbol: string, limit?: number) => 
    api.get('/protected/chart/markers', { params: { symbol, limit } })
};

// Security - Sesiones, Historial de Login, Eventos de Seguridad
export const securityAPI = {
  // Sessions
  getActiveSessions: () => api.get('/protected/security/sessions'),
  invalidateSession: (sessionId: number) => api.post('/protected/security/sessions/invalidate', { session_id: sessionId }),
  invalidateAllSessions: () => api.post('/protected/security/sessions/invalidate-all'),
  
  // Login History
  getLoginHistory: () => api.get('/protected/security/login-history'),
  
  // Security Events
  getSecurityEvents: () => api.get('/protected/security/events'),

  // 2FA - Two Factor Authentication
  setup2FA: () => api.get('/protected/security/2fa/setup'),
  enable2FA: (secret: string, code: string) => api.post('/protected/security/2fa/enable', { secret, code }),
  disable2FA: (code?: string, password?: string) => api.post('/protected/security/2fa/disable', { code, password }),
  verify2FA: (secret: string, code: string) => api.post('/protected/security/2fa/verify', { secret, code }),

  // PIN - Security PIN
  getPinStatus: () => api.get('/protected/security/pin/status'),
  setupPin: (pin: string) => api.post('/protected/security/pin/setup', { pin }),
  verifyPin: (pin: string) => api.post('/protected/security/pin/verify', { pin }),
  disablePin: (pin: string) => api.post('/protected/security/pin/disable', { pin }),
  changePin: (currentPin: string, newPin: string) => api.post('/protected/security/pin/change', { current_pin: currentPin, new_pin: newPin })
};

// Support Agent Panel APIs
export const supportAgentAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/support-agent/dashboard/stats'),

  // Tickets
  getTickets: (status?: string, priority?: string, category?: string) => 
    api.get('/support-agent/tickets', { params: { status, priority, category } }),
  getTicket: (id: number) => api.get(`/support-agent/tickets/${id}`),
  updateTicket: (id: number, data: { status?: string; priority?: string; assigned_to?: string; tags?: string[] }) => 
    api.put(`/support-agent/tickets/${id}`, data),
  replyToTicket: (id: number, message: string) => 
    api.post(`/support-agent/tickets/${id}/reply`, { message }),
  addInternalNote: (id: number, note: string) => 
    api.post(`/support-agent/tickets/${id}/note`, { note }),
  escalateTicket: (id: number, escalateTo: string, reason: string) => 
    api.post(`/support-agent/tickets/${id}/escalate`, { escalate_to: escalateTo, reason }),

  // Live Chats
  getLiveChats: (status?: string) => api.get('/support-agent/chats', { params: { status } }),
  getLiveChat: (id: number) => api.get(`/support-agent/chats/${id}`),
  acceptChat: (id: number) => api.post(`/support-agent/chats/${id}/accept`),
  sendChatMessage: (id: number, message: string) => api.post(`/support-agent/chats/${id}/message`, { message }),
  endChat: (id: number) => api.post(`/support-agent/chats/${id}/end`),

  // FAQs
  getFAQs: (category?: string) => api.get('/support-agent/faqs', { params: { category } }),
  createFAQ: (data: { question: string; answer: string; category?: string; is_published?: boolean }) => 
    api.post('/support-agent/faqs', data),
  updateFAQ: (id: number, data: { question?: string; answer?: string; category?: string; is_published?: boolean }) => 
    api.put(`/support-agent/faqs/${id}`, data),
  deleteFAQ: (id: number) => api.delete(`/support-agent/faqs/${id}`),

  // Templates
  getTemplates: (category?: string) => api.get('/support-agent/templates', { params: { category } }),
  createTemplate: (data: { name: string; shortcut: string; category?: string; content: string; variables?: string[] }) => 
    api.post('/support-agent/templates', data),
  updateTemplate: (id: number, data: { name?: string; shortcut?: string; category?: string; content?: string }) =>
    api.put(`/support-agent/templates/${id}`, data),
  deleteTemplate: (id: number) => api.delete(`/support-agent/templates/${id}`),

  // Knowledge Base
  getKnowledgeArticles: (category?: string) => api.get('/support-agent/knowledge', { params: { category } }),
  createKnowledgeArticle: (data: { title: string; category?: string; content: string; tags?: string[]; is_published?: boolean }) => 
    api.post('/support-agent/knowledge', data),
  updateKnowledgeArticle: (id: number, data: { title?: string; category?: string; content?: string; tags?: string[]; is_published?: boolean }) =>
    api.put(`/support-agent/knowledge/${id}`, data),
  deleteKnowledgeArticle: (id: number) => api.delete(`/support-agent/knowledge/${id}`),

  // Users
  getUsers: (search?: string) => api.get('/support-agent/users', { params: { search } }),
  getUser: (id: number) => api.get(`/support-agent/users/${id}`),
  addUserNote: (id: number, note: string) => api.post(`/support-agent/users/${id}/note`, { note }),

  // Notifications
  getNotifications: (unreadOnly?: boolean) => api.get('/support-agent/notifications', { params: { unread_only: unreadOnly } }),
  getUnreadCount: () => api.get('/support-agent/notifications/unread'),
  markNotificationRead: (id: number) => api.post(`/support-agent/notifications/${id}/read`),
  markAllNotificationsRead: () => api.post('/support-agent/notifications/read-all'),

  // Canned Responses
  getCannedResponses: (category?: string) => api.get('/support-agent/canned-responses', { params: { category } }),
  createCannedResponse: (data: { shortcut: string; title: string; content: string; category?: string }) => 
    api.post('/support-agent/canned-responses', data),
  updateCannedResponse: (id: number, data: { shortcut?: string; title?: string; content?: string; category?: string }) =>
    api.put(`/support-agent/canned-responses/${id}`, data),
  deleteCannedResponse: (id: number) => api.delete(`/support-agent/canned-responses/${id}`),

  // Macros
  getMacros: () => api.get('/support-agent/macros'),
  createMacro: (data: { name: string; description?: string; actions: string }) => 
    api.post('/support-agent/macros', data),
  updateMacro: (id: number, data: { name?: string; description?: string; actions?: string }) =>
    api.put(`/support-agent/macros/${id}`, data),
  deleteMacro: (id: number) => api.delete(`/support-agent/macros/${id}`),

  // Agents
  getAgents: () => api.get('/support-agent/agents'),
  updateAgentStatus: (status: string, statusMessage?: string) => 
    api.put('/support-agent/agents/status', { status, status_message: statusMessage }),

  // Internal Chat
  getInternalMessages: (channel?: string) => api.get('/support-agent/internal/messages', { params: { channel } }),
  sendInternalMessage: (message: string, channel?: string, recipientId?: number) => 
    api.post('/support-agent/internal/messages', { message, channel: channel || 'general', recipient_id: recipientId }),

  // Settings
  getSettings: () => api.get('/support-agent/settings'),
  updateSettings: (settings: Record<string, unknown>) => api.put('/support-agent/settings', settings),

  // Reports
  getReportStats: (startDate?: string, endDate?: string) => 
    api.get('/support-agent/reports/stats', { params: { start_date: startDate, end_date: endDate } }),

  // Ticket Tags
  addTicketTag: (ticketId: number, tag: string) => 
    api.post(`/support-agent/tickets/${ticketId}/tags`, { tag }),
  removeTicketTag: (ticketId: number, tag: string) => 
    api.delete(`/support-agent/tickets/${ticketId}/tags/${encodeURIComponent(tag)}`),

  // Ticket Collaborators
  addCollaborator: (ticketId: number, agentId: number) => 
    api.post(`/support-agent/tickets/${ticketId}/collaborators`, { agent_id: agentId }),
  removeCollaborator: (ticketId: number, agentId: number) => 
    api.delete(`/support-agent/tickets/${ticketId}/collaborators/${agentId}`),

  // Merge Tickets
  mergeTickets: (primaryId: number, secondaryIds: number[]) => 
    api.post(`/support-agent/tickets/${primaryId}/merge`, { secondary_ids: secondaryIds }),

  // Ticket Rating
  requestTicketRating: (ticketId: number) => 
    api.post(`/support-agent/tickets/${ticketId}/request-rating`),

  // Transfer Ticket
  transferTicket: (ticketId: number, toAgentId: number, reason?: string) => 
    api.post(`/support-agent/tickets/${ticketId}/transfer`, { to_agent_id: toAgentId, reason }),

  // Template Favorites & Usage
  toggleTemplateFavorite: (templateId: number) => 
    api.post(`/support-agent/templates/${templateId}/favorite`),
  incrementTemplateUsage: (templateId: number) => 
    api.post(`/support-agent/templates/${templateId}/use`),

  // Agent Personal Notes
  getAgentNotes: () => api.get('/support-agent/agent-notes'),
  createAgentNote: (content: string, color?: string) => 
    api.post('/support-agent/agent-notes', { content, color }),
  deleteAgentNote: (noteId: number) => api.delete(`/support-agent/agent-notes/${noteId}`),

  // Chat Notes
  getChatNotes: (chatId: number) => api.get(`/support-agent/chats/${chatId}/notes`),
  addChatNote: (chatId: number, note: string) => 
    api.post(`/support-agent/chats/${chatId}/notes`, { note }),

  // Create Ticket from Chat
  createTicketFromChat: (chatId: number) => 
    api.post(`/support-agent/chats/${chatId}/create-ticket`),

  // Chat Rating
  requestChatRating: (chatId: number) => 
    api.post(`/support-agent/chats/${chatId}/request-rating`),

  // Bulk Operations
  bulkAssignTickets: (ticketIds: number[]) => 
    api.post('/support-agent/tickets/bulk-assign', { ticket_ids: ticketIds }),
  bulkEscalateTickets: (ticketIds: number[], escalateTo?: string) => 
    api.post('/support-agent/tickets/bulk-escalate', { ticket_ids: ticketIds, escalate_to: escalateTo }),

  // Agent Schedule
  getSchedule: () => api.get('/support-agent/schedule'),
  updateSchedule: (dayOfWeek: number, isWorkingDay: boolean, startTime: string, endTime: string) =>
    api.put('/support-agent/schedule', { day_of_week: dayOfWeek, is_working_day: isWorkingDay, start_time: startTime, end_time: endTime }),
  getBreaks: () => api.get('/support-agent/breaks'),
  createBreak: (name: string, startTime: string, endTime: string) =>
    api.post('/support-agent/breaks', { name, start_time: startTime, end_time: endTime }),
  deleteBreak: (id: number) => api.delete(`/support-agent/breaks/${id}`),
  getVacations: () => api.get('/support-agent/vacations'),
  createVacation: (startDate: string, endDate: string, reason?: string) =>
    api.post('/support-agent/vacations', { start_date: startDate, end_date: endDate, reason }),

  // SLA Policies
  getSLAPolicies: () => api.get('/support-agent/sla-policies'),
  createSLAPolicy: (name: string, firstResponseHours: number, resolutionHours: number, category?: string, priority?: string) =>
    api.post('/support-agent/sla-policies', { name, first_response_hours: firstResponseHours, resolution_hours: resolutionHours, category, priority }),
  updateSLAPolicy: (id: number, data: { name?: string; first_response_hours?: number; resolution_hours?: number; is_active?: boolean }) =>
    api.put(`/support-agent/sla-policies/${id}`, data),

  // Ticket Attachments
  getTicketAttachments: (ticketId: number) => api.get(`/support-agent/tickets/${ticketId}/attachments`),
  addTicketAttachment: (ticketId: number, fileName: string, fileUrl: string, fileType?: string, fileSize?: number) =>
    api.post(`/support-agent/tickets/${ticketId}/attachments`, { file_name: fileName, file_url: fileUrl, file_type: fileType, file_size: fileSize }),
  deleteTicketAttachment: (ticketId: number, attachmentId: number) =>
    api.delete(`/support-agent/tickets/${ticketId}/attachments/${attachmentId}`),

  // Chat Transfers
  transferChat: (chatId: number, toAgentId: number, reason?: string) =>
    api.post(`/support-agent/chats/${chatId}/transfer`, { to_agent_id: toAgentId, reason }),
  getPendingChatTransfers: () => api.get('/support-agent/chat-transfers/pending'),
  acceptChatTransfer: (transferId: number) => api.post(`/support-agent/chat-transfers/${transferId}/accept`),

  // Quick Replies
  getQuickReplies: () => api.get('/support-agent/quick-replies'),
  createQuickReply: (text: string, category?: string, displayOrder?: number) =>
    api.post('/support-agent/quick-replies', { text, category, display_order: displayOrder }),
  deleteQuickReply: (id: number) => api.delete(`/support-agent/quick-replies/${id}`),

  // Ticket Categories
  getTicketCategories: () => api.get('/support-agent/categories'),

  // FAQ Feedback
  getFAQFeedback: (faqId: number) => api.get(`/support-agent/faqs/${faqId}/feedback`),
  addFAQFeedback: (faqId: number, isHelpful: boolean, comment?: string, userId?: number) =>
    api.post(`/support-agent/faqs/${faqId}/feedback`, { is_helpful: isHelpful, comment, user_id: userId }),

  // Ticket History
  getTicketHistory: (ticketId: number) => api.get(`/support-agent/tickets/${ticketId}/history`),

  // Chat Attachments
  getChatAttachments: (chatId: number) => api.get(`/support-agent/chats/${chatId}/attachments`),
  addChatAttachment: (chatId: number, fileName: string, fileUrl: string, fileType?: string, fileSize?: number) =>
    api.post(`/support-agent/chats/${chatId}/attachments`, { file_name: fileName, file_url: fileUrl, file_type: fileType, file_size: fileSize }),
  deleteChatAttachment: (chatId: number, attachmentId: number) =>
    api.delete(`/support-agent/chats/${chatId}/attachments/${attachmentId}`),

  // Agent Performance
  getAgentPerformance: (days?: number) => api.get('/support-agent/performance/me', { params: { days } }),
  getTeamPerformance: (days?: number) => api.get('/support-agent/performance/team', { params: { days } }),

  // SLA Breaches
  getSLABreaches: (acknowledged?: boolean, limit?: number) =>
    api.get('/support-agent/sla-breaches', { params: { acknowledged, limit } }),
  acknowledgeSLABreach: (id: number, notes?: string) =>
    api.post(`/support-agent/sla-breaches/${id}/acknowledge`, { notes }),
  getUnacknowledgedBreachCount: () => api.get('/support-agent/sla-breaches/unacknowledged/count'),

  // Activity Logs
  getActivityLogs: (agentId?: number, category?: string, limit?: number) =>
    api.get('/support-agent/activity-logs', { params: { agent_id: agentId, category, limit } }),
  getMyActivityLogs: (category?: string, limit?: number) =>
    api.get('/support-agent/activity-logs/me', { params: { category, limit } }),

  // Announcements
  getAnnouncements: () => api.get('/support-agent/announcements'),
  createAnnouncement: (title: string, content: string, type?: string, priority?: number, isPinned?: boolean, expiresAt?: string) =>
    api.post('/support-agent/announcements', { title, content, type, priority, is_pinned: isPinned, expires_at: expiresAt }),
  markAnnouncementRead: (id: number) => api.post(`/support-agent/announcements/${id}/read`),
  deleteAnnouncement: (id: number) => api.delete(`/support-agent/announcements/${id}`),

  // FAQ Categories
  getFAQCategories: () => api.get('/support-agent/faq-categories'),
  createFAQCategory: (name: string, slug?: string, description?: string, displayOrder?: number) =>
    api.post('/support-agent/faq-categories', { name, slug, description, display_order: displayOrder }),
  updateFAQCategory: (id: number, data: { name?: string; slug?: string; description?: string; display_order?: number; is_active?: boolean }) =>
    api.put(`/support-agent/faq-categories/${id}`, data),
  deleteFAQCategory: (id: number) => api.delete(`/support-agent/faq-categories/${id}`),

  // Internal Chat Rooms
  getChatRooms: () => api.get('/support-agent/chat-rooms'),
  createChatRoom: (name: string, type?: string, description?: string) =>
    api.post('/support-agent/chat-rooms', { name, type, description }),
  getChatRoomMessages: (roomId: number, limit?: number) =>
    api.get(`/support-agent/chat-rooms/${roomId}/messages`, { params: { limit } }),
  sendChatRoomMessage: (roomId: number, message: string, replyTo?: number) =>
    api.post(`/support-agent/chat-rooms/${roomId}/messages`, { message, reply_to: replyTo }),
  joinChatRoom: (roomId: number) => api.post(`/support-agent/chat-rooms/${roomId}/join`),
  leaveChatRoom: (roomId: number) => api.post(`/support-agent/chat-rooms/${roomId}/leave`),

  // Chat Reactions & Mentions
  addReaction: (messageId: number, emoji: string) =>
    api.post(`/support-agent/messages/${messageId}/reactions`, { emoji }),
  removeReaction: (messageId: number, emoji: string) =>
    api.delete(`/support-agent/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`),
  getUnreadMentions: () => api.get('/support-agent/mentions/unread'),
  markMentionsRead: () => api.post('/support-agent/mentions/read'),

  // Agent Sessions
  getAgentSessions: () => api.get('/support-agent/sessions'),
  invalidateSession: (sessionId: number) => api.delete(`/support-agent/sessions/${sessionId}`),
  invalidateAllSessions: () => api.delete('/support-agent/sessions'),

  // Login History
  getAgentLoginHistory: (limit?: number) =>
    api.get('/support-agent/login-history', { params: { limit } }),

  // API Tokens
  getAPITokens: () => api.get('/support-agent/api-tokens'),
  createAPIToken: (name: string, permissions?: string[]) =>
    api.post('/support-agent/api-tokens', { name, permissions }),
  revokeAPIToken: (tokenId: number) => api.delete(`/support-agent/api-tokens/${tokenId}`),

  // Webhooks
  getWebhooks: () => api.get('/support-agent/webhooks'),
  createWebhook: (url: string, events?: string[], secret?: string) =>
    api.post('/support-agent/webhooks', { url, events, secret }),
  deleteWebhook: (webhookId: number) => api.delete(`/support-agent/webhooks/${webhookId}`),

  // Global Search
  globalSearch: (query: string, limit?: number) =>
    api.get('/support-agent/search', { params: { q: query, limit } }),

  // Keyboard Shortcuts
  getKeyboardShortcuts: () => api.get('/support-agent/shortcuts'),
  updateKeyboardShortcut: (action: string, keys: string) =>
    api.put('/support-agent/shortcuts', { action, keys }),
  resetKeyboardShortcut: (action: string) => api.delete(`/support-agent/shortcuts/${action}`),

  // Video Calls
  getVideoCalls: (status?: string) => api.get('/support-agent/video-calls', { params: { status } }),
  scheduleVideoCall: (userId: number, scheduledAt: string, ticketId?: number, duration?: number, meetingUrl?: string) =>
    api.post('/support-agent/video-calls', { user_id: userId, scheduled_at: scheduledAt, ticket_id: ticketId, duration, meeting_url: meetingUrl }),
  updateVideoCallStatus: (callId: number, status: string) =>
    api.put(`/support-agent/video-calls/${callId}/status`, { status }),

  // AI Suggestions
  getAISuggestions: (ticketId: number) => api.get(`/support-agent/tickets/${ticketId}/ai-suggestions`),
  markAISuggestionUsed: (suggestionId: number, wasModified?: boolean) =>
    api.post(`/support-agent/ai-suggestions/${suggestionId}/use`, { was_modified: wasModified }),

  // Roles & Permissions
  getSupportRoles: () => api.get('/support-agent/roles'),
  getMyRoles: () => api.get('/support-agent/roles/me'),
  assignRole: (agentId: number, roleId: number) =>
    api.post('/support-agent/roles/assign', { agent_id: agentId, role_id: roleId }),
  removeRole: (agentId: number, roleId: number) =>
    api.post('/support-agent/roles/remove', { agent_id: agentId, role_id: roleId }),
  getSupportPermissions: () => api.get('/support-agent/permissions'),

  // Auto Assignment Rules
  getAutoAssignmentRules: () => api.get('/support-agent/assignment-rules'),
  createAutoAssignmentRule: (name: string, conditions?: string, assignmentType?: string, targetAgents?: string, priority?: number) =>
    api.post('/support-agent/assignment-rules', { name, conditions, assignment_type: assignmentType, target_agents: targetAgents, priority }),
  toggleAutoAssignmentRule: (ruleId: number) => api.post(`/support-agent/assignment-rules/${ruleId}/toggle`),
  deleteAutoAssignmentRule: (ruleId: number) => api.delete(`/support-agent/assignment-rules/${ruleId}`),

  // Agent Workload
  getAgentWorkload: () => api.get('/support-agent/workload'),
  updateAgentWorkload: (maxTickets?: number, maxChats?: number, isAcceptingNew?: boolean) =>
    api.put('/support-agent/workload', { max_tickets: maxTickets, max_chats: maxChats, is_accepting_new: isAcceptingNew }),

  // Data Exports
  getDataExports: () => api.get('/support-agent/exports'),
  createDataExport: (exportType: string, filters?: string, format?: string) =>
    api.post('/support-agent/exports', { export_type: exportType, filters, format }),

  // CSAT/NPS Surveys
  getCSATSurveys: (agentId?: number, limit?: number) =>
    api.get('/support-agent/surveys/csat', { params: { agent_id: agentId, limit } }),
  getNPSScores: (limit?: number) => api.get('/support-agent/surveys/nps', { params: { limit } }),
  getNPSSummary: () => api.get('/support-agent/surveys/nps/summary'),

  // Saved Filters
  getSavedFilters: () => api.get('/support-agent/filters'),
  createSavedFilter: (name: string, filters: string, isDefault?: boolean, isShared?: boolean) =>
    api.post('/support-agent/filters', { name, filters, is_default: isDefault, is_shared: isShared }),
  deleteSavedFilter: (filterId: number) => api.delete(`/support-agent/filters/${filterId}`),
  useSavedFilter: (filterId: number) => api.post(`/support-agent/filters/${filterId}/use`),

  // Dashboard Widgets
  getDashboardWidgets: () => api.get('/support-agent/widgets'),
  saveDashboardWidget: (widgetType: string, title?: string, positionX?: number, positionY?: number, width?: number, height?: number, settings?: string) =>
    api.post('/support-agent/widgets', { widget_type: widgetType, title, position_x: positionX, position_y: positionY, width, height, settings }),
  updateDashboardWidget: (widgetId: number, data: { position_x?: number; position_y?: number; width?: number; height?: number; is_visible?: boolean }) =>
    api.put(`/support-agent/widgets/${widgetId}`, data),
  deleteDashboardWidget: (widgetId: number) => api.delete(`/support-agent/widgets/${widgetId}`),

  // Typing Indicators
  setTypingIndicator: (chatId: number, chatType: string, isTyping: boolean) =>
    api.post('/support-agent/typing', { chat_id: chatId, chat_type: chatType, is_typing: isTyping }),
  getTypingIndicators: (chatId: number, chatType: string) =>
    api.get('/support-agent/typing', { params: { chat_id: chatId, chat_type: chatType } })
};

export default api;


// Accountant (Contador) Panel APIs
export const accountantAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/accountant/dashboard/stats'),

  // Withdrawals
  getWithdrawals: (status?: string, priority?: string, limit?: number) =>
    api.get('/accountant/withdrawals', { params: { status, priority, limit } }),
  getWithdrawal: (id: number) => api.get(`/accountant/withdrawals/${id}`),
  approveWithdrawal: (id: number, txHash?: string, notes?: string) =>
    api.post(`/accountant/withdrawals/${id}/approve`, { tx_hash: txHash, notes }),
  rejectWithdrawal: (id: number, reason: string) =>
    api.post(`/accountant/withdrawals/${id}/reject`, { reason }),

  // Deposits
  getDeposits: (status?: string, limit?: number) =>
    api.get('/accountant/deposits', { params: { status, limit } }),
  confirmDeposit: (id: number, creditedAmount: number, notes?: string) =>
    api.post(`/accountant/deposits/${id}/confirm`, { credited_amount: creditedAmount, notes }),
  rejectDeposit: (id: number, reason: string) =>
    api.post(`/accountant/deposits/${id}/reject`, { reason }),

  // Tournament Prizes
  getPrizes: (status?: string, limit?: number) =>
    api.get('/accountant/prizes', { params: { status, limit } }),
  payPrize: (id: number, paymentMethod: string, txReference?: string, notes?: string) =>
    api.post(`/accountant/prizes/${id}/pay`, { payment_method: paymentMethod, tx_reference: txReference, notes }),

  // User Financial Profiles
  getUserFinancialProfiles: (search?: string, riskLevel?: string, limit?: number) =>
    api.get('/accountant/users/financial', { params: { search, risk_level: riskLevel, limit } }),
  adjustUserBalance: (userId: number, adjustmentType: string, amount: number, reason: string) =>
    api.post(`/accountant/users/${userId}/balance/adjust`, { adjustment_type: adjustmentType, amount, reason }),

  // Commissions
  getCommissions: (sourceType?: string, limit?: number) =>
    api.get('/accountant/commissions', { params: { source_type: sourceType, limit } }),
  getCommissionTypes: () => api.get('/accountant/commissions/types'),

  // Invoices
  getInvoices: (status?: string, type?: string, limit?: number) =>
    api.get('/accountant/invoices', { params: { status, type, limit } }),
  createInvoice: (data: {
    invoice_number: string;
    invoice_type?: string;
    client_name: string;
    client_email?: string;
    client_tax_id?: string;
    amount: number;
    tax_amount?: number;
    total_amount: number;
    currency?: string;
    description?: string;
    issue_date: string;
    due_date: string;
    notes?: string;
  }) => api.post('/accountant/invoices', data),
  markInvoicePaid: (id: number, paymentMethod: string, paymentReference?: string) =>
    api.post(`/accountant/invoices/${id}/pay`, { payment_method: paymentMethod, payment_reference: paymentReference }),

  // Vendors
  getVendors: (search?: string, limit?: number) =>
    api.get('/accountant/vendors', { params: { search, limit } }),
  createVendor: (data: {
    name: string;
    code?: string;
    tax_id?: string;
    email?: string;
    phone?: string;
    address?: string;
    country?: string;
    category?: string;
    payment_terms?: number;
    preferred_payment_method?: string;
    contact_person?: string;
    notes?: string;
  }) => api.post('/accountant/vendors', data),

  // Bank Accounts
  getBankAccounts: () => api.get('/accountant/bank-accounts'),

  // Reconciliations
  getReconciliations: (status?: string, limit?: number) =>
    api.get('/accountant/reconciliations', { params: { status, limit } }),
  createReconciliation: (data: {
    reconciliation_date: string;
    period_start?: string;
    period_end?: string;
    expected_balance: number;
    actual_balance: number;
  }) => api.post('/accountant/reconciliations', data),
  resolveReconciliation: (id: number, notes?: string) =>
    api.post(`/accountant/reconciliations/${id}/resolve`, { notes }),

  // Financial Reports
  getFinancialReports: (reportType?: string, periodType?: string, limit?: number) =>
    api.get('/accountant/reports', { params: { report_type: reportType, period_type: periodType, limit } }),
  generateFinancialReport: (data: {
    report_type: string;
    report_name: string;
    period_type: string;
    period_start: string;
    period_end: string;
  }) => api.post('/accountant/reports/generate', data),

  // Daily/Monthly Summaries
  getDailySummaries: (startDate?: string, endDate?: string, limit?: number) =>
    api.get('/accountant/summaries/daily', { params: { start_date: startDate, end_date: endDate, limit } }),
  getMonthlySummaries: (year?: number, limit?: number) =>
    api.get('/accountant/summaries/monthly', { params: { year, limit } }),

  // Audit Logs
  getAuditLogs: (actionType?: string, riskLevel?: string, limit?: number) =>
    api.get('/accountant/audit-logs', { params: { action_type: actionType, risk_level: riskLevel, limit } }),

  // Suspicious Alerts
  getSuspiciousAlerts: (status?: string, severity?: string, limit?: number) =>
    api.get('/accountant/alerts', { params: { status, severity, limit } }),
  reviewAlert: (id: number, notes?: string, actionTaken?: string) =>
    api.post(`/accountant/alerts/${id}/review`, { notes, action_taken: actionTaken }),
  escalateAlert: (id: number, escalateTo: number) =>
    api.post(`/accountant/alerts/${id}/escalate`, { escalate_to: escalateTo }),

  // Fraud Investigations
  getFraudInvestigations: (status?: string, priority?: string, limit?: number) =>
    api.get('/accountant/investigations', { params: { status, priority, limit } }),
  createFraudInvestigation: (data: {
    user_id: number;
    case_number: string;
    investigation_type?: string;
    priority?: string;
  }) => api.post('/accountant/investigations', data),
  closeFraudInvestigation: (id: number, findings?: string, conclusion?: string, actionTaken?: string) =>
    api.post(`/accountant/investigations/${id}/close`, { findings, conclusion, action_taken: actionTaken }),

  // Settings
  getSettings: () => api.get('/accountant/settings'),
  updateSettings: (data: {
    timezone?: string;
    language?: string;
    date_format?: string;
    currency_format?: string;
    theme?: string;
    sidebar_collapsed?: boolean;
    default_view?: string;
    items_per_page?: number;
  }) => api.put('/accountant/settings', data),

  // Notifications
  getNotifications: (unreadOnly?: boolean, limit?: number) =>
    api.get('/accountant/notifications', { params: { unread_only: unreadOnly, limit } }),
  markNotificationRead: (id: number) => api.post(`/accountant/notifications/${id}/read`),
  getUnreadNotificationCount: () => api.get('/accountant/notifications/unread/count'),

  // Platform Metrics
  getPlatformMetrics: (startDate?: string, endDate?: string) =>
    api.get('/accountant/metrics', { params: { start_date: startDate, end_date: endDate } }),

  // Expense Categories
  getExpenseCategories: () => api.get('/accountant/expense-categories'),

  // Operating Expenses
  getOperatingExpenses: (category?: string, status?: string, limit?: number) =>
    api.get('/accountant/expenses', { params: { category, status, limit } }),
  createOperatingExpense: (data: {
    expense_category: string;
    expense_type: string;
    description?: string;
    amount: number;
    currency?: string;
    expense_date: string;
    vendor_id?: number;
    payment_method?: string;
    payment_reference?: string;
    is_recurring?: boolean;
    recurrence_period?: string;
    notes?: string;
  }) => api.post('/accountant/expenses', data),
  approveExpense: (id: number) => api.post(`/accountant/expenses/${id}/approve`),

  // Payment Providers
  getPaymentProviders: () => api.get('/accountant/payment-providers'),

  // Tasks
  getTasks: (status?: string, limit?: number) =>
    api.get('/accountant/tasks', { params: { status, limit } }),
  createTask: (data: {
    task_type: string;
    title: string;
    description?: string;
    priority?: string;
    due_date?: string;
    related_entity_type?: string;
    related_entity_id?: number;
    notes?: string;
  }) => api.post('/accountant/tasks', data),
  completeTask: (id: number) => api.post(`/accountant/tasks/${id}/complete`),

  // Cash Flow
  getCashFlowRecords: (startDate?: string, endDate?: string, limit?: number) =>
    api.get('/accountant/cash-flow', { params: { start_date: startDate, end_date: endDate, limit } }),

  // Data Exports
  getDataExports: (limit?: number) => api.get('/accountant/exports', { params: { limit } }),
  createDataExport: (data: {
    export_type: string;
    export_format?: string;
    file_name: string;
    date_range_start?: string;
    date_range_end?: string;
  }) => api.post('/accountant/exports', data)
};


// Operator (Operador) Panel APIs - Part 1: Base
export const operatorAPI = {
  // Dashboard
  getDashboardStats: () => api.get('/operator/dashboard/stats'),

  // Operators Management
  getOperators: (department?: string, status?: string, limit?: number) =>
    api.get('/operator/operators', { params: { department, status, limit } }),
  getOperator: (id: number) => api.get(`/operator/operators/${id}`),
  getMyProfile: () => api.get('/operator/me'),
  updateStatus: (status: string, statusMessage?: string) =>
    api.put('/operator/status', { status, status_message: statusMessage }),

  // Sessions
  getSessions: () => api.get('/operator/sessions'),
  invalidateSession: (sessionId: number) => api.delete(`/operator/sessions/${sessionId}`),
  invalidateAllSessions: (currentSessionId?: number) =>
    api.delete('/operator/sessions', { data: { current_session_id: currentSessionId } }),

  // Settings
  getSettings: () => api.get('/operator/settings'),
  updateSettings: (data: {
    theme?: string;
    language?: string;
    timezone?: string;
    notifications_enabled?: boolean;
    auto_refresh?: boolean;
    sound_alerts?: boolean;
    email_alerts?: boolean;
    font_size?: string;
    density?: string;
    do_not_disturb?: boolean;
    session_timeout?: number;
  }) => api.put('/operator/settings', data),

  // Work Schedule
  getWorkSchedule: () => api.get('/operator/schedule'),
  updateWorkSchedule: (dayOfWeek: number, startTime: string, endTime: string, isWorkingDay: boolean) =>
    api.put('/operator/schedule', { day_of_week: dayOfWeek, start_time: startTime, end_time: endTime, is_working_day: isWorkingDay }),

  // Roles & Permissions
  getRoles: () => api.get('/operator/roles'),
  getMyRoles: () => api.get('/operator/roles/me'),
  assignRole: (operatorId: number, roleId: number) =>
    api.post('/operator/roles/assign', { operator_id: operatorId, role_id: roleId }),
  removeRole: (operatorId: number, roleId: number) =>
    api.post('/operator/roles/remove', { operator_id: operatorId, role_id: roleId }),
  getAllPermissions: () => api.get('/operator/permissions'),
  getMyPermissions: () => api.get('/operator/permissions/me'),

  // ========== PART 2: Tournament Management ==========
  getTournamentActions: (tournamentId?: number, limit?: number) =>
    api.get('/operator/tournaments/actions', { params: { tournament_id: tournamentId, limit } }),
  logTournamentAction: (tournamentId: number, action: string, reason?: string) =>
    api.post('/operator/tournaments/actions', { tournament_id: tournamentId, action, reason }),
  getMyTournamentAssignments: () => api.get('/operator/tournaments/assignments'),
  assignTournament: (tournamentId: number, operatorId: number, role?: string) =>
    api.post('/operator/tournaments/assign', { tournament_id: tournamentId, operator_id: operatorId, role }),
  getDisqualifications: (tournamentId?: number, limit?: number) =>
    api.get('/operator/tournaments/disqualifications', { params: { tournament_id: tournamentId, limit } }),
  disqualifyParticipant: (tournamentId: number, userId: number, reason: string, isPermanent?: boolean) =>
    api.post('/operator/tournaments/disqualify', { tournament_id: tournamentId, user_id: userId, reason, is_permanent: isPermanent }),
  addUserToTournament: (tournamentId: number, userId: number, reason?: string, waiveFee?: boolean) =>
    api.post('/operator/tournaments/add-user', { tournament_id: tournamentId, user_id: userId, reason, waive_fee: waiveFee }),

  // ========== PART 2: User Management ==========
  getUserNotes: (userId: number) => api.get(`/operator/users/${userId}/notes`),
  addUserNote: (userId: number, note: string, priority?: string, isPinned?: boolean) =>
    api.post(`/operator/users/${userId}/notes`, { note, priority, is_pinned: isPinned }),
  deleteUserNote: (userId: number, noteId: number) =>
    api.delete(`/operator/users/${userId}/notes/${noteId}`),
  getBalanceAdjustments: (userId?: number, status?: string, limit?: number) =>
    api.get('/operator/balance-adjustments', { params: { user_id: userId, status, limit } }),
  createBalanceAdjustment: (userId: number, adjustmentType: string, amount: number, reason: string, walletType?: string, category?: string) =>
    api.post('/operator/balance-adjustments', { user_id: userId, adjustment_type: adjustmentType, amount, reason, wallet_type: walletType, category }),
  approveBalanceAdjustment: (id: number) => api.post(`/operator/balance-adjustments/${id}/approve`),
  rejectBalanceAdjustment: (id: number) => api.post(`/operator/balance-adjustments/${id}/reject`),
  getUserStatusChanges: (userId: number, limit?: number) =>
    api.get(`/operator/users/${userId}/status-changes`, { params: { limit } }),
  changeUserStatus: (userId: number, newStatus: string, reason: string, durationHours?: number) =>
    api.post(`/operator/users/${userId}/status`, { new_status: newStatus, reason, duration_hours: durationHours }),
  getTradingBlocks: (userId: number, activeOnly?: boolean) =>
    api.get(`/operator/users/${userId}/trading-blocks`, { params: { active_only: activeOnly } }),
  createTradingBlock: (userId: number, reason: string, blockType?: string, blockedSymbols?: string[], maxAmount?: number, expiresAt?: string) =>
    api.post(`/operator/users/${userId}/trading-blocks`, { reason, block_type: blockType, blocked_symbols: blockedSymbols, max_amount: maxAmount, expires_at: expiresAt }),
  removeTradingBlock: (userId: number, blockId: number) =>
    api.delete(`/operator/users/${userId}/trading-blocks/${blockId}`),
  getRiskAssessments: (userId: number, limit?: number) =>
    api.get(`/operator/users/${userId}/risk-assessments`, { params: { limit } }),
  createRiskAssessment: (userId: number, newLevel: string, factors?: string[], notes?: string) =>
    api.post(`/operator/users/${userId}/risk-assessments`, { new_level: newLevel, factors, notes }),
  getMonitoredUsers: (activeOnly?: boolean, limit?: number) =>
    api.get('/operator/monitored-users', { params: { active_only: activeOnly, limit } }),
  addMonitoredUser: (userId: number, reason: string, priority?: string, monitoringType?: string, expiresAt?: string) =>
    api.post('/operator/monitored-users', { user_id: userId, reason, priority, monitoring_type: monitoringType, expires_at: expiresAt }),
  removeMonitoredUser: (id: number) => api.delete(`/operator/monitored-users/${id}`),

  // ========== PART 3: Trade Control ==========
  getTradeInterventions: (tradeId?: number, limit?: number) =>
    api.get('/operator/trade-interventions', { params: { trade_id: tradeId, limit } }),
  createTradeIntervention: (tradeId: number, interventionType: string, reason: string, originalValue?: object, newValue?: object) =>
    api.post('/operator/trade-interventions', { trade_id: tradeId, intervention_type: interventionType, reason, original_value: originalValue, new_value: newValue }),
  revertTradeIntervention: (id: number, reason: string) =>
    api.post(`/operator/trade-interventions/${id}/revert`, { reason }),
  getTradeFlags: (status?: string, severity?: string, limit?: number) =>
    api.get('/operator/trade-flags', { params: { status, severity, limit } }),
  createTradeFlag: (tradeId: number, userId: number, flagType: string, reason: string, severity?: string, evidence?: object) =>
    api.post('/operator/trade-flags', { trade_id: tradeId, user_id: userId, flag_type: flagType, reason, severity, evidence }),
  resolveTradeFlag: (id: number, notes?: string) =>
    api.post(`/operator/trade-flags/${id}/resolve`, { notes }),
  dismissTradeFlag: (id: number, notes?: string) =>
    api.post(`/operator/trade-flags/${id}/dismiss`, { notes }),
  escalateTradeFlag: (id: number, escalateTo: number) =>
    api.post(`/operator/trade-flags/${id}/escalate`, { escalate_to: escalateTo }),
  getTradeCancellations: (status?: string, limit?: number) =>
    api.get('/operator/trade-cancellations', { params: { status, limit } }),
  createTradeCancellation: (tradeId: number, userId: number, cancellationType: string, originalAmount: number, reason: string, requiresApproval?: boolean) =>
    api.post('/operator/trade-cancellations', { trade_id: tradeId, user_id: userId, cancellation_type: cancellationType, original_amount: originalAmount, reason, requires_approval: requiresApproval }),
  processTradeCancellation: (id: number, refundAmount: number) =>
    api.post(`/operator/trade-cancellations/${id}/process`, { refund_amount: refundAmount }),
  getForcedTradeResults: (status?: string, limit?: number) =>
    api.get('/operator/forced-results', { params: { status, limit } }),
  createForcedTradeResult: (tradeId: number, userId: number, forcedResult: string, reason: string, forcedPayout?: number, justification?: string, requiresSeniorApproval?: boolean) =>
    api.post('/operator/forced-results', { trade_id: tradeId, user_id: userId, forced_result: forcedResult, reason, forced_payout: forcedPayout, justification, requires_senior_approval: requiresSeniorApproval }),
  approveForcedResult: (id: number) => api.post(`/operator/forced-results/${id}/approve`),
  revertForcedResult: (id: number, reason: string) =>
    api.post(`/operator/forced-results/${id}/revert`, { reason }),
  getTradeReviewQueue: (status?: string, priority?: string, limit?: number) =>
    api.get('/operator/trade-review-queue', { params: { status, priority, limit } }),
  assignTradeReview: (id: number) => api.post(`/operator/trade-review-queue/${id}/assign`),
  completeTradeReview: (id: number, actionTaken: string, notes?: string) =>
    api.post(`/operator/trade-review-queue/${id}/complete`, { action_taken: actionTaken, notes }),
  getTradePatterns: (patternType?: string, status?: string, limit?: number) =>
    api.get('/operator/trade-patterns', { params: { pattern_type: patternType, status, limit } }),
  reportTradePattern: (userId: number, patternType: string, affectedTrades?: number[], notes?: string) =>
    api.post('/operator/trade-patterns', { user_id: userId, pattern_type: patternType, affected_trades: affectedTrades, notes }),
  updatePatternStatus: (id: number, status: string, notes?: string, actionTaken?: string) =>
    api.put(`/operator/trade-patterns/${id}`, { status, notes, action_taken: actionTaken }),
  getTradeLimitOverrides: (userId?: number, activeOnly?: boolean, limit?: number) =>
    api.get('/operator/trade-limit-overrides', { params: { user_id: userId, active_only: activeOnly, limit } }),
  createTradeLimitOverride: (userId: number, limitType: string, newLimit: number, reason: string, expiresAt?: string) =>
    api.post('/operator/trade-limit-overrides', { user_id: userId, limit_type: limitType, new_limit: newLimit, reason, expires_at: expiresAt }),
  deactivateTradeLimitOverride: (id: number) => api.delete(`/operator/trade-limit-overrides/${id}`),

  // ========== PART 4: Alert System ==========
  getAlerts: (alertType?: string, severity?: string, status?: string, assignedTo?: number, limit?: number) =>
    api.get('/operator/alerts', { params: { alert_type: alertType, severity, status, assigned_to: assignedTo, limit } }),
  getAlert: (id: number) => api.get(`/operator/alerts/${id}`),
  createAlert: (alertType: string, title: string, message: string, severity?: string, sourceId?: number, sourceType?: string, userId?: number, priority?: number) =>
    api.post('/operator/alerts', { alert_type: alertType, title, message, severity, source_id: sourceId, source_type: sourceType, user_id: userId, priority }),
  acknowledgeAlert: (id: number) => api.post(`/operator/alerts/${id}/acknowledge`),
  assignAlert: (id: number, operatorId: number) =>
    api.post(`/operator/alerts/${id}/assign`, { operator_id: operatorId }),
  resolveAlert: (id: number, notes?: string) =>
    api.post(`/operator/alerts/${id}/resolve`, { notes }),
  dismissAlert: (id: number, notes?: string) =>
    api.post(`/operator/alerts/${id}/dismiss`, { notes }),
  markAlertRead: (id: number) => api.post(`/operator/alerts/${id}/read`),
  getUnreadAlertCount: () => api.get('/operator/alerts/unread/count'),
  escalateAlert: (id: number, reason: string, toOperatorId?: number, toDepartment?: string) =>
    api.post(`/operator/alerts/${id}/escalate`, { reason, to_operator_id: toOperatorId, to_department: toDepartment }),
  getAlertEscalations: (id: number) => api.get(`/operator/alerts/${id}/escalations`),
  getAlertComments: (id: number) => api.get(`/operator/alerts/${id}/comments`),
  addAlertComment: (id: number, comment: string, isInternal?: boolean) =>
    api.post(`/operator/alerts/${id}/comments`, { comment, is_internal: isInternal }),
  getAlertRules: (activeOnly?: boolean) =>
    api.get('/operator/alert-rules', { params: { active_only: activeOnly } }),
  createAlertRule: (name: string, ruleType: string, triggerEvent: string, alertType: string, conditions: object, alertSeverity?: string, titleTemplate?: string, messageTemplate?: string, autoAssignTo?: number, cooldownMinutes?: number) =>
    api.post('/operator/alert-rules', { name, rule_type: ruleType, trigger_event: triggerEvent, alert_type: alertType, conditions, alert_severity: alertSeverity, title_template: titleTemplate, message_template: messageTemplate, auto_assign_to: autoAssignTo, cooldown_minutes: cooldownMinutes }),
  toggleAlertRule: (id: number) => api.post(`/operator/alert-rules/${id}/toggle`),
  deleteAlertRule: (id: number) => api.delete(`/operator/alert-rules/${id}`),
  getAlertSubscriptions: () => api.get('/operator/alert-subscriptions'),
  updateAlertSubscription: (alertType: string, severityFilter?: string[], notifyEmail?: boolean, notifyPush?: boolean, notifySms?: boolean, isActive?: boolean) =>
    api.put('/operator/alert-subscriptions', { alert_type: alertType, severity_filter: severityFilter, notify_email: notifyEmail, notify_push: notifyPush, notify_sms: notifySms, is_active: isActive }),
  getAlertStats: () => api.get('/operator/alert-stats'),

  // ========== PART 5: Asset Configuration ==========
  getAssetCategories: (activeOnly?: boolean) =>
    api.get('/operator/asset-categories', { params: { active_only: activeOnly } }),
  createAssetCategory: (name: string, slug: string, description?: string, icon?: string, displayOrder?: number) =>
    api.post('/operator/asset-categories', { name, slug, description, icon, display_order: displayOrder }),
  updateAssetCategory: (id: number, name: string, description?: string, icon?: string, displayOrder?: number, isActive?: boolean) =>
    api.put(`/operator/asset-categories/${id}`, { name, description, icon, display_order: displayOrder, is_active: isActive }),
  getTradingAssets: (categoryId?: number, assetType?: string, activeOnly?: boolean, limit?: number) =>
    api.get('/operator/trading-assets', { params: { category_id: categoryId, asset_type: assetType, active_only: activeOnly, limit } }),
  createTradingAsset: (symbol: string, name: string, assetType?: string, categoryId?: number, minAmount?: number, maxAmount?: number, minDuration?: number, maxDuration?: number, payout?: number, spread?: number, riskLevel?: string) =>
    api.post('/operator/trading-assets', { symbol, name, asset_type: assetType, category_id: categoryId, min_trade_amount: minAmount, max_trade_amount: maxAmount, min_duration_seconds: minDuration, max_duration_seconds: maxDuration, payout_percentage: payout, spread, risk_level: riskLevel }),
  updateTradingAsset: (id: number, name: string, categoryId?: number, minAmount?: number, maxAmount?: number, minDuration?: number, maxDuration?: number, payout?: number, spread?: number, riskLevel?: string, isActive?: boolean, isFeatured?: boolean) =>
    api.put(`/operator/trading-assets/${id}`, { name, category_id: categoryId, min_trade_amount: minAmount, max_trade_amount: maxAmount, min_duration_seconds: minDuration, max_duration_seconds: maxDuration, payout_percentage: payout, spread, risk_level: riskLevel, is_active: isActive, is_featured: isFeatured }),
  toggleAssetStatus: (id: number) => api.post(`/operator/trading-assets/${id}/toggle`),
  getAssetPayoutRules: (assetId: number) => api.get(`/operator/trading-assets/${assetId}/payout-rules`),
  createAssetPayoutRule: (assetId: number, ruleName: string, conditionType: string, conditionValue: object, payoutAdjustment: number, priority?: number) =>
    api.post(`/operator/trading-assets/${assetId}/payout-rules`, { rule_name: ruleName, condition_type: conditionType, condition_value: conditionValue, payout_adjustment: payoutAdjustment, priority }),
  deleteAssetPayoutRule: (assetId: number, ruleId: number) =>
    api.delete(`/operator/trading-assets/${assetId}/payout-rules/${ruleId}`),

  // ========== PART 5: Team Chat ==========
  getChatChannels: (channelType?: string) =>
    api.get('/operator/chat/channels', { params: { channel_type: channelType } }),
  createChatChannel: (name: string, slug: string, channelType?: string, description?: string, department?: string) =>
    api.post('/operator/chat/channels', { name, slug, channel_type: channelType, description, department }),
  joinChatChannel: (id: number) => api.post(`/operator/chat/channels/${id}/join`),
  leaveChatChannel: (id: number) => api.post(`/operator/chat/channels/${id}/leave`),
  getChannelMessages: (id: number, limit?: number, beforeId?: number) =>
    api.get(`/operator/chat/channels/${id}/messages`, { params: { limit, before_id: beforeId } }),
  sendChannelMessage: (id: number, content: string, messageType?: string, replyToId?: number) =>
    api.post(`/operator/chat/channels/${id}/messages`, { content, message_type: messageType, reply_to_id: replyToId }),
  editChannelMessage: (messageId: number, content: string) =>
    api.put(`/operator/chat/messages/${messageId}`, { content }),
  deleteChannelMessage: (messageId: number) => api.delete(`/operator/chat/messages/${messageId}`),
  pinChannelMessage: (messageId: number) => api.post(`/operator/chat/messages/${messageId}/pin`),
  addChatMessageReaction: (messageId: number, emoji: string) =>
    api.post(`/operator/chat/messages/${messageId}/reactions`, { emoji }),
  removeChatMessageReaction: (messageId: number, emoji: string) =>
    api.delete(`/operator/chat/messages/${messageId}/reactions/${encodeURIComponent(emoji)}`),
  getDirectMessages: (operatorId: number, limit?: number) =>
    api.get(`/operator/chat/dm/${operatorId}`, { params: { limit } }),
  sendDirectMessage: (operatorId: number, content: string) =>
    api.post(`/operator/chat/dm/${operatorId}`, { content }),
  markDirectMessagesRead: (operatorId: number) =>
    api.post(`/operator/chat/dm/${operatorId}/read`),
  getUnreadDMCount: () => api.get('/operator/chat/dm/unread/count'),

  // ========== PART 6: Activity Logs ==========
  getActivityLogs: (operatorId?: number, category?: string, limit?: number) =>
    api.get('/operator/activity-logs', { params: { operator_id: operatorId, category, limit } }),
  getMyActivityLogs: (category?: string, limit?: number) =>
    api.get('/operator/activity-logs/me', { params: { category, limit } }),
  getAuditTrail: (entityType?: string, entityId?: number, limit?: number) =>
    api.get('/operator/audit-trail', { params: { entity_type: entityType, entity_id: entityId, limit } }),
  getLoginAttempts: (operatorId?: number, successOnly?: boolean, limit?: number) =>
    api.get('/operator/login-attempts', { params: { operator_id: operatorId, success_only: successOnly, limit } }),

  // ========== PART 6: Real-time Monitoring ==========
  getPlatformMetrics: (startDate?: string, endDate?: string) =>
    api.get('/operator/monitoring/metrics', { params: { start_date: startDate, end_date: endDate } }),
  getLatestMetrics: () => api.get('/operator/monitoring/metrics/latest'),
  getActiveUsersMonitor: () => api.get('/operator/monitoring/active-users'),
  getActiveTradesMonitor: () => api.get('/operator/monitoring/active-trades'),
  getSystemHealth: () => api.get('/operator/monitoring/system-health'),
  getRealtimeAlerts: (severity?: string, limit?: number) =>
    api.get('/operator/monitoring/realtime-alerts', { params: { severity, limit } }),
  getMonitoringThresholds: (activeOnly?: boolean) =>
    api.get('/operator/monitoring/thresholds', { params: { active_only: activeOnly } }),
  createMonitoringThreshold: (metricName: string, thresholdType: string, warningValue: number, criticalValue: number, alertEnabled?: boolean, alertMessage?: string) =>
    api.post('/operator/monitoring/thresholds', { metric_name: metricName, threshold_type: thresholdType, warning_value: warningValue, critical_value: criticalValue, alert_enabled: alertEnabled, alert_message: alertMessage }),
  updateMonitoringThreshold: (id: number, warningValue?: number, criticalValue?: number, alertEnabled?: boolean, alertMessage?: string, isActive?: boolean) =>
    api.put(`/operator/monitoring/thresholds/${id}`, { warning_value: warningValue, critical_value: criticalValue, alert_enabled: alertEnabled, alert_message: alertMessage, is_active: isActive }),
  deleteMonitoringThreshold: (id: number) => api.delete(`/operator/monitoring/thresholds/${id}`),
  getMonitoringSummary: () => api.get('/operator/monitoring/summary'),

  // ========== PART 7: Reports ==========
  getReports: (reportType?: string, status?: string, limit?: number) =>
    api.get('/operator/reports', { params: { report_type: reportType, status, limit } }),
  createReport: (reportType: string, reportName: string, description?: string, periodStart?: string, periodEnd?: string, filters?: string, fileFormat?: string) =>
    api.post('/operator/reports', { report_type: reportType, report_name: reportName, description, period_start: periodStart, period_end: periodEnd, filters, file_format: fileFormat }),
  getReportTemplates: (reportType?: string, activeOnly?: boolean) =>
    api.get('/operator/report-templates', { params: { report_type: reportType, active_only: activeOnly } }),
  getDailySummaries: (startDate?: string, endDate?: string, limit?: number) =>
    api.get('/operator/summaries/daily', { params: { start_date: startDate, end_date: endDate, limit } }),
  getMonthlySummaries: (year?: number, limit?: number) =>
    api.get('/operator/summaries/monthly', { params: { year, limit } }),
  getPerformanceMetrics: (operatorId?: number, startDate?: string, endDate?: string, limit?: number) =>
    api.get('/operator/performance-metrics', { params: { operator_id: operatorId, start_date: startDate, end_date: endDate, limit } }),
  getDataExports: (exportType?: string, limit?: number) =>
    api.get('/operator/exports', { params: { export_type: exportType, limit } }),
  createDataExport: (exportType: string, exportName: string, filters?: string, fileFormat?: string) =>
    api.post('/operator/exports', { export_type: exportType, export_name: exportName, filters, file_format: fileFormat }),
  getCustomDashboards: () => api.get('/operator/dashboards'),
  createCustomDashboard: (name: string, description?: string, layout?: string, widgets?: string, isDefault?: boolean, isShared?: boolean) =>
    api.post('/operator/dashboards', { name, description, layout, widgets, is_default: isDefault, is_shared: isShared }),
  updateCustomDashboard: (id: number, name: string, description?: string, layout?: string, widgets?: string, isDefault?: boolean, isShared?: boolean) =>
    api.put(`/operator/dashboards/${id}`, { name, description, layout, widgets, is_default: isDefault, is_shared: isShared }),
  deleteCustomDashboard: (id: number) => api.delete(`/operator/dashboards/${id}`),

  // ========== PART 8: Security ==========
  getSecuritySessions: (activeOnly?: boolean) =>
    api.get('/operator/security/sessions', { params: { active_only: activeOnly } }),
  terminateSession: (id: number) => api.delete(`/operator/security/sessions/${id}`),
  terminateAllSessions: (exceptCurrentId?: number) =>
    api.delete('/operator/security/sessions', { data: { except_current_id: exceptCurrentId } }),
  getSecurityLoginHistory: (success?: boolean, limit?: number) =>
    api.get('/operator/security/login-history', { params: { success, limit } }),
  getSecurityAPITokens: () => api.get('/operator/security/api-tokens'),
  createSecurityAPIToken: (name: string, permissions?: string, scopes?: string, rateLimit?: number, expiresAt?: string) =>
    api.post('/operator/security/api-tokens', { name, permissions, scopes, rate_limit: rateLimit, expires_at: expiresAt }),
  revokeSecurityAPIToken: (id: number) => api.delete(`/operator/security/api-tokens/${id}`),
  getSecuritySettingsOperator: () => api.get('/operator/security/settings'),
  updateSecuritySettingsOperator: (require2FA?: boolean, sessionTimeout?: number, maxSessions?: number, ipWhitelist?: string, loginNotifications?: boolean, suspiciousAlerts?: boolean) =>
    api.put('/operator/security/settings', { require_2fa_for_sensitive: require2FA, session_timeout_minutes: sessionTimeout, max_sessions: maxSessions, ip_whitelist: ipWhitelist, login_notifications: loginNotifications, suspicious_activity_alerts: suspiciousAlerts }),
  getIPBlocks: (activeOnly?: boolean, limit?: number) =>
    api.get('/operator/security/ip-blocks', { params: { active_only: activeOnly, limit } }),
  createIPBlock: (ipAddress: string, ipRange?: string, blockType?: string, reason?: string, expiresAt?: string) =>
    api.post('/operator/security/ip-blocks', { ip_address: ipAddress, ip_range: ipRange, block_type: blockType, reason, expires_at: expiresAt }),
  removeIPBlock: (id: number) => api.delete(`/operator/security/ip-blocks/${id}`),
  getSecurityEventsOperator: (operatorId?: number, eventType?: string, severity?: string, unresolvedOnly?: boolean, limit?: number) =>
    api.get('/operator/security/events', { params: { operator_id: operatorId, event_type: eventType, severity, unresolved_only: unresolvedOnly, limit } }),
  resolveSecurityEvent: (id: number, notes?: string) =>
    api.post(`/operator/security/events/${id}/resolve`, { notes }),
  getTrustedDevices: () => api.get('/operator/security/trusted-devices'),
  removeTrustedDevice: (id: number) => api.delete(`/operator/security/trusted-devices/${id}`),
  getPasswordPolicies: () => api.get('/operator/security/password-policies'),

  // ========== PART 9: Notifications & Statistics ==========
  getOperatorNotifications: (unreadOnly?: boolean, includeArchived?: boolean, limit?: number) =>
    api.get('/operator/notifications', { params: { unread_only: unreadOnly, include_archived: includeArchived, limit } }),
  getOperatorUnreadNotificationCount: () => api.get('/operator/notifications/unread/count'),
  markOperatorNotificationRead: (id: number) => api.post(`/operator/notifications/${id}/read`),
  markAllOperatorNotificationsRead: () => api.post('/operator/notifications/read-all'),
  archiveOperatorNotification: (id: number) => api.post(`/operator/notifications/${id}/archive`),
  deleteOperatorNotification: (id: number) => api.delete(`/operator/notifications/${id}`),
  getOperatorNotificationPreferences: () => api.get('/operator/notification-preferences'),
  updateOperatorNotificationPreferences: (prefs: {
    email_enabled?: boolean;
    push_enabled?: boolean;
    sound_enabled?: boolean;
    desktop_enabled?: boolean;
    alert_notifications?: boolean;
    trade_notifications?: boolean;
    user_notifications?: boolean;
    system_notifications?: boolean;
    chat_notifications?: boolean;
    report_notifications?: boolean;
    quiet_hours_enabled?: boolean;
    digest_enabled?: boolean;
    digest_frequency?: string;
  }) => api.put('/operator/notification-preferences', prefs),
  getPlatformStatsOperator: (startDate?: string, endDate?: string, limit?: number) =>
    api.get('/operator/stats/platform', { params: { start_date: startDate, end_date: endDate, limit } }),
  getKPIs: (category?: string, periodType?: string) =>
    api.get('/operator/stats/kpis', { params: { category, period_type: periodType } }),
  getAssetStatsOperator: (symbol?: string, startDate?: string, endDate?: string, limit?: number) =>
    api.get('/operator/stats/assets', { params: { symbol, start_date: startDate, end_date: endDate, limit } }),
  getTradingStatsAggregate: (startDate?: string, endDate?: string, limit?: number) =>
    api.get('/operator/stats/trading', { params: { start_date: startDate, end_date: endDate, limit } }),
  getFinancialStatsAggregate: (startDate?: string, endDate?: string, limit?: number) =>
    api.get('/operator/stats/financial', { params: { start_date: startDate, end_date: endDate, limit } }),

  // ========== PART 10: Final Features ==========
  getSearchHistory: (searchType?: string, limit?: number) =>
    api.get('/operator/search-history', { params: { search_type: searchType, limit } }),
  saveSearchHistory: (searchQuery: string, searchType?: string, resultsCount?: number) =>
    api.post('/operator/search-history', { search_query: searchQuery, search_type: searchType, results_count: resultsCount }),
  clearSearchHistory: () => api.delete('/operator/search-history'),
  getQuickAccess: () => api.get('/operator/quick-access'),
  addQuickAccess: (itemType: string, itemName: string, itemId?: number, itemUrl?: string, icon?: string, color?: string, isPinned?: boolean) =>
    api.post('/operator/quick-access', { item_type: itemType, item_name: itemName, item_id: itemId, item_url: itemUrl, icon, color, is_pinned: isPinned }),
  removeQuickAccess: (id: number) => api.delete(`/operator/quick-access/${id}`),
  toggleQuickAccessPin: (id: number) => api.post(`/operator/quick-access/${id}/pin`),
  getOperatorWebhooks: (activeOnly?: boolean) =>
    api.get('/operator/webhooks', { params: { active_only: activeOnly } }),
  createOperatorWebhook: (name: string, url: string, secret?: string, events?: string, retryCount?: number, timeoutSeconds?: number) =>
    api.post('/operator/webhooks', { name, url, secret, events, retry_count: retryCount, timeout_seconds: timeoutSeconds }),
  updateOperatorWebhook: (id: number, name: string, url: string, events?: string, isActive?: boolean, retryCount?: number, timeoutSeconds?: number) =>
    api.put(`/operator/webhooks/${id}`, { name, url, events, is_active: isActive, retry_count: retryCount, timeout_seconds: timeoutSeconds }),
  deleteOperatorWebhook: (id: number) => api.delete(`/operator/webhooks/${id}`),
  getQuickNotes: () => api.get('/operator/quick-notes'),
  createQuickNote: (content: string, title?: string, color?: string, isPinned?: boolean, reminderAt?: string, tags?: string) =>
    api.post('/operator/quick-notes', { content, title, color, is_pinned: isPinned, reminder_at: reminderAt, tags }),
  updateQuickNote: (id: number, content: string, title?: string, color?: string, isPinned?: boolean, reminderAt?: string, tags?: string) =>
    api.put(`/operator/quick-notes/${id}`, { content, title, color, is_pinned: isPinned, reminder_at: reminderAt, tags }),
  deleteQuickNote: (id: number) => api.delete(`/operator/quick-notes/${id}`),
  getOperatorTasksList: (status?: string, priority?: string, limit?: number) =>
    api.get('/operator/tasks', { params: { status, priority, limit } }),
  createOperatorTaskItem: (title: string, description?: string, priority?: string, dueDate?: string, relatedType?: string, relatedId?: number, tags?: string) =>
    api.post('/operator/tasks', { title, description, priority, due_date: dueDate, related_type: relatedType, related_id: relatedId, tags }),
  updateOperatorTaskItemStatus: (id: number, status: string) =>
    api.put(`/operator/tasks/${id}/status`, { status }),
  deleteOperatorTaskItem: (id: number) => api.delete(`/operator/tasks/${id}`),
  getOperatorKeyboardShortcuts: () => api.get('/operator/keyboard-shortcuts'),
  updateOperatorKeyboardShortcut: (action: string, shortcut: string) =>
    api.put('/operator/keyboard-shortcuts', { action, shortcut }),
  getOperatorQuickResponses: (category?: string) =>
    api.get('/operator/quick-responses', { params: { category } }),
  createOperatorQuickResponse: (name: string, content: string, shortcut?: string, category?: string, variables?: string, isGlobal?: boolean) =>
    api.post('/operator/quick-responses', { name, content, shortcut, category, variables, is_global: isGlobal }),
  deleteOperatorQuickResponse: (id: number) => api.delete(`/operator/quick-responses/${id}`)
};

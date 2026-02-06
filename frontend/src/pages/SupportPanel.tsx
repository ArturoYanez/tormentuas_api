import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { supportAgentAPI } from '../lib/api';
import {
  MessageSquare, Users, HelpCircle, FileText, Settings, Clock, CheckCircle,
  XCircle, AlertCircle, Search, Plus, User, Bell, LogOut, Menu, X, RefreshCw,
  Send, Paperclip, Edit, Trash2, Eye, BookOpen, BarChart3, Copy, Zap,
  TrendingUp, MessageCircle, Headphones, Shield, Star, AlertTriangle, Tag,
  Phone, Mail, Calendar, ArrowUp, Download, ChevronDown, UserPlus, Merge,
  Globe, Moon, Sun, History, Smile, ThumbsUp, ThumbsDown, PieChart, Hash,
  Languages, Sparkles, UserCheck, StickyNote, Timer, Filter, Command, Link2
} from 'lucide-react';
import { Line, Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

// Types
type ViewType = 'dashboard' | 'tickets' | 'chat' | 'users' | 'faq' | 'templates' | 'knowledge' | 'reports' | 'internal' | 'settings' | 'queue' | 'search';
type AgentStatus = 'available' | 'busy' | 'away' | 'dnd';

interface Ticket {
  id: number;
  odId: string;
  userName: string;
  userEmail: string;
  userPhone: string;
  subject: string;
  category: 'withdrawal' | 'deposit' | 'account' | 'trading' | 'technical' | 'verification' | 'bonus' | 'other';
  status: 'open' | 'in_progress' | 'waiting' | 'escalated' | 'resolved' | 'closed';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  assignedTo: string | null;
  escalatedTo: string | null;
  collaborators: string[];
  tags: string[];
  language: string;
  createdAt: string;
  updatedAt: string;
  slaDeadline: string;
  waitingSince: string;
  rating: number | null;
  messages: TicketMessage[];
  internalNotes: InternalNote[];
  history: TicketHistory[];
  mergedFrom: number[];
}

interface TicketMessage {
  id: number;
  sender: 'user' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: { name: string; url: string; type: string }[];
  isRead: boolean;
  suggestedResponse?: string;
}

interface InternalNote {
  id: number;
  author: string;
  note: string;
  timestamp: string;
}

interface TicketHistory {
  id: number;
  action: string;
  by: string;
  timestamp: string;
  details: string;
}

interface LiveChat {
  id: number;
  odId: string;
  userName: string;
  userEmail: string;
  status: 'waiting' | 'active' | 'ended';
  assignedTo: string | null;
  startedAt: string;
  waitingTime: number;
  language: string;
  messages: ChatMessage[];
  isTyping: boolean;
}

interface ChatMessage {
  id: number;
  sender: 'user' | 'support';
  senderName: string;
  message: string;
  timestamp: string;
}

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  views: number;
  helpful: number;
  notHelpful: number;
  isPublished: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

interface Template {
  id: number;
  name: string;
  shortcut: string;
  category: string;
  content: string;
  variables: string[];
  usageCount: number;
  isFavorite: boolean;
  createdAt: string;
}

interface KnowledgeArticle {
  id: number;
  title: string;
  category: string;
  content: string;
  tags: string[];
  author: string;
  views: number;
  isPublished: boolean;
  relatedArticles: number[];
  createdAt: string;
  updatedAt: string;
}

interface UserInfo {
  id: number;
  odId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  language: string;
  balance: number;
  demoBalance: number;
  totalDeposits: number;
  totalWithdrawals: number;
  registeredAt: string;
  lastLogin: string;
  status: 'active' | 'suspended' | 'pending' | 'blocked';
  verified: boolean;
  ticketCount: number;
  avgRating: number;
  riskLevel: 'low' | 'medium' | 'high';
  notes: UserNote[];
  recentActivity: UserActivity[];
  allTickets: number[];
  allChats: number[];
}

interface UserNote {
  id: number;
  note: string;
  author: string;
  createdAt: string;
}

interface UserActivity {
  id: number;
  action: string;
  details: string;
  timestamp: string;
}

interface InternalMessage {
  id: number;
  senderId: string;
  senderName: string;
  senderRole: 'support' | 'operator' | 'admin';
  message: string;
  timestamp: string;
  isRead: boolean;
}

interface Notification {
  id: number;
  type: 'ticket' | 'chat' | 'sla' | 'escalation' | 'system' | 'rating';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  link?: string;
}

interface CannedResponse {
  id: number;
  shortcut: string;
  title: string;
  content: string;
  category: string;
}

interface Macro {
  id: number;
  name: string;
  actions: MacroAction[];
}

interface MacroAction {
  type: 'reply' | 'status' | 'tag' | 'assign' | 'priority';
  value: string;
}

interface AgentNote {
  id: number;
  content: string;
  createdAt: string;
  color: string;
}

interface SupportAgent {
  id: string;
  name: string;
  status: AgentStatus;
  ticketCount: number;
}

// Categories for filters
const FAQ_CATEGORIES = ['Cuenta', 'Depósitos', 'Retiros', 'Trading', 'Verificación', 'Bonos', 'Técnico', 'General'];
const TEMPLATE_CATEGORIES = ['General', 'Retiros', 'Depósitos', 'Cuenta', 'Trading', 'Técnico', 'Verificación'];
const KNOWLEDGE_CATEGORIES = ['Procesos', 'Retiros', 'Depósitos', 'Atención', 'Técnico', 'Políticas'];
const AVAILABLE_TAGS = ['urgente', 'vip', 'retiro', 'depósito', 'verificación', 'trading', 'bono', 'técnico', 'escalado', 'resuelto'];


// Main Component
export default function SupportPanel() {
  const navigate = useNavigate();
  const { logout } = useAuthContext();
  const chatEndRef = useRef<HTMLDivElement>(null);
  const internalChatEndRef = useRef<HTMLDivElement>(null);
  const messageInputRef = useRef<HTMLInputElement>(null);

  // View state
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCannedResponses, setShowCannedResponses] = useState(false);
  const [showMacros, setShowMacros] = useState(false);
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);

  // Agent status
  const [agentStatus, setAgentStatus] = useState<AgentStatus>('available');
  const [statusMessage, setStatusMessage] = useState('');
  const [showStatusMenu, setShowStatusMenu] = useState(false);

  // Data states - inicializados vacíos, se cargan desde API
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [liveChats, setLiveChats] = useState<LiveChat[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [knowledgeArticles, setKnowledgeArticles] = useState<KnowledgeArticle[]>([]);
  const [users, setUsers] = useState<UserInfo[]>([]);
  const [internalMessages, setInternalMessages] = useState<InternalMessage[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cannedResponses, setCannedResponses] = useState<CannedResponse[]>([]);
  const [macros, setMacros] = useState<Macro[]>([]);
  const [agents, setAgents] = useState<SupportAgent[]>([]);
  const [agentNotes, setAgentNotes] = useState<AgentNote[]>([]);
  const [dashboardStats, setDashboardStats] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);
  const [agentSettings, setAgentSettings] = useState<Record<string, unknown>>({});
  const [reportData, setReportData] = useState<{
    total_tickets: number;
    open_tickets: number;
    resolved_tickets: number;
    escalated_tickets: number;
    avg_response_minutes: number;
    avg_resolution_hours: number;
    satisfaction_avg: number;
    total_chats: number;
    total_users: number;
  } | null>(null);

  // Selection states
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [selectedChat, setSelectedChat] = useState<LiveChat | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserInfo | null>(null);
  const [selectedFaq, setSelectedFaq] = useState<FAQ | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<KnowledgeArticle | null>(null);

  // Filter states
  const [ticketFilter, setTicketFilter] = useState({ status: 'all', priority: 'all', category: 'all', search: '' });
  const [userSearch, setUserSearch] = useState('');
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategoryFilter, setFaqCategoryFilter] = useState('all');
  const [templateSearch, setTemplateSearch] = useState('');
  const [templateCategoryFilter, setTemplateCategoryFilter] = useState('all');
  const [knowledgeSearch, setKnowledgeSearch] = useState('');
  const [knowledgeCategoryFilter, setKnowledgeCategoryFilter] = useState('all');
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');

  // Queue SLA states
  const [queueFilter, setQueueFilter] = useState({ sla: 'all', priority: 'all', assigned: 'all' });
  const [queueSort, setQueueSort] = useState<'sla' | 'priority' | 'created'>('sla');
  const [selectedQueueTickets, setSelectedQueueTickets] = useState<number[]>([]);

  // Live Chat states
  const [chatFilter, setChatFilter] = useState<'all' | 'waiting' | 'active' | 'ended'>('all');
  const [chatSearch, setChatSearch] = useState('');
  const [showChatInfo, setShowChatInfo] = useState(false);
  const [chatNotes, setChatNotes] = useState<{ chatId: number; note: string }[]>([]);
  const [newChatNote, setNewChatNote] = useState('');
  const [showQuickReplies, setShowQuickReplies] = useState(false);

  // Users View states
  const [userFilter, setUserFilter] = useState({ status: 'all', verified: 'all', risk: 'all' });
  const [userSort, setUserSort] = useState<'name' | 'balance' | 'tickets' | 'recent'>('name');
  const [userTab, setUserTab] = useState<'info' | 'financial' | 'tickets' | 'activity' | 'notes'>('info');
  const [showUserActions, setShowUserActions] = useState(false);

  // FAQ View states
  const [faqSort, setFaqSort] = useState<'views' | 'helpful' | 'recent'>('views');
  const [showFaqPreview, setShowFaqPreview] = useState(false);
  const [faqStats, setFaqStats] = useState({ totalViews: 0, avgHelpful: 0 });

  // Templates View states
  const [templateFilter, setTemplateFilter] = useState<'all' | 'favorites' | string>('all');
  const [templateSort, setTemplateSort] = useState<'name' | 'usage' | 'recent'>('usage');
  const [templateView, setTemplateView] = useState<'grid' | 'list'>('grid');
  const [selectedTemplatePreview, setSelectedTemplatePreview] = useState<Template | null>(null);
  const [templateSearchLocal, setTemplateSearchLocal] = useState('');

  // Knowledge View states
  const [knowledgeFilter, setKnowledgeFilter] = useState<'all' | 'published' | 'drafts' | string>('all');
  const [knowledgeSort, setKnowledgeSort] = useState<'views' | 'title' | 'recent'>('views');
  const [knowledgeView, setKnowledgeView] = useState<'grid' | 'list'>('grid');
  const [selectedArticlePreview, setSelectedArticlePreview] = useState<KnowledgeArticle | null>(null);
  const [knowledgeSearchLocal, setKnowledgeSearchLocal] = useState('');
  const [showArticleContent, setShowArticleContent] = useState(false);

  // Reports View states
  const [reportType, setReportType] = useState<'overview' | 'tickets' | 'agents' | 'satisfaction' | 'sla'>('overview');
  const [reportDateRange, setReportDateRange] = useState<'today' | 'week' | 'month' | 'quarter' | 'custom'>('week');
  const [reportCompare, setReportCompare] = useState(false);
  const [showReportExport, setShowReportExport] = useState(false);

  // Internal Chat View states
  const [internalChatTab, setInternalChatTab] = useState<'general' | 'direct' | 'announcements'>('general');
  const [internalChatSearch, setInternalChatSearch] = useState('');
  const [selectedInternalContact, setSelectedInternalContact] = useState<{ id: string; name: string; role: string } | null>(null);
  const [showInternalUserInfo, setShowInternalUserInfo] = useState(false);
  const [internalChatFilter, setInternalChatFilter] = useState<'all' | 'unread' | 'mentions'>('all');
  const [pinnedMessages, setPinnedMessages] = useState<number[]>([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  // Modal states
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showKnowledgeModal, setShowKnowledgeModal] = useState(false);
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [showUserNoteModal, setShowUserNoteModal] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showCollaboratorModal, setShowCollaboratorModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [showRatingRequestModal, setShowRatingRequestModal] = useState(false);
  const [showAgentNoteModal, setShowAgentNoteModal] = useState(false);

  // Form states
  const [newMessage, setNewMessage] = useState('');
  const [newInternalNote, setNewInternalNote] = useState('');
  const [newInternalMessage, setNewInternalMessage] = useState('');
  const [newUserNote, setNewUserNote] = useState('');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateTo, setEscalateTo] = useState('operator');
  const [transferTo, setTransferTo] = useState('');
  const [mergeTargetId, setMergeTargetId] = useState('');
  const [newTag, setNewTag] = useState('');
  const [newAgentNote, setNewAgentNote] = useState('');
  const [agentNoteColor, setAgentNoteColor] = useState('#3b82f6');

  // FAQ form
  const [faqForm, setFaqForm] = useState({ question: '', answer: '', category: 'General', isPublished: true });

  // Template form
  const [templateForm, setTemplateForm] = useState({ name: '', shortcut: '', category: 'General', content: '', variables: '' });

  // Knowledge form
  const [knowledgeForm, setKnowledgeForm] = useState({ title: '', category: 'Procesos', content: '', tags: '', isPublished: true });

  // Settings state
  const [settingsTab, setSettingsTab] = useState<'profile' | 'notifications' | 'appearance' | 'security' | 'responses' | 'shortcuts' | 'schedule' | 'privacy' | 'integrations'>('profile');
  const [darkMode, setDarkMode] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  
  // Extended settings states
  const [profilePhone, setProfilePhone] = useState('+52 555 000 0000');
  const [profileTimezone, setProfileTimezone] = useState('America/Mexico_City');
  const [profileLanguage, setProfileLanguage] = useState('es');
  const [profileBio, setProfileBio] = useState('Agente de soporte con 2 años de experiencia');
  
  // Security states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '¿Nombre de tu primera mascota?', answer: '****' },
    { question: '¿Ciudad donde naciste?', answer: '****' }
  ]);
  const [loginHistory] = useState([
    { date: '2025-12-25 10:30', ip: '192.168.1.100', device: 'Chrome - Windows', location: 'México', current: true },
    { date: '2025-12-24 09:15', ip: '192.168.1.100', device: 'Chrome - Windows', location: 'México', current: false },
    { date: '2025-12-23 14:20', ip: '10.0.0.50', device: 'Safari - iPhone', location: 'México', current: false },
  ]);
  const [trustedDevices, setTrustedDevices] = useState([
    { id: 1, name: 'Chrome - Windows PC', lastUsed: '2025-12-25', trusted: true },
    { id: 2, name: 'Safari - iPhone 14', lastUsed: '2025-12-23', trusted: true },
  ]);
  const [activeSessions] = useState([
    { id: 1, device: 'Chrome - Windows', ip: '192.168.1.100', location: 'México', lastActive: 'Ahora', current: true },
  ]);
  
  // Notification states
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [notificationSchedule, setNotificationSchedule] = useState({ start: '09:00', end: '18:00' });
  const [slaAlertFrequency, setSlaAlertFrequency] = useState('15');
  
  // Schedule states
  const [workSchedule, setWorkSchedule] = useState({
    monday: { enabled: true, start: '09:00', end: '18:00' },
    tuesday: { enabled: true, start: '09:00', end: '18:00' },
    wednesday: { enabled: true, start: '09:00', end: '18:00' },
    thursday: { enabled: true, start: '09:00', end: '18:00' },
    friday: { enabled: true, start: '09:00', end: '17:00' },
    saturday: { enabled: false, start: '09:00', end: '14:00' },
    sunday: { enabled: false, start: '09:00', end: '14:00' },
  });
  const [scheduledBreaks, setScheduledBreaks] = useState([
    { id: 1, name: 'Almuerzo', start: '13:00', end: '14:00' },
  ]);
  const [vacationDates, setVacationDates] = useState<{ start: string; end: string }[]>([]);
  
  // Auto-response states
  const [awayMessage, setAwayMessage] = useState('Estoy ausente en este momento. Responderé a la brevedad.');
  const [outOfHoursMessage, setOutOfHoursMessage] = useState('Nuestro horario de atención es de 9:00 a 18:00. Te responderemos en el siguiente día hábil.');
  const [autoGreeting, setAutoGreeting] = useState('¡Hola! Gracias por contactarnos. ¿En qué puedo ayudarte?');
  const [autoClosingMessage, setAutoClosingMessage] = useState('¿Hay algo más en lo que pueda ayudarte? Si no, cerraré este ticket.');
  
  // Privacy states
  const [showOnlineStatus, setShowOnlineStatus] = useState(true);
  const [shareStats, setShareStats] = useState(true);
  const [activityVisible, setActivityVisible] = useState(true);
  
  // Integration states
  const [apiTokens] = useState([
    { id: 1, name: 'Token Principal', token: 'sk_live_****************************', created: '2025-01-15', lastUsed: '2025-12-25' },
  ]);
  const [webhooks, setWebhooks] = useState([
    { id: 1, url: 'https://api.example.com/webhook', events: ['ticket.created', 'ticket.resolved'], active: true },
  ]);
  const [autoAssign, setAutoAssign] = useState(true);
  const [signature, setSignature] = useState('Saludos cordiales,\nEquipo de Soporte TORMENTUS');

  // Reports state
  const [reportPeriod, setReportPeriod] = useState('week');

  // Ticket detail tab
  const [ticketTab, setTicketTab] = useState<'conversation' | 'notes' | 'history' | 'user'>('conversation');

  // Toast state
  const [toast, setToast] = useState<{ show: boolean; message: string; type: 'success' | 'error' | 'info' }>({ show: false, message: '', type: 'success' });

  // Auto-refresh
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  // ========== DATA TRANSFORMERS ==========
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformTicket = (t: any): Ticket => ({
    id: t.id,
    odId: t.ticket_number || `OD-${String(t.id).padStart(6, '0')}`,
    userName: t.user_name || 'Usuario',
    userEmail: t.user_email || '',
    userPhone: t.user_phone || '',
    subject: t.subject || '',
    category: t.category?.toLowerCase() || 'other',
    status: t.status || 'open',
    priority: t.priority || 'medium',
    assignedTo: t.assigned_name || null,
    escalatedTo: t.escalated_to || null,
    collaborators: t.collaborators || [],
    tags: t.tags || [],
    language: t.language || 'es',
    createdAt: t.created_at ? new Date(t.created_at).toLocaleString('es-ES') : '',
    updatedAt: t.updated_at ? new Date(t.updated_at).toLocaleString('es-ES') : '',
    slaDeadline: t.sla_deadline || new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(),
    waitingSince: t.waiting_since || '',
    rating: t.rating || t.satisfaction_rating || null,
    messages: (t.messages || []).map(transformTicketMessage),
    internalNotes: (t.internal_notes || []).map(transformInternalNote),
    history: t.history || [],
    mergedFrom: t.merged_from || []
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformTicketMessage = (m: any): TicketMessage => ({
    id: m.id,
    sender: m.sender_type === 'support' ? 'support' : 'user',
    senderName: m.sender_name || 'Usuario',
    message: m.message || '',
    timestamp: m.created_at ? new Date(m.created_at).toLocaleString('es-ES') : '',
    attachments: m.attachments || [],
    isRead: m.is_read !== false,
    suggestedResponse: m.suggested_response
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformInternalNote = (n: any): InternalNote => ({
    id: n.id,
    author: n.sender_name || n.author_name || 'Sistema',
    note: n.message || n.note || '',
    timestamp: n.created_at ? new Date(n.created_at).toLocaleString('es-ES') : ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformLiveChat = (c: any): LiveChat => ({
    id: c.id,
    odId: `OD-${String(c.user_id).padStart(6, '0')}`,
    userName: c.user_name || 'Usuario',
    userEmail: c.user_email || '',
    status: c.status || 'waiting',
    assignedTo: c.agent_name || null,
    startedAt: c.started_at ? new Date(c.started_at).toLocaleString('es-ES') : new Date(c.created_at).toLocaleString('es-ES'),
    waitingTime: c.waiting_time || Math.floor((Date.now() - new Date(c.created_at).getTime()) / 60000),
    language: c.language || 'es',
    messages: (c.messages || []).map(transformChatMessage),
    isTyping: false
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformChatMessage = (m: any): ChatMessage => ({
    id: m.id,
    sender: m.sender_type === 'support' ? 'support' : 'user',
    senderName: m.sender_name || 'Usuario',
    message: m.message || '',
    timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformFAQ = (f: any): FAQ => ({
    id: f.id,
    question: f.title || f.question || '',
    answer: f.content || f.answer || '',
    category: f.category || 'General',
    views: f.views || 0,
    helpful: f.helpful_count || f.helpful || 0,
    notHelpful: f.not_helpful_count || f.notHelpful || 0,
    isPublished: f.is_published !== false,
    order: f.sort_order || f.order || 0,
    createdAt: f.created_at ? new Date(f.created_at).toLocaleDateString('es-ES') : '',
    updatedAt: f.updated_at ? new Date(f.updated_at).toLocaleDateString('es-ES') : ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformTemplate = (t: any): Template => ({
    id: t.id,
    name: t.name || '',
    shortcut: t.shortcut || '',
    category: t.category || 'General',
    content: t.content || '',
    variables: t.variables || [],
    usageCount: t.usage_count || 0,
    isFavorite: t.is_favorite || false,
    createdAt: t.created_at ? new Date(t.created_at).toLocaleDateString('es-ES') : ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformKnowledgeArticle = (a: any): KnowledgeArticle => ({
    id: a.id,
    title: a.title || '',
    category: a.category || 'General',
    content: a.content || '',
    tags: a.tags || [],
    author: a.author_name || a.author || 'Sistema',
    views: a.views || 0,
    isPublished: a.is_published !== false,
    relatedArticles: a.related_articles || [],
    createdAt: a.created_at ? new Date(a.created_at).toLocaleDateString('es-ES') : '',
    updatedAt: a.updated_at ? new Date(a.updated_at).toLocaleDateString('es-ES') : ''
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformUser = (u: any): UserInfo => ({
    id: u.id,
    odId: `OD-${String(u.id).padStart(6, '0')}`,
    name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || u.name || 'Usuario',
    email: u.email || '',
    phone: u.phone || '',
    country: u.country || '',
    language: u.language || 'es',
    balance: u.balance || 0,
    demoBalance: u.demo_balance || 10000,
    totalDeposits: u.total_deposits || 0,
    totalWithdrawals: u.total_withdrawals || 0,
    registeredAt: u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : '',
    lastLogin: u.last_login ? new Date(u.last_login).toLocaleString('es-ES') : '',
    status: u.status || 'active',
    verified: u.is_verified || false,
    ticketCount: u.ticket_count || 0,
    avgRating: u.avg_rating || 0,
    riskLevel: u.risk_level || 'low',
    notes: (u.notes || []).map(transformUserNote),
    recentActivity: u.recent_activity || [],
    allTickets: u.all_tickets || [],
    allChats: u.all_chats || []
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const transformUserNote = (n: any): UserNote => ({
    id: n.id,
    note: n.note || '',
    author: n.author_name || n.author || 'Sistema',
    createdAt: n.created_at ? new Date(n.created_at).toLocaleDateString('es-ES') : ''
  });

  // ========== API CALLS ==========
  const loadDashboardStats = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getDashboardStats();
      setDashboardStats(res.data || {});
    } catch (err) {
      console.error('Error loading dashboard stats:', err);
    }
  }, []);

  const loadTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await supportAgentAPI.getTickets(
        ticketFilter.status !== 'all' ? ticketFilter.status : undefined,
        ticketFilter.priority !== 'all' ? ticketFilter.priority : undefined,
        ticketFilter.category !== 'all' ? ticketFilter.category : undefined
      );
      const rawTickets = res.data.tickets || [];
      setTickets(rawTickets.map(transformTicket));
    } catch (err) {
      console.error('Error loading tickets:', err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  }, [ticketFilter]);

  const loadLiveChats = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getLiveChats();
      const rawChats = res.data.chats || [];
      setLiveChats(rawChats.map(transformLiveChat));
    } catch (err) {
      console.error('Error loading chats:', err);
      setLiveChats([]);
    }
  }, []);

  const loadFAQs = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getFAQs();
      const rawFaqs = res.data.faqs || [];
      setFaqs(rawFaqs.map(transformFAQ));
    } catch (err) {
      console.error('Error loading FAQs:', err);
      setFaqs([]);
    }
  }, []);

  const loadTemplates = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getTemplates();
      const rawTemplates = res.data.templates || [];
      setTemplates(rawTemplates.map(transformTemplate));
    } catch (err) {
      console.error('Error loading templates:', err);
      setTemplates([]);
    }
  }, []);

  const loadKnowledge = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getKnowledgeArticles();
      const rawArticles = res.data.articles || [];
      setKnowledgeArticles(rawArticles.map(transformKnowledgeArticle));
    } catch (err) {
      console.error('Error loading knowledge:', err);
      setKnowledgeArticles([]);
    }
  }, []);

  const loadUsers = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getUsers(userSearch || undefined);
      const rawUsers = res.data.users || [];
      setUsers(rawUsers.map(transformUser));
    } catch (err) {
      console.error('Error loading users:', err);
      setUsers([]);
    }
  }, [userSearch]);

  // ========== NEW API CALLS FOR MISSING FEATURES ==========
  
  const loadNotifications = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getNotifications();
      const rawNotifications = res.data.notifications || [];
      setNotifications(rawNotifications.map((n: { id: number; type: string; title: string; message: string; created_at: string; is_read: boolean; link?: string }) => ({
        id: n.id,
        type: n.type || 'system',
        title: n.title || '',
        message: n.message || '',
        timestamp: n.created_at ? new Date(n.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
        isRead: n.is_read || false,
        link: n.link
      })));
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
    }
  }, []);

  const loadCannedResponses = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getCannedResponses();
      const rawResponses = res.data.canned_responses || [];
      setCannedResponses(rawResponses.map((r: { id: number; shortcut: string; title: string; content: string; category: string }) => ({
        id: r.id,
        shortcut: r.shortcut || '',
        title: r.title || '',
        content: r.content || '',
        category: r.category || 'General'
      })));
    } catch (err) {
      console.error('Error loading canned responses:', err);
      setCannedResponses([]);
    }
  }, []);

  const loadMacros = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getMacros();
      const rawMacros = res.data.macros || [];
      setMacros(rawMacros.map((m: { id: number; name: string; actions: string }) => {
        let actions: MacroAction[] = [];
        try {
          actions = typeof m.actions === 'string' ? JSON.parse(m.actions) : m.actions;
        } catch {
          actions = [];
        }
        return {
          id: m.id,
          name: m.name || '',
          actions: actions
        };
      }));
    } catch (err) {
      console.error('Error loading macros:', err);
      setMacros([]);
    }
  }, []);

  const loadAgents = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getAgents();
      const rawAgents = res.data.agents || [];
      setAgents(rawAgents.map((a: { agent_id: number; agent_name: string; status: string; current_tickets: number }) => ({
        id: String(a.agent_id),
        name: a.agent_name || 'Agente',
        status: (a.status || 'available') as AgentStatus,
        ticketCount: a.current_tickets || 0
      })));
    } catch (err) {
      console.error('Error loading agents:', err);
      setAgents([]);
    }
  }, []);

  const loadInternalMessages = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getInternalMessages('general');
      const rawMessages = res.data.messages || [];
      setInternalMessages(rawMessages.map((m: { id: number; sender_id: number; sender_name: string; sender_role: string; message: string; created_at: string; is_read: boolean }) => ({
        id: m.id,
        senderId: String(m.sender_id),
        senderName: m.sender_name || 'Sistema',
        senderRole: (m.sender_role || 'support') as 'support' | 'operator' | 'admin',
        message: m.message || '',
        timestamp: m.created_at ? new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) : '',
        isRead: m.is_read || false
      })));
    } catch (err) {
      console.error('Error loading internal messages:', err);
      setInternalMessages([]);
    }
  }, []);

  const loadAgentSettings = useCallback(async () => {
    try {
      const res = await supportAgentAPI.getSettings();
      const settings = res.data.settings || {};
      setAgentSettings(settings);
      // Update local state from settings
      if (settings.dark_mode !== undefined) setDarkMode(settings.dark_mode);
      if (settings.sound_enabled !== undefined) setSoundEnabled(settings.sound_enabled);
      if (settings.email_notifications !== undefined) setEmailNotifications(settings.email_notifications);
      if (settings.push_notifications !== undefined) setPushNotifications(settings.push_notifications);
      if (settings.language) setProfileLanguage(settings.language);
      if (settings.timezone) setProfileTimezone(settings.timezone);
      if (settings.away_message) setAwayMessage(settings.away_message);
      if (settings.out_of_hours_message) setOutOfHoursMessage(settings.out_of_hours_message);
      if (settings.auto_greeting) setAutoGreeting(settings.auto_greeting);
      if (settings.signature) setSignature(settings.signature);
      if (settings.sla_alert_minutes) setSlaAlertFrequency(String(settings.sla_alert_minutes));
    } catch (err) {
      console.error('Error loading agent settings:', err);
    }
  }, []);

  const updateAgentStatus = useCallback(async (status: AgentStatus, message?: string) => {
    try {
      await supportAgentAPI.updateAgentStatus(status, message);
      setAgentStatus(status);
      if (message) setStatusMessage(message);
      showToast(`Estado actualizado: ${getAgentStatusText(status)}`);
    } catch (err) {
      console.error('Error updating agent status:', err);
      setAgentStatus(status);
      showToast(`Estado actualizado: ${getAgentStatusText(status)}`);
    }
  }, []);

  const saveAgentSettings = useCallback(async () => {
    try {
      await supportAgentAPI.updateSettings({
        dark_mode: darkMode,
        sound_enabled: soundEnabled,
        email_notifications: emailNotifications,
        push_notifications: pushNotifications,
        language: profileLanguage,
        timezone: profileTimezone,
        away_message: awayMessage,
        out_of_hours_message: outOfHoursMessage,
        auto_greeting: autoGreeting,
        signature: signature,
        sla_alert_minutes: parseInt(slaAlertFrequency) || 15
      });
      showToast('Configuración guardada');
    } catch (err) {
      console.error('Error saving settings:', err);
      showToast('Configuración guardada localmente');
    }
  }, [darkMode, soundEnabled, emailNotifications, pushNotifications, profileLanguage, profileTimezone, awayMessage, outOfHoursMessage, autoGreeting, signature, slaAlertFrequency]);

  const loadReportStats = useCallback(async () => {
    try {
      const now = new Date();
      let startDate: string;
      const endDate = now.toISOString().split('T')[0];
      
      if (reportDateRange === 'today') {
        startDate = endDate;
      } else if (reportDateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = weekAgo.toISOString().split('T')[0];
      } else if (reportDateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = monthAgo.toISOString().split('T')[0];
      } else {
        const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        startDate = quarterAgo.toISOString().split('T')[0];
      }
      
      const res = await supportAgentAPI.getReportStats(startDate, endDate);
      setReportData(res.data.stats || null);
    } catch (err) {
      console.error('Error loading report stats:', err);
    }
  }, [reportDateRange]);

  // Initial data load
  useEffect(() => {
    loadDashboardStats();
    loadTickets();
    loadLiveChats();
    loadFAQs();
    loadTemplates();
    loadKnowledge();
    loadUsers();
    loadNotifications();
    loadCannedResponses();
    loadMacros();
    loadAgents();
    loadInternalMessages();
    loadAgentSettings();
  }, []);

  // Reload tickets when filter changes
  useEffect(() => {
    loadTickets();
  }, [ticketFilter, loadTickets]);

  // Reload reports when date range changes
  useEffect(() => {
    if (currentView === 'reports') {
      loadReportStats();
    }
  }, [reportDateRange, currentView, loadReportStats]);

  // Auto-refresh effect
  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastRefresh(new Date());
        loadTickets();
        loadLiveChats();
        loadDashboardStats();
        loadNotifications();
        loadAgents();
      }, 60000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, loadTickets, loadLiveChats, loadDashboardStats, loadNotifications, loadAgents]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [selectedChat?.messages, selectedTicket?.messages]);

  useEffect(() => {
    internalChatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [internalMessages]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'k') { e.preventDefault(); setShowGlobalSearch(true); }
        if (e.key === '/') { e.preventDefault(); setShowCannedResponses(true); }
      }
      if (e.key === 'Escape') {
        setShowGlobalSearch(false);
        setShowCannedResponses(false);
        setShowMacros(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Check for canned response shortcuts
  useEffect(() => {
    if (newMessage.startsWith('/')) {
      const shortcut = newMessage.toLowerCase();
      const response = cannedResponses.find(r => r.shortcut === shortcut);
      if (response) {
        setNewMessage(response.content);
        showToast(`Respuesta rápida: ${response.title}`);
      }
    }
  }, [newMessage, cannedResponses]);

  // Stats calculations
  const stats = {
    totalTickets: tickets.length,
    openTickets: tickets.filter(t => t.status === 'open').length,
    inProgressTickets: tickets.filter(t => t.status === 'in_progress').length,
    waitingTickets: tickets.filter(t => t.status === 'waiting').length,
    escalatedTickets: tickets.filter(t => t.status === 'escalated').length,
    resolvedToday: tickets.filter(t => t.status === 'resolved' && t.updatedAt.includes('2025-12-25')).length,
    avgResponseTime: '12 min',
    satisfactionRate: 94,
    activeChats: liveChats.filter(c => c.status === 'active').length,
    waitingChats: liveChats.filter(c => c.status === 'waiting').length,
    slaAtRisk: tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed').length,
    avgRating: 4.5,
  };

  // Filtered data
  const filteredTickets = tickets.filter(t => {
    if (ticketFilter.status !== 'all' && t.status !== ticketFilter.status) return false;
    if (ticketFilter.priority !== 'all' && t.priority !== ticketFilter.priority) return false;
    if (ticketFilter.category !== 'all' && t.category !== ticketFilter.category) return false;
    if (ticketFilter.search && !t.subject.toLowerCase().includes(ticketFilter.search.toLowerCase()) && 
        !t.userName.toLowerCase().includes(ticketFilter.search.toLowerCase()) &&
        !t.odId.toLowerCase().includes(ticketFilter.search.toLowerCase())) return false;
    return true;
  });

  // Queue sorted by SLA
  const queueTickets = [...tickets]
    .filter(t => t.status !== 'resolved' && t.status !== 'closed')
    .sort((a, b) => new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime());

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.odId.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredFaqs = faqs.filter(f => {
    if (faqCategoryFilter !== 'all' && f.category !== faqCategoryFilter) return false;
    if (faqSearch && !f.question.toLowerCase().includes(faqSearch.toLowerCase())) return false;
    return true;
  });

  const filteredTemplates = templates.filter(t => {
    if (templateCategoryFilter !== 'all' && t.category !== templateCategoryFilter) return false;
    if (templateSearch && !t.name.toLowerCase().includes(templateSearch.toLowerCase())) return false;
    return true;
  });

  const filteredKnowledge = knowledgeArticles.filter(a => {
    if (knowledgeCategoryFilter !== 'all' && a.category !== knowledgeCategoryFilter) return false;
    if (knowledgeSearch && !a.title.toLowerCase().includes(knowledgeSearch.toLowerCase())) return false;
    return true;
  });

  // Global search results
  const globalSearchResults = globalSearchQuery ? {
    tickets: tickets.filter(t => t.subject.toLowerCase().includes(globalSearchQuery.toLowerCase()) || t.userName.toLowerCase().includes(globalSearchQuery.toLowerCase())),
    users: users.filter(u => u.name.toLowerCase().includes(globalSearchQuery.toLowerCase()) || u.email.toLowerCase().includes(globalSearchQuery.toLowerCase())),
    faqs: faqs.filter(f => f.question.toLowerCase().includes(globalSearchQuery.toLowerCase())),
    knowledge: knowledgeArticles.filter(a => a.title.toLowerCase().includes(globalSearchQuery.toLowerCase())),
  } : null;


  // Helper functions
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      open: 'bg-blue-500', in_progress: 'bg-yellow-500', waiting: 'bg-purple-500',
      escalated: 'bg-orange-500', resolved: 'bg-green-500', closed: 'bg-gray-500',
      active: 'bg-green-500', ended: 'bg-gray-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      open: 'Abierto', in_progress: 'En Progreso', waiting: 'Esperando',
      escalated: 'Escalado', resolved: 'Resuelto', closed: 'Cerrado',
      active: 'Activo', ended: 'Finalizado'
    };
    return texts[status] || status;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      urgent: 'text-red-500 bg-red-500/20', high: 'text-orange-500 bg-orange-500/20',
      medium: 'text-yellow-500 bg-yellow-500/20', low: 'text-green-500 bg-green-500/20'
    };
    return colors[priority] || 'text-gray-500 bg-gray-500/20';
  };

  const getPriorityText = (priority: string) => {
    const texts: Record<string, string> = { urgent: 'Urgente', high: 'Alta', medium: 'Media', low: 'Baja' };
    return texts[priority] || priority;
  };

  const getCategoryText = (category: string) => {
    const texts: Record<string, string> = {
      withdrawal: 'Retiro', deposit: 'Depósito', account: 'Cuenta', trading: 'Trading',
      technical: 'Técnico', verification: 'Verificación', bonus: 'Bono', other: 'Otro'
    };
    return texts[category] || category;
  };

  const getRiskColor = (risk: string) => {
    const colors: Record<string, string> = { low: 'text-green-500', medium: 'text-yellow-500', high: 'text-red-500' };
    return colors[risk] || 'text-gray-500';
  };

  const getAgentStatusColor = (status: AgentStatus) => {
    const colors: Record<AgentStatus, string> = {
      available: 'bg-green-500', busy: 'bg-yellow-500', away: 'bg-orange-500', dnd: 'bg-red-500'
    };
    return colors[status];
  };

  const getAgentStatusText = (status: AgentStatus) => {
    const texts: Record<AgentStatus, string> = {
      available: 'Disponible', busy: 'Ocupado', away: 'Ausente', dnd: 'No molestar'
    };
    return texts[status];
  };

  const getLanguageFlag = (lang: string) => {
    const flags: Record<string, string> = { es: '🇪🇸', en: '🇺🇸', pt: '🇧🇷', fr: '🇫🇷' };
    return flags[lang] || '🌐';
  };

  const detectLanguage = (text: string): string => {
    const spanishWords = ['hola', 'gracias', 'ayuda', 'problema', 'cuenta', 'retiro'];
    const englishWords = ['hello', 'thanks', 'help', 'problem', 'account', 'withdrawal'];
    const lower = text.toLowerCase();
    const spanishCount = spanishWords.filter(w => lower.includes(w)).length;
    const englishCount = englishWords.filter(w => lower.includes(w)).length;
    return spanishCount >= englishCount ? 'es' : 'en';
  };

  const getTimeInQueue = (minutes: number) => {
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes} min`;
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getSLAStatus = (deadline: string) => {
    const now = new Date();
    const sla = new Date(deadline);
    const diff = sla.getTime() - now.getTime();
    const hours = diff / (1000 * 60 * 60);
    if (hours < 0) return { color: 'text-red-500 bg-red-500/20', text: 'Vencido' };
    if (hours < 1) return { color: 'text-orange-500 bg-orange-500/20', text: 'Crítico' };
    if (hours < 2) return { color: 'text-yellow-500 bg-yellow-500/20', text: 'Próximo' };
    return { color: 'text-green-500 bg-green-500/20', text: 'OK' };
  };

  const unreadNotifications = notifications.filter(n => !n.isRead).length;

  // Handlers - Connected to API
  const handleSendTicketMessage = async () => {
    if (!newMessage.trim() || !selectedTicket) return;
    try {
      const res = await supportAgentAPI.replyToTicket(selectedTicket.id, newMessage);
      if (res.data.ticket) {
        // Obtener mensajes actualizados
        const ticketRes = await supportAgentAPI.getTicket(selectedTicket.id);
        const rawTicket = ticketRes.data.ticket;
        const messages = ticketRes.data.messages || [];
        const internalNotes = messages.filter((m: { is_internal: boolean }) => m.is_internal).map(transformInternalNote);
        const ticketMessages = messages.filter((m: { is_internal: boolean }) => !m.is_internal).map(transformTicketMessage);
        setSelectedTicket({
          ...transformTicket(rawTicket),
          messages: ticketMessages,
          internalNotes: internalNotes
        });
        loadTickets();
      }
      setNewMessage('');
      showToast('Mensaje enviado');
    } catch (err) {
      console.error('Error sending message:', err);
      // Fallback to local update
      const msg: TicketMessage = {
        id: Date.now(), sender: 'support', senderName: 'Soporte Demo',
        message: newMessage, timestamp: new Date().toLocaleString('es-ES'), isRead: true
      };
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, msg] });
      setNewMessage('');
      showToast('Mensaje enviado');
    }
  };

  const handleAddInternalNote = async () => {
    if (!newInternalNote.trim() || !selectedTicket) return;
    try {
      await supportAgentAPI.addInternalNote(selectedTicket.id, newInternalNote);
      const res = await supportAgentAPI.getTicket(selectedTicket.id);
      if (res.data.ticket) {
        const rawTicket = res.data.ticket;
        const messages = res.data.messages || [];
        const internalNotes = messages.filter((m: { is_internal: boolean }) => m.is_internal).map(transformInternalNote);
        const ticketMessages = messages.filter((m: { is_internal: boolean }) => !m.is_internal).map(transformTicketMessage);
        setSelectedTicket({
          ...transformTicket(rawTicket),
          messages: ticketMessages,
          internalNotes: internalNotes
        });
      }
      setNewInternalNote('');
      showToast('Nota interna añadida');
    } catch (err) {
      console.error('Error adding note:', err);
      const note: InternalNote = { id: Date.now(), author: 'Soporte Demo', note: newInternalNote, timestamp: new Date().toLocaleString('es-ES') };
      setSelectedTicket({ ...selectedTicket, internalNotes: [...selectedTicket.internalNotes, note] });
      setNewInternalNote('');
      showToast('Nota interna añadida');
    }
  };

  const handleAssignTicket = async (ticket: Ticket) => {
    try {
      await supportAgentAPI.updateTicket(ticket.id, { assigned_to: 'Soporte Demo', status: 'in_progress' });
      loadTickets();
      if (selectedTicket?.id === ticket.id) {
        const res = await supportAgentAPI.getTicket(ticket.id);
        const rawTicket = res.data.ticket;
        const messages = res.data.messages || [];
        const internalNotes = messages.filter((m: { is_internal: boolean }) => m.is_internal).map(transformInternalNote);
        const ticketMessages = messages.filter((m: { is_internal: boolean }) => !m.is_internal).map(transformTicketMessage);
        setSelectedTicket({
          ...transformTicket(rawTicket),
          messages: ticketMessages,
          internalNotes: internalNotes
        });
      }
      showToast('Ticket asignado');
    } catch (err) {
      console.error('Error assigning ticket:', err);
      const history: TicketHistory = { id: Date.now(), action: 'Asignado', by: 'Sistema', timestamp: new Date().toLocaleString('es-ES'), details: 'Asignado a Soporte Demo' };
      const updated = tickets.map(t => t.id === ticket.id ? { ...t, assignedTo: 'Soporte Demo', status: 'in_progress' as const, history: [...t.history, history] } : t);
      setTickets(updated);
      showToast('Ticket asignado');
    }
  };

  const handleResolveTicket = async () => {
    if (!selectedTicket) return;
    try {
      await supportAgentAPI.updateTicket(selectedTicket.id, { status: 'resolved' });
      loadTickets();
      setSelectedTicket(null);
      showToast('Ticket resuelto');
    } catch (err) {
      console.error('Error resolving ticket:', err);
      const history: TicketHistory = { id: Date.now(), action: 'Resuelto', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: '' };
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'resolved' as const, updatedAt: new Date().toLocaleString('es-ES'), history: [...t.history, history] } : t);
      setTickets(updated);
    setSelectedTicket({ ...selectedTicket, status: 'resolved', history: [...selectedTicket.history, history] });
    showToast('Ticket resuelto');
    }
  };

  const handleEscalateTicket = async () => {
    if (!selectedTicket || !escalateReason.trim()) return;
    try {
      await supportAgentAPI.escalateTicket(selectedTicket.id, escalateTo, escalateReason);
      loadTickets();
      const res = await supportAgentAPI.getTicket(selectedTicket.id);
      const rawTicket = res.data.ticket;
      const messages = res.data.messages || [];
      const internalNotes = messages.filter((m: { is_internal: boolean }) => m.is_internal).map(transformInternalNote);
      const ticketMessages = messages.filter((m: { is_internal: boolean }) => !m.is_internal).map(transformTicketMessage);
      setSelectedTicket({
        ...transformTicket(rawTicket),
        messages: ticketMessages,
        internalNotes: internalNotes
      });
      setShowEscalateModal(false);
      setEscalateReason('');
      showToast('Ticket escalado correctamente');
    } catch (err) {
      console.error('Error escalating ticket:', err);
      const history: TicketHistory = { id: Date.now(), action: 'Escalado', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: `Escalado a ${escalateTo}: ${escalateReason}` };
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, status: 'escalated' as const, escalatedTo: escalateTo, history: [...t.history, history] } : t);
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, status: 'escalated', escalatedTo: escalateTo, history: [...selectedTicket.history, history] });
      setShowEscalateModal(false);
      setEscalateReason('');
      showToast('Ticket escalado correctamente');
    }
  };

  const handleTransferTicket = async () => {
    if (!selectedTicket || !transferTo) return;
    try {
      await supportAgentAPI.updateTicket(selectedTicket.id, { assigned_to: transferTo });
      loadTickets();
      setShowTransferModal(false);
      setTransferTo('');
      showToast('Ticket transferido');
    } catch (err) {
      console.error('Error transferring ticket:', err);
      const history: TicketHistory = { id: Date.now(), action: 'Transferido', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: `Transferido a ${transferTo}` };
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, assignedTo: transferTo, history: [...t.history, history] } : t);
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, assignedTo: transferTo, history: [...selectedTicket.history, history] });
      setShowTransferModal(false);
      setTransferTo('');
      showToast('Ticket transferido');
    }
  };

  const handleMergeTickets = () => {
    if (!selectedTicket || !mergeTargetId) return;
    const targetId = parseInt(mergeTargetId);
    const targetTicket = tickets.find(t => t.id === targetId);
    if (!targetTicket) return;
    
    const mergedMessages = [...targetTicket.messages, ...selectedTicket.messages].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const history: TicketHistory = { id: Date.now(), action: 'Fusionado', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: `Fusionado con ticket #${selectedTicket.id}` };
    
    const updated = tickets.map(t => {
      if (t.id === targetId) return { ...t, messages: mergedMessages, mergedFrom: [...t.mergedFrom, selectedTicket.id], history: [...t.history, history] };
      return t;
    }).filter(t => t.id !== selectedTicket.id);
    
    setTickets(updated);
    setSelectedTicket(null);
    setShowMergeModal(false);
    setMergeTargetId('');
    showToast('Tickets fusionados');
  };

  const handleAddCollaborator = (agentId: string) => {
    if (!selectedTicket) return;
    const agent = agents.find(a => a.id === agentId);
    if (!agent || selectedTicket.collaborators.includes(agent.name)) return;
    
    const history: TicketHistory = { id: Date.now(), action: 'Colaborador añadido', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: agent.name };
    const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, collaborators: [...t.collaborators, agent.name], history: [...t.history, history] } : t);
    setTickets(updated);
    setSelectedTicket({ ...selectedTicket, collaborators: [...selectedTicket.collaborators, agent.name], history: [...selectedTicket.history, history] });
    setShowCollaboratorModal(false);
    showToast(`${agent.name} añadido como colaborador`);
  };

  const handleAddTag = async () => {
    if (!selectedTicket || !newTag.trim()) return;
    if (selectedTicket.tags.includes(newTag)) return;
    try {
      const res = await supportAgentAPI.addTicketTag(selectedTicket.id, newTag);
      const updatedTicket = transformTicket(res.data.ticket);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
      setNewTag('');
      showToast('Tag añadido');
    } catch (err) {
      console.error('Error adding tag:', err);
      // Fallback local
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, tags: [...t.tags, newTag] } : t);
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, tags: [...selectedTicket.tags, newTag] });
      setNewTag('');
      showToast('Tag añadido');
    }
  };

  const handleRemoveTag = async (tag: string) => {
    if (!selectedTicket) return;
    try {
      const res = await supportAgentAPI.removeTicketTag(selectedTicket.id, tag);
      const updatedTicket = transformTicket(res.data.ticket);
      setTickets(tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t));
      setSelectedTicket(updatedTicket);
    } catch (err) {
      console.error('Error removing tag:', err);
      // Fallback local
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, tags: t.tags.filter(tg => tg !== tag) } : t);
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, tags: selectedTicket.tags.filter(t => t !== tag) });
    }
  };

  const handleRequestRating = async () => {
    if (!selectedTicket) return;
    try {
      await supportAgentAPI.requestTicketRating(selectedTicket.id);
      // Agregar mensaje visual localmente
      const msg: TicketMessage = {
        id: Date.now(), sender: 'support', senderName: 'Sistema',
        message: '⭐ Por favor, califica tu experiencia con nuestro soporte (1-5 estrellas)', timestamp: new Date().toLocaleString('es-ES'), isRead: true
      };
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, messages: [...t.messages, msg] } : t);
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, msg] });
      setShowRatingRequestModal(false);
      showToast('Solicitud de calificación enviada');
    } catch (err) {
      console.error('Error requesting rating:', err);
      // Fallback local
      const msg: TicketMessage = {
        id: Date.now(), sender: 'support', senderName: 'Sistema',
        message: '⭐ Por favor, califica tu experiencia con nuestro soporte (1-5 estrellas)', timestamp: new Date().toLocaleString('es-ES'), isRead: true
      };
      const updated = tickets.map(t => t.id === selectedTicket.id ? { ...t, messages: [...t.messages, msg] } : t);
      setTickets(updated);
      setSelectedTicket({ ...selectedTicket, messages: [...selectedTicket.messages, msg] });
      setShowRatingRequestModal(false);
      showToast('Solicitud de calificación enviada');
    }
  };

  const handleUseSuggestedResponse = () => {
    if (!selectedTicket) return;
    const lastUserMsg = [...selectedTicket.messages].reverse().find(m => m.sender === 'user');
    if (lastUserMsg?.suggestedResponse) {
      setNewMessage(lastUserMsg.suggestedResponse);
      showToast('Respuesta sugerida aplicada');
    }
  };

  const handleExecuteMacro = (macro: Macro) => {
    if (!selectedTicket) return;
    let updatedTicket = { ...selectedTicket };
    
    macro.actions.forEach(action => {
      switch (action.type) {
        case 'reply':
          const msg: TicketMessage = { id: Date.now(), sender: 'support', senderName: 'Soporte Demo', message: action.value, timestamp: new Date().toLocaleString('es-ES'), isRead: true };
          updatedTicket = { ...updatedTicket, messages: [...updatedTicket.messages, msg] };
          break;
        case 'status':
          updatedTicket = { ...updatedTicket, status: action.value as Ticket['status'] };
          break;
        case 'tag':
          if (!updatedTicket.tags.includes(action.value)) {
            updatedTicket = { ...updatedTicket, tags: [...updatedTicket.tags, action.value] };
          }
          break;
        case 'priority':
          updatedTicket = { ...updatedTicket, priority: action.value as Ticket['priority'] };
          break;
      }
    });
    
    const updated = tickets.map(t => t.id === selectedTicket.id ? updatedTicket : t);
    setTickets(updated);
    setSelectedTicket(updatedTicket);
    setShowMacros(false);
    showToast(`Macro "${macro.name}" ejecutado`);
  };

  const handleAddAgentNote = () => {
    if (!newAgentNote.trim()) return;
    const note: AgentNote = { id: Date.now(), content: newAgentNote, createdAt: new Date().toLocaleString('es-ES'), color: agentNoteColor };
    setAgentNotes([...agentNotes, note]);
    setNewAgentNote('');
    setShowAgentNoteModal(false);
    showToast('Nota personal añadida');
  };

  const handleDeleteAgentNote = (id: number) => {
    setAgentNotes(agentNotes.filter(n => n.id !== id));
  };

  const handleAcceptChat = async (chat: LiveChat) => {
    try {
      await supportAgentAPI.acceptChat(chat.id);
      loadLiveChats();
      const res = await supportAgentAPI.getLiveChat(chat.id);
      setSelectedChat(res.data.chat);
      showToast('Chat aceptado');
    } catch (err) {
      console.error('Error accepting chat:', err);
      const updated = liveChats.map(c => c.id === chat.id ? { ...c, status: 'active' as const, assignedTo: 'Soporte Demo', waitingTime: 0 } : c);
      setLiveChats(updated);
      setSelectedChat({ ...chat, status: 'active', assignedTo: 'Soporte Demo', waitingTime: 0 });
      showToast('Chat aceptado');
    }
  };

  const handleSendChatMessage = async () => {
    if (!newMessage.trim() || !selectedChat) return;
    try {
      const res = await supportAgentAPI.sendChatMessage(selectedChat.id, newMessage);
      setSelectedChat(res.data.chat);
      loadLiveChats();
      setNewMessage('');
    } catch (err) {
      console.error('Error sending chat message:', err);
      const msg: ChatMessage = { id: Date.now(), sender: 'support', senderName: 'Soporte Demo', message: newMessage, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) };
      const updated = liveChats.map(c => c.id === selectedChat.id ? { ...c, messages: [...c.messages, msg] } : c);
      setLiveChats(updated);
      setSelectedChat({ ...selectedChat, messages: [...selectedChat.messages, msg] });
      setNewMessage('');
    }
  };

  const handleEndChat = async () => {
    if (!selectedChat) return;
    try {
      await supportAgentAPI.endChat(selectedChat.id);
      loadLiveChats();
      setSelectedChat(null);
      showToast('Chat finalizado');
    } catch (err) {
      console.error('Error ending chat:', err);
      const updated = liveChats.map(c => c.id === selectedChat.id ? { ...c, status: 'ended' as const } : c);
      setLiveChats(updated);
      setSelectedChat(null);
      showToast('Chat finalizado');
    }
  };

  const handleCreateTicketFromChat = () => {
    if (!selectedChat) return;
    const newTicket: Ticket = {
      id: Date.now(), odId: selectedChat.odId, userName: selectedChat.userName, userEmail: selectedChat.userEmail, userPhone: '',
      subject: `Chat convertido - ${selectedChat.userName}`, category: 'other', status: 'open', priority: 'medium',
      assignedTo: 'Soporte Demo', escalatedTo: null, collaborators: [], tags: ['chat-convertido'], language: selectedChat.language,
      createdAt: new Date().toLocaleString('es-ES'), updatedAt: new Date().toLocaleString('es-ES'),
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString('es-ES'),
      waitingSince: '', rating: null, mergedFrom: [],
      messages: selectedChat.messages.map((m, i) => ({ ...m, id: i + 1, isRead: true })),
      internalNotes: [], history: [{ id: 1, action: 'Ticket creado desde chat', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: '' }]
    };
    setTickets([newTicket, ...tickets]);
    showToast('Ticket creado desde chat');
  };

  const handleUseTemplate = (template: Template) => {
    let content = template.content;
    template.variables.forEach(v => { content = content.replace(`{${v}}`, `[${v}]`); });
    setNewMessage(content);
    setTemplates(templates.map(t => t.id === template.id ? { ...t, usageCount: t.usageCount + 1 } : t));
    showToast('Plantilla aplicada');
  };

  const handleToggleFavorite = (template: Template) => {
    setTemplates(templates.map(t => t.id === template.id ? { ...t, isFavorite: !t.isFavorite } : t));
  };

  const handleSaveFaq = async () => {
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    try {
      if (selectedFaq) {
        await supportAgentAPI.updateFAQ(selectedFaq.id, faqForm);
        showToast('FAQ actualizada');
      } else {
        await supportAgentAPI.createFAQ(faqForm);
        showToast('FAQ creada');
      }
      loadFAQs();
      setShowFaqModal(false);
      setSelectedFaq(null);
      setFaqForm({ question: '', answer: '', category: 'General', isPublished: true });
    } catch (err) {
      console.error('Error saving FAQ:', err);
      // Fallback to local
      if (selectedFaq) {
        setFaqs(faqs.map(f => f.id === selectedFaq.id ? { ...f, ...faqForm, updatedAt: new Date().toISOString().split('T')[0] } : f));
      } else {
        const newFaq: FAQ = { id: Date.now(), ...faqForm, views: 0, helpful: 0, notHelpful: 0, order: faqs.length + 1, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
        setFaqs([...faqs, newFaq]);
      }
      setShowFaqModal(false);
      setSelectedFaq(null);
      setFaqForm({ question: '', answer: '', category: 'General', isPublished: true });
      showToast(selectedFaq ? 'FAQ actualizada' : 'FAQ creada');
    }
  };

  const handleDeleteFaq = async (faq: FAQ) => {
    if (confirm('¿Eliminar esta FAQ?')) {
      try {
        await supportAgentAPI.deleteFAQ(faq.id);
        loadFAQs();
        showToast('FAQ eliminada');
      } catch (err) {
        console.error('Error deleting FAQ:', err);
        setFaqs(faqs.filter(f => f.id !== faq.id));
        showToast('FAQ eliminada');
      }
    }
  };

  const handleSaveTemplate = async () => {
    if (!templateForm.name.trim() || !templateForm.content.trim()) return;
    const variables = templateForm.variables.split(',').map(v => v.trim()).filter(v => v);
    try {
      if (selectedTemplate) {
        await supportAgentAPI.updateTemplate(selectedTemplate.id, { ...templateForm });
        showToast('Plantilla actualizada');
      } else {
        await supportAgentAPI.createTemplate({ ...templateForm, variables });
        showToast('Plantilla creada');
      }
      loadTemplates();
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      setTemplateForm({ name: '', shortcut: '', category: 'General', content: '', variables: '' });
    } catch (err) {
      console.error('Error saving template:', err);
      if (selectedTemplate) {
        setTemplates(templates.map(t => t.id === selectedTemplate.id ? { ...t, ...templateForm, variables } : t));
        showToast('Plantilla actualizada');
      } else {
        const newTemplate: Template = { id: Date.now(), ...templateForm, variables, usageCount: 0, isFavorite: false, createdAt: new Date().toISOString().split('T')[0] };
        setTemplates([...templates, newTemplate]);
        showToast('Plantilla creada');
      }
      setShowTemplateModal(false);
      setSelectedTemplate(null);
      setTemplateForm({ name: '', shortcut: '', category: 'General', content: '', variables: '' });
    }
  };

  const handleDeleteTemplate = async (template: Template) => {
    if (confirm('¿Eliminar esta plantilla?')) {
      try {
        await supportAgentAPI.deleteTemplate(template.id);
        loadTemplates();
        showToast('Plantilla eliminada');
      } catch (err) {
        console.error('Error deleting template:', err);
        setTemplates(templates.filter(t => t.id !== template.id));
        showToast('Plantilla eliminada');
      }
    }
  };

  // ========== CANNED RESPONSES HANDLERS ==========
  const handleCreateCannedResponse = async (data: { shortcut: string; title: string; content: string; category: string }) => {
    try {
      await supportAgentAPI.createCannedResponse(data);
      loadCannedResponses();
      showToast('Respuesta rápida creada');
    } catch (err) {
      console.error('Error creating canned response:', err);
      const newResponse: CannedResponse = { id: Date.now(), ...data };
      setCannedResponses([...cannedResponses, newResponse]);
      showToast('Respuesta rápida creada');
    }
  };

  const handleUpdateCannedResponse = async (id: number, data: { shortcut?: string; title?: string; content?: string; category?: string }) => {
    try {
      await supportAgentAPI.updateCannedResponse(id, data);
      loadCannedResponses();
      showToast('Respuesta rápida actualizada');
    } catch (err) {
      console.error('Error updating canned response:', err);
      setCannedResponses(cannedResponses.map(r => r.id === id ? { ...r, ...data } : r));
      showToast('Respuesta rápida actualizada');
    }
  };

  const handleDeleteCannedResponse = async (id: number) => {
    if (confirm('¿Eliminar esta respuesta rápida?')) {
      try {
        await supportAgentAPI.deleteCannedResponse(id);
        loadCannedResponses();
        showToast('Respuesta rápida eliminada');
      } catch (err) {
        console.error('Error deleting canned response:', err);
        setCannedResponses(cannedResponses.filter(r => r.id !== id));
        showToast('Respuesta rápida eliminada');
      }
    }
  };

  // ========== MACROS HANDLERS ==========
  const handleCreateMacro = async (data: { name: string; description?: string; actions: MacroAction[] }) => {
    try {
      await supportAgentAPI.createMacro({ name: data.name, description: data.description, actions: JSON.stringify(data.actions) });
      loadMacros();
      showToast('Macro creado');
    } catch (err) {
      console.error('Error creating macro:', err);
      const newMacro: Macro = { id: Date.now(), name: data.name, actions: data.actions };
      setMacros([...macros, newMacro]);
      showToast('Macro creado');
    }
  };

  const handleUpdateMacro = async (id: number, data: { name?: string; description?: string; actions?: MacroAction[] }) => {
    try {
      await supportAgentAPI.updateMacro(id, { 
        name: data.name, 
        description: data.description, 
        actions: data.actions ? JSON.stringify(data.actions) : undefined 
      });
      loadMacros();
      showToast('Macro actualizado');
    } catch (err) {
      console.error('Error updating macro:', err);
      setMacros(macros.map(m => m.id === id ? { ...m, ...data } : m));
      showToast('Macro actualizado');
    }
  };

  const handleDeleteMacro = async (id: number) => {
    if (confirm('¿Eliminar este macro?')) {
      try {
        await supportAgentAPI.deleteMacro(id);
        loadMacros();
        showToast('Macro eliminado');
      } catch (err) {
        console.error('Error deleting macro:', err);
        setMacros(macros.filter(m => m.id !== id));
        showToast('Macro eliminado');
      }
    }
  };

  const handleSaveKnowledge = async () => {
    if (!knowledgeForm.title.trim() || !knowledgeForm.content.trim()) return;
    const tags = knowledgeForm.tags.split(',').map(t => t.trim()).filter(t => t);
    try {
      if (selectedArticle) {
        await supportAgentAPI.updateKnowledgeArticle(selectedArticle.id, { ...knowledgeForm, tags });
        showToast('Artículo actualizado');
      } else {
        await supportAgentAPI.createKnowledgeArticle({ ...knowledgeForm, tags });
        showToast('Artículo creado');
      }
      loadKnowledge();
    } catch (err) {
      console.error('Error saving knowledge:', err);
      if (selectedArticle) {
        setKnowledgeArticles(knowledgeArticles.map(a => a.id === selectedArticle.id ? { ...a, ...knowledgeForm, tags, updatedAt: new Date().toISOString().split('T')[0] } : a));
        showToast('Artículo actualizado');
      } else {
        const newArticle: KnowledgeArticle = { id: Date.now(), ...knowledgeForm, tags, author: 'Soporte Demo', views: 0, relatedArticles: [], createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
        setKnowledgeArticles([...knowledgeArticles, newArticle]);
        showToast('Artículo creado');
      }
    }
    setShowKnowledgeModal(false);
    setSelectedArticle(null);
    setKnowledgeForm({ title: '', category: 'Procesos', content: '', tags: '', isPublished: true });
  };

  const handleDeleteKnowledge = async (article: KnowledgeArticle) => {
    if (confirm('¿Eliminar este artículo?')) {
      try {
        await supportAgentAPI.deleteKnowledgeArticle(article.id);
        loadKnowledge();
        showToast('Artículo eliminado');
      } catch (err) {
        console.error('Error deleting knowledge:', err);
        setKnowledgeArticles(knowledgeArticles.filter(a => a.id !== article.id));
        showToast('Artículo eliminado');
      }
    }
  };

  const handleAddUserNote = async () => {
    if (!newUserNote.trim() || !selectedUser) return;
    try {
      await supportAgentAPI.addUserNote(selectedUser.id, newUserNote);
      // Reload user data
      const res = await supportAgentAPI.getUser(selectedUser.id);
      if (res.data.user) {
        const transformedUser = transformUser(res.data.user);
        transformedUser.notes = (res.data.notes || []).map(transformUserNote);
        setSelectedUser(transformedUser);
        setUsers(users.map(u => u.id === selectedUser.id ? transformedUser : u));
      }
      setNewUserNote('');
      setShowUserNoteModal(false);
      showToast('Nota agregada');
    } catch (err) {
      console.error('Error adding user note:', err);
      const note: UserNote = { id: Date.now(), note: newUserNote, author: 'Soporte Demo', createdAt: new Date().toISOString().split('T')[0] };
      const updated = users.map(u => u.id === selectedUser.id ? { ...u, notes: [...u.notes, note] } : u);
      setUsers(updated);
      setSelectedUser({ ...selectedUser, notes: [...selectedUser.notes, note] });
      setNewUserNote('');
      setShowUserNoteModal(false);
      showToast('Nota añadida al usuario');
    }
  };

  const handleSendInternalMessage = async () => {
    if (!newInternalMessage.trim()) return;
    try {
      await supportAgentAPI.sendInternalMessage(newInternalMessage, 'general');
      loadInternalMessages();
      setNewInternalMessage('');
    } catch (err) {
      console.error('Error sending internal message:', err);
      const msg: InternalMessage = { id: Date.now(), senderId: 'support-demo', senderName: 'Soporte Demo', senderRole: 'support', message: newInternalMessage, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), isRead: false };
      setInternalMessages([...internalMessages, msg]);
      setNewInternalMessage('');
    }
  };

  const handleMarkNotificationRead = async (id: number) => {
    try {
      await supportAgentAPI.markNotificationRead(id);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch (err) {
      console.error('Error marking notification read:', err);
      setNotifications(notifications.map(n => n.id === id ? { ...n, isRead: true } : n));
    }
  };

  const handleMarkAllNotificationsRead = async () => {
    try {
      await supportAgentAPI.markAllNotificationsRead();
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Error marking all notifications read:', err);
      setNotifications(notifications.map(n => ({ ...n, isRead: true })));
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };


  // Chart data
  const ticketsChartData = {
    labels: reportPeriod === 'week' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      { label: 'Tickets Recibidos', data: reportPeriod === 'week' ? [12, 19, 15, 22, 18, 8, 5] : [65, 72, 58, 80], borderColor: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)', fill: true, tension: 0.4 },
      { label: 'Tickets Resueltos', data: reportPeriod === 'week' ? [10, 17, 14, 20, 16, 7, 4] : [60, 68, 55, 75], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
    ]
  };

  const categoryChartData = {
    labels: ['Retiros', 'Depósitos', 'Cuenta', 'Trading', 'Verificación', 'Otros'],
    datasets: [{ data: [35, 20, 15, 12, 10, 8], backgroundColor: ['#ef4444', '#f59e0b', '#3b82f6', '#8b5cf6', '#10b981', '#6b7280'] }]
  };

  const satisfactionChartData = {
    labels: ['Satisfecho', 'Neutral', 'Insatisfecho'],
    datasets: [{ data: [75, 18, 7], backgroundColor: ['#10b981', '#f59e0b', '#ef4444'] }]
  };

  const responseTimeChartData = {
    labels: reportPeriod === 'week' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [{ label: 'Tiempo Promedio (min)', data: reportPeriod === 'week' ? [15, 12, 18, 10, 14, 8, 6] : [14, 12, 15, 11], backgroundColor: '#8b5cf6' }]
  };

  // Menu items
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'tickets', label: 'Tickets', icon: MessageSquare, badge: stats.openTickets },
    { id: 'queue', label: 'Cola SLA', icon: Timer, badge: stats.slaAtRisk },
    { id: 'chat', label: 'Chat en Vivo', icon: MessageCircle, badge: stats.waitingChats },
    { id: 'users', label: 'Usuarios', icon: Users },
    { id: 'faq', label: 'FAQ', icon: HelpCircle },
    { id: 'templates', label: 'Plantillas', icon: FileText },
    { id: 'knowledge', label: 'Base de Conocimiento', icon: BookOpen },
    { id: 'reports', label: 'Reportes', icon: PieChart },
    { id: 'internal', label: 'Chat Interno', icon: Headphones },
    { id: 'settings', label: 'Configuración', icon: Settings },
  ];

  // Render Dashboard - EXPANDED VERSION
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Agent Notes - Sticky Notes */}
      <div className="flex gap-3 overflow-x-auto pb-2">
        {agentNotes.map(note => (
          <div key={note.id} className="min-w-[200px] p-3 rounded-lg border relative" style={{ backgroundColor: `${note.color}20`, borderColor: note.color }}>
            <button onClick={() => handleDeleteAgentNote(note.id)} className="absolute top-1 right-1 p-1 hover:bg-black/20 rounded"><X className="w-3 h-3 text-gray-400" /></button>
            <p className="text-white text-sm pr-4">{note.content}</p>
            <p className="text-gray-400 text-xs mt-1">{note.createdAt}</p>
          </div>
        ))}
        <button onClick={() => setShowAgentNoteModal(true)} className="min-w-[100px] p-3 rounded-lg border border-dashed border-gray-600 flex items-center justify-center text-gray-400 hover:border-gray-500 hover:text-gray-300">
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* SLA Alerts Banner */}
      {tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed' && getSLAStatus(t.slaDeadline).text === 'Vencido').length > 0 && (
        <div className="bg-red-500/20 border border-red-500/50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-500 animate-pulse" />
            <div>
              <p className="text-red-400 font-medium">¡Alerta SLA!</p>
              <p className="text-red-300 text-sm">{tickets.filter(t => t.status !== 'resolved' && t.status !== 'closed' && getSLAStatus(t.slaDeadline).text === 'Vencido').length} tickets han excedido su tiempo de respuesta</p>
            </div>
          </div>
          <button onClick={() => setCurrentView('queue')} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Ver Cola SLA</button>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <button onClick={() => setCurrentView('tickets')} className="bg-[#1a1a2e] hover:bg-[#252540] border border-gray-800 rounded-xl p-4 text-left transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/20 rounded-lg"><MessageSquare className="w-5 h-5 text-blue-500" /></div>
            <span className="text-white font-medium">Nuevo Ticket</span>
          </div>
          <p className="text-gray-400 text-xs">Crear ticket manualmente</p>
        </button>
        <button onClick={() => setCurrentView('chat')} className="bg-[#1a1a2e] hover:bg-[#252540] border border-gray-800 rounded-xl p-4 text-left transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-500/20 rounded-lg"><MessageCircle className="w-5 h-5 text-green-500" /></div>
            <span className="text-white font-medium">Atender Chat</span>
          </div>
          <p className="text-gray-400 text-xs">{stats.waitingChats} en espera</p>
        </button>
        <button onClick={() => setCurrentView('queue')} className="bg-[#1a1a2e] hover:bg-[#252540] border border-gray-800 rounded-xl p-4 text-left transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-500/20 rounded-lg"><Timer className="w-5 h-5 text-orange-500" /></div>
            <span className="text-white font-medium">Cola SLA</span>
          </div>
          <p className="text-gray-400 text-xs">{stats.slaAtRisk} tickets activos</p>
        </button>
        <button onClick={() => setCurrentView('knowledge')} className="bg-[#1a1a2e] hover:bg-[#252540] border border-gray-800 rounded-xl p-4 text-left transition-all">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-500/20 rounded-lg"><BookOpen className="w-5 h-5 text-purple-500" /></div>
            <span className="text-white font-medium">Base Conocimiento</span>
          </div>
          <p className="text-gray-400 text-xs">{knowledgeArticles.length} artículos</p>
        </button>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800 hover:border-blue-500/50 transition-all cursor-pointer" onClick={() => setCurrentView('tickets')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Tickets Abiertos</p>
              <p className="text-2xl font-bold text-white">{stats.openTickets}</p>
              <p className="text-xs text-blue-400 mt-1">+{Math.floor(Math.random() * 5)} hoy</p>
            </div>
            <div className="p-3 bg-blue-500/20 rounded-lg"><MessageSquare className="w-6 h-6 text-blue-500" /></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800 hover:border-yellow-500/50 transition-all cursor-pointer" onClick={() => setTicketFilter({...ticketFilter, status: 'in_progress'})}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">En Progreso</p>
              <p className="text-2xl font-bold text-white">{stats.inProgressTickets}</p>
              <p className="text-xs text-yellow-400 mt-1">Asignados a ti</p>
            </div>
            <div className="p-3 bg-yellow-500/20 rounded-lg"><Clock className="w-6 h-6 text-yellow-500" /></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800 hover:border-green-500/50 transition-all cursor-pointer" onClick={() => setCurrentView('chat')}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Chats Activos</p>
              <p className="text-2xl font-bold text-white">{stats.activeChats}</p>
              <p className="text-xs text-green-400 mt-1">{stats.waitingChats} en espera</p>
            </div>
            <div className="p-3 bg-green-500/20 rounded-lg"><MessageCircle className="w-6 h-6 text-green-500" /></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800 hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Calificación</p>
              <p className="text-2xl font-bold text-white">{stats.avgRating} ⭐</p>
              <p className="text-xs text-purple-400 mt-1">Promedio mensual</p>
            </div>
            <div className="p-3 bg-purple-500/20 rounded-lg"><Star className="w-6 h-6 text-purple-500" /></div>
          </div>
        </div>
      </div>

      {/* Secondary Stats with Progress */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Esperando</p>
            <span className="text-purple-500 text-lg font-bold">{stats.waitingTickets}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${Math.min((stats.waitingTickets / stats.totalTickets) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Escalados</p>
            <span className="text-orange-500 text-lg font-bold">{stats.escalatedTickets}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-orange-500 h-1.5 rounded-full" style={{ width: `${Math.min((stats.escalatedTickets / stats.totalTickets) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Resueltos Hoy</p>
            <span className="text-green-500 text-lg font-bold">{stats.resolvedToday}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${Math.min((stats.resolvedToday / 10) * 100, 100)}%` }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Tiempo Resp.</p>
            <span className="text-blue-500 text-lg font-bold">{stats.avgResponseTime}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Satisfacción</p>
            <span className="text-green-500 text-lg font-bold">{stats.satisfactionRate}%</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${stats.satisfactionRate}%` }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <p className="text-gray-400 text-sm">Total Tickets</p>
            <span className="text-white text-lg font-bold">{stats.totalTickets}</span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-1.5">
            <div className="bg-gray-500 h-1.5 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>
      </div>

      {/* Team Status */}
      <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Users className="w-5 h-5 text-blue-400" />Estado del Equipo</h3>
          <span className="text-xs text-gray-400">{agents.filter(a => a.status === 'available').length} disponibles</span>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {agents.map(agent => (
            <div key={agent.id} className="flex items-center gap-3 p-3 bg-[#0f0f1a] rounded-lg min-w-[200px]">
              <div className="relative">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{agent.name.charAt(0)}</div>
                <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f1a] ${getAgentStatusColor(agent.status)}`}></span>
              </div>
              <div className="flex-1">
                <p className="text-white text-sm font-medium">{agent.name}</p>
                <p className="text-gray-400 text-xs">{agent.ticketCount} tickets</p>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs ${agent.status === 'available' ? 'bg-green-500/20 text-green-400' : agent.status === 'busy' ? 'bg-yellow-500/20 text-yellow-400' : agent.status === 'away' ? 'bg-orange-500/20 text-orange-400' : 'bg-red-500/20 text-red-400'}`}>
                {agent.status === 'available' ? 'Disponible' : agent.status === 'busy' ? 'Ocupado' : agent.status === 'away' ? 'Ausente' : 'No Molestar'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tickets por Día</h3>
            <div className="flex gap-2">
              <button className="px-3 py-1 bg-blue-600 text-white text-xs rounded-lg">Semana</button>
              <button className="px-3 py-1 bg-[#0f0f1a] text-gray-400 text-xs rounded-lg hover:bg-[#252540]">Mes</button>
            </div>
          </div>
          <Line data={ticketsChartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(75, 85, 99, 0.2)' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(75, 85, 99, 0.2)' } } } }} />
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Por Categoría</h3>
          <div className="h-48 flex items-center justify-center">
            <Doughnut data={categoryChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af', boxWidth: 12, padding: 8 } } } }} />
          </div>
        </div>
      </div>

      {/* Performance & Satisfaction */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" />Tiempo de Respuesta</h3>
          <Bar data={responseTimeChartData} options={{ responsive: true, plugins: { legend: { display: false } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { display: false } }, y: { ticks: { color: '#9ca3af' }, grid: { color: 'rgba(75, 85, 99, 0.2)' } } } }} />
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><ThumbsUp className="w-5 h-5 text-blue-400" />Satisfacción del Cliente</h3>
          <div className="h-48 flex items-center justify-center">
            <Doughnut data={satisfactionChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: '#9ca3af' } } } }} />
          </div>
          <div className="grid grid-cols-3 gap-2 mt-4">
            <div className="text-center p-2 bg-green-500/10 rounded-lg">
              <p className="text-green-400 font-bold">75%</p>
              <p className="text-xs text-gray-400">Satisfecho</p>
            </div>
            <div className="text-center p-2 bg-yellow-500/10 rounded-lg">
              <p className="text-yellow-400 font-bold">18%</p>
              <p className="text-xs text-gray-400">Neutral</p>
            </div>
            <div className="text-center p-2 bg-red-500/10 rounded-lg">
              <p className="text-red-400 font-bold">7%</p>
              <p className="text-xs text-gray-400">Insatisfecho</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity - Expanded */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets Recientes */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><MessageSquare className="w-5 h-5 text-blue-400" />Tickets Recientes</h3>
            <button onClick={() => setCurrentView('tickets')} className="text-blue-400 text-xs hover:underline">Ver todos →</button>
          </div>
          <div className="space-y-3">
            {tickets.slice(0, 5).map(ticket => (
              <div key={ticket.id} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg cursor-pointer hover:bg-[#252540] transition-all" onClick={() => { setSelectedTicket(ticket); setCurrentView('tickets'); }}>
                <div className="flex items-center gap-3">
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(ticket.status)}`}></span>
                  <div>
                    <p className="text-white text-sm font-medium line-clamp-1">{ticket.subject.substring(0, 25)}...</p>
                    <p className="text-gray-400 text-xs">{ticket.userName} {getLanguageFlag(ticket.language)}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className={`px-2 py-0.5 rounded text-xs ${getSLAStatus(ticket.slaDeadline).color}`}>{getSLAStatus(ticket.slaDeadline).text}</span>
                  <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>{getPriorityText(ticket.priority)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chats en Espera */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><MessageCircle className="w-5 h-5 text-green-400" />Chats en Espera</h3>
            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">{stats.waitingChats} esperando</span>
          </div>
          <div className="space-y-3">
            {liveChats.filter(c => c.status === 'waiting').map(chat => (
              <div key={chat.id} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">{chat.userName.charAt(0)}</div>
                  <div>
                    <p className="text-white text-sm font-medium">{chat.userName} {getLanguageFlag(chat.language)}</p>
                    <p className="text-gray-400 text-xs flex items-center gap-1">
                      <Timer className="w-3 h-3 text-yellow-500" /> {getTimeInQueue(chat.waitingTime)} en espera
                    </p>
                  </div>
                </div>
                <button onClick={() => handleAcceptChat(chat)} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all">Aceptar</button>
              </div>
            ))}
            {liveChats.filter(c => c.status === 'waiting').length === 0 && (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-green-500/30 mx-auto mb-2" />
                <p className="text-gray-400">No hay chats en espera</p>
                <p className="text-gray-500 text-xs">¡Buen trabajo!</p>
              </div>
            )}
          </div>
        </div>

        {/* Actividad Reciente del Sistema */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><History className="w-5 h-5 text-purple-400" />Actividad Reciente</h3>
          </div>
          <div className="space-y-3">
            {[
              { icon: CheckCircle, color: 'text-green-400', bg: 'bg-green-500/20', text: 'Ticket #1004 resuelto', time: 'Hace 5 min' },
              { icon: ArrowUp, color: 'text-orange-400', bg: 'bg-orange-500/20', text: 'Ticket #1003 escalado', time: 'Hace 15 min' },
              { icon: MessageCircle, color: 'text-blue-400', bg: 'bg-blue-500/20', text: 'Nuevo chat de Pedro S.', time: 'Hace 20 min' },
              { icon: Star, color: 'text-yellow-400', bg: 'bg-yellow-500/20', text: 'Calificación 5⭐ recibida', time: 'Hace 30 min' },
              { icon: UserPlus, color: 'text-purple-400', bg: 'bg-purple-500/20', text: 'Colaborador añadido #1003', time: 'Hace 45 min' },
            ].map((activity, idx) => (
              <div key={idx} className="flex items-center gap-3 p-2 hover:bg-[#0f0f1a] rounded-lg transition-all">
                <div className={`p-2 ${activity.bg} rounded-lg`}><activity.icon className={`w-4 h-4 ${activity.color}`} /></div>
                <div className="flex-1">
                  <p className="text-white text-sm">{activity.text}</p>
                  <p className="text-gray-500 text-xs">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Popular & Templates Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><HelpCircle className="w-5 h-5 text-blue-400" />FAQ Más Consultadas</h3>
            <button onClick={() => setCurrentView('faq')} className="text-blue-400 text-xs hover:underline">Ver todas →</button>
          </div>
          <div className="space-y-2">
            {faqs.slice(0, 4).map(faq => (
              <div key={faq.id} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg hover:bg-[#252540] cursor-pointer transition-all" onClick={() => { setSelectedFaq(faq); setCurrentView('faq'); }}>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">{faq.category}</span>
                  <p className="text-white text-sm line-clamp-1">{faq.question}</p>
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs">
                  <Eye className="w-3 h-3" /> {faq.views}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Plantillas Favoritas</h3>
            <button onClick={() => setCurrentView('templates')} className="text-blue-400 text-xs hover:underline">Ver todas →</button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {templates.filter(t => t.isFavorite).slice(0, 4).map(template => (
              <button key={template.id} onClick={() => handleUseTemplate(template)} className="p-3 bg-[#0f0f1a] rounded-lg hover:bg-[#252540] text-left transition-all">
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-yellow-400 text-xs">{template.shortcut}</code>
                </div>
                <p className="text-white text-sm font-medium">{template.name}</p>
                <p className="text-gray-500 text-xs mt-1">{template.usageCount} usos</p>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tickets por Prioridad - Resumen Visual */}
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-orange-400" />Distribución por Prioridad</h3>
        <div className="grid grid-cols-4 gap-4">
          {[
            { priority: 'urgent', label: 'Urgente', color: 'red', count: tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved' && t.status !== 'closed').length },
            { priority: 'high', label: 'Alta', color: 'orange', count: tickets.filter(t => t.priority === 'high' && t.status !== 'resolved' && t.status !== 'closed').length },
            { priority: 'medium', label: 'Media', color: 'yellow', count: tickets.filter(t => t.priority === 'medium' && t.status !== 'resolved' && t.status !== 'closed').length },
            { priority: 'low', label: 'Baja', color: 'green', count: tickets.filter(t => t.priority === 'low' && t.status !== 'resolved' && t.status !== 'closed').length },
          ].map(item => (
            <div key={item.priority} className={`p-4 bg-${item.color}-500/10 border border-${item.color}-500/30 rounded-xl text-center cursor-pointer hover:bg-${item.color}-500/20 transition-all`} onClick={() => { setTicketFilter({...ticketFilter, priority: item.priority}); setCurrentView('tickets'); }}>
              <p className={`text-3xl font-bold text-${item.color}-400`}>{item.count}</p>
              <p className="text-gray-400 text-sm mt-1">{item.label}</p>
              <div className={`w-full bg-gray-700 rounded-full h-1 mt-2`}>
                <div className={`bg-${item.color}-500 h-1 rounded-full`} style={{ width: `${Math.min((item.count / stats.totalTickets) * 100, 100)}%` }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Render Queue View (SLA Priority) - EXPANDED
  const filteredQueueTickets = queueTickets.filter(t => {
    if (queueFilter.sla !== 'all') {
      const slaStatus = getSLAStatus(t.slaDeadline).text.toLowerCase();
      if (queueFilter.sla === 'critical' && slaStatus !== 'vencido' && slaStatus !== 'crítico') return false;
      if (queueFilter.sla === 'warning' && slaStatus !== 'próximo') return false;
      if (queueFilter.sla === 'ok' && slaStatus !== 'ok') return false;
    }
    if (queueFilter.priority !== 'all' && t.priority !== queueFilter.priority) return false;
    if (queueFilter.assigned === 'mine' && t.assignedTo !== 'Soporte Demo') return false;
    if (queueFilter.assigned === 'unassigned' && t.assignedTo) return false;
    return true;
  }).sort((a, b) => {
    if (queueSort === 'sla') return new Date(a.slaDeadline).getTime() - new Date(b.slaDeadline).getTime();
    if (queueSort === 'priority') {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleBulkAssign = () => {
    selectedQueueTickets.forEach(id => {
      const ticket = tickets.find(t => t.id === id);
      if (ticket && !ticket.assignedTo) handleAssignTicket(ticket);
    });
    setSelectedQueueTickets([]);
    showToast(`${selectedQueueTickets.length} tickets asignados`);
  };

  const handleBulkEscalate = () => {
    setTickets(tickets.map(t => selectedQueueTickets.includes(t.id) ? { ...t, status: 'escalated' as const, escalatedTo: 'Operador' } : t));
    setSelectedQueueTickets([]);
    showToast(`${selectedQueueTickets.length} tickets escalados`);
  };

  const toggleQueueTicketSelection = (id: number) => {
    setSelectedQueueTickets(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const selectAllQueueTickets = () => {
    if (selectedQueueTickets.length === filteredQueueTickets.length) {
      setSelectedQueueTickets([]);
    } else {
      setSelectedQueueTickets(filteredQueueTickets.map(t => t.id));
    }
  };

  const renderQueue = () => (
    <div className="space-y-4">
      {/* Header con Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-400 text-sm">Vencidos</p>
              <p className="text-3xl font-bold text-red-500">{queueTickets.filter(t => getSLAStatus(t.slaDeadline).text === 'Vencido').length}</p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500/50 animate-pulse" />
          </div>
          <p className="text-red-400/70 text-xs mt-2">Requieren atención inmediata</p>
        </div>
        <div className="bg-orange-500/20 border border-orange-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-400 text-sm">Críticos</p>
              <p className="text-3xl font-bold text-orange-500">{queueTickets.filter(t => getSLAStatus(t.slaDeadline).text === 'Crítico').length}</p>
            </div>
            <Clock className="w-10 h-10 text-orange-500/50" />
          </div>
          <p className="text-orange-400/70 text-xs mt-2">Menos de 1 hora</p>
        </div>
        <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 text-sm">Próximos</p>
              <p className="text-3xl font-bold text-yellow-500">{queueTickets.filter(t => getSLAStatus(t.slaDeadline).text === 'Próximo').length}</p>
            </div>
            <Timer className="w-10 h-10 text-yellow-500/50" />
          </div>
          <p className="text-yellow-400/70 text-xs mt-2">1-2 horas restantes</p>
        </div>
        <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-400 text-sm">En Tiempo</p>
              <p className="text-3xl font-bold text-green-500">{queueTickets.filter(t => getSLAStatus(t.slaDeadline).text === 'OK').length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500/50" />
          </div>
          <p className="text-green-400/70 text-xs mt-2">Más de 2 horas</p>
        </div>
      </div>

      {/* Alerta de SLA Vencidos */}
      {queueTickets.filter(t => getSLAStatus(t.slaDeadline).text === 'Vencido').length > 0 && (
        <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-4 flex items-center justify-between animate-pulse">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-8 h-8 text-red-500" />
            <div>
              <p className="text-red-400 font-bold">¡ALERTA CRÍTICA!</p>
              <p className="text-red-300 text-sm">{queueTickets.filter(t => getSLAStatus(t.slaDeadline).text === 'Vencido').length} tickets han excedido su SLA. Acción inmediata requerida.</p>
            </div>
          </div>
          <button onClick={() => setQueueFilter({ ...queueFilter, sla: 'critical' })} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium">Ver Vencidos</button>
        </div>
      )}

      {/* Filtros y Acciones */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold text-white flex items-center gap-2">
              <Timer className="w-6 h-6 text-blue-400" />Cola Priorizada por SLA
            </h2>
            <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm">{filteredQueueTickets.length} tickets</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => { setTickets([...tickets]); showToast('Cola actualizada'); }} className="p-2 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg transition-all" title="Actualizar">
              <RefreshCw className="w-5 h-5 text-gray-400" />
            </button>
            <button onClick={() => { const data = filteredQueueTickets.map(t => `${t.id},${t.userName},${t.subject},${getSLAStatus(t.slaDeadline).text},${t.priority}`).join('\n'); const blob = new Blob([`ID,Usuario,Asunto,SLA,Prioridad\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'cola-sla.csv'; a.click(); showToast('Cola exportada'); }} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-3 flex-wrap">
          <select value={queueFilter.sla} onChange={e => setQueueFilter({ ...queueFilter, sla: e.target.value })} className="px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
            <option value="all">🕐 Todos los SLA</option>
            <option value="critical">🔴 Vencidos/Críticos</option>
            <option value="warning">🟡 Próximos</option>
            <option value="ok">🟢 En Tiempo</option>
          </select>
          <select value={queueFilter.priority} onChange={e => setQueueFilter({ ...queueFilter, priority: e.target.value })} className="px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
            <option value="all">⚡ Todas las Prioridades</option>
            <option value="urgent">🔴 Urgente</option>
            <option value="high">🟠 Alta</option>
            <option value="medium">🟡 Media</option>
            <option value="low">🟢 Baja</option>
          </select>
          <select value={queueFilter.assigned} onChange={e => setQueueFilter({ ...queueFilter, assigned: e.target.value })} className="px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
            <option value="all">👥 Todos</option>
            <option value="mine">👤 Mis Tickets</option>
            <option value="unassigned">❓ Sin Asignar</option>
          </select>
          <div className="flex items-center gap-1 bg-[#0f0f1a] border border-gray-700 rounded-lg p-1">
            <button onClick={() => setQueueSort('sla')} className={`px-3 py-1 rounded text-sm ${queueSort === 'sla' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>SLA</button>
            <button onClick={() => setQueueSort('priority')} className={`px-3 py-1 rounded text-sm ${queueSort === 'priority' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Prioridad</button>
            <button onClick={() => setQueueSort('created')} className={`px-3 py-1 rounded text-sm ${queueSort === 'created' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Fecha</button>
          </div>
          {(queueFilter.sla !== 'all' || queueFilter.priority !== 'all' || queueFilter.assigned !== 'all') && (
            <button onClick={() => setQueueFilter({ sla: 'all', priority: 'all', assigned: 'all' })} className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 flex items-center gap-1">
              <X className="w-4 h-4" /> Limpiar
            </button>
          )}
        </div>

        {/* Acciones en Lote */}
        {selectedQueueTickets.length > 0 && (
          <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center justify-between">
            <span className="text-blue-400 text-sm">{selectedQueueTickets.length} tickets seleccionados</span>
            <div className="flex items-center gap-2">
              <button onClick={handleBulkAssign} className="px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-1">
                <UserPlus className="w-4 h-4" /> Asignarme Todos
              </button>
              <button onClick={handleBulkEscalate} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg flex items-center gap-1">
                <ArrowUp className="w-4 h-4" /> Escalar Todos
              </button>
              <button onClick={() => setSelectedQueueTickets([])} className="px-3 py-1.5 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg">
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de Cola */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 p-4 border-b border-gray-800 text-sm text-gray-400 font-medium bg-[#0f0f1a]">
          <div className="col-span-1 flex items-center">
            <input type="checkbox" checked={selectedQueueTickets.length === filteredQueueTickets.length && filteredQueueTickets.length > 0} onChange={selectAllQueueTickets} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600" />
          </div>
          <span className="col-span-1">SLA</span>
          <span className="col-span-1">ID</span>
          <span className="col-span-3">Asunto</span>
          <span className="col-span-2">Usuario</span>
          <span className="col-span-1">Prioridad</span>
          <span className="col-span-1">Estado</span>
          <span className="col-span-2">Acciones</span>
        </div>
        <div className="divide-y divide-gray-800 max-h-[500px] overflow-y-auto">
          {filteredQueueTickets.length === 0 ? (
            <div className="p-8 text-center">
              <CheckCircle className="w-16 h-16 text-green-500/30 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">¡Cola vacía!</p>
              <p className="text-gray-500 text-sm">No hay tickets que coincidan con los filtros</p>
            </div>
          ) : (
            filteredQueueTickets.map((ticket, idx) => {
              const sla = getSLAStatus(ticket.slaDeadline);
              const isSelected = selectedQueueTickets.includes(ticket.id);
              return (
                <div key={ticket.id} className={`grid grid-cols-12 gap-2 p-4 items-center transition-all ${isSelected ? 'bg-blue-500/10' : idx % 2 === 0 ? 'bg-[#1a1a2e]' : 'bg-[#0f0f1a]'} hover:bg-[#252540]`}>
                  <div className="col-span-1">
                    <input type="checkbox" checked={isSelected} onChange={() => toggleQueueTicketSelection(ticket.id)} className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600" />
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${sla.color} ${sla.text === 'Vencido' ? 'animate-pulse' : ''}`}>{sla.text}</span>
                  </div>
                  <span className="col-span-1 text-gray-400 text-sm font-mono">#{ticket.id}</span>
                  <div className="col-span-3">
                    <p className="text-white text-sm font-medium truncate">{ticket.subject}</p>
                    <p className="text-gray-500 text-xs">{ticket.category} • {ticket.createdAt.split(' ')[1]}</p>
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">{ticket.userName.charAt(0)}</div>
                    <div>
                      <p className="text-white text-sm">{ticket.userName}</p>
                      <p className="text-gray-500 text-xs">{getLanguageFlag(ticket.language)} {ticket.odId}</p>
                    </div>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>{getPriorityText(ticket.priority)}</span>
                  </div>
                  <div className="col-span-1">
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(ticket.status)} bg-opacity-20 text-white`}>{getStatusText(ticket.status)}</span>
                  </div>
                  <div className="col-span-2 flex gap-1">
                    <button onClick={() => { setSelectedTicket(ticket); setCurrentView('tickets'); }} className="px-2 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-all flex items-center gap-1" title="Ver Detalle">
                      <Eye className="w-3 h-3" /> Ver
                    </button>
                    {!ticket.assignedTo ? (
                      <button onClick={() => handleAssignTicket(ticket)} className="px-2 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-all flex items-center gap-1" title="Tomar Ticket">
                        <UserPlus className="w-3 h-3" /> Tomar
                      </button>
                    ) : (
                      <span className="px-2 py-1.5 bg-gray-700 text-gray-400 text-xs rounded flex items-center gap-1">
                        <User className="w-3 h-3" /> {ticket.assignedTo.split(' ')[0]}
                      </span>
                    )}
                    <button onClick={() => { setSelectedTicket(ticket); setShowEscalateModal(true); }} className="px-2 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-xs rounded transition-all" title="Escalar">
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Resumen de Tiempo */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Clock className="w-4 h-4 text-blue-400" />Tiempo Promedio en Cola</h4>
          <p className="text-3xl font-bold text-blue-400">45 min</p>
          <p className="text-gray-500 text-xs mt-1">Meta: 30 min</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '75%' }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-green-400" />Tasa de Cumplimiento SLA</h4>
          <p className="text-3xl font-bold text-green-400">87%</p>
          <p className="text-gray-500 text-xs mt-1">Meta: 95%</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '87%' }}></div>
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <h4 className="text-white font-medium mb-3 flex items-center gap-2"><BarChart3 className="w-4 h-4 text-purple-400" />Tickets Resueltos Hoy</h4>
          <p className="text-3xl font-bold text-purple-400">{stats.resolvedToday}</p>
          <p className="text-gray-500 text-xs mt-1">Meta diaria: 15</p>
          <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
            <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${Math.min((stats.resolvedToday / 15) * 100, 100)}%` }}></div>
          </div>
        </div>
      </div>
    </div>
  );


  // Render Tickets View - EXPANDED
  const renderTickets = () => (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Tickets List */}
      <div className={`${selectedTicket ? 'w-1/3' : 'w-full'} bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col`}>
        {/* Header con Stats */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-blue-400" />Tickets
            </h2>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">{tickets.filter(t => t.status === 'open').length} abiertos</span>
              <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">{tickets.filter(t => t.status === 'in_progress').length} en progreso</span>
            </div>
          </div>
          
          {/* Búsqueda */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por ID, usuario, asunto..." value={ticketFilter.search} onChange={e => setTicketFilter({ ...ticketFilter, search: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 transition-all" />
          </div>
          
          {/* Filtros expandidos */}
          <div className="flex gap-2 flex-wrap">
            <select value={ticketFilter.status} onChange={e => setTicketFilter({ ...ticketFilter, status: e.target.value })} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
              <option value="all">📋 Todos ({tickets.length})</option>
              <option value="open">🔵 Abierto ({tickets.filter(t => t.status === 'open').length})</option>
              <option value="in_progress">🟡 En Progreso ({tickets.filter(t => t.status === 'in_progress').length})</option>
              <option value="waiting">🟣 Esperando ({tickets.filter(t => t.status === 'waiting').length})</option>
              <option value="escalated">🟠 Escalado ({tickets.filter(t => t.status === 'escalated').length})</option>
              <option value="resolved">🟢 Resuelto ({tickets.filter(t => t.status === 'resolved').length})</option>
            </select>
            <select value={ticketFilter.priority} onChange={e => setTicketFilter({ ...ticketFilter, priority: e.target.value })} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
              <option value="all">⚡ Prioridad</option>
              <option value="urgent">🔴 Urgente</option>
              <option value="high">🟠 Alta</option>
              <option value="medium">🟡 Media</option>
              <option value="low">🟢 Baja</option>
            </select>
            <select value={ticketFilter.category} onChange={e => setTicketFilter({ ...ticketFilter, category: e.target.value })} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
              <option value="all">📁 Categoría</option>
              <option value="withdrawal">💸 Retiros</option>
              <option value="deposit">💰 Depósitos</option>
              <option value="account">👤 Cuenta</option>
              <option value="trading">📈 Trading</option>
              <option value="verification">✅ Verificación</option>
            </select>
            {(ticketFilter.status !== 'all' || ticketFilter.priority !== 'all' || ticketFilter.category !== 'all' || ticketFilter.search) && (
              <button onClick={() => setTicketFilter({ status: 'all', priority: 'all', category: 'all', search: '' })} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 flex items-center gap-1">
                <X className="w-3 h-3" /> Limpiar
              </button>
            )}
          </div>
          
          {/* Info y acciones */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
            <span className="text-xs text-gray-400">{filteredTickets.length} tickets</span>
            <div className="flex gap-2">
              <button onClick={() => { const data = filteredTickets.map(t => `${t.id},${t.userName},${t.subject},${t.status},${t.priority}`).join('\n'); const blob = new Blob([`ID,Usuario,Asunto,Estado,Prioridad\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'tickets.csv'; a.click(); showToast('Tickets exportados'); }} className="px-2 py-1 bg-[#0f0f1a] text-gray-400 rounded text-xs hover:bg-[#252540] flex items-center gap-1">
                <Download className="w-3 h-3" /> CSV
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Tickets */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredTickets.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <Search className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No se encontraron tickets</p>
              <p className="text-gray-500 text-sm">Ajusta los filtros de búsqueda</p>
            </div>
          ) : (
            filteredTickets.map(ticket => (
              <div key={ticket.id} onClick={() => setSelectedTicket(ticket)} className={`p-3 rounded-lg cursor-pointer transition-all ${selectedTicket?.id === ticket.id ? 'bg-blue-600/20 border border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-[#0f0f1a] hover:bg-[#252540] border border-transparent hover:border-gray-700'}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(ticket.status)} ${ticket.status === 'open' ? 'animate-pulse' : ''}`}></span>
                    <span className="text-gray-400 text-xs font-mono">#{ticket.id}</span>
                    <span>{getLanguageFlag(ticket.language)}</span>
                    {ticket.messages.some(m => !m.isRead && m.sender === 'user') && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" title="Sin leer"></span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`px-1.5 py-0.5 rounded text-xs ${getSLAStatus(ticket.slaDeadline).color}`}>{getSLAStatus(ticket.slaDeadline).text}</span>
                    <span className={`px-1.5 py-0.5 rounded text-xs ${getPriorityColor(ticket.priority)}`}>{getPriorityText(ticket.priority)}</span>
                  </div>
                </div>
                <p className="text-white text-sm font-medium mb-1 line-clamp-1">{ticket.subject}</p>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-2">
                  <span className="flex items-center gap-1"><User className="w-3 h-3" /> {ticket.userName}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {ticket.createdAt.split(' ')[1]}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {ticket.assignedTo && (
                      <span className="px-1.5 py-0.5 bg-green-500/20 rounded text-xs text-green-400">Asignado</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    {ticket.collaborators.length > 0 && (
                      <span className="text-xs text-blue-400"><UserPlus className="w-3 h-3 inline" /> {ticket.collaborators.length}</span>
                    )}
                    {ticket.internalNotes.length > 0 && (
                      <span className="text-xs text-yellow-400 ml-1">📝 {ticket.internalNotes.length}</span>
                    )}
                    <span className="text-xs text-gray-500 ml-1">💬 {ticket.messages.length}</span>
                  </div>
                </div>
                {ticket.tags.length > 0 && (
                  <div className="flex items-center gap-1 mt-2 flex-wrap">
                    {ticket.tags.slice(0, 3).map(tag => (
                      <span key={tag} className="px-1.5 py-0.5 bg-blue-500/20 rounded text-xs text-blue-400">#{tag}</span>
                    ))}
                    {ticket.tags.length > 3 && <span className="text-xs text-gray-500">+{ticket.tags.length - 3}</span>}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Ticket Detail - EXPANDED */}
      {selectedTicket && (
        <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
          {/* Header Mejorado */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedTicket(null)} className="p-1.5 hover:bg-gray-700 rounded-lg transition-all"><X className="w-5 h-5 text-gray-400" /></button>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">#{selectedTicket.id}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedTicket.status)} bg-opacity-20 text-white`}>{getStatusText(selectedTicket.status)}</span>
                    <span className={`px-2 py-1 rounded text-xs ${getPriorityColor(selectedTicket.priority)}`}>{getPriorityText(selectedTicket.priority)}</span>
                    <span>{getLanguageFlag(selectedTicket.language)}</span>
                  </div>
                  <p className="text-gray-400 text-xs mt-1">Creado: {selectedTicket.createdAt} • SLA: {getSLAStatus(selectedTicket.slaDeadline).text}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => setShowMacros(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Macros"><Zap className="w-4 h-4 text-yellow-500" /></button>
                <button onClick={() => setShowTagModal(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Tags"><Tag className="w-4 h-4 text-blue-400" /></button>
                <button onClick={() => setShowCollaboratorModal(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Colaboradores"><UserPlus className="w-4 h-4 text-green-400" /></button>
                <button onClick={() => setShowMergeModal(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Fusionar"><Merge className="w-4 h-4 text-purple-400" /></button>
                <button onClick={() => setShowTransferModal(true)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Transferir"><Copy className="w-4 h-4 text-orange-400" /></button>
                <button onClick={() => { navigator.clipboard.writeText(`Ticket #${selectedTicket.id}: ${selectedTicket.subject}`); showToast('Copiado al portapapeles'); }} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Copiar"><Link2 className="w-4 h-4 text-gray-400" /></button>
              </div>
            </div>
            
            {/* Asunto y Usuario */}
            <p className="text-white font-medium text-lg mb-2">{selectedTicket.subject}</p>
            <div className="flex items-center gap-4 text-sm text-gray-400 mb-3">
              <span className="flex items-center gap-1 hover:text-white cursor-pointer" onClick={() => { setSelectedUser(users.find(u => u.odId === selectedTicket.odId) || null); setCurrentView('users'); }}><User className="w-4 h-4" /> {selectedTicket.userName}</span>
              <span className="flex items-center gap-1"><Mail className="w-4 h-4" /> {selectedTicket.userEmail}</span>
              <span className="flex items-center gap-1"><Phone className="w-4 h-4" /> {selectedTicket.userPhone}</span>
            </div>
            
            {/* Tags */}
            <div className="flex items-center gap-2 flex-wrap mb-3">
              {selectedTicket.tags.map(tag => (
                <span key={tag} className="px-2 py-1 bg-blue-500/20 rounded-lg text-xs text-blue-400 flex items-center gap-1">
                  #{tag}
                  <button onClick={() => handleRemoveTag(tag)} className="hover:text-red-400 transition-colors"><X className="w-3 h-3" /></button>
                </span>
              ))}
              <button onClick={() => setShowTagModal(true)} className="px-2 py-1 border border-dashed border-gray-600 rounded-lg text-xs text-gray-400 hover:border-blue-500 hover:text-blue-400 transition-all">+ Tag</button>
            </div>
            
            {/* Acciones principales */}
            <div className="flex items-center gap-2 flex-wrap">
              {selectedTicket.status === 'open' && !selectedTicket.assignedTo && (
                <button onClick={() => handleAssignTicket(selectedTicket)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg font-medium transition-all flex items-center gap-2">
                  <UserPlus className="w-4 h-4" /> Asignarme
                </button>
              )}
              {selectedTicket.status !== 'resolved' && selectedTicket.status !== 'closed' && (
                <>
                  <select onChange={(e) => { if (e.target.value) { setTickets(tickets.map(t => t.id === selectedTicket.id ? { ...t, status: e.target.value as Ticket['status'] } : t)); setSelectedTicket({ ...selectedTicket, status: e.target.value as Ticket['status'] }); showToast(`Estado cambiado a ${e.target.value}`); } }} value="" className="px-3 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
                    <option value="">Cambiar estado...</option>
                    <option value="in_progress">En Progreso</option>
                    <option value="waiting">Esperando</option>
                    <option value="resolved">Resuelto</option>
                  </select>
                  <button onClick={() => setShowEscalateModal(true)} className="px-3 py-2 bg-orange-600 hover:bg-orange-700 text-white text-sm rounded-lg transition-all flex items-center gap-1"><ArrowUp className="w-4 h-4" /> Escalar</button>
                  <button onClick={handleResolveTicket} className="px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Resolver</button>
                  <button onClick={() => setShowRatingRequestModal(true)} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg transition-all flex items-center gap-1"><Star className="w-4 h-4" /> Rating</button>
                </>
              )}
              {selectedTicket.rating && (
                <span className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">{'⭐'.repeat(selectedTicket.rating)} Calificado</span>
              )}
            </div>
          </div>

          {/* Tabs Mejorados */}
          <div className="flex border-b border-gray-800 px-2">
            {[
              { id: 'conversation', label: 'Conversación', icon: MessageSquare, count: selectedTicket.messages.length },
              { id: 'notes', label: 'Notas', icon: FileText, count: selectedTicket.internalNotes.length },
              { id: 'history', label: 'Historial', icon: History, count: selectedTicket.history.length },
              { id: 'user', label: 'Usuario', icon: User, count: null },
            ].map(tab => (
              <button key={tab.id} onClick={() => setTicketTab(tab.id as typeof ticketTab)} className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 transition-all ${ticketTab === tab.id ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent hover:text-white'}`}>
                <tab.icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== null && tab.count > 0 && <span className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">{tab.count}</span>}
              </button>
            ))}
          </div>

          {/* Tab Content - EXPANDED */}
          <div className="flex-1 overflow-y-auto p-4">
            {ticketTab === 'conversation' && (
              <div className="space-y-4">
                {selectedTicket.messages.length === 0 ? (
                  <div className="text-center py-8">
                    <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No hay mensajes aún</p>
                  </div>
                ) : (
                  selectedTicket.messages.map(msg => (
                    <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[75%] ${msg.sender === 'support' ? '' : 'flex gap-3'}`}>
                        {msg.sender === 'user' && (
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {selectedTicket.userName.charAt(0)}
                          </div>
                        )}
                        <div className={`p-4 rounded-2xl ${msg.sender === 'support' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-[#0f0f1a] text-white rounded-bl-md border border-gray-700'}`}>
                          {msg.sender === 'user' && <p className="text-xs text-blue-400 mb-1 font-medium">{msg.senderName}</p>}
                          <p className="text-sm leading-relaxed">{msg.message}</p>
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {msg.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2 p-2 bg-black/20 rounded-lg">
                                  <Paperclip className="w-4 h-4" />
                                  <span className="text-xs">{att.name}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <div className={`text-xs mt-2 flex items-center gap-2 ${msg.sender === 'support' ? 'text-blue-200' : 'text-gray-500'}`}>
                            <span>{msg.timestamp}</span>
                            {msg.sender === 'support' && msg.isRead && <CheckCircle className="w-3 h-3" />}
                          </div>
                          {msg.suggestedResponse && msg.sender === 'user' && (
                            <button onClick={handleUseSuggestedResponse} className="mt-3 px-3 py-1.5 bg-purple-500/30 hover:bg-purple-500/50 rounded-lg text-xs flex items-center gap-2 transition-all">
                              <Sparkles className="w-3 h-3" /> Usar respuesta sugerida por IA
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
            )}

            {ticketTab === 'notes' && (
              <div className="space-y-3">
                {selectedTicket.internalNotes.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">No hay notas internas</p>
                    <p className="text-gray-500 text-sm">Las notas son visibles solo para el equipo</p>
                  </div>
                ) : (
                  selectedTicket.internalNotes.map(note => (
                    <div key={note.id} className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
                      <p className="text-white text-sm leading-relaxed">{note.note}</p>
                      <div className="flex items-center justify-between mt-3">
                        <p className="text-gray-400 text-xs flex items-center gap-2">
                          <User className="w-3 h-3" /> {note.author} • {note.timestamp}
                        </p>
                        <button className="text-xs text-red-400 hover:text-red-300">Eliminar</button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {ticketTab === 'history' && (
              <div className="space-y-3">
                {selectedTicket.history.length === 0 ? (
                  <div className="text-center py-8">
                    <History className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                    <p className="text-gray-400">Sin historial de cambios</p>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-700"></div>
                    {selectedTicket.history.map((h, idx) => (
                      <div key={h.id} className="flex items-start gap-4 p-3 relative">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center z-10 ${idx === 0 ? 'bg-blue-500' : 'bg-gray-700'}`}>
                          <History className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 bg-[#0f0f1a] p-3 rounded-lg">
                          <p className="text-white text-sm font-medium">{h.action}</p>
                          <p className="text-gray-400 text-xs mt-1">{h.by} • {h.timestamp}</p>
                          {h.details && <p className="text-gray-500 text-xs mt-2 p-2 bg-gray-800/50 rounded">{h.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {ticketTab === 'user' && (
              <div className="space-y-4">
                {(() => {
                  const user = users.find(u => u.odId === selectedTicket.odId);
                  if (!user) return (
                    <div className="text-center py-8">
                      <User className="w-12 h-12 text-gray-600 mx-auto mb-2" />
                      <p className="text-gray-400">Usuario no encontrado</p>
                    </div>
                  );
                  return (
                    <>
                      {/* Info del usuario */}
                      <div className="flex items-center gap-4 p-4 bg-[#0f0f1a] rounded-xl">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                          {user.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-white font-medium text-lg">{user.name}</h4>
                            {user.verified && <CheckCircle className="w-4 h-4 text-green-500" />}
                            <span className={`px-2 py-0.5 rounded text-xs ${getRiskColor(user.riskLevel)} bg-opacity-20`}>{user.riskLevel.toUpperCase()}</span>
                          </div>
                          <p className="text-gray-400 text-sm">{user.odId} • {user.email}</p>
                          <p className="text-gray-500 text-xs mt-1">Registrado: {user.registeredAt} • Último login: {user.lastLogin}</p>
                        </div>
                        <button onClick={() => { setSelectedUser(user); setCurrentView('users'); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Ver perfil</button>
                      </div>
                      
                      {/* Stats financieros */}
                      <div className="grid grid-cols-4 gap-3">
                        <div className="bg-[#0f0f1a] p-4 rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Balance</p>
                          <p className="text-green-400 font-bold text-lg">${user.balance.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#0f0f1a] p-4 rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Depósitos</p>
                          <p className="text-blue-400 font-bold text-lg">${user.totalDeposits.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#0f0f1a] p-4 rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Retiros</p>
                          <p className="text-orange-400 font-bold text-lg">${user.totalWithdrawals.toLocaleString()}</p>
                        </div>
                        <div className="bg-[#0f0f1a] p-4 rounded-xl text-center">
                          <p className="text-gray-400 text-xs mb-1">Rating</p>
                          <p className="text-yellow-400 font-bold text-lg">{user.avgRating} ⭐</p>
                        </div>
                      </div>
                      
                      {/* Historial de tickets */}
                      <div>
                        <h4 className="text-white font-medium mb-3 flex items-center gap-2"><MessageSquare className="w-4 h-4 text-blue-400" />Historial de Tickets ({tickets.filter(t => t.odId === user.odId).length})</h4>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {tickets.filter(t => t.odId === user.odId).map(t => (
                            <div key={t.id} onClick={() => setSelectedTicket(t)} className={`p-3 bg-[#0f0f1a] rounded-lg cursor-pointer hover:bg-[#252540] flex items-center justify-between ${t.id === selectedTicket.id ? 'border border-blue-500' : ''}`}>
                              <div className="flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${getStatusColor(t.status)}`}></span>
                                <span className="text-white text-sm">#{t.id} - {t.subject.substring(0, 30)}...</span>
                              </div>
                              <div className="flex items-center gap-2">
                                {t.rating && <span className="text-yellow-500 text-sm">{'⭐'.repeat(t.rating)}</span>}
                                <span className={`px-2 py-0.5 rounded text-xs ${getPriorityColor(t.priority)}`}>{getPriorityText(t.priority)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </div>

          {/* Reply Box - EXPANDED */}
          <div className="p-4 border-t border-gray-800 bg-[#0f0f1a]/50">
            {/* Quick Actions */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2">
              <button onClick={() => setShowCannedResponses(true)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1 whitespace-nowrap transition-all"><Command className="w-3 h-3" /> Respuestas Rápidas</button>
              <button onClick={() => setCurrentView('templates')} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1 whitespace-nowrap transition-all"><FileText className="w-3 h-3" /> Plantillas</button>
              <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1 whitespace-nowrap transition-all"><Paperclip className="w-3 h-3" /> Adjuntar</button>
              <button className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg flex items-center gap-1 whitespace-nowrap transition-all"><Smile className="w-3 h-3" /> Emoji</button>
            </div>
            
            {/* Message Input */}
            <div className="flex gap-2 mb-3">
              <div className="flex-1 relative">
                <input ref={messageInputRef} type="text" value={newMessage} onChange={e => setNewMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendTicketMessage()} placeholder="Escribe tu respuesta... (usa / para atajos)" className="w-full px-4 py-3 bg-[#1a1a2e] border border-gray-700 rounded-xl text-white focus:border-blue-500 transition-all" />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">{newMessage.length}/1000</span>
              </div>
              <button onClick={handleSendTicketMessage} disabled={!newMessage.trim()} className="px-5 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl transition-all"><Send className="w-5 h-5" /></button>
            </div>
            
            {/* Internal Note */}
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <input type="text" value={newInternalNote} onChange={e => setNewInternalNote(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleAddInternalNote()} placeholder="📝 Añadir nota interna (solo visible para el equipo)..." className="w-full px-4 py-2.5 bg-yellow-500/10 border border-yellow-500/30 rounded-xl text-white text-sm focus:border-yellow-500 transition-all" />
              </div>
              <button onClick={handleAddInternalNote} disabled={!newInternalNote.trim()} className="px-4 py-2.5 bg-yellow-600 hover:bg-yellow-700 disabled:opacity-50 text-white rounded-xl text-sm transition-all">Nota</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );


  // Render Live Chat View - EXPANDED
  const filteredChats = liveChats.filter(c => {
    if (chatFilter === 'waiting' && c.status !== 'waiting') return false;
    if (chatFilter === 'active' && c.status !== 'active') return false;
    if (chatFilter === 'ended' && c.status !== 'ended') return false;
    if (chatSearch && !c.userName.toLowerCase().includes(chatSearch.toLowerCase()) && !c.odId.toLowerCase().includes(chatSearch.toLowerCase())) return false;
    return true;
  });

  const handleTransferChat = (agentId: string) => {
    if (!selectedChat) return;
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return;
    setLiveChats(liveChats.map(c => c.id === selectedChat.id ? { ...c, assignedTo: agent.name } : c));
    showToast(`Chat transferido a ${agent.name}`);
  };

  const handleAddChatNote = () => {
    if (!newChatNote.trim() || !selectedChat) return;
    setChatNotes([...chatNotes, { chatId: selectedChat.id, note: newChatNote }]);
    setNewChatNote('');
    showToast('Nota añadida al chat');
  };

  const handleRequestChatRating = () => {
    if (!selectedChat) return;
    const msg: ChatMessage = { id: Date.now(), sender: 'support', senderName: 'Sistema', message: '⭐ ¿Cómo calificarías esta atención? (1-5 estrellas)', timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) };
    setLiveChats(liveChats.map(c => c.id === selectedChat.id ? { ...c, messages: [...c.messages, msg] } : c));
    setSelectedChat({ ...selectedChat, messages: [...selectedChat.messages, msg] });
    showToast('Solicitud de calificación enviada');
  };

  const handleSendQuickReply = (content: string) => {
    if (!selectedChat) return;
    const msg: ChatMessage = { id: Date.now(), sender: 'support', senderName: 'Soporte Demo', message: content, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }) };
    setLiveChats(liveChats.map(c => c.id === selectedChat.id ? { ...c, messages: [...c.messages, msg] } : c));
    setSelectedChat({ ...selectedChat, messages: [...selectedChat.messages, msg] });
    setShowQuickReplies(false);
  };

  const quickReplies = [
    { id: 1, text: '¡Hola! ¿En qué puedo ayudarte hoy?', category: 'Saludo' },
    { id: 2, text: 'Dame un momento mientras reviso tu información...', category: 'Espera' },
    { id: 3, text: '¿Podrías proporcionarme más detalles sobre tu consulta?', category: 'Info' },
    { id: 4, text: 'Tu solicitud ha sido procesada correctamente.', category: 'Confirmación' },
    { id: 5, text: '¿Hay algo más en lo que pueda ayudarte?', category: 'Cierre' },
    { id: 6, text: 'Gracias por contactarnos. ¡Que tengas un excelente día!', category: 'Despedida' },
  ];

  const renderLiveChat = () => (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Panel Izquierdo - Lista de Chats */}
      <div className="w-96 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        {/* Header con Stats */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-green-400" />Chat en Vivo
            </h3>
            <div className="flex items-center gap-1">
              {stats.waitingChats > 0 && (
                <span className="px-2 py-1 bg-yellow-500/20 text-yellow-500 text-xs rounded-full animate-pulse">{stats.waitingChats} en espera</span>
              )}
            </div>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2 text-center">
              <p className="text-yellow-400 text-lg font-bold">{stats.waitingChats}</p>
              <p className="text-yellow-400/70 text-xs">Espera</p>
            </div>
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-2 text-center">
              <p className="text-green-400 text-lg font-bold">{stats.activeChats}</p>
              <p className="text-green-400/70 text-xs">Activos</p>
            </div>
            <div className="bg-gray-500/10 border border-gray-500/30 rounded-lg p-2 text-center">
              <p className="text-gray-400 text-lg font-bold">{liveChats.filter(c => c.status === 'ended').length}</p>
              <p className="text-gray-400/70 text-xs">Finalizados</p>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre o ID..." value={chatSearch} onChange={e => setChatSearch(e.target.value)} className="w-full pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm" />
          </div>

          {/* Filtros */}
          <div className="flex gap-1">
            {[
              { id: 'all', label: 'Todos', count: liveChats.length },
              { id: 'waiting', label: 'Espera', count: stats.waitingChats },
              { id: 'active', label: 'Activos', count: stats.activeChats },
              { id: 'ended', label: 'Finalizados', count: liveChats.filter(c => c.status === 'ended').length },
            ].map(f => (
              <button key={f.id} onClick={() => setChatFilter(f.id as typeof chatFilter)} className={`flex-1 px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${chatFilter === f.id ? 'bg-blue-600 text-white' : 'bg-[#0f0f1a] text-gray-400 hover:bg-[#252540]'}`}>
                {f.label} ({f.count})
              </button>
            ))}
          </div>
        </div>

        {/* Alerta de Chats en Espera */}
        {stats.waitingChats > 0 && chatFilter !== 'waiting' && (
          <div className="mx-2 mt-2 p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-yellow-500 animate-pulse" />
              <span className="text-yellow-400 text-xs">{stats.waitingChats} clientes esperando</span>
            </div>
            <button onClick={() => setChatFilter('waiting')} className="px-2 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-xs rounded">Ver</button>
          </div>
        )}

        {/* Lista de Chats */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <MessageCircle className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No hay chats</p>
              <p className="text-gray-500 text-sm">Los nuevos chats aparecerán aquí</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <div key={chat.id} onClick={() => setSelectedChat(chat)} className={`p-3 rounded-xl cursor-pointer transition-all ${selectedChat?.id === chat.id ? 'bg-blue-600/20 border border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-[#0f0f1a] hover:bg-[#252540] border border-transparent hover:border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{chat.userName.charAt(0)}</div>
                    <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1a1a2e] ${chat.status === 'waiting' ? 'bg-yellow-500 animate-pulse' : chat.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-white font-medium flex items-center gap-1">
                        {chat.userName} {getLanguageFlag(chat.language)}
                      </p>
                      <span className="text-gray-500 text-xs">{chat.startedAt.split(' ')[1]}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{chat.messages[chat.messages.length - 1]?.message || 'Sin mensajes'}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-gray-500 text-xs">{chat.odId}</span>
                      {chat.status === 'waiting' && (
                        <span className="text-yellow-500 text-xs flex items-center gap-1">
                          <Timer className="w-3 h-3" /> {getTimeInQueue(chat.waitingTime)}
                        </span>
                      )}
                      {chat.status === 'active' && chat.assignedTo && (
                        <span className="text-green-400 text-xs">👤 {chat.assignedTo.split(' ')[0]}</span>
                      )}
                    </div>
                  </div>
                </div>
                {chat.isTyping && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                      <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                    </div>
                    <span className="text-blue-400 text-xs italic">Escribiendo...</span>
                  </div>
                )}
                {chat.status === 'waiting' && (
                  <button onClick={(e) => { e.stopPropagation(); handleAcceptChat(chat); }} className="w-full mt-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg font-medium transition-all flex items-center justify-center gap-2">
                    <Headphones className="w-4 h-4" /> Aceptar Chat
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Footer con Agentes */}
        <div className="p-3 border-t border-gray-800">
          <p className="text-gray-400 text-xs mb-2">Agentes disponibles</p>
          <div className="flex gap-2">
            {agents.filter(a => a.status === 'available').map(agent => (
              <div key={agent.id} className="flex items-center gap-1 px-2 py-1 bg-[#0f0f1a] rounded-lg" title={agent.name}>
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span className="text-gray-300 text-xs">{agent.name.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Panel Central - Área de Chat */}
      {selectedChat ? (
        <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
          {/* Header del Chat Expandido */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{selectedChat.userName.charAt(0)}</div>
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1a1a2e] ${selectedChat.status === 'active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-white font-semibold text-lg">{selectedChat.userName}</p>
                    <span>{getLanguageFlag(selectedChat.language)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${selectedChat.status === 'active' ? 'bg-green-500/20 text-green-400' : selectedChat.status === 'waiting' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                      {selectedChat.status === 'active' ? 'Activo' : selectedChat.status === 'waiting' ? 'En Espera' : 'Finalizado'}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-sm">
                    <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {selectedChat.userEmail}</span>
                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {selectedChat.odId}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Inicio: {selectedChat.startedAt}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setShowChatInfo(!showChatInfo)} className={`p-2 rounded-lg transition-all ${showChatInfo ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`} title="Info del Usuario">
                  <User className="w-5 h-5" />
                </button>
                <button onClick={handleCreateTicketFromChat} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-2 transition-all">
                  <MessageSquare className="w-4 h-4" /> Crear Ticket
                </button>
                <button onClick={handleRequestChatRating} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm rounded-lg flex items-center gap-2 transition-all">
                  <Star className="w-4 h-4" /> Rating
                </button>
                {selectedChat.status === 'active' && (
                  <button onClick={handleEndChat} className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded-lg flex items-center gap-2 transition-all">
                    <XCircle className="w-4 h-4" /> Finalizar
                  </button>
                )}
              </div>
            </div>

            {/* Acciones Secundarias */}
            {selectedChat.status === 'active' && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
                <span className="text-gray-400 text-xs">Acciones:</span>
                <button onClick={() => { const agent = agents.find(a => a.id !== 'support-demo' && a.status === 'available'); if (agent) handleTransferChat(agent.id); else showToast('No hay agentes disponibles'); }} className="px-2 py-1 bg-[#0f0f1a] hover:bg-[#252540] text-gray-300 text-xs rounded-lg flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Transferir
                </button>
                <button onClick={() => { setLiveChats(liveChats.map(c => c.id === selectedChat.id ? { ...c, status: 'waiting' as const, assignedTo: null } : c)); showToast('Chat devuelto a la cola'); setSelectedChat(null); }} className="px-2 py-1 bg-[#0f0f1a] hover:bg-[#252540] text-gray-300 text-xs rounded-lg flex items-center gap-1">
                  <RefreshCw className="w-3 h-3" /> Devolver a Cola
                </button>
                <button onClick={() => { navigator.clipboard.writeText(selectedChat.messages.map(m => `[${m.timestamp}] ${m.senderName}: ${m.message}`).join('\n')); showToast('Conversación copiada'); }} className="px-2 py-1 bg-[#0f0f1a] hover:bg-[#252540] text-gray-300 text-xs rounded-lg flex items-center gap-1">
                  <Copy className="w-3 h-3" /> Copiar Chat
                </button>
              </div>
            )}
          </div>

          {/* Área de Mensajes */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Mensaje de Inicio */}
            <div className="text-center py-2">
              <span className="px-3 py-1 bg-gray-700/50 text-gray-400 text-xs rounded-full">Chat iniciado el {selectedChat.startedAt}</span>
            </div>

            {selectedChat.messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === 'support' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${msg.sender === 'user' ? 'flex gap-3' : ''}`}>
                  {msg.sender === 'user' && (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                      {selectedChat.userName.charAt(0)}
                    </div>
                  )}
                  <div className={`p-4 rounded-2xl ${msg.sender === 'support' ? 'bg-blue-600 text-white rounded-br-md' : 'bg-[#0f0f1a] text-white rounded-bl-md border border-gray-700'}`}>
                    {msg.sender === 'user' && <p className="text-xs text-blue-400 mb-1 font-medium">{msg.senderName}</p>}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                    <div className={`text-xs mt-2 flex items-center gap-2 ${msg.sender === 'support' ? 'text-blue-200' : 'text-gray-500'}`}>
                      <span>{msg.timestamp}</span>
                      {msg.sender === 'support' && <CheckCircle className="w-3 h-3" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Indicador de Escritura */}
            {selectedChat.isTyping && (
              <div className="flex justify-start">
                <div className="flex gap-3">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {selectedChat.userName.charAt(0)}
                  </div>
                  <div className="bg-[#0f0f1a] p-4 rounded-2xl rounded-bl-md border border-gray-700">
                    <div className="flex gap-1.5">
                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce"></span>
                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                      <span className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Respuestas Rápidas */}
          {showQuickReplies && (
            <div className="px-4 py-3 border-t border-gray-800 bg-[#0f0f1a]">
              <div className="flex items-center justify-between mb-2">
                <span className="text-gray-400 text-sm font-medium">Respuestas Rápidas</span>
                <button onClick={() => setShowQuickReplies(false)} className="text-gray-500 hover:text-white"><X className="w-4 h-4" /></button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {quickReplies.map(reply => (
                  <button key={reply.id} onClick={() => handleSendQuickReply(reply.text)} className="p-2 bg-[#1a1a2e] hover:bg-[#252540] rounded-lg text-left transition-all">
                    <span className="text-xs text-blue-400 mb-1 block">{reply.category}</span>
                    <span className="text-white text-sm line-clamp-1">{reply.text}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Plantillas Favoritas */}
          <div className="px-4 py-2 border-t border-gray-800 flex gap-2 overflow-x-auto">
            <button onClick={() => setShowQuickReplies(!showQuickReplies)} className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap flex items-center gap-1 ${showQuickReplies ? 'bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}>
              <Zap className="w-3 h-3" /> Rápidas
            </button>
            {templates.filter(t => t.isFavorite).slice(0, 4).map(t => (
              <button key={t.id} onClick={() => handleUseTemplate(t)} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-xs rounded-lg whitespace-nowrap flex items-center gap-1">
                <FileText className="w-3 h-3" /> {t.name}
              </button>
            ))}
            <button onClick={() => setShowCannedResponses(true)} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 text-xs rounded-lg whitespace-nowrap flex items-center gap-1">
              <Plus className="w-3 h-3" /> Más
            </button>
          </div>

          {/* Input de Mensaje Mejorado */}
          {selectedChat.status === 'active' && (
            <div className="p-4 border-t border-gray-800">
              <div className="flex gap-2 items-end">
                <div className="flex gap-1">
                  <button className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all" title="Adjuntar archivo">
                    <Paperclip className="w-5 h-5" />
                  </button>
                  <button className="p-2.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg transition-all" title="Emojis">
                    <Smile className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex-1 relative">
                  <input 
                    ref={messageInputRef}
                    type="text" 
                    value={newMessage} 
                    onChange={e => setNewMessage(e.target.value)} 
                    onKeyPress={e => e.key === 'Enter' && !e.shiftKey && handleSendChatMessage()} 
                    placeholder="Escribe un mensaje... (usa / para atajos)" 
                    className="w-full px-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-xl text-white pr-20 focus:border-blue-500 transition-all" 
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                    <span className="text-gray-500 text-xs">{newMessage.length}/500</span>
                  </div>
                </div>
                <button 
                  onClick={handleSendChatMessage} 
                  disabled={!newMessage.trim()}
                  className={`p-3 rounded-xl transition-all flex items-center gap-2 ${newMessage.trim() ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-700 text-gray-500 cursor-not-allowed'}`}
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">Enter</kbd> para enviar
                  <span>•</span>
                  <kbd className="px-1.5 py-0.5 bg-gray-700 rounded">/</kbd> para atajos
                </div>
                <span className="text-xs text-gray-500">Duración: {Math.floor((Date.now() - new Date(selectedChat.startedAt).getTime()) / 60000)} min</span>
              </div>
            </div>
          )}

          {/* Chat Finalizado */}
          {selectedChat.status === 'ended' && (
            <div className="p-4 border-t border-gray-800 bg-gray-800/50">
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="text-gray-400">Chat finalizado</p>
                <div className="flex justify-center gap-2 mt-3">
                  <button onClick={handleCreateTicketFromChat} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Crear Ticket de Seguimiento</button>
                  <button onClick={() => setSelectedChat(null)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg">Cerrar</button>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex items-center justify-center">
          <div className="text-center">
            <MessageCircle className="w-20 h-20 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">Selecciona un chat</p>
            <p className="text-gray-500 text-sm mt-1">O acepta uno de la cola de espera</p>
            {stats.waitingChats > 0 && (
              <button onClick={() => { const waitingChat = liveChats.find(c => c.status === 'waiting'); if (waitingChat) handleAcceptChat(waitingChat); }} className="mt-4 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-medium flex items-center gap-2 mx-auto">
                <Headphones className="w-5 h-5" /> Aceptar Siguiente ({stats.waitingChats})
              </button>
            )}
          </div>
        </div>
      )}

      {/* Panel Derecho - Info del Usuario */}
      {showChatInfo && selectedChat && (
        <div className="w-80 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h4 className="text-white font-medium">Información del Cliente</h4>
            <button onClick={() => setShowChatInfo(false)} className="p-1 hover:bg-gray-700 rounded"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {/* Perfil */}
            <div className="text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3">
                {selectedChat.userName.charAt(0)}
              </div>
              <h4 className="text-white font-semibold text-lg">{selectedChat.userName}</h4>
              <p className="text-gray-400 text-sm">{selectedChat.odId}</p>
            </div>

            {/* Contacto */}
            <div className="bg-[#0f0f1a] rounded-xl p-4 space-y-3">
              <h5 className="text-gray-400 text-xs font-medium uppercase">Contacto</h5>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-white text-sm">{selectedChat.userEmail}</span>
              </div>
              <div className="flex items-center gap-3">
                <Globe className="w-4 h-4 text-gray-500" />
                <span className="text-white text-sm">{getLanguageFlag(selectedChat.language)} {selectedChat.language === 'es' ? 'Español' : 'English'}</span>
              </div>
            </div>

            {/* Stats del Usuario */}
            {(() => {
              const user = users.find(u => u.odId === selectedChat.odId);
              if (!user) return null;
              return (
                <>
                  <div className="bg-[#0f0f1a] rounded-xl p-4">
                    <h5 className="text-gray-400 text-xs font-medium uppercase mb-3">Información Financiera</h5>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="text-center p-2 bg-[#1a1a2e] rounded-lg">
                        <p className="text-green-400 font-bold">${user.balance.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">Balance</p>
                      </div>
                      <div className="text-center p-2 bg-[#1a1a2e] rounded-lg">
                        <p className="text-blue-400 font-bold">${user.totalDeposits.toLocaleString()}</p>
                        <p className="text-gray-500 text-xs">Depósitos</p>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-gray-400 text-sm">Nivel de Riesgo</span>
                      <span className={`px-2 py-1 rounded text-xs ${getRiskColor(user.riskLevel)} bg-opacity-20`}>{user.riskLevel.toUpperCase()}</span>
                    </div>
                  </div>

                  <div className="bg-[#0f0f1a] rounded-xl p-4">
                    <h5 className="text-gray-400 text-xs font-medium uppercase mb-3">Historial</h5>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Tickets anteriores</span>
                        <span className="text-white font-medium">{user.ticketCount}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Calificación promedio</span>
                        <span className="text-yellow-400 font-medium">{user.avgRating} ⭐</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Verificado</span>
                        <span className={user.verified ? 'text-green-400' : 'text-red-400'}>{user.verified ? '✓ Sí' : '✗ No'}</span>
                      </div>
                    </div>
                  </div>
                </>
              );
            })()}

            {/* Notas del Chat */}
            <div className="bg-[#0f0f1a] rounded-xl p-4">
              <h5 className="text-gray-400 text-xs font-medium uppercase mb-3">Notas del Chat</h5>
              <div className="space-y-2 mb-3 max-h-32 overflow-y-auto">
                {chatNotes.filter(n => n.chatId === selectedChat.id).map((note, idx) => (
                  <div key={idx} className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-white text-xs">{note.note}</p>
                  </div>
                ))}
                {chatNotes.filter(n => n.chatId === selectedChat.id).length === 0 && (
                  <p className="text-gray-500 text-xs">Sin notas</p>
                )}
              </div>
              <div className="flex gap-2">
                <input type="text" value={newChatNote} onChange={e => setNewChatNote(e.target.value)} placeholder="Añadir nota..." className="flex-1 px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white text-sm" />
                <button onClick={handleAddChatNote} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Plus className="w-4 h-4" /></button>
              </div>
            </div>

            {/* Acciones Rápidas */}
            <div className="space-y-2">
              <button onClick={() => { setSelectedUser(users.find(u => u.odId === selectedChat.odId) || null); setCurrentView('users'); }} className="w-full px-4 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-white text-sm rounded-lg flex items-center gap-2">
                <User className="w-4 h-4" /> Ver Perfil Completo
              </button>
              <button onClick={() => { const userTickets = tickets.filter(t => t.odId === selectedChat.odId); if (userTickets.length > 0) { setSelectedTicket(userTickets[0]); setCurrentView('tickets'); } else showToast('Sin tickets previos'); }} className="w-full px-4 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-white text-sm rounded-lg flex items-center gap-2">
                <MessageSquare className="w-4 h-4" /> Ver Tickets Anteriores
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Render Users View - EXPANDED
  const extendedFilteredUsers = users.filter(u => {
    if (userFilter.status !== 'all' && u.status !== userFilter.status) return false;
    if (userFilter.verified === 'yes' && !u.verified) return false;
    if (userFilter.verified === 'no' && u.verified) return false;
    if (userFilter.risk !== 'all' && u.riskLevel !== userFilter.risk) return false;
    if (userSearch && !u.name.toLowerCase().includes(userSearch.toLowerCase()) && !u.email.toLowerCase().includes(userSearch.toLowerCase()) && !u.odId.toLowerCase().includes(userSearch.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (userSort === 'name') return a.name.localeCompare(b.name);
    if (userSort === 'balance') return b.balance - a.balance;
    if (userSort === 'tickets') return b.ticketCount - a.ticketCount;
    return new Date(b.lastLogin).getTime() - new Date(a.lastLogin).getTime();
  });

  const handleSuspendUser = (user: UserInfo) => {
    setUsers(users.map(u => u.id === user.id ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' as const } : u));
    if (selectedUser?.id === user.id) setSelectedUser({ ...user, status: user.status === 'suspended' ? 'active' : 'suspended' as const });
    showToast(user.status === 'suspended' ? 'Usuario reactivado' : 'Usuario suspendido');
  };

  const handleDeleteUserNote = (userId: number, noteId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, notes: u.notes.filter(n => n.id !== noteId) } : u));
    if (selectedUser?.id === userId) setSelectedUser({ ...selectedUser, notes: selectedUser.notes.filter(n => n.id !== noteId) });
    showToast('Nota eliminada');
  };

  const handleExportUserData = (user: UserInfo) => {
    const data = JSON.stringify(user, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `usuario-${user.odId}.json`;
    a.click();
    showToast('Datos exportados');
  };

  const handleCreateTicketForUser = (user: UserInfo) => {
    const newTicket: Ticket = {
      id: Date.now(), odId: user.odId, userName: user.name, userEmail: user.email, userPhone: user.phone,
      subject: `Nuevo ticket para ${user.name}`, category: 'other', status: 'open', priority: 'medium',
      assignedTo: 'Soporte Demo', escalatedTo: null, collaborators: [], tags: [], language: user.language,
      createdAt: new Date().toLocaleString('es-ES'), updatedAt: new Date().toLocaleString('es-ES'),
      slaDeadline: new Date(Date.now() + 4 * 60 * 60 * 1000).toLocaleString('es-ES'),
      waitingSince: '', rating: null, mergedFrom: [],
      messages: [], internalNotes: [], history: [{ id: 1, action: 'Ticket creado', by: 'Soporte Demo', timestamp: new Date().toLocaleString('es-ES'), details: 'Creado desde perfil de usuario' }]
    };
    setTickets([newTicket, ...tickets]);
    setSelectedTicket(newTicket);
    setCurrentView('tickets');
    showToast('Ticket creado');
  };

  const renderUsers = () => (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Panel Izquierdo - Lista de Usuarios */}
      <div className={`${selectedUser ? 'w-96' : 'w-full'} bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col`}>
        {/* Header con Stats */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />Usuarios
            </h3>
            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-full">{extendedFilteredUsers.length} usuarios</span>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="bg-[#0f0f1a] rounded-lg p-2 text-center">
              <p className="text-green-400 text-lg font-bold">{users.filter(u => u.status === 'active').length}</p>
              <p className="text-gray-500 text-xs">Activos</p>
            </div>
            <div className="bg-[#0f0f1a] rounded-lg p-2 text-center">
              <p className="text-blue-400 text-lg font-bold">{users.filter(u => u.verified).length}</p>
              <p className="text-gray-500 text-xs">Verificados</p>
            </div>
            <div className="bg-[#0f0f1a] rounded-lg p-2 text-center">
              <p className="text-red-400 text-lg font-bold">{users.filter(u => u.riskLevel === 'high').length}</p>
              <p className="text-gray-500 text-xs">Alto Riesgo</p>
            </div>
            <div className="bg-[#0f0f1a] rounded-lg p-2 text-center">
              <p className="text-yellow-400 text-lg font-bold">{users.filter(u => u.status === 'suspended').length}</p>
              <p className="text-gray-500 text-xs">Suspendidos</p>
            </div>
          </div>

          {/* Búsqueda */}
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por nombre, email o ID..." value={userSearch} onChange={e => setUserSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 transition-all" />
          </div>

          {/* Filtros */}
          <div className="flex gap-2 flex-wrap">
            <select value={userFilter.status} onChange={e => setUserFilter({ ...userFilter, status: e.target.value })} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
              <option value="all">📋 Todos</option>
              <option value="active">🟢 Activos</option>
              <option value="suspended">🔴 Suspendidos</option>
              <option value="pending">🟡 Pendientes</option>
            </select>
            <select value={userFilter.verified} onChange={e => setUserFilter({ ...userFilter, verified: e.target.value })} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
              <option value="all">✅ Verificación</option>
              <option value="yes">✓ Verificados</option>
              <option value="no">✗ No Verificados</option>
            </select>
            <select value={userFilter.risk} onChange={e => setUserFilter({ ...userFilter, risk: e.target.value })} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
              <option value="all">⚠️ Riesgo</option>
              <option value="low">🟢 Bajo</option>
              <option value="medium">🟡 Medio</option>
              <option value="high">🔴 Alto</option>
            </select>
          </div>

          {/* Ordenamiento */}
          <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-700">
            <span className="text-gray-400 text-xs">Ordenar:</span>
            <div className="flex gap-1 bg-[#0f0f1a] rounded-lg p-1">
              {[
                { id: 'name', label: 'Nombre' },
                { id: 'balance', label: 'Balance' },
                { id: 'tickets', label: 'Tickets' },
                { id: 'recent', label: 'Reciente' },
              ].map(s => (
                <button key={s.id} onClick={() => setUserSort(s.id as typeof userSort)} className={`px-2 py-1 rounded text-xs ${userSort === s.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>{s.label}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Lista de Usuarios */}
        <div className="flex-1 overflow-y-auto p-2 space-y-2">
          {extendedFilteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <Users className="w-12 h-12 text-gray-600 mb-3" />
              <p className="text-gray-400 font-medium">No se encontraron usuarios</p>
              <p className="text-gray-500 text-sm">Ajusta los filtros de búsqueda</p>
            </div>
          ) : (
            extendedFilteredUsers.map(user => (
              <div key={user.id} onClick={() => { setSelectedUser(user); setUserTab('info'); }} className={`p-3 rounded-xl cursor-pointer transition-all ${selectedUser?.id === user.id ? 'bg-blue-600/20 border border-blue-500 shadow-lg shadow-blue-500/10' : 'bg-[#0f0f1a] hover:bg-[#252540] border border-transparent hover:border-gray-700'}`}>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">{user.name.charAt(0)}</div>
                    <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1a1a2e] ${user.status === 'active' ? 'bg-green-500' : user.status === 'suspended' ? 'bg-red-500' : 'bg-yellow-500'}`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-white font-medium truncate">{user.name}</p>
                      {user.verified && <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />}
                      <span className="flex-shrink-0">{getLanguageFlag(user.language)}</span>
                    </div>
                    <p className="text-gray-400 text-xs truncate">{user.odId} • {user.email}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-green-400 text-xs font-medium">${user.balance.toLocaleString()}</span>
                      <span className="text-gray-600">•</span>
                      <span className="text-gray-400 text-xs">{user.ticketCount} tickets</span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`px-2 py-0.5 rounded text-xs ${user.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' : user.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{user.riskLevel.toUpperCase()}</span>
                    <span className="text-gray-500 text-xs">{user.avgRating} ⭐</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con Exportar */}
        <div className="p-3 border-t border-gray-800">
          <button onClick={() => { const data = extendedFilteredUsers.map(u => `${u.odId},${u.name},${u.email},${u.balance},${u.status},${u.riskLevel}`).join('\n'); const blob = new Blob([`ID,Nombre,Email,Balance,Estado,Riesgo\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'usuarios.csv'; a.click(); showToast('Usuarios exportados'); }} className="w-full px-4 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-gray-300 rounded-lg text-sm flex items-center justify-center gap-2">
            <Download className="w-4 h-4" /> Exportar Lista ({extendedFilteredUsers.length})
          </button>
        </div>
      </div>

      {/* Panel Derecho - Detalle del Usuario Expandido */}
      {selectedUser && (
        <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">{selectedUser.name.charAt(0)}</div>
                  <span className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-[#1a1a2e] ${selectedUser.status === 'active' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white">{selectedUser.name}</h3>
                    {selectedUser.verified && <CheckCircle className="w-5 h-5 text-green-500" />}
                    <span>{getLanguageFlag(selectedUser.language)}</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${selectedUser.riskLevel === 'low' ? 'bg-green-500/20 text-green-400' : selectedUser.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{selectedUser.riskLevel.toUpperCase()}</span>
                  </div>
                  <p className="text-gray-400">{selectedUser.odId} • {selectedUser.email}</p>
                  <p className="text-gray-500 text-sm">Último login: {selectedUser.lastLogin}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => handleCreateTicketForUser(selectedUser)} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Ticket</button>
                <button onClick={() => handleExportUserData(selectedUser)} className="px-3 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-white text-sm rounded-lg flex items-center gap-1"><Download className="w-4 h-4" /> Exportar</button>
                <button onClick={() => setSelectedUser(null)} className="p-2 hover:bg-gray-700 rounded-lg"><X className="w-5 h-5 text-gray-400" /></button>
              </div>
            </div>
            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-2 mt-4">
              <div className="bg-[#0f0f1a] rounded-lg p-2 text-center"><p className="text-green-400 font-bold">${selectedUser.balance.toLocaleString()}</p><p className="text-gray-500 text-xs">Balance</p></div>
              <div className="bg-[#0f0f1a] rounded-lg p-2 text-center"><p className="text-blue-400 font-bold">${selectedUser.totalDeposits.toLocaleString()}</p><p className="text-gray-500 text-xs">Depósitos</p></div>
              <div className="bg-[#0f0f1a] rounded-lg p-2 text-center"><p className="text-orange-400 font-bold">${selectedUser.totalWithdrawals.toLocaleString()}</p><p className="text-gray-500 text-xs">Retiros</p></div>
              <div className="bg-[#0f0f1a] rounded-lg p-2 text-center"><p className="text-purple-400 font-bold">{selectedUser.ticketCount}</p><p className="text-gray-500 text-xs">Tickets</p></div>
              <div className="bg-[#0f0f1a] rounded-lg p-2 text-center"><p className="text-yellow-400 font-bold">{selectedUser.avgRating} ⭐</p><p className="text-gray-500 text-xs">Rating</p></div>
            </div>
          </div>
          {/* Tabs */}
          <div className="flex border-b border-gray-800 px-2">
            {[{ id: 'info', label: 'Info', icon: User }, { id: 'financial', label: 'Financiero', icon: BarChart3 }, { id: 'tickets', label: 'Tickets', icon: MessageSquare }, { id: 'notes', label: 'Notas', icon: FileText }].map(tab => (
              <button key={tab.id} onClick={() => setUserTab(tab.id as typeof userTab)} className={`px-4 py-3 text-sm flex items-center gap-2 border-b-2 ${userTab === tab.id ? 'text-blue-500 border-blue-500' : 'text-gray-400 border-transparent hover:text-white'}`}><tab.icon className="w-4 h-4" />{tab.label}</button>
            ))}
          </div>
          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {userTab === 'info' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-[#0f0f1a] p-4 rounded-xl"><p className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Mail className="w-4 h-4" />Email</p><p className="text-white">{selectedUser.email}</p></div>
                <div className="bg-[#0f0f1a] p-4 rounded-xl"><p className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Phone className="w-4 h-4" />Teléfono</p><p className="text-white">{selectedUser.phone}</p></div>
                <div className="bg-[#0f0f1a] p-4 rounded-xl"><p className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Globe className="w-4 h-4" />País</p><p className="text-white">{selectedUser.country}</p></div>
                <div className="bg-[#0f0f1a] p-4 rounded-xl"><p className="text-gray-400 text-sm mb-1 flex items-center gap-2"><Clock className="w-4 h-4" />Registro</p><p className="text-white">{selectedUser.registeredAt}</p></div>
              </div>
            )}
            {userTab === 'financial' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-green-500/10 border border-green-500/30 p-6 rounded-xl text-center"><p className="text-green-400 text-sm">Balance Real</p><p className="text-3xl font-bold text-green-400">${selectedUser.balance.toLocaleString()}</p></div>
                  <div className="bg-blue-500/10 border border-blue-500/30 p-6 rounded-xl text-center"><p className="text-blue-400 text-sm">Balance Demo</p><p className="text-3xl font-bold text-blue-400">${selectedUser.demoBalance.toLocaleString()}</p></div>
                </div>
                <div className="bg-[#0f0f1a] p-4 rounded-xl">
                  <h4 className="text-white font-medium mb-3">Resumen</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between"><span className="text-gray-400">Total Depósitos</span><span className="text-white">${selectedUser.totalDeposits.toLocaleString()}</span></div>
                    <div className="flex justify-between"><span className="text-gray-400">Total Retiros</span><span className="text-white">${selectedUser.totalWithdrawals.toLocaleString()}</span></div>
                    <div className="flex justify-between border-t border-gray-700 pt-2"><span className="text-gray-400">Neto</span><span className={selectedUser.totalDeposits - selectedUser.totalWithdrawals >= 0 ? 'text-green-400' : 'text-red-400'}>${(selectedUser.totalDeposits - selectedUser.totalWithdrawals).toLocaleString()}</span></div>
                  </div>
                </div>
              </div>
            )}
            {userTab === 'tickets' && (
              <div className="space-y-2">
                {tickets.filter(t => t.odId === selectedUser.odId).length === 0 ? (
                  <div className="text-center py-8"><MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-2" /><p className="text-gray-400">Sin tickets</p></div>
                ) : tickets.filter(t => t.odId === selectedUser.odId).map(ticket => (
                  <div key={ticket.id} onClick={() => { setSelectedTicket(ticket); setCurrentView('tickets'); }} className="flex items-center justify-between bg-[#0f0f1a] p-4 rounded-xl cursor-pointer hover:bg-[#252540]">
                    <div className="flex items-center gap-3"><span className={`w-3 h-3 rounded-full ${getStatusColor(ticket.status)}`}></span><div><p className="text-white">#{ticket.id} - {ticket.subject}</p><p className="text-gray-400 text-sm">{ticket.createdAt}</p></div></div>
                    <div className="flex items-center gap-2">{ticket.rating && <span className="text-yellow-500">{'⭐'.repeat(ticket.rating)}</span>}<span className={`px-2 py-1 rounded text-xs ${getPriorityColor(ticket.priority)}`}>{getPriorityText(ticket.priority)}</span></div>
                  </div>
                ))}
              </div>
            )}
            {userTab === 'notes' && (
              <div className="space-y-3">
                <div className="flex justify-end"><button onClick={() => setShowUserNoteModal(true)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1"><Plus className="w-4 h-4" /> Añadir</button></div>
                {selectedUser.notes.length === 0 ? (
                  <div className="text-center py-8"><FileText className="w-12 h-12 text-gray-600 mx-auto mb-2" /><p className="text-gray-400">Sin notas</p></div>
                ) : selectedUser.notes.map(note => (
                  <div key={note.id} className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-xl">
                    <p className="text-white">{note.note}</p>
                    <div className="flex items-center justify-between mt-2"><p className="text-gray-400 text-sm">{note.author} • {note.createdAt}</p><button onClick={() => handleDeleteUserNote(selectedUser.id, note.id)} className="text-red-400 text-sm">Eliminar</button></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );

  // Render FAQ View - EXPANDED
  // Calculate FAQ stats
  const calculatedFaqStats = {
    totalViews: faqs.reduce((sum, f) => sum + f.views, 0),
    avgHelpful: faqs.length > 0 ? Math.round(faqs.reduce((sum, f) => sum + (f.helpful / (f.helpful + f.notHelpful || 1)) * 100, 0) / faqs.length) : 0,
    published: faqs.filter(f => f.isPublished).length,
    drafts: faqs.filter(f => !f.isPublished).length
  };

  const sortedFilteredFaqs = filteredFaqs.sort((a, b) => {
    if (faqSort === 'views') return b.views - a.views;
    if (faqSort === 'helpful') return (b.helpful / (b.helpful + b.notHelpful || 1)) - (a.helpful / (a.helpful + a.notHelpful || 1));
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDuplicateFaq = (faq: FAQ) => {
    const newFaq: FAQ = { ...faq, id: Date.now(), question: `${faq.question} (copia)`, views: 0, helpful: 0, notHelpful: 0, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
    setFaqs([...faqs, newFaq]);
    showToast('FAQ duplicada');
  };

  const handleToggleFaqPublish = (faq: FAQ) => {
    setFaqs(faqs.map(f => f.id === faq.id ? { ...f, isPublished: !f.isPublished } : f));
    showToast(faq.isPublished ? 'FAQ despublicada' : 'FAQ publicada');
  };

  const handleCopyFaqAnswer = (faq: FAQ) => {
    navigator.clipboard.writeText(faq.answer);
    showToast('Respuesta copiada');
  };

  const handleExportFaqs = () => {
    const data = faqs.map(f => `Pregunta: ${f.question}\nRespuesta: ${f.answer}\nCategoría: ${f.category}\n---`).join('\n\n');
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'faqs.txt';
    a.click();
    showToast('FAQs exportadas');
  };

  const renderFAQ = () => (
    <div className="space-y-4">
      {/* Header con Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total FAQs</p>
              <p className="text-2xl font-bold text-white">{faqs.length}</p>
            </div>
            <HelpCircle className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Publicadas</p>
              <p className="text-2xl font-bold text-green-400">{calculatedFaqStats.published}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-green-500/50" />
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">Total Vistas</p>
              <p className="text-2xl font-bold text-blue-400">{calculatedFaqStats.totalViews.toLocaleString()}</p>
            </div>
            <Eye className="w-8 h-8 text-blue-500/50" />
          </div>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm">% Útil Promedio</p>
              <p className="text-2xl font-bold text-purple-400">{calculatedFaqStats.avgHelpful}%</p>
            </div>
            <ThumbsUp className="w-8 h-8 text-purple-500/50" />
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <HelpCircle className="w-6 h-6 text-blue-400" />Gestión de FAQ
          </h2>
          <div className="flex items-center gap-2">
            <button onClick={handleExportFaqs} className="px-3 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-gray-300 rounded-lg text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar
            </button>
            <button onClick={() => { setSelectedFaq(null); setFaqForm({ question: '', answer: '', category: 'General', isPublished: true }); setShowFaqModal(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva FAQ
            </button>
          </div>
        </div>

        {/* Filtros y Búsqueda */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Buscar por pregunta o respuesta..." value={faqSearch} onChange={e => setFaqSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm focus:border-blue-500 transition-all" />
          </div>
          <select value={faqCategoryFilter} onChange={e => setFaqCategoryFilter(e.target.value)} className="px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
            <option value="all">📁 Todas las Categorías</option>
            {FAQ_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
          </select>
          <div className="flex items-center gap-1 bg-[#0f0f1a] border border-gray-700 rounded-lg p-1">
            <button onClick={() => setFaqSort('views')} className={`px-3 py-1.5 rounded text-sm ${faqSort === 'views' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Más Vistas</button>
            <button onClick={() => setFaqSort('helpful')} className={`px-3 py-1.5 rounded text-sm ${faqSort === 'helpful' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Más Útiles</button>
            <button onClick={() => setFaqSort('recent')} className={`px-3 py-1.5 rounded text-sm ${faqSort === 'recent' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>Recientes</button>
          </div>
        </div>
      </div>

      {/* Lista de FAQs */}
      <div className="grid gap-4">
        {sortedFilteredFaqs.length === 0 ? (
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-12 text-center">
            <HelpCircle className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 font-medium text-lg">No se encontraron FAQs</p>
            <p className="text-gray-500 text-sm mt-1">Ajusta los filtros o crea una nueva FAQ</p>
            <button onClick={() => { setSelectedFaq(null); setFaqForm({ question: '', answer: '', category: 'General', isPublished: true }); setShowFaqModal(true); }} className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Crear Primera FAQ</button>
          </div>
        ) : (
          sortedFilteredFaqs.map((faq, index) => (
            <div key={faq.id} className={`bg-[#1a1a2e] rounded-xl border p-4 transition-all hover:border-gray-600 ${faq.isPublished ? 'border-gray-800' : 'border-yellow-500/30'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  {/* Header */}
                  <div className="flex items-center gap-2 mb-3 flex-wrap">
                    <span className="text-gray-500 text-sm font-mono">#{index + 1}</span>
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded-lg">{faq.category}</span>
                    {faq.isPublished ? (
                      <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-lg flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Publicado</span>
                    ) : (
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-lg flex items-center gap-1"><Edit className="w-3 h-3" /> Borrador</span>
                    )}
                    <span className="text-gray-500 text-xs">Actualizado: {faq.updatedAt}</span>
                  </div>

                  {/* Pregunta */}
                  <h3 className="text-white font-semibold text-lg mb-2 flex items-start gap-2">
                    <span className="text-blue-400">Q:</span>
                    {faq.question}
                  </h3>

                  {/* Respuesta */}
                  <div className="bg-[#0f0f1a] rounded-lg p-4 mb-3">
                    <p className="text-gray-300 text-sm whitespace-pre-line leading-relaxed">{faq.answer}</p>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-6 text-sm">
                    <span className="flex items-center gap-2 text-gray-400">
                      <Eye className="w-4 h-4" />
                      <span className="font-medium text-white">{faq.views.toLocaleString()}</span> vistas
                    </span>
                    <span className="flex items-center gap-2 text-green-400">
                      <ThumbsUp className="w-4 h-4" />
                      <span className="font-medium">{faq.helpful}</span> útil
                    </span>
                    <span className="flex items-center gap-2 text-red-400">
                      <ThumbsDown className="w-4 h-4" />
                      <span className="font-medium">{faq.notHelpful}</span> no útil
                    </span>
                    <span className="text-gray-500">
                      {faq.helpful + faq.notHelpful > 0 ? Math.round((faq.helpful / (faq.helpful + faq.notHelpful)) * 100) : 0}% positivo
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="flex flex-col gap-1">
                  <button onClick={() => handleCopyFaqAnswer(faq)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Copiar respuesta">
                    <Copy className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => { setSelectedFaq(faq); setFaqForm({ question: faq.question, answer: faq.answer, category: faq.category, isPublished: faq.isPublished }); setShowFaqModal(true); }} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Editar">
                    <Edit className="w-4 h-4 text-blue-400" />
                  </button>
                  <button onClick={() => handleDuplicateFaq(faq)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Duplicar">
                    <Plus className="w-4 h-4 text-green-400" />
                  </button>
                  <button onClick={() => handleToggleFaqPublish(faq)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title={faq.isPublished ? 'Despublicar' : 'Publicar'}>
                    {faq.isPublished ? <XCircle className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                  </button>
                  <button onClick={() => handleDeleteFaq(faq)} className="p-2 hover:bg-gray-700 rounded-lg transition-all" title="Eliminar">
                    <Trash2 className="w-4 h-4 text-red-400" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Categorías Resumen */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-4">
        <h3 className="text-white font-medium mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400" />FAQs por Categoría</h3>
        <div className="grid grid-cols-4 gap-3">
          {FAQ_CATEGORIES.map(cat => {
            const count = faqs.filter(f => f.category === cat).length;
            const views = faqs.filter(f => f.category === cat).reduce((sum, f) => sum + f.views, 0);
            return (
              <div key={cat} onClick={() => setFaqCategoryFilter(cat)} className={`p-3 rounded-lg cursor-pointer transition-all ${faqCategoryFilter === cat ? 'bg-blue-600/20 border border-blue-500' : 'bg-[#0f0f1a] hover:bg-[#252540]'}`}>
                <p className="text-white font-medium">{cat}</p>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-gray-400 text-sm">{count} FAQs</span>
                  <span className="text-blue-400 text-xs">{views.toLocaleString()} vistas</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Render Templates View - EXPANDED
  const templateStats = {
    total: templates.length,
    favorites: templates.filter(t => t.isFavorite).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    categories: [...new Set(templates.map(t => t.category))].length
  };

  const extendedFilteredTemplates = templates.filter(t => {
    if (templateFilter === 'favorites' && !t.isFavorite) return false;
    if (templateFilter !== 'all' && templateFilter !== 'favorites' && t.category !== templateFilter) return false;
    if (templateSearchLocal && !t.name.toLowerCase().includes(templateSearchLocal.toLowerCase()) && !t.shortcut.toLowerCase().includes(templateSearchLocal.toLowerCase()) && !t.content.toLowerCase().includes(templateSearchLocal.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    if (templateSort === 'name') return a.name.localeCompare(b.name);
    if (templateSort === 'usage') return b.usageCount - a.usageCount;
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const handleDuplicateTemplate = (template: Template) => {
    const newTemplate: Template = { ...template, id: Date.now(), name: `${template.name} (copia)`, shortcut: `${template.shortcut}_copy`, usageCount: 0, createdAt: new Date().toISOString().split('T')[0] };
    setTemplates([...templates, newTemplate]);
    showToast('Plantilla duplicada');
  };

  const handleExportTemplates = () => {
    const data = JSON.stringify(extendedFilteredTemplates, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'plantillas_soporte.json'; a.click();
    showToast('Plantillas exportadas');
  };

  const handleImportTemplates = () => {
    showToast('Función de importación - Seleccionar archivo JSON');
  };

  const handleCopyTemplateContent = (template: Template) => {
    navigator.clipboard.writeText(template.content);
    showToast('Contenido copiado');
  };

  const handleTestTemplate = (template: Template) => {
    let content = template.content;
    template.variables.forEach(v => { content = content.replace(`{${v}}`, `[${v.toUpperCase()}]`); });
    setSelectedTemplatePreview({ ...template, content });
    showToast('Vista previa generada');
  };

  const categoryCounts = TEMPLATE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = templates.filter(t => t.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const renderTemplates = () => (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Panel Izquierdo - Filtros y Categorías */}
      <div className="w-72 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-blue-400" /> Plantillas</h3>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{templateStats.total}</p>
              <p className="text-xs text-gray-400">Total</p>
            </div>
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">{templateStats.favorites}</p>
              <p className="text-xs text-gray-400">Favoritas</p>
            </div>
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">{templateStats.totalUsage}</p>
              <p className="text-xs text-gray-400">Usos Total</p>
            </div>
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-400">{templateStats.categories}</p>
              <p className="text-xs text-gray-400">Categorías</p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={templateSearchLocal} onChange={e => setTemplateSearchLocal(e.target.value)} placeholder="Buscar plantilla o atajo..." className="w-full pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm" />
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="p-4 border-b border-gray-800 space-y-2">
          <button onClick={() => setTemplateFilter('all')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${templateFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
            <span className="flex items-center gap-2"><FileText className="w-4 h-4" /> Todas</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{templates.length}</span>
          </button>
          <button onClick={() => setTemplateFilter('favorites')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${templateFilter === 'favorites' ? 'bg-yellow-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
            <span className="flex items-center gap-2"><Star className="w-4 h-4" /> Favoritas</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{templateStats.favorites}</span>
          </button>
        </div>

        {/* Categorías */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Por Categoría</p>
          <div className="space-y-1">
            {TEMPLATE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setTemplateFilter(cat)} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${templateFilter === cat ? 'bg-purple-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
                <span>{cat}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{categoryCounts[cat] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button onClick={handleImportTemplates} className="w-full px-3 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-gray-300 text-sm rounded-lg flex items-center gap-2"><Download className="w-4 h-4" /> Importar</button>
          <button onClick={handleExportTemplates} className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"><Download className="w-4 h-4" /> Exportar ({extendedFilteredTemplates.length})</button>
        </div>
      </div>

      {/* Panel Central - Lista de Plantillas */}
      <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-medium">Plantillas de Respuesta</h3>
              <span className="text-sm text-gray-400">{extendedFilteredTemplates.length} resultados</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Ordenar */}
              <select value={templateSort} onChange={e => setTemplateSort(e.target.value as typeof templateSort)} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
                <option value="usage">Más usadas</option>
                <option value="name">Nombre A-Z</option>
                <option value="recent">Recientes</option>
              </select>
              {/* Vista */}
              <div className="flex bg-[#0f0f1a] rounded-lg p-1">
                <button onClick={() => setTemplateView('grid')} className={`p-1.5 rounded ${templateView === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><BarChart3 className="w-4 h-4" /></button>
                <button onClick={() => setTemplateView('list')} className={`p-1.5 rounded ${templateView === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><FileText className="w-4 h-4" /></button>
              </div>
              {/* Nueva */}
              <button onClick={() => { setSelectedTemplate(null); setTemplateForm({ name: '', shortcut: '', category: 'General', content: '', variables: '' }); setShowTemplateModal(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Nueva</button>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4">
          {extendedFilteredTemplates.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-50" />
              <p>No hay plantillas que coincidan</p>
              <button onClick={() => { setTemplateFilter('all'); setTemplateSearchLocal(''); }} className="mt-2 text-blue-400 text-sm">Limpiar filtros</button>
            </div>
          ) : templateView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {extendedFilteredTemplates.map(template => (
                <div key={template.id} className={`bg-[#0f0f1a] rounded-xl border p-4 hover:border-blue-500/50 transition-all cursor-pointer group ${template.isFavorite ? 'border-yellow-500/30' : 'border-gray-700'}`} onClick={() => setSelectedTemplatePreview(template)}>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{template.category}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); handleToggleFavorite(template); }} className="p-1 hover:bg-gray-700 rounded"><Star className={`w-4 h-4 ${template.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-400'}`} /></button>
                      <button onClick={e => { e.stopPropagation(); handleCopyTemplateContent(template); }} className="p-1 hover:bg-gray-700 rounded"><Copy className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDuplicateTemplate(template); }} className="p-1 hover:bg-gray-700 rounded"><Plus className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={e => { e.stopPropagation(); setSelectedTemplate(template); setTemplateForm({ name: template.name, shortcut: template.shortcut, category: template.category, content: template.content, variables: template.variables.join(', ') }); setShowTemplateModal(true); }} className="p-1 hover:bg-gray-700 rounded"><Edit className="w-4 h-4 text-gray-400" /></button>
                    </div>
                  </div>
                  <h4 className="text-white font-medium mb-1">{template.name}</h4>
                  <p className="text-purple-400 text-xs mb-2 font-mono">{template.shortcut}</p>
                  <p className="text-gray-400 text-sm line-clamp-3">{template.content}</p>
                  {template.variables.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {template.variables.map(v => <span key={v} className="px-1.5 py-0.5 bg-purple-500/20 text-purple-400 text-xs rounded font-mono">{`{${v}}`}</span>)}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700">
                    <span className="text-xs text-gray-500 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {template.usageCount} usos</span>
                    <button onClick={e => { e.stopPropagation(); handleUseTemplate(template); }} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded-lg">Usar</button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {extendedFilteredTemplates.map(template => (
                <div key={template.id} className={`bg-[#0f0f1a] rounded-xl border p-4 hover:border-blue-500/50 transition-all flex items-center gap-4 ${template.isFavorite ? 'border-yellow-500/30' : 'border-gray-700'}`}>
                  <button onClick={() => handleToggleFavorite(template)}><Star className={`w-5 h-5 ${template.isFavorite ? 'text-yellow-500 fill-yellow-500' : 'text-gray-600'}`} /></button>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{template.name}</h4>
                      <span className="text-purple-400 text-xs font-mono">{template.shortcut}</span>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{template.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{template.content}</p>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <span>{template.usageCount} usos</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleCopyTemplateContent(template)} className="p-2 hover:bg-gray-700 rounded-lg"><Copy className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => handleDuplicateTemplate(template)} className="p-2 hover:bg-gray-700 rounded-lg"><Plus className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => { setSelectedTemplate(template); setTemplateForm({ name: template.name, shortcut: template.shortcut, category: template.category, content: template.content, variables: template.variables.join(', ') }); setShowTemplateModal(true); }} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => handleUseTemplate(template)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Usar</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho - Vista Previa */}
      {selectedTemplatePreview && (
        <div className="w-96 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-medium">Vista Previa</h3>
            <button onClick={() => setSelectedTemplatePreview(null)} className="p-1 hover:bg-gray-700 rounded"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <p className="text-gray-400 text-sm mb-1">Nombre</p>
              <p className="text-white font-medium">{selectedTemplatePreview.name}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Atajo</p>
              <p className="text-purple-400 font-mono">{selectedTemplatePreview.shortcut}</p>
            </div>
            <div>
              <p className="text-gray-400 text-sm mb-1">Categoría</p>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">{selectedTemplatePreview.category}</span>
            </div>
            {selectedTemplatePreview.variables.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-1">Variables</p>
                <div className="flex flex-wrap gap-1">
                  {selectedTemplatePreview.variables.map(v => <span key={v} className="px-2 py-1 bg-purple-500/20 text-purple-400 text-sm rounded font-mono">{`{${v}}`}</span>)}
                </div>
              </div>
            )}
            <div>
              <p className="text-gray-400 text-sm mb-1">Contenido</p>
              <div className="bg-[#0f0f1a] p-4 rounded-lg border border-gray-700">
                <p className="text-white whitespace-pre-wrap">{selectedTemplatePreview.content}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="bg-[#0f0f1a] p-3 rounded-lg">
                <p className="text-gray-400">Usos</p>
                <p className="text-white font-bold">{selectedTemplatePreview.usageCount}</p>
              </div>
              <div className="bg-[#0f0f1a] p-3 rounded-lg">
                <p className="text-gray-400">Creada</p>
                <p className="text-white">{selectedTemplatePreview.createdAt}</p>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-800 space-y-2">
            <button onClick={() => handleTestTemplate(selectedTemplatePreview)} className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2"><Eye className="w-4 h-4" /> Probar con Variables</button>
            <button onClick={() => handleUseTemplate(selectedTemplatePreview)} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"><Send className="w-4 h-4" /> Usar Plantilla</button>
            <button onClick={() => { setSelectedTemplate(selectedTemplatePreview); setTemplateForm({ name: selectedTemplatePreview.name, shortcut: selectedTemplatePreview.shortcut, category: selectedTemplatePreview.category, content: selectedTemplatePreview.content, variables: selectedTemplatePreview.variables.join(', ') }); setShowTemplateModal(true); }} className="w-full px-4 py-2 bg-[#0f0f1a] hover:bg-[#252540] text-white rounded-lg flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Editar</button>
          </div>
        </div>
      )}
    </div>
  );


  // Render Knowledge Base View - EXPANDED
  const knowledgeStats = {
    total: knowledgeArticles.length,
    published: knowledgeArticles.filter(a => a.isPublished).length,
    drafts: knowledgeArticles.filter(a => !a.isPublished).length,
    totalViews: knowledgeArticles.reduce((sum, a) => sum + a.views, 0),
    categories: [...new Set(knowledgeArticles.map(a => a.category))].length
  };

  const extendedFilteredKnowledge = knowledgeArticles.filter(a => {
    if (knowledgeFilter === 'published' && !a.isPublished) return false;
    if (knowledgeFilter === 'drafts' && a.isPublished) return false;
    if (knowledgeFilter !== 'all' && knowledgeFilter !== 'published' && knowledgeFilter !== 'drafts' && a.category !== knowledgeFilter) return false;
    if (knowledgeSearchLocal && !a.title.toLowerCase().includes(knowledgeSearchLocal.toLowerCase()) && !a.content.toLowerCase().includes(knowledgeSearchLocal.toLowerCase()) && !a.tags.some(t => t.toLowerCase().includes(knowledgeSearchLocal.toLowerCase()))) return false;
    return true;
  }).sort((a, b) => {
    if (knowledgeSort === 'views') return b.views - a.views;
    if (knowledgeSort === 'title') return a.title.localeCompare(b.title);
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const handleDuplicateArticle = (article: KnowledgeArticle) => {
    const newArticle: KnowledgeArticle = { ...article, id: Date.now(), title: `${article.title} (copia)`, views: 0, isPublished: false, createdAt: new Date().toISOString().split('T')[0], updatedAt: new Date().toISOString().split('T')[0] };
    setKnowledgeArticles([...knowledgeArticles, newArticle]);
    showToast('Artículo duplicado');
  };

  const handleToggleArticlePublish = (article: KnowledgeArticle) => {
    setKnowledgeArticles(knowledgeArticles.map(a => a.id === article.id ? { ...a, isPublished: !a.isPublished } : a));
    showToast(article.isPublished ? 'Artículo despublicado' : 'Artículo publicado');
  };

  const handleExportKnowledge = () => {
    const data = JSON.stringify(extendedFilteredKnowledge, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'base_conocimiento.json'; a.click();
    showToast('Base de conocimiento exportada');
  };

  const handleCopyArticleContent = (article: KnowledgeArticle) => {
    navigator.clipboard.writeText(article.content);
    showToast('Contenido copiado');
  };

  const handleShareArticle = (article: KnowledgeArticle) => {
    navigator.clipboard.writeText(`Artículo: ${article.title}\n\n${article.content}`);
    showToast('Artículo copiado para compartir');
  };

  const knowledgeCategoryCounts = KNOWLEDGE_CATEGORIES.reduce((acc, cat) => {
    acc[cat] = knowledgeArticles.filter(a => a.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  const renderKnowledge = () => (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Panel Izquierdo - Filtros y Categorías */}
      <div className="w-72 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><BookOpen className="w-5 h-5 text-green-400" /> Base de Conocimiento</h3>
        </div>

        {/* Stats */}
        <div className="p-4 border-b border-gray-800">
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-white">{knowledgeStats.total}</p>
              <p className="text-xs text-gray-400">Artículos</p>
            </div>
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-400">{knowledgeStats.published}</p>
              <p className="text-xs text-gray-400">Publicados</p>
            </div>
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-400">{knowledgeStats.drafts}</p>
              <p className="text-xs text-gray-400">Borradores</p>
            </div>
            <div className="bg-[#0f0f1a] p-3 rounded-lg text-center">
              <p className="text-2xl font-bold text-blue-400">{knowledgeStats.totalViews}</p>
              <p className="text-xs text-gray-400">Vistas Total</p>
            </div>
          </div>
        </div>

        {/* Búsqueda */}
        <div className="p-4 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={knowledgeSearchLocal} onChange={e => setKnowledgeSearchLocal(e.target.value)} placeholder="Buscar artículo o tag..." className="w-full pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm" />
          </div>
        </div>

        {/* Filtros Rápidos */}
        <div className="p-4 border-b border-gray-800 space-y-2">
          <button onClick={() => setKnowledgeFilter('all')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${knowledgeFilter === 'all' ? 'bg-blue-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
            <span className="flex items-center gap-2"><BookOpen className="w-4 h-4" /> Todos</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{knowledgeStats.total}</span>
          </button>
          <button onClick={() => setKnowledgeFilter('published')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${knowledgeFilter === 'published' ? 'bg-green-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
            <span className="flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Publicados</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{knowledgeStats.published}</span>
          </button>
          <button onClick={() => setKnowledgeFilter('drafts')} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${knowledgeFilter === 'drafts' ? 'bg-yellow-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
            <span className="flex items-center gap-2"><Edit className="w-4 h-4" /> Borradores</span>
            <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{knowledgeStats.drafts}</span>
          </button>
        </div>

        {/* Categorías */}
        <div className="flex-1 overflow-y-auto p-4">
          <p className="text-xs text-gray-500 uppercase mb-2">Por Categoría</p>
          <div className="space-y-1">
            {KNOWLEDGE_CATEGORIES.map(cat => (
              <button key={cat} onClick={() => setKnowledgeFilter(cat)} className={`w-full px-3 py-2 rounded-lg text-left text-sm flex items-center justify-between ${knowledgeFilter === cat ? 'bg-purple-600 text-white' : 'bg-[#0f0f1a] text-gray-300 hover:bg-[#252540]'}`}>
                <span>{cat}</span>
                <span className="text-xs bg-black/20 px-2 py-0.5 rounded">{knowledgeCategoryCounts[cat] || 0}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Acciones */}
        <div className="p-4 border-t border-gray-800 space-y-2">
          <button onClick={handleExportKnowledge} className="w-full px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg flex items-center gap-2"><Download className="w-4 h-4" /> Exportar ({extendedFilteredKnowledge.length})</button>
        </div>
      </div>

      {/* Panel Central - Lista de Artículos */}
      <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h3 className="text-white font-medium">Artículos</h3>
              <span className="text-sm text-gray-400">{extendedFilteredKnowledge.length} resultados</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Ordenar */}
              <select value={knowledgeSort} onChange={e => setKnowledgeSort(e.target.value as typeof knowledgeSort)} className="px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm">
                <option value="views">Más vistas</option>
                <option value="title">Título A-Z</option>
                <option value="recent">Recientes</option>
              </select>
              {/* Vista */}
              <div className="flex bg-[#0f0f1a] rounded-lg p-1">
                <button onClick={() => setKnowledgeView('grid')} className={`p-1.5 rounded ${knowledgeView === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><BarChart3 className="w-4 h-4" /></button>
                <button onClick={() => setKnowledgeView('list')} className={`p-1.5 rounded ${knowledgeView === 'list' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}><FileText className="w-4 h-4" /></button>
              </div>
              {/* Nuevo */}
              <button onClick={() => { setSelectedArticle(null); setKnowledgeForm({ title: '', category: 'Procesos', content: '', tags: '', isPublished: true }); setShowKnowledgeModal(true); }} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2"><Plus className="w-4 h-4" /> Nuevo</button>
            </div>
          </div>
        </div>

        {/* Lista */}
        <div className="flex-1 overflow-y-auto p-4">
          {extendedFilteredKnowledge.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400">
              <BookOpen className="w-16 h-16 mb-4 opacity-50" />
              <p>No hay artículos que coincidan</p>
              <button onClick={() => { setKnowledgeFilter('all'); setKnowledgeSearchLocal(''); }} className="mt-2 text-blue-400 text-sm">Limpiar filtros</button>
            </div>
          ) : knowledgeView === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {extendedFilteredKnowledge.map(article => (
                <div key={article.id} className={`bg-[#0f0f1a] rounded-xl border p-4 hover:border-blue-500/50 transition-all cursor-pointer group ${article.isPublished ? 'border-gray-700' : 'border-yellow-500/30'}`} onClick={() => setSelectedArticlePreview(article)}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{article.category}</span>
                      {!article.isPublished && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Borrador</span>}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={e => { e.stopPropagation(); handleToggleArticlePublish(article); }} className="p-1 hover:bg-gray-700 rounded">{article.isPublished ? <XCircle className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}</button>
                      <button onClick={e => { e.stopPropagation(); handleCopyArticleContent(article); }} className="p-1 hover:bg-gray-700 rounded"><Copy className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDuplicateArticle(article); }} className="p-1 hover:bg-gray-700 rounded"><Plus className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={e => { e.stopPropagation(); setSelectedArticle(article); setKnowledgeForm({ title: article.title, category: article.category, content: article.content, tags: article.tags.join(', '), isPublished: article.isPublished }); setShowKnowledgeModal(true); }} className="p-1 hover:bg-gray-700 rounded"><Edit className="w-4 h-4 text-gray-400" /></button>
                      <button onClick={e => { e.stopPropagation(); handleDeleteKnowledge(article); }} className="p-1 hover:bg-gray-700 rounded"><Trash2 className="w-4 h-4 text-red-400" /></button>
                    </div>
                  </div>
                  <h4 className="text-white font-medium mb-2">{article.title}</h4>
                  <p className="text-gray-400 text-sm line-clamp-2">{article.content.replace(/[#*]/g, '').substring(0, 150)}...</p>
                  <div className="flex flex-wrap gap-1 mt-3">
                    {article.tags.slice(0, 3).map(tag => <span key={tag} className="px-2 py-0.5 bg-gray-700 text-gray-300 text-xs rounded">#{tag}</span>)}
                    {article.tags.length > 3 && <span className="text-xs text-gray-500">+{article.tags.length - 3}</span>}
                  </div>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-700 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Eye className="w-3 h-3" /> {article.views} vistas</span>
                    <span>{article.author} • {article.updatedAt}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {extendedFilteredKnowledge.map(article => (
                <div key={article.id} className={`bg-[#0f0f1a] rounded-xl border p-4 hover:border-blue-500/50 transition-all flex items-center gap-4 ${article.isPublished ? 'border-gray-700' : 'border-yellow-500/30'}`}>
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${article.isPublished ? 'bg-green-500/20' : 'bg-yellow-500/20'}`}>
                    {article.isPublished ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Edit className="w-5 h-5 text-yellow-400" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-medium">{article.title}</h4>
                      <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 text-xs rounded">{article.category}</span>
                    </div>
                    <p className="text-gray-400 text-sm truncate">{article.content.replace(/[#*]/g, '').substring(0, 100)}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {article.views}</span>
                    <span>{article.updatedAt}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => handleToggleArticlePublish(article)} className="p-2 hover:bg-gray-700 rounded-lg">{article.isPublished ? <XCircle className="w-4 h-4 text-yellow-400" /> : <CheckCircle className="w-4 h-4 text-green-400" />}</button>
                    <button onClick={() => handleCopyArticleContent(article)} className="p-2 hover:bg-gray-700 rounded-lg"><Copy className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => { setSelectedArticle(article); setKnowledgeForm({ title: article.title, category: article.category, content: article.content, tags: article.tags.join(', '), isPublished: article.isPublished }); setShowKnowledgeModal(true); }} className="p-2 hover:bg-gray-700 rounded-lg"><Edit className="w-4 h-4 text-gray-400" /></button>
                    <button onClick={() => setSelectedArticlePreview(article)} className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg">Ver</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho - Vista Previa del Artículo */}
      {selectedArticlePreview && (
        <div className="w-[450px] bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-white font-medium">Vista Previa</h3>
              {!selectedArticlePreview.isPublished && <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded">Borrador</span>}
            </div>
            <button onClick={() => setSelectedArticlePreview(null)} className="p-1 hover:bg-gray-700 rounded"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div>
              <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-sm rounded">{selectedArticlePreview.category}</span>
            </div>
            <h2 className="text-xl font-bold text-white">{selectedArticlePreview.title}</h2>
            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedArticlePreview.author}</span>
              <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {selectedArticlePreview.views} vistas</span>
              <span>Actualizado: {selectedArticlePreview.updatedAt}</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {selectedArticlePreview.tags.map(tag => <span key={tag} className="px-2 py-1 bg-gray-700 text-gray-300 text-sm rounded">#{tag}</span>)}
            </div>
            <div className="bg-[#0f0f1a] p-4 rounded-lg border border-gray-700">
              <div className="prose prose-invert max-w-none">
                <pre className="text-white whitespace-pre-wrap text-sm">{selectedArticlePreview.content}</pre>
              </div>
            </div>
            {selectedArticlePreview.relatedArticles.length > 0 && (
              <div>
                <p className="text-gray-400 text-sm mb-2">Artículos Relacionados</p>
                <div className="space-y-2">
                  {selectedArticlePreview.relatedArticles.map(relId => {
                    const relArticle = knowledgeArticles.find(a => a.id === relId);
                    return relArticle ? (
                      <button key={relId} onClick={() => setSelectedArticlePreview(relArticle)} className="w-full p-3 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg text-left flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-blue-400" />
                        <span className="text-white text-sm">{relArticle.title}</span>
                      </button>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 border-t border-gray-800 space-y-2">
            <div className="flex gap-2">
              <button onClick={() => handleShareArticle(selectedArticlePreview)} className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg flex items-center justify-center gap-2"><Copy className="w-4 h-4" /> Compartir</button>
              <button onClick={() => handleToggleArticlePublish(selectedArticlePreview)} className={`flex-1 px-4 py-2 ${selectedArticlePreview.isPublished ? 'bg-yellow-600 hover:bg-yellow-700' : 'bg-green-600 hover:bg-green-700'} text-white rounded-lg flex items-center justify-center gap-2`}>
                {selectedArticlePreview.isPublished ? <><XCircle className="w-4 h-4" /> Despublicar</> : <><CheckCircle className="w-4 h-4" /> Publicar</>}
              </button>
            </div>
            <button onClick={() => { setSelectedArticle(selectedArticlePreview); setKnowledgeForm({ title: selectedArticlePreview.title, category: selectedArticlePreview.category, content: selectedArticlePreview.content, tags: selectedArticlePreview.tags.join(', '), isPublished: selectedArticlePreview.isPublished }); setShowKnowledgeModal(true); }} className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"><Edit className="w-4 h-4" /> Editar Artículo</button>
          </div>
        </div>
      )}
    </div>
  );

  // Render Reports View - EXPANDED
  const reportStats = {
    overview: {
      totalTickets: reportData?.total_tickets ?? (reportPeriod === 'week' ? 99 : 275),
      resolved: reportData?.resolved_tickets ?? (reportPeriod === 'week' ? 88 : 258),
      avgResponseTime: reportData?.avg_response_minutes ?? 12,
      satisfaction: reportData?.satisfaction_avg ? Math.round(reportData.satisfaction_avg * 20) : 94,
      slaCompliance: 96,
      escalations: reportData?.escalated_tickets ?? (reportPeriod === 'week' ? 5 : 12)
    },
    byCategory: [
      { category: 'Retiros', count: reportPeriod === 'week' ? 35 : 98, percentage: 35 },
      { category: 'Depósitos', count: reportPeriod === 'week' ? 25 : 70, percentage: 25 },
      { category: 'Verificación', count: reportPeriod === 'week' ? 20 : 55, percentage: 20 },
      { category: 'Trading', count: reportPeriod === 'week' ? 12 : 33, percentage: 12 },
      { category: 'Otros', count: reportPeriod === 'week' ? 7 : 19, percentage: 8 }
    ],
    byAgent: [
      { agent: 'Soporte Demo', tickets: 45, resolved: 42, avgTime: 10, satisfaction: 96 },
      { agent: 'Soporte 2', tickets: 32, resolved: 28, avgTime: 15, satisfaction: 92 },
      { agent: 'Soporte 3', tickets: 22, resolved: 18, avgTime: 18, satisfaction: 88 }
    ],
    hourlyDistribution: [
      { hour: '08:00', tickets: 5 }, { hour: '09:00', tickets: 12 }, { hour: '10:00', tickets: 18 },
      { hour: '11:00', tickets: 22 }, { hour: '12:00', tickets: 15 }, { hour: '13:00', tickets: 8 },
      { hour: '14:00', tickets: 14 }, { hour: '15:00', tickets: 20 }, { hour: '16:00', tickets: 25 },
      { hour: '17:00', tickets: 18 }, { hour: '18:00', tickets: 10 }, { hour: '19:00', tickets: 6 }
    ]
  };

  const handleExportReport = (format: 'pdf' | 'excel' | 'csv') => {
    showToast(`Exportando reporte en formato ${format.toUpperCase()}...`);
    setShowReportExport(false);
  };

  const handleScheduleReport = () => {
    showToast('Configurar envío programado de reportes');
  };

  const reportCategoryChartData = {
    labels: reportStats.byCategory.map(c => c.category),
    datasets: [{
      data: reportStats.byCategory.map(c => c.count),
      backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'],
      borderWidth: 0
    }]
  };

  const agentPerformanceData = {
    labels: reportStats.byAgent.map(a => a.agent),
    datasets: [
      { label: 'Tickets', data: reportStats.byAgent.map(a => a.tickets), backgroundColor: '#3b82f6' },
      { label: 'Resueltos', data: reportStats.byAgent.map(a => a.resolved), backgroundColor: '#10b981' }
    ]
  };

  const hourlyChartData = {
    labels: reportStats.hourlyDistribution.map(h => h.hour),
    datasets: [{
      label: 'Tickets por Hora',
      data: reportStats.hourlyDistribution.map(h => h.tickets),
      borderColor: '#8b5cf6',
      backgroundColor: 'rgba(139, 92, 246, 0.1)',
      fill: true,
      tension: 0.4
    }]
  };

  const renderReports = () => (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2"><BarChart3 className="w-6 h-6 text-purple-400" /> Centro de Reportes</h2>
          <p className="text-gray-400 text-sm mt-1">Análisis detallado del rendimiento del equipo de soporte</p>
        </div>
        <div className="flex items-center gap-2">
          <select value={reportPeriod} onChange={e => setReportPeriod(e.target.value)} className="px-4 py-2 bg-[#1a1a2e] border border-gray-700 rounded-lg text-white">
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
            <option value="quarter">Este Trimestre</option>
          </select>
          <button onClick={() => setReportCompare(!reportCompare)} className={`px-4 py-2 rounded-lg flex items-center gap-2 ${reportCompare ? 'bg-purple-600 text-white' : 'bg-[#1a1a2e] border border-gray-700 text-gray-300'}`}>
            <TrendingUp className="w-4 h-4" /> Comparar
          </button>
          <div className="relative">
            <button onClick={() => setShowReportExport(!showReportExport)} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center gap-2"><Download className="w-4 h-4" /> Exportar</button>
            {showReportExport && (
              <div className="absolute right-0 top-full mt-2 bg-[#1a1a2e] border border-gray-700 rounded-lg shadow-xl z-10 w-48">
                <button onClick={() => handleExportReport('pdf')} className="w-full px-4 py-2 text-left text-white hover:bg-[#252540] flex items-center gap-2"><FileText className="w-4 h-4 text-red-400" /> PDF</button>
                <button onClick={() => handleExportReport('excel')} className="w-full px-4 py-2 text-left text-white hover:bg-[#252540] flex items-center gap-2"><FileText className="w-4 h-4 text-green-400" /> Excel</button>
                <button onClick={() => handleExportReport('csv')} className="w-full px-4 py-2 text-left text-white hover:bg-[#252540] flex items-center gap-2"><FileText className="w-4 h-4 text-blue-400" /> CSV</button>
              </div>
            )}
          </div>
          <button onClick={handleScheduleReport} className="px-4 py-2 bg-[#1a1a2e] border border-gray-700 hover:bg-[#252540] text-white rounded-lg flex items-center gap-2"><Clock className="w-4 h-4" /> Programar</button>
        </div>
      </div>

      {/* Tabs de Tipo de Reporte */}
      <div className="flex gap-2 bg-[#1a1a2e] p-1 rounded-lg w-fit">
        {[
          { id: 'overview', label: 'Resumen', icon: PieChart },
          { id: 'tickets', label: 'Tickets', icon: MessageSquare },
          { id: 'agents', label: 'Agentes', icon: Users },
          { id: 'satisfaction', label: 'Satisfacción', icon: Star },
          { id: 'sla', label: 'SLA', icon: Clock }
        ].map(tab => (
          <button key={tab.id} onClick={() => setReportType(tab.id as typeof reportType)} className={`px-4 py-2 rounded-lg flex items-center gap-2 text-sm ${reportType === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <MessageSquare className="w-5 h-5 text-blue-400" />
            {reportCompare && <span className="text-xs text-green-400">+12%</span>}
          </div>
          <p className="text-2xl font-bold text-white">{reportStats.overview.totalTickets}</p>
          <p className="text-gray-400 text-sm">Total Tickets</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            {reportCompare && <span className="text-xs text-green-400">+8%</span>}
          </div>
          <p className="text-2xl font-bold text-green-500">{reportStats.overview.resolved}</p>
          <p className="text-gray-400 text-sm">Resueltos</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Clock className="w-5 h-5 text-yellow-400" />
            {reportCompare && <span className="text-xs text-green-400">-2min</span>}
          </div>
          <p className="text-2xl font-bold text-yellow-500">{reportStats.overview.avgResponseTime} min</p>
          <p className="text-gray-400 text-sm">Tiempo Promedio</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Star className="w-5 h-5 text-purple-400" />
            {reportCompare && <span className="text-xs text-green-400">+2%</span>}
          </div>
          <p className="text-2xl font-bold text-purple-500">{reportStats.overview.satisfaction}%</p>
          <p className="text-gray-400 text-sm">Satisfacción</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <Shield className="w-5 h-5 text-cyan-400" />
            {reportCompare && <span className="text-xs text-green-400">+1%</span>}
          </div>
          <p className="text-2xl font-bold text-cyan-500">{reportStats.overview.slaCompliance}%</p>
          <p className="text-gray-400 text-sm">Cumplimiento SLA</p>
        </div>
        <div className="bg-[#1a1a2e] rounded-xl p-4 border border-gray-800">
          <div className="flex items-center justify-between mb-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            {reportCompare && <span className="text-xs text-red-400">+2</span>}
          </div>
          <p className="text-2xl font-bold text-red-500">{reportStats.overview.escalations}</p>
          <p className="text-gray-400 text-sm">Escalaciones</p>
        </div>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets por Período */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Tickets por Período</h3>
            <select className="px-3 py-1 bg-[#0f0f1a] border border-gray-700 rounded text-white text-sm">
              <option>Diario</option>
              <option>Semanal</option>
            </select>
          </div>
          <Line data={ticketsChartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } }} />
        </div>

        {/* Distribución por Categoría */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Distribución por Categoría</h3>
          <div className="flex items-center gap-8">
            <div className="w-48 h-48">
              <Doughnut data={reportCategoryChartData} options={{ responsive: true, plugins: { legend: { display: false } } }} />
            </div>
            <div className="flex-1 space-y-2">
              {reportStats.byCategory.map((cat, i) => (
                <div key={cat.category} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6'][i] }}></div>
                    <span className="text-gray-300 text-sm">{cat.category}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-white font-medium">{cat.count}</span>
                    <span className="text-gray-500 text-sm">({cat.percentage}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Rendimiento por Agente */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Rendimiento por Agente</h3>
          <Bar data={agentPerformanceData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } }} />
        </div>

        {/* Distribución Horaria */}
        <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
          <h3 className="text-lg font-semibold text-white mb-4">Distribución Horaria de Tickets</h3>
          <Line data={hourlyChartData} options={{ responsive: true, plugins: { legend: { labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' } }, y: { ticks: { color: '#9ca3af' } } } }} />
        </div>
      </div>

      {/* Tabla de Rendimiento de Agentes */}
      <div className="bg-[#1a1a2e] rounded-xl border border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Detalle por Agente</h3>
          <button className="text-blue-400 text-sm hover:underline">Ver todos</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                <th className="text-left p-4 text-gray-400 font-medium">Agente</th>
                <th className="text-center p-4 text-gray-400 font-medium">Tickets</th>
                <th className="text-center p-4 text-gray-400 font-medium">Resueltos</th>
                <th className="text-center p-4 text-gray-400 font-medium">% Resolución</th>
                <th className="text-center p-4 text-gray-400 font-medium">Tiempo Prom.</th>
                <th className="text-center p-4 text-gray-400 font-medium">Satisfacción</th>
                <th className="text-center p-4 text-gray-400 font-medium">Tendencia</th>
              </tr>
            </thead>
            <tbody>
              {reportStats.byAgent.map(agent => (
                <tr key={agent.agent} className="border-b border-gray-800 hover:bg-[#252540]">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">{agent.agent.charAt(0)}</div>
                      <span className="text-white">{agent.agent}</span>
                    </div>
                  </td>
                  <td className="p-4 text-center text-white">{agent.tickets}</td>
                  <td className="p-4 text-center text-green-400">{agent.resolved}</td>
                  <td className="p-4 text-center">
                    <span className={`px-2 py-1 rounded text-sm ${Math.round((agent.resolved / agent.tickets) * 100) >= 90 ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                      {Math.round((agent.resolved / agent.tickets) * 100)}%
                    </span>
                  </td>
                  <td className="p-4 text-center text-white">{agent.avgTime} min</td>
                  <td className="p-4 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                      <span className="text-white">{agent.satisfaction}%</span>
                    </div>
                  </td>
                  <td className="p-4 text-center">
                    <TrendingUp className="w-5 h-5 text-green-400 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reportes Rápidos */}
      <div className="bg-[#1a1a2e] rounded-xl p-6 border border-gray-800">
        <h3 className="text-lg font-semibold text-white mb-4">Reportes Rápidos</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { name: 'Tickets Abiertos', icon: MessageSquare, color: 'blue', action: () => showToast('Generando reporte de tickets abiertos...') },
            { name: 'SLA Vencidos', icon: AlertTriangle, color: 'red', action: () => showToast('Generando reporte de SLA vencidos...') },
            { name: 'Satisfacción Semanal', icon: Star, color: 'yellow', action: () => showToast('Generando reporte de satisfacción...') },
            { name: 'Rendimiento Equipo', icon: Users, color: 'green', action: () => showToast('Generando reporte de rendimiento...') },
            { name: 'Escalaciones', icon: ArrowUp, color: 'purple', action: () => showToast('Generando reporte de escalaciones...') },
            { name: 'Tiempo de Respuesta', icon: Clock, color: 'cyan', action: () => showToast('Generando reporte de tiempos...') },
            { name: 'Por Categoría', icon: Tag, color: 'orange', action: () => showToast('Generando reporte por categoría...') },
            { name: 'Reporte Personalizado', icon: Settings, color: 'gray', action: () => showToast('Abriendo generador de reportes...') }
          ].map(report => (
            <button key={report.name} onClick={report.action} className="p-4 bg-[#0f0f1a] hover:bg-[#252540] rounded-xl border border-gray-700 hover:border-gray-600 transition-all text-left group">
              <report.icon className={`w-8 h-8 mb-2 text-${report.color}-400 group-hover:scale-110 transition-transform`} />
              <p className="text-white font-medium">{report.name}</p>
              <p className="text-gray-500 text-xs mt-1">Generar ahora →</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );


  // Render Internal Chat View - EXPANDED
  const internalContacts = [
    { id: 'admin-001', name: 'Admin Principal', role: 'admin', status: 'online', color: 'from-red-500 to-orange-600', unread: 2, lastMessage: 'Revisar tickets urgentes', lastTime: '10:30' },
    { id: 'operator-001', name: 'Operador Demo', role: 'operator', status: 'online', color: 'from-purple-500 to-pink-600', unread: 0, lastMessage: 'Caso escalado resuelto', lastTime: '09:45' },
    { id: 'support-2', name: 'Soporte 2', role: 'support', status: 'busy', color: 'from-blue-500 to-cyan-600', unread: 1, lastMessage: '¿Puedes ayudarme con...', lastTime: '11:15' },
    { id: 'support-3', name: 'Soporte 3', role: 'support', status: 'away', color: 'from-green-500 to-emerald-600', unread: 0, lastMessage: 'Gracias!', lastTime: 'Ayer' },
  ];

  const announcements = [
    { id: 1, title: 'Actualización del Sistema', content: 'Mañana habrá mantenimiento de 2:00 AM a 4:00 AM', author: 'Admin Principal', date: '2025-12-25', priority: 'high' },
    { id: 2, title: 'Nuevas Políticas de SLA', content: 'Se han actualizado los tiempos de respuesta', author: 'Admin Principal', date: '2025-12-24', priority: 'medium' },
  ];

  const handlePinMessage = (msgId: number) => {
    if (pinnedMessages.includes(msgId)) {
      setPinnedMessages(pinnedMessages.filter(id => id !== msgId));
      showToast('Mensaje desanclado');
    } else {
      setPinnedMessages([...pinnedMessages, msgId]);
      showToast('Mensaje anclado');
    }
  };

  const handleMentionUser = (userName: string) => {
    setNewInternalMessage(newInternalMessage + `@${userName} `);
  };

  const handleShareTicket = () => {
    if (selectedTicket) {
      setNewInternalMessage(newInternalMessage + `[Ticket #${selectedTicket.id}] ${selectedTicket.subject}`);
      showToast('Ticket añadido al mensaje');
    } else {
      showToast('Selecciona un ticket primero');
    }
  };

  const filteredInternalContacts = internalContacts.filter(c => {
    if (internalChatSearch && !c.name.toLowerCase().includes(internalChatSearch.toLowerCase())) return false;
    return true;
  });

  const renderInternalChat = () => (
    <div className="flex h-[calc(100vh-140px)] gap-4">
      {/* Panel Izquierdo */}
      <div className="w-80 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2"><MessageCircle className="w-5 h-5 text-blue-400" /> Chat Interno</h3>
        </div>
        <div className="p-3 border-b border-gray-800">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" value={internalChatSearch} onChange={e => setInternalChatSearch(e.target.value)} placeholder="Buscar contacto..." className="w-full pl-10 pr-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-sm" />
          </div>
        </div>
        <div className="flex border-b border-gray-800">
          {[{ id: 'general', label: 'General', icon: Users }, { id: 'direct', label: 'Directo', icon: MessageSquare }, { id: 'announcements', label: 'Anuncios', icon: Bell }].map(tab => (
            <button key={tab.id} onClick={() => setInternalChatTab(tab.id as typeof internalChatTab)} className={`flex-1 px-3 py-2 text-sm flex items-center justify-center gap-1 ${internalChatTab === tab.id ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-400'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-3">
          {internalChatTab === 'general' && (
            <>
              <div className="p-3 bg-blue-600/20 border border-blue-500/30 rounded-lg mb-3 cursor-pointer" onClick={() => setSelectedInternalContact(null)}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                  <div className="flex-1"><p className="text-white font-medium"># Canal General</p><p className="text-gray-400 text-xs">Todos los miembros</p></div>
                  <span className="w-5 h-5 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">3</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 uppercase mb-2">En línea ({internalContacts.filter(c => c.status === 'online').length})</p>
              {filteredInternalContacts.filter(c => c.status === 'online').map(contact => (
                <div key={contact.id} onClick={() => { setSelectedInternalContact(contact); setInternalChatTab('direct'); }} className="p-3 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg mb-2 cursor-pointer flex items-center gap-3">
                  <div className="relative">
                    <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center text-white font-bold`}>{contact.name.charAt(0)}</div>
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-[#0f0f1a]"></span>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium">{contact.name}</p><p className="text-gray-400 text-xs">{contact.role === 'admin' ? 'Admin' : contact.role === 'operator' ? 'Operador' : 'Soporte'}</p></div>
                </div>
              ))}
              <p className="text-xs text-gray-500 uppercase mb-2 mt-4">Otros</p>
              {filteredInternalContacts.filter(c => c.status !== 'online').map(contact => (
                <div key={contact.id} onClick={() => { setSelectedInternalContact(contact); setInternalChatTab('direct'); }} className="p-3 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg mb-2 cursor-pointer flex items-center gap-3 opacity-60">
                  <div className="relative">
                    <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center text-white font-bold`}>{contact.name.charAt(0)}</div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f1a] ${contact.status === 'busy' ? 'bg-red-500' : contact.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'}`}></span>
                  </div>
                  <div className="flex-1 min-w-0"><p className="text-white text-sm font-medium">{contact.name}</p><p className="text-gray-400 text-xs">{contact.status === 'busy' ? 'Ocupado' : contact.status === 'away' ? 'Ausente' : 'Desconectado'}</p></div>
                </div>
              ))}
            </>
          )}
          {internalChatTab === 'direct' && (
            <>
              <div className="flex gap-2 mb-3">
                {['all', 'unread'].map(f => (
                  <button key={f} onClick={() => setInternalChatFilter(f as typeof internalChatFilter)} className={`px-3 py-1 rounded-lg text-xs ${internalChatFilter === f ? 'bg-blue-600 text-white' : 'bg-[#0f0f1a] text-gray-400'}`}>{f === 'all' ? 'Todos' : 'No leídos'}</button>
                ))}
              </div>
              {filteredInternalContacts.filter(c => internalChatFilter === 'all' || c.unread > 0).map(contact => (
                <div key={contact.id} onClick={() => setSelectedInternalContact(contact)} className={`p-3 rounded-lg cursor-pointer flex items-center gap-3 mb-2 ${selectedInternalContact?.id === contact.id ? 'bg-blue-600/20 border border-blue-500/30' : 'bg-[#0f0f1a] hover:bg-[#252540]'}`}>
                  <div className="relative">
                    <div className={`w-10 h-10 bg-gradient-to-br ${contact.color} rounded-full flex items-center justify-center text-white font-bold`}>{contact.name.charAt(0)}</div>
                    <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#0f0f1a] ${contact.status === 'online' ? 'bg-green-500' : contact.status === 'busy' ? 'bg-red-500' : 'bg-gray-500'}`}></span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between"><p className="text-white text-sm font-medium">{contact.name}</p><span className="text-gray-500 text-xs">{contact.lastTime}</span></div>
                    <p className="text-gray-400 text-xs truncate">{contact.lastMessage}</p>
                  </div>
                  {contact.unread > 0 && <span className="w-5 h-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">{contact.unread}</span>}
                </div>
              ))}
            </>
          )}
          {internalChatTab === 'announcements' && announcements.map(ann => (
            <div key={ann.id} className={`p-4 rounded-lg border mb-3 ${ann.priority === 'high' ? 'bg-red-500/10 border-red-500/30' : 'bg-[#0f0f1a] border-gray-700'}`}>
              <div className="flex items-center gap-2 mb-2">{ann.priority === 'high' && <AlertTriangle className="w-4 h-4 text-red-400" />}<h4 className="text-white font-medium">{ann.title}</h4></div>
              <p className="text-gray-300 text-sm mb-2">{ann.content}</p>
              <p className="text-gray-500 text-xs">{ann.author} • {ann.date}</p>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-gray-800">
          <div className="flex items-center gap-3 p-2 bg-[#0f0f1a] rounded-lg">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">S</div>
            <div className="flex-1"><p className="text-white text-sm">Soporte Demo</p><p className="text-green-400 text-xs">● En línea</p></div>
          </div>
        </div>
      </div>

      {/* Panel Central */}
      <div className="flex-1 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {selectedInternalContact ? (
              <>
                <div className={`w-10 h-10 bg-gradient-to-br ${selectedInternalContact.role === 'admin' ? 'from-red-500 to-orange-600' : 'from-purple-500 to-pink-600'} rounded-full flex items-center justify-center text-white font-bold`}>{selectedInternalContact.name.charAt(0)}</div>
                <div><h3 className="text-white font-medium">{selectedInternalContact.name}</h3><p className="text-gray-400 text-xs">{selectedInternalContact.role === 'admin' ? 'Administrador' : 'Operador'}</p></div>
              </>
            ) : (
              <>
                <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-white" /></div>
                <div><h3 className="text-white font-medium"># Canal General</h3><p className="text-gray-400 text-xs">{internalContacts.length} miembros</p></div>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-gray-700 rounded-lg"><Search className="w-5 h-5 text-gray-400" /></button>
            <button className="p-2 hover:bg-gray-700 rounded-lg"><Star className="w-5 h-5 text-gray-400" /></button>
            <button onClick={() => setShowInternalUserInfo(!showInternalUserInfo)} className="p-2 hover:bg-gray-700 rounded-lg"><User className="w-5 h-5 text-gray-400" /></button>
          </div>
        </div>
        {pinnedMessages.length > 0 && (
          <div className="px-4 py-2 bg-yellow-500/10 border-b border-yellow-500/30 flex items-center gap-2">
            <Star className="w-4 h-4 text-yellow-400" /><span className="text-yellow-400 text-sm">{pinnedMessages.length} mensaje(s) anclado(s)</span>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {internalMessages.map(msg => (
            <div key={msg.id} className={`flex ${msg.senderId === 'support-demo' ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[70%] ${msg.senderId === 'support-demo' ? '' : 'flex gap-3'}`}>
                {msg.senderId !== 'support-demo' && (
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${msg.senderRole === 'admin' ? 'bg-gradient-to-br from-red-500 to-orange-600' : 'bg-gradient-to-br from-purple-500 to-pink-600'}`}>{msg.senderName.charAt(0)}</div>
                )}
                <div>
                  {msg.senderId !== 'support-demo' && <p className="text-xs text-gray-400 mb-1">{msg.senderName}</p>}
                  <div className={`p-3 rounded-lg relative ${msg.senderId === 'support-demo' ? 'bg-blue-600 text-white' : 'bg-[#0f0f1a] text-white'}`}>
                    <p className="text-sm">{msg.message}</p>
                    <p className="text-xs mt-1 opacity-70">{msg.timestamp}</p>
                    <div className="absolute -top-2 right-0 hidden group-hover:flex items-center gap-1 bg-[#1a1a2e] rounded-lg p-1 shadow-lg border border-gray-700">
                      <button className="p-1 hover:bg-gray-700 rounded text-xs">👍</button>
                      <button onClick={() => handlePinMessage(msg.id)} className="p-1 hover:bg-gray-700 rounded"><Star className={`w-3 h-3 ${pinnedMessages.includes(msg.id) ? 'text-yellow-400' : 'text-gray-400'}`} /></button>
                      <button className="p-1 hover:bg-gray-700 rounded"><Copy className="w-3 h-3 text-gray-400" /></button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={internalChatEndRef} />
        </div>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-2 mb-2">
            <button onClick={handleShareTicket} className="px-2 py-1 bg-[#0f0f1a] hover:bg-[#252540] text-gray-400 text-xs rounded flex items-center gap-1"><Link2 className="w-3 h-3" /> Ticket</button>
            <button onClick={() => handleMentionUser('Admin')} className="px-2 py-1 bg-[#0f0f1a] hover:bg-[#252540] text-gray-400 text-xs rounded">@Mencionar</button>
          </div>
          <div className="flex gap-2">
            <button className="p-2 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg"><Paperclip className="w-5 h-5 text-gray-400" /></button>
            <button onClick={() => setShowEmojiPicker(!showEmojiPicker)} className="p-2 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg"><Smile className="w-5 h-5 text-gray-400" /></button>
            <input type="text" value={newInternalMessage} onChange={e => setNewInternalMessage(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSendInternalMessage()} placeholder="Escribe un mensaje..." className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
            <button onClick={handleSendInternalMessage} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"><Send className="w-5 h-5" /></button>
          </div>
          {showEmojiPicker && (
            <div className="mt-2 bg-[#0f0f1a] border border-gray-700 rounded-lg p-2">
              <div className="flex gap-2">{['😀', '😂', '👍', '❤️', '🎉', '🔥', '👀', '✅'].map(emoji => (
                <button key={emoji} onClick={() => { setNewInternalMessage(newInternalMessage + emoji); setShowEmojiPicker(false); }} className="text-xl hover:bg-gray-700 p-1 rounded">{emoji}</button>
              ))}</div>
            </div>
          )}
        </div>
      </div>

      {/* Panel Derecho - Info */}
      {showInternalUserInfo && selectedInternalContact && (
        <div className="w-72 bg-[#1a1a2e] rounded-xl border border-gray-800 flex flex-col">
          <div className="p-4 border-b border-gray-800 flex items-center justify-between">
            <h3 className="text-white font-medium">Información</h3>
            <button onClick={() => setShowInternalUserInfo(false)} className="p-1 hover:bg-gray-700 rounded"><X className="w-4 h-4 text-gray-400" /></button>
          </div>
          <div className="p-4 space-y-4">
            <div className="text-center">
              <div className={`w-20 h-20 bg-gradient-to-br ${selectedInternalContact.role === 'admin' ? 'from-red-500 to-orange-600' : 'from-purple-500 to-pink-600'} rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-3`}>{selectedInternalContact.name.charAt(0)}</div>
              <h4 className="text-white font-medium">{selectedInternalContact.name}</h4>
              <p className="text-gray-400 text-sm">{selectedInternalContact.role === 'admin' ? 'Administrador' : 'Operador'}</p>
              <span className="inline-flex items-center gap-1 text-green-400 text-sm mt-1"><span className="w-2 h-2 bg-green-400 rounded-full"></span> En línea</span>
            </div>
            <div className="space-y-3">
              <div className="p-3 bg-[#0f0f1a] rounded-lg"><p className="text-gray-400 text-xs mb-1">Email</p><p className="text-white text-sm">{selectedInternalContact.name.toLowerCase().replace(' ', '.')}@tormentus.com</p></div>
              <div className="p-3 bg-[#0f0f1a] rounded-lg"><p className="text-gray-400 text-xs mb-1">Departamento</p><p className="text-white text-sm">{selectedInternalContact.role === 'admin' ? 'Administración' : 'Operaciones'}</p></div>
            </div>
            <button className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center justify-center gap-2"><MessageSquare className="w-4 h-4" /> Enviar Mensaje</button>
          </div>
        </div>
      )}
    </div>
  );


  // Render Settings View
  const renderSettings = () => (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-xl font-semibold text-white mb-6">Configuración</h2>
      <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
        {[
          { id: 'profile', label: 'Perfil', icon: User },
          { id: 'security', label: 'Seguridad', icon: Shield },
          { id: 'notifications', label: 'Notificaciones', icon: Bell },
          { id: 'schedule', label: 'Horario', icon: Clock },
          { id: 'responses', label: 'Respuestas', icon: MessageSquare },
          { id: 'appearance', label: 'Apariencia', icon: Moon },
          { id: 'shortcuts', label: 'Atajos', icon: Command },
          { id: 'privacy', label: 'Privacidad', icon: Eye },
          { id: 'integrations', label: 'Integraciones', icon: Zap },
        ].map(tab => (
          <button key={tab.id} onClick={() => setSettingsTab(tab.id as typeof settingsTab)} className={`px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap ${settingsTab === tab.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>
            <tab.icon className="w-4 h-4" /> {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Tab - Expanded */}
      {settingsTab === 'profile' && (
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6 space-y-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">S</div>
              <button className="absolute bottom-0 right-0 p-2 bg-blue-600 hover:bg-blue-700 rounded-full"><Edit className="w-4 h-4 text-white" /></button>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Soporte Demo</h3>
              <p className="text-gray-400">Agente de Soporte</p>
              <p className="text-green-500 text-sm mt-1">● En línea</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Nombre completo</label>
              <input type="text" defaultValue="Soporte Demo" className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Email</label>
              <input type="email" defaultValue="soporte@tormentus.com" className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Teléfono</label>
              <input type="tel" value={profilePhone} onChange={e => setProfilePhone(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Zona horaria</label>
              <select value={profileTimezone} onChange={e => setProfileTimezone(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">
                <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                <option value="America/Bogota">Bogotá (GMT-5)</option>
                <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                <option value="Europe/Madrid">Madrid (GMT+1)</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Idioma preferido</label>
              <select value={profileLanguage} onChange={e => setProfileLanguage(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">
                <option value="es">Español</option>
                <option value="en">English</option>
                <option value="pt">Português</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">ID de Agente</label>
              <input type="text" value="AGT-001" disabled className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-gray-500" />
            </div>
          </div>
          
          <div>
            <label className="block text-gray-400 text-sm mb-1">Biografía / Descripción</label>
            <textarea value={profileBio} onChange={e => setProfileBio(e.target.value)} rows={3} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" placeholder="Cuéntanos sobre ti..." />
          </div>
          
          <div className="flex justify-end">
            <button onClick={saveAgentSettings} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar Cambios</button>
          </div>
        </div>
      )}
      {/* Notifications Tab - Expanded */}
      {settingsTab === 'notifications' && (
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Canales de Notificación</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Notificaciones en la app</p>
                  <p className="text-gray-400 text-sm">Recibir notificaciones dentro de la plataforma</p>
                </div>
                <button className="w-12 h-6 rounded-full bg-blue-600">
                  <div className="w-5 h-5 bg-white rounded-full translate-x-6"></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Notificaciones por email</p>
                  <p className="text-gray-400 text-sm">Recibir resúmenes y alertas por correo</p>
                </div>
                <button onClick={() => setEmailNotifications(!emailNotifications)} className={`w-12 h-6 rounded-full ${emailNotifications ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Notificaciones push (escritorio)</p>
                  <p className="text-gray-400 text-sm">Alertas del navegador cuando hay nuevos eventos</p>
                </div>
                <button onClick={() => setPushNotifications(!pushNotifications)} className={`w-12 h-6 rounded-full ${pushNotifications ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${pushNotifications ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Sonidos</p>
                  <p className="text-gray-400 text-sm">Reproducir sonido con las notificaciones</p>
                </div>
                <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-12 h-6 rounded-full ${soundEnabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${soundEnabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Tipos de Notificación</h3>
            <div className="space-y-4">
              {[
                { label: 'Nuevos tickets asignados', enabled: true },
                { label: 'Chats en espera', enabled: true },
                { label: 'Alertas SLA', enabled: true },
                { label: 'Mensajes internos del equipo', enabled: true },
                { label: 'Tickets escalados', enabled: true },
                { label: 'Nuevas calificaciones', enabled: false },
                { label: 'Actualizaciones del sistema', enabled: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                  <p className="text-white">{item.label}</p>
                  <button className={`w-12 h-6 rounded-full ${item.enabled ? 'bg-blue-600' : 'bg-gray-600'}`}>
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${item.enabled ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Horario de Notificaciones</h3>
            <p className="text-gray-400 text-sm mb-4">No recibir notificaciones fuera de este horario</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Hora inicio</label>
                <input type="time" value={notificationSchedule.start} onChange={e => setNotificationSchedule({ ...notificationSchedule, start: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Hora fin</label>
                <input type="time" value={notificationSchedule.end} onChange={e => setNotificationSchedule({ ...notificationSchedule, end: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Frecuencia de Alertas SLA</h3>
            <select value={slaAlertFrequency} onChange={e => setSlaAlertFrequency(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">
              <option value="5">Cada 5 minutos</option>
              <option value="15">Cada 15 minutos</option>
              <option value="30">Cada 30 minutos</option>
              <option value="60">Cada hora</option>
            </select>
          </div>
        </div>
      )}
      {settingsTab === 'appearance' && (
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
          <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
            <div className="flex items-center gap-3">
              {darkMode ? <Moon className="w-5 h-5 text-blue-500" /> : <Sun className="w-5 h-5 text-yellow-500" />}
              <p className="text-white">Modo Oscuro</p>
            </div>
            <button onClick={() => setDarkMode(!darkMode)} className={`w-12 h-6 rounded-full ${darkMode ? 'bg-blue-600' : 'bg-gray-600'}`}>
              <div className={`w-5 h-5 bg-white rounded-full transition-transform ${darkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
            </button>
          </div>
        </div>
      )}
      {/* Security Tab - Expanded */}
      {settingsTab === 'security' && (
        <div className="space-y-6">
          {/* Change Password */}
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Cambiar Contraseña</h3>
                <p className="text-gray-400 text-sm">Última actualización: hace 30 días</p>
              </div>
              <button onClick={() => setShowChangePassword(!showChangePassword)} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                {showChangePassword ? 'Cancelar' : 'Cambiar'}
              </button>
            </div>
            {showChangePassword && (
              <div className="space-y-4 pt-4 border-t border-gray-700">
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Contraseña actual</label>
                  <input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Nueva contraseña</label>
                  <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-1">Confirmar contraseña</label>
                  <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
                </div>
                <button onClick={() => { setShowChangePassword(false); showToast('Contraseña actualizada'); }} className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg">Actualizar Contraseña</button>
              </div>
            )}
          </div>

          {/* Two Factor Authentication */}
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-white font-medium">Autenticación de Dos Factores (2FA)</h3>
                <p className="text-gray-400 text-sm">Añade una capa extra de seguridad a tu cuenta</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded ${twoFactorEnabled ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                  {twoFactorEnabled ? 'Activo' : 'Inactivo'}
                </span>
                <button onClick={() => setShowTwoFactorSetup(true)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">
                  {twoFactorEnabled ? 'Configurar' : 'Activar'}
                </button>
              </div>
            </div>
            {twoFactorEnabled && (
              <div className="pt-4 border-t border-gray-700">
                <p className="text-gray-400 text-sm mb-2">Códigos de respaldo disponibles: 8/10</p>
                <button className="text-blue-500 text-sm hover:underline">Ver códigos de respaldo</button>
              </div>
            )}
          </div>

          {/* Security Questions */}
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Preguntas de Seguridad</h3>
            <div className="space-y-3">
              {securityQuestions.map((sq, i) => (
                <div key={i} className="p-3 bg-[#0f0f1a] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{sq.question}</p>
                    <p className="text-gray-500 text-xs">Respuesta: {sq.answer}</p>
                  </div>
                  <button className="text-blue-500 text-sm">Editar</button>
                </div>
              ))}
              <button className="text-blue-500 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Añadir pregunta</button>
            </div>
          </div>

          {/* Active Sessions */}
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Sesiones Activas</h3>
              <button className="text-red-500 text-sm hover:underline">Cerrar todas las demás</button>
            </div>
            <div className="space-y-3">
              {activeSessions.map(session => (
                <div key={session.id} className="p-3 bg-[#0f0f1a] rounded-lg flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-gray-400" />
                    <div>
                      <p className="text-white text-sm">{session.device}</p>
                      <p className="text-gray-500 text-xs">{session.ip} • {session.location} • {session.lastActive}</p>
                    </div>
                  </div>
                  {session.current ? (
                    <span className="px-2 py-1 bg-green-500/20 text-green-500 text-xs rounded">Sesión actual</span>
                  ) : (
                    <button className="text-red-500 text-sm">Cerrar</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Login History */}
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Historial de Inicios de Sesión</h3>
            <div className="space-y-2">
              {loginHistory.map((login, i) => (
                <div key={i} className="p-3 bg-[#0f0f1a] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{login.device}</p>
                    <p className="text-gray-500 text-xs">{login.date} • {login.ip} • {login.location}</p>
                  </div>
                  {login.current && <span className="px-2 py-1 bg-blue-500/20 text-blue-500 text-xs rounded">Actual</span>}
                </div>
              ))}
            </div>
          </div>

          {/* Trusted Devices */}
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Dispositivos de Confianza</h3>
            <div className="space-y-3">
              {trustedDevices.map(device => (
                <div key={device.id} className="p-3 bg-[#0f0f1a] rounded-lg flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">{device.name}</p>
                    <p className="text-gray-500 text-xs">Último uso: {device.lastUsed}</p>
                  </div>
                  <button onClick={() => setTrustedDevices(trustedDevices.filter(d => d.id !== device.id))} className="text-red-500 text-sm">Eliminar</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {/* Responses Tab - Expanded */}
      {settingsTab === 'responses' && (
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Configuración de Auto-asignación</h3>
            <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
              <div>
                <p className="text-white">Auto-asignación de tickets</p>
                <p className="text-gray-400 text-sm">Asignar tickets automáticamente cuando estés disponible</p>
              </div>
              <button onClick={() => setAutoAssign(!autoAssign)} className={`w-12 h-6 rounded-full ${autoAssign ? 'bg-blue-600' : 'bg-gray-600'}`}>
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${autoAssign ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
              </button>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Firma de Mensajes</h3>
            <textarea value={signature} onChange={e => setSignature(e.target.value)} rows={3} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" placeholder="Tu firma aparecerá al final de tus mensajes..." />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Mensaje de Ausencia</h3>
            <p className="text-gray-400 text-sm mb-2">Se enviará automáticamente cuando tu estado sea "Ausente"</p>
            <textarea value={awayMessage} onChange={e => setAwayMessage(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Mensaje Fuera de Horario</h3>
            <p className="text-gray-400 text-sm mb-2">Se enviará cuando recibas mensajes fuera de tu horario laboral</p>
            <textarea value={outOfHoursMessage} onChange={e => setOutOfHoursMessage(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Saludo Automático</h3>
            <p className="text-gray-400 text-sm mb-2">Mensaje inicial al aceptar un chat</p>
            <textarea value={autoGreeting} onChange={e => setAutoGreeting(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Mensaje de Cierre</h3>
            <p className="text-gray-400 text-sm mb-2">Mensaje antes de cerrar un ticket</p>
            <textarea value={autoClosingMessage} onChange={e => setAutoClosingMessage(e.target.value)} rows={2} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
          </div>

          <div className="flex justify-end">
            <button onClick={saveAgentSettings} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar Cambios</button>
          </div>
        </div>
      )}
      {settingsTab === 'shortcuts' && (
        <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
          <h3 className="text-white font-medium mb-4">Atajos de Teclado</h3>
          <p className="text-gray-400 text-sm mb-4">Personaliza los atajos para trabajar más rápido</p>
          <div className="space-y-2">
            {[
              { keys: 'Ctrl + K', action: 'Búsqueda global', editable: true },
              { keys: 'Ctrl + /', action: 'Respuestas rápidas', editable: true },
              { keys: 'Ctrl + Enter', action: 'Enviar mensaje', editable: true },
              { keys: 'Ctrl + Shift + E', action: 'Escalar ticket', editable: true },
              { keys: 'Ctrl + Shift + R', action: 'Resolver ticket', editable: true },
              { keys: 'Esc', action: 'Cerrar modal', editable: false },
            ].map((s, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <span className="text-white">{s.action}</span>
                <div className="flex items-center gap-2">
                  <kbd className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">{s.keys}</kbd>
                  {s.editable && <button className="text-blue-500 text-sm">Editar</button>}
                </div>
              </div>
            ))}
          </div>
          <button className="mt-4 text-blue-500 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Añadir atajo personalizado</button>
        </div>
      )}

      {/* Schedule Tab - New */}
      {settingsTab === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Horario de Trabajo</h3>
            <div className="space-y-3">
              {Object.entries(workSchedule).map(([day, schedule]) => (
                <div key={day} className="flex items-center gap-4 p-3 bg-[#0f0f1a] rounded-lg">
                  <button 
                    onClick={() => setWorkSchedule({ ...workSchedule, [day]: { ...schedule, enabled: !schedule.enabled } })}
                    className={`w-10 h-6 rounded-full ${schedule.enabled ? 'bg-blue-600' : 'bg-gray-600'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${schedule.enabled ? 'translate-x-4' : 'translate-x-0.5'}`}></div>
                  </button>
                  <span className={`w-24 capitalize ${schedule.enabled ? 'text-white' : 'text-gray-500'}`}>
                    {day === 'monday' ? 'Lunes' : day === 'tuesday' ? 'Martes' : day === 'wednesday' ? 'Miércoles' : day === 'thursday' ? 'Jueves' : day === 'friday' ? 'Viernes' : day === 'saturday' ? 'Sábado' : 'Domingo'}
                  </span>
                  {schedule.enabled && (
                    <>
                      <input type="time" value={schedule.start} onChange={e => setWorkSchedule({ ...workSchedule, [day]: { ...schedule, start: e.target.value } })} className="px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                      <span className="text-gray-400">a</span>
                      <input type="time" value={schedule.end} onChange={e => setWorkSchedule({ ...workSchedule, [day]: { ...schedule, end: e.target.value } })} className="px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Pausas Programadas</h3>
              <button onClick={() => setScheduledBreaks([...scheduledBreaks, { id: Date.now(), name: 'Nueva pausa', start: '12:00', end: '12:30' }])} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>
            <div className="space-y-3">
              {scheduledBreaks.map(breakItem => (
                <div key={breakItem.id} className="flex items-center gap-4 p-3 bg-[#0f0f1a] rounded-lg">
                  <input type="text" value={breakItem.name} onChange={e => setScheduledBreaks(scheduledBreaks.map(b => b.id === breakItem.id ? { ...b, name: e.target.value } : b))} className="flex-1 px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                  <input type="time" value={breakItem.start} onChange={e => setScheduledBreaks(scheduledBreaks.map(b => b.id === breakItem.id ? { ...b, start: e.target.value } : b))} className="px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                  <span className="text-gray-400">a</span>
                  <input type="time" value={breakItem.end} onChange={e => setScheduledBreaks(scheduledBreaks.map(b => b.id === breakItem.id ? { ...b, end: e.target.value } : b))} className="px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                  <button onClick={() => setScheduledBreaks(scheduledBreaks.filter(b => b.id !== breakItem.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Vacaciones / Ausencias</h3>
              <button onClick={() => setVacationDates([...vacationDates, { start: '', end: '' }])} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Añadir
              </button>
            </div>
            {vacationDates.length === 0 ? (
              <p className="text-gray-400 text-sm">No hay vacaciones programadas</p>
            ) : (
              <div className="space-y-3">
                {vacationDates.map((vacation, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 bg-[#0f0f1a] rounded-lg">
                    <span className="text-gray-400">Desde:</span>
                    <input type="date" value={vacation.start} onChange={e => setVacationDates(vacationDates.map((v, idx) => idx === i ? { ...v, start: e.target.value } : v))} className="px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                    <span className="text-gray-400">Hasta:</span>
                    <input type="date" value={vacation.end} onChange={e => setVacationDates(vacationDates.map((v, idx) => idx === i ? { ...v, end: e.target.value } : v))} className="px-3 py-1 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                    <button onClick={() => setVacationDates(vacationDates.filter((_, idx) => idx !== i))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end">
            <button onClick={saveAgentSettings} className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar Cambios</button>
          </div>
        </div>
      )}

      {/* Privacy Tab - New */}
      {settingsTab === 'privacy' && (
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Visibilidad</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Mostrar estado en línea</p>
                  <p className="text-gray-400 text-sm">Otros agentes pueden ver cuando estás conectado</p>
                </div>
                <button onClick={() => setShowOnlineStatus(!showOnlineStatus)} className={`w-12 h-6 rounded-full ${showOnlineStatus ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${showOnlineStatus ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Compartir estadísticas</p>
                  <p className="text-gray-400 text-sm">Mostrar tus métricas en el ranking del equipo</p>
                </div>
                <button onClick={() => setShareStats(!shareStats)} className={`w-12 h-6 rounded-full ${shareStats ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${shareStats ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                <div>
                  <p className="text-white">Historial de actividad visible</p>
                  <p className="text-gray-400 text-sm">Supervisores pueden ver tu actividad detallada</p>
                </div>
                <button onClick={() => setActivityVisible(!activityVisible)} className={`w-12 h-6 rounded-full ${activityVisible ? 'bg-blue-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full transition-transform ${activityVisible ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Datos y Privacidad</h3>
            <div className="space-y-3">
              <button className="w-full p-3 bg-[#0f0f1a] rounded-lg text-left hover:bg-[#252540] flex items-center justify-between">
                <span className="text-white">Descargar mis datos</span>
                <Download className="w-4 h-4 text-gray-400" />
              </button>
              <button className="w-full p-3 bg-[#0f0f1a] rounded-lg text-left hover:bg-[#252540] flex items-center justify-between">
                <span className="text-white">Ver política de privacidad</span>
                <Link2 className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab - New */}
      {settingsTab === 'integrations' && (
        <div className="space-y-6">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">API Tokens</h3>
              <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Crear Token
              </button>
            </div>
            <div className="space-y-3">
              {apiTokens.map(token => (
                <div key={token.id} className="p-4 bg-[#0f0f1a] rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-white font-medium">{token.name}</span>
                    <button className="text-red-500 text-sm">Revocar</button>
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <code className="flex-1 px-3 py-1 bg-[#1a1a2e] rounded text-gray-400 text-sm">{token.token}</code>
                    <button className="p-1 hover:bg-gray-700 rounded"><Copy className="w-4 h-4 text-gray-400" /></button>
                  </div>
                  <p className="text-gray-500 text-xs">Creado: {token.created} • Último uso: {token.lastUsed}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-medium">Webhooks</h3>
              <button onClick={() => setWebhooks([...webhooks, { id: Date.now(), url: '', events: [], active: true }])} className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg flex items-center gap-1">
                <Plus className="w-4 h-4" /> Añadir Webhook
              </button>
            </div>
            <div className="space-y-3">
              {webhooks.map(webhook => (
                <div key={webhook.id} className="p-4 bg-[#0f0f1a] rounded-lg">
                  <div className="flex items-center gap-4 mb-3">
                    <input type="url" value={webhook.url} onChange={e => setWebhooks(webhooks.map(w => w.id === webhook.id ? { ...w, url: e.target.value } : w))} placeholder="https://..." className="flex-1 px-3 py-2 bg-[#1a1a2e] border border-gray-700 rounded text-white text-sm" />
                    <button onClick={() => setWebhooks(webhooks.map(w => w.id === webhook.id ? { ...w, active: !w.active } : w))} className={`px-3 py-1 rounded text-sm ${webhook.active ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'}`}>
                      {webhook.active ? 'Activo' : 'Inactivo'}
                    </button>
                    <button onClick={() => setWebhooks(webhooks.filter(w => w.id !== webhook.id))} className="text-red-500"><Trash2 className="w-4 h-4" /></button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['ticket.created', 'ticket.resolved', 'ticket.escalated', 'chat.started', 'chat.ended'].map(event => (
                      <button key={event} onClick={() => setWebhooks(webhooks.map(w => w.id === webhook.id ? { ...w, events: w.events.includes(event) ? w.events.filter(e => e !== event) : [...w.events, event] } : w))} className={`px-2 py-1 rounded text-xs ${webhook.events.includes(event) ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                        {event}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 p-6">
            <h3 className="text-white font-medium mb-4">Conexiones Externas</h3>
            <div className="space-y-3">
              {[
                { name: 'Slack', connected: false, icon: '💬' },
                { name: 'Discord', connected: false, icon: '🎮' },
                { name: 'Telegram', connected: true, icon: '✈️' },
                { name: 'WhatsApp Business', connected: false, icon: '📱' },
              ].map((integration, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-[#0f0f1a] rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{integration.icon}</span>
                    <span className="text-white">{integration.name}</span>
                  </div>
                  <button className={`px-4 py-1 rounded-lg text-sm ${integration.connected ? 'bg-red-500/20 text-red-500 hover:bg-red-500/30' : 'bg-blue-600 hover:bg-blue-700 text-white'}`}>
                    {integration.connected ? 'Desconectar' : 'Conectar'}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );


  // Main Render
  return (
    <div className="min-h-screen bg-[#0f0f1a] flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-[#1a1a2e] border-r border-gray-800 flex flex-col transition-all duration-300`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          {sidebarOpen && <span className="text-xl font-bold text-white">TORMENTUS</span>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-gray-700 rounded-lg"><Menu className="w-5 h-5 text-gray-400" /></button>
        </div>
        <nav className="flex-1 p-2 space-y-1">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => setCurrentView(item.id as ViewType)} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${currentView === item.id ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="flex-1 text-left">{item.label}</span>}
              {sidebarOpen && item.badge !== undefined && item.badge > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">S</div>
              <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#1a1a2e] ${getAgentStatusColor(agentStatus)}`}></span>
            </div>
            {sidebarOpen && (
              <div className="flex-1">
                <p className="text-white text-sm font-medium">Soporte Demo</p>
                <button onClick={() => setShowStatusMenu(!showStatusMenu)} className="text-gray-400 text-xs hover:text-white">{getAgentStatusText(agentStatus)} ▼</button>
              </div>
            )}
          </div>
          {showStatusMenu && sidebarOpen && (
            <div className="mt-2 bg-[#0f0f1a] rounded-lg p-2 space-y-1">
              {(['available', 'busy', 'away', 'dnd'] as AgentStatus[]).map(status => (
                <button key={status} onClick={() => { updateAgentStatus(status); setShowStatusMenu(false); }} className="w-full flex items-center gap-2 px-2 py-1 rounded hover:bg-gray-800 text-left">
                  <span className={`w-2 h-2 rounded-full ${getAgentStatusColor(status)}`}></span>
                  <span className="text-gray-300 text-sm">{getAgentStatusText(status)}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>


      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        <header className="h-16 bg-[#1a1a2e] border-b border-gray-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold text-white">{menuItems.find(m => m.id === currentView)?.label}</h1>
            <button onClick={() => setShowGlobalSearch(true)} className="flex items-center gap-2 px-3 py-1.5 bg-[#0f0f1a] border border-gray-700 rounded-lg text-gray-400 hover:text-white">
              <Search className="w-4 h-4" /> <span className="text-sm">Buscar...</span> <kbd className="px-1.5 py-0.5 bg-gray-700 rounded text-xs">⌘K</kbd>
            </button>
          </div>
          <div className="flex items-center gap-4">
            <button onClick={() => setAutoRefresh(!autoRefresh)} className={`px-3 py-1 rounded-lg text-sm ${autoRefresh ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'}`}>
              <RefreshCw className={`w-4 h-4 inline mr-1 ${autoRefresh ? 'animate-spin' : ''}`} style={{ animationDuration: '3s' }} />
              {autoRefresh ? 'ON' : 'OFF'}
            </button>
            <div className="relative">
              <button onClick={() => setShowNotifications(!showNotifications)} className="p-2 hover:bg-gray-700 rounded-lg relative">
                <Bell className="w-5 h-5 text-gray-400" />
                {unreadNotifications > 0 && <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">{unreadNotifications}</span>}
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-12 w-80 bg-[#1a1a2e] border border-gray-800 rounded-xl shadow-xl z-50">
                  <div className="p-4 border-b border-gray-800 flex items-center justify-between">
                    <h3 className="text-white font-medium">Notificaciones</h3>
                    <button onClick={handleMarkAllNotificationsRead} className="text-blue-500 text-sm">Marcar todas</button>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map(n => (
                      <div key={n.id} onClick={() => handleMarkNotificationRead(n.id)} className={`p-3 border-b border-gray-800 cursor-pointer hover:bg-gray-800 ${!n.isRead ? 'bg-blue-500/10' : ''}`}>
                        <p className="text-white text-sm">{n.title}</p>
                        <p className="text-gray-400 text-xs">{n.message}</p>
                        <p className="text-gray-500 text-xs mt-1">{n.timestamp}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="relative">
              <button onClick={() => setShowUserMenu(!showUserMenu)} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded-lg">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">S</div>
                <ChevronDown className="w-4 h-4 text-gray-400" />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-12 w-48 bg-[#1a1a2e] border border-gray-800 rounded-xl shadow-xl z-50">
                  <button onClick={() => { setCurrentView('settings'); setShowUserMenu(false); }} className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 flex items-center gap-2"><Settings className="w-4 h-4" /> Configuración</button>
                  <button onClick={handleLogout} className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-800 flex items-center gap-2"><LogOut className="w-4 h-4" /> Cerrar Sesión</button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="flex-1 p-6 overflow-y-auto">
          {currentView === 'dashboard' && renderDashboard()}
          {currentView === 'tickets' && renderTickets()}
          {currentView === 'queue' && renderQueue()}
          {currentView === 'chat' && renderLiveChat()}
          {currentView === 'users' && renderUsers()}
          {currentView === 'faq' && renderFAQ()}
          {currentView === 'templates' && renderTemplates()}
          {currentView === 'knowledge' && renderKnowledge()}
          {currentView === 'reports' && renderReports()}
          {currentView === 'internal' && renderInternalChat()}
          {currentView === 'settings' && renderSettings()}
        </div>
      </main>


      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-4 right-4 px-4 py-3 rounded-lg shadow-lg flex items-center gap-2 z-50 ${toast.type === 'success' ? 'bg-green-600' : toast.type === 'error' ? 'bg-red-600' : 'bg-blue-600'} text-white`}>
          {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
          {toast.type === 'error' && <XCircle className="w-5 h-5" />}
          {toast.type === 'info' && <AlertCircle className="w-5 h-5" />}
          {toast.message}
        </div>
      )}

      {/* Global Search Modal */}
      {showGlobalSearch && (
        <div className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-50" onClick={() => setShowGlobalSearch(false)}>
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-2xl" onClick={e => e.stopPropagation()}>
            <div className="p-4 border-b border-gray-800">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input type="text" autoFocus value={globalSearchQuery} onChange={e => setGlobalSearchQuery(e.target.value)} placeholder="Buscar tickets, usuarios, FAQ..." className="w-full pl-12 pr-4 py-3 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white text-lg" />
              </div>
            </div>
            {globalSearchResults && (
              <div className="max-h-96 overflow-y-auto p-4 space-y-4">
                {globalSearchResults.tickets.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">Tickets</h4>
                    {globalSearchResults.tickets.slice(0, 3).map(t => (
                      <div key={t.id} onClick={() => { setSelectedTicket(t); setCurrentView('tickets'); setShowGlobalSearch(false); }} className="p-2 hover:bg-gray-800 rounded cursor-pointer">
                        <p className="text-white">#{t.id} - {t.subject}</p>
                        <p className="text-gray-400 text-xs">{t.userName}</p>
                      </div>
                    ))}
                  </div>
                )}
                {globalSearchResults.users.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">Usuarios</h4>
                    {globalSearchResults.users.slice(0, 3).map(u => (
                      <div key={u.id} onClick={() => { setSelectedUser(u); setCurrentView('users'); setShowGlobalSearch(false); }} className="p-2 hover:bg-gray-800 rounded cursor-pointer">
                        <p className="text-white">{u.name}</p>
                        <p className="text-gray-400 text-xs">{u.email}</p>
                      </div>
                    ))}
                  </div>
                )}
                {globalSearchResults.faqs.length > 0 && (
                  <div>
                    <h4 className="text-gray-400 text-sm mb-2">FAQ</h4>
                    {globalSearchResults.faqs.slice(0, 3).map(f => (
                      <div key={f.id} onClick={() => { setCurrentView('faq'); setShowGlobalSearch(false); }} className="p-2 hover:bg-gray-800 rounded cursor-pointer">
                        <p className="text-white">{f.question}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {/* Canned Responses Modal */}
      {showCannedResponses && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowCannedResponses(false)}>
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-4">Respuestas Rápidas</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {cannedResponses.map(r => (
                <button key={r.id} onClick={() => { setNewMessage(r.content); setShowCannedResponses(false); showToast('Respuesta aplicada'); }} className="w-full p-3 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-white font-medium">{r.title}</span>
                    <span className="text-purple-400 text-xs">{r.shortcut}</span>
                  </div>
                  <p className="text-gray-400 text-sm line-clamp-2">{r.content}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Macros Modal */}
      {showMacros && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowMacros(false)}>
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-white mb-4">Macros</h3>
            <div className="space-y-2">
              {macros.map(m => (
                <button key={m.id} onClick={() => handleExecuteMacro(m)} className="w-full p-3 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg text-left">
                  <p className="text-white font-medium">{m.name}</p>
                  <p className="text-gray-400 text-xs mt-1">{m.actions.length} acciones</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Escalate Modal */}
      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Escalar Ticket</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-400 text-sm mb-1">Escalar a</label>
                <select value={escalateTo} onChange={e => setEscalateTo(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">
                  <option value="operator">Operador</option>
                  <option value="admin">Administrador</option>
                  <option value="technical">Equipo Técnico</option>
                </select>
              </div>
              <div>
                <label className="block text-gray-400 text-sm mb-1">Motivo</label>
                <textarea value={escalateReason} onChange={e => setEscalateReason(e.target.value)} rows={3} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white"></textarea>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowEscalateModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleEscalateTicket} className="px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg">Escalar</button>
            </div>
          </div>
        </div>
      )}


      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Transferir Ticket</h3>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Transferir a</label>
              <select value={transferTo} onChange={e => setTransferTo(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">
                <option value="">Seleccionar agente</option>
                {agents.filter(a => a.id !== 'support-demo').map(a => (
                  <option key={a.id} value={a.name}>{a.name} ({a.ticketCount} tickets)</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowTransferModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleTransferTicket} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Transferir</button>
            </div>
          </div>
        </div>
      )}

      {/* Merge Modal */}
      {showMergeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Fusionar Tickets</h3>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Fusionar con ticket #</label>
              <select value={mergeTargetId} onChange={e => setMergeTargetId(e.target.value)} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">
                <option value="">Seleccionar ticket</option>
                {tickets.filter(t => t.id !== selectedTicket?.id && t.odId === selectedTicket?.odId).map(t => (
                  <option key={t.id} value={t.id}>#{t.id} - {t.subject}</option>
                ))}
              </select>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowMergeModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleMergeTickets} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Fusionar</button>
            </div>
          </div>
        </div>
      )}

      {/* Collaborator Modal */}
      {showCollaboratorModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Añadir Colaborador</h3>
            <div className="space-y-2">
              {agents.filter(a => a.id !== 'support-demo' && !selectedTicket?.collaborators.includes(a.name)).map(a => (
                <button key={a.id} onClick={() => handleAddCollaborator(a.id)} className="w-full p-3 bg-[#0f0f1a] hover:bg-[#252540] rounded-lg flex items-center justify-between">
                  <span className="text-white">{a.name}</span>
                  <span className={`w-2 h-2 rounded-full ${getAgentStatusColor(a.status)}`}></span>
                </button>
              ))}
            </div>
            <button onClick={() => setShowCollaboratorModal(false)} className="w-full mt-4 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      )}

      {/* Tag Modal */}
      {showTagModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Gestionar Tags</h3>
            <div className="flex gap-2 mb-4">
              <input type="text" value={newTag} onChange={e => setNewTag(e.target.value)} placeholder="Nuevo tag..." className="flex-1 px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" />
              <button onClick={handleAddTag} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Añadir</button>
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {AVAILABLE_TAGS.filter(t => !selectedTicket?.tags.includes(t)).map(tag => (
                <button key={tag} onClick={() => { setNewTag(tag); handleAddTag(); }} className="px-2 py-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-sm rounded">#{tag}</button>
              ))}
            </div>
            <button onClick={() => setShowTagModal(false)} className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cerrar</button>
          </div>
        </div>
      )}


      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">{selectedFaq ? 'Editar FAQ' : 'Nueva FAQ'}</h3>
            <div className="space-y-4">
              <div><label className="block text-gray-400 text-sm mb-1">Pregunta</label><input type="text" value={faqForm.question} onChange={e => setFaqForm({ ...faqForm, question: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" /></div>
              <div><label className="block text-gray-400 text-sm mb-1">Respuesta</label><textarea value={faqForm.answer} onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })} rows={5} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white"></textarea></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-sm mb-1">Categoría</label><select value={faqForm.category} onChange={e => setFaqForm({ ...faqForm, category: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">{FAQ_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
                <div className="flex items-center gap-2 pt-6"><input type="checkbox" checked={faqForm.isPublished} onChange={e => setFaqForm({ ...faqForm, isPublished: e.target.checked })} /><label className="text-white">Publicar</label></div>
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowFaqModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleSaveFaq} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-2xl p-6">
            <h3 className="text-xl font-semibold text-white mb-4">{selectedTemplate ? 'Editar Plantilla' : 'Nueva Plantilla'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-sm mb-1">Nombre</label><input type="text" value={templateForm.name} onChange={e => setTemplateForm({ ...templateForm, name: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" /></div>
                <div><label className="block text-gray-400 text-sm mb-1">Atajo</label><input type="text" value={templateForm.shortcut} onChange={e => setTemplateForm({ ...templateForm, shortcut: e.target.value })} placeholder="/atajo" className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" /></div>
              </div>
              <div><label className="block text-gray-400 text-sm mb-1">Contenido</label><textarea value={templateForm.content} onChange={e => setTemplateForm({ ...templateForm, content: e.target.value })} rows={4} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white"></textarea></div>
              <div><label className="block text-gray-400 text-sm mb-1">Variables (separadas por coma)</label><input type="text" value={templateForm.variables} onChange={e => setTemplateForm({ ...templateForm, variables: e.target.value })} placeholder="nombre, monto" className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowTemplateModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleSaveTemplate} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Knowledge Modal */}
      {showKnowledgeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-3xl p-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-white mb-4">{selectedArticle ? 'Editar Artículo' : 'Nuevo Artículo'}</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-gray-400 text-sm mb-1">Título</label><input type="text" value={knowledgeForm.title} onChange={e => setKnowledgeForm({ ...knowledgeForm, title: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" /></div>
                <div><label className="block text-gray-400 text-sm mb-1">Categoría</label><select value={knowledgeForm.category} onChange={e => setKnowledgeForm({ ...knowledgeForm, category: e.target.value })} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white">{KNOWLEDGE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
              </div>
              <div><label className="block text-gray-400 text-sm mb-1">Contenido (Markdown)</label><textarea value={knowledgeForm.content} onChange={e => setKnowledgeForm({ ...knowledgeForm, content: e.target.value })} rows={10} className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white font-mono text-sm"></textarea></div>
              <div><label className="block text-gray-400 text-sm mb-1">Tags</label><input type="text" value={knowledgeForm.tags} onChange={e => setKnowledgeForm({ ...knowledgeForm, tags: e.target.value })} placeholder="tag1, tag2" className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white" /></div>
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowKnowledgeModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleSaveKnowledge} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}


      {/* User Note Modal */}
      {showUserNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Añadir Nota</h3>
            <textarea value={newUserNote} onChange={e => setNewUserNote(e.target.value)} rows={4} placeholder="Nota sobre el usuario..." className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white"></textarea>
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => setShowUserNoteModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleAddUserNote} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Rating Request Modal */}
      {showRatingRequestModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Solicitar Calificación</h3>
            <p className="text-gray-400 mb-4">Se enviará un mensaje al usuario solicitando que califique el servicio.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowRatingRequestModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleRequestRating} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg">Enviar</button>
            </div>
          </div>
        </div>
      )}

      {/* Agent Note Modal */}
      {showAgentNoteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-[#1a1a2e] rounded-xl border border-gray-800 w-full max-w-md p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Nueva Nota Personal</h3>
            <textarea value={newAgentNote} onChange={e => setNewAgentNote(e.target.value)} rows={3} placeholder="Tu nota..." className="w-full px-4 py-2 bg-[#0f0f1a] border border-gray-700 rounded-lg text-white mb-4"></textarea>
            <div className="flex gap-2 mb-4">
              {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'].map(color => (
                <button key={color} onClick={() => setAgentNoteColor(color)} className={`w-8 h-8 rounded-full ${agentNoteColor === color ? 'ring-2 ring-white' : ''}`} style={{ backgroundColor: color }}></button>
              ))}
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowAgentNoteModal(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancelar</button>
              <button onClick={handleAddAgentNote} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg">Guardar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
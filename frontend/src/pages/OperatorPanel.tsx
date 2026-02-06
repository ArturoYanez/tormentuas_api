import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  Trophy, Plus, Edit, Trash2, Eye, Users, DollarSign,
  Bell, Settings, LogOut, User, Shield, CheckCircle, XCircle, Clock,
  TrendingUp, Activity, BarChart3, Search, Sparkles, Menu, X, Download,
  Award, Star, AlertTriangle, RefreshCw, Target, Zap, Globe,
  Play, Pause, FileText, PieChart, ArrowUpRight, ArrowDownRight, Percent,
  AlertCircle, MessageSquare, Send, Ban, UserX, UserCheck,
  Sliders, Lock, History, Flag, Wallet, Mail, Monitor, Smartphone,
  Moon, Sun, Type, Layout, Keyboard, RotateCcw, Upload, Info, Wifi, Server,
  Copy, StickyNote, HelpCircle, ShieldCheck, Fingerprint
} from 'lucide-react';
import { Line, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend, ArcElement, BarElement);

// Types
type ViewType = 'dashboard' | 'tournaments' | 'users' | 'operations' | 'assets' | 'monitoring' | 'alerts' | 'reports' | 'chat' | 'settings';
type TournamentStatus = 'active' | 'upcoming' | 'finished' | 'paused';
type TournamentCategory = 'forex' | 'crypto' | 'stocks' | 'mixed';

interface Tournament {
  id: number;
  name: string;
  description: string;
  prizePool: number;
  entryFee: number;
  participants: Participant[];
  maxParticipants: number;
  status: TournamentStatus;
  category: TournamentCategory;
  startDate: string;
  endDate: string;
  initialBalance: number;
  rules: string;
  featured: boolean;
  rewards: { position: number; amount: number }[];
}

interface Participant {
  id: number;
  odId: string;
  name: string;
  balance: number;
  trades: number;
  profit: number;
  rank: number;
  status: 'active' | 'disqualified';
  joinedAt: string;
}

interface UserData {
  id: number;
  odId: string;
  name: string;
  email: string;
  phone: string;
  country: string;
  balance: number;
  demoBalance: number;
  status: 'active' | 'suspended' | 'pending' | 'blocked';
  verified: boolean;
  trades: number;
  winRate: number;
  totalDeposits: number;
  totalWithdrawals: number;
  lastLogin: string;
  createdAt: string;
  riskLevel: 'low' | 'medium' | 'high';
}

interface Operation {
  id: number;
  odId: string;
  userName: string;
  asset: string;
  type: 'buy' | 'sell';
  amount: number;
  result: 'win' | 'loss' | 'pending' | 'cancelled';
  profit: number;
  payout: number;
  openTime: string;
  closeTime: string;
  duration: number;
  flagged: boolean;
  flagReason?: string;
}

interface Asset {
  id: number;
  symbol: string;
  name: string;
  category: 'forex' | 'crypto' | 'stocks' | 'commodities';
  enabled: boolean;
  payout: number;
  minInvestment: number;
  maxInvestment: number;
  tradingHours: { start: string; end: string };
  volatility: 'low' | 'medium' | 'high';
}

interface Alert {
  id: number;
  type: 'suspicious' | 'high_volume' | 'win_streak' | 'pattern' | 'system';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  userId?: string;
  userName?: string;
  timestamp: string;
  read: boolean;
  resolved: boolean;
}

interface ChatMessage {
  id: number;
  senderId: string;
  senderName: string;
  senderRole: 'operator' | 'admin' | 'support';
  message: string;
  timestamp: string;
  read: boolean;
  attachment?: { type: 'image' | 'file'; url: string; name: string };
  reactions?: { emoji: string; userId: string }[];
}

interface UserNote {
  id: number;
  odId: string;
  note: string;
  createdBy: string;
  createdAt: string;
}

interface BalanceHistory {
  id: number;
  odId: string;
  type: 'add' | 'subtract';
  amount: number;
  reason: string;
  createdBy: string;
  createdAt: string;
}

interface TrustedDevice {
  id: number;
  name: string;
  browser: string;
  os: string;
  lastUsed: string;
  trusted: boolean;
}

interface SecurityQuestion {
  id: number;
  question: string;
  answer: string;
}

interface OperatorLog {
  id: number;
  action: string;
  target: string;
  details: string;
  timestamp: string;
}

// Mock Data
const MOCK_PARTICIPANTS: Participant[] = [
  { id: 1, odId: 'OD-001234', name: 'Carlos Mendez', balance: 2450.50, trades: 45, profit: 1450.50, rank: 1, status: 'active', joinedAt: '2025-12-20' },
  { id: 2, odId: 'OD-001235', name: 'Maria Garcia', balance: 2100.00, trades: 38, profit: 1100.00, rank: 2, status: 'active', joinedAt: '2025-12-20' },
  { id: 3, odId: 'OD-001236', name: 'Juan Rodriguez', balance: 1850.25, trades: 52, profit: 850.25, rank: 3, status: 'active', joinedAt: '2025-12-21' },
  { id: 4, odId: 'OD-001237', name: 'Ana Lopez', balance: 1200.00, trades: 28, profit: 200.00, rank: 4, status: 'disqualified', joinedAt: '2025-12-21' },
];

const MOCK_TOURNAMENTS: Tournament[] = [
  { id: 1, name: 'Weekly Forex Challenge', description: 'Torneo semanal de divisas', prizePool: 10000, entryFee: 0, participants: MOCK_PARTICIPANTS, maxParticipants: 1000, status: 'active', category: 'forex', startDate: '2025-12-20', endDate: '2025-12-27', initialBalance: 1000, rules: 'Apalancamiento máximo 1:100', featured: true, rewards: [{ position: 1, amount: 5000 }, { position: 2, amount: 3000 }, { position: 3, amount: 2000 }] },
  { id: 2, name: 'Crypto Masters', description: 'Competencia mensual de criptomonedas', prizePool: 25000, entryFee: 50, participants: [], maxParticipants: 500, status: 'upcoming', category: 'crypto', startDate: '2025-12-30', endDate: '2026-01-30', initialBalance: 5000, rules: 'Solo criptos principales', featured: true, rewards: [{ position: 1, amount: 12500 }, { position: 2, amount: 7500 }, { position: 3, amount: 5000 }] },
];

const MOCK_USERS: UserData[] = [
  { id: 1, odId: 'OD-001234', name: 'Carlos Mendez', email: 'carlos@email.com', phone: '+1234567890', country: 'México', balance: 5420.50, demoBalance: 10000, status: 'active', verified: true, trades: 156, winRate: 67.5, totalDeposits: 3000, totalWithdrawals: 1500, lastLogin: '2025-12-25 10:30', createdAt: '2025-01-15', riskLevel: 'low' },
  { id: 2, odId: 'OD-001235', name: 'Maria Garcia', email: 'maria@email.com', phone: '+0987654321', country: 'Colombia', balance: 12350.00, demoBalance: 10000, status: 'active', verified: true, trades: 289, winRate: 72.1, totalDeposits: 8000, totalWithdrawals: 2000, lastLogin: '2025-12-25 09:15', createdAt: '2025-02-20', riskLevel: 'medium' },
  { id: 3, odId: 'OD-001236', name: 'Juan Rodriguez', email: 'juan@email.com', phone: '+1122334455', country: 'Argentina', balance: 890.25, demoBalance: 5000, status: 'suspended', verified: false, trades: 45, winRate: 42.3, totalDeposits: 500, totalWithdrawals: 0, lastLogin: '2025-12-20 14:00', createdAt: '2025-06-10', riskLevel: 'high' },
  { id: 4, odId: 'OD-001237', name: 'Ana Lopez', email: 'ana@email.com', phone: '+5566778899', country: 'Chile', balance: 3200.00, demoBalance: 10000, status: 'pending', verified: false, trades: 0, winRate: 0, totalDeposits: 0, totalWithdrawals: 0, lastLogin: '2025-12-25 11:00', createdAt: '2025-12-24', riskLevel: 'low' },
];

const MOCK_OPERATIONS: Operation[] = [
  { id: 1, odId: 'OD-001234', userName: 'Carlos M.', asset: 'EUR/USD', type: 'buy', amount: 100, result: 'win', profit: 85, payout: 85, openTime: '10:30:45', closeTime: '10:31:45', duration: 60, flagged: false },
  { id: 2, odId: 'OD-001235', userName: 'Maria G.', asset: 'BTC/USD', type: 'sell', amount: 250, result: 'pending', profit: 0, payout: 85, openTime: '10:31:12', closeTime: '', duration: 60, flagged: false },
  { id: 3, odId: 'OD-001236', userName: 'Juan R.', asset: 'AAPL', type: 'buy', amount: 500, result: 'win', profit: 425, payout: 85, openTime: '10:29:33', closeTime: '10:30:33', duration: 60, flagged: true, flagReason: 'Patrón sospechoso' },
  { id: 4, odId: 'OD-001234', userName: 'Carlos M.', asset: 'GBP/JPY', type: 'sell', amount: 150, result: 'loss', profit: -150, payout: 85, openTime: '10:28:01', closeTime: '10:29:01', duration: 60, flagged: false },
  { id: 5, odId: 'OD-001237', userName: 'Ana L.', asset: 'ETH/USD', type: 'buy', amount: 200, result: 'pending', profit: 0, payout: 85, openTime: '10:32:00', closeTime: '', duration: 60, flagged: false },
];

const MOCK_ASSETS: Asset[] = [
  { id: 1, symbol: 'EUR/USD', name: 'Euro/Dólar', category: 'forex', enabled: true, payout: 85, minInvestment: 1, maxInvestment: 1000, tradingHours: { start: '00:00', end: '23:59' }, volatility: 'medium' },
  { id: 2, symbol: 'GBP/USD', name: 'Libra/Dólar', category: 'forex', enabled: true, payout: 85, minInvestment: 1, maxInvestment: 1000, tradingHours: { start: '00:00', end: '23:59' }, volatility: 'medium' },
  { id: 3, symbol: 'BTC/USD', name: 'Bitcoin', category: 'crypto', enabled: true, payout: 80, minInvestment: 5, maxInvestment: 500, tradingHours: { start: '00:00', end: '23:59' }, volatility: 'high' },
  { id: 4, symbol: 'ETH/USD', name: 'Ethereum', category: 'crypto', enabled: true, payout: 80, minInvestment: 5, maxInvestment: 500, tradingHours: { start: '00:00', end: '23:59' }, volatility: 'high' },
  { id: 5, symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', enabled: true, payout: 82, minInvestment: 10, maxInvestment: 2000, tradingHours: { start: '09:30', end: '16:00' }, volatility: 'low' },
  { id: 6, symbol: 'XAU/USD', name: 'Oro', category: 'commodities', enabled: false, payout: 78, minInvestment: 10, maxInvestment: 1000, tradingHours: { start: '00:00', end: '23:59' }, volatility: 'medium' },
];

const MOCK_ALERTS: Alert[] = [
  { id: 1, type: 'suspicious', severity: 'high', message: 'Patrón de trading sospechoso detectado', userId: 'OD-001236', userName: 'Juan R.', timestamp: '10:35:00', read: false, resolved: false },
  { id: 2, type: 'win_streak', severity: 'medium', message: 'Racha de 8 victorias consecutivas', userId: 'OD-001235', userName: 'Maria G.', timestamp: '10:20:00', read: false, resolved: false },
  { id: 3, type: 'high_volume', severity: 'low', message: 'Volumen de trading inusualmente alto', userId: 'OD-001234', userName: 'Carlos M.', timestamp: '09:45:00', read: true, resolved: true },
  { id: 4, type: 'system', severity: 'critical', message: 'Latencia alta en servidor de precios', timestamp: '09:30:00', read: false, resolved: false },
];

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, senderId: 'admin-001', senderName: 'Admin Principal', senderRole: 'admin', message: 'Buenos días equipo, recuerden revisar las alertas pendientes', timestamp: '09:00', read: true },
  { id: 2, senderId: 'support-001', senderName: 'Soporte Demo', senderRole: 'support', message: 'Hay un usuario con problemas de verificación, ¿pueden ayudar?', timestamp: '09:15', read: true },
  { id: 3, senderId: 'admin-001', senderName: 'Admin Principal', senderRole: 'admin', message: 'El torneo Weekly Challenge va muy bien, 487 participantes activos', timestamp: '10:00', read: false },
];

const emptyTournament: Omit<Tournament, 'id'> = {
  name: '', description: '', prizePool: 0, entryFee: 0, participants: [], maxParticipants: 500,
  status: 'upcoming', category: 'forex', startDate: '', endDate: '', initialBalance: 1000,
  rules: '', featured: false, rewards: [{ position: 1, amount: 0 }, { position: 2, amount: 0 }, { position: 3, amount: 0 }]
};

export default function OperatorPanel() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  // State
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [operations, setOperations] = useState<Operation[]>(MOCK_OPERATIONS);
  const [assets, setAssets] = useState<Asset[]>(MOCK_ASSETS);
  const [alerts, setAlerts] = useState<Alert[]>(MOCK_ALERTS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [operatorLogs, setOperatorLogs] = useState<OperatorLog[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'warning' } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [tournamentFilter, setTournamentFilter] = useState<'all' | TournamentStatus>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | TournamentCategory>('all');
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended' | 'pending' | 'blocked'>('all');
  const [operationFilter, setOperationFilter] = useState<'all' | 'pending' | 'flagged'>('all');
  const [assetFilter, setAssetFilter] = useState<'all' | 'forex' | 'crypto' | 'stocks' | 'commodities'>('all');

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<Tournament | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<Omit<Tournament, 'id'>>(emptyTournament);
  const [formTab, setFormTab] = useState<'basic' | 'details' | 'rewards'>('basic');
  const [balanceAdjustment, setBalanceAdjustment] = useState({ amount: 0, reason: '', type: 'add' as 'add' | 'subtract' });
  const [newMessage, setNewMessage] = useState('');

  // Settings
  const [settings, setSettings] = useState({
    notifications: true,
    autoRefresh: true,
    soundAlerts: false,
    emailAlerts: true,
    theme: 'dark' as 'dark' | 'light',
    language: 'es',
    timezone: 'America/Mexico_City',
    fontSize: 'medium' as 'small' | 'medium' | 'large',
    density: 'normal' as 'compact' | 'normal',
    doNotDisturb: false,
    doNotDisturbStart: '22:00',
    doNotDisturbEnd: '08:00',
    alertThresholds: {
      highVolume: 10000,
      winStreak: 5,
      suspiciousPattern: true
    },
    alertTypes: {
      suspicious: true,
      highVolume: true,
      winStreak: true,
      pattern: true,
      system: true
    }
  });

  // Profile
  const [profile, setProfile] = useState({
    firstName: user?.first_name || 'Operador',
    lastName: user?.last_name || 'Demo',
    email: user?.email || 'operador@tormentus.com',
    phone: '+52 555 123 4567',
    avatar: '',
    twoFactorEnabled: false,
    sessionTimeout: 30,
    status: 'available' as 'available' | 'busy' | 'away' | 'offline',
    statusMessage: '',
    workSchedule: { start: '09:00', end: '18:00' }
  });

  // Sessions
  const [sessions, setSessions] = useState([
    { id: 1, device: 'Chrome - Windows', ip: '192.168.1.100', location: 'Ciudad de México', lastActive: 'Ahora', current: true },
    { id: 2, device: 'Safari - iPhone', ip: '192.168.1.105', location: 'Ciudad de México', lastActive: 'Hace 2 horas', current: false },
    { id: 3, device: 'Firefox - MacOS', ip: '10.0.0.50', location: 'Guadalajara', lastActive: 'Hace 1 día', current: false },
  ]);

  // Login History
  const [loginHistory] = useState([
    { id: 1, date: '2025-12-25 10:30', device: 'Chrome - Windows', ip: '192.168.1.100', location: 'Ciudad de México', status: 'success' },
    { id: 2, date: '2025-12-24 09:15', device: 'Chrome - Windows', ip: '192.168.1.100', location: 'Ciudad de México', status: 'success' },
    { id: 3, date: '2025-12-23 14:00', device: 'Safari - iPhone', ip: '192.168.1.105', location: 'Ciudad de México', status: 'success' },
    { id: 4, date: '2025-12-22 08:30', device: 'Unknown', ip: '45.67.89.10', location: 'Desconocido', status: 'failed' },
  ]);

  // Password change
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Settings tab
  const [settingsTab, setSettingsTab] = useState<'profile' | 'security' | 'notifications' | 'appearance' | 'advanced'>('profile');

  // Keyboard shortcuts
  const [shortcuts] = useState([
    { key: 'Ctrl + D', action: 'Ir al Dashboard' },
    { key: 'Ctrl + T', action: 'Ver Torneos' },
    { key: 'Ctrl + U', action: 'Ver Usuarios' },
    { key: 'Ctrl + O', action: 'Ver Operaciones' },
    { key: 'Ctrl + A', action: 'Ver Alertas' },
    { key: 'Ctrl + M', action: 'Abrir Chat' },
    { key: 'Ctrl + R', action: 'Refrescar datos' },
    { key: 'Esc', action: 'Cerrar modal' },
  ]);

  // User notes and balance history
  const [userNotes, setUserNotes] = useState<UserNote[]>([
    { id: 1, odId: 'OD-001236', note: 'Usuario con comportamiento sospechoso, monitorear', createdBy: 'Admin', createdAt: '2025-12-20 10:00' },
    { id: 2, odId: 'OD-001235', note: 'VIP - Dar atención prioritaria', createdBy: 'Operador', createdAt: '2025-12-22 15:30' },
  ]);
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistory[]>([
    { id: 1, odId: 'OD-001234', type: 'add', amount: 500, reason: 'Bonificación por referido', createdBy: 'Admin', createdAt: '2025-12-20 09:00' },
    { id: 2, odId: 'OD-001236', type: 'subtract', amount: 100, reason: 'Corrección de error', createdBy: 'Operador', createdAt: '2025-12-21 14:00' },
  ]);
  const [newNote, setNewNote] = useState('');
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [showUserOperationsModal, setShowUserOperationsModal] = useState(false);
  const [showAddToTournamentModal, setShowAddToTournamentModal] = useState(false);

  // Operation filters
  const [operationAssetFilter, setOperationAssetFilter] = useState('all');
  const [, setOperationDateRange] = useState({ start: '', end: '' });

  // Security settings
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>([
    { id: 1, name: 'Mi PC de trabajo', browser: 'Chrome', os: 'Windows 11', lastUsed: 'Ahora', trusted: true },
    { id: 2, name: 'iPhone personal', browser: 'Safari', os: 'iOS 17', lastUsed: 'Hace 2 días', trusted: true },
  ]);
  const [securityQuestions, setSecurityQuestions] = useState<SecurityQuestion[]>([
    { id: 1, question: '¿Cuál es el nombre de tu primera mascota?', answer: '****' },
  ]);
  const [securitySettings, setSecuritySettings] = useState({
    loginAlerts: true,
    newDeviceAlert: true,
    failedLoginLock: true,
    maxFailedAttempts: 5,
    lockDuration: 30
  });
  const [showSecurityQuestionModal, setShowSecurityQuestionModal] = useState(false);
  const [newSecurityQuestion, setNewSecurityQuestion] = useState({ question: '', answer: '' });

  // Chat enhancements
  const [isTyping, setIsTyping] = useState(false);
  const [chatAttachment, setChatAttachment] = useState<{ type: 'image' | 'file'; url: string; name: string } | null>(null);

  // Charts data
  const [chartPeriod, setChartPeriod] = useState<'day' | 'week' | 'month'>('week');

  // Auto-refresh
  useEffect(() => {
    if (!settings.autoRefresh) return;
    const interval = setInterval(() => {
      const assets = ['EUR/USD', 'BTC/USD', 'GBP/JPY', 'AAPL', 'ETH/USD'];
      const types: ('buy' | 'sell')[] = ['buy', 'sell'];
      const results: ('win' | 'loss' | 'pending')[] = ['win', 'loss', 'pending'];
      const newOp: Operation = {
        id: Date.now(), odId: `OD-00${Math.floor(1234 + Math.random() * 10)}`,
        userName: ['Carlos M.', 'Maria G.', 'Juan R.', 'Ana L.'][Math.floor(Math.random() * 4)],
        asset: assets[Math.floor(Math.random() * assets.length)],
        type: types[Math.floor(Math.random() * 2)],
        amount: Math.floor(50 + Math.random() * 450),
        result: results[Math.floor(Math.random() * 3)],
        profit: Math.floor(-200 + Math.random() * 500),
        payout: 85, openTime: new Date().toLocaleTimeString('es-ES'),
        closeTime: '', duration: 60, flagged: Math.random() > 0.9
      };
      setOperations(prev => [newOp, ...prev.slice(0, 49)]);
    }, 5000);
    return () => clearInterval(interval);
  }, [settings.autoRefresh]);

  // Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const showToast = (message: string, type: 'success' | 'error' | 'warning') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const addLog = (action: string, target: string, details: string) => {
    setOperatorLogs(prev => [{ id: Date.now(), action, target, details, timestamp: new Date().toLocaleTimeString('es-ES') }, ...prev]);
  };

  const handleLogout = () => { logout(); navigate('/'); };

  // Tournament handlers
  const handleCreateTournament = () => {
    if (!formData.name || !formData.startDate || !formData.endDate) { showToast('Completa los campos obligatorios', 'error'); return; }
    const newTournament: Tournament = { ...formData, id: Date.now(), participants: [] };
    setTournaments(prev => [...prev, newTournament]);
    setShowCreateModal(false); setFormData(emptyTournament); setFormTab('basic');
    addLog('Crear', 'Torneo', `Creado: ${formData.name}`);
    showToast('Torneo creado exitosamente', 'success');
  };

  const handleUpdateTournament = () => {
    if (!selectedTournament) return;
    setTournaments(prev => prev.map(t => t.id === selectedTournament.id ? { ...formData, id: selectedTournament.id, participants: selectedTournament.participants } : t));
    setShowEditModal(false); setSelectedTournament(null); setFormData(emptyTournament);
    addLog('Editar', 'Torneo', `Editado: ${formData.name}`);
    showToast('Torneo actualizado', 'success');
  };

  const handleDeleteTournament = () => {
    if (!selectedTournament) return;
    setTournaments(prev => prev.filter(t => t.id !== selectedTournament.id));
    addLog('Eliminar', 'Torneo', `Eliminado: ${selectedTournament.name}`);
    setShowDeleteConfirm(false); setSelectedTournament(null);
    showToast('Torneo eliminado', 'success');
  };

  const handleToggleTournamentStatus = (id: number) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === id) {
        const newStatus: TournamentStatus = t.status === 'active' ? 'paused' : t.status === 'paused' ? 'active' : t.status;
        addLog('Cambiar estado', 'Torneo', `${t.name}: ${t.status} → ${newStatus}`);
        return { ...t, status: newStatus };
      }
      return t;
    }));
    showToast('Estado actualizado', 'success');
  };

  const handleDisqualifyParticipant = (tournamentId: number, odId: string) => {
    setTournaments(prev => prev.map(t => {
      if (t.id === tournamentId) {
        return { ...t, participants: t.participants.map(p => p.odId === odId ? { ...p, status: 'disqualified' as const } : p) };
      }
      return t;
    }));
    addLog('Descalificar', 'Participante', `${odId} del torneo`);
    showToast('Participante descalificado', 'success');
  };

  // User handlers
  const handleUserStatusChange = (userId: number, newStatus: UserData['status']) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: newStatus } : u));
    const user = users.find(u => u.id === userId);
    addLog('Cambiar estado', 'Usuario', `${user?.odId}: ${user?.status} → ${newStatus}`);
    showToast(`Usuario ${newStatus === 'active' ? 'activado' : newStatus === 'suspended' ? 'suspendido' : newStatus === 'blocked' ? 'bloqueado' : 'actualizado'}`, 'success');
  };

  const handleAdjustBalance = () => {
    if (!selectedUser || !balanceAdjustment.reason) { showToast('Ingresa una razón', 'error'); return; }
    const adjustment = balanceAdjustment.type === 'add' ? balanceAdjustment.amount : -balanceAdjustment.amount;
    setUsers(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: u.balance + adjustment } : u));
    setBalanceHistory(prev => [{ id: Date.now(), odId: selectedUser.odId, type: balanceAdjustment.type, amount: balanceAdjustment.amount, reason: balanceAdjustment.reason, createdBy: `${profile.firstName} ${profile.lastName}`, createdAt: new Date().toLocaleString('es-ES') }, ...prev]);
    addLog('Ajustar balance', 'Usuario', `${selectedUser.odId}: ${balanceAdjustment.type === 'add' ? '+' : '-'}$${balanceAdjustment.amount} - ${balanceAdjustment.reason}`);
    setShowBalanceModal(false); setBalanceAdjustment({ amount: 0, reason: '', type: 'add' });
    showToast('Balance ajustado', 'success');
  };

  const handleBlockUserTrading = (userId: number) => {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: 'blocked' } : u));
    const user = users.find(u => u.id === userId);
    addLog('Bloquear trading', 'Usuario', `${user?.odId} bloqueado del trading`);
    showToast('Usuario bloqueado del trading', 'warning');
  };

  // Operation handlers
  const handleCancelOperation = (opId: number) => {
    setOperations(prev => prev.map(op => op.id === opId ? { ...op, result: 'cancelled' } : op));
    addLog('Cancelar', 'Operación', `ID: ${opId}`);
    showToast('Operación cancelada', 'success');
  };

  const handleForceResult = (opId: number, result: 'win' | 'loss') => {
    setOperations(prev => prev.map(op => {
      if (op.id === opId) {
        const profit = result === 'win' ? op.amount * (op.payout / 100) : -op.amount;
        return { ...op, result, profit, closeTime: new Date().toLocaleTimeString('es-ES') };
      }
      return op;
    }));
    addLog('Forzar resultado', 'Operación', `ID: ${opId} → ${result}`);
    showToast(`Resultado forzado: ${result}`, 'warning');
  };

  const handleFlagOperation = (opId: number, reason: string) => {
    setOperations(prev => prev.map(op => op.id === opId ? { ...op, flagged: true, flagReason: reason } : op));
    addLog('Marcar', 'Operación', `ID: ${opId} - ${reason}`);
    showToast('Operación marcada', 'warning');
  };

  // Asset handlers
  const handleToggleAsset = (assetId: number) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, enabled: !a.enabled } : a));
    const asset = assets.find(a => a.id === assetId);
    addLog('Toggle', 'Activo', `${asset?.symbol}: ${asset?.enabled ? 'deshabilitado' : 'habilitado'}`);
    showToast(`Activo ${asset?.enabled ? 'deshabilitado' : 'habilitado'}`, 'success');
  };

  const handleUpdateAsset = () => {
    if (!selectedAsset) return;
    setAssets(prev => prev.map(a => a.id === selectedAsset.id ? selectedAsset : a));
    addLog('Actualizar', 'Activo', `${selectedAsset.symbol} configurado`);
    setShowAssetModal(false); setSelectedAsset(null);
    showToast('Activo actualizado', 'success');
  };

  // Alert handlers
  const handleResolveAlert = (alertId: number) => {
    setAlerts(prev => prev.map(a => a.id === alertId ? { ...a, resolved: true, read: true } : a));
    addLog('Resolver', 'Alerta', `ID: ${alertId}`);
    showToast('Alerta resuelta', 'success');
  };

  // Chat handlers
  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = {
      id: Date.now(), senderId: 'operator-001', senderName: `${profile.firstName} ${profile.lastName}`,
      senderRole: 'operator', message: newMessage, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), read: true
    };
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
  };

  // Session handlers
  const handleCloseSession = (sessionId: number) => {
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    addLog('Cerrar sesión', 'Seguridad', `Sesión ID: ${sessionId}`);
    showToast('Sesión cerrada', 'success');
  };

  const handleCloseAllSessions = () => {
    setSessions(prev => prev.filter(s => s.current));
    addLog('Cerrar sesiones', 'Seguridad', 'Todas las sesiones remotas');
    showToast('Sesiones remotas cerradas', 'success');
  };

  // Password handlers
  const handleChangePassword = () => {
    if (!passwordForm.current || !passwordForm.new || !passwordForm.confirm) {
      showToast('Completa todos los campos', 'error'); return;
    }
    if (passwordForm.new !== passwordForm.confirm) {
      showToast('Las contraseñas no coinciden', 'error'); return;
    }
    if (passwordForm.new.length < 8) {
      showToast('La contraseña debe tener al menos 8 caracteres', 'error'); return;
    }
    addLog('Cambiar contraseña', 'Seguridad', 'Contraseña actualizada');
    setShowPasswordModal(false);
    setPasswordForm({ current: '', new: '', confirm: '' });
    showToast('Contraseña actualizada', 'success');
  };

  // Settings handlers
  const handleResetSettings = () => {
    setSettings({
      notifications: true, autoRefresh: true, soundAlerts: false, emailAlerts: true,
      theme: 'dark', language: 'es', timezone: 'America/Mexico_City',
      fontSize: 'medium', density: 'normal', doNotDisturb: false,
      doNotDisturbStart: '22:00', doNotDisturbEnd: '08:00',
      alertThresholds: { highVolume: 10000, winStreak: 5, suspiciousPattern: true },
      alertTypes: { suspicious: true, highVolume: true, winStreak: true, pattern: true, system: true }
    });
    showToast('Configuración restaurada', 'success');
  };

  const handleExportSettings = () => {
    const data = JSON.stringify({ settings, profile }, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'operator-settings.json'; a.click();
    showToast('Configuración exportada', 'success');
  };

  // User notes handlers
  const handleAddNote = () => {
    if (!selectedUser || !newNote.trim()) return;
    const note: UserNote = {
      id: Date.now(), odId: selectedUser.odId, note: newNote,
      createdBy: `${profile.firstName} ${profile.lastName}`, createdAt: new Date().toLocaleString('es-ES')
    };
    setUserNotes(prev => [note, ...prev]);
    addLog('Agregar nota', 'Usuario', `${selectedUser.odId}: ${newNote.substring(0, 30)}...`);
    setNewNote('');
    setShowNoteModal(false);
    showToast('Nota agregada', 'success');
  };

  // Export operations
  const handleExportOperations = () => {
    const csv = ['ID,Usuario,Activo,Tipo,Monto,Resultado,Profit,Hora'].concat(
      filteredOperations.map(op => `${op.id},${op.userName},${op.asset},${op.type},${op.amount},${op.result},${op.profit},${op.openTime}`)
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'operaciones.csv'; a.click();
    showToast('Operaciones exportadas', 'success');
  };

  // Duplicate tournament
  const handleDuplicateTournament = (t: Tournament) => {
    const newT: Tournament = { ...t, id: Date.now(), name: `${t.name} (Copia)`, participants: [], status: 'upcoming' };
    setTournaments(prev => [...prev, newT]);
    addLog('Duplicar', 'Torneo', `${t.name} → ${newT.name}`);
    showToast('Torneo duplicado', 'success');
  };

  // Add user to tournament
  const handleAddUserToTournament = (tournamentId: number, userId: string) => {
    const user = users.find(u => u.odId === userId);
    if (!user) return;
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (!tournament) return;
    const newParticipant: Participant = {
      id: Date.now(), odId: user.odId, name: user.name, balance: tournament.initialBalance,
      trades: 0, profit: 0, rank: tournament.participants.length + 1, status: 'active', joinedAt: new Date().toISOString().split('T')[0]
    };
    setTournaments(prev => prev.map(t => t.id === tournamentId ? { ...t, participants: [...t.participants, newParticipant] } : t));
    addLog('Agregar usuario', 'Torneo', `${user.odId} a ${tournament.name}`);
    setShowAddToTournamentModal(false);
    showToast('Usuario agregado al torneo', 'success');
  };

  // Security handlers
  const handleRemoveTrustedDevice = (deviceId: number) => {
    setTrustedDevices(prev => prev.filter(d => d.id !== deviceId));
    addLog('Eliminar dispositivo', 'Seguridad', `ID: ${deviceId}`);
    showToast('Dispositivo eliminado', 'success');
  };

  const handleAddSecurityQuestion = () => {
    if (!newSecurityQuestion.question || !newSecurityQuestion.answer) {
      showToast('Completa todos los campos', 'error'); return;
    }
    const sq: SecurityQuestion = { id: Date.now(), ...newSecurityQuestion };
    setSecurityQuestions(prev => [...prev, sq]);
    setNewSecurityQuestion({ question: '', answer: '' });
    setShowSecurityQuestionModal(false);
    showToast('Pregunta de seguridad agregada', 'success');
  };

  // Chat with typing indicator
  const handleTyping = () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  };

  // Chart data
  const operationsChartData = {
    labels: chartPeriod === 'day' ? ['6am', '9am', '12pm', '3pm', '6pm', '9pm'] : chartPeriod === 'week' ? ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'] : ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
    datasets: [
      { label: 'Wins', data: chartPeriod === 'day' ? [12, 19, 15, 25, 22, 18] : chartPeriod === 'week' ? [65, 78, 90, 81, 56, 45, 40] : [280, 320, 290, 350], borderColor: 'rgb(16, 185, 129)', backgroundColor: 'rgba(16, 185, 129, 0.1)', tension: 0.4 },
      { label: 'Losses', data: chartPeriod === 'day' ? [8, 12, 10, 15, 14, 11] : chartPeriod === 'week' ? [45, 52, 60, 55, 40, 35, 30] : [180, 200, 190, 220], borderColor: 'rgb(239, 68, 68)', backgroundColor: 'rgba(239, 68, 68, 0.1)', tension: 0.4 },
    ]
  };

  const volumeChartData = {
    labels: ['EUR/USD', 'BTC/USD', 'GBP/JPY', 'AAPL', 'ETH/USD'],
    datasets: [{ data: [35, 25, 20, 12, 8], backgroundColor: ['#8b5cf6', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'] }]
  };

  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, labels: { color: '#9ca3af' } } }, scales: { x: { ticks: { color: '#9ca3af' }, grid: { color: '#1f1f1f' } }, y: { ticks: { color: '#9ca3af' }, grid: { color: '#1f1f1f' } } } };
  const doughnutOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' as const, labels: { color: '#9ca3af' } } } };

  // Helpers
  const openEditModal = (t: Tournament) => { setSelectedTournament(t); setFormData({ ...t }); setFormTab('basic'); setShowEditModal(true); };
  const openViewModal = (t: Tournament) => { setSelectedTournament(t); setShowViewModal(true); };
  const openDeleteConfirm = (t: Tournament) => { setSelectedTournament(t); setShowDeleteConfirm(true); };
  const openUserModal = (u: UserData) => { setSelectedUser(u); setShowUserModal(true); };
  const openBalanceModal = (u: UserData) => { setSelectedUser(u); setShowBalanceModal(true); };
  const openParticipantsModal = (t: Tournament) => { setSelectedTournament(t); setShowParticipantsModal(true); };
  const openAssetModal = (a: Asset) => { setSelectedAsset({ ...a }); setShowAssetModal(true); };
  const openNoteModal = (u: UserData) => { setSelectedUser(u); setShowNoteModal(true); };
  const openUserHistoryModal = (u: UserData) => { setSelectedUser(u); setShowHistoryModal(true); };
  const openUserOperationsModal = (u: UserData) => { setSelectedUser(u); setShowUserOperationsModal(true); };

  // Filtered data with new filters
  const filteredOperations = operations.filter(op => {
    const matchesFilter = operationFilter === 'all' || (operationFilter === 'pending' && op.result === 'pending') || (operationFilter === 'flagged' && op.flagged);
    const matchesAsset = operationAssetFilter === 'all' || op.asset === operationAssetFilter;
    return matchesFilter && matchesAsset;
  });

  const filteredTournaments = tournaments.filter(t => {
    const matchesStatus = tournamentFilter === 'all' || t.status === tournamentFilter;
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesCategory && matchesSearch;
  });

  const filteredUsers = users.filter(u => {
    const matchesStatus = userFilter === 'all' || u.status === userFilter;
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.odId.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredAssets = assets.filter(a => assetFilter === 'all' || a.category === assetFilter);

  // Stats
  const stats = {
    activeTournaments: tournaments.filter(t => t.status === 'active').length,
    totalParticipants: tournaments.reduce((sum, t) => sum + t.participants.length, 0),
    totalPrizePool: tournaments.reduce((sum, t) => sum + t.prizePool, 0),
    activeUsers: users.filter(u => u.status === 'active').length,
    pendingOperations: operations.filter(op => op.result === 'pending').length,
    flaggedOperations: operations.filter(op => op.flagged).length,
    unresolvedAlerts: alerts.filter(a => !a.resolved).length,
    unreadMessages: chatMessages.filter(m => !m.read && m.senderRole !== 'operator').length
  };

  const menuItems = [
    { id: 'dashboard' as ViewType, icon: BarChart3, label: 'Dashboard', badge: 0 },
    { id: 'tournaments' as ViewType, icon: Trophy, label: 'Torneos', badge: 0 },
    { id: 'users' as ViewType, icon: Users, label: 'Usuarios', badge: 0 },
    { id: 'operations' as ViewType, icon: Activity, label: 'Operaciones', badge: stats.pendingOperations },
    { id: 'assets' as ViewType, icon: Globe, label: 'Activos', badge: 0 },
    { id: 'monitoring' as ViewType, icon: TrendingUp, label: 'Monitoreo', badge: 0 },
    { id: 'alerts' as ViewType, icon: AlertTriangle, label: 'Alertas', badge: stats.unresolvedAlerts },
    { id: 'reports' as ViewType, icon: FileText, label: 'Reportes', badge: 0 },
    { id: 'chat' as ViewType, icon: MessageSquare, label: 'Chat Interno', badge: stats.unreadMessages },
    { id: 'settings' as ViewType, icon: Settings, label: 'Configuración', badge: 0 },
  ];

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-emerald-500/20 text-emerald-400', upcoming: 'bg-blue-500/20 text-blue-400',
      finished: 'bg-gray-500/20 text-gray-400', paused: 'bg-yellow-500/20 text-yellow-400',
      suspended: 'bg-red-500/20 text-red-400', pending: 'bg-yellow-500/20 text-yellow-400',
      blocked: 'bg-red-500/20 text-red-400', disqualified: 'bg-red-500/20 text-red-400',
      win: 'text-emerald-400', loss: 'text-red-400', cancelled: 'text-gray-400'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-400';
  };

  const getCategoryLabel = (cat: string) => {
    const labels: Record<string, string> = { forex: '💱 Forex', crypto: '₿ Crypto', stocks: '📈 Acciones', mixed: '🎯 Mixto', commodities: '🥇 Commodities' };
    return labels[cat] || cat;
  };

  const getSeverityColor = (severity: string) => {
    const colors: Record<string, string> = { low: 'bg-blue-500/20 text-blue-400', medium: 'bg-yellow-500/20 text-yellow-400', high: 'bg-orange-500/20 text-orange-400', critical: 'bg-red-500/20 text-red-400' };
    return colors[severity] || 'bg-gray-500/20 text-gray-400';
  };

  // Modals
  const TournamentFormModal = ({ isEdit = false }: { isEdit?: boolean }) => (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)}>
      <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-purple-900/20 flex items-center justify-between">
          <h2 className="text-xl font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-purple-400" />{isEdit ? 'Editar Torneo' : 'Crear Torneo'}</h2>
          <button onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)} className="p-2 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex border-b border-purple-900/20">
          {(['basic', 'details', 'rewards'] as const).map(tab => (
            <button key={tab} onClick={() => setFormTab(tab)} className={`flex-1 py-3 text-sm font-medium transition ${formTab === tab ? 'text-purple-400 border-b-2 border-purple-500' : 'text-gray-500'}`}>
              {tab === 'basic' ? 'Básico' : tab === 'details' ? 'Detalles' : 'Premios'}
            </button>
          ))}
        </div>
        <div className="p-6 overflow-y-auto max-h-[50vh] space-y-4">
          {formTab === 'basic' && (<>
            <div><label className="text-xs text-gray-500 mb-1 block">Nombre *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Descripción</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-20 resize-none" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Categoría</label><select value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value as TournamentCategory })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option value="forex">Forex</option><option value="crypto">Crypto</option><option value="stocks">Acciones</option><option value="mixed">Mixto</option></select></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Estado</label><select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value as TournamentStatus })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option value="upcoming">Próximo</option><option value="active">Activo</option><option value="paused">Pausado</option></select></div>
            </div>
            <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
              <div><div className="text-sm font-medium">Destacar</div><div className="text-xs text-gray-500">Mostrar en portada</div></div>
              <button onClick={() => setFormData({ ...formData, featured: !formData.featured })} className={`w-11 h-6 rounded-full relative transition ${formData.featured ? 'bg-purple-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${formData.featured ? 'right-0.5' : 'left-0.5'}`} /></button>
            </div>
          </>)}
          {formTab === 'details' && (<>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Premio Total ($)</label><input type="number" value={formData.prizePool} onChange={e => setFormData({ ...formData, prizePool: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Entrada ($)</label><input type="number" value={formData.entryFee} onChange={e => setFormData({ ...formData, entryFee: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Máx. Participantes</label><input type="number" value={formData.maxParticipants} onChange={e => setFormData({ ...formData, maxParticipants: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Balance Inicial</label><input type="number" value={formData.initialBalance} onChange={e => setFormData({ ...formData, initialBalance: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Fecha Inicio</label><input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Fecha Fin</label><input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Reglas</label><textarea value={formData.rules} onChange={e => setFormData({ ...formData, rules: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-24 resize-none" /></div>
          </>)}
          {formTab === 'rewards' && (<>
            <div className="flex items-center gap-2 p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg"><AlertCircle className="w-5 h-5 text-purple-400" /><p className="text-sm">Configura premios para las primeras 3 posiciones</p></div>
            {formData.rewards.map((r, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-[#1a1625] rounded-lg">
                <Award className={`w-8 h-8 ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : 'text-orange-500'}`} />
                <div className="flex-1"><label className="text-sm font-medium">{['🥇', '🥈', '🥉'][i]} Posición #{r.position}</label><input type="number" value={r.amount} onChange={e => { const newR = [...formData.rewards]; newR[i].amount = Number(e.target.value); setFormData({ ...formData, rewards: newR }); }} className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm mt-1" /></div>
              </div>
            ))}
          </>)}
        </div>
        <div className="p-6 border-t border-purple-900/20 flex gap-3">
          <button onClick={() => isEdit ? setShowEditModal(false) : setShowCreateModal(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium hover:bg-[#1a1625]">Cancelar</button>
          <button onClick={isEdit ? handleUpdateTournament : handleCreateTournament} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium">{isEdit ? 'Guardar' : 'Crear'}</button>
        </div>
      </div>
    </div>
  );

  const UserDetailModal = () => {
    if (!selectedUser) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowUserModal(false)}>
        <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-purple-900/20 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center"><User className="w-7 h-7 text-purple-400" /></div>
              <div>
                <h2 className="text-xl font-bold">{selectedUser.name}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-sm text-purple-400 font-mono">{selectedUser.odId}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedUser.status)}`}>{selectedUser.status}</span>
                  {selectedUser.verified && <CheckCircle className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            </div>
            <button onClick={() => setShowUserModal(false)} className="p-2 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[60vh] space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Wallet className="w-6 h-6 text-emerald-400 mx-auto mb-2" /><div className="text-xl font-bold text-emerald-400">${selectedUser.balance.toLocaleString()}</div><div className="text-xs text-gray-500">Balance Real</div></div>
              <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Target className="w-6 h-6 text-blue-400 mx-auto mb-2" /><div className="text-xl font-bold">${selectedUser.demoBalance.toLocaleString()}</div><div className="text-xs text-gray-500">Balance Demo</div></div>
              <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Activity className="w-6 h-6 text-purple-400 mx-auto mb-2" /><div className="text-xl font-bold">{selectedUser.trades}</div><div className="text-xs text-gray-500">Trades</div></div>
              <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Percent className="w-6 h-6 text-yellow-400 mx-auto mb-2" /><div className="text-xl font-bold">{selectedUser.winRate}%</div><div className="text-xs text-gray-500">Win Rate</div></div>
            </div>
            <div className="bg-[#1a1625] rounded-xl p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2"><Mail className="w-4 h-4 text-purple-400" />Contacto</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Email:</span> <span className="ml-2">{selectedUser.email}</span></div>
                <div><span className="text-gray-500">Teléfono:</span> <span className="ml-2">{selectedUser.phone}</span></div>
                <div><span className="text-gray-500">País:</span> <span className="ml-2">{selectedUser.country}</span></div>
                <div><span className="text-gray-500">Riesgo:</span> <span className={`ml-2 ${selectedUser.riskLevel === 'high' ? 'text-red-400' : selectedUser.riskLevel === 'medium' ? 'text-yellow-400' : 'text-emerald-400'}`}>{selectedUser.riskLevel.toUpperCase()}</span></div>
              </div>
            </div>
            <div className="bg-[#1a1625] rounded-xl p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2"><DollarSign className="w-4 h-4 text-purple-400" />Finanzas</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div><span className="text-gray-500">Depósitos:</span> <span className="ml-2 text-emerald-400">${selectedUser.totalDeposits.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Retiros:</span> <span className="ml-2 text-red-400">${selectedUser.totalWithdrawals.toLocaleString()}</span></div>
                <div><span className="text-gray-500">Registrado:</span> <span className="ml-2">{selectedUser.createdAt}</span></div>
                <div><span className="text-gray-500">Último login:</span> <span className="ml-2">{selectedUser.lastLogin}</span></div>
              </div>
            </div>
          </div>
          <div className="p-6 border-t border-purple-900/20 flex flex-wrap gap-2">
            <button onClick={() => { setShowUserModal(false); openBalanceModal(selectedUser); }} className="flex-1 py-2.5 bg-emerald-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Wallet className="w-4 h-4" />Ajustar Balance</button>
            <button onClick={() => { setShowUserModal(false); openNoteModal(selectedUser); }} className="flex-1 py-2.5 bg-yellow-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><StickyNote className="w-4 h-4" />Nota</button>
            <button onClick={() => { setShowUserModal(false); openUserHistoryModal(selectedUser); }} className="flex-1 py-2.5 bg-blue-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><History className="w-4 h-4" />Historial</button>
            <button onClick={() => { setShowUserModal(false); openUserOperationsModal(selectedUser); }} className="flex-1 py-2.5 bg-purple-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Activity className="w-4 h-4" />Operaciones</button>
          </div>
          <div className="px-6 pb-6 flex flex-wrap gap-2">
            <button onClick={() => { setShowUserModal(false); setShowAddToTournamentModal(true); }} className="flex-1 py-2.5 bg-cyan-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Trophy className="w-4 h-4" />Agregar a Torneo</button>
            {selectedUser.status === 'active' ? (
              <button onClick={() => { handleUserStatusChange(selectedUser.id, 'suspended'); setShowUserModal(false); }} className="flex-1 py-2.5 bg-orange-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><UserX className="w-4 h-4" />Suspender</button>
            ) : (
              <button onClick={() => { handleUserStatusChange(selectedUser.id, 'active'); setShowUserModal(false); }} className="flex-1 py-2.5 bg-emerald-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><UserCheck className="w-4 h-4" />Activar</button>
            )}
            <button onClick={() => { handleBlockUserTrading(selectedUser.id); setShowUserModal(false); }} className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Ban className="w-4 h-4" />Bloquear Trading</button>
          </div>
        </div>
      </div>
    );
  };

  const BalanceAdjustModal = () => {
    if (!selectedUser) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowBalanceModal(false)}>
        <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-purple-400" />Ajustar Balance</h2>
          <p className="text-sm text-gray-400 mb-4">Usuario: <span className="text-white">{selectedUser.name}</span> ({selectedUser.odId})</p>
          <p className="text-sm text-gray-400 mb-4">Balance actual: <span className="text-emerald-400 font-bold">${selectedUser.balance.toLocaleString()}</span></p>
          <div className="space-y-4">
            <div className="flex gap-2">
              <button onClick={() => setBalanceAdjustment(p => ({ ...p, type: 'add' }))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAdjustment.type === 'add' ? 'bg-emerald-600' : 'bg-[#1a1625]'}`}>+ Agregar</button>
              <button onClick={() => setBalanceAdjustment(p => ({ ...p, type: 'subtract' }))} className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAdjustment.type === 'subtract' ? 'bg-red-600' : 'bg-[#1a1625]'}`}>- Restar</button>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Monto ($)</label><input type="number" value={balanceAdjustment.amount} onChange={e => setBalanceAdjustment(p => ({ ...p, amount: Number(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            <div><label className="text-xs text-gray-500 mb-1 block">Razón *</label><textarea value={balanceAdjustment.reason} onChange={e => setBalanceAdjustment(p => ({ ...p, reason: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Explica el motivo del ajuste..." /></div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowBalanceModal(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cancelar</button>
            <button onClick={handleAdjustBalance} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium">Confirmar</button>
          </div>
        </div>
      </div>
    );
  };

  const ParticipantsModal = () => {
    if (!selectedTournament) return null;
    const sortedParticipants = [...selectedTournament.participants].sort((a, b) => b.profit - a.profit);
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowParticipantsModal(false)}>
        <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="p-6 border-b border-purple-900/20 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-purple-400" />Participantes</h2>
              <p className="text-sm text-gray-500">{selectedTournament.name} - {sortedParticipants.length} participantes</p>
            </div>
            <button onClick={() => setShowParticipantsModal(false)} className="p-2 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
          </div>
          <div className="overflow-y-auto max-h-[60vh]">
            <table className="w-full">
              <thead className="bg-[#1a1625] sticky top-0">
                <tr>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Balance</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Profit</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Trades</th>
                  <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                  <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-900/10">
                {sortedParticipants.map((p, i) => (
                  <tr key={p.id} className="hover:bg-[#1a1625]/50">
                    <td className="px-4 py-3"><span className={`text-lg ${i === 0 ? 'text-yellow-500' : i === 1 ? 'text-gray-400' : i === 2 ? 'text-orange-500' : ''}`}>{i < 3 ? ['🥇', '🥈', '🥉'][i] : i + 1}</span></td>
                    <td className="px-4 py-3"><div className="font-medium text-sm">{p.name}</div><div className="text-xs text-gray-500">{p.odId}</div></td>
                    <td className="px-4 py-3 font-medium">${p.balance.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className={p.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}>{p.profit >= 0 ? '+' : ''}${p.profit.toLocaleString()}</span></td>
                    <td className="px-4 py-3">{p.trades}</td>
                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(p.status)}`}>{p.status === 'active' ? 'Activo' : 'Descalificado'}</span></td>
                    <td className="px-4 py-3 text-right">
                      {p.status === 'active' && (
                        <button onClick={() => handleDisqualifyParticipant(selectedTournament.id, p.odId)} className="p-1.5 hover:bg-red-500/20 rounded-lg" title="Descalificar"><UserX className="w-4 h-4 text-red-400" /></button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sortedParticipants.length === 0 && <div className="text-center py-12 text-gray-500">No hay participantes</div>}
          </div>
        </div>
      </div>
    );
  };

  const AssetConfigModal = () => {
    if (!selectedAsset) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAssetModal(false)}>
        <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Sliders className="w-5 h-5 text-purple-400" />Configurar {selectedAsset.symbol}</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
              <span className="text-sm">Habilitado</span>
              <button onClick={() => setSelectedAsset({ ...selectedAsset, enabled: !selectedAsset.enabled })} className={`w-11 h-6 rounded-full relative transition ${selectedAsset.enabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${selectedAsset.enabled ? 'right-0.5' : 'left-0.5'}`} /></button>
            </div>
            <div><label className="text-xs text-gray-500 mb-1 block">Payout (%)</label><input type="number" value={selectedAsset.payout} onChange={e => setSelectedAsset({ ...selectedAsset, payout: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Inversión Mín ($)</label><input type="number" value={selectedAsset.minInvestment} onChange={e => setSelectedAsset({ ...selectedAsset, minInvestment: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Inversión Máx ($)</label><input type="number" value={selectedAsset.maxInvestment} onChange={e => setSelectedAsset({ ...selectedAsset, maxInvestment: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Hora Inicio</label><input type="time" value={selectedAsset.tradingHours.start} onChange={e => setSelectedAsset({ ...selectedAsset, tradingHours: { ...selectedAsset.tradingHours, start: e.target.value } })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Hora Fin</label><input type="time" value={selectedAsset.tradingHours.end} onChange={e => setSelectedAsset({ ...selectedAsset, tradingHours: { ...selectedAsset.tradingHours, end: e.target.value } })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
            </div>
          </div>
          <div className="flex gap-3 mt-6">
            <button onClick={() => setShowAssetModal(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cancelar</button>
            <button onClick={handleUpdateAsset} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium">Guardar</button>
          </div>
        </div>
      </div>
    );
  };

  const DeleteConfirmModal = () => {
    if (!selectedTournament) return null;
    return (
      <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowDeleteConfirm(false)}>
        <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-3 mb-4"><div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center"><AlertTriangle className="w-6 h-6 text-red-400" /></div><div><h2 className="text-lg font-bold">Eliminar Torneo</h2><p className="text-sm text-gray-500">Esta acción no se puede deshacer</p></div></div>
          <p className="text-gray-400 mb-6">¿Eliminar <span className="text-white font-medium">"{selectedTournament.name}"</span>?</p>
          <div className="flex gap-3">
            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cancelar</button>
            <button onClick={handleDeleteTournament} className="flex-1 py-2.5 bg-red-600 rounded-xl text-sm font-medium">Eliminar</button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] flex">
      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl text-sm font-medium z-[100] flex items-center gap-2 animate-pulse ${notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : notification.type === 'error' ? <XCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      {/* Modals */}
      {showCreateModal && <TournamentFormModal />}
      {showEditModal && <TournamentFormModal isEdit />}
      {showViewModal && selectedTournament && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowViewModal(false)}>
          <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-2xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-purple-900/20 flex items-center justify-between">
              <div className="flex items-center gap-3"><Trophy className="w-6 h-6 text-purple-400" /><div><h2 className="text-xl font-bold">{selectedTournament.name}</h2><span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedTournament.status)}`}>{selectedTournament.status}</span></div></div>
              <button onClick={() => setShowViewModal(false)} className="p-2 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh] space-y-4">
              <p className="text-gray-400">{selectedTournament.description}</p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#1a1625] rounded-xl p-4 text-center"><DollarSign className="w-6 h-6 text-emerald-400 mx-auto mb-2" /><div className="text-xl font-bold text-emerald-400">${selectedTournament.prizePool.toLocaleString()}</div><div className="text-xs text-gray-500">Premio</div></div>
                <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Users className="w-6 h-6 text-purple-400 mx-auto mb-2" /><div className="text-xl font-bold">{selectedTournament.participants.length}/{selectedTournament.maxParticipants}</div><div className="text-xs text-gray-500">Participantes</div></div>
                <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Target className="w-6 h-6 text-blue-400 mx-auto mb-2" /><div className="text-xl font-bold">${selectedTournament.initialBalance}</div><div className="text-xs text-gray-500">Balance Inicial</div></div>
                <div className="bg-[#1a1625] rounded-xl p-4 text-center"><Award className="w-6 h-6 text-yellow-400 mx-auto mb-2" /><div className="text-xl font-bold">{selectedTournament.entryFee > 0 ? `$${selectedTournament.entryFee}` : 'Gratis'}</div><div className="text-xs text-gray-500">Entrada</div></div>
              </div>
              <div className="bg-[#1a1625] rounded-xl p-4"><h3 className="font-medium mb-2">Premios</h3>{selectedTournament.rewards.map((r, i) => (<div key={i} className="flex justify-between py-1"><span>{['🥇', '🥈', '🥉'][i]} Posición #{r.position}</span><span className="text-emerald-400 font-bold">${r.amount.toLocaleString()}</span></div>))}</div>
              {selectedTournament.rules && <div className="bg-[#1a1625] rounded-xl p-4"><h3 className="font-medium mb-2">Reglas</h3><p className="text-sm text-gray-400">{selectedTournament.rules}</p></div>}
            </div>
            <div className="p-6 border-t border-purple-900/20 flex gap-3">
              <button onClick={() => { setShowViewModal(false); openParticipantsModal(selectedTournament); }} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Users className="w-4 h-4" />Ver Participantes</button>
              <button onClick={() => { setShowViewModal(false); openEditModal(selectedTournament); }} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium flex items-center justify-center gap-2"><Edit className="w-4 h-4" />Editar</button>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && <DeleteConfirmModal />}
      {showUserModal && <UserDetailModal />}
      {showBalanceModal && <BalanceAdjustModal />}
      {showParticipantsModal && <ParticipantsModal />}
      {showAssetModal && <AssetConfigModal />}

      {/* Note Modal */}
      {showNoteModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowNoteModal(false)}>
          <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><StickyNote className="w-5 h-5 text-purple-400" />Agregar Nota</h2>
            <p className="text-sm text-gray-400 mb-4">Usuario: <span className="text-white">{selectedUser.name}</span> ({selectedUser.odId})</p>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Nota</label><textarea value={newNote} onChange={e => setNewNote(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-32 resize-none" placeholder="Escribe una nota sobre este usuario..." /></div>
              <div className="bg-[#1a1625] rounded-lg p-3">
                <h4 className="text-xs text-gray-500 mb-2">Notas anteriores</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {userNotes.filter(n => n.odId === selectedUser.odId).map(n => (
                    <div key={n.id} className="text-xs p-2 bg-[#0d0b14] rounded"><p>{n.note}</p><p className="text-gray-500 mt-1">{n.createdBy} - {n.createdAt}</p></div>
                  ))}
                  {userNotes.filter(n => n.odId === selectedUser.odId).length === 0 && <p className="text-xs text-gray-500">Sin notas</p>}
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowNoteModal(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cancelar</button>
              <button onClick={handleAddNote} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Balance History Modal */}
      {showHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowHistoryModal(false)}>
          <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-lg p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-purple-400" />Historial de Balance</h2>
            <p className="text-sm text-gray-400 mb-4">Usuario: <span className="text-white">{selectedUser.name}</span> - Balance actual: <span className="text-emerald-400">${selectedUser.balance.toLocaleString()}</span></p>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {balanceHistory.filter(h => h.odId === selectedUser.odId).map(h => (
                <div key={h.id} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${h.type === 'add' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                      {h.type === 'add' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}
                    </div>
                    <div><div className="text-sm font-medium">{h.reason}</div><div className="text-xs text-gray-500">{h.createdBy} - {h.createdAt}</div></div>
                  </div>
                  <span className={`font-bold ${h.type === 'add' ? 'text-emerald-400' : 'text-red-400'}`}>{h.type === 'add' ? '+' : '-'}${h.amount}</span>
                </div>
              ))}
              {balanceHistory.filter(h => h.odId === selectedUser.odId).length === 0 && <p className="text-center text-gray-500 py-8">Sin historial de ajustes</p>}
            </div>
            <button onClick={() => setShowHistoryModal(false)} className="w-full mt-6 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cerrar</button>
          </div>
        </div>
      )}

      {/* User Operations Modal */}
      {showUserOperationsModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowUserOperationsModal(false)}>
          <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-3xl max-h-[90vh] overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-purple-900/20 flex items-center justify-between">
              <div><h2 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Operaciones del Usuario</h2><p className="text-sm text-gray-500">{selectedUser.name} ({selectedUser.odId})</p></div>
              <button onClick={() => setShowUserOperationsModal(false)} className="p-2 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="overflow-y-auto max-h-[60vh]">
              <table className="w-full">
                <thead className="bg-[#1a1625] sticky top-0"><tr><th className="text-left px-4 py-3 text-xs text-gray-500">Activo</th><th className="text-left px-4 py-3 text-xs text-gray-500">Tipo</th><th className="text-left px-4 py-3 text-xs text-gray-500">Monto</th><th className="text-left px-4 py-3 text-xs text-gray-500">Resultado</th><th className="text-left px-4 py-3 text-xs text-gray-500">Hora</th></tr></thead>
                <tbody className="divide-y divide-purple-900/10">
                  {operations.filter(op => op.odId === selectedUser.odId).map(op => (
                    <tr key={op.id} className="hover:bg-[#1a1625]/50">
                      <td className="px-4 py-3 font-medium">{op.asset}</td>
                      <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${op.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{op.type.toUpperCase()}</span></td>
                      <td className="px-4 py-3">${op.amount}</td>
                      <td className="px-4 py-3"><span className={getStatusColor(op.result)}>{op.result === 'pending' ? 'Pendiente' : op.result === 'win' ? `+${op.profit}` : op.result === 'loss' ? `-${Math.abs(op.profit)}` : 'Cancelada'}</span></td>
                      <td className="px-4 py-3 text-xs text-gray-500">{op.openTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {operations.filter(op => op.odId === selectedUser.odId).length === 0 && <div className="text-center py-12 text-gray-500">Sin operaciones</div>}
            </div>
          </div>
        </div>
      )}

      {/* Add User to Tournament Modal */}
      {showAddToTournamentModal && selectedUser && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowAddToTournamentModal(false)}>
          <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Trophy className="w-5 h-5 text-purple-400" />Agregar a Torneo</h2>
            <p className="text-sm text-gray-400 mb-4">Usuario: <span className="text-white">{selectedUser.name}</span> ({selectedUser.odId})</p>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {tournaments.filter(t => t.status === 'active' || t.status === 'upcoming').map(t => (
                <div key={t.id} className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                  <div><div className="font-medium text-sm">{t.name}</div><div className="text-xs text-gray-500">{t.participants.length}/{t.maxParticipants} participantes</div></div>
                  <button onClick={() => handleAddUserToTournament(t.id, selectedUser.odId)} disabled={t.participants.some(p => p.odId === selectedUser.odId)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${t.participants.some(p => p.odId === selectedUser.odId) ? 'bg-gray-600 cursor-not-allowed' : 'bg-purple-600 hover:bg-purple-700'}`}>
                    {t.participants.some(p => p.odId === selectedUser.odId) ? 'Ya inscrito' : 'Agregar'}
                  </button>
                </div>
              ))}
              {tournaments.filter(t => t.status === 'active' || t.status === 'upcoming').length === 0 && <p className="text-center text-gray-500 py-4">No hay torneos disponibles</p>}
            </div>
            <button onClick={() => setShowAddToTournamentModal(false)} className="w-full mt-6 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cerrar</button>
          </div>
        </div>
      )}

      {/* Security Question Modal */}
      {showSecurityQuestionModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowSecurityQuestionModal(false)}>
          <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><HelpCircle className="w-5 h-5 text-purple-400" />Nueva Pregunta de Seguridad</h2>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Pregunta</label><input type="text" value={newSecurityQuestion.question} onChange={e => setNewSecurityQuestion(p => ({ ...p, question: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="Ej: ¿Cuál es tu color favorito?" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Respuesta</label><input type="text" value={newSecurityQuestion.answer} onChange={e => setNewSecurityQuestion(p => ({ ...p, answer: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="Tu respuesta secreta" /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSecurityQuestionModal(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cancelar</button>
              <button onClick={handleAddSecurityQuestion} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium">Guardar</button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#13111c] border-r border-purple-900/20 flex flex-col z-50 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center"><Sparkles className="w-5 h-5 text-white" /></div>
              <div><span className="font-bold text-lg">TORMENTUS</span><div className="text-[10px] text-purple-400">Panel Operador</div></div>
            </div>
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentView === item.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a1625]'}`}>
              <div className="flex items-center gap-3"><item.icon className="w-5 h-5" />{item.label}</div>
              {item.badge > 0 && <span className="px-2 py-0.5 bg-red-500 rounded-full text-xs">{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-purple-900/20">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center"><User className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0"><div className="text-sm font-medium truncate">{profile.firstName} {profile.lastName}</div><div className="text-xs text-purple-400">Operador</div></div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm"><LogOut className="w-4 h-4" />Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#13111c] border-b border-purple-900/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-[#1a1625] rounded-lg" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold capitalize">{menuItems.find(m => m.id === currentView)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentView('alerts')} className="p-2 hover:bg-[#1a1625] rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-400" />
              {stats.unresolvedAlerts > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />}
            </button>
            <button onClick={() => setCurrentView('chat')} className="p-2 hover:bg-[#1a1625] rounded-lg relative">
              <MessageSquare className="w-5 h-5 text-gray-400" />
              {stats.unreadMessages > 0 && <span className="absolute top-1 right-1 w-2 h-2 bg-purple-500 rounded-full" />}
            </button>
            <button onClick={() => setOperations(MOCK_OPERATIONS)} className="p-2 hover:bg-[#1a1625] rounded-lg"><RefreshCw className="w-5 h-5 text-gray-400" /></button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">

          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center"><Trophy className="w-5 h-5 text-purple-400" /></div></div><div className="text-2xl font-bold">{stats.activeTournaments}</div><div className="text-xs text-gray-500">Torneos Activos</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center"><Users className="w-5 h-5 text-emerald-400" /></div></div><div className="text-2xl font-bold">{stats.activeUsers}</div><div className="text-xs text-gray-500">Usuarios Activos</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center"><Activity className="w-5 h-5 text-yellow-400" /></div></div><div className="text-2xl font-bold">{stats.pendingOperations}</div><div className="text-xs text-gray-500">Ops. Pendientes</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="flex items-center gap-3 mb-2"><div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div></div><div className="text-2xl font-bold">{stats.unresolvedAlerts}</div><div className="text-xs text-gray-500">Alertas Pendientes</div></div>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-purple-400" />Acciones Rápidas</h2>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { setFormData(emptyTournament); setShowCreateModal(true); }} className="p-4 bg-[#1a1625] rounded-xl hover:bg-purple-500/10 transition flex flex-col items-center gap-2"><Plus className="w-6 h-6 text-purple-400" /><span className="text-sm">Crear Torneo</span></button>
                    <button onClick={() => setCurrentView('operations')} className="p-4 bg-[#1a1625] rounded-xl hover:bg-yellow-500/10 transition flex flex-col items-center gap-2"><Activity className="w-6 h-6 text-yellow-400" /><span className="text-sm">Ver Operaciones</span></button>
                    <button onClick={() => setCurrentView('users')} className="p-4 bg-[#1a1625] rounded-xl hover:bg-emerald-500/10 transition flex flex-col items-center gap-2"><Users className="w-6 h-6 text-emerald-400" /><span className="text-sm">Gestionar Usuarios</span></button>
                    <button onClick={() => setCurrentView('alerts')} className="p-4 bg-[#1a1625] rounded-xl hover:bg-red-500/10 transition flex flex-col items-center gap-2"><AlertTriangle className="w-6 h-6 text-red-400" /><span className="text-sm">Ver Alertas</span></button>
                  </div>
                </div>

                <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                  <div className="p-4 border-b border-purple-900/20 flex items-center justify-between"><h2 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-red-400" />Alertas Recientes</h2></div>
                  <div className="divide-y divide-purple-900/10 max-h-64 overflow-y-auto">
                    {alerts.filter(a => !a.resolved).slice(0, 4).map(a => (
                      <div key={a.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : a.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                          <div><div className="text-sm font-medium">{a.message}</div>{a.userName && <div className="text-xs text-gray-500">{a.userName}</div>}</div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(a.severity)}`}>{a.severity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Charts Section */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-bold flex items-center gap-2"><TrendingUp className="w-5 h-5 text-purple-400" />Operaciones por Período</h2>
                    <div className="flex gap-1">
                      {(['day', 'week', 'month'] as const).map(p => (
                        <button key={p} onClick={() => setChartPeriod(p)} className={`px-2 py-1 text-xs rounded ${chartPeriod === p ? 'bg-purple-600' : 'bg-[#1a1625]'}`}>
                          {p === 'day' ? 'Día' : p === 'week' ? 'Semana' : 'Mes'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="h-64">
                    <Line data={operationsChartData} options={chartOptions} />
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Volumen por Activo</h2>
                  <div className="h-64">
                    <Doughnut data={volumeChartData} options={doughnutOptions} />
                  </div>
                </div>
              </div>

              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" />Operaciones en Tiempo Real<span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /></h2>
                  <button onClick={() => setSettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))} className={`text-xs px-2 py-1 rounded ${settings.autoRefresh ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>{settings.autoRefresh ? 'Auto ON' : 'Auto OFF'}</button>
                </div>
                <div className="divide-y divide-purple-900/10 max-h-64 overflow-y-auto">
                  {operations.slice(0, 8).map(op => (
                    <div key={op.id} className="p-3 flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${op.type === 'buy' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>{op.type === 'buy' ? <ArrowUpRight className="w-4 h-4 text-emerald-400" /> : <ArrowDownRight className="w-4 h-4 text-red-400" />}</div>
                        <div><div className="font-medium">{op.userName} - {op.asset}</div><div className="text-xs text-gray-500">${op.amount}</div></div>
                        {op.flagged && <Flag className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="text-right">
                        <div className={getStatusColor(op.result)}>{op.result === 'pending' ? 'Pendiente' : op.result === 'win' ? `+$${op.profit}` : op.result === 'loss' ? `-$${Math.abs(op.profit)}` : 'Cancelada'}</div>
                        <div className="text-xs text-gray-500">{op.openTime}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tournaments */}
          {currentView === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="text" placeholder="Buscar torneos..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm" /></div>
                <div className="flex gap-2 flex-wrap">
                  <select value={tournamentFilter} onChange={e => setTournamentFilter(e.target.value as typeof tournamentFilter)} className="bg-[#1a1625] border border-purple-900/30 rounded-xl px-3 py-2 text-sm"><option value="all">Todos</option><option value="active">Activos</option><option value="upcoming">Próximos</option><option value="paused">Pausados</option></select>
                  <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value as typeof categoryFilter)} className="bg-[#1a1625] border border-purple-900/30 rounded-xl px-3 py-2 text-sm"><option value="all">Categorías</option><option value="forex">Forex</option><option value="crypto">Crypto</option><option value="stocks">Acciones</option></select>
                  <button onClick={() => { setFormData(emptyTournament); setShowCreateModal(true); }} className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Crear</button>
                </div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]"><tr><th className="text-left px-4 py-3 text-xs text-gray-500">Torneo</th><th className="text-left px-4 py-3 text-xs text-gray-500">Premio</th><th className="text-left px-4 py-3 text-xs text-gray-500">Participantes</th><th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th><th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredTournaments.map(t => (
                        <tr key={t.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center"><Trophy className="w-4 h-4 text-purple-400" /></div><div><div className="font-medium text-sm flex items-center gap-2">{t.name}{t.featured && <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />}</div><div className="text-xs text-gray-500">{getCategoryLabel(t.category)}</div></div></div></td>
                          <td className="px-4 py-3"><div className="text-sm font-bold text-emerald-400">${t.prizePool.toLocaleString()}</div></td>
                          <td className="px-4 py-3"><div className="text-sm">{t.participants.length}/{t.maxParticipants}</div></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(t.status)}`}>{t.status}</span></td>
                          <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                            <button onClick={() => openParticipantsModal(t)} className="p-1.5 hover:bg-purple-500/20 rounded-lg" title="Participantes"><Users className="w-4 h-4 text-purple-400" /></button>
                            <button onClick={() => openViewModal(t)} className="p-1.5 hover:bg-purple-500/20 rounded-lg" title="Ver"><Eye className="w-4 h-4 text-gray-400" /></button>
                            <button onClick={() => handleToggleTournamentStatus(t.id)} className="p-1.5 hover:bg-purple-500/20 rounded-lg">{t.status === 'active' ? <Pause className="w-4 h-4 text-yellow-400" /> : <Play className="w-4 h-4 text-emerald-400" />}</button>
                            <button onClick={() => openEditModal(t)} className="p-1.5 hover:bg-purple-500/20 rounded-lg"><Edit className="w-4 h-4 text-purple-400" /></button>
                            <button onClick={() => handleDuplicateTournament(t)} className="p-1.5 hover:bg-blue-500/20 rounded-lg" title="Duplicar"><Copy className="w-4 h-4 text-blue-400" /></button>
                            <button onClick={() => openDeleteConfirm(t)} className="p-1.5 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {currentView === 'users' && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" /><input type="text" placeholder="Buscar usuarios..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm" /></div>
                <div className="flex gap-2">
                  <select value={userFilter} onChange={e => setUserFilter(e.target.value as typeof userFilter)} className="bg-[#1a1625] border border-purple-900/30 rounded-xl px-3 py-2 text-sm"><option value="all">Todos</option><option value="active">Activos</option><option value="suspended">Suspendidos</option><option value="blocked">Bloqueados</option></select>
                  <button className="p-2 bg-[#1a1625] border border-purple-900/30 rounded-xl"><Download className="w-5 h-5 text-gray-400" /></button>
                </div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]"><tr><th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th><th className="text-left px-4 py-3 text-xs text-gray-500">Balance</th><th className="text-left px-4 py-3 text-xs text-gray-500">Win Rate</th><th className="text-left px-4 py-3 text-xs text-gray-500">Riesgo</th><th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th><th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3"><div className="flex items-center gap-3"><div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-purple-400" /></div><div><div className="font-medium text-sm">{u.name}</div><div className="text-xs text-gray-500">{u.odId}</div></div></div></td>
                          <td className="px-4 py-3"><span className="text-sm font-bold text-emerald-400">${u.balance.toLocaleString()}</span></td>
                          <td className="px-4 py-3"><span className={`text-sm ${u.winRate >= 50 ? 'text-emerald-400' : 'text-red-400'}`}>{u.winRate}%</span></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${u.riskLevel === 'high' ? 'bg-red-500/20 text-red-400' : u.riskLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{u.riskLevel}</span></td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(u.status)}`}>{u.status}</span></td>
                          <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                            <button onClick={() => openUserModal(u)} className="p-1.5 hover:bg-purple-500/20 rounded-lg" title="Ver detalles"><Eye className="w-4 h-4 text-gray-400" /></button>
                            <button onClick={() => openBalanceModal(u)} className="p-1.5 hover:bg-emerald-500/20 rounded-lg" title="Ajustar balance"><Wallet className="w-4 h-4 text-emerald-400" /></button>
                            <button onClick={() => openNoteModal(u)} className="p-1.5 hover:bg-yellow-500/20 rounded-lg" title="Agregar nota"><StickyNote className="w-4 h-4 text-yellow-400" /></button>
                            <button onClick={() => openUserHistoryModal(u)} className="p-1.5 hover:bg-blue-500/20 rounded-lg" title="Historial"><History className="w-4 h-4 text-blue-400" /></button>
                            <button onClick={() => openUserOperationsModal(u)} className="p-1.5 hover:bg-purple-500/20 rounded-lg" title="Operaciones"><Activity className="w-4 h-4 text-purple-400" /></button>
                            <button onClick={() => { setSelectedUser(u); setShowAddToTournamentModal(true); }} className="p-1.5 hover:bg-cyan-500/20 rounded-lg" title="Agregar a torneo"><Trophy className="w-4 h-4 text-cyan-400" /></button>
                            {u.status === 'active' ? <button onClick={() => handleUserStatusChange(u.id, 'suspended')} className="p-1.5 hover:bg-yellow-500/20 rounded-lg" title="Suspender"><UserX className="w-4 h-4 text-yellow-400" /></button> : <button onClick={() => handleUserStatusChange(u.id, 'active')} className="p-1.5 hover:bg-emerald-500/20 rounded-lg" title="Activar"><UserCheck className="w-4 h-4 text-emerald-400" /></button>}
                            <button onClick={() => handleBlockUserTrading(u.id)} className="p-1.5 hover:bg-red-500/20 rounded-lg" title="Bloquear"><Ban className="w-4 h-4 text-red-400" /></button>
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Operations */}
          {currentView === 'operations' && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="flex gap-2 flex-wrap">
                  <button onClick={() => setOperationFilter('all')} className={`px-4 py-2 rounded-xl text-sm ${operationFilter === 'all' ? 'bg-purple-600' : 'bg-[#1a1625]'}`}>Todas</button>
                  <button onClick={() => setOperationFilter('pending')} className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${operationFilter === 'pending' ? 'bg-yellow-600' : 'bg-[#1a1625]'}`}><Clock className="w-4 h-4" />Pendientes ({stats.pendingOperations})</button>
                  <button onClick={() => setOperationFilter('flagged')} className={`px-4 py-2 rounded-xl text-sm flex items-center gap-2 ${operationFilter === 'flagged' ? 'bg-red-600' : 'bg-[#1a1625]'}`}><Flag className="w-4 h-4" />Marcadas ({stats.flaggedOperations})</button>
                  <select value={operationAssetFilter} onChange={e => setOperationAssetFilter(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-xl px-3 py-2 text-sm">
                    <option value="all">Todos los activos</option>
                    {assets.map(a => <option key={a.id} value={a.symbol}>{a.symbol}</option>)}
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleExportOperations} className="px-4 py-2 rounded-xl text-sm bg-[#1a1625] flex items-center gap-2 hover:bg-purple-500/10"><Download className="w-4 h-4" />Exportar</button>
                  <button onClick={() => setSettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))} className={`px-4 py-2 rounded-xl text-sm ${settings.autoRefresh ? 'bg-emerald-600' : 'bg-[#1a1625]'}`}>{settings.autoRefresh ? 'Auto ON' : 'Auto OFF'}</button>
                </div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]"><tr><th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th><th className="text-left px-4 py-3 text-xs text-gray-500">Activo</th><th className="text-left px-4 py-3 text-xs text-gray-500">Tipo</th><th className="text-left px-4 py-3 text-xs text-gray-500">Monto</th><th className="text-left px-4 py-3 text-xs text-gray-500">Resultado</th><th className="text-left px-4 py-3 text-xs text-gray-500">Hora</th><th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th></tr></thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredOperations.map(op => (
                        <tr key={op.id} className={`hover:bg-[#1a1625]/50 ${op.flagged ? 'bg-red-500/5' : ''}`}>
                          <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="font-medium text-sm">{op.userName}</div>{op.flagged && <Flag className="w-4 h-4 text-red-400" />}</div><div className="text-xs text-gray-500">{op.odId}</div></td>
                          <td className="px-4 py-3 font-medium">{op.asset}</td>
                          <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs ${op.type === 'buy' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{op.type.toUpperCase()}</span></td>
                          <td className="px-4 py-3">${op.amount}</td>
                          <td className="px-4 py-3"><span className={getStatusColor(op.result)}>{op.result === 'pending' ? 'Pendiente' : op.result === 'win' ? `+$${op.profit}` : op.result === 'loss' ? `-$${Math.abs(op.profit)}` : 'Cancelada'}</span></td>
                          <td className="px-4 py-3 text-xs text-gray-500">{op.openTime}</td>
                          <td className="px-4 py-3"><div className="flex items-center justify-end gap-1">
                            {op.result === 'pending' && (<>
                              <button onClick={() => handleForceResult(op.id, 'win')} className="p-1.5 hover:bg-emerald-500/20 rounded-lg" title="Forzar WIN"><CheckCircle className="w-4 h-4 text-emerald-400" /></button>
                              <button onClick={() => handleForceResult(op.id, 'loss')} className="p-1.5 hover:bg-red-500/20 rounded-lg" title="Forzar LOSS"><XCircle className="w-4 h-4 text-red-400" /></button>
                              <button onClick={() => handleCancelOperation(op.id)} className="p-1.5 hover:bg-gray-500/20 rounded-lg" title="Cancelar"><Ban className="w-4 h-4 text-gray-400" /></button>
                            </>)}
                            {!op.flagged && <button onClick={() => handleFlagOperation(op.id, 'Marcado manualmente')} className="p-1.5 hover:bg-yellow-500/20 rounded-lg" title="Marcar"><Flag className="w-4 h-4 text-yellow-400" /></button>}
                          </div></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Assets */}
          {currentView === 'assets' && (
            <div className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                {['all', 'forex', 'crypto', 'stocks', 'commodities'].map(cat => (
                  <button key={cat} onClick={() => setAssetFilter(cat as typeof assetFilter)} className={`px-4 py-2 rounded-xl text-sm capitalize ${assetFilter === cat ? 'bg-purple-600' : 'bg-[#1a1625]'}`}>{cat === 'all' ? 'Todos' : cat}</button>
                ))}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredAssets.map(a => (
                  <div key={a.id} className={`bg-[#13111c] rounded-xl border p-4 ${a.enabled ? 'border-purple-900/20' : 'border-red-900/20 opacity-60'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${a.category === 'forex' ? 'bg-blue-500/20' : a.category === 'crypto' ? 'bg-orange-500/20' : a.category === 'stocks' ? 'bg-emerald-500/20' : 'bg-yellow-500/20'}`}>
                          <Globe className={`w-5 h-5 ${a.category === 'forex' ? 'text-blue-400' : a.category === 'crypto' ? 'text-orange-400' : a.category === 'stocks' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                        </div>
                        <div><div className="font-bold">{a.symbol}</div><div className="text-xs text-gray-500">{a.name}</div></div>
                      </div>
                      <button onClick={() => handleToggleAsset(a.id)} className={`w-11 h-6 rounded-full relative transition ${a.enabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${a.enabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div className="bg-[#1a1625] rounded-lg p-2"><div className="text-xs text-gray-500">Payout</div><div className="font-bold text-emerald-400">{a.payout}%</div></div>
                      <div className="bg-[#1a1625] rounded-lg p-2"><div className="text-xs text-gray-500">Volatilidad</div><div className={`font-bold ${a.volatility === 'high' ? 'text-red-400' : a.volatility === 'medium' ? 'text-yellow-400' : 'text-emerald-400'}`}>{a.volatility}</div></div>
                      <div className="bg-[#1a1625] rounded-lg p-2"><div className="text-xs text-gray-500">Mín</div><div className="font-bold">${a.minInvestment}</div></div>
                      <div className="bg-[#1a1625] rounded-lg p-2"><div className="text-xs text-gray-500">Máx</div><div className="font-bold">${a.maxInvestment}</div></div>
                    </div>
                    <div className="text-xs text-gray-500 mb-3">Horario: {a.tradingHours.start} - {a.tradingHours.end}</div>
                    <button onClick={() => openAssetModal(a)} className="w-full py-2 bg-[#1a1625] rounded-lg text-sm hover:bg-purple-500/10 flex items-center justify-center gap-2"><Sliders className="w-4 h-4" />Configurar</button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monitoring */}
          {currentView === 'monitoring' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-emerald-500/20"><CheckCircle className="w-6 h-6 text-emerald-400 mb-2" /><div className="text-3xl font-bold text-emerald-400">{operations.filter(o => o.result === 'win').length}</div><div className="text-xs text-gray-500">Wins</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-red-500/20"><XCircle className="w-6 h-6 text-red-400 mb-2" /><div className="text-3xl font-bold text-red-400">{operations.filter(o => o.result === 'loss').length}</div><div className="text-xs text-gray-500">Losses</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-yellow-500/20"><Clock className="w-6 h-6 text-yellow-400 mb-2" /><div className="text-3xl font-bold text-yellow-400">{stats.pendingOperations}</div><div className="text-xs text-gray-500">Pendientes</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-500/20"><DollarSign className="w-6 h-6 text-purple-400 mb-2" /><div className="text-3xl font-bold">${operations.reduce((s, o) => s + o.amount, 0).toLocaleString()}</div><div className="text-xs text-gray-500">Volumen</div></div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between"><h3 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-emerald-400" />Feed en Vivo<span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" /></h3></div>
                <div className="divide-y divide-purple-900/10 max-h-[500px] overflow-y-auto">
                  {operations.map(op => (
                    <div key={op.id} className={`p-4 flex items-center justify-between ${op.flagged ? 'bg-red-500/5' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${op.type === 'buy' ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>{op.type === 'buy' ? <ArrowUpRight className="w-5 h-5 text-emerald-400" /> : <ArrowDownRight className="w-5 h-5 text-red-400" />}</div>
                        <div><div className="font-medium flex items-center gap-2">{op.userName}{op.flagged && <Flag className="w-4 h-4 text-red-400" />}</div><div className="text-xs text-gray-500">{op.odId}</div></div>
                        <div><div className="text-sm font-medium">{op.asset}</div><div className="text-xs text-gray-500">${op.amount}</div></div>
                      </div>
                      <div className="text-right"><div className={`font-bold ${getStatusColor(op.result)}`}>{op.result === 'pending' ? 'En curso...' : op.result === 'win' ? `+$${op.profit}` : op.result === 'loss' ? `-$${Math.abs(op.profit)}` : 'Cancelada'}</div><div className="text-xs text-gray-500">{op.openTime}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Alerts */}
          {currentView === 'alerts' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-red-500/20"><div className="text-2xl font-bold text-red-400">{alerts.filter(a => a.severity === 'critical' && !a.resolved).length}</div><div className="text-xs text-gray-500">Críticas</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-orange-500/20"><div className="text-2xl font-bold text-orange-400">{alerts.filter(a => a.severity === 'high' && !a.resolved).length}</div><div className="text-xs text-gray-500">Altas</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-yellow-500/20"><div className="text-2xl font-bold text-yellow-400">{alerts.filter(a => a.severity === 'medium' && !a.resolved).length}</div><div className="text-xs text-gray-500">Medias</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-blue-500/20"><div className="text-2xl font-bold text-blue-400">{alerts.filter(a => a.severity === 'low' && !a.resolved).length}</div><div className="text-xs text-gray-500">Bajas</div></div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20"><h3 className="font-bold">Todas las Alertas</h3></div>
                <div className="divide-y divide-purple-900/10">
                  {alerts.map(a => (
                    <div key={a.id} className={`p-4 flex items-center justify-between ${a.resolved ? 'opacity-50' : ''}`}>
                      <div className="flex items-center gap-4">
                        <div className={`w-3 h-3 rounded-full ${a.severity === 'critical' ? 'bg-red-500' : a.severity === 'high' ? 'bg-orange-500' : a.severity === 'medium' ? 'bg-yellow-500' : 'bg-blue-500'}`} />
                        <div><div className="font-medium">{a.message}</div>{a.userName && <div className="text-xs text-gray-500">{a.userName} ({a.userId})</div>}<div className="text-xs text-gray-500">{a.timestamp}</div></div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs ${getSeverityColor(a.severity)}`}>{a.severity}</span>
                        {!a.resolved && <button onClick={() => handleResolveAlert(a.id)} className="px-3 py-1 bg-emerald-600 rounded-lg text-xs">Resolver</button>}
                        {a.resolved && <span className="text-xs text-emerald-400">✓ Resuelto</span>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reports */}
          {currentView === 'reports' && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Resumen de Torneos</h3>
                  <div className="space-y-3">{[['Total', stats.activeTournaments + tournaments.filter(t => t.status !== 'active').length], ['Activos', stats.activeTournaments], ['Premio Total', `$${stats.totalPrizePool.toLocaleString()}`], ['Participantes', stats.totalParticipants]].map(([k, v]) => (<div key={k as string} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-bold">{v}</span></div>))}</div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400" />Estadísticas de Trading</h3>
                  <div className="space-y-3">{[['Operaciones', operations.length], ['Wins', operations.filter(o => o.result === 'win').length], ['Losses', operations.filter(o => o.result === 'loss').length], ['Volumen', `$${operations.reduce((s, o) => s + o.amount, 0).toLocaleString()}`]].map(([k, v]) => (<div key={k as string} className="flex justify-between"><span className="text-gray-400">{k}</span><span className="font-bold">{v}</span></div>))}</div>
                </div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-purple-400" />Log de Acciones del Operador</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {operatorLogs.length === 0 ? <p className="text-gray-500 text-sm">No hay acciones registradas</p> : operatorLogs.map(log => (
                    <div key={log.id} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg text-sm">
                      <div><span className="text-purple-400">{log.action}</span> <span className="text-gray-500">→</span> <span>{log.target}</span><div className="text-xs text-gray-500">{log.details}</div></div>
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-purple-400" />Exportar</h3>
                <div className="grid md:grid-cols-3 gap-4">
                  {[['Torneos', Trophy, 'purple'], ['Usuarios', Users, 'emerald'], ['Operaciones', Activity, 'blue']].map(([label, Icon, color]) => (
                    <button key={label as string} className={`p-4 bg-[#1a1625] rounded-xl hover:bg-${color}-500/10 transition flex items-center gap-3`}>
                      {/* @ts-ignore */}
                      <Icon className={`w-6 h-6 text-${color}-400`} /><div className="text-left"><div className="font-medium">Reporte de {label}</div><div className="text-xs text-gray-500">CSV / Excel</div></div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat */}
          {currentView === 'chat' && (
            <div className="h-[calc(100vh-180px)] flex flex-col bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
              <div className="p-4 border-b border-purple-900/20">
                <h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400" />Chat Interno - Equipo de Trabajo</h3>
                <p className="text-xs text-gray-500">Comunicación con administradores y soporte</p>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.map(msg => (
                  <div key={msg.id} className={`flex ${msg.senderRole === 'operator' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[70%] ${msg.senderRole === 'operator' ? 'bg-purple-600' : 'bg-[#1a1625]'} rounded-2xl p-4`}>
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium ${msg.senderRole === 'admin' ? 'text-yellow-400' : msg.senderRole === 'support' ? 'text-cyan-400' : 'text-purple-300'}`}>
                          {msg.senderRole === 'admin' ? '👑' : msg.senderRole === 'support' ? '🎧' : '⚙️'} {msg.senderName}
                        </span>
                        <span className="text-xs text-gray-500">{msg.timestamp}</span>
                      </div>
                      <p className="text-sm">{msg.message}</p>
                      {msg.attachment && (
                        <div className="mt-2 p-2 bg-black/20 rounded-lg">
                          <a href={msg.attachment.url} className="text-xs text-purple-300 hover:underline flex items-center gap-1">
                            📎 {msg.attachment.name}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-[#1a1625] rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="p-4 border-t border-purple-900/20">
                {chatAttachment && (
                  <div className="mb-2 p-2 bg-[#1a1625] rounded-lg flex items-center justify-between">
                    <span className="text-xs text-gray-400">📎 {chatAttachment.name}</span>
                    <button onClick={() => setChatAttachment(null)} className="text-red-400 hover:text-red-300"><X className="w-4 h-4" /></button>
                  </div>
                )}
                <div className="flex gap-2">
                  <input type="text" value={newMessage} onChange={e => { setNewMessage(e.target.value); handleTyping(); }} onKeyPress={e => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Escribe un mensaje..." className="flex-1 bg-[#1a1625] border border-purple-900/30 rounded-xl px-4 py-2.5 text-sm" />
                  <button onClick={handleSendMessage} className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl"><Send className="w-5 h-5" /></button>
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {currentView === 'settings' && (
            <div className="space-y-6">
              {/* Settings Tabs */}
              <div className="flex gap-2 flex-wrap">
                {[
                  { id: 'profile' as const, icon: User, label: 'Perfil' },
                  { id: 'security' as const, icon: Shield, label: 'Seguridad' },
                  { id: 'notifications' as const, icon: Bell, label: 'Notificaciones' },
                  { id: 'appearance' as const, icon: Moon, label: 'Apariencia' },
                  { id: 'advanced' as const, icon: Sliders, label: 'Avanzado' },
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSettingsTab(tab.id)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition ${settingsTab === tab.id ? 'bg-purple-600' : 'bg-[#1a1625] hover:bg-[#1a1625]/80'}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {/* Profile Tab */}
              {settingsTab === 'profile' && (
                <div className="space-y-6">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-purple-400" />Información Personal</h3>
                    <div className="flex flex-col md:flex-row items-start gap-6 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center text-4xl font-bold">{profile.firstName[0]}{profile.lastName[0]}</div>
                        <button className="absolute -bottom-2 -right-2 w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center hover:bg-purple-700 transition"><Upload className="w-4 h-4" /></button>
                      </div>
                      <div className="flex-1">
                        <div className="text-xl font-bold">{profile.firstName} {profile.lastName}</div>
                        <div className="text-sm text-purple-400">Operador</div>
                        <div className="text-xs text-gray-500 mt-1">{profile.email}</div>
                        <div className="flex items-center gap-2 mt-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${profile.status === 'available' ? 'bg-emerald-500/20 text-emerald-400' : profile.status === 'busy' ? 'bg-red-500/20 text-red-400' : profile.status === 'away' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-500/20 text-gray-400'}`}>
                            {profile.status === 'available' ? '🟢 Disponible' : profile.status === 'busy' ? '🔴 Ocupado' : profile.status === 'away' ? '🟡 Ausente' : '⚫ Desconectado'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Nombre</label><input type="text" value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Apellido</label><input type="text" value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Email</label><input type="email" value={profile.email} onChange={e => setProfile(p => ({ ...p, email: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Teléfono</label><input type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Estado y Disponibilidad</h3>
                    <div className="space-y-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Estado</label>
                        <select value={profile.status} onChange={e => setProfile(p => ({ ...p, status: e.target.value as typeof profile.status }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                          <option value="available">🟢 Disponible</option><option value="busy">🔴 Ocupado</option><option value="away">🟡 Ausente</option><option value="offline">⚫ Desconectado</option>
                        </select>
                      </div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Mensaje de estado</label><input type="text" value={profile.statusMessage} onChange={e => setProfile(p => ({ ...p, statusMessage: e.target.value }))} placeholder="Ej: En reunión hasta las 3pm" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 mb-1 block">Hora inicio turno</label><input type="time" value={profile.workSchedule.start} onChange={e => setProfile(p => ({ ...p, workSchedule: { ...p.workSchedule, start: e.target.value } }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">Hora fin turno</label><input type="time" value={profile.workSchedule.end} onChange={e => setProfile(p => ({ ...p, workSchedule: { ...p.workSchedule, end: e.target.value } }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Security Tab */}
              {settingsTab === 'security' && (
                <div className="space-y-6">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-purple-400" />Autenticación</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><Shield className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Autenticación 2FA</div><div className="text-xs text-gray-500">Seguridad adicional con código</div></div></div>
                        <button onClick={() => setProfile(p => ({ ...p, twoFactorEnabled: !p.twoFactorEnabled }))} className={`w-11 h-6 rounded-full relative transition ${profile.twoFactorEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${profile.twoFactorEnabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><Clock className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Timeout de Sesión</div><div className="text-xs text-gray-500">Cerrar sesión por inactividad</div></div></div>
                        <select value={profile.sessionTimeout} onChange={e => setProfile(p => ({ ...p, sessionTimeout: Number(e.target.value) }))} className="bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-1 text-sm"><option value={15}>15 min</option><option value={30}>30 min</option><option value={60}>1 hora</option><option value={120}>2 horas</option></select>
                      </div>
                      <button onClick={() => setShowPasswordModal(true)} className="w-full py-3 bg-[#1a1625] rounded-xl text-sm hover:bg-purple-500/10 flex items-center justify-center gap-2"><Lock className="w-4 h-4" />Cambiar Contraseña</button>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2"><Monitor className="w-5 h-5 text-purple-400" />Sesiones Activas</h3>
                      <button onClick={handleCloseAllSessions} className="text-xs text-red-400 hover:text-red-300">Cerrar todas las remotas</button>
                    </div>
                    <div className="space-y-3">
                      {sessions.map(s => (
                        <div key={s.id} className={`flex items-center justify-between p-4 rounded-xl ${s.current ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-[#1a1625]'}`}>
                          <div className="flex items-center gap-3">
                            {s.device.includes('iPhone') || s.device.includes('Android') ? <Smartphone className="w-5 h-5 text-gray-400" /> : <Monitor className="w-5 h-5 text-gray-400" />}
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">{s.device}{s.current && <span className="text-xs text-purple-400">(Esta sesión)</span>}</div>
                              <div className="text-xs text-gray-500">{s.ip} • {s.location} • {s.lastActive}</div>
                            </div>
                          </div>
                          {!s.current && <button onClick={() => handleCloseSession(s.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><X className="w-4 h-4 text-red-400" /></button>}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-purple-400" />Historial de Inicios de Sesión</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                      {loginHistory.map(log => (
                        <div key={log.id} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg text-sm">
                          <div className="flex items-center gap-3">
                            <div className={`w-2 h-2 rounded-full ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            <div><div className="font-medium">{log.device}</div><div className="text-xs text-gray-500">{log.ip} • {log.location}</div></div>
                          </div>
                          <div className="text-right"><div className="text-xs text-gray-500">{log.date}</div><div className={`text-xs ${log.status === 'success' ? 'text-emerald-400' : 'text-red-400'}`}>{log.status === 'success' ? 'Exitoso' : 'Fallido'}</div></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2"><Fingerprint className="w-5 h-5 text-purple-400" />Dispositivos de Confianza</h3>
                    </div>
                    <div className="space-y-3">
                      {trustedDevices.map(d => (
                        <div key={d.id} className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                          <div className="flex items-center gap-3">
                            {d.os.includes('iOS') || d.os.includes('Android') ? <Smartphone className="w-5 h-5 text-gray-400" /> : <Monitor className="w-5 h-5 text-gray-400" />}
                            <div>
                              <div className="text-sm font-medium flex items-center gap-2">{d.name}<ShieldCheck className="w-4 h-4 text-emerald-400" /></div>
                              <div className="text-xs text-gray-500">{d.browser} • {d.os} • {d.lastUsed}</div>
                            </div>
                          </div>
                          <button onClick={() => handleRemoveTrustedDevice(d.id)} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      ))}
                      {trustedDevices.length === 0 && <p className="text-center text-gray-500 py-4">No hay dispositivos de confianza</p>}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold flex items-center gap-2"><HelpCircle className="w-5 h-5 text-purple-400" />Preguntas de Seguridad</h3>
                      <button onClick={() => setShowSecurityQuestionModal(true)} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"><Plus className="w-4 h-4" />Agregar</button>
                    </div>
                    <div className="space-y-3">
                      {securityQuestions.map(sq => (
                        <div key={sq.id} className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                          <div><div className="text-sm font-medium">{sq.question}</div><div className="text-xs text-gray-500">Respuesta: {sq.answer}</div></div>
                          <button onClick={() => setSecurityQuestions(prev => prev.filter(q => q.id !== sq.id))} className="p-2 hover:bg-red-500/20 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                        </div>
                      ))}
                      {securityQuestions.length === 0 && <p className="text-center text-gray-500 py-4">No hay preguntas de seguridad configuradas</p>}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-purple-400" />Alertas de Seguridad</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><Bell className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Alertas de inicio de sesión</div><div className="text-xs text-gray-500">Notificar nuevos inicios de sesión</div></div></div>
                        <button onClick={() => setSecuritySettings(s => ({ ...s, loginAlerts: !s.loginAlerts }))} className={`w-11 h-6 rounded-full relative transition ${securitySettings.loginAlerts ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${securitySettings.loginAlerts ? 'right-0.5' : 'left-0.5'}`} /></button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><Smartphone className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Alerta de nuevo dispositivo</div><div className="text-xs text-gray-500">Notificar acceso desde dispositivo nuevo</div></div></div>
                        <button onClick={() => setSecuritySettings(s => ({ ...s, newDeviceAlert: !s.newDeviceAlert }))} className={`w-11 h-6 rounded-full relative transition ${securitySettings.newDeviceAlert ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${securitySettings.newDeviceAlert ? 'right-0.5' : 'left-0.5'}`} /></button>
                      </div>
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><Lock className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Bloqueo por intentos fallidos</div><div className="text-xs text-gray-500">Bloquear después de {securitySettings.maxFailedAttempts} intentos</div></div></div>
                        <button onClick={() => setSecuritySettings(s => ({ ...s, failedLoginLock: !s.failedLoginLock }))} className={`w-11 h-6 rounded-full relative transition ${securitySettings.failedLoginLock ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${securitySettings.failedLoginLock ? 'right-0.5' : 'left-0.5'}`} /></button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Notifications Tab */}
              {settingsTab === 'notifications' && (
                <div className="space-y-6">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-purple-400" />Canales de Notificación</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'notifications', icon: Bell, label: 'Notificaciones Push', desc: 'Alertas en el navegador' },
                        { key: 'emailAlerts', icon: Mail, label: 'Alertas por Email', desc: 'Recibir emails de alertas' },
                        { key: 'soundAlerts', icon: Zap, label: 'Sonidos', desc: 'Alertas sonoras' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                          <div className="flex items-center gap-3"><item.icon className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">{item.label}</div><div className="text-xs text-gray-500">{item.desc}</div></div></div>
                          <button onClick={() => setSettings(s => ({ ...s, [item.key]: !s[item.key as keyof typeof settings] }))} className={`w-11 h-6 rounded-full relative transition ${settings[item.key as keyof typeof settings] ? 'bg-purple-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${settings[item.key as keyof typeof settings] ? 'right-0.5' : 'left-0.5'}`} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Moon className="w-5 h-5 text-purple-400" />No Molestar</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><Moon className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Modo No Molestar</div><div className="text-xs text-gray-500">Silenciar notificaciones</div></div></div>
                        <button onClick={() => setSettings(s => ({ ...s, doNotDisturb: !s.doNotDisturb }))} className={`w-11 h-6 rounded-full relative transition ${settings.doNotDisturb ? 'bg-purple-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${settings.doNotDisturb ? 'right-0.5' : 'left-0.5'}`} /></button>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div><label className="text-xs text-gray-500 mb-1 block">Hora inicio</label><input type="time" value={settings.doNotDisturbStart} onChange={e => setSettings(s => ({ ...s, doNotDisturbStart: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">Hora fin</label><input type="time" value={settings.doNotDisturbEnd} onChange={e => setSettings(s => ({ ...s, doNotDisturbEnd: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-purple-400" />Tipos de Alertas</h3>
                    <div className="space-y-4">
                      {[
                        { key: 'suspicious', label: 'Actividad Sospechosa', desc: 'Patrones anormales de trading' },
                        { key: 'highVolume', label: 'Alto Volumen', desc: 'Operaciones de gran monto' },
                        { key: 'winStreak', label: 'Rachas de Victoria', desc: 'Múltiples wins consecutivos' },
                        { key: 'pattern', label: 'Patrones Detectados', desc: 'Comportamiento repetitivo' },
                        { key: 'system', label: 'Sistema', desc: 'Alertas del servidor' },
                      ].map(item => (
                        <div key={item.key} className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                          <div><div className="text-sm font-medium">{item.label}</div><div className="text-xs text-gray-500">{item.desc}</div></div>
                          <button onClick={() => setSettings(s => ({ ...s, alertTypes: { ...s.alertTypes, [item.key]: !s.alertTypes[item.key as keyof typeof s.alertTypes] } }))} className={`w-11 h-6 rounded-full relative transition ${settings.alertTypes[item.key as keyof typeof settings.alertTypes] ? 'bg-purple-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${settings.alertTypes[item.key as keyof typeof settings.alertTypes] ? 'right-0.5' : 'left-0.5'}`} /></button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Sliders className="w-5 h-5 text-purple-400" />Umbrales de Alertas</h3>
                    <div className="space-y-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Umbral de Alto Volumen ($)</label><input type="number" value={settings.alertThresholds.highVolume} onChange={e => setSettings(s => ({ ...s, alertThresholds: { ...s.alertThresholds, highVolume: Number(e.target.value) } }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Racha de Victorias (cantidad)</label><input type="number" value={settings.alertThresholds.winStreak} onChange={e => setSettings(s => ({ ...s, alertThresholds: { ...s.alertThresholds, winStreak: Number(e.target.value) } }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                  </div>
                </div>
              )}

              {/* Appearance Tab */}
              {settingsTab === 'appearance' && (
                <div className="space-y-6">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Moon className="w-5 h-5 text-purple-400" />Tema</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setSettings(s => ({ ...s, theme: 'dark' }))} className={`p-4 rounded-xl border-2 transition ${settings.theme === 'dark' ? 'border-purple-500 bg-purple-500/10' : 'border-purple-900/30 bg-[#1a1625]'}`}>
                        <Moon className="w-8 h-8 text-purple-400 mx-auto mb-2" /><div className="text-sm font-medium">Oscuro</div><div className="text-xs text-gray-500">Tema por defecto</div>
                      </button>
                      <button onClick={() => setSettings(s => ({ ...s, theme: 'light' }))} className={`p-4 rounded-xl border-2 transition ${settings.theme === 'light' ? 'border-purple-500 bg-purple-500/10' : 'border-purple-900/30 bg-[#1a1625]'}`}>
                        <Sun className="w-8 h-8 text-yellow-400 mx-auto mb-2" /><div className="text-sm font-medium">Claro</div><div className="text-xs text-gray-500">Modo día</div>
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Type className="w-5 h-5 text-purple-400" />Tamaño de Fuente</h3>
                    <div className="grid grid-cols-3 gap-4">
                      {[{ id: 'small', label: 'Pequeño', size: 'text-xs' }, { id: 'medium', label: 'Mediano', size: 'text-sm' }, { id: 'large', label: 'Grande', size: 'text-base' }].map(opt => (
                        <button key={opt.id} onClick={() => setSettings(s => ({ ...s, fontSize: opt.id as typeof settings.fontSize }))} className={`p-4 rounded-xl border-2 transition ${settings.fontSize === opt.id ? 'border-purple-500 bg-purple-500/10' : 'border-purple-900/30 bg-[#1a1625]'}`}>
                          <div className={`${opt.size} font-medium mb-1`}>Aa</div><div className="text-xs text-gray-500">{opt.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Layout className="w-5 h-5 text-purple-400" />Densidad de Interfaz</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <button onClick={() => setSettings(s => ({ ...s, density: 'compact' }))} className={`p-4 rounded-xl border-2 transition ${settings.density === 'compact' ? 'border-purple-500 bg-purple-500/10' : 'border-purple-900/30 bg-[#1a1625]'}`}>
                        <div className="space-y-1 mb-2"><div className="h-1 bg-gray-600 rounded w-full" /><div className="h-1 bg-gray-600 rounded w-3/4" /><div className="h-1 bg-gray-600 rounded w-1/2" /></div>
                        <div className="text-sm font-medium">Compacta</div><div className="text-xs text-gray-500">Más información</div>
                      </button>
                      <button onClick={() => setSettings(s => ({ ...s, density: 'normal' }))} className={`p-4 rounded-xl border-2 transition ${settings.density === 'normal' ? 'border-purple-500 bg-purple-500/10' : 'border-purple-900/30 bg-[#1a1625]'}`}>
                        <div className="space-y-2 mb-2"><div className="h-2 bg-gray-600 rounded w-full" /><div className="h-2 bg-gray-600 rounded w-3/4" /><div className="h-2 bg-gray-600 rounded w-1/2" /></div>
                        <div className="text-sm font-medium">Normal</div><div className="text-xs text-gray-500">Más espaciado</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced Tab */}
              {settingsTab === 'advanced' && (
                <div className="space-y-6">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Globe className="w-5 h-5 text-purple-400" />Región e Idioma</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Idioma</label><select value={settings.language} onChange={e => setSettings(s => ({ ...s, language: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option value="es">🇪🇸 Español</option><option value="en">🇺🇸 English</option><option value="pt">🇧🇷 Português</option></select></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Zona Horaria</label><select value={settings.timezone} onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option value="America/Mexico_City">México (GMT-6)</option><option value="America/New_York">New York (GMT-5)</option><option value="America/Los_Angeles">Los Angeles (GMT-8)</option><option value="Europe/Madrid">Madrid (GMT+1)</option><option value="Europe/London">Londres (GMT+0)</option></select></div>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><RefreshCw className="w-5 h-5 text-purple-400" />Datos y Sincronización</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl">
                        <div className="flex items-center gap-3"><RefreshCw className="w-5 h-5 text-emerald-400" /><div><div className="text-sm font-medium">Auto-refresh</div><div className="text-xs text-gray-500">Actualizar datos automáticamente</div></div></div>
                        <button onClick={() => setSettings(s => ({ ...s, autoRefresh: !s.autoRefresh }))} className={`w-11 h-6 rounded-full relative transition ${settings.autoRefresh ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${settings.autoRefresh ? 'right-0.5' : 'left-0.5'}`} /></button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Keyboard className="w-5 h-5 text-purple-400" />Atajos de Teclado</h3>
                    <div className="grid md:grid-cols-2 gap-2">
                      {shortcuts.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                          <span className="text-sm text-gray-400">{s.action}</span>
                          <kbd className="px-2 py-1 bg-[#0d0b14] rounded text-xs font-mono text-purple-400">{s.key}</kbd>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-purple-400" />Exportar / Restaurar</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <button onClick={handleExportSettings} className="p-4 bg-[#1a1625] rounded-xl hover:bg-purple-500/10 transition flex items-center gap-3"><Download className="w-6 h-6 text-purple-400" /><div className="text-left"><div className="font-medium">Exportar Configuración</div><div className="text-xs text-gray-500">Descargar como JSON</div></div></button>
                      <button onClick={handleResetSettings} className="p-4 bg-[#1a1625] rounded-xl hover:bg-red-500/10 transition flex items-center gap-3"><RotateCcw className="w-6 h-6 text-red-400" /><div className="text-left"><div className="font-medium">Restaurar por Defecto</div><div className="text-xs text-gray-500">Resetear configuración</div></div></button>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Info className="w-5 h-5 text-purple-400" />Información del Sistema</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-sm text-gray-400">Versión</span><span className="text-sm font-mono">v2.5.0</span></div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-sm text-gray-400">Última actualización</span><span className="text-sm">25 Dic 2025</span></div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-sm text-gray-400">Estado del servidor</span><span className="text-sm text-emerald-400 flex items-center gap-2"><Wifi className="w-4 h-4" />Conectado</span></div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-sm text-gray-400">Latencia</span><span className="text-sm text-emerald-400">45ms</span></div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-sm text-gray-400">Servidor</span><span className="text-sm flex items-center gap-2"><Server className="w-4 h-4 text-gray-400" />prod-mx-01</span></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Password Modal */}
          {showPasswordModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setShowPasswordModal(false)}>
              <div className="bg-[#13111c] rounded-2xl border border-purple-900/30 w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-purple-400" />Cambiar Contraseña</h2>
                <div className="space-y-4">
                  <div><label className="text-xs text-gray-500 mb-1 block">Contraseña Actual</label><input type="password" value={passwordForm.current} onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Nueva Contraseña</label><input type="password" value={passwordForm.new} onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Confirmar Contraseña</label><input type="password" value={passwordForm.confirm} onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div className="text-xs text-gray-500 p-3 bg-[#1a1625] rounded-lg"><p>La contraseña debe tener:</p><ul className="list-disc list-inside mt-1"><li>Al menos 8 caracteres</li><li>Una letra mayúscula</li><li>Un número</li><li>Un carácter especial</li></ul></div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button onClick={() => setShowPasswordModal(false)} className="flex-1 py-2.5 border border-purple-900/30 rounded-xl text-sm font-medium">Cancelar</button>
                  <button onClick={handleChangePassword} className="flex-1 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl text-sm font-medium">Cambiar</button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

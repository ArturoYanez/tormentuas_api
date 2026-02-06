import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Users, Trophy, CreditCard, Settings, TrendingUp, DollarSign,
  Eye, Search, Download, RefreshCw, Shield, AlertTriangle, CheckCircle, XCircle,
  Clock, Activity, Target, Edit, Plus, Bell, Trash2,
  Mail, Ban, Wallet, ArrowUpRight, ArrowDownRight, Server, Globe, Crown,
  User, LogOut, Menu, X, Gift, Megaphone, Lock, UserPlus,
  BarChart3, Calendar, Zap, MessageSquare, Send, FileText, Key, Smartphone,
  Monitor, Image, Headphones
} from 'lucide-react';

// Types
type ViewType = 'dashboard' | 'users' | 'staff' | 'finance' | 'trading' | 'tournaments' | 'platform' | 'marketing' | 'reports' | 'security' | 'support' | 'notifications' | 'chat' | 'settings' | 'kyc';
type SettingsTab = 'profile' | 'security' | 'sessions' | 'api' | 'notifications' | 'appearance' | 'activity';

interface ChatContact {
  id: number;
  name: string;
  role: 'admin' | 'operator' | 'accountant' | 'support';
  online: boolean;
  lastMessage?: string;
  unread: number;
}

interface ChatMessage {
  id: number;
  senderId: number;
  message: string;
  timestamp: string;
  isMe: boolean;
}

interface KYCRequest {
  id: number;
  odId: string;
  userName: string;
  email: string;
  documentType: 'passport' | 'id_card' | 'drivers_license';
  frontImage: string;
  backImage: string;
  selfieImage: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  country: string;
  notes?: string;
}

interface Session {
  id: number;
  device: string;
  browser: string;
  ip: string;
  location: string;
  lastActive: string;
  current: boolean;
}

interface UserData {
  id: number;
  odId: string;
  name: string;
  email: string;
  phone: string;
  balance: number;
  demoBalance: number;
  status: 'active' | 'suspended' | 'pending';
  verified: boolean;
  kycStatus: 'none' | 'pending' | 'approved' | 'rejected';
  trades: number;
  winRate: number;
  totalDeposits: number;
  totalWithdrawals: number;
  country: string;
  createdAt: string;
  lastLogin: string;
}

interface StaffMember {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'operator' | 'accountant' | 'support';
  status: 'active' | 'inactive';
  lastLogin: string;
  permissions: string[];
}

interface Transaction {
  id: number;
  odId: string;
  userName: string;
  type: 'deposit' | 'withdrawal';
  amount: number;
  status: 'pending' | 'completed' | 'rejected';
  method: string;
  createdAt: string;
}

interface Tournament {
  id: number;
  name: string;
  prize: number;
  entryFee: number;
  participants: number;
  maxParticipants: number;
  status: 'draft' | 'active' | 'upcoming' | 'finished';
  startTime: string;
  endTime: string;
}

interface TradingAsset {
  id: number;
  symbol: string;
  name: string;
  category: 'crypto' | 'forex' | 'commodities' | 'stocks' | 'indices';
  payout: number;
  enabled: boolean;
  tradingHours: string;
  minInvestment: number;
  maxInvestment: number;
  expirationTimes: number[];
  spread: number;
  volatility: 'low' | 'medium' | 'high';
  popularity: number;
  apiSource: string;
  apiKey?: string;
}

interface AuditLog {
  id: number;
  action: string;
  user: string;
  details: string;
  ip: string;
  timestamp: string;
  type: 'login' | 'action' | 'security' | 'system';
}

// Mock Data
const MOCK_USERS: UserData[] = [
  { id: 1, odId: 'USR001', name: 'Juan Pérez', email: 'juan@email.com', phone: '+52 555 1234', balance: 5420, demoBalance: 10000, status: 'active', verified: true, kycStatus: 'approved', trades: 156, winRate: 42, totalDeposits: 8000, totalWithdrawals: 2580, country: 'México', createdAt: '2025-10-15', lastLogin: '2025-12-25 14:30' },
  { id: 2, odId: 'USR002', name: 'María García', email: 'maria@email.com', phone: '+52 555 5678', balance: 12350, demoBalance: 10000, status: 'active', verified: true, kycStatus: 'approved', trades: 289, winRate: 38, totalDeposits: 15000, totalWithdrawals: 2650, country: 'España', createdAt: '2025-09-20', lastLogin: '2025-12-25 16:45' },
  { id: 3, odId: 'USR003', name: 'Carlos López', email: 'carlos@email.com', phone: '+52 555 9012', balance: 890, demoBalance: 5000, status: 'suspended', verified: false, kycStatus: 'pending', trades: 45, winRate: 22, totalDeposits: 2000, totalWithdrawals: 1110, country: 'Argentina', createdAt: '2025-11-01', lastLogin: '2025-12-24 09:15' },
  { id: 4, odId: 'USR004', name: 'Ana Martínez', email: 'ana@email.com', phone: '+52 555 3456', balance: 3200, demoBalance: 10000, status: 'active', verified: true, kycStatus: 'approved', trades: 78, winRate: 51, totalDeposits: 5000, totalWithdrawals: 1800, country: 'Colombia', createdAt: '2025-10-12', lastLogin: '2025-12-25 11:20' },
  { id: 5, odId: 'USR005', name: 'Pedro Sánchez', email: 'pedro@email.com', phone: '+52 555 7890', balance: 150, demoBalance: 8500, status: 'pending', verified: false, kycStatus: 'none', trades: 23, winRate: 35, totalDeposits: 500, totalWithdrawals: 350, country: 'Chile', createdAt: '2025-12-19', lastLogin: '2025-12-25 08:00' },
];

const MOCK_STAFF: StaffMember[] = [
  { id: 1, name: 'Admin Principal', email: 'admin@tormentus.com', role: 'admin', status: 'active', lastLogin: '2025-12-25 10:00', permissions: ['all'] },
  { id: 2, name: 'Operador Demo', email: 'operador@tormentus.com', role: 'operator', status: 'active', lastLogin: '2025-12-25 09:30', permissions: ['trading', 'users'] },
  { id: 3, name: 'Contador Demo', email: 'contador@tormentus.com', role: 'accountant', status: 'active', lastLogin: '2025-12-25 08:45', permissions: ['finance', 'reports'] },
  { id: 4, name: 'Soporte Demo', email: 'soporte@tormentus.com', role: 'support', status: 'active', lastLogin: '2025-12-25 11:00', permissions: ['tickets', 'users'] },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 1, odId: 'USR001', userName: 'Juan Pérez', type: 'deposit', amount: 1000, status: 'completed', method: 'USDT TRC-20', createdAt: '2025-12-25 10:00' },
  { id: 2, odId: 'USR002', userName: 'María García', type: 'withdrawal', amount: 500, status: 'pending', method: 'BTC', createdAt: '2025-12-25 09:30' },
  { id: 3, odId: 'USR003', userName: 'Carlos López', type: 'deposit', amount: 200, status: 'pending', method: 'ETH', createdAt: '2025-12-24 16:00' },
  { id: 4, odId: 'USR004', userName: 'Ana Martínez', type: 'withdrawal', amount: 1000, status: 'rejected', method: 'USDT', createdAt: '2025-12-24 14:00' },
];

const MOCK_TOURNAMENTS: Tournament[] = [
  { id: 1, name: 'Torneo Semanal', prize: 5000, entryFee: 10, participants: 45, maxParticipants: 100, status: 'active', startTime: '2025-12-25 10:00', endTime: '2025-12-26 22:00' },
  { id: 2, name: 'Speed Trading', prize: 2000, entryFee: 5, participants: 28, maxParticipants: 50, status: 'active', startTime: '2025-12-25 12:00', endTime: '2025-12-25 18:00' },
  { id: 3, name: 'Torneo VIP', prize: 10000, entryFee: 100, participants: 15, maxParticipants: 30, status: 'upcoming', startTime: '2025-12-27 10:00', endTime: '2025-12-28 10:00' },
];

const MOCK_ASSETS: TradingAsset[] = [
  { id: 1, symbol: 'BTC/USDT', name: 'Bitcoin', category: 'crypto', payout: 85, enabled: true, tradingHours: '24/7', minInvestment: 1, maxInvestment: 10000, expirationTimes: [60, 120, 300, 900], spread: 0.1, volatility: 'high', popularity: 98, apiSource: 'binance', apiKey: 'binance_btc_usdt' },
  { id: 2, symbol: 'ETH/USDT', name: 'Ethereum', category: 'crypto', payout: 85, enabled: true, tradingHours: '24/7', minInvestment: 1, maxInvestment: 10000, expirationTimes: [60, 120, 300, 900], spread: 0.15, volatility: 'high', popularity: 95, apiSource: 'binance', apiKey: 'binance_eth_usdt' },
  { id: 3, symbol: 'EUR/USD', name: 'Euro/Dólar', category: 'forex', payout: 90, enabled: true, tradingHours: 'Lun-Vie 00:00-23:59', minInvestment: 1, maxInvestment: 5000, expirationTimes: [60, 300, 900, 3600], spread: 0.0001, volatility: 'medium', popularity: 92, apiSource: 'tradingview', apiKey: 'tv_eur_usd' },
  { id: 4, symbol: 'XAU/USD', name: 'Oro', category: 'commodities', payout: 88, enabled: true, tradingHours: 'Lun-Vie 01:00-23:00', minInvestment: 5, maxInvestment: 5000, expirationTimes: [300, 900, 3600], spread: 0.3, volatility: 'medium', popularity: 85, apiSource: 'tradingview', apiKey: 'tv_xau_usd' },
  { id: 5, symbol: 'AAPL', name: 'Apple Inc.', category: 'stocks', payout: 82, enabled: false, tradingHours: 'NYSE 14:30-21:00', minInvestment: 10, maxInvestment: 2000, expirationTimes: [300, 900, 3600], spread: 0.05, volatility: 'low', popularity: 78, apiSource: 'alphavantage', apiKey: 'av_aapl' },
  { id: 6, symbol: 'GBP/USD', name: 'Libra/Dólar', category: 'forex', payout: 89, enabled: true, tradingHours: 'Lun-Vie 00:00-23:59', minInvestment: 1, maxInvestment: 5000, expirationTimes: [60, 300, 900], spread: 0.0002, volatility: 'medium', popularity: 88, apiSource: 'tradingview', apiKey: 'tv_gbp_usd' },
  { id: 7, symbol: 'SOL/USDT', name: 'Solana', category: 'crypto', payout: 87, enabled: true, tradingHours: '24/7', minInvestment: 1, maxInvestment: 8000, expirationTimes: [60, 120, 300], spread: 0.2, volatility: 'high', popularity: 90, apiSource: 'binance', apiKey: 'binance_sol_usdt' },
  { id: 8, symbol: 'US100', name: 'Nasdaq 100', category: 'indices', payout: 86, enabled: true, tradingHours: 'Lun-Vie 00:00-23:00', minInvestment: 5, maxInvestment: 3000, expirationTimes: [300, 900, 3600], spread: 1.5, volatility: 'medium', popularity: 82, apiSource: 'tradingview', apiKey: 'tv_us100' },
];

const MOCK_AUDIT: AuditLog[] = [
  { id: 1, action: 'Login exitoso', user: 'Admin', details: 'Acceso al panel', ip: '192.168.1.1', timestamp: '2025-12-25 10:00', type: 'login' },
  { id: 2, action: 'Usuario suspendido', user: 'Admin', details: 'USR003 - Carlos López', ip: '192.168.1.1', timestamp: '2025-12-25 09:45', type: 'action' },
  { id: 3, action: 'Retiro aprobado', user: 'Contador', details: '$500 para USR002', ip: '192.168.1.2', timestamp: '2025-12-25 09:30', type: 'action' },
  { id: 4, action: 'Intento de login fallido', user: 'Desconocido', details: 'admin@test.com', ip: '45.67.89.10', timestamp: '2025-12-25 08:15', type: 'security' },
];

const MOCK_CHAT_CONTACTS: ChatContact[] = [
  { id: 1, name: 'Operador Demo', role: 'operator', online: true, lastMessage: 'Revisando el caso USR003', unread: 2 },
  { id: 2, name: 'Contador Demo', role: 'accountant', online: true, lastMessage: 'Retiro aprobado', unread: 0 },
  { id: 3, name: 'Soporte Demo', role: 'support', online: false, lastMessage: 'Ticket resuelto', unread: 0 },
];

const MOCK_KYC_REQUESTS: KYCRequest[] = [
  { id: 1, odId: 'USR003', userName: 'Carlos López', email: 'carlos@email.com', documentType: 'passport', frontImage: '/kyc/front1.jpg', backImage: '/kyc/back1.jpg', selfieImage: '/kyc/selfie1.jpg', status: 'pending', submittedAt: '2025-12-24 14:30', country: 'Argentina' },
  { id: 2, odId: 'USR005', userName: 'Pedro Sánchez', email: 'pedro@email.com', documentType: 'id_card', frontImage: '/kyc/front2.jpg', backImage: '/kyc/back2.jpg', selfieImage: '/kyc/selfie2.jpg', status: 'pending', submittedAt: '2025-12-25 09:15', country: 'Chile' },
];

const MOCK_SESSIONS: Session[] = [
  { id: 1, device: 'Windows PC', browser: 'Chrome 120', ip: '192.168.1.1', location: 'Ciudad de México, MX', lastActive: 'Ahora', current: true },
  { id: 2, device: 'iPhone 15', browser: 'Safari Mobile', ip: '192.168.1.50', location: 'Ciudad de México, MX', lastActive: 'Hace 2 horas', current: false },
  { id: 3, device: 'MacBook Pro', browser: 'Firefox 121', ip: '10.0.0.25', location: 'Guadalajara, MX', lastActive: 'Hace 1 día', current: false },
];


export default function AdminPanel() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  
  // Data states
  const [users, setUsers] = useState<UserData[]>(MOCK_USERS);
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [tournaments, setTournaments] = useState<Tournament[]>(MOCK_TOURNAMENTS);
  const [assets, setAssets] = useState<TradingAsset[]>(MOCK_ASSETS);
  const [auditLogs] = useState<AuditLog[]>(MOCK_AUDIT);
  
  // UI states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showStaffModal, setShowStaffModal] = useState(false);
  const [showTournamentModal, setShowTournamentModal] = useState(false);
  const [userFilter, setUserFilter] = useState<'all' | 'active' | 'suspended' | 'pending'>('all');
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);
  const [editingTournament, setEditingTournament] = useState<Tournament | null>(null);
  
  // Form states
  const [newUser, setNewUser] = useState({ name: '', email: '', phone: '', country: '', balance: 0 });
  const [newStaff, setNewStaff] = useState({ name: '', email: '', role: 'operator' as StaffMember['role'], permissions: [] as string[] });
  const [newTournament, setNewTournament] = useState({ name: '', prize: 0, entryFee: 0, maxParticipants: 50, startTime: '', endTime: '' });

  // Chat states
  const [chatContacts] = useState<ChatContact[]>(MOCK_CHAT_CONTACTS);
  const [selectedChatContact, setSelectedChatContact] = useState<ChatContact | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { id: 1, senderId: 1, message: 'Hola, necesito ayuda con el caso USR003', timestamp: '10:30', isMe: false },
    { id: 2, senderId: 0, message: 'Claro, ¿qué necesitas?', timestamp: '10:31', isMe: true },
    { id: 3, senderId: 1, message: 'El usuario reporta problemas con su retiro', timestamp: '10:32', isMe: false },
  ]);
  const [newMessage, setNewMessage] = useState('');

  // KYC states
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>(MOCK_KYC_REQUESTS);
  const [selectedKYC, setSelectedKYC] = useState<KYCRequest | null>(null);
  const [kycNotes, setKycNotes] = useState('');

  // Settings states
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [sessions] = useState<Session[]>(MOCK_SESSIONS);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [profileData, setProfileData] = useState({ firstName: '', lastName: '', email: '', phone: '', timezone: 'America/Mexico_City', language: 'es', bio: '' });
  const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
  
  // Extended settings states
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [loginHistory] = useState([
    { id: 1, date: '2025-12-25 10:00', device: 'Windows PC - Chrome', ip: '192.168.1.1', location: 'Ciudad de México, MX', current: true },
    { id: 2, date: '2025-12-24 18:30', device: 'iPhone 15 - Safari', ip: '192.168.1.50', location: 'Ciudad de México, MX', current: false },
    { id: 3, date: '2025-12-23 09:15', device: 'MacBook Pro - Firefox', ip: '10.0.0.25', location: 'Guadalajara, MX', current: false },
    { id: 4, date: '2025-12-22 14:00', device: 'Windows PC - Chrome', ip: '192.168.1.1', location: 'Ciudad de México, MX', current: false },
  ]);
  const [trustedDevices, setTrustedDevices] = useState([
    { id: 1, name: 'Windows PC - Oficina', lastUsed: '2025-12-25 10:00' },
    { id: 2, name: 'iPhone 15 Pro', lastUsed: '2025-12-24 18:30' },
    { id: 3, name: 'MacBook Pro M2', lastUsed: '2025-12-23 09:15' },
  ]);
  const [securityQuestions, setSecurityQuestions] = useState([
    { question: '¿Cuál es el nombre de tu primera mascota?', answer: '••••••••' },
    { question: '¿En qué ciudad naciste?', answer: '••••••••' },
  ]);
  const [apiKeys, setApiKeys] = useState([
    { id: 1, name: 'Production Key', key: 'sk_live_****************************', created: '2025-11-15', lastUsed: '2025-12-25', permissions: ['read', 'write'], active: true },
    { id: 2, name: 'Development Key', key: 'sk_test_****************************', created: '2025-12-01', lastUsed: '2025-12-24', permissions: ['read'], active: true },
  ]);
  const [activityLog] = useState([
    { id: 1, action: 'Inicio de sesión', timestamp: '2025-12-25 10:00', ip: '192.168.1.1', details: 'Login exitoso' },
    { id: 2, action: 'Usuario suspendido', timestamp: '2025-12-25 09:45', ip: '192.168.1.1', details: 'USR003 - Carlos López' },
    { id: 3, action: 'Retiro aprobado', timestamp: '2025-12-25 09:30', ip: '192.168.1.1', details: '$500 para USR002' },
    { id: 4, action: 'Configuración actualizada', timestamp: '2025-12-24 16:00', ip: '192.168.1.1', details: 'Cambio de contraseña' },
    { id: 5, action: 'API Key generada', timestamp: '2025-12-24 14:00', ip: '192.168.1.1', details: 'Development Key' },
  ]);
  const [notificationPrefs, setNotificationPrefs] = useState({
    newUsers: true,
    deposits: true,
    withdrawals: true,
    kycRequests: true,
    securityAlerts: true,
    systemUpdates: false,
    marketingReports: false,
  });

  // Balance adjustment modal
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAdjustment, setBalanceAdjustment] = useState({ userId: 0, amount: 0, reason: '', type: 'add' as 'add' | 'subtract' });

  // Asset management states
  const [showAssetModal, setShowAssetModal] = useState(false);
  const [editingAsset, setEditingAsset] = useState<TradingAsset | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<TradingAsset | null>(null);
  const [assetFilter, setAssetFilter] = useState<'all' | 'crypto' | 'forex' | 'commodities' | 'stocks' | 'indices'>('all');
  const [newAsset, setNewAsset] = useState<Partial<TradingAsset>>({
    symbol: '', name: '', category: 'crypto', payout: 85, enabled: true, tradingHours: '24/7',
    minInvestment: 1, maxInvestment: 5000, expirationTimes: [60, 300, 900], spread: 0.1, volatility: 'medium', popularity: 50,
    apiSource: 'binance', apiKey: ''
  });

  // Platform settings
  const [platformSettings, setPlatformSettings] = useState({
    siteName: 'TORMENTUS',
    maintenanceMode: false,
    registrationEnabled: true,
    minDeposit: 10,
    maxDeposit: 50000,
    minWithdrawal: 20,
    maxWithdrawal: 10000,
    welcomeBonus: 100,
    referralBonus: 50,
  });

  // Payment settings
  const [paymentSettings, setPaymentSettings] = useState({
    // Crypto wallets
    btcWallet: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
    ethWallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    usdtTrc20Wallet: 'TXyz1234567890abcdefghijklmnopqrs',
    usdtErc20Wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    usdtBep20Wallet: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F',
    solWallet: 'DYw8jCTfwHNRJhhmFcbXvVDTqWMEVFBX6ZKUmG5CNSKK',
    // Payment methods enabled
    btcEnabled: true,
    ethEnabled: true,
    usdtTrc20Enabled: true,
    usdtErc20Enabled: true,
    usdtBep20Enabled: true,
    solEnabled: true,
    // Fiat settings
    bankTransferEnabled: false,
    bankName: '',
    bankAccount: '',
    bankSwift: '',
    // Fees
    depositFee: 0,
    withdrawalFee: 2.5,
    minConfirmations: 3,
    autoApproveBelow: 100,
  });

  // Stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === 'active').length,
    totalBalance: users.reduce((sum, u) => sum + u.balance, 0),
    totalDeposits: users.reduce((sum, u) => sum + u.totalDeposits, 0),
    totalWithdrawals: users.reduce((sum, u) => sum + u.totalWithdrawals, 0),
    pendingWithdrawals: transactions.filter(t => t.type === 'withdrawal' && t.status === 'pending').length,
    pendingDeposits: transactions.filter(t => t.type === 'deposit' && t.status === 'pending').length,
    activeTournaments: tournaments.filter(t => t.status === 'active').length,
    pendingKYC: users.filter(u => u.kycStatus === 'pending').length,
    onlineUsers: 234,
    todayVolume: 45230,
    todayProfit: 8450,
  };

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error') => setNotification({ message, type });
  const handleLogout = () => { logout(); navigate('/'); };

  // User actions
  const handleSuspendUser = (userId: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' as const : 'active' as const } : u
    ));
    showToast('Estado del usuario actualizado', 'success');
  };

  const handleApproveKYC = (userId: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, kycStatus: 'approved' as const, verified: true } : u
    ));
    showToast('KYC aprobado', 'success');
  };

  const handleAdjustBalance = (userId: number, amount: number) => {
    setUsers(prev => prev.map(u => 
      u.id === userId ? { ...u, balance: u.balance + amount } : u
    ));
    showToast(`Balance ajustado: ${amount > 0 ? '+' : ''}$${amount}`, 'success');
  };

  // Transaction actions
  const handleApproveTransaction = (txId: number) => {
    setTransactions(prev => prev.map(t => 
      t.id === txId ? { ...t, status: 'completed' as const } : t
    ));
    showToast('Transacción aprobada', 'success');
  };

  const handleRejectTransaction = (txId: number) => {
    setTransactions(prev => prev.map(t => 
      t.id === txId ? { ...t, status: 'rejected' as const } : t
    ));
    showToast('Transacción rechazada', 'success');
  };

  // Asset actions
  const handleToggleAsset = (assetId: number) => {
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, enabled: !a.enabled } : a
    ));
    const asset = assets.find(a => a.id === assetId);
    showToast(`${asset?.symbol} ${asset?.enabled ? 'desactivado' : 'activado'}`, 'success');
  };

  const handleUpdatePayout = (assetId: number, payout: number) => {
    setAssets(prev => prev.map(a => 
      a.id === assetId ? { ...a, payout } : a
    ));
  };

  const handleCreateAsset = () => {
    if (!newAsset.symbol || !newAsset.name || !newAsset.apiSource) {
      showToast('Completa los campos requeridos (símbolo, nombre y fuente API)', 'error');
      return;
    }
    const asset: TradingAsset = {
      id: Date.now(),
      symbol: newAsset.symbol || '',
      name: newAsset.name || '',
      category: newAsset.category || 'crypto',
      payout: newAsset.payout || 85,
      enabled: newAsset.enabled ?? true,
      tradingHours: newAsset.tradingHours || '24/7',
      minInvestment: newAsset.minInvestment || 1,
      maxInvestment: newAsset.maxInvestment || 5000,
      expirationTimes: newAsset.expirationTimes || [60, 300, 900],
      spread: newAsset.spread || 0.1,
      volatility: newAsset.volatility || 'medium',
      popularity: newAsset.popularity || 50,
      apiSource: newAsset.apiSource || 'binance',
      apiKey: newAsset.apiKey || `${newAsset.apiSource}_${newAsset.symbol?.toLowerCase().replace('/', '_')}`
    };
    setAssets(prev => [asset, ...prev]);
    setNewAsset({ symbol: '', name: '', category: 'crypto', payout: 85, enabled: true, tradingHours: '24/7', minInvestment: 1, maxInvestment: 5000, expirationTimes: [60, 300, 900], spread: 0.1, volatility: 'medium', popularity: 50, apiSource: 'binance', apiKey: '' });
    setShowAssetModal(false);
    showToast('Activo creado exitosamente', 'success');
  };

  const handleUpdateAsset = () => {
    if (!editingAsset) return;
    setAssets(prev => prev.map(a => a.id === editingAsset.id ? editingAsset : a));
    setEditingAsset(null);
    setShowAssetModal(false);
    showToast('Activo actualizado', 'success');
  };

  const handleDeleteAsset = (assetId: number) => {
    const asset = assets.find(a => a.id === assetId);
    setAssets(prev => prev.filter(a => a.id !== assetId));
    showToast(`${asset?.symbol} eliminado`, 'success');
  };

  const handleUpdateAssetField = (assetId: number, field: keyof TradingAsset, value: number | string | boolean | number[]) => {
    setAssets(prev => prev.map(a => a.id === assetId ? { ...a, [field]: value } : a));
  };

  const handleBulkToggleAssets = (category: TradingAsset['category'], enabled: boolean) => {
    setAssets(prev => prev.map(a => a.category === category ? { ...a, enabled } : a));
    showToast(`Todos los activos de ${category} ${enabled ? 'activados' : 'desactivados'}`, 'success');
  };

  const handleBulkUpdatePayout = (category: TradingAsset['category'], payout: number) => {
    setAssets(prev => prev.map(a => a.category === category ? { ...a, payout } : a));
    showToast(`Payout de ${category} actualizado a ${payout}%`, 'success');
  };

  // Filtered assets
  const filteredAssets = assets.filter(a => assetFilter === 'all' || a.category === assetFilter);

  // User CRUD
  const handleCreateUser = () => {
    if (!newUser.name || !newUser.email) return;
    const user: UserData = {
      id: Date.now(), odId: `USR${String(users.length + 1).padStart(3, '0')}`,
      name: newUser.name, email: newUser.email, phone: newUser.phone, country: newUser.country,
      balance: newUser.balance, demoBalance: 10000, status: 'pending', verified: false, kycStatus: 'none',
      trades: 0, winRate: 0, totalDeposits: 0, totalWithdrawals: 0,
      createdAt: new Date().toISOString().split('T')[0], lastLogin: '-'
    };
    setUsers(prev => [user, ...prev]);
    setNewUser({ name: '', email: '', phone: '', country: '', balance: 0 });
    setShowUserModal(false);
    showToast('Usuario creado', 'success');
  };

  const handleUpdateUser = () => {
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setEditingUser(null);
    setShowUserModal(false);
    showToast('Usuario actualizado', 'success');
  };

  const handleDeleteUser = (userId: number) => {
    setUsers(prev => prev.filter(u => u.id !== userId));
    showToast('Usuario eliminado', 'success');
  };

  // Staff CRUD
  const handleCreateStaff = () => {
    if (!newStaff.name || !newStaff.email) return;
    const member: StaffMember = {
      id: Date.now(), name: newStaff.name, email: newStaff.email, role: newStaff.role,
      status: 'active', lastLogin: '-', permissions: newStaff.permissions
    };
    setStaff(prev => [member, ...prev]);
    setNewStaff({ name: '', email: '', role: 'operator', permissions: [] });
    setShowStaffModal(false);
    showToast('Staff creado', 'success');
  };

  const handleUpdateStaff = () => {
    if (!editingStaff) return;
    setStaff(prev => prev.map(s => s.id === editingStaff.id ? editingStaff : s));
    setEditingStaff(null);
    setShowStaffModal(false);
    showToast('Staff actualizado', 'success');
  };

  const handleDeleteStaff = (staffId: number) => {
    setStaff(prev => prev.filter(s => s.id !== staffId));
    showToast('Staff eliminado', 'success');
  };

  const handleToggleStaffStatus = (staffId: number) => {
    setStaff(prev => prev.map(s => s.id === staffId ? { ...s, status: s.status === 'active' ? 'inactive' as const : 'active' as const } : s));
    showToast('Estado actualizado', 'success');
  };

  // Tournament CRUD
  const handleCreateTournament = () => {
    if (!newTournament.name || !newTournament.prize) return;
    const tournament: Tournament = {
      id: Date.now(), name: newTournament.name, prize: newTournament.prize, entryFee: newTournament.entryFee,
      participants: 0, maxParticipants: newTournament.maxParticipants, status: 'upcoming',
      startTime: newTournament.startTime, endTime: newTournament.endTime
    };
    setTournaments(prev => [tournament, ...prev]);
    setNewTournament({ name: '', prize: 0, entryFee: 0, maxParticipants: 50, startTime: '', endTime: '' });
    setShowTournamentModal(false);
    showToast('Torneo creado', 'success');
  };

  const handleUpdateTournament = () => {
    if (!editingTournament) return;
    setTournaments(prev => prev.map(t => t.id === editingTournament.id ? editingTournament : t));
    setEditingTournament(null);
    setShowTournamentModal(false);
    showToast('Torneo actualizado', 'success');
  };

  const handleDeleteTournament = (tournamentId: number) => {
    setTournaments(prev => prev.filter(t => t.id !== tournamentId));
    showToast('Torneo eliminado', 'success');
  };

  const handleToggleTournamentStatus = (tournamentId: number) => {
    setTournaments(prev => prev.map(t => {
      if (t.id !== tournamentId) return t;
      const newStatus = t.status === 'active' ? 'finished' as const : t.status === 'upcoming' ? 'active' as const : 'upcoming' as const;
      return { ...t, status: newStatus };
    }));
    showToast('Estado actualizado', 'success');
  };

  // KYC handlers
  const handleApproveKYCRequest = (kycId: number) => {
    setKycRequests(prev => prev.map(k => k.id === kycId ? { ...k, status: 'approved' as const } : k));
    const kyc = kycRequests.find(k => k.id === kycId);
    if (kyc) {
      setUsers(prev => prev.map(u => u.odId === kyc.odId ? { ...u, kycStatus: 'approved' as const, verified: true } : u));
    }
    showToast('KYC aprobado', 'success');
    setSelectedKYC(null);
  };

  const handleRejectKYCRequest = (kycId: number) => {
    if (!kycNotes) { showToast('Ingresa una razón de rechazo', 'error'); return; }
    setKycRequests(prev => prev.map(k => k.id === kycId ? { ...k, status: 'rejected' as const, notes: kycNotes } : k));
    const kyc = kycRequests.find(k => k.id === kycId);
    if (kyc) {
      setUsers(prev => prev.map(u => u.odId === kyc.odId ? { ...u, kycStatus: 'rejected' as const } : u));
    }
    showToast('KYC rechazado', 'success');
    setSelectedKYC(null);
    setKycNotes('');
  };

  // Chat handlers
  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedChatContact) return;
    const msg: ChatMessage = { id: Date.now(), senderId: 0, message: newMessage, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), isMe: true };
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  // Balance adjustment handler
  const handleBalanceAdjustment = () => {
    if (!balanceAdjustment.userId || !balanceAdjustment.amount || !balanceAdjustment.reason) {
      showToast('Completa todos los campos', 'error'); return;
    }
    const amount = balanceAdjustment.type === 'add' ? balanceAdjustment.amount : -balanceAdjustment.amount;
    setUsers(prev => prev.map(u => u.id === balanceAdjustment.userId ? { ...u, balance: u.balance + amount } : u));
    showToast(`Balance ${balanceAdjustment.type === 'add' ? 'agregado' : 'restado'}: $${balanceAdjustment.amount}`, 'success');
    setShowBalanceModal(false);
    setBalanceAdjustment({ userId: 0, amount: 0, reason: '', type: 'add' });
  };

  // Session handler
  const handleTerminateSession = (_sessionId: number) => {
    showToast('Sesión terminada', 'success');
  };

  // Password change handler
  const handleChangePassword = () => {
    if (!passwordData.current || !passwordData.new || !passwordData.confirm) {
      showToast('Completa todos los campos', 'error'); return;
    }
    if (passwordData.new !== passwordData.confirm) {
      showToast('Las contraseñas no coinciden', 'error'); return;
    }
    showToast('Contraseña actualizada', 'success');
    setPasswordData({ current: '', new: '', confirm: '' });
  };

  // Filtered data
  const filteredUsers = users.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         u.odId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = userFilter === 'all' || u.status === userFilter;
    return matchesSearch && matchesFilter;
  });

  const menuItems = [
    { id: 'dashboard' as ViewType, icon: LayoutDashboard, label: 'Dashboard' },
    { id: 'users' as ViewType, icon: Users, label: 'Usuarios', badge: stats.pendingKYC },
    { id: 'kyc' as ViewType, icon: FileText, label: 'KYC', badge: kycRequests.filter(k => k.status === 'pending').length },
    { id: 'staff' as ViewType, icon: Shield, label: 'Personal' },
    { id: 'finance' as ViewType, icon: CreditCard, label: 'Finanzas', badge: stats.pendingWithdrawals },
    { id: 'trading' as ViewType, icon: Activity, label: 'Trading' },
    { id: 'tournaments' as ViewType, icon: Trophy, label: 'Torneos' },
    { id: 'platform' as ViewType, icon: Settings, label: 'Plataforma' },
    { id: 'marketing' as ViewType, icon: Megaphone, label: 'Marketing' },
    { id: 'reports' as ViewType, icon: BarChart3, label: 'Reportes' },
    { id: 'security' as ViewType, icon: Lock, label: 'Seguridad' },
    { id: 'chat' as ViewType, icon: MessageSquare, label: 'Chat Interno' },
    { id: 'support' as ViewType, icon: Headphones, label: 'Soporte' },
    { id: 'notifications' as ViewType, icon: Bell, label: 'Notificaciones' },
    { id: 'settings' as ViewType, icon: User, label: 'Mi Cuenta' },
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-500/20 text-purple-400';
      case 'operator': return 'bg-blue-500/20 text-blue-400';
      case 'accountant': return 'bg-emerald-500/20 text-emerald-400';
      case 'support': return 'bg-cyan-500/20 text-cyan-400';
      default: return 'bg-gray-500/20 text-gray-400';
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0b14] flex">
      {/* Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl text-sm font-medium z-[100] flex items-center gap-2 ${notification.type === 'success' ? 'bg-purple-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      {/* Mobile Overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#13111c] border-r border-purple-900/20 flex flex-col z-50 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">TORMENTUS</span>
                <div className="text-[10px] text-purple-400">Panel Admin</div>
              </div>
            </div>
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentView === item.id ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a1625]'}`}>
              <div className="flex items-center gap-3"><item.icon className="w-5 h-5" />{item.label}</div>
              {item.badge && item.badge > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentView === item.id ? 'bg-white/20' : 'bg-red-500 text-white'}`}>{item.badge}</span>}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-purple-900/20">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center"><User className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-purple-400">Administrador</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm"><LogOut className="w-4 h-4" />Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-[#13111c] border-b border-purple-900/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-[#1a1625] rounded-lg" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold">{menuItems.find(m => m.id === currentView)?.label || 'Dashboard'}</h1>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-green-500/20 rounded-lg">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              <span className="text-xs text-green-400">{stats.onlineUsers} online</span>
            </div>
            <button className="p-2 hover:bg-[#1a1625] rounded-lg relative">
              <Bell className="w-5 h-5 text-gray-400" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <button className="p-2 hover:bg-[#1a1625] rounded-lg"><RefreshCw className="w-5 h-5 text-gray-400" /></button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">

          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold">{stats.totalUsers}</div>
                  <div className="text-xs text-gray-500">Usuarios Totales</div>
                  <div className="text-xs text-green-400 mt-1">+12% este mes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                      <DollarSign className="w-5 h-5 text-green-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-green-400">${stats.totalDeposits.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Depósitos</div>
                  <div className="text-xs text-green-400 mt-1">+8.5% esta semana</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-yellow-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.activeTournaments}</div>
                  <div className="text-xs text-gray-500">Torneos Activos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-400" />
                    </div>
                  </div>
                  <div className="text-2xl font-bold text-red-400">{stats.pendingWithdrawals + stats.pendingKYC}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
              </div>

              {/* Quick Stats Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 flex items-center gap-3">
                  <Activity className="w-8 h-8 text-cyan-400" />
                  <div>
                    <div className="text-lg font-bold">${stats.todayVolume.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Volumen Hoy</div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-green-400" />
                  <div>
                    <div className="text-lg font-bold text-green-400">${stats.todayProfit.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Profit Hoy</div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 flex items-center gap-3">
                  <Clock className="w-8 h-8 text-yellow-400" />
                  <div>
                    <div className="text-lg font-bold">{stats.pendingWithdrawals}</div>
                    <div className="text-xs text-gray-500">Retiros Pendientes</div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 flex items-center gap-3">
                  <Shield className="w-8 h-8 text-purple-400" />
                  <div>
                    <div className="text-lg font-bold">{stats.pendingKYC}</div>
                    <div className="text-xs text-gray-500">KYC Pendientes</div>
                  </div>
                </div>
              </div>

              {/* Recent Activity & Alerts */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                  <div className="p-4 border-b border-purple-900/20 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Actividad Reciente</h2>
                  </div>
                  <div className="divide-y divide-purple-900/10">
                    {[
                      { action: 'Nuevo registro', user: 'Carlos M.', time: '30s', color: 'green' },
                      { action: 'Depósito $500', user: 'Ana G.', time: '1min', color: 'blue' },
                      { action: 'Retiro solicitado', user: 'Pedro S.', time: '5min', color: 'orange' },
                      { action: 'KYC enviado', user: 'Laura R.', time: '10min', color: 'purple' },
                    ].map((item, i) => (
                      <div key={i} className="p-3 flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.color === 'green' ? 'bg-green-400' : item.color === 'blue' ? 'bg-blue-400' : item.color === 'orange' ? 'bg-orange-400' : 'bg-purple-400'}`} />
                        <div className="flex-1">
                          <div className="text-sm">{item.action}</div>
                          <div className="text-xs text-gray-500">{item.user} • hace {item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                  <div className="p-4 border-b border-purple-900/20 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><AlertTriangle className="w-5 h-5 text-yellow-400" />Alertas del Sistema</h2>
                  </div>
                  <div className="divide-y divide-purple-900/10">
                    {stats.pendingWithdrawals > 0 && (
                      <div className="p-3 flex items-center gap-3 bg-yellow-500/5">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <div className="flex-1">
                          <div className="text-sm">{stats.pendingWithdrawals} retiros pendientes</div>
                          <div className="text-xs text-gray-500">Requieren aprobación</div>
                        </div>
                        <button onClick={() => setCurrentView('finance')} className="text-xs text-yellow-400">Ver</button>
                      </div>
                    )}
                    {stats.pendingKYC > 0 && (
                      <div className="p-3 flex items-center gap-3 bg-purple-500/5">
                        <Shield className="w-5 h-5 text-purple-400" />
                        <div className="flex-1">
                          <div className="text-sm">{stats.pendingKYC} verificaciones KYC</div>
                          <div className="text-xs text-gray-500">Documentos por revisar</div>
                        </div>
                        <button onClick={() => setCurrentView('users')} className="text-xs text-purple-400">Ver</button>
                      </div>
                    )}
                    <div className="p-3 flex items-center gap-3 bg-green-500/5">
                      <Server className="w-5 h-5 text-green-400" />
                      <div className="flex-1">
                        <div className="text-sm">Sistema operando normalmente</div>
                        <div className="text-xs text-gray-500">CPU: 23% • RAM: 45%</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                <h2 className="font-bold mb-4">Acciones Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {[
                    { icon: UserPlus, label: 'Nuevo Usuario', action: () => setShowUserModal(true) },
                    { icon: Trophy, label: 'Crear Torneo', action: () => setShowTournamentModal(true) },
                    { icon: Gift, label: 'Enviar Bono', action: () => setCurrentView('marketing') },
                    { icon: Mail, label: 'Email Masivo', action: () => setCurrentView('notifications') },
                    { icon: Download, label: 'Exportar Datos', action: () => setCurrentView('reports') },
                    { icon: Settings, label: 'Configuración', action: () => setCurrentView('platform') },
                  ].map((item, i) => (
                    <button key={i} onClick={item.action} className="p-4 bg-[#1a1625] hover:bg-purple-900/30 rounded-xl transition flex flex-col items-center gap-2">
                      <item.icon className="w-6 h-6 text-purple-400" />
                      <span className="text-xs">{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Users Management */}
          {currentView === 'users' && !selectedUser && (
            <div className="space-y-4">
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por nombre, email o ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-purple-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <div className="flex gap-1 bg-[#1a1625] rounded-lg p-1">
                    {(['all', 'active', 'suspended', 'pending'] as const).map(f => (
                      <button key={f} onClick={() => setUserFilter(f)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${userFilter === f ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        {f === 'all' ? 'Todos' : f === 'active' ? 'Activos' : f === 'suspended' ? 'Suspendidos' : 'Pendientes'}
                      </button>
                    ))}
                  </div>
                  <button className="px-3 py-2 bg-[#1a1625] rounded-lg"><Download className="w-4 h-4" /></button>
                  <button onClick={() => setShowUserModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo
                  </button>
                </div>
              </div>

              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Balance</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Trades</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Win Rate</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">KYC</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredUsers.map(u => (
                        <tr key={u.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center font-bold">
                                {u.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-medium">{u.name}</div>
                                <div className="text-xs text-gray-500">{u.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-green-400">${u.balance.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Demo: ${u.demoBalance.toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-3">{u.trades}</td>
                          <td className="px-4 py-3">
                            <span className={u.winRate > 40 ? 'text-green-400' : u.winRate > 25 ? 'text-yellow-400' : 'text-red-400'}>
                              {u.winRate}%
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              u.kycStatus === 'approved' ? 'bg-green-500/20 text-green-400' :
                              u.kycStatus === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                              u.kycStatus === 'rejected' ? 'bg-red-500/20 text-red-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {u.kycStatus}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              u.status === 'active' ? 'bg-green-500/20 text-green-400' :
                              u.status === 'suspended' ? 'bg-red-500/20 text-red-400' :
                              'bg-yellow-500/20 text-yellow-400'
                            }`}>
                              {u.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setSelectedUser(u)} className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg"><Eye className="w-4 h-4 text-purple-400" /></button>
                              <button onClick={() => { setEditingUser(u); setShowUserModal(true); }} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg"><Edit className="w-4 h-4 text-blue-400" /></button>
                              <button onClick={() => { setBalanceAdjustment({...balanceAdjustment, userId: u.id}); setShowBalanceModal(true); }} className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg"><Wallet className="w-4 h-4 text-yellow-400" /></button>
                              <button onClick={() => handleSuspendUser(u.id)} className="p-1.5 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg"><Ban className="w-4 h-4 text-orange-400" /></button>
                              <button onClick={() => handleDeleteUser(u.id)} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* User Detail */}
          {currentView === 'users' && selectedUser && (
            <div className="space-y-4">
              <button onClick={() => setSelectedUser(null)} className="flex items-center gap-2 text-gray-400 hover:text-white">
                <X className="w-4 h-4" /> Volver a la lista
              </button>
              <div className="grid lg:grid-cols-3 gap-4">
                {/* User Info */}
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center text-2xl font-bold">
                      {selectedUser.name.charAt(0)}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg">{selectedUser.name}</h2>
                      <div className="text-sm text-gray-500">{selectedUser.odId}</div>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${selectedUser.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {selectedUser.status}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" />{selectedUser.email}</div>
                    <div className="flex items-center gap-2"><Globe className="w-4 h-4 text-gray-500" />{selectedUser.country}</div>
                    <div className="flex items-center gap-2"><Calendar className="w-4 h-4 text-gray-500" />Registro: {selectedUser.createdAt}</div>
                    <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-500" />Último login: {selectedUser.lastLogin}</div>
                  </div>
                </div>

                {/* Financial Info */}
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4">Información Financiera</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                      <span className="text-gray-500">Balance Real</span>
                      <span className="font-bold text-green-400">${selectedUser.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                      <span className="text-gray-500">Balance Demo</span>
                      <span className="font-bold">${selectedUser.demoBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                      <span className="text-gray-500">Total Depósitos</span>
                      <span className="font-bold text-blue-400">${selectedUser.totalDeposits.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                      <span className="text-gray-500">Total Retiros</span>
                      <span className="font-bold text-red-400">${selectedUser.totalWithdrawals.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4">Acciones</h3>
                  <div className="space-y-2">
                    <button onClick={() => handleAdjustBalance(selectedUser.id, 100)} className="w-full py-2 bg-green-600 hover:bg-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <Plus className="w-4 h-4" /> Agregar Balance
                    </button>
                    <button onClick={() => handleAdjustBalance(selectedUser.id, -100)} className="w-full py-2 bg-red-600 hover:bg-red-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                      <ArrowDownRight className="w-4 h-4" /> Restar Balance
                    </button>
                    {selectedUser.kycStatus === 'pending' && (
                      <button onClick={() => handleApproveKYC(selectedUser.id)} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                        <CheckCircle className="w-4 h-4" /> Aprobar KYC
                      </button>
                    )}
                    <button onClick={() => handleSuspendUser(selectedUser.id)} className="w-full py-2 bg-[#1a1625] hover:bg-purple-900/30 rounded-lg text-sm flex items-center justify-center gap-2">
                      <Ban className="w-4 h-4" /> {selectedUser.status === 'active' ? 'Suspender' : 'Activar'} Usuario
                    </button>
                    <button className="w-full py-2 bg-[#1a1625] hover:bg-purple-900/30 rounded-lg text-sm flex items-center justify-center gap-2">
                      <Mail className="w-4 h-4" /> Enviar Email
                    </button>
                  </div>
                </div>
              </div>

              {/* Trading Stats */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4">Estadísticas de Trading</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-[#1a1625] rounded-lg text-center">
                    <div className="text-2xl font-bold">{selectedUser.trades}</div>
                    <div className="text-xs text-gray-500">Total Trades</div>
                  </div>
                  <div className="p-4 bg-[#1a1625] rounded-lg text-center">
                    <div className={`text-2xl font-bold ${selectedUser.winRate > 40 ? 'text-green-400' : 'text-red-400'}`}>{selectedUser.winRate}%</div>
                    <div className="text-xs text-gray-500">Win Rate</div>
                  </div>
                  <div className="p-4 bg-[#1a1625] rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-400">{Math.round(selectedUser.trades * selectedUser.winRate / 100)}</div>
                    <div className="text-xs text-gray-500">Ganados</div>
                  </div>
                  <div className="p-4 bg-[#1a1625] rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-400">{Math.round(selectedUser.trades * (100 - selectedUser.winRate) / 100)}</div>
                    <div className="text-xs text-gray-500">Perdidos</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Staff Management */}
          {currentView === 'staff' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Personal</h2>
                <button onClick={() => setShowStaffModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Nuevo Staff
                </button>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {staff.map(member => (
                  <div key={member.id} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        member.role === 'admin' ? 'bg-purple-500/20' :
                        member.role === 'operator' ? 'bg-blue-500/20' :
                        member.role === 'accountant' ? 'bg-emerald-500/20' :
                        'bg-cyan-500/20'
                      }`}>
                        {member.role === 'admin' ? <Crown className="w-6 h-6 text-purple-400" /> :
                         member.role === 'operator' ? <Activity className="w-6 h-6 text-blue-400" /> :
                         member.role === 'accountant' ? <DollarSign className="w-6 h-6 text-emerald-400" /> :
                         <MessageSquare className="w-6 h-6 text-cyan-400" />}
                      </div>
                      <div>
                        <div className="font-medium">{member.name}</div>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${getRoleColor(member.role)}`}>
                          {member.role}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-gray-400">
                        <Mail className="w-4 h-4" />{member.email}
                      </div>
                      <div className="flex items-center gap-2 text-gray-400">
                        <Clock className="w-4 h-4" />{member.lastLogin}
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${member.status === 'active' ? 'bg-green-400' : 'bg-gray-400'}`} />
                        <span className="text-xs text-gray-500">{member.status}</span>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button onClick={() => { setEditingStaff(member); setShowStaffModal(true); }} className="flex-1 py-1.5 bg-[#1a1625] hover:bg-purple-900/30 rounded-lg text-xs flex items-center justify-center gap-1"><Edit className="w-3 h-3" />Editar</button>
                      <button onClick={() => handleToggleStaffStatus(member.id)} className={`flex-1 py-1.5 rounded-lg text-xs ${member.status === 'active' ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400' : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400'}`}>{member.status === 'active' ? 'Desactivar' : 'Activar'}</button>
                      <button onClick={() => handleDeleteStaff(member.id)} className="py-1.5 px-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-xs"><Trash2 className="w-3 h-3 text-red-400" /></button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Permissions Matrix */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4">Matriz de Permisos</h3>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-purple-900/20">
                        <th className="text-left py-2 text-sm text-gray-500">Permiso</th>
                        <th className="text-center py-2 text-sm text-purple-400">Admin</th>
                        <th className="text-center py-2 text-sm text-blue-400">Operador</th>
                        <th className="text-center py-2 text-sm text-emerald-400">Contador</th>
                        <th className="text-center py-2 text-sm text-cyan-400">Soporte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { name: 'Gestión de usuarios', admin: true, operator: true, accountant: false, support: true },
                        { name: 'Finanzas', admin: true, operator: false, accountant: true, support: false },
                        { name: 'Trading', admin: true, operator: true, accountant: false, support: false },
                        { name: 'Torneos', admin: true, operator: true, accountant: false, support: false },
                        { name: 'Configuración', admin: true, operator: false, accountant: false, support: false },
                        { name: 'Reportes', admin: true, operator: true, accountant: true, support: false },
                      ].map((perm, i) => (
                        <tr key={i} className="border-b border-purple-900/10">
                          <td className="py-2 text-sm">{perm.name}</td>
                          <td className="text-center py-2">{perm.admin ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-600 mx-auto" />}</td>
                          <td className="text-center py-2">{perm.operator ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-600 mx-auto" />}</td>
                          <td className="text-center py-2">{perm.accountant ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-600 mx-auto" />}</td>
                          <td className="text-center py-2">{perm.support ? <CheckCircle className="w-4 h-4 text-green-400 mx-auto" /> : <XCircle className="w-4 h-4 text-gray-600 mx-auto" />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Finance */}
          {currentView === 'finance' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2"><ArrowDownRight className="w-5 h-5 text-green-400" /></div>
                  <div className="text-2xl font-bold text-green-400">$12,450</div>
                  <div className="text-xs text-gray-500">Depósitos Hoy</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2"><ArrowUpRight className="w-5 h-5 text-red-400" /></div>
                  <div className="text-2xl font-bold text-red-400">$3,200</div>
                  <div className="text-xs text-gray-500">Retiros Hoy</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-purple-400" /></div>
                  <div className="text-2xl font-bold text-purple-400">$9,250</div>
                  <div className="text-xs text-gray-500">Balance Neto</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-yellow-400" /></div>
                  <div className="text-2xl font-bold text-yellow-400">{stats.pendingWithdrawals}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
              </div>

              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20 flex justify-between items-center">
                  <h3 className="font-bold">Transacciones Recientes</h3>
                  <div className="flex gap-2">
                    <select className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-1.5 text-xs">
                      <option>Todas</option>
                      <option>Depósitos</option>
                      <option>Retiros</option>
                    </select>
                    <select className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-1.5 text-xs">
                      <option>Todos los estados</option>
                      <option>Pendientes</option>
                      <option>Completados</option>
                    </select>
                  </div>
                </div>
                <table className="w-full">
                  <thead className="bg-[#1a1625]">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Monto</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Método</th>
                      <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                      <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/10">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-[#1a1625]/50">
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm">{tx.userName}</div>
                          <div className="text-xs text-gray-500">{tx.odId}</div>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 ${tx.type === 'deposit' ? 'text-green-400' : 'text-red-400'}`}>
                            {tx.type === 'deposit' ? <ArrowDownRight className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            {tx.type}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-bold">${tx.amount}</td>
                        <td className="px-4 py-3 text-sm text-gray-400">{tx.method}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            tx.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                            tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {tx.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {tx.status === 'pending' && (
                            <div className="flex justify-end gap-1">
                              <button onClick={() => handleApproveTransaction(tx.id)} className="p-1.5 bg-green-500/20 hover:bg-green-500/30 rounded-lg">
                                <CheckCircle className="w-4 h-4 text-green-400" />
                              </button>
                              <button onClick={() => handleRejectTransaction(tx.id)} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg">
                                <XCircle className="w-4 h-4 text-red-400" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trading */}
          {currentView === 'trading' && !selectedAsset && (
            <div className="space-y-4">
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <Activity className="w-8 h-8 text-purple-400 mb-2" />
                  <div className="text-2xl font-bold">{assets.length}</div>
                  <div className="text-xs text-gray-500">Total Activos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <CheckCircle className="w-8 h-8 text-green-400 mb-2" />
                  <div className="text-2xl font-bold text-green-400">{assets.filter(a => a.enabled).length}</div>
                  <div className="text-xs text-gray-500">Activos Habilitados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <Target className="w-8 h-8 text-yellow-400 mb-2" />
                  <div className="text-2xl font-bold text-yellow-400">{Math.round(assets.reduce((sum, a) => sum + a.payout, 0) / assets.length)}%</div>
                  <div className="text-xs text-gray-500">Payout Promedio</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <Zap className="w-8 h-8 text-cyan-400 mb-2" />
                  <div className="text-2xl font-bold text-cyan-400">$45,230</div>
                  <div className="text-xs text-gray-500">Volumen Hoy</div>
                </div>
              </div>

              {/* Filters and Actions */}
              <div className="flex flex-col lg:flex-row gap-3 justify-between">
                <div className="flex gap-2 flex-wrap">
                  <div className="flex gap-1 bg-[#1a1625] rounded-lg p-1">
                    {(['all', 'crypto', 'forex', 'commodities', 'stocks', 'indices'] as const).map(f => (
                      <button key={f} onClick={() => setAssetFilter(f)} className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${assetFilter === f ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                        {f === 'all' ? 'Todos' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setShowAssetModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Nuevo Activo
                  </button>
                </div>
              </div>

              {/* Bulk Actions */}
              {assetFilter !== 'all' && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <div className="flex flex-wrap items-center gap-4">
                    <span className="text-sm text-gray-400">Acciones masivas para {assetFilter}:</span>
                    <button onClick={() => handleBulkToggleAssets(assetFilter, true)} className="px-3 py-1.5 bg-green-600/20 hover:bg-green-600/30 text-green-400 rounded-lg text-xs">Activar Todos</button>
                    <button onClick={() => handleBulkToggleAssets(assetFilter, false)} className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs">Desactivar Todos</button>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500">Payout:</span>
                      <input type="number" min="70" max="95" defaultValue={85} className="w-16 bg-[#1a1625] border border-purple-900/30 rounded px-2 py-1 text-xs" id="bulkPayout" />
                      <button onClick={() => { const val = (document.getElementById('bulkPayout') as HTMLInputElement)?.value; handleBulkUpdatePayout(assetFilter, parseInt(val) || 85); }} className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600/30 text-purple-400 rounded-lg text-xs">Aplicar</button>
                    </div>
                  </div>
                </div>
              )}

              {/* Assets Table */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Activo</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Categoría</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Payout</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Inversión</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Volatilidad</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Horario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredAssets.map(asset => (
                        <tr key={asset.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${asset.category === 'crypto' ? 'bg-orange-500/20' : asset.category === 'forex' ? 'bg-blue-500/20' : asset.category === 'commodities' ? 'bg-yellow-500/20' : asset.category === 'indices' ? 'bg-purple-500/20' : 'bg-green-500/20'}`}>
                                <span className={`font-bold text-xs ${asset.category === 'crypto' ? 'text-orange-400' : asset.category === 'forex' ? 'text-blue-400' : asset.category === 'commodities' ? 'text-yellow-400' : asset.category === 'indices' ? 'text-purple-400' : 'text-green-400'}`}>{asset.symbol.substring(0, 3)}</span>
                              </div>
                              <div>
                                <div className="font-mono font-bold">{asset.symbol}</div>
                                <div className="text-xs text-gray-500">{asset.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${asset.category === 'crypto' ? 'bg-orange-500/20 text-orange-400' : asset.category === 'forex' ? 'bg-blue-500/20 text-blue-400' : asset.category === 'commodities' ? 'bg-yellow-500/20 text-yellow-400' : asset.category === 'indices' ? 'bg-purple-500/20 text-purple-400' : 'bg-green-500/20 text-green-400'}`}>{asset.category}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-green-400 w-10">{asset.payout}%</span>
                              <input type="range" min="70" max="95" value={asset.payout} onChange={(e) => handleUpdatePayout(asset.id, Number(e.target.value))} className="w-16 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-500" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs">
                              <div className="text-gray-400">Min: ${asset.minInvestment}</div>
                              <div className="text-gray-400">Max: ${asset.maxInvestment}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-xs ${asset.volatility === 'high' ? 'bg-red-500/20 text-red-400' : asset.volatility === 'medium' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>{asset.volatility === 'high' ? 'Alta' : asset.volatility === 'medium' ? 'Media' : 'Baja'}</span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-400">{asset.tradingHours}</td>
                          <td className="px-4 py-3">
                            <button onClick={() => handleToggleAsset(asset.id)} className={`w-10 h-5 rounded-full relative transition ${asset.enabled ? 'bg-green-600' : 'bg-gray-600'}`}>
                              <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition ${asset.enabled ? 'right-0.5' : 'left-0.5'}`} />
                            </button>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => setSelectedAsset(asset)} className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Ver detalles"><Eye className="w-4 h-4 text-purple-400" /></button>
                              <button onClick={() => { setEditingAsset(asset); setShowAssetModal(true); }} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg" title="Editar"><Edit className="w-4 h-4 text-blue-400" /></button>
                              <button onClick={() => handleDeleteAsset(asset.id)} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Category Summary */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {(['crypto', 'forex', 'commodities', 'stocks', 'indices'] as const).map(cat => {
                  const catAssets = assets.filter(a => a.category === cat);
                  const enabled = catAssets.filter(a => a.enabled).length;
                  return (
                    <div key={cat} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${cat === 'crypto' ? 'text-orange-400' : cat === 'forex' ? 'text-blue-400' : cat === 'commodities' ? 'text-yellow-400' : cat === 'indices' ? 'text-purple-400' : 'text-green-400'}`}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
                        <span className="text-xs text-gray-500">{enabled}/{catAssets.length}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1.5">
                        <div className={`h-1.5 rounded-full ${cat === 'crypto' ? 'bg-orange-500' : cat === 'forex' ? 'bg-blue-500' : cat === 'commodities' ? 'bg-yellow-500' : cat === 'indices' ? 'bg-purple-500' : 'bg-green-500'}`} style={{ width: `${catAssets.length > 0 ? (enabled / catAssets.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Asset Detail View */}
          {currentView === 'trading' && selectedAsset && (
            <div className="space-y-4">
              <button onClick={() => setSelectedAsset(null)} className="flex items-center gap-2 text-gray-400 hover:text-white"><X className="w-4 h-4" />Volver a la lista</button>
              
              <div className="grid lg:grid-cols-3 gap-4">
                {/* Asset Info */}
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`w-16 h-16 rounded-xl flex items-center justify-center ${selectedAsset.category === 'crypto' ? 'bg-orange-500/20' : selectedAsset.category === 'forex' ? 'bg-blue-500/20' : 'bg-yellow-500/20'}`}>
                        <span className={`font-bold text-xl ${selectedAsset.category === 'crypto' ? 'text-orange-400' : selectedAsset.category === 'forex' ? 'text-blue-400' : 'text-yellow-400'}`}>{selectedAsset.symbol.substring(0, 3)}</span>
                      </div>
                      <div>
                        <h2 className="text-xl font-bold">{selectedAsset.symbol}</h2>
                        <p className="text-gray-500">{selectedAsset.name}</p>
                        <span className={`px-2 py-0.5 rounded text-xs ${selectedAsset.enabled ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{selectedAsset.enabled ? 'Activo' : 'Inactivo'}</span>
                      </div>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Categoría</span><span className="font-medium">{selectedAsset.category}</span></div>
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Payout</span><span className="font-bold text-green-400">{selectedAsset.payout}%</span></div>
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Spread</span><span className="font-medium">{selectedAsset.spread}</span></div>
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Volatilidad</span><span className={`font-medium ${selectedAsset.volatility === 'high' ? 'text-red-400' : selectedAsset.volatility === 'medium' ? 'text-yellow-400' : 'text-green-400'}`}>{selectedAsset.volatility === 'high' ? 'Alta' : selectedAsset.volatility === 'medium' ? 'Media' : 'Baja'}</span></div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Inversión Mín.</span><span className="font-medium">${selectedAsset.minInvestment}</span></div>
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Inversión Máx.</span><span className="font-medium">${selectedAsset.maxInvestment}</span></div>
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Horario</span><span className="font-medium">{selectedAsset.tradingHours}</span></div>
                        <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg"><span className="text-gray-500">Popularidad</span><span className="font-medium">{selectedAsset.popularity}%</span></div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Tiempos de Expiración</h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAsset.expirationTimes.map(time => (
                        <span key={time} className="px-3 py-1.5 bg-[#1a1625] rounded-lg text-sm">{time >= 3600 ? `${time / 3600}h` : time >= 60 ? `${time / 60}m` : `${time}s`}</span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Acciones Rápidas</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Ajustar Payout</label>
                        <div className="flex gap-2">
                          <input type="range" min="70" max="95" value={selectedAsset.payout} onChange={(e) => handleUpdateAssetField(selectedAsset.id, 'payout', Number(e.target.value))} className="flex-1 accent-purple-500" />
                          <span className="w-12 text-center font-bold text-green-400">{selectedAsset.payout}%</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Inversión Mínima ($)</label>
                        <input type="number" value={selectedAsset.minInvestment} onChange={(e) => handleUpdateAssetField(selectedAsset.id, 'minInvestment', Number(e.target.value))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-2 block">Inversión Máxima ($)</label>
                        <input type="number" value={selectedAsset.maxInvestment} onChange={(e) => handleUpdateAssetField(selectedAsset.id, 'maxInvestment', Number(e.target.value))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                      </div>
                      <button onClick={() => handleToggleAsset(selectedAsset.id)} className={`w-full py-2.5 rounded-lg font-medium ${selectedAsset.enabled ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>{selectedAsset.enabled ? 'Desactivar Activo' : 'Activar Activo'}</button>
                      <button onClick={() => { setEditingAsset(selectedAsset); setShowAssetModal(true); }} className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg font-medium">Editar Completo</button>
                      <button onClick={() => { handleDeleteAsset(selectedAsset.id); setSelectedAsset(null); }} className="w-full py-2.5 bg-[#1a1625] hover:bg-red-500/20 text-red-400 rounded-lg font-medium">Eliminar Activo</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tournaments */}
          {currentView === 'tournaments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Gestión de Torneos</h2>
                <button onClick={() => setShowTournamentModal(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2">
                  <Plus className="w-4 h-4" /> Crear Torneo
                </button>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {tournaments.map(t => (
                  <div key={t.id} className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                    <div className={`p-4 ${t.status === 'active' ? 'bg-green-500/10' : t.status === 'upcoming' ? 'bg-yellow-500/10' : 'bg-gray-500/10'}`}>
                      <div className="flex items-center justify-between mb-2">
                        <Trophy className={`w-6 h-6 ${t.status === 'active' ? 'text-green-400' : t.status === 'upcoming' ? 'text-yellow-400' : 'text-gray-400'}`} />
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          t.status === 'active' ? 'bg-green-500/20 text-green-400' :
                          t.status === 'upcoming' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-gray-500/20 text-gray-400'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                      <h3 className="font-bold text-lg">{t.name}</h3>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Premio</span>
                        <span className="font-bold text-yellow-400">${t.prize.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Entry Fee</span>
                        <span className="font-medium">${t.entryFee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500 text-sm">Participantes</span>
                        <span className="font-medium">{t.participants}/{t.maxParticipants}</span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-2">
                        <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${(t.participants / t.maxParticipants) * 100}%` }} />
                      </div>
                      <div className="text-xs text-gray-500">
                        {t.startTime} - {t.endTime}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <button onClick={() => { setEditingTournament(t); setShowTournamentModal(true); }} className="flex-1 py-1.5 bg-[#1a1625] hover:bg-purple-900/30 rounded-lg text-xs flex items-center justify-center gap-1"><Edit className="w-3 h-3" />Editar</button>
                        <button onClick={() => handleToggleTournamentStatus(t.id)} className={`flex-1 py-1.5 rounded-lg text-xs ${t.status === 'active' ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>{t.status === 'active' ? 'Finalizar' : t.status === 'upcoming' ? 'Iniciar' : 'Reactivar'}</button>
                        <button onClick={() => handleDeleteTournament(t.id)} className="py-1.5 px-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-3 h-3 text-red-400" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Platform Settings */}
          {currentView === 'platform' && (
            <div className="space-y-6">
              {/* General Settings */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Settings className="w-5 h-5 text-purple-400" />Configuración General</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Nombre del Sitio</label>
                    <input type="text" value={platformSettings.siteName} onChange={(e) => setPlatformSettings(s => ({ ...s, siteName: e.target.value }))}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Modo Mantenimiento</div>
                      <div className="text-xs text-gray-500">Desactiva el acceso público</div>
                    </div>
                    <button onClick={() => setPlatformSettings(s => ({ ...s, maintenanceMode: !s.maintenanceMode }))}
                      className={`w-11 h-6 rounded-full relative transition ${platformSettings.maintenanceMode ? 'bg-red-600' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${platformSettings.maintenanceMode ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Registro Habilitado</div>
                      <div className="text-xs text-gray-500">Permite nuevos usuarios</div>
                    </div>
                    <button onClick={() => setPlatformSettings(s => ({ ...s, registrationEnabled: !s.registrationEnabled }))}
                      className={`w-11 h-6 rounded-full relative transition ${platformSettings.registrationEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${platformSettings.registrationEnabled ? 'right-0.5' : 'left-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Crypto Wallets Configuration */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-yellow-400" />Wallets de Recepción (Crypto)</h3>
                <p className="text-xs text-gray-500 mb-4">Configura las wallets donde recibirás los depósitos de los usuarios</p>
                <div className="space-y-4">
                  {/* BTC */}
                  <div className="p-4 bg-[#1a1625] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center"><span className="text-orange-400 font-bold text-xs">BTC</span></div><span className="font-medium">Bitcoin</span></div>
                      <button onClick={() => setPaymentSettings(s => ({ ...s, btcEnabled: !s.btcEnabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.btcEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.btcEnabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <input type="text" value={paymentSettings.btcWallet} onChange={(e) => setPaymentSettings(s => ({ ...s, btcWallet: e.target.value }))} placeholder="Wallet BTC" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  {/* ETH */}
                  <div className="p-4 bg-[#1a1625] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><span className="text-blue-400 font-bold text-xs">ETH</span></div><span className="font-medium">Ethereum</span></div>
                      <button onClick={() => setPaymentSettings(s => ({ ...s, ethEnabled: !s.ethEnabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.ethEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.ethEnabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <input type="text" value={paymentSettings.ethWallet} onChange={(e) => setPaymentSettings(s => ({ ...s, ethWallet: e.target.value }))} placeholder="Wallet ETH (ERC-20)" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  {/* USDT TRC-20 */}
                  <div className="p-4 bg-[#1a1625] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><span className="text-emerald-400 font-bold text-xs">USDT</span></div><span className="font-medium">USDT (TRC-20 - Tron)</span></div>
                      <button onClick={() => setPaymentSettings(s => ({ ...s, usdtTrc20Enabled: !s.usdtTrc20Enabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.usdtTrc20Enabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.usdtTrc20Enabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <input type="text" value={paymentSettings.usdtTrc20Wallet} onChange={(e) => setPaymentSettings(s => ({ ...s, usdtTrc20Wallet: e.target.value }))} placeholder="Wallet USDT TRC-20" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  {/* USDT ERC-20 */}
                  <div className="p-4 bg-[#1a1625] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><span className="text-emerald-400 font-bold text-xs">USDT</span></div><span className="font-medium">USDT (ERC-20 - Ethereum)</span></div>
                      <button onClick={() => setPaymentSettings(s => ({ ...s, usdtErc20Enabled: !s.usdtErc20Enabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.usdtErc20Enabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.usdtErc20Enabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <input type="text" value={paymentSettings.usdtErc20Wallet} onChange={(e) => setPaymentSettings(s => ({ ...s, usdtErc20Wallet: e.target.value }))} placeholder="Wallet USDT ERC-20" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  {/* USDT BEP-20 */}
                  <div className="p-4 bg-[#1a1625] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-yellow-500/20 rounded-lg flex items-center justify-center"><span className="text-yellow-400 font-bold text-xs">USDT</span></div><span className="font-medium">USDT (BEP-20 - BSC)</span></div>
                      <button onClick={() => setPaymentSettings(s => ({ ...s, usdtBep20Enabled: !s.usdtBep20Enabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.usdtBep20Enabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.usdtBep20Enabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <input type="text" value={paymentSettings.usdtBep20Wallet} onChange={(e) => setPaymentSettings(s => ({ ...s, usdtBep20Wallet: e.target.value }))} placeholder="Wallet USDT BEP-20" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                  {/* SOL */}
                  <div className="p-4 bg-[#1a1625] rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2"><div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center"><span className="text-purple-400 font-bold text-xs">SOL</span></div><span className="font-medium">Solana</span></div>
                      <button onClick={() => setPaymentSettings(s => ({ ...s, solEnabled: !s.solEnabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.solEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.solEnabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                    </div>
                    <input type="text" value={paymentSettings.solWallet} onChange={(e) => setPaymentSettings(s => ({ ...s, solWallet: e.target.value }))} placeholder="Wallet SOL" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                </div>
                <button onClick={() => showToast('Wallets guardadas', 'success')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium">Guardar Wallets</button>
              </div>

              {/* Bank Transfer (Fiat) */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold flex items-center gap-2"><CreditCard className="w-5 h-5 text-blue-400" />Transferencia Bancaria (Fiat)</h3>
                  <button onClick={() => setPaymentSettings(s => ({ ...s, bankTransferEnabled: !s.bankTransferEnabled }))} className={`w-11 h-6 rounded-full relative ${paymentSettings.bankTransferEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${paymentSettings.bankTransferEnabled ? 'right-0.5' : 'left-0.5'}`} /></button>
                </div>
                {paymentSettings.bankTransferEnabled && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 mb-1 block">Nombre del Banco</label><input type="text" value={paymentSettings.bankName} onChange={(e) => setPaymentSettings(s => ({ ...s, bankName: e.target.value }))} placeholder="Ej: Banco Santander" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Número de Cuenta / IBAN</label><input type="text" value={paymentSettings.bankAccount} onChange={(e) => setPaymentSettings(s => ({ ...s, bankAccount: e.target.value }))} placeholder="ES00 0000 0000 0000 0000 0000" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Código SWIFT/BIC</label><input type="text" value={paymentSettings.bankSwift} onChange={(e) => setPaymentSettings(s => ({ ...s, bankSwift: e.target.value }))} placeholder="BSCHESMMXXX" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" /></div>
                  </div>
                )}
              </div>

              {/* Deposit/Withdrawal Limits */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" />Límites de Depósito y Retiro</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className="text-xs text-gray-500 mb-1 block">Depósito Mínimo ($)</label><input type="number" value={platformSettings.minDeposit} onChange={(e) => setPlatformSettings(s => ({ ...s, minDeposit: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Depósito Máximo ($)</label><input type="number" value={platformSettings.maxDeposit} onChange={(e) => setPlatformSettings(s => ({ ...s, maxDeposit: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Retiro Mínimo ($)</label><input type="number" value={platformSettings.minWithdrawal} onChange={(e) => setPlatformSettings(s => ({ ...s, minWithdrawal: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Retiro Máximo ($)</label><input type="number" value={platformSettings.maxWithdrawal} onChange={(e) => setPlatformSettings(s => ({ ...s, maxWithdrawal: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
              </div>

              {/* Fees & Processing */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-5 h-5 text-yellow-400" />Comisiones y Procesamiento</h3>
                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div><label className="text-xs text-gray-500 mb-1 block">Comisión Depósito (%)</label><input type="number" step="0.1" value={paymentSettings.depositFee} onChange={(e) => setPaymentSettings(s => ({ ...s, depositFee: parseFloat(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Comisión Retiro (%)</label><input type="number" step="0.1" value={paymentSettings.withdrawalFee} onChange={(e) => setPaymentSettings(s => ({ ...s, withdrawalFee: parseFloat(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Confirmaciones Mínimas</label><input type="number" value={paymentSettings.minConfirmations} onChange={(e) => setPaymentSettings(s => ({ ...s, minConfirmations: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Auto-aprobar debajo de ($)</label><input type="number" value={paymentSettings.autoApproveBelow} onChange={(e) => setPaymentSettings(s => ({ ...s, autoApproveBelow: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
                <button onClick={() => showToast('Configuración guardada', 'success')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium">Guardar Configuración</button>
              </div>

              {/* Payment Methods Summary */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4">Resumen de Métodos de Pago Activos</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {[
                    { name: 'BTC', enabled: paymentSettings.btcEnabled, color: 'orange' },
                    { name: 'ETH', enabled: paymentSettings.ethEnabled, color: 'blue' },
                    { name: 'USDT TRC', enabled: paymentSettings.usdtTrc20Enabled, color: 'emerald' },
                    { name: 'USDT ERC', enabled: paymentSettings.usdtErc20Enabled, color: 'emerald' },
                    { name: 'USDT BEP', enabled: paymentSettings.usdtBep20Enabled, color: 'yellow' },
                    { name: 'SOL', enabled: paymentSettings.solEnabled, color: 'purple' },
                    { name: 'Banco', enabled: paymentSettings.bankTransferEnabled, color: 'blue' },
                  ].map((m, i) => (
                    <div key={i} className={`p-3 rounded-lg text-center ${m.enabled ? `bg-${m.color}-500/20 border border-${m.color}-500/30` : 'bg-gray-800/50 border border-gray-700'}`}>
                      <div className={`text-sm font-bold ${m.enabled ? `text-${m.color}-400` : 'text-gray-500'}`}>{m.name}</div>
                      <div className={`text-xs ${m.enabled ? 'text-emerald-400' : 'text-gray-600'}`}>{m.enabled ? 'Activo' : 'Inactivo'}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Marketing */}
          {currentView === 'marketing' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-purple-400">{platformSettings.welcomeBonus}%</div><div className="text-xs text-gray-500">Bono Bienvenida</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-emerald-400">${platformSettings.referralBonus}</div><div className="text-xs text-gray-500">Bono Referido</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-yellow-400">12</div><div className="text-xs text-gray-500">Campañas Activas</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-blue-400">$15,420</div><div className="text-xs text-gray-500">Bonos Otorgados</div></div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-400" />Configuración de Bonos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div><label className="text-xs text-gray-500 mb-1 block">Bono de Bienvenida (%)</label><input type="number" value={platformSettings.welcomeBonus} onChange={(e) => setPlatformSettings(s => ({ ...s, welcomeBonus: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Bono por Referido ($)</label><input type="number" value={platformSettings.referralBonus} onChange={(e) => setPlatformSettings(s => ({ ...s, referralBonus: parseInt(e.target.value) }))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                </div>
                <button className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium">Guardar Cambios</button>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Megaphone className="w-5 h-5 text-yellow-400" />Campañas Promocionales</h3>
                <div className="space-y-3">
                  {[{ name: 'Bono Navidad 2025', status: 'active', users: 234 }, { name: 'Cashback Semanal', status: 'active', users: 156 }, { name: 'Torneo Año Nuevo', status: 'upcoming', users: 0 }].map((c, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                      <div><div className="font-medium text-sm">{c.name}</div><div className="text-xs text-gray-500">{c.users} usuarios</div></div>
                      <span className={`px-2 py-1 rounded-full text-xs ${c.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{c.status === 'active' ? 'Activa' : 'Próxima'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Reports */}
          {currentView === 'reports' && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-3 gap-4">
                {[{ title: 'Reporte Diario', desc: 'Resumen de operaciones', icon: Calendar }, { title: 'Reporte Financiero', desc: 'Balance y transacciones', icon: DollarSign }, { title: 'Reporte de Usuarios', desc: 'Actividad y registros', icon: Users }].map((r, i) => (
                  <button key={i} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6 text-left hover:border-purple-500/30 transition-all">
                    <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4"><r.icon className="w-6 h-6 text-purple-400" /></div>
                    <h3 className="font-bold mb-1">{r.title}</h3>
                    <p className="text-xs text-gray-500 mb-3">{r.desc}</p>
                    <div className="flex items-center gap-2 text-purple-400 text-sm"><Download className="w-4 h-4" />Descargar</div>
                  </button>
                ))}
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4">Generar Reporte Personalizado</h3>
                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div><label className="text-xs text-gray-500 mb-1 block">Fecha Inicio</label><input type="date" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Fecha Fin</label><input type="date" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Tipo</label><select className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option>Todos</option><option>Financiero</option><option>Usuarios</option><option>Trading</option></select></div>
                </div>
                <button className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium flex items-center gap-2"><Download className="w-4 h-4" />Generar</button>
              </div>
            </div>
          )}

          {/* Security */}
          {currentView === 'security' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-emerald-400">156</div><div className="text-xs text-gray-500">Logins Hoy</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-red-400">3</div><div className="text-xs text-gray-500">Intentos Fallidos</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-yellow-400">2</div><div className="text-xs text-gray-500">IPs Bloqueadas</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-purple-400">98%</div><div className="text-xs text-gray-500">Uptime</div></div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20"><h3 className="font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" />Registro de Auditoría</h3></div>
                <div className="divide-y divide-purple-900/10 max-h-[400px] overflow-y-auto">
                  {auditLogs.map(log => (
                    <div key={log.id} className="p-4 flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${log.type === 'login' ? 'bg-emerald-500/20' : log.type === 'security' ? 'bg-red-500/20' : 'bg-purple-500/20'}`}>
                        {log.type === 'login' ? <User className="w-4 h-4 text-emerald-400" /> : log.type === 'security' ? <AlertTriangle className="w-4 h-4 text-red-400" /> : <Activity className="w-4 h-4 text-purple-400" />}
                      </div>
                      <div className="flex-1"><div className="font-medium text-sm">{log.action}</div><div className="text-xs text-gray-500">{log.details}</div><div className="text-xs text-gray-600 mt-1">{log.user} • {log.ip} • {log.timestamp}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Support */}
          {currentView === 'support' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-yellow-400">8</div><div className="text-xs text-gray-500">Tickets Abiertos</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-emerald-400">45</div><div className="text-xs text-gray-500">Resueltos Hoy</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-purple-400">2.5h</div><div className="text-xs text-gray-500">Tiempo Promedio</div></div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20"><div className="text-2xl font-bold text-blue-400">4.8</div><div className="text-xs text-gray-500">Satisfacción</div></div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20"><h3 className="font-bold flex items-center gap-2"><MessageSquare className="w-5 h-5 text-purple-400" />Tickets Recientes</h3></div>
                <div className="divide-y divide-purple-900/10">
                  {[{ id: 'TKT-001', user: 'Juan Pérez', subject: 'Problema con retiro', status: 'open', priority: 'high' }, { id: 'TKT-002', user: 'María García', subject: 'Verificación KYC', status: 'pending', priority: 'medium' }, { id: 'TKT-003', user: 'Carlos López', subject: 'Consulta sobre bonos', status: 'open', priority: 'low' }].map(t => (
                    <div key={t.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${t.priority === 'high' ? 'bg-red-500' : t.priority === 'medium' ? 'bg-yellow-500' : 'bg-green-500'}`} />
                        <div><div className="font-medium text-sm">{t.subject}</div><div className="text-xs text-gray-500">{t.id} • {t.user}</div></div>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${t.status === 'open' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-blue-500/20 text-blue-400'}`}>{t.status === 'open' ? 'Abierto' : 'Pendiente'}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Notifications */}
          {currentView === 'notifications' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Centro de Notificaciones</h2>
                <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Nueva Notificación</button>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4">Enviar Notificación Masiva</h3>
                <div className="space-y-4">
                  <div><label className="text-xs text-gray-500 mb-1 block">Título</label><input type="text" placeholder="Título de la notificación" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  <div><label className="text-xs text-gray-500 mb-1 block">Mensaje</label><textarea placeholder="Contenido del mensaje..." className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-24 resize-none" /></div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 mb-1 block">Destinatarios</label><select className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option>Todos los usuarios</option><option>Usuarios activos</option><option>Usuarios VIP</option></select></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Canal</label><select className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option>Push + Email</option><option>Solo Push</option><option>Solo Email</option></select></div>
                  </div>
                  <button className="px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium">Enviar Notificación</button>
                </div>
              </div>
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20"><h3 className="font-bold flex items-center gap-2"><Bell className="w-5 h-5 text-purple-400" />Notificaciones Enviadas</h3></div>
                <div className="divide-y divide-purple-900/10">
                  {[{ title: 'Mantenimiento programado', date: '2025-12-25 10:00', recipients: 1250 }, { title: 'Nuevo torneo disponible', date: '2025-12-24 15:30', recipients: 890 }, { title: 'Actualización de términos', date: '2025-12-23 09:00', recipients: 1250 }].map((n, i) => (
                    <div key={i} className="p-4 flex items-center justify-between">
                      <div><div className="font-medium text-sm">{n.title}</div><div className="text-xs text-gray-500">{n.date}</div></div>
                      <span className="text-xs text-gray-400">{n.recipients} destinatarios</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Chat Interno */}
          {currentView === 'chat' && (
            <div className="h-[calc(100vh-200px)] flex bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
              <div className="w-64 border-r border-purple-900/20 flex flex-col">
                <div className="p-4 border-b border-purple-900/20">
                  <h3 className="font-bold text-sm">Contactos</h3>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chatContacts.map(contact => (
                    <button key={contact.id} onClick={() => setSelectedChatContact(contact)} className={`w-full p-3 flex items-center gap-3 hover:bg-[#1a1625] transition-colors ${selectedChatContact?.id === contact.id ? 'bg-[#1a1625]' : ''}`}>
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contact.role === 'admin' ? 'bg-purple-500/20' : contact.role === 'operator' ? 'bg-blue-500/20' : contact.role === 'accountant' ? 'bg-emerald-500/20' : 'bg-cyan-500/20'}`}>
                          <User className={`w-5 h-5 ${contact.role === 'admin' ? 'text-purple-400' : contact.role === 'operator' ? 'text-blue-400' : contact.role === 'accountant' ? 'text-emerald-400' : 'text-cyan-400'}`} />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#13111c] ${contact.online ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="font-medium text-sm truncate">{contact.name}</div>
                        <div className="text-xs text-gray-500 truncate">{contact.lastMessage}</div>
                      </div>
                      {contact.unread > 0 && <span className="px-2 py-0.5 bg-purple-500 rounded-full text-xs">{contact.unread}</span>}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex-1 flex flex-col">
                {selectedChatContact ? (
                  <>
                    <div className="p-4 border-b border-purple-900/20 flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChatContact.role === 'operator' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                        <User className={`w-5 h-5 ${selectedChatContact.role === 'operator' ? 'text-blue-400' : 'text-purple-400'}`} />
                      </div>
                      <div>
                        <div className="font-medium">{selectedChatContact.name}</div>
                        <div className="text-xs text-gray-500">{selectedChatContact.online ? 'En línea' : 'Desconectado'}</div>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                      {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] px-4 py-2 rounded-2xl ${msg.isMe ? 'bg-purple-600 rounded-br-md' : 'bg-[#1a1625] rounded-bl-md'}`}>
                            <p className="text-sm">{msg.message}</p>
                            <span className="text-[10px] text-gray-400 mt-1 block">{msg.timestamp}</span>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-purple-900/20">
                      <div className="flex gap-2">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe un mensaje..." className="flex-1 bg-[#1a1625] border border-purple-900/30 rounded-xl px-4 py-2 text-sm focus:border-purple-500/50 focus:outline-none" />
                        <button onClick={handleSendMessage} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-xl"><Send className="w-5 h-5" /></button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>Selecciona un contacto para chatear</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* KYC Management */}
          {currentView === 'kyc' && !selectedKYC && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold">Verificación KYC</h2>
                <div className="flex gap-2">
                  <span className="px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">{kycRequests.filter(k => k.status === 'pending').length} Pendientes</span>
                </div>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {kycRequests.map(kyc => (
                  <div key={kyc.id} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center font-bold">{kyc.userName.charAt(0)}</div>
                      <div>
                        <div className="font-medium">{kyc.userName}</div>
                        <div className="text-xs text-gray-500">{kyc.odId}</div>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm mb-4">
                      <div className="flex justify-between"><span className="text-gray-500">Documento:</span><span>{kyc.documentType === 'passport' ? 'Pasaporte' : kyc.documentType === 'id_card' ? 'DNI' : 'Licencia'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">País:</span><span>{kyc.country}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Enviado:</span><span>{kyc.submittedAt}</span></div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs ${kyc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : kyc.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{kyc.status === 'pending' ? 'Pendiente' : kyc.status === 'approved' ? 'Aprobado' : 'Rechazado'}</span>
                      <button onClick={() => setSelectedKYC(kyc)} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium flex items-center gap-1"><Eye className="w-3 h-3" />Revisar</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* KYC Detail */}
          {currentView === 'kyc' && selectedKYC && (
            <div className="space-y-4">
              <button onClick={() => { setSelectedKYC(null); setKycNotes(''); }} className="flex items-center gap-2 text-gray-400 hover:text-white"><X className="w-4 h-4" />Volver</button>
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Documentos</h3>
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="bg-[#1a1625] rounded-xl p-4 text-center">
                        <Image className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                        <div className="text-xs text-gray-500">Frente del documento</div>
                        <button className="mt-2 text-xs text-purple-400">Ver imagen</button>
                      </div>
                      <div className="bg-[#1a1625] rounded-xl p-4 text-center">
                        <Image className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                        <div className="text-xs text-gray-500">Reverso del documento</div>
                        <button className="mt-2 text-xs text-purple-400">Ver imagen</button>
                      </div>
                      <div className="bg-[#1a1625] rounded-xl p-4 text-center">
                        <Image className="w-12 h-12 mx-auto mb-2 text-gray-500" />
                        <div className="text-xs text-gray-500">Selfie con documento</div>
                        <button className="mt-2 text-xs text-purple-400">Ver imagen</button>
                      </div>
                    </div>
                  </div>
                  {selectedKYC.status === 'pending' && (
                    <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                      <h3 className="font-bold mb-4">Notas (requerido para rechazo)</h3>
                      <textarea value={kycNotes} onChange={(e) => setKycNotes(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="Razón del rechazo o notas adicionales..." />
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Información</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between"><span className="text-gray-500">Usuario:</span><span>{selectedKYC.userName}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">ID:</span><span>{selectedKYC.odId}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Email:</span><span>{selectedKYC.email}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">País:</span><span>{selectedKYC.country}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Documento:</span><span>{selectedKYC.documentType === 'passport' ? 'Pasaporte' : selectedKYC.documentType === 'id_card' ? 'DNI' : 'Licencia'}</span></div>
                      <div className="flex justify-between"><span className="text-gray-500">Enviado:</span><span>{selectedKYC.submittedAt}</span></div>
                    </div>
                  </div>
                  {selectedKYC.status === 'pending' && (
                    <div className="space-y-2">
                      <button onClick={() => handleApproveKYCRequest(selectedKYC.id)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 rounded-xl font-medium flex items-center justify-center gap-2"><CheckCircle className="w-5 h-5" />Aprobar KYC</button>
                      <button onClick={() => handleRejectKYCRequest(selectedKYC.id)} className="w-full py-3 bg-red-600 hover:bg-red-700 rounded-xl font-medium flex items-center justify-center gap-2"><XCircle className="w-5 h-5" />Rechazar KYC</button>
                    </div>
                  )}
                  {selectedKYC.status !== 'pending' && (
                    <div className={`p-4 rounded-xl ${selectedKYC.status === 'approved' ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}>
                      <div className="flex items-center gap-2">
                        {selectedKYC.status === 'approved' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                        <span className={selectedKYC.status === 'approved' ? 'text-emerald-400' : 'text-red-400'}>{selectedKYC.status === 'approved' ? 'Aprobado' : 'Rechazado'}</span>
                      </div>
                      {selectedKYC.notes && <p className="text-xs text-gray-400 mt-2">{selectedKYC.notes}</p>}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Settings */}
          {currentView === 'settings' && (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2 bg-[#13111c] rounded-xl p-1">
                {[
                  { id: 'profile' as SettingsTab, label: 'Perfil', icon: User },
                  { id: 'security' as SettingsTab, label: 'Seguridad', icon: Shield },
                  { id: 'sessions' as SettingsTab, label: 'Sesiones', icon: Monitor },
                  { id: 'notifications' as SettingsTab, label: 'Notificaciones', icon: Bell },
                  { id: 'appearance' as SettingsTab, label: 'Apariencia', icon: Eye },
                  { id: 'api' as SettingsTab, label: 'API Keys', icon: Key },
                  { id: 'activity' as SettingsTab, label: 'Actividad', icon: Activity }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`px-4 py-2 rounded-lg text-sm font-medium transition flex items-center gap-2 ${settingsTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>

              {settingsTab === 'profile' && (
                <div className="space-y-4">
                  {/* Avatar and basic info */}
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center gap-6 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center text-white text-4xl font-bold">
                          {(user?.first_name?.[0] || 'A').toUpperCase()}
                        </div>
                        <button className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 rounded-full">
                          <Edit className="w-4 h-4 text-white" />
                        </button>
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{user?.first_name} {user?.last_name}</h3>
                        <p className="text-gray-400">Administrador</p>
                        <p className="text-emerald-500 text-sm mt-1">● En línea</p>
                      </div>
                    </div>
                    <h4 className="font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-purple-400" />Información Personal</h4>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div><label className="text-xs text-gray-500 mb-1 block">Nombre</label><input type="text" value={profileData.firstName || user?.first_name || ''} onChange={(e) => setProfileData({...profileData, firstName: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Apellido</label><input type="text" value={profileData.lastName || user?.last_name || ''} onChange={(e) => setProfileData({...profileData, lastName: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Email</label><input type="email" value={profileData.email || user?.email || ''} onChange={(e) => setProfileData({...profileData, email: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Teléfono</label><input type="tel" value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Zona Horaria</label>
                        <select value={profileData.timezone} onChange={(e) => setProfileData({...profileData, timezone: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                          <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                          <option value="America/Bogota">Bogotá (GMT-5)</option>
                          <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                          <option value="Europe/Madrid">Madrid (GMT+1)</option>
                          <option value="America/New_York">Nueva York (GMT-5)</option>
                        </select>
                      </div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Idioma</label>
                        <select value={profileData.language} onChange={(e) => setProfileData({...profileData, language: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                          <option value="es">Español</option>
                          <option value="en">English</option>
                          <option value="pt">Português</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-xs text-gray-500 mb-1 block">Biografía / Descripción</label>
                      <textarea value={profileData.bio} onChange={(e) => setProfileData({...profileData, bio: e.target.value})} rows={3} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm resize-none" placeholder="Cuéntanos sobre ti..." />
                    </div>
                    <button onClick={() => showToast('Perfil actualizado', 'success')} className="mt-4 px-4 py-2 bg-purple-600 rounded-lg text-sm font-medium">Guardar Cambios</button>
                  </div>
                </div>
              )}

              {settingsTab === 'security' && (
                <div className="space-y-4">
                  {/* Change Password */}
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold flex items-center gap-2"><Lock className="w-5 h-5 text-purple-400" />Cambiar Contraseña</h3>
                        <p className="text-xs text-gray-500 mt-1">Última actualización: hace 30 días</p>
                      </div>
                      <button onClick={() => setShowChangePassword(!showChangePassword)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm">
                        {showChangePassword ? 'Cancelar' : 'Cambiar'}
                      </button>
                    </div>
                    {showChangePassword && (
                      <div className="space-y-4 pt-4 border-t border-purple-900/20">
                        <div><label className="text-xs text-gray-500 mb-1 block">Contraseña Actual</label><input type="password" value={passwordData.current} onChange={(e) => setPasswordData({...passwordData, current: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">Nueva Contraseña</label><input type="password" value={passwordData.new} onChange={(e) => setPasswordData({...passwordData, new: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <div><label className="text-xs text-gray-500 mb-1 block">Confirmar Contraseña</label><input type="password" value={passwordData.confirm} onChange={(e) => setPasswordData({...passwordData, confirm: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                        <button onClick={() => { handleChangePassword(); setShowChangePassword(false); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium">Actualizar Contraseña</button>
                      </div>
                    )}
                  </div>

                  {/* Two Factor Authentication */}
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold flex items-center gap-2"><Smartphone className="w-5 h-5 text-purple-400" />Autenticación de Dos Factores (2FA)</h3>
                        <p className="text-xs text-gray-500 mt-1">Añade una capa extra de seguridad a tu cuenta</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded text-xs ${twoFactorEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                          {twoFactorEnabled ? 'Activo' : 'Inactivo'}
                        </span>
                        <button onClick={() => setShowTwoFactorSetup(true)} className="px-4 py-2 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-sm">
                          {twoFactorEnabled ? 'Configurar' : 'Activar'}
                        </button>
                      </div>
                    </div>
                    {twoFactorEnabled && (
                      <div className="pt-4 border-t border-purple-900/20">
                        <p className="text-gray-400 text-sm mb-2">Códigos de respaldo disponibles: 8/10</p>
                        <button className="text-purple-400 text-sm hover:underline">Ver códigos de respaldo</button>
                      </div>
                    )}
                  </div>

                  {/* Security Questions */}
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" />Preguntas de Seguridad</h3>
                    <div className="space-y-3">
                      {securityQuestions.map((sq, i) => (
                        <div key={i} className="p-3 bg-[#1a1625] rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm">{sq.question}</p>
                            <p className="text-gray-500 text-xs">Respuesta: {sq.answer}</p>
                          </div>
                          <button className="text-purple-400 text-sm hover:underline">Editar</button>
                        </div>
                      ))}
                      <button onClick={() => setSecurityQuestions([...securityQuestions, { question: 'Nueva pregunta', answer: '••••••••' }])} className="text-purple-400 text-sm flex items-center gap-1"><Plus className="w-4 h-4" /> Añadir pregunta</button>
                    </div>
                  </div>

                  {/* Login History */}
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Clock className="w-5 h-5 text-purple-400" />Historial de Inicios de Sesión</h3>
                    <div className="space-y-2">
                      {loginHistory.map((login) => (
                        <div key={login.id} className="p-3 bg-[#1a1625] rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm">{login.device}</p>
                            <p className="text-gray-500 text-xs">{login.date} • {login.ip} • {login.location}</p>
                          </div>
                          {login.current && <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded">Actual</span>}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trusted Devices */}
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Monitor className="w-5 h-5 text-purple-400" />Dispositivos de Confianza</h3>
                    <div className="space-y-3">
                      {trustedDevices.map(device => (
                        <div key={device.id} className="p-3 bg-[#1a1625] rounded-lg flex items-center justify-between">
                          <div>
                            <p className="text-sm">{device.name}</p>
                            <p className="text-gray-500 text-xs">Último uso: {device.lastUsed}</p>
                          </div>
                          <button onClick={() => setTrustedDevices(trustedDevices.filter(d => d.id !== device.id))} className="text-red-400 text-sm hover:underline">Eliminar</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'sessions' && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Monitor className="w-5 h-5 text-purple-400" />Sesiones Activas</h3>
                  <div className="space-y-3">
                    {sessions.map(session => (
                      <div key={session.id} className={`p-4 rounded-xl flex items-center justify-between ${session.current ? 'bg-purple-500/10 border border-purple-500/30' : 'bg-[#1a1625]'}`}>
                        <div className="flex items-center gap-3">
                          <Monitor className="w-8 h-8 text-gray-400" />
                          <div>
                            <div className="font-medium text-sm flex items-center gap-2">{session.device} {session.current && <span className="px-2 py-0.5 bg-purple-500/20 text-purple-400 rounded text-xs">Actual</span>}</div>
                            <div className="text-xs text-gray-500">{session.browser} • {session.ip}</div>
                            <div className="text-xs text-gray-500">{session.location} • {session.lastActive}</div>
                          </div>
                        </div>
                        {!session.current && <button onClick={() => handleTerminateSession(session.id)} className="px-3 py-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-xs">Cerrar</button>}
                      </div>
                    ))}
                  </div>
                  <button onClick={() => showToast('Todas las sesiones cerradas', 'success')} className="mt-4 px-4 py-2 bg-red-600 rounded-lg text-sm font-medium">Cerrar Todas las Sesiones</button>
                </div>
              )}

              {settingsTab === 'api' && (
                <div className="space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold flex items-center gap-2"><Key className="w-5 h-5 text-purple-400" />API Keys</h3>
                        <p className="text-sm text-gray-500">Genera claves API para integrar con sistemas externos</p>
                      </div>
                      <button onClick={() => { setApiKeys([...apiKeys, { id: Date.now(), name: 'Nueva Key', key: `sk_${Date.now().toString(36)}_****************************`, created: new Date().toISOString().split('T')[0], lastUsed: '-', permissions: ['read'], active: true }]); showToast('Nueva API Key generada', 'success'); }} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Nueva Key</button>
                    </div>
                    <div className="space-y-3">
                      {apiKeys.map(apiKey => (
                        <div key={apiKey.id} className="p-4 bg-[#1a1625] rounded-xl">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${apiKey.active ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                              <div className="font-medium text-sm">{apiKey.name}</div>
                            </div>
                            <div className="flex gap-2">
                              <button className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg"><Eye className="w-4 h-4 text-purple-400" /></button>
                              <button onClick={() => { setApiKeys(apiKeys.map(k => k.id === apiKey.id ? {...k, active: !k.active} : k)); showToast(apiKey.active ? 'Key desactivada' : 'Key activada', 'success'); }} className="p-2 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg"><Ban className="w-4 h-4 text-yellow-400" /></button>
                              <button onClick={() => { setApiKeys(apiKeys.filter(k => k.id !== apiKey.id)); showToast('API Key eliminada', 'success'); }} className="p-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 font-mono mb-2">{apiKey.key}</div>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>Creada: {apiKey.created}</span>
                            <span>Último uso: {apiKey.lastUsed}</span>
                            <span>Permisos: {apiKey.permissions.join(', ')}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Server className="w-5 h-5 text-purple-400" />Webhooks</h3>
                    <p className="text-sm text-gray-500 mb-4">Configura endpoints para recibir notificaciones de eventos</p>
                    <div className="p-4 bg-[#1a1625] rounded-xl flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">Endpoint Principal</div>
                        <div className="text-xs text-gray-500 font-mono">https://api.example.com/webhooks</div>
                      </div>
                      <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-xs rounded">Activo</span>
                    </div>
                    <button className="mt-4 px-4 py-2 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-sm flex items-center gap-2"><Plus className="w-4 h-4" />Añadir Webhook</button>
                  </div>
                </div>
              )}

              {settingsTab === 'notifications' && (
                <div className="space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Bell className="w-5 h-5 text-purple-400" />Canales de Notificación</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                        <div>
                          <p className="text-sm">Notificaciones en la app</p>
                          <p className="text-gray-500 text-xs">Recibir notificaciones dentro de la plataforma</p>
                        </div>
                        <div className="w-11 h-6 rounded-full bg-emerald-600 relative"><div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5" /></div>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                        <div>
                          <p className="text-sm">Notificaciones por email</p>
                          <p className="text-gray-500 text-xs">Recibir resúmenes y alertas por correo</p>
                        </div>
                        <button onClick={() => setEmailNotifications(!emailNotifications)} className={`w-11 h-6 rounded-full relative transition ${emailNotifications ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${emailNotifications ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                        <div>
                          <p className="text-sm">Notificaciones push (escritorio)</p>
                          <p className="text-gray-500 text-xs">Alertas del navegador cuando hay nuevos eventos</p>
                        </div>
                        <button onClick={() => setPushNotifications(!pushNotifications)} className={`w-11 h-6 rounded-full relative transition ${pushNotifications ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${pushNotifications ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                        <div>
                          <p className="text-sm">Sonidos</p>
                          <p className="text-gray-500 text-xs">Reproducir sonido con las notificaciones</p>
                        </div>
                        <button onClick={() => setSoundEnabled(!soundEnabled)} className={`w-11 h-6 rounded-full relative transition ${soundEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                          <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${soundEnabled ? 'right-0.5' : 'left-0.5'}`} />
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Tipos de Notificación</h3>
                    <div className="space-y-3">
                      {Object.entries(notificationPrefs).map(([key, enabled]) => (
                        <div key={key} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                          <p className="text-sm">{key === 'newUsers' ? 'Nuevos usuarios' : key === 'deposits' ? 'Depósitos' : key === 'withdrawals' ? 'Retiros' : key === 'kycRequests' ? 'Solicitudes KYC' : key === 'securityAlerts' ? 'Alertas de seguridad' : key === 'systemUpdates' ? 'Actualizaciones del sistema' : 'Reportes de marketing'}</p>
                          <button onClick={() => setNotificationPrefs({...notificationPrefs, [key]: !enabled})} className={`w-11 h-6 rounded-full relative transition ${enabled ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${enabled ? 'right-0.5' : 'left-0.5'}`} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'appearance' && (
                <div className="space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Eye className="w-5 h-5 text-purple-400" />Tema</h3>
                    <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                      <div className="flex items-center gap-3">
                        {darkMode ? <Globe className="w-5 h-5 text-purple-400" /> : <Globe className="w-5 h-5 text-yellow-400" />}
                        <div>
                          <p className="text-sm">Modo Oscuro</p>
                          <p className="text-gray-500 text-xs">Cambiar entre tema claro y oscuro</p>
                        </div>
                      </div>
                      <button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full relative transition ${darkMode ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                        <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${darkMode ? 'right-0.5' : 'left-0.5'}`} />
                      </button>
                    </div>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Color de Acento</h3>
                    <div className="flex gap-3">
                      {['purple', 'blue', 'emerald', 'rose', 'amber'].map(color => (
                        <button key={color} className={`w-10 h-10 rounded-full bg-${color}-600 hover:ring-2 hover:ring-${color}-400 hover:ring-offset-2 hover:ring-offset-[#13111c] transition`} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4">Densidad de la Interfaz</h3>
                    <div className="flex gap-3">
                      {['Compacta', 'Normal', 'Espaciada'].map(density => (
                        <button key={density} className={`px-4 py-2 rounded-lg text-sm ${density === 'Normal' ? 'bg-purple-600' : 'bg-[#1a1625] hover:bg-[#252035]'}`}>{density}</button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {settingsTab === 'activity' && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Registro de Actividad</h3>
                    <button className="px-3 py-1.5 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-xs flex items-center gap-2"><Download className="w-4 h-4" />Exportar</button>
                  </div>
                  <div className="space-y-2">
                    {activityLog.map(log => (
                      <div key={log.id} className="p-3 bg-[#1a1625] rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-full flex items-center justify-center">
                            <Activity className="w-4 h-4 text-purple-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium">{log.action}</p>
                            <p className="text-gray-500 text-xs">{log.details}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-400">{log.timestamp}</p>
                          <p className="text-xs text-gray-500">{log.ip}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="mt-4 w-full py-2 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-sm text-gray-400">Cargar más actividad</button>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* User Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</h2>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Nombre *</label><input type="text" value={editingUser?.name || newUser.name} onChange={(e) => editingUser ? setEditingUser({...editingUser, name: e.target.value}) : setNewUser({...newUser, name: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Email *</label><input type="email" value={editingUser?.email || newUser.email} onChange={(e) => editingUser ? setEditingUser({...editingUser, email: e.target.value}) : setNewUser({...newUser, email: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Teléfono</label><input type="tel" value={editingUser?.phone || newUser.phone} onChange={(e) => editingUser ? setEditingUser({...editingUser, phone: e.target.value}) : setNewUser({...newUser, phone: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">País</label><input type="text" value={editingUser?.country || newUser.country} onChange={(e) => editingUser ? setEditingUser({...editingUser, country: e.target.value}) : setNewUser({...newUser, country: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              {!editingUser && <div><label className="text-xs text-gray-500 mb-1 block">Balance Inicial</label><input type="number" value={newUser.balance} onChange={(e) => setNewUser({...newUser, balance: parseFloat(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowUserModal(false); setEditingUser(null); setNewUser({ name: '', email: '', phone: '', country: '', balance: 0 }); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={editingUser ? handleUpdateUser : handleCreateUser} className="flex-1 py-2 bg-purple-600 rounded-lg text-sm font-medium">{editingUser ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Staff Modal */}
      {showStaffModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">{editingStaff ? 'Editar Staff' : 'Nuevo Staff'}</h2>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Nombre *</label><input type="text" value={editingStaff?.name || newStaff.name} onChange={(e) => editingStaff ? setEditingStaff({...editingStaff, name: e.target.value}) : setNewStaff({...newStaff, name: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Email *</label><input type="email" value={editingStaff?.email || newStaff.email} onChange={(e) => editingStaff ? setEditingStaff({...editingStaff, email: e.target.value}) : setNewStaff({...newStaff, email: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Rol *</label>
                <select value={editingStaff?.role || newStaff.role} onChange={(e) => editingStaff ? setEditingStaff({...editingStaff, role: e.target.value as StaffMember['role']}) : setNewStaff({...newStaff, role: e.target.value as StaffMember['role']})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                  <option value="admin">Administrador</option>
                  <option value="operator">Operador</option>
                  <option value="accountant">Contador</option>
                  <option value="support">Soporte</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowStaffModal(false); setEditingStaff(null); setNewStaff({ name: '', email: '', role: 'operator', permissions: [] }); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={editingStaff ? handleUpdateStaff : handleCreateStaff} className="flex-1 py-2 bg-purple-600 rounded-lg text-sm font-medium">{editingStaff ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Tournament Modal */}
      {showTournamentModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">{editingTournament ? 'Editar Torneo' : 'Nuevo Torneo'}</h2>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Nombre *</label><input type="text" value={editingTournament?.name || newTournament.name} onChange={(e) => editingTournament ? setEditingTournament({...editingTournament, name: e.target.value}) : setNewTournament({...newTournament, name: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500 mb-1 block">Premio ($) *</label><input type="number" value={editingTournament?.prize || newTournament.prize} onChange={(e) => editingTournament ? setEditingTournament({...editingTournament, prize: parseFloat(e.target.value)}) : setNewTournament({...newTournament, prize: parseFloat(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Entry Fee ($)</label><input type="number" value={editingTournament?.entryFee || newTournament.entryFee} onChange={(e) => editingTournament ? setEditingTournament({...editingTournament, entryFee: parseFloat(e.target.value)}) : setNewTournament({...newTournament, entryFee: parseFloat(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
              <div><label className="text-xs text-gray-500 mb-1 block">Máx. Participantes</label><input type="number" value={editingTournament?.maxParticipants || newTournament.maxParticipants} onChange={(e) => editingTournament ? setEditingTournament({...editingTournament, maxParticipants: parseInt(e.target.value)}) : setNewTournament({...newTournament, maxParticipants: parseInt(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs text-gray-500 mb-1 block">Inicio</label><input type="datetime-local" value={editingTournament?.startTime || newTournament.startTime} onChange={(e) => editingTournament ? setEditingTournament({...editingTournament, startTime: e.target.value}) : setNewTournament({...newTournament, startTime: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                <div><label className="text-xs text-gray-500 mb-1 block">Fin</label><input type="datetime-local" value={editingTournament?.endTime || newTournament.endTime} onChange={(e) => editingTournament ? setEditingTournament({...editingTournament, endTime: e.target.value}) : setNewTournament({...newTournament, endTime: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowTournamentModal(false); setEditingTournament(null); setNewTournament({ name: '', prize: 0, entryFee: 0, maxParticipants: 50, startTime: '', endTime: '' }); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={editingTournament ? handleUpdateTournament : handleCreateTournament} className="flex-1 py-2 bg-purple-600 rounded-lg text-sm font-medium">{editingTournament ? 'Guardar' : 'Crear'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-purple-400" />Ajustar Balance</h2>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Usuario</label>
                <select value={balanceAdjustment.userId} onChange={(e) => setBalanceAdjustment({...balanceAdjustment, userId: parseInt(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                  <option value={0}>Seleccionar usuario</option>
                  {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.odId}) - ${u.balance}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tipo de Ajuste</label>
                <div className="flex gap-2">
                  <button onClick={() => setBalanceAdjustment({...balanceAdjustment, type: 'add'})} className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAdjustment.type === 'add' ? 'bg-emerald-600' : 'bg-[#1a1625]'}`}>Agregar</button>
                  <button onClick={() => setBalanceAdjustment({...balanceAdjustment, type: 'subtract'})} className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAdjustment.type === 'subtract' ? 'bg-red-600' : 'bg-[#1a1625]'}`}>Restar</button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Monto ($)</label>
                <input type="number" value={balanceAdjustment.amount || ''} onChange={(e) => setBalanceAdjustment({...balanceAdjustment, amount: parseFloat(e.target.value) || 0})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Razón *</label>
                <textarea value={balanceAdjustment.reason} onChange={(e) => setBalanceAdjustment({...balanceAdjustment, reason: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Motivo del ajuste..." />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowBalanceModal(false); setBalanceAdjustment({ userId: 0, amount: 0, reason: '', type: 'add' }); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={handleBalanceAdjustment} className={`flex-1 py-2 rounded-lg text-sm font-medium ${balanceAdjustment.type === 'add' ? 'bg-emerald-600' : 'bg-red-600'}`}>{balanceAdjustment.type === 'add' ? 'Agregar' : 'Restar'} Balance</button>
            </div>
          </div>
        </div>
      )}

      {/* 2FA Setup Modal */}
      {showTwoFactorSetup && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Smartphone className="w-5 h-5 text-purple-400" />Configurar 2FA</h2>
              <button onClick={() => setShowTwoFactorSetup(false)} className="p-1.5 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="bg-[#1a1625] rounded-xl p-4 text-center">
                <div className="w-32 h-32 bg-white mx-auto rounded-lg flex items-center justify-center mb-3">
                  <div className="text-black text-xs">QR Code</div>
                </div>
                <p className="text-xs text-gray-500">Escanea este código con tu app de autenticación</p>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">O ingresa este código manualmente:</label>
                <div className="flex items-center gap-2">
                  <input type="text" value="JBSWY3DPEHPK3PXP" readOnly className="flex-1 bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  <button onClick={() => showToast('Código copiado', 'success')} className="p-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg"><FileText className="w-4 h-4 text-purple-400" /></button>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Código de verificación</label>
                <input type="text" placeholder="000000" maxLength={6} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-center tracking-widest" />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTwoFactorSetup(false)} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={() => { setTwoFactorEnabled(true); setShowTwoFactorSetup(false); showToast('2FA activado correctamente', 'success'); }} className="flex-1 py-2 bg-purple-600 rounded-lg text-sm font-medium">Activar 2FA</button>
            </div>
          </div>
        </div>
      )}

      {/* Asset Modal */}
      {showAssetModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-2xl w-full p-6 my-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />{editingAsset ? 'Editar Activo' : 'Nuevo Activo'}</h2>
              <button onClick={() => { setShowAssetModal(false); setEditingAsset(null); }} className="p-1.5 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Símbolo *</label>
                  <input type="text" value={editingAsset?.symbol || newAsset.symbol} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, symbol: e.target.value}) : setNewAsset({...newAsset, symbol: e.target.value})} placeholder="BTC/USDT" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                  <input type="text" value={editingAsset?.name || newAsset.name} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, name: e.target.value}) : setNewAsset({...newAsset, name: e.target.value})} placeholder="Bitcoin" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Categoría</label>
                  <select value={editingAsset?.category || newAsset.category} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, category: e.target.value as TradingAsset['category']}) : setNewAsset({...newAsset, category: e.target.value as TradingAsset['category']})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                    <option value="crypto">Crypto</option>
                    <option value="forex">Forex</option>
                    <option value="commodities">Commodities</option>
                    <option value="stocks">Stocks</option>
                    <option value="indices">Indices</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Payout (%)</label>
                  <input type="number" min="70" max="95" value={editingAsset?.payout || newAsset.payout} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, payout: Number(e.target.value)}) : setNewAsset({...newAsset, payout: Number(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Inversión Mínima ($)</label>
                  <input type="number" value={editingAsset?.minInvestment || newAsset.minInvestment} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, minInvestment: Number(e.target.value)}) : setNewAsset({...newAsset, minInvestment: Number(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Inversión Máxima ($)</label>
                  <input type="number" value={editingAsset?.maxInvestment || newAsset.maxInvestment} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, maxInvestment: Number(e.target.value)}) : setNewAsset({...newAsset, maxInvestment: Number(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Spread</label>
                  <input type="number" step="0.01" value={editingAsset?.spread || newAsset.spread} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, spread: Number(e.target.value)}) : setNewAsset({...newAsset, spread: Number(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">Volatilidad</label>
                  <select value={editingAsset?.volatility || newAsset.volatility} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, volatility: e.target.value as TradingAsset['volatility']}) : setNewAsset({...newAsset, volatility: e.target.value as TradingAsset['volatility']})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Horario de Trading</label>
                <input type="text" value={editingAsset?.tradingHours || newAsset.tradingHours} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, tradingHours: e.target.value}) : setNewAsset({...newAsset, tradingHours: e.target.value})} placeholder="24/7 o Lun-Vie 00:00-23:59" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">Tiempos de Expiración (segundos, separados por coma)</label>
                <input type="text" value={(editingAsset?.expirationTimes || newAsset.expirationTimes)?.join(', ')} onChange={(e) => { const times = e.target.value.split(',').map(t => parseInt(t.trim())).filter(t => !isNaN(t)); editingAsset ? setEditingAsset({...editingAsset, expirationTimes: times}) : setNewAsset({...newAsset, expirationTimes: times}); }} placeholder="60, 120, 300, 900" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" />
              </div>
              {/* API Configuration */}
              <div className="border-t border-purple-900/20 pt-4 mt-2">
                <h4 className="text-sm font-medium text-purple-400 mb-3 flex items-center gap-2"><Server className="w-4 h-4" />Configuración de API</h4>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">Fuente de Datos (API) *</label>
                    <select value={editingAsset?.apiSource || newAsset.apiSource} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, apiSource: e.target.value}) : setNewAsset({...newAsset, apiSource: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                      <option value="binance">Binance</option>
                      <option value="tradingview">TradingView</option>
                      <option value="alphavantage">Alpha Vantage</option>
                      <option value="coinmarketcap">CoinMarketCap</option>
                      <option value="polygon">Polygon.io</option>
                      <option value="finnhub">Finnhub</option>
                      <option value="custom">Personalizado</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">API Key / Identificador</label>
                    <input type="text" value={editingAsset?.apiKey || newAsset.apiKey} onChange={(e) => editingAsset ? setEditingAsset({...editingAsset, apiKey: e.target.value}) : setNewAsset({...newAsset, apiKey: e.target.value})} placeholder="api_key_xxxxx" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2">La API Key se genera automáticamente si se deja vacía. Formato: {'{fuente}_{símbolo}'}</p>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                <div>
                  <div className="text-sm font-medium">Estado del Activo</div>
                  <div className="text-xs text-gray-500">Habilitar para que los usuarios puedan operar</div>
                </div>
                <button onClick={() => editingAsset ? setEditingAsset({...editingAsset, enabled: !editingAsset.enabled}) : setNewAsset({...newAsset, enabled: !newAsset.enabled})} className={`w-11 h-6 rounded-full relative transition ${(editingAsset?.enabled ?? newAsset.enabled) ? 'bg-emerald-600' : 'bg-gray-600'}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition ${(editingAsset?.enabled ?? newAsset.enabled) ? 'right-0.5' : 'left-0.5'}`} />
                </button>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAssetModal(false); setEditingAsset(null); setNewAsset({ symbol: '', name: '', category: 'crypto', payout: 85, enabled: true, tradingHours: '24/7', minInvestment: 1, maxInvestment: 5000, expirationTimes: [60, 300, 900], spread: 0.1, volatility: 'medium', popularity: 50, apiSource: 'binance', apiKey: '' }); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={editingAsset ? handleUpdateAsset : handleCreateAsset} className="flex-1 py-2 bg-purple-600 rounded-lg text-sm font-medium">{editingAsset ? 'Guardar Cambios' : 'Crear Activo'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

 import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import {
  DollarSign, CheckCircle, XCircle, Clock, AlertTriangle, User, CreditCard,
  Bell, Settings, LogOut, Shield, TrendingUp, TrendingDown, Activity,
  BarChart3, Search, Menu, X, Download, FileText, Users,
  ArrowUpCircle, ArrowDownCircle, Trophy, Calendar, RefreshCw,
  Eye, Wallet, PieChart, Check, Ban, MessageSquare, Send, Lock,
  Smartphone, Key, History, Monitor, Trash2, Plus, Camera,
  Mail, Volume2, Moon, Calculator, Receipt, Percent, Edit, Save,
  UserX, UserCheck, AlertOctagon
} from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend, Filler);

// Types
interface WithdrawalRequest {
  id: number; odId: string; userName: string; userEmail: string; amount: number;
  method: string; network: string; walletAddress: string;
  status: 'pending' | 'approved' | 'rejected' | 'processing';
  createdAt: string; userBalance: number; userTotalDeposits: number; userTotalWithdrawals: number;
}

interface DepositRequest {
  id: number; odId: string; userName: string; userEmail: string; amount: number;
  method: string; network: string; txHash: string;
  status: 'pending' | 'confirmed' | 'rejected'; createdAt: string;
}

interface TournamentPrize {
  id: number; odId: string; odName: string; tournamentName: string;
  position: number; prizeAmount: number; status: 'pending' | 'paid'; tournamentEndDate: string;
}

interface AuditLog {
  id: number; action: string; details: string; user: string; timestamp: string;
  type: 'approval' | 'rejection' | 'adjustment' | 'system';
}

type ViewType = 'dashboard' | 'withdrawals' | 'deposits' | 'tournaments' | 'users' | 'reports' | 'audit' | 'chat' | 'commissions' | 'reconciliation' | 'invoices' | 'settings';
type SettingsTab = 'profile' | 'security' | 'notifications' | 'limits' | 'privacy';

interface ChatMessage {
  id: number; from: string; fromRole: string; message: string; timestamp: string; isMe: boolean; attachment?: string;
}

interface ChatContact {
  id: number; name: string; role: string; online: boolean; unread: number;
}

interface Session {
  id: number; device: string; browser: string; location: string; ip: string; lastActive: string; current: boolean;
}

interface LoginHistory {
  id: number; date: string; device: string; location: string; ip: string; status: 'success' | 'failed';
}

interface TrustedDevice {
  id: number; name: string; type: string; addedAt: string; lastUsed: string;
}

interface Commission {
  id: number; type: string; amount: number; percentage: number; source: string; date: string;
}

interface Invoice {
  id: number; number: string; client: string; amount: number; status: 'pending' | 'paid' | 'overdue'; date: string; dueDate: string; description?: string;
}

interface Reconciliation {
  id: number; date: string; expected: number; actual: number; difference: number; status: 'matched' | 'discrepancy' | 'pending'; notes?: string;
}

interface UserFinancial {
  id: number; odId: string; name: string; email: string; balance: number; totalDeposits: number; totalWithdrawals: number; lastActivity: string; status: 'active' | 'suspended';
}

interface UserTransaction {
  id: number; type: 'deposit' | 'withdrawal' | 'prize' | 'adjustment'; amount: number; date: string; status: string; details: string;
}

interface SuspiciousAlert {
  id: number; userId: string; userName: string; type: string; amount: number; reason: string; timestamp: string; reviewed: boolean;
}


// Mock Data
const MOCK_WITHDRAWALS: WithdrawalRequest[] = [
  { id: 1, odId: 'USR001', userName: 'Juan Pérez', userEmail: 'juan@email.com', amount: 500, method: 'USDT', network: 'TRC-20', walletAddress: 'TXyz...abc123', status: 'pending', createdAt: '2025-12-25 10:30', userBalance: 5420, userTotalDeposits: 8000, userTotalWithdrawals: 2500 },
  { id: 2, odId: 'USR002', userName: 'María García', userEmail: 'maria@email.com', amount: 1200, method: 'BTC', network: 'Bitcoin', walletAddress: 'bc1q...xyz789', status: 'pending', createdAt: '2025-12-25 09:15', userBalance: 12350, userTotalDeposits: 15000, userTotalWithdrawals: 3000 },
  { id: 3, odId: 'USR003', userName: 'Carlos López', userEmail: 'carlos@email.com', amount: 300, method: 'ETH', network: 'ERC-20', walletAddress: '0x123...def456', status: 'approved', createdAt: '2025-12-24 16:45', userBalance: 890, userTotalDeposits: 2000, userTotalWithdrawals: 1100 },
  { id: 4, odId: 'USR004', userName: 'Ana Martínez', userEmail: 'ana@email.com', amount: 2000, method: 'USDT', network: 'BEP-20', walletAddress: '0xabc...789xyz', status: 'rejected', createdAt: '2025-12-24 14:20', userBalance: 3200, userTotalDeposits: 5000, userTotalWithdrawals: 1800 },
  { id: 5, odId: 'USR005', userName: 'Pedro Sánchez', userEmail: 'pedro@email.com', amount: 750, method: 'SOL', network: 'Solana', walletAddress: 'Sol...abc', status: 'processing', createdAt: '2025-12-25 08:00', userBalance: 2100, userTotalDeposits: 3500, userTotalWithdrawals: 1400 },
];

const MOCK_DEPOSITS: DepositRequest[] = [
  { id: 1, odId: 'USR006', userName: 'Luis Rodríguez', userEmail: 'luis@email.com', amount: 1000, method: 'USDT', network: 'TRC-20', txHash: '0x1234...abcd', status: 'pending', createdAt: '2025-12-25 11:00' },
  { id: 2, odId: 'USR007', userName: 'Carmen Díaz', userEmail: 'carmen@email.com', amount: 500, method: 'BTC', network: 'Bitcoin', txHash: 'bc1tx...5678', status: 'pending', createdAt: '2025-12-25 10:45' },
  { id: 3, odId: 'USR001', userName: 'Juan Pérez', userEmail: 'juan@email.com', amount: 2000, method: 'ETH', network: 'ERC-20', txHash: '0xeth...9999', status: 'confirmed', createdAt: '2025-12-24 15:30' },
];

const MOCK_PRIZES: TournamentPrize[] = [
  { id: 1, odId: 'USR008', odName: 'TradingKing', tournamentName: 'Weekly Challenge', position: 1, prizeAmount: 2500, status: 'pending', tournamentEndDate: '2025-12-24' },
  { id: 2, odId: 'USR009', odName: 'BullRunner', tournamentName: 'Weekly Challenge', position: 2, prizeAmount: 1000, status: 'pending', tournamentEndDate: '2025-12-24' },
  { id: 3, odId: 'USR010', odName: 'ProfitMaster', tournamentName: 'Speed Trading', position: 1, prizeAmount: 4250, status: 'paid', tournamentEndDate: '2025-12-23' },
];

const MOCK_AUDIT: AuditLog[] = [
  { id: 1, action: 'Retiro Aprobado', details: 'Retiro de $300 para USR003', user: 'Contador', timestamp: '2025-12-24 16:50', type: 'approval' },
  { id: 2, action: 'Retiro Rechazado', details: 'Retiro de $2000 para USR004 - Balance insuficiente', user: 'Contador', timestamp: '2025-12-24 14:25', type: 'rejection' },
  { id: 3, action: 'Depósito Confirmado', details: 'Depósito de $2000 para USR001', user: 'Sistema', timestamp: '2025-12-24 15:35', type: 'system' },
];

const MOCK_CHAT: ChatMessage[] = [
  { id: 1, from: 'Admin Principal', fromRole: 'admin', message: 'Buenos días, hay un retiro grande pendiente de revisión', timestamp: '09:30', isMe: false },
  { id: 2, from: 'Yo', fromRole: 'accountant', message: 'Lo reviso ahora mismo', timestamp: '09:32', isMe: true },
  { id: 3, from: 'Operador Juan', fromRole: 'operator', message: 'El usuario USR001 pregunta por su retiro', timestamp: '10:15', isMe: false },
];

const MOCK_SESSIONS: Session[] = [
  { id: 1, device: 'Windows PC', browser: 'Chrome 120', location: 'Madrid, España', ip: '192.168.1.100', lastActive: 'Ahora', current: true },
  { id: 2, device: 'iPhone 15', browser: 'Safari Mobile', location: 'Madrid, España', ip: '192.168.1.101', lastActive: 'Hace 2 horas', current: false },
];

const MOCK_LOGIN_HISTORY: LoginHistory[] = [
  { id: 1, date: '2025-12-25 08:30', device: 'Windows PC', location: 'Madrid, España', ip: '192.168.1.100', status: 'success' },
  { id: 2, date: '2025-12-24 18:45', device: 'iPhone 15', location: 'Madrid, España', ip: '192.168.1.101', status: 'success' },
  { id: 3, date: '2025-12-24 12:00', device: 'Unknown', location: 'Barcelona, España', ip: '10.0.0.50', status: 'failed' },
];

const MOCK_TRUSTED_DEVICES: TrustedDevice[] = [
  { id: 1, name: 'PC Oficina', type: 'desktop', addedAt: '2025-11-01', lastUsed: '2025-12-25' },
  { id: 2, name: 'iPhone Personal', type: 'mobile', addedAt: '2025-11-15', lastUsed: '2025-12-24' },
];

const MOCK_COMMISSIONS: Commission[] = [
  { id: 1, type: 'Trading', amount: 1250, percentage: 0.1, source: 'Operaciones del día', date: '2025-12-25' },
  { id: 2, type: 'Retiros', amount: 450, percentage: 1.5, source: 'Comisión por retiro', date: '2025-12-25' },
  { id: 3, type: 'Torneos', amount: 800, percentage: 5, source: 'Entry fees', date: '2025-12-24' },
];

const MOCK_INVOICES: Invoice[] = [
  { id: 1, number: 'INV-2025-001', client: 'Proveedor Liquidez A', amount: 15000, status: 'paid', date: '2025-12-01', dueDate: '2025-12-15', description: 'Servicios de liquidez mensual' },
  { id: 2, number: 'INV-2025-002', client: 'Servicios Cloud', amount: 2500, status: 'pending', date: '2025-12-20', dueDate: '2026-01-05', description: 'Hosting y servidores' },
  { id: 3, number: 'INV-2025-003', client: 'Marketing Digital', amount: 5000, status: 'overdue', date: '2025-11-15', dueDate: '2025-12-01', description: 'Campaña publicitaria Q4' },
  { id: 4, number: 'INV-2025-004', client: 'Consultoría Legal', amount: 3500, status: 'pending', date: '2025-12-22', dueDate: '2026-01-10', description: 'Asesoría legal trimestral' },
  { id: 5, number: 'INV-2025-005', client: 'Proveedor KYC', amount: 1200, status: 'paid', date: '2025-12-10', dueDate: '2025-12-25', description: 'Verificación de usuarios' },
  { id: 6, number: 'INV-2025-006', client: 'Seguridad IT', amount: 4500, status: 'pending', date: '2025-12-28', dueDate: '2026-01-15', description: 'Auditoría de seguridad' },
];

const MOCK_RECONCILIATION: Reconciliation[] = [
  { id: 1, date: '2025-12-25', expected: 125000, actual: 125000, difference: 0, status: 'matched', notes: 'Conciliación automática exitosa' },
  { id: 2, date: '2025-12-24', expected: 118500, actual: 118450, difference: -50, status: 'discrepancy', notes: 'Pendiente revisión de comisiones' },
  { id: 3, date: '2025-12-23', expected: 112000, actual: 112000, difference: 0, status: 'matched' },
  { id: 4, date: '2025-12-22', expected: 108000, actual: 108150, difference: 150, status: 'matched', notes: 'Ajuste por redondeo' },
  { id: 5, date: '2025-12-21', expected: 105000, actual: 104800, difference: -200, status: 'discrepancy' },
  { id: 6, date: '2025-12-20', expected: 102000, actual: 102000, difference: 0, status: 'matched' },
  { id: 7, date: '2025-12-19', expected: 98500, actual: 98500, difference: 0, status: 'pending' },
];

const MOCK_USERS_FINANCIAL: UserFinancial[] = [
  { id: 1, odId: 'USR001', name: 'Juan Pérez', email: 'juan@email.com', balance: 5420, totalDeposits: 8000, totalWithdrawals: 2500, lastActivity: '2025-12-25 10:30', status: 'active' },
  { id: 2, odId: 'USR002', name: 'María García', email: 'maria@email.com', balance: 12350, totalDeposits: 15000, totalWithdrawals: 3000, lastActivity: '2025-12-25 09:15', status: 'active' },
  { id: 3, odId: 'USR003', name: 'Carlos López', email: 'carlos@email.com', balance: 890, totalDeposits: 2000, totalWithdrawals: 1100, lastActivity: '2025-12-24 16:45', status: 'active' },
  { id: 4, odId: 'USR004', name: 'Ana Martínez', email: 'ana@email.com', balance: 3200, totalDeposits: 5000, totalWithdrawals: 1800, lastActivity: '2025-12-24 14:20', status: 'suspended' },
];

const MOCK_USER_TRANSACTIONS: UserTransaction[] = [
  { id: 1, type: 'deposit', amount: 1000, date: '2025-12-25 10:30', status: 'confirmed', details: 'USDT TRC-20' },
  { id: 2, type: 'withdrawal', amount: 500, date: '2025-12-24 15:20', status: 'approved', details: 'BTC' },
  { id: 3, type: 'prize', amount: 250, date: '2025-12-23 18:00', status: 'paid', details: 'Torneo Semanal - 3er lugar' },
  { id: 4, type: 'deposit', amount: 2000, date: '2025-12-22 09:15', status: 'confirmed', details: 'ETH ERC-20' },
  { id: 5, type: 'adjustment', amount: -50, date: '2025-12-21 14:00', status: 'applied', details: 'Corrección de error' },
];

const MOCK_CHAT_CONTACTS: ChatContact[] = [
  { id: 1, name: 'Admin Principal', role: 'admin', online: true, unread: 2 },
  { id: 2, name: 'Operador Juan', role: 'operator', online: true, unread: 0 },
  { id: 3, name: 'Soporte María', role: 'support', online: false, unread: 1 },
  { id: 4, name: 'Operador Carlos', role: 'operator', online: true, unread: 0 },
];

const MOCK_SUSPICIOUS_ALERTS: SuspiciousAlert[] = [
  { id: 1, userId: 'USR002', userName: 'María García', type: 'Retiro Grande', amount: 5000, reason: 'Retiro superior al promedio del usuario', timestamp: '2025-12-25 11:30', reviewed: false },
  { id: 2, userId: 'USR005', userName: 'Pedro Sánchez', type: 'Múltiples Retiros', amount: 2250, reason: '3 retiros en menos de 1 hora', timestamp: '2025-12-25 10:15', reviewed: false },
  { id: 3, userId: 'USR001', userName: 'Juan Pérez', type: 'Patrón Inusual', amount: 1500, reason: 'Depósito seguido de retiro inmediato', timestamp: '2025-12-24 16:00', reviewed: true },
];


export default function AccountantPanel() {
  const { user, logout } = useAuthContext();
  const navigate = useNavigate();
  const chatEndRef = useRef<HTMLDivElement>(null);

  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [settingsTab, setSettingsTab] = useState<SettingsTab>('profile');
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(MOCK_WITHDRAWALS);
  const [deposits, setDeposits] = useState<DepositRequest[]>(MOCK_DEPOSITS);
  const [prizes, setPrizes] = useState<TournamentPrize[]>(MOCK_PRIZES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(MOCK_AUDIT);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(MOCK_CHAT);
  const [chatContacts] = useState<ChatContact[]>(MOCK_CHAT_CONTACTS);
  const [selectedChatContact, setSelectedChatContact] = useState<ChatContact | null>(MOCK_CHAT_CONTACTS[0]);
  const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);
  const [loginHistory] = useState<LoginHistory[]>(MOCK_LOGIN_HISTORY);
  const [suspiciousAlerts, setSuspiciousAlerts] = useState<SuspiciousAlert[]>(MOCK_SUSPICIOUS_ALERTS);
  const [userTransactions] = useState<UserTransaction[]>(MOCK_USER_TRANSACTIONS);
  const [trustedDevices, setTrustedDevices] = useState<TrustedDevice[]>(MOCK_TRUSTED_DEVICES);
  const [commissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [invoices, setInvoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [reconciliations, setReconciliations] = useState<Reconciliation[]>(MOCK_RECONCILIATION);
  const [usersFinancial, setUsersFinancial] = useState<UserFinancial[]>(MOCK_USERS_FINANCIAL);
  const [invoiceFilter, setInvoiceFilter] = useState<'all' | 'pending' | 'paid' | 'overdue'>('all');
  const [reconciliationFilter, setReconciliationFilter] = useState<'all' | 'matched' | 'discrepancy' | 'pending'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<WithdrawalRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState<WithdrawalRequest | null>(null);
  const [withdrawalFilter, setWithdrawalFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'processing'>('pending');
  const [depositFilter, setDepositFilter] = useState<'all' | 'pending' | 'confirmed' | 'rejected'>('pending');
  const [searchQuery, setSearchQuery] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [darkMode, setDarkMode] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserFinancial | null>(null);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [showUserHistoryModal, setShowUserHistoryModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showReconciliationModal, setShowReconciliationModal] = useState(false);
  const [auditFilter, setAuditFilter] = useState<'all' | 'approval' | 'rejection' | 'adjustment' | 'system'>('all');
  const [auditSearch, setAuditSearch] = useState('');
  const [reconciliationNotes, setReconciliationNotes] = useState('');
  const [selectedReconciliation, setSelectedReconciliation] = useState<Reconciliation | null>(null);
  const [newInvoice, setNewInvoice] = useState({ number: '', client: '', amount: '', dueDate: '', description: '' });
  
  // Settings states
  const [profile, setProfile] = useState({
    firstName: user?.first_name || 'Contador',
    lastName: user?.last_name || 'Principal',
    email: user?.email || 'contador@tormentus.com',
    phone: '+34 612 345 678',
    timezone: 'Europe/Madrid',
    language: 'es',
    bio: 'Contador principal de la plataforma'
  });
  const [security, setSecurity] = useState({
    twoFactorEnabled: false,
    twoFactorMethod: 'app',
    securityQuestion1: '¿Nombre de tu primera mascota?',
    securityAnswer1: '',
    securityQuestion2: '¿Ciudad donde naciste?',
    securityAnswer2: ''
  });
  const [notifications, setNotifications] = useState({
    emailNewWithdrawal: true,
    emailLargeTransaction: true,
    emailDailyReport: true,
    pushNewWithdrawal: true,
    pushUrgent: true,
    soundEnabled: true,
    largeTransactionThreshold: 1000
  });
  const [limits, setLimits] = useState({
    dailyWithdrawalLimit: 5000,
    singleTransactionLimit: 2000,
    requireApprovalAbove: 1000,
    autoApproveBelow: 100
  });

  const stats = {
    totalDeposits: 125000, totalWithdrawals: 89000,
    pendingWithdrawals: withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0),
    pendingDeposits: deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0),
    platformBalance: 36000, todayVolume: 15420, weeklyProfit: 8500, monthlyProfit: 32000
  };

  useEffect(() => {
    if (notification) { const timer = setTimeout(() => setNotification(null), 3000); return () => clearTimeout(timer); }
  }, [notification]);

  const showToast = (message: string, type: 'success' | 'error') => setNotification({ message, type });
  const handleLogout = () => { logout(); navigate('/'); };

  const addAuditLog = (action: string, details: string, type: AuditLog['type']) => {
    setAuditLogs(prev => [{ id: Date.now(), action, details, user: user?.first_name || 'Contador', timestamp: new Date().toLocaleString('es-ES'), type }, ...prev]);
  };

  const handleApproveWithdrawal = (w: WithdrawalRequest) => setShowConfirmModal(w);
  const confirmApprove = () => {
    if (showConfirmModal) {
      setWithdrawals(prev => prev.map(w => w.id === showConfirmModal.id ? { ...w, status: 'processing' as const } : w));
      addAuditLog('Retiro Aprobado', `Retiro de $${showConfirmModal.amount} para ${showConfirmModal.odId}`, 'approval');
      showToast(`Retiro de $${showConfirmModal.amount} aprobado`, 'success');
      setShowConfirmModal(null);
    }
  };
  const confirmReject = () => {
    if (selectedWithdrawal && rejectReason) {
      setWithdrawals(prev => prev.map(w => w.id === selectedWithdrawal.id ? { ...w, status: 'rejected' as const } : w));
      addAuditLog('Retiro Rechazado', `${selectedWithdrawal.odId} - ${rejectReason}`, 'rejection');
      showToast('Retiro rechazado', 'success');
      setSelectedWithdrawal(null); setRejectReason('');
    }
  };
  const handleConfirmDeposit = (d: DepositRequest) => {
    setDeposits(prev => prev.map(dep => dep.id === d.id ? { ...dep, status: 'confirmed' as const } : dep));
    addAuditLog('Depósito Confirmado', `$${d.amount} para ${d.odId}`, 'system');
    showToast(`Depósito confirmado`, 'success');
  };
  const handlePayPrize = (p: TournamentPrize) => {
    setPrizes(prev => prev.map(pr => pr.id === p.id ? { ...pr, status: 'paid' as const } : pr));
    addAuditLog('Premio Pagado', `$${p.prizeAmount} para ${p.odName}`, 'approval');
    showToast(`Premio pagado`, 'success');
  };

  const filteredWithdrawals = withdrawals.filter(w => (withdrawalFilter === 'all' || w.status === withdrawalFilter) && (w.userName.toLowerCase().includes(searchQuery.toLowerCase()) || w.odId.toLowerCase().includes(searchQuery.toLowerCase())));
  const filteredDeposits = deposits.filter(d => (depositFilter === 'all' || d.status === depositFilter) && (d.userName.toLowerCase().includes(searchQuery.toLowerCase()) || d.odId.toLowerCase().includes(searchQuery.toLowerCase())));

  const menuItems = [
    { id: 'dashboard' as ViewType, icon: BarChart3, label: 'Dashboard' },
    { id: 'withdrawals' as ViewType, icon: ArrowUpCircle, label: 'Retiros', badge: withdrawals.filter(w => w.status === 'pending').length },
    { id: 'deposits' as ViewType, icon: ArrowDownCircle, label: 'Depósitos', badge: deposits.filter(d => d.status === 'pending').length },
    { id: 'tournaments' as ViewType, icon: Trophy, label: 'Premios', badge: prizes.filter(p => p.status === 'pending').length },
    { id: 'users' as ViewType, icon: Users, label: 'Usuarios' },
    { id: 'commissions' as ViewType, icon: Percent, label: 'Comisiones' },
    { id: 'invoices' as ViewType, icon: Receipt, label: 'Facturas' },
    { id: 'reconciliation' as ViewType, icon: Calculator, label: 'Conciliación' },
    { id: 'reports' as ViewType, icon: FileText, label: 'Reportes' },
    { id: 'audit' as ViewType, icon: Shield, label: 'Auditoría' },
    { id: 'chat' as ViewType, icon: MessageSquare, label: 'Chat Interno' },
    { id: 'settings' as ViewType, icon: Settings, label: 'Configuración' },
  ];

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;
    const msg: ChatMessage = { id: Date.now(), from: 'Yo', fromRole: 'accountant', message: newMessage, timestamp: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }), isMe: true };
    setChatMessages(prev => [...prev, msg]);
    setNewMessage('');
    setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleCloseSession = (sessionId: number) => { setSessions(prev => prev.filter(s => s.id !== sessionId)); showToast('Sesión cerrada', 'success'); };
  const handleRemoveTrustedDevice = (deviceId: number) => { setTrustedDevices(prev => prev.filter(d => d.id !== deviceId)); showToast('Dispositivo eliminado', 'success'); };
  const handleAdjustBalance = () => {
    if (!selectedUser || !adjustAmount || !adjustReason) return;
    const amount = parseFloat(adjustAmount);
    setUsersFinancial(prev => prev.map(u => u.id === selectedUser.id ? { ...u, balance: u.balance + amount } : u));
    addAuditLog('Ajuste de Balance', `${amount > 0 ? '+' : ''}$${amount} para ${selectedUser.odId} - ${adjustReason}`, 'adjustment');
    showToast(`Balance ajustado: ${amount > 0 ? '+' : ''}$${amount}`, 'success');
    setShowAdjustModal(false); setAdjustAmount(''); setAdjustReason(''); setSelectedUser(null);
  };
  const handleMarkInvoicePaid = (invoiceId: number) => { setInvoices(prev => prev.map(inv => inv.id === invoiceId ? { ...inv, status: 'paid' as const } : inv)); showToast('Factura marcada como pagada', 'success'); };
  
  const handleToggleUserStatus = (userId: number) => {
    setUsersFinancial(prev => prev.map(u => u.id === userId ? { ...u, status: u.status === 'active' ? 'suspended' as const : 'active' as const } : u));
    const usr = usersFinancial.find(u => u.id === userId);
    addAuditLog(usr?.status === 'active' ? 'Usuario Suspendido' : 'Usuario Activado', `${usr?.odId} - ${usr?.name}`, 'system');
    showToast(`Usuario ${usr?.status === 'active' ? 'suspendido' : 'activado'}`, 'success');
  };

  const handleCreateInvoice = () => {
    if (!newInvoice.number || !newInvoice.client || !newInvoice.amount) return;
    const inv: Invoice = {
      id: Date.now(), number: newInvoice.number, client: newInvoice.client,
      amount: parseFloat(newInvoice.amount), status: 'pending',
      date: new Date().toISOString().split('T')[0], dueDate: newInvoice.dueDate,
      description: newInvoice.description
    };
    setInvoices(prev => [inv, ...prev]);
    setNewInvoice({ number: '', client: '', amount: '', dueDate: '', description: '' });
    setShowInvoiceModal(false);
    showToast('Factura creada', 'success');
  };

  const handleSendReminder = (inv: Invoice) => {
    showToast(`Recordatorio enviado a ${inv.client}`, 'success');
    addAuditLog('Recordatorio Enviado', `Factura ${inv.number} - ${inv.client}`, 'system');
  };

  const handleResolveReconciliation = () => {
    if (!selectedReconciliation || !reconciliationNotes) return;
    setReconciliations(prev => prev.map(r => r.id === selectedReconciliation.id ? { ...r, status: 'matched' as const, notes: reconciliationNotes } : r));
    addAuditLog('Discrepancia Resuelta', `${selectedReconciliation.date} - ${reconciliationNotes}`, 'adjustment');
    showToast('Discrepancia resuelta', 'success');
    setSelectedReconciliation(null);
    setReconciliationNotes('');
  };

  const handleMarkAlertReviewed = (alertId: number) => {
    setSuspiciousAlerts(prev => prev.map(a => a.id === alertId ? { ...a, reviewed: true } : a));
    showToast('Alerta marcada como revisada', 'success');
  };

  const handleExportAuditLogs = () => {
    const data = filteredAuditLogs.map(l => `${l.timestamp},${l.action},${l.details},${l.user},${l.type}`).join('\n');
    const blob = new Blob([`Fecha,Acción,Detalles,Usuario,Tipo\n${data}`], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'audit_logs.csv'; a.click();
    showToast('Logs exportados', 'success');
  };

  const handleExportUserData = (usr: UserFinancial) => {
    const data = `ID: ${usr.odId}\nNombre: ${usr.name}\nEmail: ${usr.email}\nBalance: $${usr.balance}\nDepósitos: $${usr.totalDeposits}\nRetiros: $${usr.totalWithdrawals}\nÚltima Actividad: ${usr.lastActivity}\nEstado: ${usr.status}`;
    const blob = new Blob([data], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `usuario_${usr.odId}.txt`; a.click();
    showToast('Datos exportados', 'success');
  };

  // Chart data
  const trendChartData = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      { label: 'Depósitos', data: [12000, 15000, 8000, 22000, 18000, 25000, 20000], borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
      { label: 'Retiros', data: [8000, 10000, 6000, 15000, 12000, 18000, 14000], borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
    ]
  };
  const trendChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(139, 92, 246, 0.1)' } } } };

  const commissionChartData = { labels: ['Trading', 'Retiros', 'Torneos', 'Otros'], datasets: [{ data: [1250, 450, 800, 200], backgroundColor: ['#10b981', '#8b5cf6', '#f59e0b', '#3b82f6'], borderWidth: 0 }] };
  const filteredAuditLogs = auditLogs.filter(l => (auditFilter === 'all' || l.type === auditFilter) && (l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.details.toLowerCase().includes(auditSearch.toLowerCase())));
  const filteredUsers = usersFinancial.filter(u => u.name.toLowerCase().includes(searchQuery.toLowerCase()) || u.odId.toLowerCase().includes(searchQuery.toLowerCase()));


  return (
    <div className="min-h-screen bg-[#0d0b14] flex">
      {notification && (
        <div className={`fixed top-4 right-4 px-4 py-3 rounded-xl text-sm font-medium z-[100] flex items-center gap-2 ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
          {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
          {notification.message}
        </div>
      )}

      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/60 z-40" onClick={() => setSidebarOpen(false)} />}

      {/* Sidebar */}
      <aside className={`fixed lg:static inset-y-0 left-0 w-64 bg-[#13111c] border-r border-purple-900/20 flex flex-col z-50 transform transition-transform lg:transform-none ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 border-b border-purple-900/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="font-bold text-lg">TORMENTUS</span>
                <div className="text-[10px] text-emerald-400">Panel Contador</div>
              </div>
            </div>
            <button className="lg:hidden p-1" onClick={() => setSidebarOpen(false)}><X className="w-5 h-5" /></button>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setCurrentView(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${currentView === item.id ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white hover:bg-[#1a1625]'}`}>
              <div className="flex items-center gap-3"><item.icon className="w-5 h-5" />{item.label}</div>
              {item.badge && item.badge > 0 && <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${currentView === item.id ? 'bg-white/20' : 'bg-red-500 text-white'}`}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div className="p-3 border-t border-purple-900/20">
          <div className="flex items-center gap-3 p-2">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center"><User className="w-5 h-5" /></div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{user?.first_name} {user?.last_name}</div>
              <div className="text-xs text-emerald-400">Contador</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full mt-2 flex items-center gap-2 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-lg text-sm"><LogOut className="w-4 h-4" />Cerrar Sesión</button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-[#13111c] border-b border-purple-900/20 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 hover:bg-[#1a1625] rounded-lg" onClick={() => setSidebarOpen(true)}><Menu className="w-5 h-5" /></button>
            <h1 className="text-lg font-bold">{currentView === 'dashboard' ? 'Dashboard Financiero' : menuItems.find(m => m.id === currentView)?.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 hover:bg-[#1a1625] rounded-lg relative"><Bell className="w-5 h-5 text-gray-400" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
            <button className="p-2 hover:bg-[#1a1625] rounded-lg"><RefreshCw className="w-5 h-5 text-gray-400" /></button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">

          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div className="space-y-6">
              {/* Stats principales */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center"><TrendingUp className="w-5 h-5 text-emerald-400" /></div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />+12.5%</span>
                  </div>
                  <div className="text-2xl font-bold text-emerald-400">${stats.totalDeposits.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Depósitos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><TrendingDown className="w-5 h-5 text-red-400" /></div>
                    <span className="text-xs text-red-400 flex items-center gap-1"><TrendingDown className="w-3 h-3" />-8.3%</span>
                  </div>
                  <div className="text-2xl font-bold text-red-400">${stats.totalWithdrawals.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Retiros</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center"><Clock className="w-5 h-5 text-yellow-400" /></div>
                    <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">{withdrawals.filter(w => w.status === 'pending').length} pendientes</span>
                  </div>
                  <div className="text-2xl font-bold text-yellow-400">${stats.pendingWithdrawals.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Retiros Pendientes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center"><Wallet className="w-5 h-5 text-purple-400" /></div>
                    <span className="text-xs text-emerald-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" />Saludable</span>
                  </div>
                  <div className="text-2xl font-bold text-purple-400">${stats.platformBalance.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Balance Plataforma</div>
                </div>
              </div>

              {/* Acciones Rápidas */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                <h2 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-purple-400" />Acciones Rápidas</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button onClick={() => setCurrentView('withdrawals')} className="p-4 bg-[#1a1625] hover:bg-[#252035] rounded-xl text-center transition">
                    <ArrowUpCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <div className="text-sm font-medium">Procesar Retiros</div>
                    <div className="text-xs text-gray-500">{withdrawals.filter(w => w.status === 'pending').length} pendientes</div>
                  </button>
                  <button onClick={() => setCurrentView('deposits')} className="p-4 bg-[#1a1625] hover:bg-[#252035] rounded-xl text-center transition">
                    <ArrowDownCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                    <div className="text-sm font-medium">Confirmar Depósitos</div>
                    <div className="text-xs text-gray-500">{deposits.filter(d => d.status === 'pending').length} pendientes</div>
                  </button>
                  <button onClick={() => setCurrentView('tournaments')} className="p-4 bg-[#1a1625] hover:bg-[#252035] rounded-xl text-center transition">
                    <Trophy className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                    <div className="text-sm font-medium">Pagar Premios</div>
                    <div className="text-xs text-gray-500">{prizes.filter(p => p.status === 'pending').length} pendientes</div>
                  </button>
                  <button onClick={() => setCurrentView('reconciliation')} className="p-4 bg-[#1a1625] hover:bg-[#252035] rounded-xl text-center transition">
                    <Calculator className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm font-medium">Conciliación</div>
                    <div className="text-xs text-gray-500">{reconciliations.filter(r => r.status === 'discrepancy').length} discrepancias</div>
                  </button>
                </div>
              </div>

              {/* Listas de pendientes */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                  <div className="p-4 border-b border-purple-900/20 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><ArrowUpCircle className="w-5 h-5 text-red-400" />Retiros Pendientes</h2>
                    <button onClick={() => setCurrentView('withdrawals')} className="text-xs text-emerald-400 hover:underline">Ver todos →</button>
                  </div>
                  <div className="divide-y divide-purple-900/10">
                    {withdrawals.filter(w => w.status === 'pending').slice(0, 4).map(w => (
                      <div key={w.id} className="p-3 flex items-center justify-between hover:bg-[#1a1625]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-red-500/20 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-red-400" /></div>
                          <div>
                            <div className="font-medium text-sm">{w.userName}</div>
                            <div className="text-xs text-gray-500">{w.method} • {w.createdAt}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-red-400">${w.amount}</div>
                          <div className="flex gap-1 mt-1">
                            <button onClick={() => handleApproveWithdrawal(w)} className="p-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded"><Check className="w-3 h-3 text-emerald-400" /></button>
                            <button onClick={() => setSelectedWithdrawal(w)} className="p-1 bg-red-500/20 hover:bg-red-500/30 rounded"><Ban className="w-3 h-3 text-red-400" /></button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {withdrawals.filter(w => w.status === 'pending').length === 0 && (
                      <div className="p-6 text-center text-gray-500 text-sm">No hay retiros pendientes</div>
                    )}
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                  <div className="p-4 border-b border-purple-900/20 flex justify-between items-center">
                    <h2 className="font-bold flex items-center gap-2"><ArrowDownCircle className="w-5 h-5 text-emerald-400" />Depósitos Pendientes</h2>
                    <button onClick={() => setCurrentView('deposits')} className="text-xs text-emerald-400 hover:underline">Ver todos →</button>
                  </div>
                  <div className="divide-y divide-purple-900/10">
                    {deposits.filter(d => d.status === 'pending').slice(0, 4).map(d => (
                      <div key={d.id} className="p-3 flex items-center justify-between hover:bg-[#1a1625]/50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-emerald-400" /></div>
                          <div>
                            <div className="font-medium text-sm">{d.userName}</div>
                            <div className="text-xs text-gray-500">{d.method} • {d.createdAt}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-400">+${d.amount}</div>
                          <button onClick={() => handleConfirmDeposit(d)} className="mt-1 p-1 bg-emerald-500/20 hover:bg-emerald-500/30 rounded"><Check className="w-3 h-3 text-emerald-400" /></button>
                        </div>
                      </div>
                    ))}
                    {deposits.filter(d => d.status === 'pending').length === 0 && (
                      <div className="p-6 text-center text-gray-500 text-sm">No hay depósitos pendientes</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Resumen Financiero Expandido */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Resumen Financiero</h2>
                  <div className="flex gap-2">
                    <button className="px-3 py-1 bg-emerald-600 rounded-lg text-xs">Hoy</button>
                    <button className="px-3 py-1 bg-[#1a1625] rounded-lg text-xs text-gray-400">Semana</button>
                    <button className="px-3 py-1 bg-[#1a1625] rounded-lg text-xs text-gray-400">Mes</button>
                  </div>
                </div>
                <div className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div className="text-center p-3 bg-[#1a1625] rounded-lg">
                    <div className="text-lg font-bold text-emerald-400">${stats.todayVolume.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Volumen Hoy</div>
                  </div>
                  <div className="text-center p-3 bg-[#1a1625] rounded-lg">
                    <div className="text-lg font-bold text-purple-400">${stats.weeklyProfit.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Ganancia Semanal</div>
                  </div>
                  <div className="text-center p-3 bg-[#1a1625] rounded-lg">
                    <div className="text-lg font-bold text-emerald-400">${stats.monthlyProfit.toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Ganancia Mensual</div>
                  </div>
                  <div className="text-center p-3 bg-[#1a1625] rounded-lg">
                    <div className="text-lg font-bold text-blue-400">${commissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</div>
                    <div className="text-xs text-gray-500">Comisiones Hoy</div>
                  </div>
                  <div className="text-center p-3 bg-[#1a1625] rounded-lg">
                    <div className="text-lg font-bold text-yellow-400">{withdrawals.filter(w => w.status === 'pending').length + deposits.filter(d => d.status === 'pending').length}</div>
                    <div className="text-xs text-gray-500">Pendientes Total</div>
                  </div>
                </div>
              </div>

              {/* Gráficos */}
              <div className="grid lg:grid-cols-2 gap-6">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" />Tendencia Semanal</h2>
                  <div className="h-64"><Line data={trendChartData} options={trendChartOptions} /></div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h2 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Distribución de Comisiones</h2>
                  <div className="h-64 flex items-center justify-center"><div className="w-48 h-48"><Doughnut data={commissionChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} /></div></div>
                </div>
              </div>

              {/* Últimas Transacciones */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400" />Últimas Transacciones Procesadas</h2>
                  <button onClick={() => setCurrentView('audit')} className="text-xs text-emerald-400 hover:underline">Ver auditoría →</button>
                </div>
                <div className="divide-y divide-purple-900/10">
                  {auditLogs.slice(0, 5).map(log => (
                    <div key={log.id} className="p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'approval' ? 'bg-emerald-500/20' : log.type === 'rejection' ? 'bg-red-500/20' : log.type === 'adjustment' ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
                          {log.type === 'approval' ? <Check className="w-4 h-4 text-emerald-400" /> : log.type === 'rejection' ? <Ban className="w-4 h-4 text-red-400" /> : log.type === 'adjustment' ? <Edit className="w-4 h-4 text-yellow-400" /> : <Activity className="w-4 h-4 text-blue-400" />}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{log.action}</div>
                          <div className="text-xs text-gray-500">{log.details}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-500">{log.timestamp}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Alertas Sospechosas */}
              {suspiciousAlerts.filter(a => !a.reviewed).length > 0 && (
                <div className="bg-[#13111c] rounded-xl border border-red-500/30">
                  <div className="p-4 border-b border-red-500/20 flex items-center justify-between">
                    <h2 className="font-bold flex items-center gap-2 text-red-400"><AlertOctagon className="w-5 h-5" />Alertas de Transacciones Sospechosas</h2>
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold">{suspiciousAlerts.filter(a => !a.reviewed).length}</span>
                  </div>
                  <div className="divide-y divide-red-500/10">
                    {suspiciousAlerts.filter(a => !a.reviewed).map(alert => (
                      <div key={alert.id} className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                          <div>
                            <div className="font-medium text-sm">{alert.userName} ({alert.userId})</div>
                            <div className="text-xs text-red-400">{alert.type} - ${alert.amount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{alert.reason}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">{alert.timestamp}</span>
                          <button onClick={() => handleMarkAlertReviewed(alert.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-medium">Marcar Revisado</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Withdrawals */}
          {currentView === 'withdrawals' && (
            <div className="space-y-4">
              {/* Stats de Retiros */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{withdrawals.filter(w => w.status === 'pending').length}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">{withdrawals.filter(w => w.status === 'processing').length}</div>
                  <div className="text-xs text-gray-500">Procesando</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{withdrawals.filter(w => w.status === 'approved').length}</div>
                  <div className="text-xs text-gray-500">Aprobados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">{withdrawals.filter(w => w.status === 'rejected').length}</div>
                  <div className="text-xs text-gray-500">Rechazados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">${withdrawals.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Monto Pendiente</div>
                </div>
              </div>

              {/* Filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por usuario o ID..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'processing', 'approved', 'rejected'] as const).map(f => (
                    <button key={f} onClick={() => setWithdrawalFilter(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${withdrawalFilter === f ? 'bg-emerald-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:bg-[#252035]'}`}>
                      {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'processing' ? 'Procesando' : f === 'approved' ? 'Aprobados' : 'Rechazados'}
                      {f !== 'all' && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{withdrawals.filter(w => w.status === f).length}</span>}
                    </button>
                  ))}
                  <button onClick={() => { const data = filteredWithdrawals.map(w => `${w.odId},${w.userName},${w.amount},${w.method},${w.status},${w.createdAt}`).join('\n'); const blob = new Blob([`ID,Usuario,Monto,Método,Estado,Fecha\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'retiros.csv'; a.click(); showToast('Retiros exportados', 'success'); }} className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035] flex items-center gap-1">
                    <Download className="w-3 h-3" />Exportar
                  </button>
                </div>
              </div>

              {/* Tabla de Retiros */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Monto</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Método</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Wallet</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Balance Usuario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Historial</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredWithdrawals.map(w => (
                        <tr key={w.id} className={`hover:bg-[#1a1625]/50 ${w.userBalance < w.amount ? 'bg-red-500/5' : ''}`}>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-purple-400" /></div>
                              <div>
                                <div className="font-medium text-sm">{w.userName}</div>
                                <div className="text-xs text-gray-500">{w.odId} • {w.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-lg text-red-400">${w.amount.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{w.createdAt}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-gray-500" /><span className="text-sm font-medium">{w.method}</span></div>
                            <div className="text-xs text-gray-500">{w.network}</div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-[#0d0b14] px-2 py-1 rounded block max-w-[120px] truncate" title={w.walletAddress}>{w.walletAddress}</code>
                            <button onClick={() => { navigator.clipboard.writeText(w.walletAddress); showToast('Wallet copiada', 'success'); }} className="text-xs text-purple-400 hover:underline mt-1">Copiar</button>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`font-bold ${w.userBalance < w.amount ? 'text-red-400' : 'text-emerald-400'}`}>${w.userBalance.toLocaleString()}</div>
                            {w.userBalance < w.amount && <div className="text-xs text-red-400 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Insuficiente</div>}
                            {w.userBalance >= w.amount && <div className="text-xs text-gray-500">Disponible: ${(w.userBalance - w.amount).toLocaleString()}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-xs">
                              <div className="text-emerald-400">Dep: ${w.userTotalDeposits.toLocaleString()}</div>
                              <div className="text-red-400">Ret: ${w.userTotalWithdrawals.toLocaleString()}</div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${w.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : w.status === 'processing' ? 'bg-blue-500/20 text-blue-400' : w.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {w.status === 'pending' ? 'Pendiente' : w.status === 'processing' ? 'Procesando' : w.status === 'approved' ? 'Aprobado' : 'Rechazado'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              {w.status === 'pending' && (
                                <>
                                  <button onClick={() => handleApproveWithdrawal(w)} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg" title="Aprobar"><Check className="w-4 h-4 text-emerald-400" /></button>
                                  <button onClick={() => setSelectedWithdrawal(w)} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Rechazar"><Ban className="w-4 h-4 text-red-400" /></button>
                                </>
                              )}
                              {w.status === 'processing' && (
                                <button onClick={() => { setWithdrawals(prev => prev.map(wd => wd.id === w.id ? { ...wd, status: 'approved' as const } : wd)); addAuditLog('Retiro Completado', `${w.amount} para ${w.odId}`, 'approval'); showToast('Retiro marcado como completado', 'success'); }} className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs">Completar</button>
                              )}
                              <button className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Ver detalles"><Eye className="w-4 h-4 text-purple-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredWithdrawals.length === 0 && <div className="text-center py-12 text-gray-500">No hay retiros que coincidan con los filtros</div>}
              </div>

              {/* Acciones en lote */}
              {withdrawalFilter === 'pending' && filteredWithdrawals.length > 0 && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{filteredWithdrawals.length}</span> retiros pendientes por un total de <span className="font-medium text-red-400">${filteredWithdrawals.reduce((sum, w) => sum + w.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { filteredWithdrawals.filter(w => w.userBalance >= w.amount).forEach(w => { setWithdrawals(prev => prev.map(wd => wd.id === w.id ? { ...wd, status: 'processing' as const } : wd)); }); showToast('Retiros válidos aprobados', 'success'); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium">Aprobar Válidos ({filteredWithdrawals.filter(w => w.userBalance >= w.amount).length})</button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Deposits */}
          {currentView === 'deposits' && (
            <div className="space-y-4">
              {/* Stats de Depósitos */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{deposits.filter(d => d.status === 'pending').length}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{deposits.filter(d => d.status === 'confirmed').length}</div>
                  <div className="text-xs text-gray-500">Confirmados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">{deposits.filter(d => d.status === 'rejected').length}</div>
                  <div className="text-xs text-gray-500">Rechazados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">${deposits.filter(d => d.status === 'pending').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Monto Pendiente</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">${deposits.filter(d => d.status === 'confirmed').reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Confirmado</div>
                </div>
              </div>

              {/* Filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por usuario, ID o TX Hash..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'confirmed', 'rejected'] as const).map(f => (
                    <button key={f} onClick={() => setDepositFilter(f)}
                      className={`px-3 py-2 rounded-lg text-xs font-medium ${depositFilter === f ? 'bg-emerald-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:bg-[#252035]'}`}>
                      {f === 'all' ? 'Todos' : f === 'pending' ? 'Pendientes' : f === 'confirmed' ? 'Confirmados' : 'Rechazados'}
                      {f !== 'all' && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{deposits.filter(d => d.status === f).length}</span>}
                    </button>
                  ))}
                  <button onClick={() => { const data = filteredDeposits.map(d => `${d.odId},${d.userName},${d.amount},${d.method},${d.txHash},${d.status},${d.createdAt}`).join('\n'); const blob = new Blob([`ID,Usuario,Monto,Método,TxHash,Estado,Fecha\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'depositos.csv'; a.click(); showToast('Depósitos exportados', 'success'); }} className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035] flex items-center gap-1">
                    <Download className="w-3 h-3" />Exportar
                  </button>
                </div>
              </div>

              {/* Tabla de Depósitos */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Monto</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Método</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">TX Hash</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Fecha</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredDeposits.map(d => (
                        <tr key={d.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center"><User className="w-4 h-4 text-emerald-400" /></div>
                              <div>
                                <div className="font-medium text-sm">{d.userName}</div>
                                <div className="text-xs text-gray-500">{d.odId} • {d.userEmail}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-lg text-emerald-400">+${d.amount.toLocaleString()}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1"><CreditCard className="w-3 h-3 text-gray-500" /><span className="text-sm font-medium">{d.method}</span></div>
                            <div className="text-xs text-gray-500">{d.network}</div>
                          </td>
                          <td className="px-4 py-3">
                            <code className="text-xs bg-[#0d0b14] px-2 py-1 rounded block max-w-[120px] truncate" title={d.txHash}>{d.txHash}</code>
                            <div className="flex gap-2 mt-1">
                              <button onClick={() => { navigator.clipboard.writeText(d.txHash); showToast('TX Hash copiado', 'success'); }} className="text-xs text-purple-400 hover:underline">Copiar</button>
                              <a href={`https://tronscan.org/#/transaction/${d.txHash}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:underline">Verificar</a>
                            </div>
                          </td>
                          <td className="px-4 py-3"><div className="text-sm text-gray-400">{d.createdAt}</div></td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${d.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : d.status === 'confirmed' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                              {d.status === 'pending' ? 'Pendiente' : d.status === 'confirmed' ? 'Confirmado' : 'Rechazado'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              {d.status === 'pending' && (
                                <>
                                  <button onClick={() => handleConfirmDeposit(d)} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg" title="Confirmar"><Check className="w-4 h-4 text-emerald-400" /></button>
                                  <button onClick={() => { setDeposits(prev => prev.map(dep => dep.id === d.id ? { ...dep, status: 'rejected' as const } : dep)); addAuditLog('Depósito Rechazado', `${d.amount} de ${d.odId}`, 'rejection'); showToast('Depósito rechazado', 'success'); }} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Rechazar"><Ban className="w-4 h-4 text-red-400" /></button>
                                </>
                              )}
                              <button className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Ver detalles"><Eye className="w-4 h-4 text-purple-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredDeposits.length === 0 && <div className="text-center py-12 text-gray-500">No hay depósitos que coincidan con los filtros</div>}
              </div>

              {/* Acciones en lote */}
              {depositFilter === 'pending' && filteredDeposits.length > 0 && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{filteredDeposits.length}</span> depósitos pendientes por un total de <span className="font-medium text-emerald-400">${filteredDeposits.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { filteredDeposits.forEach(d => { setDeposits(prev => prev.map(dep => dep.id === d.id ? { ...dep, status: 'confirmed' as const } : dep)); addAuditLog('Depósito Confirmado', `${d.amount} de ${d.odId}`, 'approval'); }); showToast('Todos los depósitos confirmados', 'success'); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium">Confirmar Todos ({filteredDeposits.length})</button>
                  </div>
                </div>
              )}

              {/* Resumen por método de pago */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Depósitos por Método</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {['USDT', 'BTC', 'ETH', 'SOL'].map(method => {
                    const methodDeposits = deposits.filter(d => d.method === method);
                    const total = methodDeposits.reduce((sum, d) => sum + d.amount, 0);
                    return (
                      <div key={method} className="p-3 bg-[#1a1625] rounded-lg text-center">
                        <div className="text-lg font-bold text-emerald-400">${total.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{method} ({methodDeposits.length})</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}


          {/* Tournament Prizes */}
          {currentView === 'tournaments' && (
            <div className="space-y-4">
              {/* Stats de Premios */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{prizes.filter(p => p.status === 'pending').length}</div>
                  <div className="text-xs text-gray-500">Premios Pendientes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{prizes.filter(p => p.status === 'paid').length}</div>
                  <div className="text-xs text-gray-500">Premios Pagados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">${prizes.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.prizeAmount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Monto Pendiente</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">${prizes.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.prizeAmount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Pagado</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">${prizes.reduce((sum, p) => sum + p.prizeAmount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total General</div>
                </div>
              </div>

              {/* Filtros */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por ganador o torneo..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <button className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white">Todos</button>
                  <button className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035]">Pendientes ({prizes.filter(p => p.status === 'pending').length})</button>
                  <button className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035]">Pagados ({prizes.filter(p => p.status === 'paid').length})</button>
                  <button onClick={() => { const data = prizes.map(p => `${p.odId},${p.odName},${p.tournamentName},${p.position},${p.prizeAmount},${p.status}`).join('\n'); const blob = new Blob([`ID,Ganador,Torneo,Posición,Premio,Estado\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'premios.csv'; a.click(); showToast('Premios exportados', 'success'); }} className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035] flex items-center gap-1">
                    <Download className="w-3 h-3" />Exportar
                  </button>
                </div>
              </div>

              {/* Tabla de Premios */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-400" />Premios de Torneos</h2>
                  {prizes.filter(p => p.status === 'pending').length > 0 && (
                    <button onClick={() => { prizes.filter(p => p.status === 'pending').forEach(p => handlePayPrize(p)); }} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium">Pagar Todos (${prizes.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.prizeAmount, 0).toLocaleString()})</button>
                  )}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Ganador</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Torneo</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Posición</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Premio</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Fecha Fin</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {prizes.filter(p => p.odName.toLowerCase().includes(searchQuery.toLowerCase()) || p.tournamentName.toLowerCase().includes(searchQuery.toLowerCase())).map(p => (
                        <tr key={p.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${p.position === 1 ? 'bg-yellow-500/20' : p.position === 2 ? 'bg-gray-400/20' : 'bg-orange-500/20'}`}>
                                <Trophy className={`w-4 h-4 ${p.position === 1 ? 'text-yellow-400' : p.position === 2 ? 'text-gray-300' : 'text-orange-400'}`} />
                              </div>
                              <div>
                                <div className="font-medium text-sm">{p.odName}</div>
                                <div className="text-xs text-gray-500">{p.odId}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3"><div className="text-sm font-medium">{p.tournamentName}</div></td>
                          <td className="px-4 py-3">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.position === 1 ? 'bg-yellow-500/20 text-yellow-400' : p.position === 2 ? 'bg-gray-400/20 text-gray-300' : 'bg-orange-500/20 text-orange-400'}`}>
                              {p.position === 1 ? '🥇 1°' : p.position === 2 ? '🥈 2°' : '🥉 3°'}
                            </span>
                          </td>
                          <td className="px-4 py-3"><div className="font-bold text-lg text-emerald-400">${p.prizeAmount.toLocaleString()}</div></td>
                          <td className="px-4 py-3"><div className="text-sm text-gray-400">{p.tournamentEndDate}</div></td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                              {p.status === 'pending' ? 'Pendiente' : 'Pagado'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              {p.status === 'pending' && (
                                <button onClick={() => handlePayPrize(p)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-medium">Pagar</button>
                              )}
                              <button className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Ver detalles"><Eye className="w-4 h-4 text-purple-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {prizes.length === 0 && <div className="text-center py-12 text-gray-500">No hay premios pendientes</div>}
              </div>

              {/* Resumen por Torneo */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400" />Resumen por Torneo</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[...new Set(prizes.map(p => p.tournamentName))].map(tournament => {
                    const tournamentPrizes = prizes.filter(p => p.tournamentName === tournament);
                    const totalPrize = tournamentPrizes.reduce((sum, p) => sum + p.prizeAmount, 0);
                    const pendingCount = tournamentPrizes.filter(p => p.status === 'pending').length;
                    return (
                      <div key={tournament} className="p-4 bg-[#1a1625] rounded-lg">
                        <div className="font-medium text-sm mb-2">{tournament}</div>
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="text-lg font-bold text-emerald-400">${totalPrize.toLocaleString()}</div>
                            <div className="text-xs text-gray-500">{tournamentPrizes.length} ganadores</div>
                          </div>
                          {pendingCount > 0 && (
                            <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-xs">{pendingCount} pendientes</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Users */}
          {currentView === 'users' && (
            <div className="space-y-4">
              {/* Stats de Usuarios */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">{usersFinancial.length}</div>
                  <div className="text-xs text-gray-500">Total Usuarios</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{usersFinancial.filter(u => u.status === 'active').length}</div>
                  <div className="text-xs text-gray-500">Activos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">{usersFinancial.filter(u => u.status === 'suspended').length}</div>
                  <div className="text-xs text-gray-500">Suspendidos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">${usersFinancial.reduce((sum, u) => sum + u.balance, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Balance Total</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">${usersFinancial.reduce((sum, u) => sum + u.totalDeposits, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Depósitos Totales</div>
                </div>
              </div>

              {/* Filtros y búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar usuario por ID, nombre o email..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  <button className="px-3 py-2 rounded-lg text-xs font-medium bg-emerald-600 text-white">Todos ({usersFinancial.length})</button>
                  <button className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035]">Activos ({usersFinancial.filter(u => u.status === 'active').length})</button>
                  <button className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035]">Suspendidos ({usersFinancial.filter(u => u.status === 'suspended').length})</button>
                  <button onClick={() => { const data = usersFinancial.map(u => `${u.odId},${u.name},${u.email},${u.balance},${u.totalDeposits},${u.totalWithdrawals},${u.status}`).join('\n'); const blob = new Blob([`ID,Nombre,Email,Balance,Depósitos,Retiros,Estado\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'usuarios_financiero.csv'; a.click(); showToast('Usuarios exportados', 'success'); }} className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035] flex items-center gap-1">
                    <Download className="w-3 h-3" />Exportar
                  </button>
                </div>
              </div>

              {/* Tabla de Usuarios */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Balance</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Depósitos</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Retiros</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Neto</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Última Actividad</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredUsers.map(u => {
                        const netProfit = u.totalDeposits - u.totalWithdrawals - u.balance;
                        return (
                          <tr key={u.id} className="hover:bg-[#1a1625]/50">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${u.status === 'active' ? 'bg-purple-500/20' : 'bg-red-500/20'}`}>
                                  <User className={`w-4 h-4 ${u.status === 'active' ? 'text-purple-400' : 'text-red-400'}`} />
                                </div>
                                <div>
                                  <div className="font-medium text-sm">{u.name}</div>
                                  <div className="text-xs text-gray-500">{u.odId} • {u.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-emerald-400">${u.balance.toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-emerald-400">+${u.totalDeposits.toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-red-400">-${u.totalWithdrawals.toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`text-sm font-medium ${netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {netProfit >= 0 ? '+' : ''}${netProfit.toLocaleString()}
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-400">{u.lastActivity}</div>
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === 'active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                                {u.status === 'active' ? 'Activo' : 'Suspendido'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                <button onClick={() => { setSelectedUser(u); setShowAdjustModal(true); }} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg" title="Ajustar balance"><Edit className="w-4 h-4 text-emerald-400" /></button>
                                <button onClick={() => { setSelectedUser(u); setShowUserHistoryModal(true); }} className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Ver historial"><Eye className="w-4 h-4 text-purple-400" /></button>
                                <button onClick={() => handleToggleUserStatus(u.id)} className={`p-1.5 rounded-lg ${u.status === 'active' ? 'bg-red-500/20 hover:bg-red-500/30' : 'bg-emerald-500/20 hover:bg-emerald-500/30'}`} title={u.status === 'active' ? 'Suspender' : 'Activar'}>
                                  {u.status === 'active' ? <UserX className="w-4 h-4 text-red-400" /> : <UserCheck className="w-4 h-4 text-emerald-400" />}
                                </button>
                                <button onClick={() => handleExportUserData(u)} className="p-1.5 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg" title="Exportar datos"><Download className="w-4 h-4 text-blue-400" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {filteredUsers.length === 0 && <div className="text-center py-12 text-gray-500">No hay usuarios que coincidan con la búsqueda</div>}
              </div>

              {/* Resumen Financiero de Usuarios */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" />Top Depositantes</h3>
                  <div className="space-y-3">
                    {[...usersFinancial].sort((a, b) => b.totalDeposits - a.totalDeposits).slice(0, 5).map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between p-2 bg-[#1a1625] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                          <div>
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.odId}</div>
                          </div>
                        </div>
                        <div className="text-emerald-400 font-bold">${u.totalDeposits.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Wallet className="w-5 h-5 text-purple-400" />Mayor Balance</h3>
                  <div className="space-y-3">
                    {[...usersFinancial].sort((a, b) => b.balance - a.balance).slice(0, 5).map((u, i) => (
                      <div key={u.id} className="flex items-center justify-between p-2 bg-[#1a1625] rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? 'bg-yellow-500/20 text-yellow-400' : i === 1 ? 'bg-gray-400/20 text-gray-300' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-purple-500/20 text-purple-400'}`}>{i + 1}</span>
                          <div>
                            <div className="text-sm font-medium">{u.name}</div>
                            <div className="text-xs text-gray-500">{u.odId}</div>
                          </div>
                        </div>
                        <div className="text-purple-400 font-bold">${u.balance.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commissions */}
          {currentView === 'commissions' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">${commissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Comisiones Hoy</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">${(commissions.reduce((sum, c) => sum + c.amount, 0) * 7).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Comisiones Semanales</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">${(commissions.reduce((sum, c) => sum + c.amount, 0) * 30).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Comisiones Mensuales</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{commissions.length}</div>
                  <div className="text-xs text-gray-500">Tipos de Comisión</div>
                </div>
              </div>
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4">Distribución de Comisiones</h3>
                  <div className="h-64"><Doughnut data={commissionChartData} options={{ responsive: true, maintainAspectRatio: false }} /></div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20">
                  <div className="p-4 border-b border-purple-900/20"><h3 className="font-bold">Detalle de Comisiones</h3></div>
                  <div className="divide-y divide-purple-900/10">
                    {commissions.map(c => (
                      <div key={c.id} className="p-4 flex items-center justify-between">
                        <div><div className="font-medium text-sm">{c.type}</div><div className="text-xs text-gray-500">{c.source} • {c.date}</div></div>
                        <div className="text-right"><div className="font-bold text-emerald-400">${c.amount.toLocaleString()}</div><div className="text-xs text-gray-500">{c.percentage}%</div></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Invoices */}
          {currentView === 'invoices' && (
            <div className="space-y-4">
              {/* Stats de Facturas */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">{invoices.length}</div>
                  <div className="text-xs text-gray-500">Total Facturas</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{invoices.filter(i => i.status === 'pending').length}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{invoices.filter(i => i.status === 'paid').length}</div>
                  <div className="text-xs text-gray-500">Pagadas</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">{invoices.filter(i => i.status === 'overdue').length}</div>
                  <div className="text-xs text-gray-500">Vencidas</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">${invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Por Cobrar</div>
                </div>
              </div>

              {/* Filtros y Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por número o cliente..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'pending', 'paid', 'overdue'] as const).map(f => (
                    <button key={f} onClick={() => setInvoiceFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium ${invoiceFilter === f ? 'bg-emerald-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:bg-[#252035]'}`}>
                      {f === 'all' ? 'Todas' : f === 'pending' ? 'Pendientes' : f === 'paid' ? 'Pagadas' : 'Vencidas'}
                      {f !== 'all' && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{invoices.filter(i => i.status === f).length}</span>}
                    </button>
                  ))}
                  <button onClick={() => setShowInvoiceModal(true)} className="px-3 py-2 bg-emerald-600 rounded-lg text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" />Nueva</button>
                  <button onClick={() => { const data = invoices.map(i => `${i.number},${i.client},${i.amount},${i.date},${i.dueDate},${i.status}`).join('\n'); const blob = new Blob([`Número,Cliente,Monto,Fecha,Vencimiento,Estado\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'facturas.csv'; a.click(); showToast('Facturas exportadas', 'success'); }} className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035] flex items-center gap-1"><Download className="w-3 h-3" />Exportar</button>
                </div>
              </div>

              {/* Tabla de Facturas */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2"><Receipt className="w-5 h-5 text-emerald-400" />Gestión de Facturas</h2>
                  <div className="text-xs text-gray-500">{invoices.length} facturas registradas</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Número</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Cliente</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Descripción</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Monto</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Fecha Emisión</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Vencimiento</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Días</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {invoices.filter(inv => (invoiceFilter === 'all' || inv.status === invoiceFilter) && (inv.number.toLowerCase().includes(searchQuery.toLowerCase()) || inv.client.toLowerCase().includes(searchQuery.toLowerCase()))).map(inv => {
                        const dueDate = new Date(inv.dueDate);
                        const today = new Date();
                        const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        return (
                          <tr key={inv.id} className={`hover:bg-[#1a1625]/50 ${inv.status === 'overdue' ? 'bg-red-500/5' : ''}`}>
                            <td className="px-4 py-3">
                              <code className="text-sm text-purple-400 bg-purple-500/10 px-2 py-1 rounded">{inv.number}</code>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center"><Users className="w-4 h-4 text-blue-400" /></div>
                                <div className="font-medium text-sm">{inv.client}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-xs text-gray-500 max-w-[150px] truncate">{inv.description || 'Sin descripción'}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="font-bold text-lg">${inv.amount.toLocaleString()}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className="text-sm text-gray-400">{inv.date}</div>
                            </td>
                            <td className="px-4 py-3">
                              <div className={`text-sm ${inv.status === 'overdue' ? 'text-red-400' : 'text-gray-400'}`}>{inv.dueDate}</div>
                            </td>
                            <td className="px-4 py-3">
                              {inv.status !== 'paid' && (
                                <span className={`text-xs font-medium ${diffDays < 0 ? 'text-red-400' : diffDays <= 7 ? 'text-yellow-400' : 'text-gray-400'}`}>
                                  {diffDays < 0 ? `${Math.abs(diffDays)}d vencida` : diffDays === 0 ? 'Hoy' : `${diffDays}d restantes`}
                                </span>
                              )}
                              {inv.status === 'paid' && <span className="text-xs text-emerald-400">Pagada</span>}
                            </td>
                            <td className="px-4 py-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${inv.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : inv.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>
                                {inv.status === 'paid' ? 'Pagada' : inv.status === 'pending' ? 'Pendiente' : 'Vencida'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                {inv.status !== 'paid' && (
                                  <button onClick={() => handleMarkInvoicePaid(inv.id)} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg" title="Marcar como pagada"><Check className="w-4 h-4 text-emerald-400" /></button>
                                )}
                                {inv.status !== 'paid' && (
                                  <button onClick={() => handleSendReminder(inv)} className="p-1.5 bg-yellow-500/20 hover:bg-yellow-500/30 rounded-lg" title="Enviar recordatorio"><Mail className="w-4 h-4 text-yellow-400" /></button>
                                )}
                                <button onClick={() => { const content = `FACTURA: ${inv.number}\nCliente: ${inv.client}\nMonto: $${inv.amount}\nFecha: ${inv.date}\nVencimiento: ${inv.dueDate}\nEstado: ${inv.status}\nDescripción: ${inv.description || 'N/A'}`; const blob = new Blob([content], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `${inv.number}.txt`; a.click(); showToast('Factura descargada', 'success'); }} className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Descargar"><Download className="w-4 h-4 text-purple-400" /></button>
                                <button onClick={() => { setInvoices(prev => prev.filter(i => i.id !== inv.id)); addAuditLog('Factura Eliminada', `${inv.number} - ${inv.client}`, 'system'); showToast('Factura eliminada', 'success'); }} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4 text-red-400" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {invoices.length === 0 && <div className="text-center py-12 text-gray-500">No hay facturas registradas</div>}
              </div>

              {/* Resumen por Estado */}
              <div className="grid lg:grid-cols-3 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-yellow-400"><Clock className="w-4 h-4" />Pendientes de Pago</h3>
                  <div className="space-y-2">
                    {invoices.filter(i => i.status === 'pending').slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-2 bg-[#1a1625] rounded-lg">
                        <div><div className="text-sm font-medium">{inv.client}</div><div className="text-xs text-gray-500">{inv.number}</div></div>
                        <div className="text-yellow-400 font-bold">${inv.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    {invoices.filter(i => i.status === 'pending').length === 0 && <div className="text-center py-4 text-gray-500 text-sm">Sin facturas pendientes</div>}
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-red-400"><AlertTriangle className="w-4 h-4" />Facturas Vencidas</h3>
                  <div className="space-y-2">
                    {invoices.filter(i => i.status === 'overdue').slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-2 bg-[#1a1625] rounded-lg">
                        <div><div className="text-sm font-medium">{inv.client}</div><div className="text-xs text-gray-500">Venció: {inv.dueDate}</div></div>
                        <div className="text-red-400 font-bold">${inv.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    {invoices.filter(i => i.status === 'overdue').length === 0 && <div className="text-center py-4 text-gray-500 text-sm">Sin facturas vencidas</div>}
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-emerald-400"><CheckCircle className="w-4 h-4" />Últimas Pagadas</h3>
                  <div className="space-y-2">
                    {invoices.filter(i => i.status === 'paid').slice(0, 3).map(inv => (
                      <div key={inv.id} className="flex items-center justify-between p-2 bg-[#1a1625] rounded-lg">
                        <div><div className="text-sm font-medium">{inv.client}</div><div className="text-xs text-gray-500">{inv.number}</div></div>
                        <div className="text-emerald-400 font-bold">${inv.amount.toLocaleString()}</div>
                      </div>
                    ))}
                    {invoices.filter(i => i.status === 'paid').length === 0 && <div className="text-center py-4 text-gray-500 text-sm">Sin facturas pagadas</div>}
                  </div>
                </div>
              </div>

              {/* Acciones en Lote */}
              {invoices.filter(i => i.status !== 'paid').length > 0 && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4 flex items-center justify-between">
                  <div className="text-sm text-gray-400">
                    <span className="font-medium text-white">{invoices.filter(i => i.status !== 'paid').length}</span> facturas pendientes por un total de <span className="font-medium text-yellow-400">${invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</span>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => { invoices.filter(i => i.status === 'overdue').forEach(inv => handleSendReminder(inv)); }} className="px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-medium">Enviar Recordatorios a Vencidas</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reconciliation */}
          {currentView === 'reconciliation' && (
            <div className="space-y-4">
              {/* Stats de Conciliación */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">{reconciliations.length}</div>
                  <div className="text-xs text-gray-500">Total Registros</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{reconciliations.filter(r => r.status === 'matched').length}</div>
                  <div className="text-xs text-gray-500">Conciliados</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">{reconciliations.filter(r => r.status === 'discrepancy').length}</div>
                  <div className="text-xs text-gray-500">Discrepancias</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{reconciliations.filter(r => r.status === 'pending').length}</div>
                  <div className="text-xs text-gray-500">Pendientes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">${Math.abs(reconciliations.filter(r => r.status === 'discrepancy').reduce((sum, r) => sum + r.difference, 0)).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Diferencia Total</div>
                </div>
              </div>

              {/* Filtros y Acciones */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'matched', 'discrepancy', 'pending'] as const).map(f => (
                    <button key={f} onClick={() => setReconciliationFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium ${reconciliationFilter === f ? 'bg-emerald-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:bg-[#252035]'}`}>
                      {f === 'all' ? 'Todos' : f === 'matched' ? 'Conciliados' : f === 'discrepancy' ? 'Discrepancias' : 'Pendientes'}
                      {f !== 'all' && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{reconciliations.filter(r => r.status === f).length}</span>}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { const newRec: Reconciliation = { id: Date.now(), date: new Date().toISOString().split('T')[0], expected: stats.totalDeposits - stats.totalWithdrawals, actual: stats.platformBalance, difference: stats.platformBalance - (stats.totalDeposits - stats.totalWithdrawals), status: stats.platformBalance === (stats.totalDeposits - stats.totalWithdrawals) ? 'matched' : 'discrepancy' }; setReconciliations(prev => [newRec, ...prev]); addAuditLog('Conciliación Creada', `${newRec.date} - Diferencia: $${newRec.difference}`, 'system'); showToast('Conciliación registrada', 'success'); }} className="px-3 py-2 bg-emerald-600 rounded-lg text-xs font-medium flex items-center gap-1"><Plus className="w-3 h-3" />Nueva Conciliación</button>
                  <button onClick={() => { const data = reconciliations.map(r => `${r.date},${r.expected},${r.actual},${r.difference},${r.status},${r.notes || ''}`).join('\n'); const blob = new Blob([`Fecha,Esperado,Real,Diferencia,Estado,Notas\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'conciliaciones.csv'; a.click(); showToast('Conciliaciones exportadas', 'success'); }} className="px-3 py-2 rounded-lg text-xs font-medium bg-[#1a1625] text-gray-400 hover:bg-[#252035] flex items-center gap-1"><Download className="w-3 h-3" />Exportar</button>
                </div>
              </div>

              {/* Tabla de Conciliaciones */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h2 className="font-bold flex items-center gap-2"><Calculator className="w-5 h-5 text-purple-400" />Registro de Conciliaciones</h2>
                  <div className="text-xs text-gray-500">{reconciliations.filter(r => reconciliationFilter === 'all' || r.status === reconciliationFilter).length} registros</div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Fecha</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Balance Esperado</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Balance Real</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Diferencia</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">% Variación</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Estado</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Notas</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {reconciliations.filter(r => reconciliationFilter === 'all' || r.status === reconciliationFilter).map(r => {
                        const variationPercent = r.expected > 0 ? ((r.difference / r.expected) * 100).toFixed(2) : '0.00';
                        return (
                          <tr key={r.id} className={`hover:bg-[#1a1625]/50 ${r.status === 'discrepancy' ? 'bg-red-500/5' : ''}`}>
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${r.status === 'matched' ? 'bg-emerald-500/20' : r.status === 'discrepancy' ? 'bg-red-500/20' : 'bg-yellow-500/20'}`}>
                                  <Calendar className={`w-4 h-4 ${r.status === 'matched' ? 'text-emerald-400' : r.status === 'discrepancy' ? 'text-red-400' : 'text-yellow-400'}`} />
                                </div>
                                <div className="font-medium text-sm">{r.date}</div>
                              </div>
                            </td>
                            <td className="px-4 py-3"><div className="text-sm font-medium">${r.expected.toLocaleString()}</div></td>
                            <td className="px-4 py-3"><div className="text-sm font-medium">${r.actual.toLocaleString()}</div></td>
                            <td className="px-4 py-3">
                              <div className={`font-bold text-lg ${r.difference === 0 ? 'text-emerald-400' : r.difference > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                {r.difference === 0 ? '$0' : r.difference > 0 ? `+$${r.difference.toLocaleString()}` : `-$${Math.abs(r.difference).toLocaleString()}`}
                              </div>
                            </td>
                            <td className="px-4 py-3"><span className={`text-xs ${parseFloat(variationPercent) === 0 ? 'text-emerald-400' : parseFloat(variationPercent) > 0 ? 'text-emerald-400' : 'text-red-400'}`}>{variationPercent}%</span></td>
                            <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-xs font-medium ${r.status === 'matched' ? 'bg-emerald-500/20 text-emerald-400' : r.status === 'discrepancy' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'}`}>{r.status === 'matched' ? 'Conciliado' : r.status === 'discrepancy' ? 'Discrepancia' : 'Pendiente'}</span></td>
                            <td className="px-4 py-3"><div className="text-xs text-gray-500 max-w-[150px] truncate">{r.notes || '-'}</div></td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-1">
                                {r.status === 'discrepancy' && (<button onClick={() => { setSelectedReconciliation(r); setShowReconciliationModal(true); }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-medium">Resolver</button>)}
                                {r.status === 'pending' && (<><button onClick={() => { setReconciliations(prev => prev.map(rec => rec.id === r.id ? { ...rec, status: 'matched' as const } : rec)); addAuditLog('Conciliación Aprobada', r.date, 'approval'); showToast('Conciliación aprobada', 'success'); }} className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 rounded-lg" title="Aprobar"><Check className="w-4 h-4 text-emerald-400" /></button><button onClick={() => { setReconciliations(prev => prev.map(rec => rec.id === r.id ? { ...rec, status: 'discrepancy' as const } : rec)); addAuditLog('Discrepancia Marcada', r.date, 'system'); showToast('Marcado como discrepancia', 'success'); }} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Marcar discrepancia"><AlertTriangle className="w-4 h-4 text-red-400" /></button></>)}
                                <button onClick={() => { setReconciliations(prev => prev.filter(rec => rec.id !== r.id)); showToast('Registro eliminado', 'success'); }} className="p-1.5 bg-gray-500/20 hover:bg-gray-500/30 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4 text-gray-400" /></button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {reconciliations.filter(r => reconciliationFilter === 'all' || r.status === reconciliationFilter).length === 0 && <div className="text-center py-12 text-gray-500">No hay registros de conciliación</div>}
              </div>

              {/* Resumen y Gráficos */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" />Tendencia de Conciliación</h3>
                  <div className="h-64"><Line data={{ labels: reconciliations.slice(0, 7).reverse().map(r => r.date.slice(5)), datasets: [{ label: 'Esperado', data: reconciliations.slice(0, 7).reverse().map(r => r.expected), borderColor: '#8b5cf6', backgroundColor: 'rgba(139, 92, 246, 0.1)', fill: false, tension: 0.4 }, { label: 'Real', data: reconciliations.slice(0, 7).reverse().map(r => r.actual), borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: false, tension: 0.4 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { display: true, position: 'top' as const } }, scales: { x: { grid: { display: false } }, y: { grid: { color: 'rgba(139, 92, 246, 0.1)' } } } }} /></div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Estado de Conciliaciones</h3>
                  <div className="h-64 flex items-center justify-center"><div className="w-48 h-48"><Doughnut data={{ labels: ['Conciliados', 'Discrepancias', 'Pendientes'], datasets: [{ data: [reconciliations.filter(r => r.status === 'matched').length, reconciliations.filter(r => r.status === 'discrepancy').length, reconciliations.filter(r => r.status === 'pending').length], backgroundColor: ['#10b981', '#ef4444', '#f59e0b'], borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} /></div></div>
                </div>
              </div>

              {/* Alertas de Discrepancias */}
              {reconciliations.filter(r => r.status === 'discrepancy').length > 0 && (
                <div className="bg-[#13111c] rounded-xl border border-red-500/30 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2 text-red-400"><AlertOctagon className="w-5 h-5" />Discrepancias Pendientes de Resolver</h3>
                  <div className="space-y-3">
                    {reconciliations.filter(r => r.status === 'discrepancy').map(r => (
                      <div key={r.id} className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center"><AlertTriangle className="w-5 h-5 text-red-400" /></div>
                          <div><div className="font-medium text-sm">{r.date}</div><div className="text-xs text-gray-500">Esperado: ${r.expected.toLocaleString()} | Real: ${r.actual.toLocaleString()}</div></div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right"><div className="font-bold text-red-400">${Math.abs(r.difference).toLocaleString()}</div><div className="text-xs text-gray-500">diferencia</div></div>
                          <button onClick={() => { setSelectedReconciliation(r); setShowReconciliationModal(true); }} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-xs font-medium">Resolver</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          {/* Chat Interno */}
          {currentView === 'chat' && (
            <div className="h-[calc(100vh-200px)] flex bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
              {/* Contacts Sidebar */}
              <div className="w-72 border-r border-purple-900/20 flex flex-col">
                <div className="p-4 border-b border-purple-900/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-sm">Chat Interno</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">{chatContacts.filter(c => c.online).length} en línea</span>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input type="text" placeholder="Buscar contacto..." className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg pl-9 pr-3 py-2 text-xs focus:border-emerald-500/50 focus:outline-none" />
                  </div>
                </div>
                <div className="p-2 border-b border-purple-900/20">
                  <div className="flex gap-1">
                    <button className="flex-1 px-2 py-1.5 bg-emerald-600 rounded-lg text-xs font-medium">Todos</button>
                    <button className="flex-1 px-2 py-1.5 bg-[#1a1625] rounded-lg text-xs text-gray-400">Admin</button>
                    <button className="flex-1 px-2 py-1.5 bg-[#1a1625] rounded-lg text-xs text-gray-400">Operadores</button>
                  </div>
                </div>
                <div className="flex-1 overflow-y-auto">
                  {chatContacts.map(contact => (
                    <button key={contact.id} onClick={() => setSelectedChatContact(contact)} className={`w-full p-3 flex items-center gap-3 hover:bg-[#1a1625] transition-colors border-b border-purple-900/10 ${selectedChatContact?.id === contact.id ? 'bg-[#1a1625] border-l-2 border-l-emerald-500' : ''}`}>
                      <div className="relative">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${contact.role === 'admin' ? 'bg-red-500/20' : contact.role === 'operator' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                          <User className={`w-5 h-5 ${contact.role === 'admin' ? 'text-red-400' : contact.role === 'operator' ? 'text-blue-400' : 'text-purple-400'}`} />
                        </div>
                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-[#13111c] ${contact.online ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="font-medium text-sm truncate">{contact.name}</div>
                          {contact.unread > 0 && <span className="px-2 py-0.5 bg-emerald-600 rounded-full text-xs font-bold">{contact.unread}</span>}
                        </div>
                        <div className="flex items-center justify-between">
                          <div className={`text-xs capitalize ${contact.role === 'admin' ? 'text-red-400' : contact.role === 'operator' ? 'text-blue-400' : 'text-purple-400'}`}>{contact.role}</div>
                          <div className="text-xs text-gray-500">{contact.online ? 'En línea' : 'Offline'}</div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
                <div className="p-3 border-t border-purple-900/20">
                  <div className="flex items-center gap-2 p-2 bg-[#1a1625] rounded-lg">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center"><User className="w-4 h-4 text-emerald-400" /></div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{user?.first_name} {user?.last_name}</div>
                      <div className="text-xs text-emerald-400">Contador • En línea</div>
                    </div>
                    <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                  </div>
                </div>
              </div>
              {/* Chat Area */}
              <div className="flex-1 flex flex-col">
                {selectedChatContact ? (
                  <>
                    <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedChatContact.role === 'admin' ? 'bg-red-500/20' : selectedChatContact.role === 'operator' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                          <User className={`w-5 h-5 ${selectedChatContact.role === 'admin' ? 'text-red-400' : selectedChatContact.role === 'operator' ? 'text-blue-400' : 'text-purple-400'}`} />
                        </div>
                        <div>
                          <div className="font-medium text-sm">{selectedChatContact.name}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1">
                            <span className={`w-2 h-2 rounded-full ${selectedChatContact.online ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                            {selectedChatContact.online ? 'En línea' : 'Desconectado'} • <span className="capitalize">{selectedChatContact.role}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button className="p-2 hover:bg-[#1a1625] rounded-lg" title="Buscar en chat"><Search className="w-4 h-4 text-gray-400" /></button>
                        <button onClick={() => { const chatData = chatMessages.map(m => `[${m.timestamp}] ${m.from}: ${m.message}`).join('\n'); const blob = new Blob([chatData], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `chat_${selectedChatContact.name}_${new Date().toISOString().split('T')[0]}.txt`; a.click(); showToast('Chat exportado', 'success'); }} className="p-2 hover:bg-[#1a1625] rounded-lg" title="Exportar chat"><Download className="w-4 h-4 text-gray-400" /></button>
                        <button className="p-2 hover:bg-[#1a1625] rounded-lg" title="Más opciones"><Settings className="w-4 h-4 text-gray-400" /></button>
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                      <div className="text-center">
                        <span className="px-3 py-1 bg-[#1a1625] rounded-full text-xs text-gray-500">Hoy</span>
                      </div>
                      {chatMessages.map(msg => (
                        <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[70%] ${msg.isMe ? '' : 'flex gap-2'}`}>
                            {!msg.isMe && (
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.fromRole === 'admin' ? 'bg-red-500/20' : msg.fromRole === 'operator' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                                <User className={`w-4 h-4 ${msg.fromRole === 'admin' ? 'text-red-400' : msg.fromRole === 'operator' ? 'text-blue-400' : 'text-purple-400'}`} />
                              </div>
                            )}
                            <div className={`rounded-2xl p-3 ${msg.isMe ? 'bg-emerald-600 rounded-br-md' : 'bg-[#1a1625] rounded-bl-md'}`}>
                              {!msg.isMe && <div className="text-xs text-purple-400 mb-1 font-medium">{msg.from}</div>}
                              <div className="text-sm">{msg.message}</div>
                              {msg.attachment && (
                                <div className="mt-2 p-2 bg-black/20 rounded-lg flex items-center gap-2">
                                  <FileText className="w-4 h-4 text-gray-400" />
                                  <span className="text-xs text-gray-400">{msg.attachment}</span>
                                </div>
                              )}
                              <div className={`text-xs mt-1 flex items-center gap-1 ${msg.isMe ? 'text-emerald-200 justify-end' : 'text-gray-500'}`}>
                                {msg.timestamp}
                                {msg.isMe && <CheckCircle className="w-3 h-3" />}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </div>
                    <div className="p-4 border-t border-purple-900/20">
                      <div className="flex items-center gap-2 mb-2">
                        <button className="p-2 hover:bg-[#1a1625] rounded-lg" title="Adjuntar archivo"><Plus className="w-4 h-4 text-gray-400" /></button>
                        <button className="p-2 hover:bg-[#1a1625] rounded-lg" title="Emoji"><MessageSquare className="w-4 h-4 text-gray-400" /></button>
                      </div>
                      <div className="flex gap-2">
                        <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()} placeholder="Escribe un mensaje..." className="flex-1 bg-[#1a1625] border border-purple-900/30 rounded-xl px-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                        <button onClick={handleSendMessage} disabled={!newMessage.trim()} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-colors"><Send className="w-5 h-5" /></button>
                      </div>
                      <div className="flex items-center justify-between mt-2">
                        <div className="text-xs text-gray-500">Presiona Enter para enviar</div>
                        <div className="text-xs text-gray-500">{newMessage.length}/500</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-20 h-20 bg-[#1a1625] rounded-full flex items-center justify-center mx-auto mb-4"><MessageSquare className="w-10 h-10 text-gray-500" /></div>
                      <h3 className="font-bold text-lg mb-2">Chat Interno</h3>
                      <p className="text-gray-500 text-sm mb-4">Selecciona un contacto para iniciar una conversación</p>
                      <div className="flex justify-center gap-2">
                        <div className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 bg-emerald-500 rounded-full" />{chatContacts.filter(c => c.online).length} en línea</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500"><div className="w-2 h-2 bg-gray-500 rounded-full" />{chatContacts.filter(c => !c.online).length} offline</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              {/* Info Panel (opcional) */}
              {selectedChatContact && (
                <div className="w-64 border-l border-purple-900/20 flex flex-col hidden xl:flex">
                  <div className="p-4 border-b border-purple-900/20 text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${selectedChatContact.role === 'admin' ? 'bg-red-500/20' : selectedChatContact.role === 'operator' ? 'bg-blue-500/20' : 'bg-purple-500/20'}`}>
                      <User className={`w-8 h-8 ${selectedChatContact.role === 'admin' ? 'text-red-400' : selectedChatContact.role === 'operator' ? 'text-blue-400' : 'text-purple-400'}`} />
                    </div>
                    <div className="font-bold">{selectedChatContact.name}</div>
                    <div className={`text-xs capitalize ${selectedChatContact.role === 'admin' ? 'text-red-400' : selectedChatContact.role === 'operator' ? 'text-blue-400' : 'text-purple-400'}`}>{selectedChatContact.role}</div>
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <span className={`w-2 h-2 rounded-full ${selectedChatContact.online ? 'bg-emerald-500' : 'bg-gray-500'}`} />
                      <span className="text-xs text-gray-500">{selectedChatContact.online ? 'En línea' : 'Desconectado'}</span>
                    </div>
                  </div>
                  <div className="p-4 flex-1">
                    <h4 className="text-xs text-gray-500 mb-3">INFORMACIÓN</h4>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm"><Mail className="w-4 h-4 text-gray-500" /><span className="text-gray-400 truncate">{selectedChatContact.name.toLowerCase().replace(' ', '.')}@tormentus.com</span></div>
                      <div className="flex items-center gap-2 text-sm"><Shield className="w-4 h-4 text-gray-500" /><span className="text-gray-400 capitalize">Rol: {selectedChatContact.role}</span></div>
                      <div className="flex items-center gap-2 text-sm"><Clock className="w-4 h-4 text-gray-500" /><span className="text-gray-400">Última vez: Hace 5 min</span></div>
                    </div>
                    <h4 className="text-xs text-gray-500 mt-6 mb-3">ACCIONES RÁPIDAS</h4>
                    <div className="space-y-2">
                      <button className="w-full p-2 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-xs text-left flex items-center gap-2"><Bell className="w-4 h-4 text-gray-400" />Silenciar notificaciones</button>
                      <button className="w-full p-2 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-xs text-left flex items-center gap-2"><FileText className="w-4 h-4 text-gray-400" />Ver archivos compartidos</button>
                      <button className="w-full p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg text-xs text-left flex items-center gap-2 text-red-400"><Ban className="w-4 h-4" />Bloquear usuario</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Reports */}
          {currentView === 'reports' && (
            <div className="space-y-4">
              {/* Stats de Reportes */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">${stats.totalDeposits.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Depósitos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">${stats.totalWithdrawals.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Total Retiros</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">${stats.platformBalance.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Balance Plataforma</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">${commissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}</div>
                  <div className="text-xs text-gray-500">Comisiones Totales</div>
                </div>
              </div>

              {/* Reportes Rápidos */}
              <div className="grid md:grid-cols-4 gap-4">
                <button onClick={() => { const data = `REPORTE DIARIO - ${new Date().toLocaleDateString('es-ES')}\n\nDepósitos: $${stats.totalDeposits.toLocaleString()}\nRetiros: $${stats.totalWithdrawals.toLocaleString()}\nBalance: $${stats.platformBalance.toLocaleString()}\nPendientes: ${withdrawals.filter(w => w.status === 'pending').length} retiros, ${deposits.filter(d => d.status === 'pending').length} depósitos\nComisiones: $${commissions.reduce((sum, c) => sum + c.amount, 0).toLocaleString()}`; const blob = new Blob([data], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reporte_diario_${new Date().toISOString().split('T')[0]}.txt`; a.click(); showToast('Reporte diario generado', 'success'); addAuditLog('Reporte Generado', 'Reporte Diario', 'system'); }} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6 text-left hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4"><FileText className="w-6 h-6 text-emerald-400" /></div>
                  <h3 className="font-bold mb-1">Reporte Diario</h3>
                  <p className="text-xs text-gray-500 mb-3">Resumen de transacciones del día</p>
                  <div className="flex items-center gap-2 text-emerald-400 text-sm"><Download className="w-4 h-4" />Descargar</div>
                </button>
                <button onClick={() => { const data = `REPORTE SEMANAL\n\nVolumen Total: $${(stats.todayVolume * 7).toLocaleString()}\nGanancia Semanal: $${stats.weeklyProfit.toLocaleString()}\nTransacciones Procesadas: ${auditLogs.length}\nUsuarios Activos: ${usersFinancial.filter(u => u.status === 'active').length}\nConciliaciones: ${reconciliations.filter(r => r.status === 'matched').length} OK, ${reconciliations.filter(r => r.status === 'discrepancy').length} discrepancias`; const blob = new Blob([data], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reporte_semanal_${new Date().toISOString().split('T')[0]}.txt`; a.click(); showToast('Reporte semanal generado', 'success'); addAuditLog('Reporte Generado', 'Reporte Semanal', 'system'); }} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6 text-left hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mb-4"><Calendar className="w-6 h-6 text-purple-400" /></div>
                  <h3 className="font-bold mb-1">Reporte Semanal</h3>
                  <p className="text-xs text-gray-500 mb-3">Análisis de la semana</p>
                  <div className="flex items-center gap-2 text-purple-400 text-sm"><Download className="w-4 h-4" />Descargar</div>
                </button>
                <button onClick={() => { const data = `REPORTE MENSUAL\n\nGanancia Mensual: $${stats.monthlyProfit.toLocaleString()}\nTotal Depósitos: $${stats.totalDeposits.toLocaleString()}\nTotal Retiros: $${stats.totalWithdrawals.toLocaleString()}\nFacturas Pagadas: ${invoices.filter(i => i.status === 'paid').length}\nFacturas Pendientes: ${invoices.filter(i => i.status !== 'paid').length}\nMonto Facturas Pendientes: $${invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`; const blob = new Blob([data], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reporte_mensual_${new Date().toISOString().split('T')[0]}.txt`; a.click(); showToast('Reporte mensual generado', 'success'); addAuditLog('Reporte Generado', 'Reporte Mensual', 'system'); }} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6 text-left hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4"><BarChart3 className="w-6 h-6 text-blue-400" /></div>
                  <h3 className="font-bold mb-1">Reporte Mensual</h3>
                  <p className="text-xs text-gray-500 mb-3">Balance completo del mes</p>
                  <div className="flex items-center gap-2 text-blue-400 text-sm"><Download className="w-4 h-4" />Descargar</div>
                </button>
                <button onClick={() => { const data = `REPORTE FISCAL\n\nIngresos Totales: $${stats.totalDeposits.toLocaleString()}\nEgresos Totales: $${stats.totalWithdrawals.toLocaleString()}\nComisiones Generadas: $${(commissions.reduce((sum, c) => sum + c.amount, 0) * 30).toLocaleString()}\nFacturas Emitidas: ${invoices.length}\nFacturas Cobradas: $${invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}\nFacturas Por Cobrar: $${invoices.filter(i => i.status !== 'paid').reduce((sum, i) => sum + i.amount, 0).toLocaleString()}`; const blob = new Blob([data], { type: 'text/plain' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `reporte_fiscal_${new Date().toISOString().split('T')[0]}.txt`; a.click(); showToast('Reporte fiscal generado', 'success'); addAuditLog('Reporte Generado', 'Reporte Fiscal', 'system'); }} className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6 text-left hover:border-emerald-500/30 transition-all">
                  <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center mb-4"><Receipt className="w-6 h-6 text-yellow-400" /></div>
                  <h3 className="font-bold mb-1">Reporte Fiscal</h3>
                  <p className="text-xs text-gray-500 mb-3">Información para contabilidad</p>
                  <div className="flex items-center gap-2 text-yellow-400 text-sm"><Download className="w-4 h-4" />Descargar</div>
                </button>
              </div>

              {/* Exportar Datos */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Download className="w-5 h-5 text-emerald-400" />Exportar Datos</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => { const data = withdrawals.map(w => `${w.odId},${w.userName},${w.amount},${w.method},${w.status},${w.createdAt}`).join('\n'); const blob = new Blob([`ID,Usuario,Monto,Método,Estado,Fecha\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'retiros_completo.csv'; a.click(); showToast('Retiros exportados', 'success'); }} className="p-3 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-left">
                      <div className="text-sm font-medium">Retiros</div>
                      <div className="text-xs text-gray-500">{withdrawals.length} registros</div>
                    </button>
                    <button onClick={() => { const data = deposits.map(d => `${d.odId},${d.userName},${d.amount},${d.method},${d.status},${d.createdAt}`).join('\n'); const blob = new Blob([`ID,Usuario,Monto,Método,Estado,Fecha\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'depositos_completo.csv'; a.click(); showToast('Depósitos exportados', 'success'); }} className="p-3 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-left">
                      <div className="text-sm font-medium">Depósitos</div>
                      <div className="text-xs text-gray-500">{deposits.length} registros</div>
                    </button>
                    <button onClick={() => { const data = usersFinancial.map(u => `${u.odId},${u.name},${u.email},${u.balance},${u.totalDeposits},${u.totalWithdrawals},${u.status}`).join('\n'); const blob = new Blob([`ID,Nombre,Email,Balance,Depósitos,Retiros,Estado\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'usuarios_financiero.csv'; a.click(); showToast('Usuarios exportados', 'success'); }} className="p-3 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-left">
                      <div className="text-sm font-medium">Usuarios</div>
                      <div className="text-xs text-gray-500">{usersFinancial.length} registros</div>
                    </button>
                    <button onClick={() => { const data = invoices.map(i => `${i.number},${i.client},${i.amount},${i.date},${i.dueDate},${i.status}`).join('\n'); const blob = new Blob([`Número,Cliente,Monto,Fecha,Vencimiento,Estado\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'facturas_completo.csv'; a.click(); showToast('Facturas exportadas', 'success'); }} className="p-3 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-left">
                      <div className="text-sm font-medium">Facturas</div>
                      <div className="text-xs text-gray-500">{invoices.length} registros</div>
                    </button>
                    <button onClick={() => { const data = reconciliations.map(r => `${r.date},${r.expected},${r.actual},${r.difference},${r.status}`).join('\n'); const blob = new Blob([`Fecha,Esperado,Real,Diferencia,Estado\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'conciliaciones_completo.csv'; a.click(); showToast('Conciliaciones exportadas', 'success'); }} className="p-3 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-left">
                      <div className="text-sm font-medium">Conciliaciones</div>
                      <div className="text-xs text-gray-500">{reconciliations.length} registros</div>
                    </button>
                    <button onClick={() => { const data = auditLogs.map(l => `${l.timestamp},${l.action},${l.details},${l.user},${l.type}`).join('\n'); const blob = new Blob([`Fecha,Acción,Detalles,Usuario,Tipo\n${data}`], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'auditoria_completo.csv'; a.click(); showToast('Auditoría exportada', 'success'); }} className="p-3 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-left">
                      <div className="text-sm font-medium">Auditoría</div>
                      <div className="text-xs text-gray-500">{auditLogs.length} registros</div>
                    </button>
                  </div>
                </div>

                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><FileText className="w-5 h-5 text-purple-400" />Generar Reporte Personalizado</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="text-xs text-gray-500 mb-1 block">Fecha Inicio</label><input type="date" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                      <div><label className="text-xs text-gray-500 mb-1 block">Fecha Fin</label><input type="date" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    </div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Tipo de Reporte</label>
                      <select className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                        <option>Todos los movimientos</option><option>Solo Depósitos</option><option>Solo Retiros</option><option>Premios de Torneos</option><option>Facturas</option><option>Conciliaciones</option>
                      </select>
                    </div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Formato</label>
                      <select className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                        <option>CSV</option><option>TXT</option><option>JSON</option>
                      </select>
                    </div>
                    <button onClick={() => { showToast('Reporte personalizado generado', 'success'); addAuditLog('Reporte Generado', 'Reporte Personalizado', 'system'); }} className="w-full px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium flex items-center justify-center gap-2"><Download className="w-4 h-4" />Generar Reporte</button>
                  </div>
                </div>
              </div>

              {/* Gráficos de Resumen */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-400" />Flujo de Caja Semanal</h3>
                  <div className="h-64"><Line data={trendChartData} options={trendChartOptions} /></div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Distribución de Ingresos</h3>
                  <div className="h-64 flex items-center justify-center"><div className="w-48 h-48"><Doughnut data={commissionChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} /></div></div>
                </div>
              </div>

              {/* Resumen Ejecutivo */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-400" />Resumen Ejecutivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  <div className="p-3 bg-[#1a1625] rounded-lg text-center"><div className="text-lg font-bold text-emerald-400">{withdrawals.filter(w => w.status === 'approved').length}</div><div className="text-xs text-gray-500">Retiros Aprobados</div></div>
                  <div className="p-3 bg-[#1a1625] rounded-lg text-center"><div className="text-lg font-bold text-red-400">{withdrawals.filter(w => w.status === 'rejected').length}</div><div className="text-xs text-gray-500">Retiros Rechazados</div></div>
                  <div className="p-3 bg-[#1a1625] rounded-lg text-center"><div className="text-lg font-bold text-emerald-400">{deposits.filter(d => d.status === 'confirmed').length}</div><div className="text-xs text-gray-500">Depósitos Confirmados</div></div>
                  <div className="p-3 bg-[#1a1625] rounded-lg text-center"><div className="text-lg font-bold text-yellow-400">{prizes.filter(p => p.status === 'paid').length}</div><div className="text-xs text-gray-500">Premios Pagados</div></div>
                  <div className="p-3 bg-[#1a1625] rounded-lg text-center"><div className="text-lg font-bold text-purple-400">{invoices.filter(i => i.status === 'paid').length}</div><div className="text-xs text-gray-500">Facturas Cobradas</div></div>
                  <div className="p-3 bg-[#1a1625] rounded-lg text-center"><div className="text-lg font-bold text-blue-400">{reconciliations.filter(r => r.status === 'matched').length}</div><div className="text-xs text-gray-500">Conciliaciones OK</div></div>
                </div>
              </div>
            </div>
          )}

          {/* Audit */}
          {currentView === 'audit' && (
            <div className="space-y-4">
              {/* Stats de Auditoría */}
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-purple-400">{auditLogs.length}</div>
                  <div className="text-xs text-gray-500">Total Registros</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-emerald-400">{auditLogs.filter(l => l.type === 'approval').length}</div>
                  <div className="text-xs text-gray-500">Aprobaciones</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-red-400">{auditLogs.filter(l => l.type === 'rejection').length}</div>
                  <div className="text-xs text-gray-500">Rechazos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-yellow-400">{auditLogs.filter(l => l.type === 'adjustment').length}</div>
                  <div className="text-xs text-gray-500">Ajustes</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="text-2xl font-bold text-blue-400">{auditLogs.filter(l => l.type === 'system').length}</div>
                  <div className="text-xs text-gray-500">Sistema</div>
                </div>
              </div>

              {/* Filtros y Búsqueda */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="Buscar por acción, detalles o usuario..." value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:border-emerald-500/50 focus:outline-none" />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {(['all', 'approval', 'rejection', 'adjustment', 'system'] as const).map(f => (
                    <button key={f} onClick={() => setAuditFilter(f)} className={`px-3 py-2 rounded-lg text-xs font-medium ${auditFilter === f ? 'bg-emerald-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:bg-[#252035]'}`}>
                      {f === 'all' ? 'Todos' : f === 'approval' ? 'Aprobaciones' : f === 'rejection' ? 'Rechazos' : f === 'adjustment' ? 'Ajustes' : 'Sistema'}
                      {f !== 'all' && <span className="ml-1 px-1.5 py-0.5 bg-black/20 rounded text-xs">{auditLogs.filter(l => l.type === f).length}</span>}
                    </button>
                  ))}
                </div>
              </div>

              {/* Acciones */}
              <div className="flex gap-2 flex-wrap">
                <button onClick={handleExportAuditLogs} className="px-3 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-xs font-medium flex items-center gap-1"><Download className="w-3 h-3" />Exportar CSV</button>
                <button onClick={() => { const data = JSON.stringify(filteredAuditLogs, null, 2); const blob = new Blob([data], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.json`; a.click(); showToast('Logs exportados en JSON', 'success'); }} className="px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-xs font-medium flex items-center gap-1"><Download className="w-3 h-3" />Exportar JSON</button>
                <button onClick={() => { if (confirm('¿Limpiar logs antiguos (más de 30 días)?')) { const thirtyDaysAgo = new Date(); thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30); setAuditLogs(prev => prev.filter(l => new Date(l.timestamp) > thirtyDaysAgo)); showToast('Logs antiguos eliminados', 'success'); } }} className="px-3 py-2 bg-red-600/20 hover:bg-red-600/30 text-red-400 rounded-lg text-xs font-medium flex items-center gap-1"><Trash2 className="w-3 h-3" />Limpiar Antiguos</button>
                <button onClick={() => { addAuditLog('Auditoría Revisada', `Revisión manual por ${user?.first_name || 'Contador'}`, 'system'); showToast('Revisión registrada', 'success'); }} className="px-3 py-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 rounded-lg text-xs font-medium flex items-center gap-1"><CheckCircle className="w-3 h-3" />Marcar Revisado</button>
              </div>

              {/* Tabla de Auditoría */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20 flex justify-between items-center">
                  <h2 className="font-bold flex items-center gap-2"><Shield className="w-5 h-5 text-purple-400" />Registro de Auditoría</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-gray-500">{filteredAuditLogs.length} de {auditLogs.length} registros</span>
                    <button onClick={() => { setAuditSearch(''); setAuditFilter('all'); }} className="text-xs text-purple-400 hover:underline">Limpiar filtros</button>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Tipo</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Acción</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Detalles</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Usuario</th>
                        <th className="text-left px-4 py-3 text-xs text-gray-500">Fecha/Hora</th>
                        <th className="text-right px-4 py-3 text-xs text-gray-500">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {filteredAuditLogs.map(log => (
                        <tr key={log.id} className="hover:bg-[#1a1625]/50">
                          <td className="px-4 py-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${log.type === 'approval' ? 'bg-emerald-500/20' : log.type === 'rejection' ? 'bg-red-500/20' : log.type === 'adjustment' ? 'bg-yellow-500/20' : 'bg-purple-500/20'}`}>
                              {log.type === 'approval' ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : log.type === 'rejection' ? <XCircle className="w-4 h-4 text-red-400" /> : log.type === 'adjustment' ? <Activity className="w-4 h-4 text-yellow-400" /> : <Shield className="w-4 h-4 text-purple-400" />}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-sm">{log.action}</div>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${log.type === 'approval' ? 'bg-emerald-500/20 text-emerald-400' : log.type === 'rejection' ? 'bg-red-500/20 text-red-400' : log.type === 'adjustment' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>
                              {log.type === 'approval' ? 'Aprobación' : log.type === 'rejection' ? 'Rechazo' : log.type === 'adjustment' ? 'Ajuste' : 'Sistema'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-400 max-w-[300px]">{log.details}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center"><User className="w-3 h-3 text-purple-400" /></div>
                              <span className="text-sm">{log.user}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-gray-400">{log.timestamp}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex justify-end gap-1">
                              <button onClick={() => { navigator.clipboard.writeText(`${log.action} - ${log.details} - ${log.user} - ${log.timestamp}`); showToast('Copiado al portapapeles', 'success'); }} className="p-1.5 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg" title="Copiar"><FileText className="w-4 h-4 text-purple-400" /></button>
                              <button onClick={() => { setAuditLogs(prev => prev.filter(l => l.id !== log.id)); showToast('Registro eliminado', 'success'); }} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg" title="Eliminar"><Trash2 className="w-4 h-4 text-red-400" /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredAuditLogs.length === 0 && <div className="text-center py-12 text-gray-500">No hay registros que coincidan con los filtros</div>}
              </div>

              {/* Resumen por Tipo y Timeline */}
              <div className="grid lg:grid-cols-2 gap-4">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" />Distribución por Tipo</h3>
                  <div className="h-64 flex items-center justify-center">
                    <div className="w-48 h-48">
                      <Doughnut data={{ labels: ['Aprobaciones', 'Rechazos', 'Ajustes', 'Sistema'], datasets: [{ data: [auditLogs.filter(l => l.type === 'approval').length, auditLogs.filter(l => l.type === 'rejection').length, auditLogs.filter(l => l.type === 'adjustment').length, auditLogs.filter(l => l.type === 'system').length], backgroundColor: ['#10b981', '#ef4444', '#f59e0b', '#8b5cf6'], borderWidth: 0 }] }} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom' as const } } }} />
                    </div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-emerald-400" />Actividad Reciente</h3>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {auditLogs.slice(0, 8).map(log => (
                      <div key={log.id} className="flex items-start gap-3 p-2 bg-[#1a1625] rounded-lg">
                        <div className={`w-2 h-2 rounded-full mt-2 ${log.type === 'approval' ? 'bg-emerald-400' : log.type === 'rejection' ? 'bg-red-400' : log.type === 'adjustment' ? 'bg-yellow-400' : 'bg-purple-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium truncate">{log.action}</div>
                          <div className="text-xs text-gray-500">{log.user} • {log.timestamp}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Alertas de Seguridad */}
              {auditLogs.filter(l => l.type === 'rejection').length > 3 && (
                <div className="bg-[#13111c] rounded-xl border border-yellow-500/30 p-4">
                  <h3 className="font-bold mb-3 flex items-center gap-2 text-yellow-400"><AlertTriangle className="w-5 h-5" />Alerta de Seguridad</h3>
                  <p className="text-sm text-gray-400 mb-3">Se han detectado múltiples rechazos recientes. Revisa las transacciones para detectar posibles patrones sospechosos.</p>
                  <div className="flex gap-2">
                    <button onClick={() => setAuditFilter('rejection')} className="px-3 py-1.5 bg-yellow-600 hover:bg-yellow-700 rounded-lg text-xs font-medium">Ver Rechazos</button>
                    <button onClick={() => { addAuditLog('Alerta Revisada', 'Alerta de seguridad revisada manualmente', 'system'); showToast('Alerta marcada como revisada', 'success'); }} className="px-3 py-1.5 bg-[#1a1625] hover:bg-[#252035] rounded-lg text-xs font-medium">Marcar Revisada</button>
                  </div>
                </div>
              )}
            </div>
          )}


          {/* Settings */}
          {currentView === 'settings' && (
            <div className="space-y-4">
              {/* Stats de Configuración */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-500/20 rounded-lg"><Shield className="w-5 h-5 text-emerald-400" /></div>
                    <div>
                      <div className="text-lg font-bold text-emerald-400">{security.twoFactorEnabled ? 'Activo' : 'Inactivo'}</div>
                      <div className="text-xs text-gray-500">2FA</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg"><Monitor className="w-5 h-5 text-purple-400" /></div>
                    <div>
                      <div className="text-lg font-bold">{sessions.length}</div>
                      <div className="text-xs text-gray-500">Sesiones</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg"><Smartphone className="w-5 h-5 text-blue-400" /></div>
                    <div>
                      <div className="text-lg font-bold">{trustedDevices.length}</div>
                      <div className="text-xs text-gray-500">Dispositivos</div>
                    </div>
                  </div>
                </div>
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-500/20 rounded-lg"><Bell className="w-5 h-5 text-yellow-400" /></div>
                    <div>
                      <div className="text-lg font-bold">{Object.values(notifications).filter(v => v === true).length}</div>
                      <div className="text-xs text-gray-500">Alertas Activas</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tabs de Configuración */}
              <div className="flex gap-2 overflow-x-auto pb-2">
                {[
                  { id: 'profile' as SettingsTab, label: 'Perfil', icon: User, count: null },
                  { id: 'security' as SettingsTab, label: 'Seguridad', icon: Shield, count: sessions.length },
                  { id: 'notifications' as SettingsTab, label: 'Notificaciones', icon: Bell, count: null },
                  { id: 'limits' as SettingsTab, label: 'Límites', icon: AlertTriangle, count: null },
                  { id: 'privacy' as SettingsTab, label: 'Privacidad', icon: Eye, count: null }
                ].map(tab => (
                  <button key={tab.id} onClick={() => setSettingsTab(tab.id)} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${settingsTab === tab.id ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-[#1a1625] text-gray-400 hover:bg-[#1a1625]/80'}`}>
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                    {tab.count !== null && <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded text-xs">{tab.count}</span>}
                  </button>
                ))}
              </div>

              {/* Tab: Perfil */}
              {settingsTab === 'profile' && (
                <div className="grid lg:grid-cols-3 gap-4">
                  {/* Información Personal */}
                  <div className="lg:col-span-2 bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><User className="w-5 h-5 text-emerald-400" />Información Personal</h3>
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
                      <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl flex items-center justify-center text-3xl font-bold">
                          {profile.firstName.charAt(0)}{profile.lastName.charAt(0)}
                        </div>
                        <button className="absolute -bottom-2 -right-2 p-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors">
                          <Camera className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex-1">
                        <div className="text-lg font-bold">{profile.firstName} {profile.lastName}</div>
                        <div className="text-sm text-gray-400">{profile.email}</div>
                        <div className="text-xs text-emerald-400 mt-1">Contador Principal</div>
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Nombre *</label>
                        <input type="text" value={profile.firstName} onChange={(e) => setProfile({...profile, firstName: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Apellido *</label>
                        <input type="text" value={profile.lastName} onChange={(e) => setProfile({...profile, lastName: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Email *</label>
                        <input type="email" value={profile.email} onChange={(e) => setProfile({...profile, email: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Teléfono</label>
                        <input type="tel" value={profile.phone} onChange={(e) => setProfile({...profile, phone: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="+34 XXX XXX XXX" />
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Zona Horaria</label>
                        <select value={profile.timezone} onChange={(e) => setProfile({...profile, timezone: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                          <option value="Europe/Madrid">Europe/Madrid (GMT+1)</option>
                          <option value="Europe/London">Europe/London (GMT)</option>
                          <option value="America/New_York">America/New_York (GMT-5)</option>
                          <option value="America/Los_Angeles">America/Los_Angeles (GMT-8)</option>
                          <option value="America/Mexico_City">America/Mexico_City (GMT-6)</option>
                          <option value="America/Bogota">America/Bogota (GMT-5)</option>
                          <option value="America/Buenos_Aires">America/Buenos_Aires (GMT-3)</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs text-gray-500 mb-1 block">Idioma</label>
                        <select value={profile.language} onChange={(e) => setProfile({...profile, language: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm">
                          <option value="es">🇪🇸 Español</option>
                          <option value="en">🇺🇸 English</option>
                          <option value="pt">🇧🇷 Português</option>
                          <option value="fr">🇫🇷 Français</option>
                        </select>
                      </div>
                    </div>
                    <div className="mt-4">
                      <label className="text-xs text-gray-500 mb-1 block">Biografía</label>
                      <textarea value={profile.bio} onChange={(e) => setProfile({...profile, bio: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-20 resize-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all" placeholder="Escribe algo sobre ti..." />
                      <div className="text-xs text-gray-500 mt-1 text-right">{profile.bio.length}/200</div>
                    </div>
                    <div className="flex gap-3 mt-4">
                      <button onClick={() => showToast('Perfil guardado correctamente', 'success')} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
                        <Save className="w-4 h-4" />Guardar Cambios
                      </button>
                      <button className="px-4 py-2 bg-[#1a1625] hover:bg-[#1a1625]/80 rounded-lg text-sm text-gray-400 transition-colors">Cancelar</button>
                    </div>
                  </div>

                  {/* Panel Lateral - Resumen de Cuenta */}
                  <div className="space-y-4">
                    <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard className="w-5 h-5 text-purple-400" />Resumen de Cuenta</h3>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                          <span className="text-sm text-gray-400">Rol</span>
                          <span className="text-sm font-medium text-emerald-400">Contador</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                          <span className="text-sm text-gray-400">Miembro desde</span>
                          <span className="text-sm font-medium">Nov 2024</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                          <span className="text-sm text-gray-400">Último acceso</span>
                          <span className="text-sm font-medium">Hoy, 08:30</span>
                        </div>
                        <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                          <span className="text-sm text-gray-400">Estado</span>
                          <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-full text-xs">Activo</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                      <h3 className="font-bold mb-4 flex items-center gap-2"><Activity className="w-5 h-5 text-blue-400" />Actividad Reciente</h3>
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-emerald-400 rounded-full mt-2"></div>
                          <div>
                            <div className="text-sm">Retiro aprobado</div>
                            <div className="text-xs text-gray-500">Hace 2 horas</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                          <div>
                            <div className="text-sm">Configuración actualizada</div>
                            <div className="text-xs text-gray-500">Hace 5 horas</div>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                          <div>
                            <div className="text-sm">Inicio de sesión</div>
                            <div className="text-xs text-gray-500">Hoy, 08:30</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gradient-to-br from-red-900/30 to-red-800/20 rounded-xl border border-red-500/30 p-6">
                      <h3 className="font-bold mb-2 flex items-center gap-2 text-red-400"><AlertOctagon className="w-5 h-5" />Zona de Peligro</h3>
                      <p className="text-xs text-gray-400 mb-4">Acciones irreversibles para tu cuenta</p>
                      <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/30 rounded-lg text-sm text-red-400 transition-colors">
                        Desactivar Cuenta
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {settingsTab === 'security' && (
                <div className="space-y-4">
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Lock className="w-5 h-5 text-purple-400" />Cambiar Contraseña</h3>
                    <div className="space-y-3"><div><label className="text-xs text-gray-500 mb-1 block">Contraseña Actual</label><input type="password" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div><div><label className="text-xs text-gray-500 mb-1 block">Nueva Contraseña</label><input type="password" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div><div><label className="text-xs text-gray-500 mb-1 block">Confirmar</label><input type="password" className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div></div>
                    <button className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium">Actualizar</button>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5 text-emerald-400" />2FA</h3>
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl mb-4"><div><div className="text-sm font-medium">Autenticación 2FA</div><div className="text-xs text-gray-500">{security.twoFactorEnabled ? 'Activado' : 'Desactivado'}</div></div><button onClick={() => setSecurity({...security, twoFactorEnabled: !security.twoFactorEnabled})} className={`w-11 h-6 rounded-full relative ${security.twoFactorEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${security.twoFactorEnabled ? 'right-0.5' : 'left-0.5'}`} /></button></div>
                    {security.twoFactorEnabled && <div><label className="text-xs text-gray-500 mb-1 block">Método</label><select value={security.twoFactorMethod} onChange={(e) => setSecurity({...security, twoFactorMethod: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm"><option value="app">App</option><option value="sms">SMS</option><option value="email">Email</option></select></div>}
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Key className="w-5 h-5 text-yellow-400" />Preguntas de Seguridad</h3>
                    <div className="space-y-3"><div><label className="text-xs text-gray-500 mb-1 block">Pregunta 1</label><input type="text" value={security.securityQuestion1} onChange={(e) => setSecurity({...security, securityQuestion1: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div><div><label className="text-xs text-gray-500 mb-1 block">Respuesta 1</label><input type="text" value={security.securityAnswer1} onChange={(e) => setSecurity({...security, securityAnswer1: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div></div>
                    <button className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium">Guardar</button>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Monitor className="w-5 h-5 text-blue-400" />Sesiones Activas</h3>
                    <div className="space-y-3">{sessions.map(s => (<div key={s.id} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><Monitor className="w-5 h-5 text-gray-400" /><div><div className="text-sm font-medium">{s.device} • {s.browser}</div><div className="text-xs text-gray-500">{s.location} • {s.lastActive}</div></div></div>{s.current ? <span className="text-xs text-emerald-400">Actual</span> : <button onClick={() => handleCloseSession(s.id)} className="text-xs text-red-400">Cerrar</button>}</div>))}</div>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><History className="w-5 h-5 text-purple-400" />Historial de Login</h3>
                    <div className="space-y-2">{loginHistory.map(l => (<div key={l.id} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-xl"><div><div className="text-sm">{l.date}</div><div className="text-xs text-gray-500">{l.device} • {l.location}</div></div><span className={`px-2 py-1 rounded-full text-xs ${l.status === 'success' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{l.status === 'success' ? 'OK' : 'Fallido'}</span></div>))}</div>
                  </div>
                  <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><Smartphone className="w-5 h-5 text-emerald-400" />Dispositivos Confiables</h3>
                    <div className="space-y-3">{trustedDevices.map(d => (<div key={d.id} className="flex items-center justify-between p-3 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3">{d.type === 'desktop' ? <Monitor className="w-5 h-5 text-gray-400" /> : <Smartphone className="w-5 h-5 text-gray-400" />}<div><div className="text-sm font-medium">{d.name}</div><div className="text-xs text-gray-500">Último: {d.lastUsed}</div></div></div><button onClick={() => handleRemoveTrustedDevice(d.id)} className="p-1.5 bg-red-500/20 hover:bg-red-500/30 rounded-lg"><Trash2 className="w-4 h-4 text-red-400" /></button></div>))}</div>
                    <button className="mt-4 px-4 py-2 bg-[#1a1625] rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" />Añadir</button>
                  </div>
                </div>
              )}
              {settingsTab === 'notifications' && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4">Notificaciones</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><Mail className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Email - Nuevos Retiros</div></div></div><button onClick={() => setNotifications({...notifications, emailNewWithdrawal: !notifications.emailNewWithdrawal})} className={`w-11 h-6 rounded-full relative ${notifications.emailNewWithdrawal ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${notifications.emailNewWithdrawal ? 'right-0.5' : 'left-0.5'}`} /></button></div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><AlertTriangle className="w-5 h-5 text-yellow-400" /><div><div className="text-sm font-medium">Transacciones Grandes</div></div></div><button onClick={() => setNotifications({...notifications, emailLargeTransaction: !notifications.emailLargeTransaction})} className={`w-11 h-6 rounded-full relative ${notifications.emailLargeTransaction ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${notifications.emailLargeTransaction ? 'right-0.5' : 'left-0.5'}`} /></button></div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><FileText className="w-5 h-5 text-blue-400" /><div><div className="text-sm font-medium">Reporte Diario</div></div></div><button onClick={() => setNotifications({...notifications, emailDailyReport: !notifications.emailDailyReport})} className={`w-11 h-6 rounded-full relative ${notifications.emailDailyReport ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${notifications.emailDailyReport ? 'right-0.5' : 'left-0.5'}`} /></button></div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><Volume2 className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Sonidos</div></div></div><button onClick={() => setNotifications({...notifications, soundEnabled: !notifications.soundEnabled})} className={`w-11 h-6 rounded-full relative ${notifications.soundEnabled ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${notifications.soundEnabled ? 'right-0.5' : 'left-0.5'}`} /></button></div>
                    <div className="p-4 bg-[#1a1625] rounded-xl"><label className="text-xs text-gray-500 mb-2 block">Umbral Transacciones Grandes ($)</label><input type="number" value={notifications.largeTransactionThreshold} onChange={(e) => setNotifications({...notifications, largeTransactionThreshold: parseInt(e.target.value)})} className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium">Guardar</button>
                </div>
              )}
              {settingsTab === 'limits' && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4">Límites de Transacciones</h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div><label className="text-xs text-gray-500 mb-1 block">Límite Diario ($)</label><input type="number" value={limits.dailyWithdrawalLimit} onChange={(e) => setLimits({...limits, dailyWithdrawalLimit: parseInt(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Límite por Transacción ($)</label><input type="number" value={limits.singleTransactionLimit} onChange={(e) => setLimits({...limits, singleTransactionLimit: parseInt(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Requiere Aprobación Arriba de ($)</label><input type="number" value={limits.requireApprovalAbove} onChange={(e) => setLimits({...limits, requireApprovalAbove: parseInt(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                    <div><label className="text-xs text-gray-500 mb-1 block">Auto-aprobar Debajo de ($)</label><input type="number" value={limits.autoApproveBelow} onChange={(e) => setLimits({...limits, autoApproveBelow: parseInt(e.target.value)})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
                  </div>
                  <button className="mt-4 px-4 py-2 bg-emerald-600 rounded-lg text-sm font-medium">Guardar</button>
                </div>
              )}
              {settingsTab === 'privacy' && (
                <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                  <h3 className="font-bold mb-4">Privacidad</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><Eye className="w-5 h-5 text-purple-400" /><div><div className="text-sm font-medium">Mostrar Estado Online</div></div></div><button className="w-11 h-6 bg-emerald-600 rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute right-0.5 top-0.5" /></button></div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><Activity className="w-5 h-5 text-emerald-400" /><div><div className="text-sm font-medium">Mostrar Actividad</div></div></div><button className="w-11 h-6 bg-gray-600 rounded-full relative"><div className="w-5 h-5 bg-white rounded-full absolute left-0.5 top-0.5" /></button></div>
                    <div className="flex items-center justify-between p-4 bg-[#1a1625] rounded-xl"><div className="flex items-center gap-3"><Moon className="w-5 h-5 text-blue-400" /><div><div className="text-sm font-medium">Modo Oscuro</div></div></div><button onClick={() => setDarkMode(!darkMode)} className={`w-11 h-6 rounded-full relative ${darkMode ? 'bg-emerald-600' : 'bg-gray-600'}`}><div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 ${darkMode ? 'right-0.5' : 'left-0.5'}`} /></button></div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Adjust Balance Modal */}
      {showAdjustModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Ajustar Balance</h2>
            <p className="text-gray-400 mb-4">Usuario: <strong>{selectedUser.name}</strong> ({selectedUser.odId})</p>
            <p className="text-gray-400 mb-4">Balance actual: <strong className="text-emerald-400">${selectedUser.balance.toLocaleString()}</strong></p>
            <div className="mb-4"><label className="text-xs text-gray-500 mb-1 block">Monto (+/-)</label><input type="number" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="Ej: 100 o -50" /></div>
            <div className="mb-4"><label className="text-xs text-gray-500 mb-1 block">Razón *</label><textarea value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Motivo del ajuste..." /></div>
            <div className="flex gap-3"><button onClick={() => { setShowAdjustModal(false); setSelectedUser(null); setAdjustAmount(''); setAdjustReason(''); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button><button onClick={handleAdjustBalance} disabled={!adjustAmount || !adjustReason} className="flex-1 py-2 bg-emerald-600 rounded-lg text-sm font-medium disabled:opacity-50">Aplicar</button></div>
          </div>
        </div>
      )}

      {/* Confirm Approve Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Confirmar Aprobación</h2>
            <p className="text-gray-400 mb-4">¿Aprobar retiro de <strong className="text-emerald-400">${showConfirmModal.amount}</strong> para <strong>{showConfirmModal.userName}</strong>?</p>
            <div className="bg-[#1a1625] rounded-lg p-3 mb-4 text-sm">
              <div className="flex justify-between mb-1"><span className="text-gray-500">Método:</span><span>{showConfirmModal.method} ({showConfirmModal.network})</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Wallet:</span><code className="text-xs">{showConfirmModal.walletAddress}</code></div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowConfirmModal(null)} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={confirmApprove} className="flex-1 py-2 bg-emerald-600 rounded-lg text-sm font-medium">Aprobar</button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <h2 className="text-lg font-bold mb-4">Rechazar Retiro</h2>
            <p className="text-gray-400 mb-4">Rechazar retiro de <strong className="text-red-400">${selectedWithdrawal.amount}</strong> para <strong>{selectedWithdrawal.userName}</strong></p>
            <div className="mb-4">
              <label className="text-xs text-gray-500 mb-1 block">Razón del rechazo *</label>
              <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="Explica el motivo..." />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setSelectedWithdrawal(null); setRejectReason(''); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={confirmReject} disabled={!rejectReason} className="flex-1 py-2 bg-red-600 rounded-lg text-sm font-medium disabled:opacity-50">Rechazar</button>
            </div>
          </div>
        </div>
      )}

      {/* User History Modal */}
      {showUserHistoryModal && selectedUser && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-2xl w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><History className="w-5 h-5 text-purple-400" />Historial de {selectedUser.name}</h2>
              <button onClick={() => { setShowUserHistoryModal(false); setSelectedUser(null); }} className="p-1.5 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="bg-[#1a1625] rounded-lg p-3 text-center"><div className="text-lg font-bold text-emerald-400">${selectedUser.balance.toLocaleString()}</div><div className="text-xs text-gray-500">Balance</div></div>
              <div className="bg-[#1a1625] rounded-lg p-3 text-center"><div className="text-lg font-bold text-emerald-400">+${selectedUser.totalDeposits.toLocaleString()}</div><div className="text-xs text-gray-500">Depósitos</div></div>
              <div className="bg-[#1a1625] rounded-lg p-3 text-center"><div className="text-lg font-bold text-red-400">-${selectedUser.totalWithdrawals.toLocaleString()}</div><div className="text-xs text-gray-500">Retiros</div></div>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full">
                <thead className="bg-[#1a1625] sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Tipo</th>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Monto</th>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Fecha</th>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Estado</th>
                    <th className="text-left px-3 py-2 text-xs text-gray-500">Detalles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/10">
                  {userTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-[#1a1625]/50">
                      <td className="px-3 py-2"><span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.type === 'deposit' ? 'bg-emerald-500/20 text-emerald-400' : tx.type === 'withdrawal' ? 'bg-red-500/20 text-red-400' : tx.type === 'prize' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-purple-500/20 text-purple-400'}`}>{tx.type === 'deposit' ? 'Depósito' : tx.type === 'withdrawal' ? 'Retiro' : tx.type === 'prize' ? 'Premio' : 'Ajuste'}</span></td>
                      <td className="px-3 py-2"><span className={tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}>{tx.amount >= 0 ? '+' : ''}${tx.amount.toLocaleString()}</span></td>
                      <td className="px-3 py-2 text-sm text-gray-400">{tx.date}</td>
                      <td className="px-3 py-2"><span className="text-xs text-gray-400">{tx.status}</span></td>
                      <td className="px-3 py-2 text-xs text-gray-500">{tx.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end"><button onClick={() => { setShowUserHistoryModal(false); setSelectedUser(null); }} className="px-4 py-2 bg-[#1a1625] rounded-lg text-sm">Cerrar</button></div>
          </div>
        </div>
      )}

      {/* Invoice Creation Modal */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Receipt className="w-5 h-5 text-emerald-400" />Nueva Factura</h2>
              <button onClick={() => setShowInvoiceModal(false)} className="p-1.5 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div><label className="text-xs text-gray-500 mb-1 block">Número de Factura *</label><input type="text" value={newInvoice.number} onChange={(e) => setNewInvoice({...newInvoice, number: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="INV-2025-XXX" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Cliente *</label><input type="text" value={newInvoice.client} onChange={(e) => setNewInvoice({...newInvoice, client: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="Nombre del cliente" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Monto ($) *</label><input type="number" value={newInvoice.amount} onChange={(e) => setNewInvoice({...newInvoice, amount: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" placeholder="0.00" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Fecha de Vencimiento</label><input type="date" value={newInvoice.dueDate} onChange={(e) => setNewInvoice({...newInvoice, dueDate: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm" /></div>
              <div><label className="text-xs text-gray-500 mb-1 block">Descripción</label><textarea value={newInvoice.description} onChange={(e) => setNewInvoice({...newInvoice, description: e.target.value})} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-20 resize-none" placeholder="Descripción de la factura..." /></div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowInvoiceModal(false)} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
              <button onClick={handleCreateInvoice} disabled={!newInvoice.number || !newInvoice.client || !newInvoice.amount} className="flex-1 py-2 bg-emerald-600 rounded-lg text-sm font-medium disabled:opacity-50">Crear Factura</button>
            </div>
          </div>
        </div>
      )}

      {/* Reconciliation Resolution Modal */}
      {showReconciliationModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/20 rounded-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold flex items-center gap-2"><Calculator className="w-5 h-5 text-purple-400" />Nueva Conciliación</h2>
              <button onClick={() => { setShowReconciliationModal(false); setSelectedReconciliation(null); setReconciliationNotes(''); }} className="p-1.5 hover:bg-[#1a1625] rounded-lg"><X className="w-5 h-5" /></button>
            </div>
            {selectedReconciliation ? (
              <>
                <div className="bg-[#1a1625] rounded-lg p-4 mb-4">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div><span className="text-gray-500">Fecha:</span> <span className="font-medium">{selectedReconciliation.date}</span></div>
                    <div><span className="text-gray-500">Diferencia:</span> <span className={`font-bold ${selectedReconciliation.difference === 0 ? 'text-emerald-400' : 'text-red-400'}`}>${selectedReconciliation.difference}</span></div>
                    <div><span className="text-gray-500">Esperado:</span> ${selectedReconciliation.expected.toLocaleString()}</div>
                    <div><span className="text-gray-500">Real:</span> ${selectedReconciliation.actual.toLocaleString()}</div>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="text-xs text-gray-500 mb-1 block">Notas de Resolución *</label>
                  <textarea value={reconciliationNotes} onChange={(e) => setReconciliationNotes(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm h-24 resize-none" placeholder="Explica cómo se resolvió la discrepancia..." />
                </div>
                <div className="flex gap-3">
                  <button onClick={() => { setShowReconciliationModal(false); setSelectedReconciliation(null); setReconciliationNotes(''); }} className="flex-1 py-2 bg-[#1a1625] rounded-lg text-sm">Cancelar</button>
                  <button onClick={handleResolveReconciliation} disabled={!reconciliationNotes} className="flex-1 py-2 bg-emerald-600 rounded-lg text-sm font-medium disabled:opacity-50">Resolver</button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-400 mb-4">Selecciona una discrepancia de la tabla para resolverla, o registra una nueva conciliación.</p>
                <div className="space-y-3 mb-4">
                  {reconciliations.filter(r => r.status === 'discrepancy').map(r => (
                    <button key={r.id} onClick={() => setSelectedReconciliation(r)} className="w-full p-3 bg-[#1a1625] hover:bg-[#1a1625]/80 rounded-lg text-left">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{r.date}</span>
                        <span className="text-red-400 font-bold">${r.difference}</span>
                      </div>
                    </button>
                  ))}
                  {reconciliations.filter(r => r.status === 'discrepancy').length === 0 && (
                    <div className="text-center py-4 text-gray-500 text-sm">No hay discrepancias pendientes</div>
                  )}
                </div>
                <button onClick={() => setShowReconciliationModal(false)} className="w-full py-2 bg-[#1a1625] rounded-lg text-sm">Cerrar</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

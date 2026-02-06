import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { 
  User, Shield, Settings, ArrowLeft, Camera, Edit3,
  CheckCircle, AlertCircle, XCircle, Clock, Eye, EyeOff, Copy,
  Smartphone, Key, Lock, Unlock, Globe, Bell, Volume2, Moon, Sun,
  Monitor, Trash2, LogOut, MapPin, Mail, Calendar, Award,
  TrendingUp, TrendingDown, DollarSign, Activity, FileText, Upload,
  ChevronRight, Sparkles, Zap, Crown, AlertTriangle, RefreshCw,
  Fingerprint, QrCode, Download, ExternalLink, History, X, Loader2
} from 'lucide-react';
import { Transaction, TradeHistory } from '../lib/types';
import { walletAPI, tradingAPI, securityAPI, profileAPI } from '../lib/api';

type Tab = 'overview' | 'profile' | 'security' | 'verification' | 'transactions' | 'settings';

interface Session {
  id: number;
  device: string;
  location: string;
  ip_address: string;
  last_active: string;
  is_current: boolean;
}

interface LoginRecord {
  id: number;
  ip_address: string;
  device: string;
  location: string;
  status: string;
  created_at: string;
}

interface SecurityEvent {
  id: number;
  event_type: string;
  description: string;
  ip_address: string;
  created_at: string;
}

export default function AccountPage() {
  const { user, updateUser, setupPin, disablePin } = useAuthContext();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') as Tab || 'overview';
  
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showPinSetup, setShowPinSetup] = useState(false);
  const [show2FASetup, setShow2FASetup] = useState(false);
  const [twoFASecret, setTwoFASecret] = useState('');
  const [twoFAQRUrl, setTwoFAQRUrl] = useState('');
  const [twoFACode, setTwoFACode] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [pinInput, setPinInput] = useState(['', '', '', '']);
  const [pinConfirm, setPinConfirm] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'enter' | 'confirm'>('enter');
  const [isLoading, setIsLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Data from API
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [trades, setTrades] = useState<TradeHistory[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [securityEvents, setSecurityEvents] = useState<SecurityEvent[]>([]);
  const [stats, setStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalTrades: 0,
    winRate: 0,
    totalProfit: 0
  });

  // Form states
  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    phone: user?.phone || '',
    country: user?.country || '',
    address: user?.address || ''
  });

  const [passwordForm, setPasswordForm] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    tradeAlerts: true,
    marketingEmails: false,
    sounds: true,
    darkMode: true,
    language: 'es',
    timezone: 'Europe/Madrid',
    currency: 'USD'
  });

  useEffect(() => {
    if (searchParams.get('tab')) {
      setActiveTab(searchParams.get('tab') as Tab);
    }
  }, [searchParams]);

  // Load data from API
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setDataLoading(true);
    try {
      const [walletRes, tradesRes, statsRes] = await Promise.all([
        walletAPI.getTransactions('all', 20, 0).catch(() => ({ data: { transactions: [] } })),
        tradingAPI.getTradeHistory(20, 0).catch(() => ({ data: { trades: [] } })),
        profileAPI.getStats().catch(() => ({ data: { stats: null } }))
      ]);

      setTransactions(walletRes.data.transactions || []);
      setTrades(tradesRes.data.trades || []);
      
      if (statsRes.data.stats) {
        setStats({
          totalDeposits: statsRes.data.stats.total_deposits || 0,
          totalWithdrawals: statsRes.data.stats.total_withdrawals || 0,
          totalTrades: statsRes.data.stats.total_trades || 0,
          winRate: statsRes.data.stats.win_rate || 0,
          totalProfit: statsRes.data.stats.net_profit || 0
        });
      }

      // Load security data
      try {
        const [sessionsRes, historyRes, eventsRes] = await Promise.all([
          securityAPI.getActiveSessions(),
          securityAPI.getLoginHistory(),
          securityAPI.getSecurityEvents()
        ]);
        setSessions(sessionsRes.data.sessions || []);
        setLoginHistory(historyRes.data.history || []);
        setSecurityEvents(eventsRes.data.events || []);
      } catch (err) {
        // Security endpoints may not be available yet
        console.log('Security data not available');
      }
    } catch (err) {
      console.error('Error loading account data:', err);
    } finally {
      setDataLoading(false);
    }
  };

  const handleInvalidateSession = async (sessionId: number) => {
    try {
      await securityAPI.invalidateSession(sessionId);
      showNotificationMessage('success', 'Sesión cerrada');
      loadData();
    } catch (err) {
      showNotificationMessage('error', 'Error cerrando sesión');
    }
  };

  const handleInvalidateAllSessions = async () => {
    if (!confirm('¿Cerrar todas las sesiones excepto la actual?')) return;
    try {
      await securityAPI.invalidateAllSessions();
      showNotificationMessage('success', 'Todas las sesiones cerradas');
      loadData();
    } catch (err) {
      showNotificationMessage('error', 'Error cerrando sesiones');
    }
  };

  const showNotificationMessage = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 3000);
  };

  const handlePinInput = (index: number, value: string, isConfirm = false) => {
    if (!/^\d*$/.test(value)) return;
    const newPin = isConfirm ? [...pinConfirm] : [...pinInput];
    newPin[index] = value.slice(-1);
    isConfirm ? setPinConfirm(newPin) : setPinInput(newPin);
    
    if (value && index < 3) {
      const nextInput = document.getElementById(`pin-${isConfirm ? 'confirm-' : ''}${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleSetupPin = async () => {
    const pin = pinInput.join('');
    const confirm = pinConfirm.join('');
    
    if (pinStep === 'enter') {
      if (pin.length !== 4) {
        showNotificationMessage('error', 'Ingresa un PIN de 4 dígitos');
        return;
      }
      setPinStep('confirm');
      return;
    }

    if (pin !== confirm) {
      showNotificationMessage('error', 'Los PINs no coinciden');
      setPinConfirm(['', '', '', '']);
      return;
    }

    setIsLoading(true);
    const success = await setupPin(pin);
    setIsLoading(false);

    if (success) {
      showNotificationMessage('success', 'PIN configurado correctamente');
      setShowPinSetup(false);
      setPinInput(['', '', '', '']);
      setPinConfirm(['', '', '', '']);
      setPinStep('enter');
    } else {
      showNotificationMessage('error', 'Error al configurar el PIN');
    }
  };

  const handleDisablePin = async () => {
    setIsLoading(true);
    const success = await disablePin();
    setIsLoading(false);
    
    if (success) {
      showNotificationMessage('success', 'PIN desactivado');
    }
  };

  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      await profileAPI.updateProfile(profileForm);
      updateUser(profileForm);
      setIsEditing(false);
      showNotificationMessage('success', 'Perfil actualizado correctamente');
    } catch (err) {
      showNotificationMessage('error', 'Error actualizando perfil');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      showNotificationMessage('error', 'Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.new.length < 8) {
      showNotificationMessage('error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    setIsLoading(true);
    try {
      await profileAPI.changePassword({
        current_password: passwordForm.current,
        new_password: passwordForm.new
      });
      setPasswordForm({ current: '', new: '', confirm: '' });
      showNotificationMessage('success', 'Contraseña actualizada correctamente');
    } catch (err: any) {
      showNotificationMessage('error', err.response?.data?.error || 'Error actualizando contraseña');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showNotificationMessage('success', 'Copiado al portapapeles');
  };

  const tabs = [
    { id: 'overview' as Tab, label: 'Resumen', icon: Activity },
    { id: 'profile' as Tab, label: 'Perfil', icon: User },
    { id: 'security' as Tab, label: 'Seguridad', icon: Shield },
    { id: 'verification' as Tab, label: 'Verificación', icon: Award },
    { id: 'transactions' as Tab, label: 'Historial', icon: History },
    { id: 'settings' as Tab, label: 'Ajustes', icon: Settings }
  ];

  const getVerificationStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'text-emerald-400 bg-emerald-500/20';
      case 'pending': return 'text-yellow-400 bg-yellow-500/20';
      case 'rejected': return 'text-red-400 bg-red-500/20';
      default: return 'text-gray-400 bg-gray-500/20';
    }
  };

  // Calculate stats from real data
  const calculatedStats = {
    totalDeposits: stats.totalDeposits || transactions.filter(t => t.type === 'deposit' && t.status === 'completed').reduce((a, b) => a + b.amount, 0),
    totalWithdrawals: stats.totalWithdrawals || transactions.filter(t => t.type === 'withdrawal' && t.status === 'completed').reduce((a, b) => a + b.amount, 0),
    totalTrades: stats.totalTrades || trades.length,
    winRate: stats.winRate || (trades.length > 0 ? Math.round((trades.filter(t => t.status === 'won').length / trades.length) * 100) : 0),
    totalProfit: stats.totalProfit || trades.reduce((a, b) => a + b.profit, 0)
  };

  if (dataLoading) {
    return (
      <div className="min-h-screen bg-[#0d0b14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0d0b14]">
      {/* Notification Toast */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-xl border animate-slide-up ${
          notification.type === 'success' 
            ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400' 
            : 'bg-red-500/20 border-red-500/30 text-red-400'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            <span className="text-sm font-medium">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-[#13111c] border-b border-purple-900/20 px-4 py-3 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/platform" className="p-2 text-gray-400 hover:text-white hover:bg-[#1a1625] rounded-lg transition-all">
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-lg font-bold">Mi Cuenta</h1>
              <p className="text-[10px] text-gray-500">Gestiona tu perfil y seguridad</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/20 text-yellow-400 rounded-lg text-xs font-medium hover:bg-yellow-500/30 transition-all">
                <Crown className="w-3.5 h-3.5" />
                Admin
              </Link>
            )}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium ${
              user?.is_verified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-yellow-500/20 text-yellow-400'
            }`}>
              {user?.is_verified ? <CheckCircle className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
              {user?.is_verified ? 'Verificado' : 'Sin verificar'}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row">
        {/* Sidebar */}
        <aside className="w-full md:w-56 bg-[#13111c] md:border-r border-purple-900/20 md:min-h-[calc(100vh-65px)] flex-shrink-0">
          {/* User Card Mini */}
          <div className="p-4 border-b border-purple-900/20">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-violet-600 rounded-xl flex items-center justify-center text-lg font-bold">
                  {user?.first_name?.[0] || 'U'}
                </div>
                {user?.is_verified && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#13111c]">
                    <CheckCircle className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm truncate">{user?.first_name} {user?.last_name}</div>
                <div className="text-[10px] text-gray-500 truncate">{user?.email}</div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-2 flex md:flex-col gap-1 overflow-x-auto md:overflow-visible">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[11px] font-medium transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/20' 
                    : 'text-gray-400 hover:bg-[#1a1625] hover:text-white'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="hidden md:block p-4 border-t border-purple-900/20 mt-auto">
            <div className="bg-[#1a1625] rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Balance Real</span>
                <span className="text-emerald-400 font-bold">${user?.balance?.toLocaleString() || '0'}</span>
              </div>
              <div className="flex justify-between text-[10px]">
                <span className="text-gray-500">Balance Demo</span>
                <span className="text-purple-400 font-bold">${user?.demo_balance?.toLocaleString() || '10,000'}</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">

          {/* OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Welcome Banner */}
              <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-xl p-5 border border-purple-500/20">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-bold mb-1">¡Hola, {user?.first_name}! 👋</h2>
                    <p className="text-sm text-gray-400">Bienvenido de vuelta a tu cuenta</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-400" />
                    <span className="text-xs text-purple-400 font-medium">Nivel: Trader</span>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-emerald-400">${calculatedStats.totalDeposits.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">Total Depósitos</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-orange-500/20 rounded-lg flex items-center justify-center">
                      <TrendingDown className="w-4 h-4 text-orange-400" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-orange-400">${calculatedStats.totalWithdrawals.toLocaleString()}</div>
                  <div className="text-[10px] text-gray-500">Total Retiros</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Activity className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-purple-400">{calculatedStats.totalTrades}</div>
                  <div className="text-[10px] text-gray-500">Operaciones</div>
                </div>
                <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                      <Zap className="w-4 h-4 text-purple-400" />
                    </div>
                  </div>
                  <div className="text-xl font-bold text-purple-400">{calculatedStats.winRate}%</div>
                  <div className="text-[10px] text-gray-500">Win Rate</div>
                </div>
              </div>

              {/* Balance Cards */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/20 rounded-xl p-5 border border-emerald-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-emerald-300">Balance Real</span>
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">${user?.balance?.toLocaleString() || '0.00'}</div>
                  <div className="text-xs text-emerald-400">Disponible para trading</div>
                </div>
                <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 rounded-xl p-5 border border-purple-500/20">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-purple-300">Balance Demo</span>
                    <Activity className="w-5 h-5 text-purple-400" />
                  </div>
                  <div className="text-3xl font-bold text-white mb-1">${user?.demo_balance?.toLocaleString() || '10,000'}</div>
                  <div className="text-xs text-purple-400">Practica sin riesgo</div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20 flex items-center justify-between">
                  <h3 className="font-semibold text-sm">Actividad Reciente</h3>
                  <button onClick={() => setActiveTab('transactions')} className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1">
                    Ver todo <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="divide-y divide-purple-900/10">
                  {trades.slice(0, 3).map(trade => (
                    <div key={trade.id} className="p-3 flex items-center justify-between hover:bg-[#1a1625] transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                          trade.direction === 'up' ? 'bg-emerald-500/20' : 'bg-red-500/20'
                        }`}>
                          {trade.direction === 'up' ? 
                            <TrendingUp className="w-4 h-4 text-emerald-400" /> : 
                            <TrendingDown className="w-4 h-4 text-red-400" />
                          }
                        </div>
                        <div>
                          <div className="text-sm font-medium">{trade.symbol}</div>
                          <div className="text-[10px] text-gray-500">{new Date(trade.created_at).toLocaleDateString()}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-bold ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                        </div>
                        <div className={`text-[10px] px-1.5 py-0.5 rounded ${
                          trade.status === 'won' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                        }`}>
                          {trade.status === 'won' ? 'Ganada' : 'Perdida'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-purple-400" />
                  Estado de Seguridad
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className={`p-3 rounded-lg border ${user?.is_verified ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {user?.is_verified ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-yellow-400" />}
                      <span className="text-[10px] font-medium">Verificación</span>
                    </div>
                    <div className={`text-xs ${user?.is_verified ? 'text-emerald-400' : 'text-yellow-400'}`}>
                      {user?.is_verified ? 'Completada' : 'Pendiente'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${user?.pin_enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {user?.pin_enabled ? <Lock className="w-4 h-4 text-emerald-400" /> : <Unlock className="w-4 h-4 text-gray-400" />}
                      <span className="text-[10px] font-medium">PIN</span>
                    </div>
                    <div className={`text-xs ${user?.pin_enabled ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {user?.pin_enabled ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                  <div className={`p-3 rounded-lg border ${user?.two_factor_enabled ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-gray-500/10 border-gray-500/20'}`}>
                    <div className="flex items-center gap-2 mb-1">
                      {user?.two_factor_enabled ? <Smartphone className="w-4 h-4 text-emerald-400" /> : <Smartphone className="w-4 h-4 text-gray-400" />}
                      <span className="text-[10px] font-medium">2FA</span>
                    </div>
                    <div className={`text-xs ${user?.two_factor_enabled ? 'text-emerald-400' : 'text-gray-400'}`}>
                      {user?.two_factor_enabled ? 'Activo' : 'Inactivo'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4 text-emerald-400" />
                      <span className="text-[10px] font-medium">Email</span>
                    </div>
                    <div className="text-xs text-emerald-400">Verificado</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              {/* Profile Header */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div className="relative group">
                    <div className="w-20 h-20 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-lg shadow-purple-500/20">
                      {user?.first_name?.[0] || 'U'}
                    </div>
                    <button className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <Camera className="w-6 h-6" />
                    </button>
                    {user?.is_verified && (
                      <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-[#13111c]">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-xl font-bold">{user?.first_name} {user?.last_name}</h2>
                      {user?.role === 'admin' && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded text-[10px] font-medium">Admin</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-400">{user?.email}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Miembro desde {new Date(user?.created_at || '').toLocaleDateString()}</span>
                      {user?.country && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {user.country}</span>}
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsEditing(!isEditing)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      isEditing ? 'bg-gray-600 text-white' : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <Edit3 className="w-4 h-4" />
                    {isEditing ? 'Cancelar' : 'Editar Perfil'}
                  </button>
                </div>
              </div>

              {/* Profile Form */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <User className="w-4 h-4 text-purple-400" />
                  Información Personal
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Nombre</label>
                    <input 
                      type="text" 
                      value={profileForm.first_name}
                      onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 focus:border-purple-500/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Apellido</label>
                    <input 
                      type="text" 
                      value={profileForm.last_name}
                      onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 focus:border-purple-500/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Email</label>
                    <div className="relative">
                      <input 
                        type="email" 
                        value={user?.email || ''}
                        disabled
                        className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm opacity-50 pr-20"
                      />
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[9px]">Verificado</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Teléfono</label>
                    <input 
                      type="tel" 
                      value={profileForm.phone}
                      onChange={e => setProfileForm(p => ({ ...p, phone: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="+1 234 567 8900"
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 focus:border-purple-500/50 focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">País</label>
                    <select 
                      value={profileForm.country}
                      onChange={e => setProfileForm(p => ({ ...p, country: e.target.value }))}
                      disabled={!isEditing}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 focus:border-purple-500/50 focus:outline-none transition-all"
                    >
                      <option value="">Seleccionar país</option>
                      <option value="España">España</option>
                      <option value="México">México</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Chile">Chile</option>
                      <option value="Perú">Perú</option>
                      <option value="Estados Unidos">Estados Unidos</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-1.5">Dirección</label>
                    <input 
                      type="text" 
                      value={profileForm.address}
                      onChange={e => setProfileForm(p => ({ ...p, address: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Tu dirección"
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm disabled:opacity-50 focus:border-purple-500/50 focus:outline-none transition-all"
                    />
                  </div>
                </div>
                {isEditing && (
                  <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-purple-900/20">
                    <button 
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-[#1a1625] text-gray-400 rounded-lg text-sm hover:text-white transition-all"
                    >
                      Cancelar
                    </button>
                    <button 
                      onClick={handleSaveProfile}
                      disabled={isLoading}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center gap-2"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Guardar Cambios
                    </button>
                  </div>
                )}
              </div>

              {/* Account Info */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Información de la Cuenta
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                    <span className="text-gray-400">ID de Usuario</span>
                    <span className="font-mono text-purple-400">#{user?.id}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                    <span className="text-gray-400">Rol</span>
                    <span className="capitalize">{user?.role}</span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                    <span className="text-gray-400">Estado de Verificación</span>
                    <span className={`px-2 py-0.5 rounded text-xs ${getVerificationStatusColor(user?.verification_status || '')}`}>
                      {user?.verification_status === 'approved' ? 'Aprobado' : 
                       user?.verification_status === 'pending' ? 'Pendiente' : 
                       user?.verification_status === 'rejected' ? 'Rechazado' : 'No enviado'}
                    </span>
                  </div>
                  <div className="flex justify-between p-3 bg-[#1a1625] rounded-lg">
                    <span className="text-gray-400">Fecha de Registro</span>
                    <span>{new Date(user?.created_at || '').toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              {/* Security Score */}
              <div className="bg-gradient-to-r from-purple-600/20 to-violet-600/20 rounded-xl p-5 border border-purple-500/20">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-sm mb-1">Puntuación de Seguridad</h3>
                    <p className="text-xs text-gray-400">Mejora tu seguridad activando más opciones</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-purple-400">
                      {(user?.is_verified ? 25 : 0) + (user?.pin_enabled ? 25 : 0) + (user?.two_factor_enabled ? 25 : 0) + 25}%
                    </div>
                    <div className="text-xs text-gray-500">de 100%</div>
                  </div>
                </div>
                <div className="w-full bg-[#1a1625] rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-purple-500 to-violet-500 h-2 rounded-full transition-all"
                    style={{ width: `${(user?.is_verified ? 25 : 0) + (user?.pin_enabled ? 25 : 0) + (user?.two_factor_enabled ? 25 : 0) + 25}%` }}
                  />
                </div>
              </div>

              {/* PIN Security */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.pin_enabled ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
                      <Fingerprint className={`w-5 h-5 ${user?.pin_enabled ? 'text-emerald-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">PIN de Seguridad</h3>
                      <p className="text-xs text-gray-500">Protege tu cuenta con un PIN de 4 dígitos</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${user?.pin_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user?.pin_enabled ? 'Activo' : 'Inactivo'}
                  </div>
                </div>
                
                {!showPinSetup ? (
                  <div className="flex gap-2">
                    {user?.pin_enabled ? (
                      <>
                        <button 
                          onClick={() => setShowPinSetup(true)}
                          className="px-4 py-2 bg-[#1a1625] text-gray-300 rounded-lg text-sm hover:bg-purple-600/20 transition-all"
                        >
                          Cambiar PIN
                        </button>
                        <button 
                          onClick={handleDisablePin}
                          disabled={isLoading}
                          className="px-4 py-2 bg-red-500/20 text-red-400 rounded-lg text-sm hover:bg-red-500/30 transition-all"
                        >
                          Desactivar PIN
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => setShowPinSetup(true)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all"
                      >
                        Configurar PIN
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="bg-[#1a1625] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">
                        {pinStep === 'enter' ? 'Ingresa tu nuevo PIN' : 'Confirma tu PIN'}
                      </h4>
                      <button onClick={() => { setShowPinSetup(false); setPinStep('enter'); setPinInput(['','','','']); setPinConfirm(['','','','']); }}>
                        <X className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                    <div className="flex justify-center gap-3 mb-4">
                      {(pinStep === 'enter' ? pinInput : pinConfirm).map((digit, i) => (
                        <input
                          key={i}
                          id={`pin-${pinStep === 'confirm' ? 'confirm-' : ''}${i}`}
                          type="password"
                          maxLength={1}
                          value={digit}
                          onChange={e => handlePinInput(i, e.target.value, pinStep === 'confirm')}
                          className="w-12 h-14 bg-[#0d0b14] border-2 border-purple-900/30 rounded-lg text-center text-2xl font-bold focus:border-purple-500 focus:outline-none transition-all"
                        />
                      ))}
                    </div>
                    <button 
                      onClick={handleSetupPin}
                      disabled={isLoading}
                      className="w-full py-2.5 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : null}
                      {pinStep === 'enter' ? 'Continuar' : 'Confirmar PIN'}
                    </button>
                  </div>
                )}
              </div>

              {/* 2FA */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${user?.two_factor_enabled ? 'bg-emerald-500/20' : 'bg-gray-500/20'}`}>
                      <Smartphone className={`w-5 h-5 ${user?.two_factor_enabled ? 'text-emerald-400' : 'text-gray-400'}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Autenticación de Dos Factores (2FA)</h3>
                      <p className="text-xs text-gray-500">Usa Google Authenticator o similar</p>
                    </div>
                  </div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${user?.two_factor_enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user?.two_factor_enabled ? 'Activo' : 'Inactivo'}
                  </div>
                </div>

                {!show2FASetup ? (
                  <button 
                    onClick={async () => {
                      if (!user?.two_factor_enabled) {
                        setTwoFALoading(true);
                        try {
                          const res = await securityAPI.setup2FA();
                          setTwoFASecret(res.data.secret);
                          setTwoFAQRUrl(res.data.qr_code_url);
                          setShow2FASetup(true);
                        } catch (err) {
                          showNotificationMessage('error', 'Error generando configuración 2FA');
                        } finally {
                          setTwoFALoading(false);
                        }
                      } else {
                        setShow2FASetup(true);
                      }
                    }}
                    disabled={twoFALoading}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                      user?.two_factor_enabled 
                        ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                    {user?.two_factor_enabled ? 'Desactivar 2FA' : 'Activar 2FA'}
                  </button>
                ) : (
                  <div className="bg-[#1a1625] rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium">{user?.two_factor_enabled ? 'Desactivar 2FA' : 'Configurar 2FA'}</h4>
                      <button onClick={() => { setShow2FASetup(false); setTwoFACode(''); }}>
                        <X className="w-4 h-4 text-gray-400 hover:text-white" />
                      </button>
                    </div>
                    
                    {!user?.two_factor_enabled ? (
                      <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-shrink-0">
                          <div className="w-32 h-32 bg-white rounded-lg flex items-center justify-center p-2">
                            {twoFAQRUrl ? (
                              <img 
                                src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(twoFAQRUrl)}`} 
                                alt="QR Code" 
                                className="w-full h-full"
                              />
                            ) : (
                              <QrCode className="w-20 h-20 text-black" />
                            )}
                          </div>
                          <p className="text-[10px] text-gray-500 text-center mt-2">Escanea con tu app</p>
                        </div>
                        <div className="flex-1 space-y-3">
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Clave secreta (si no puedes escanear)</label>
                            <div className="flex items-center gap-2">
                              <code className="flex-1 bg-[#0d0b14] px-3 py-2 rounded text-xs font-mono text-purple-400 break-all">{twoFASecret}</code>
                              <button onClick={() => copyToClipboard(twoFASecret)} className="p-2 bg-[#0d0b14] rounded hover:bg-purple-600/20">
                                <Copy className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          <div>
                            <label className="text-[10px] text-gray-500 block mb-1">Código de verificación</label>
                            <input 
                              type="text" 
                              placeholder="000000"
                              maxLength={6}
                              value={twoFACode}
                              onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest focus:border-purple-500 focus:outline-none"
                            />
                          </div>
                          <button 
                            onClick={async () => {
                              if (twoFACode.length !== 6) {
                                showNotificationMessage('error', 'Ingresa un código de 6 dígitos');
                                return;
                              }
                              setTwoFALoading(true);
                              try {
                                await securityAPI.enable2FA(twoFASecret, twoFACode);
                                updateUser({ two_factor_enabled: true });
                                setShow2FASetup(false);
                                setTwoFACode('');
                                showNotificationMessage('success', '2FA activado correctamente');
                              } catch (err: any) {
                                showNotificationMessage('error', err.response?.data?.error || 'Código inválido');
                              } finally {
                                setTwoFALoading(false);
                              }
                            }}
                            disabled={twoFALoading || twoFACode.length !== 6}
                            className="w-full py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                          >
                            {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                            Verificar y Activar
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-gray-400">Ingresa el código de tu app de autenticación para desactivar 2FA.</p>
                        <input 
                          type="text" 
                          placeholder="000000"
                          maxLength={6}
                          value={twoFACode}
                          onChange={e => setTwoFACode(e.target.value.replace(/\D/g, ''))}
                          className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono text-center tracking-widest focus:border-purple-500 focus:outline-none"
                        />
                        <button 
                          onClick={async () => {
                            setTwoFALoading(true);
                            try {
                              await securityAPI.disable2FA(twoFACode);
                              updateUser({ two_factor_enabled: false });
                              setShow2FASetup(false);
                              setTwoFACode('');
                              showNotificationMessage('success', '2FA desactivado');
                            } catch (err: any) {
                              showNotificationMessage('error', err.response?.data?.error || 'Error desactivando 2FA');
                            } finally {
                              setTwoFALoading(false);
                            }
                          }}
                          disabled={twoFALoading}
                          className="w-full py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {twoFALoading && <Loader2 className="w-4 h-4 animate-spin" />}
                          Desactivar 2FA
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Change Password */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-orange-500/20 rounded-xl flex items-center justify-center">
                    <Key className="w-5 h-5 text-orange-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Cambiar Contraseña</h3>
                    <p className="text-xs text-gray-500">Actualiza tu contraseña regularmente</p>
                  </div>
                </div>
                <div className="space-y-3 max-w-md">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Contraseña actual</label>
                    <div className="relative">
                      <input 
                        type={showCurrentPassword ? 'text' : 'password'}
                        value={passwordForm.current}
                        onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                        className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm pr-10 focus:border-purple-500 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Nueva contraseña</label>
                    <div className="relative">
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.new}
                        onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                        className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm pr-10 focus:border-purple-500 focus:outline-none"
                      />
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1">Confirmar nueva contraseña</label>
                    <input 
                      type="password"
                      value={passwordForm.confirm}
                      onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                    />
                  </div>
                  <button 
                    onClick={handleChangePassword}
                    disabled={isLoading || !passwordForm.current || !passwordForm.new}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-all disabled:opacity-50"
                  >
                    Cambiar Contraseña
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Monitor className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm">Sesiones Activas</h3>
                      <p className="text-xs text-gray-500">Dispositivos conectados a tu cuenta</p>
                    </div>
                  </div>
                  <button onClick={handleInvalidateAllSessions} className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all">
                    Cerrar todas
                  </button>
                </div>
                <div className="space-y-2">
                  {sessions.length === 0 ? (
                    <div className="text-center py-4 text-gray-500 text-sm">No hay sesiones activas</div>
                  ) : sessions.map(session => (
                    <div key={session.id} className={`flex items-center justify-between p-3 rounded-lg ${session.is_current ? 'bg-emerald-500/10 border border-emerald-500/20' : 'bg-[#1a1625]'}`}>
                      <div className="flex items-center gap-3">
                        <Monitor className={`w-5 h-5 ${session.is_current ? 'text-emerald-400' : 'text-gray-400'}`} />
                        <div>
                          <div className="text-sm font-medium flex items-center gap-2">
                            {session.device}
                            {session.is_current && <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px]">Actual</span>}
                          </div>
                          <div className="text-[10px] text-gray-500">{session.location} • {session.ip_address} • {new Date(session.last_active).toLocaleString()}</div>
                        </div>
                      </div>
                      {!session.is_current && (
                        <button onClick={() => handleInvalidateSession(session.id)} className="p-1.5 text-red-400 hover:bg-red-500/20 rounded transition-all">
                          <LogOut className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* VERIFICATION TAB */}
          {activeTab === 'verification' && (
            <div className="space-y-6">
              {/* Verification Status Banner */}
              <div className={`rounded-xl p-5 border ${
                user?.verification_status === 'approved' 
                  ? 'bg-emerald-500/10 border-emerald-500/20' 
                  : user?.verification_status === 'pending'
                  ? 'bg-yellow-500/10 border-yellow-500/20'
                  : user?.verification_status === 'rejected'
                  ? 'bg-red-500/10 border-red-500/20'
                  : 'bg-purple-500/10 border-purple-500/20'
              }`}>
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    user?.verification_status === 'approved' ? 'bg-emerald-500/20' :
                    user?.verification_status === 'pending' ? 'bg-yellow-500/20' :
                    user?.verification_status === 'rejected' ? 'bg-red-500/20' : 'bg-purple-500/20'
                  }`}>
                    {user?.verification_status === 'approved' ? <CheckCircle className="w-6 h-6 text-emerald-400" /> :
                     user?.verification_status === 'pending' ? <Clock className="w-6 h-6 text-yellow-400" /> :
                     user?.verification_status === 'rejected' ? <XCircle className="w-6 h-6 text-red-400" /> :
                     <Award className="w-6 h-6 text-purple-400" />}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm mb-1">
                      {user?.verification_status === 'approved' ? 'Cuenta Verificada' :
                       user?.verification_status === 'pending' ? 'Verificación en Proceso' :
                       user?.verification_status === 'rejected' ? 'Verificación Rechazada' :
                       'Verificación Requerida'}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {user?.verification_status === 'approved' ? 'Tu identidad ha sido verificada exitosamente. Tienes acceso completo a todas las funciones.' :
                       user?.verification_status === 'pending' ? 'Estamos revisando tus documentos. Este proceso puede tomar hasta 48 horas.' :
                       user?.verification_status === 'rejected' ? 'Tu verificación fue rechazada. Por favor, revisa los motivos y vuelve a enviar tus documentos.' :
                       'Verifica tu identidad para desbloquear retiros y límites más altos.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Beneficios de la Verificación
                </h3>
                <div className="grid md:grid-cols-3 gap-3">
                  <div className="bg-[#1a1625] rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-sm font-medium mb-1">Retiros Ilimitados</div>
                    <div className="text-[10px] text-gray-500">Sin límites de retiro diario</div>
                  </div>
                  <div className="bg-[#1a1625] rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Zap className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-sm font-medium mb-1">Retiros Rápidos</div>
                    <div className="text-[10px] text-gray-500">Procesamiento prioritario</div>
                  </div>
                  <div className="bg-[#1a1625] rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Shield className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="text-sm font-medium mb-1">Mayor Seguridad</div>
                    <div className="text-[10px] text-gray-500">Protección adicional</div>
                  </div>
                </div>
              </div>

              {/* KYC Documents */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-purple-400" />
                  Documentos Requeridos
                </h3>
                <div className="space-y-3">
                  {[
                    { type: 'id_front', label: 'Documento de Identidad (Frente)', description: 'DNI, Pasaporte o Licencia de conducir', status: user?.verification_status === 'approved' ? 'approved' : 'not_submitted' },
                    { type: 'id_back', label: 'Documento de Identidad (Reverso)', description: 'Parte trasera del documento', status: user?.verification_status === 'approved' ? 'approved' : 'not_submitted' },
                    { type: 'selfie', label: 'Selfie con Documento', description: 'Foto tuya sosteniendo el documento', status: user?.verification_status === 'approved' ? 'approved' : 'not_submitted' },
                    { type: 'proof_address', label: 'Comprobante de Domicilio', description: 'Factura de servicios o extracto bancario (máx. 3 meses)', status: user?.verification_status === 'approved' ? 'approved' : 'not_submitted' }
                  ].map((doc, i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-[#1a1625] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                          doc.status === 'approved' ? 'bg-emerald-500/20' :
                          doc.status === 'pending' ? 'bg-yellow-500/20' :
                          doc.status === 'rejected' ? 'bg-red-500/20' : 'bg-gray-500/20'
                        }`}>
                          {doc.status === 'approved' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> :
                           doc.status === 'pending' ? <Clock className="w-5 h-5 text-yellow-400" /> :
                           doc.status === 'rejected' ? <XCircle className="w-5 h-5 text-red-400" /> :
                           <Upload className="w-5 h-5 text-gray-400" />}
                        </div>
                        <div>
                          <div className="text-sm font-medium">{doc.label}</div>
                          <div className="text-[10px] text-gray-500">{doc.description}</div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                          doc.status === 'approved' ? 'bg-emerald-500/20 text-emerald-400' :
                          doc.status === 'pending' ? 'bg-yellow-500/20 text-yellow-400' :
                          doc.status === 'rejected' ? 'bg-red-500/20 text-red-400' : 'bg-gray-500/20 text-gray-400'
                        }`}>
                          {doc.status === 'approved' ? 'Aprobado' :
                           doc.status === 'pending' ? 'En revisión' :
                           doc.status === 'rejected' ? 'Rechazado' : 'Pendiente'}
                        </span>
                        {doc.status !== 'approved' && doc.status !== 'pending' && (
                          <label className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium cursor-pointer hover:bg-purple-700 transition-all">
                            <input type="file" className="hidden" accept="image/*,.pdf" />
                            Subir
                          </label>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Guidelines */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                  Requisitos de los Documentos
                </h3>
                <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-400">
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Documentos legibles y sin recortes</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Fotos en color, no en blanco y negro</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Documentos vigentes (no caducados)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Tamaño máximo: 10MB por archivo</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Formatos: JPG, PNG o PDF</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                      <span>Selfie: rostro y documento visibles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TRANSACTIONS TAB */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              {/* Filters */}
              <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 bg-purple-600 text-white rounded-lg text-xs font-medium">Todos</button>
                <button className="px-3 py-1.5 bg-[#1a1625] text-gray-400 rounded-lg text-xs hover:text-white transition-all">Depósitos</button>
                <button className="px-3 py-1.5 bg-[#1a1625] text-gray-400 rounded-lg text-xs hover:text-white transition-all">Retiros</button>
                <button className="px-3 py-1.5 bg-[#1a1625] text-gray-400 rounded-lg text-xs hover:text-white transition-all">Operaciones</button>
              </div>

              {/* Transactions List */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20">
                  <h3 className="font-semibold text-sm">Historial de Transacciones</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Tipo</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Método</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Monto</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Estado</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Fecha</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {transactions.length === 0 ? (
                        <tr><td colSpan={6} className="text-center py-8 text-gray-500">No hay transacciones</td></tr>
                      ) : transactions.map(tx => (
                        <tr key={tx.id} className="hover:bg-[#1a1625] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                                tx.type === 'deposit' ? 'bg-emerald-500/20' : 'bg-orange-500/20'
                              }`}>
                                {tx.type === 'deposit' ? 
                                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" /> : 
                                  <TrendingDown className="w-3.5 h-3.5 text-orange-400" />
                                }
                              </div>
                              <span className="text-xs font-medium capitalize">{tx.type === 'deposit' ? 'Depósito' : 'Retiro'}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-400">{tx.method}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${tx.type === 'deposit' ? 'text-emerald-400' : 'text-orange-400'}`}>
                              {tx.type === 'deposit' ? '+' : '-'}${tx.amount.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-medium ${
                              tx.status === 'completed' ? 'bg-emerald-500/20 text-emerald-400' :
                              tx.status === 'pending' ? 'bg-purple-500/20 text-purple-400' :
                              tx.status === 'processing' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {tx.status === 'completed' ? 'Completado' :
                               tx.status === 'pending' ? 'Pendiente' :
                               tx.status === 'processing' ? 'Procesando' : 'Rechazado'}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3">
                            <button className="p-1.5 text-gray-400 hover:text-white hover:bg-[#0d0b14] rounded transition-all">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Trade History */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
                <div className="p-4 border-b border-purple-900/20">
                  <h3 className="font-semibold text-sm">Historial de Operaciones</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[#1a1625]">
                      <tr>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Par</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Dirección</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Inversión</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Entrada</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Salida</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Resultado</th>
                        <th className="text-left px-4 py-3 text-[10px] text-gray-500 font-medium">Fecha</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-purple-900/10">
                      {trades.length === 0 ? (
                        <tr><td colSpan={7} className="text-center py-8 text-gray-500">No hay operaciones</td></tr>
                      ) : trades.map(trade => (
                        <tr key={trade.id} className="hover:bg-[#1a1625] transition-colors">
                          <td className="px-4 py-3">
                            <span className="text-xs font-medium">{trade.symbol}</span>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                              trade.direction === 'up' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                            }`}>
                              {trade.direction === 'up' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                              {trade.direction === 'up' ? 'Compra' : 'Venta'}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs">${trade.amount}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">${trade.entry_price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-xs text-gray-400">${trade.exit_price.toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <span className={`text-sm font-bold ${trade.profit >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                              {trade.profit >= 0 ? '+' : ''}${trade.profit.toFixed(2)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs text-gray-500">
                            {new Date(trade.created_at).toLocaleDateString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Export */}
              <div className="flex justify-end">
                <button className="flex items-center gap-2 px-4 py-2 bg-[#1a1625] text-gray-300 rounded-lg text-xs hover:text-white transition-all">
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </div>
          )}

          {/* SETTINGS TAB */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              {/* Notifications */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Bell className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Notificaciones</h3>
                    <p className="text-xs text-gray-500">Configura cómo quieres recibir alertas</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Notificaciones por Email</div>
                      <div className="text-[10px] text-gray-500">Recibe actualizaciones importantes</div>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, emailNotifications: !p.emailNotifications }))}
                      className={`w-11 h-6 rounded-full transition-all ${preferences.emailNotifications ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${preferences.emailNotifications ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Alertas de Trading</div>
                      <div className="text-[10px] text-gray-500">Notificaciones de operaciones</div>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, tradeAlerts: !p.tradeAlerts }))}
                      className={`w-11 h-6 rounded-full transition-all ${preferences.tradeAlerts ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${preferences.tradeAlerts ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Emails de Marketing</div>
                      <div className="text-[10px] text-gray-500">Promociones y novedades</div>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, marketingEmails: !p.marketingEmails }))}
                      className={`w-11 h-6 rounded-full transition-all ${preferences.marketingEmails ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${preferences.marketingEmails ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                    <Moon className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Apariencia</h3>
                    <p className="text-xs text-gray-500">Personaliza la interfaz</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div className="flex items-center gap-3">
                      {preferences.darkMode ? <Moon className="w-4 h-4 text-purple-400" /> : <Sun className="w-4 h-4 text-purple-400" />}
                      <div>
                        <div className="text-sm font-medium">Modo Oscuro</div>
                        <div className="text-[10px] text-gray-500">Tema de la aplicación</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, darkMode: !p.darkMode }))}
                      className={`w-11 h-6 rounded-full transition-all ${preferences.darkMode ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${preferences.darkMode ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-[#1a1625] rounded-lg">
                    <div className="flex items-center gap-3">
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                      <div>
                        <div className="text-sm font-medium">Sonidos</div>
                        <div className="text-[10px] text-gray-500">Efectos de sonido</div>
                      </div>
                    </div>
                    <button 
                      onClick={() => setPreferences(p => ({ ...p, sounds: !p.sounds }))}
                      className={`w-11 h-6 rounded-full transition-all ${preferences.sounds ? 'bg-purple-600' : 'bg-gray-600'}`}
                    >
                      <div className={`w-5 h-5 bg-white rounded-full transition-all ${preferences.sounds ? 'translate-x-5' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Regional */}
              <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <Globe className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">Regional</h3>
                    <p className="text-xs text-gray-500">Idioma y zona horaria</p>
                  </div>
                </div>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1.5">Idioma</label>
                    <select 
                      value={preferences.language}
                      onChange={e => setPreferences(p => ({ ...p, language: e.target.value }))}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="es">Español</option>
                      <option value="en">English</option>
                      <option value="pt">Português</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1.5">Zona Horaria</label>
                    <select 
                      value={preferences.timezone}
                      onChange={e => setPreferences(p => ({ ...p, timezone: e.target.value }))}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="Europe/Madrid">Madrid (GMT+1)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                      <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
                      <option value="America/Buenos_Aires">Buenos Aires (GMT-3)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-500 block mb-1.5">Moneda</label>
                    <select 
                      value={preferences.currency}
                      onChange={e => setPreferences(p => ({ ...p, currency: e.target.value }))}
                      className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2.5 text-sm focus:border-purple-500 focus:outline-none"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="MXN">MXN ($)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danger Zone */}
              <div className="bg-[#13111c] rounded-xl border border-red-500/20 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/20 rounded-xl flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm text-red-400">Zona de Peligro</h3>
                    <p className="text-xs text-gray-500">Acciones irreversibles</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Descargar mis datos</div>
                      <div className="text-[10px] text-gray-500">Exporta toda tu información</div>
                    </div>
                    <button className="px-3 py-1.5 bg-[#1a1625] text-gray-300 rounded-lg text-xs hover:text-white transition-all flex items-center gap-1">
                      <Download className="w-3 h-3" />
                      Descargar
                    </button>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-lg">
                    <div>
                      <div className="text-sm font-medium text-red-400">Eliminar cuenta</div>
                      <div className="text-[10px] text-gray-500">Esta acción es permanente</div>
                    </div>
                    <button className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg text-xs hover:bg-red-500/30 transition-all flex items-center gap-1">
                      <Trash2 className="w-3 h-3" />
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

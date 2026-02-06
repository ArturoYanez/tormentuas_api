import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../context/AuthContext';
import { walletAPI } from '../../lib/api';
import {
  Bell, ArrowDownCircle, ArrowUpCircle, User, Settings, LogOut,
  ChevronDown, Wifi, WifiOff, Crown, Shield, Sparkles, X, Copy,
  Clock, CheckCircle, Zap, ArrowLeft, Trophy, Loader2, AlertCircle
} from 'lucide-react';

export interface TournamentParticipation {
  id: number;
  title: string;
  balance: number;
  initialBalance: number;
  rank: number;
  profit: number;
  endsAt?: Date;
}

interface HeaderProps {
  connected: boolean;
  accountType: 'live' | 'demo' | 'tournament';
  onAccountTypeChange: (type: 'live' | 'demo' | 'tournament', tournamentId?: number) => void;
  activeTournaments?: TournamentParticipation[];
  selectedTournamentId?: number;
}

interface CryptoMethod {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  color: string;
  fee: string;
  network: string;
  minDeposit: number;
  minWithdrawal: number;
}

interface DepositAddress {
  id: number;
  address: string;
  currency: string;
  network: string;
  qr_code?: string;
}

const CRYPTO_METHODS: CryptoMethod[] = [
  { id: 'usdt-trc20', name: 'USDT (TRC-20)', symbol: 'USDT', icon: '💰', color: 'from-green-500 to-emerald-600', fee: '1 USDT', network: 'TRC20', minDeposit: 10, minWithdrawal: 10 },
  { id: 'usdt-erc20', name: 'USDT (ERC-20)', symbol: 'USDT', icon: '💰', color: 'from-blue-500 to-blue-600', fee: '5 USDT', network: 'ERC20', minDeposit: 10, minWithdrawal: 10 },
  { id: 'usdt-bep20', name: 'USDT (BEP-20)', symbol: 'USDT', icon: '💰', color: 'from-yellow-500 to-yellow-600', fee: '1 USDT', network: 'BEP20', minDeposit: 10, minWithdrawal: 10 },
  { id: 'bitcoin', name: 'Bitcoin', symbol: 'BTC', icon: '₿', color: 'from-orange-500 to-orange-600', fee: '0.0001 BTC', network: 'BTC', minDeposit: 0.0001, minWithdrawal: 0.001 },
  { id: 'ethereum', name: 'Ethereum', symbol: 'ETH', icon: '💎', color: 'from-purple-500 to-purple-600', fee: '0.005 ETH', network: 'ERC20', minDeposit: 0.01, minWithdrawal: 0.01 },
  { id: 'solana', name: 'Solana', symbol: 'SOL', icon: '◎', color: 'from-purple-400 to-pink-500', fee: '0.01 SOL', network: 'SOL', minDeposit: 0.1, minWithdrawal: 0.1 },
  { id: 'bnb', name: 'BNB', symbol: 'BNB', icon: '🟡', color: 'from-yellow-400 to-orange-500', fee: '0.001 BNB', network: 'BEP20', minDeposit: 0.01, minWithdrawal: 0.01 },
];

export default function Header({ 
  connected, 
  accountType, 
  onAccountTypeChange, 
  activeTournaments = [],
  selectedTournamentId 
}: HeaderProps) {
  const { user, logout, updateUser } = useAuthContext();
  const navigate = useNavigate();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showTournamentDropdown, setShowTournamentDropdown] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [depositStep, setDepositStep] = useState<'methods' | 'amount' | 'payment'>('methods');
  const [withdrawStep, setWithdrawStep] = useState<'methods' | 'amount' | 'confirm'>('methods');
  const [selectedMethod, setSelectedMethod] = useState<CryptoMethod | null>(null);
  const [amount, setAmount] = useState(100);
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [depositAddress, setDepositAddress] = useState<DepositAddress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogout = () => { logout(); navigate('/'); };
  
  const getBalance = () => {
    if (accountType === 'tournament' && selectedTournamentId) {
      const tournament = activeTournaments.find(t => t.id === selectedTournamentId);
      return tournament?.balance ?? 0;
    }
    return accountType === 'live' ? (user?.balance ?? 0) : (user?.demo_balance ?? 50000);
  };

  const balance = getBalance();
  const selectedTournament = activeTournaments.find(t => t.id === selectedTournamentId);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setSuccess('Copiado al portapapeles');
    setTimeout(() => setSuccess(null), 2000);
  };

  // Fetch deposit address when method is selected
  const fetchDepositAddress = useCallback(async (method: CryptoMethod) => {
    try {
      setIsProcessing(true);
      setError(null);
      const res = await walletAPI.getDepositAddress(method.symbol, method.network);
      setDepositAddress(res.data.address);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error obteniendo dirección de depósito');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => {
    if (depositStep === 'payment' && selectedMethod && !depositAddress) {
      fetchDepositAddress(selectedMethod);
    }
  }, [depositStep, selectedMethod, depositAddress, fetchDepositAddress]);

  const handleDeposit = () => {
    // El depósito se confirma automáticamente cuando el usuario envía crypto
    // Aquí solo mostramos mensaje de confirmación
    setSuccess('¡Depósito registrado! Se acreditará cuando se confirme en la blockchain.');
    setTimeout(() => {
      setShowDepositModal(false);
      setDepositStep('methods');
      setSelectedMethod(null);
      setDepositAddress(null);
      setSuccess(null);
    }, 3000);
  };

  const handleWithdraw = async () => {
    if (!selectedMethod || !withdrawAddress || amount < 10) return;
    
    try {
      setIsProcessing(true);
      setError(null);
      
      await walletAPI.requestWithdrawal({
        amount,
        currency: selectedMethod.symbol,
        network: selectedMethod.network,
        address: withdrawAddress
      });

      // Actualizar balance local
      if (user) {
        updateUser({ balance: user.balance - amount - 2 }); // 2 USDT fee
      }

      setSuccess('¡Solicitud de retiro creada! Se procesará en 24-48 horas.');
      setTimeout(() => {
        setShowWithdrawModal(false);
        setWithdrawStep('methods');
        setSelectedMethod(null);
        setWithdrawAddress('');
        setSuccess(null);
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error al solicitar retiro');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAccountTypeClick = (type: 'live' | 'demo' | 'tournament') => {
    if (type === 'tournament') {
      if (activeTournaments.length === 0) return;
      setShowTournamentDropdown(!showTournamentDropdown);
    } else {
      setShowTournamentDropdown(false);
      onAccountTypeChange(type);
    }
  };

  const handleSelectTournament = (tournamentId: number) => {
    onAccountTypeChange('tournament', tournamentId);
    setShowTournamentDropdown(false);
  };

  const resetModals = () => {
    setDepositStep('methods');
    setWithdrawStep('methods');
    setSelectedMethod(null);
    setDepositAddress(null);
    setWithdrawAddress('');
    setError(null);
    setSuccess(null);
    setAmount(100);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-[#13111c] border-b border-purple-900/20 px-3 py-1.5 z-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 md:gap-3">
            <Link to="/platform" className="flex items-center gap-1 md:gap-1.5">
              <div className="w-5 h-5 md:w-6 md:h-6 bg-gradient-to-br from-purple-600 to-violet-600 rounded flex items-center justify-center">
                <Sparkles className="w-2.5 h-2.5 md:w-3 md:h-3 text-white" />
              </div>
              <span className="hidden sm:inline text-sm font-bold text-white">TORMENTUS</span>
              <span className="hidden md:inline text-[8px] px-1 py-0.5 bg-purple-600/20 text-purple-400 rounded">PRO</span>
            </Link>
            <div className={`hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] ${connected ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
              {connected ? <Wifi className="w-2.5 h-2.5" /> : <WifiOff className="w-2.5 h-2.5" />}
              <span className="hidden md:inline">{connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Account Type Selector */}
            <div className="relative flex bg-[#1a1625] rounded p-0.5">
              <button onClick={() => handleAccountTypeClick('live')} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${accountType === 'live' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:text-white'}`}>Live</button>
              <button onClick={() => handleAccountTypeClick('demo')} className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${accountType === 'demo' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>Demo</button>
              {activeTournaments.length > 0 && (
                <button onClick={() => handleAccountTypeClick('tournament')} className={`px-2 py-1 rounded text-[10px] font-medium transition-all flex items-center gap-1 ${accountType === 'tournament' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  <Trophy className="w-3 h-3" />
                  <span className="hidden sm:inline">Torneo</span>
                  <span className="bg-purple-500 text-white text-[8px] px-1 rounded-full font-bold">{activeTournaments.length}</span>
                  <ChevronDown className={`w-2.5 h-2.5 transition-transform ${showTournamentDropdown ? 'rotate-180' : ''}`} />
                </button>
              )}

              {/* Tournament Dropdown */}
              {showTournamentDropdown && activeTournaments.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-[#13111c] border border-purple-500/30 rounded-lg shadow-2xl z-50 min-w-[200px]">
                  <div className="p-2 border-b border-purple-900/20 bg-[#1a1625]">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-3.5 h-3.5 text-purple-400" />
                      <span className="font-bold text-[10px]">Mis Torneos ({activeTournaments.length})</span>
                    </div>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {activeTournaments.map(tournament => (
                      <button key={tournament.id} onClick={() => handleSelectTournament(tournament.id)} className={`w-full p-2 text-left hover:bg-[#1a1625] transition-all border-b border-purple-900/10 last:border-0 ${selectedTournamentId === tournament.id ? 'bg-purple-500/10' : ''}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-[10px] font-medium flex items-center gap-1">
                              {tournament.title}
                              {selectedTournamentId === tournament.id && <CheckCircle className="w-3 h-3 text-purple-400" />}
                            </div>
                            <div className="text-[9px] text-gray-500">Rank #{tournament.rank}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] font-bold text-purple-400">${tournament.balance.toFixed(0)}</div>
                            <div className={`text-[8px] ${tournament.profit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                              {tournament.profit >= 0 ? '+' : ''}{((tournament.profit / tournament.initialBalance) * 100).toFixed(1)}%
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Balance Display */}
            <div className="bg-[#1a1625] rounded px-1.5 md:px-2 py-1 min-w-[60px] md:min-w-[80px]">
              <div className="text-[7px] md:text-[8px] text-gray-500 flex items-center gap-1">
                {accountType === 'tournament' && selectedTournament ? (
                  <><Trophy className="w-2 h-2 text-purple-400" /> {selectedTournament.title.substring(0, 10)}...</>
                ) : ('Balance')}
              </div>
              <div className={`text-xs md:text-sm font-bold ${accountType === 'live' ? 'text-emerald-400' : 'text-purple-400'}`}>
                ${balance.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </div>
            </div>

            {/* Deposit/Withdraw */}
            {accountType !== 'tournament' && (
              <>
                <button onClick={() => { setShowDepositModal(true); resetModals(); }} className="flex items-center gap-1 px-2 py-1.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded text-[10px] font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all">
                  <ArrowDownCircle className="w-3 h-3" />
                  <span className="hidden sm:inline">Depositar</span>
                </button>
                <button onClick={() => { setShowWithdrawModal(true); resetModals(); }} className="flex items-center gap-1 px-2 py-1.5 bg-[#1a1625] border border-purple-900/30 rounded text-[10px] font-medium text-gray-300 hover:text-white hover:border-purple-500/50 transition-all">
                  <ArrowUpCircle className="w-3 h-3" />
                  <span className="hidden sm:inline">Retirar</span>
                </button>
              </>
            )}

            {/* Tournament Info Badge */}
            {accountType === 'tournament' && selectedTournament && (
              <div className="hidden sm:flex items-center gap-1 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded text-[9px] text-purple-400">
                <Zap className="w-3 h-3" />
                <span>Rank #{selectedTournament.rank}</span>
              </div>
            )}

            {/* Notifications */}
            <div className="relative">
              <button onClick={() => { setShowNotifications(!showNotifications); setShowUserMenu(false); setShowTournamentDropdown(false); }} className="relative p-1.5 text-gray-400 hover:text-white bg-[#1a1625] rounded">
                <Bell className="w-3.5 h-3.5" />
                <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-red-500 rounded-full text-[7px] flex items-center justify-center font-bold">3</span>
              </button>
              {showNotifications && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-[#13111c] border border-purple-900/30 rounded-lg shadow-2xl z-50">
                  <div className="p-2 border-b border-purple-900/20 bg-[#1a1625]">
                    <h3 className="font-bold text-[10px]">Notificaciones</h3>
                  </div>
                  <div className="max-h-48 overflow-y-auto">
                    {[{ title: 'Depósito completado', msg: '$500 acreditados', time: '5 min' }, { title: 'Torneo iniciado', msg: 'Weekly Challenge', time: '1h' }].map((n, i) => (
                      <div key={i} className="p-2 hover:bg-[#1a1625] cursor-pointer border-b border-purple-900/10 text-[10px]">
                        <div className="font-medium">{n.title}</div>
                        <div className="text-gray-500">{n.msg}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* User Menu */}
            <div className="relative">
              <button onClick={() => { setShowUserMenu(!showUserMenu); setShowNotifications(false); setShowTournamentDropdown(false); }} className="flex items-center gap-1.5 p-1 hover:bg-[#1a1625] rounded">
                <div className="relative">
                  <div className="w-6 h-6 bg-gradient-to-br from-purple-600 to-violet-600 rounded flex items-center justify-center">
                    <User className="w-3 h-3 text-white" />
                  </div>
                  {user?.role === 'admin' && <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-yellow-500 rounded-full flex items-center justify-center"><Crown className="w-2 h-2 text-yellow-900" /></div>}
                </div>
                <div className="hidden md:block text-left">
                  <div className="text-[10px] font-medium">{user?.first_name || 'Usuario'}</div>
                  <div className="text-[8px] text-gray-500 flex items-center gap-0.5">
                    {user?.is_verified ? <><Shield className="w-2 h-2 text-emerald-400" /><span className="text-emerald-400">Verificado</span></> : <span className="text-yellow-400">Sin verificar</span>}
                  </div>
                </div>
                <ChevronDown className={`w-2.5 h-2.5 text-gray-500 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>
              {showUserMenu && (
                <div className="absolute right-0 top-full mt-1 w-40 bg-[#13111c] border border-purple-900/30 rounded-lg shadow-2xl z-50">
                  <div className="p-2 border-b border-purple-900/20 bg-[#1a1625]">
                    <div className="font-medium text-[10px]">{user?.first_name} {user?.last_name}</div>
                    <div className="text-[8px] text-gray-500">{user?.email}</div>
                  </div>
                  <div className="p-1">
                    <Link to="/account" className="flex items-center gap-2 px-2 py-1 hover:bg-[#1a1625] rounded text-[10px]"><User className="w-3 h-3 text-gray-400" />Mi Cuenta</Link>
                    <Link to="/account?tab=settings" className="flex items-center gap-2 px-2 py-1 hover:bg-[#1a1625] rounded text-[10px]"><Settings className="w-3 h-3 text-gray-400" />Configuración</Link>
                    {user?.role === 'admin' && <Link to="/admin" className="flex items-center gap-2 px-2 py-1 hover:bg-[#1a1625] rounded text-[10px] text-yellow-400"><Crown className="w-3 h-3" />Panel Admin</Link>}
                  </div>
                  <div className="p-1 border-t border-purple-900/20">
                    <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-1 hover:bg-red-500/10 rounded w-full text-left text-[10px] text-red-400"><LogOut className="w-3 h-3" />Cerrar Sesión</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/30 rounded-xl w-full max-w-3xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-purple-900/20">
              <div className="flex items-center gap-2">
                {depositStep !== 'methods' && (
                  <button onClick={() => { setDepositStep(depositStep === 'payment' ? 'amount' : 'methods'); setDepositAddress(null); }} className="text-purple-400 hover:text-purple-300">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-sm font-bold">Depositar con Criptomonedas</h2>
              </div>
              <button onClick={() => { setShowDepositModal(false); resetModals(); }} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {success && (
              <div className="mx-4 mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            )}

            {depositStep === 'methods' && (
              <div className="p-4">
                <p className="text-[11px] text-gray-400 mb-3">Selecciona tu método de pago preferido</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CRYPTO_METHODS.map(method => (
                    <button key={method.id} onClick={() => { setSelectedMethod(method); setDepositStep('amount'); }} className={`p-2 bg-gradient-to-br ${method.color} rounded-lg hover:scale-105 transition-all text-center`}>
                      <div className="text-xl mb-1">{method.icon}</div>
                      <div className="text-[9px] font-bold">{method.symbol}</div>
                      <div className="text-[7px] opacity-80">{method.network}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {depositStep === 'amount' && selectedMethod && (
              <div className="p-4">
                <div className={`p-3 bg-gradient-to-br ${selectedMethod.color} rounded-lg mb-4`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedMethod.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{selectedMethod.name}</div>
                      <div className="text-[10px] opacity-80">Red: {selectedMethod.network}</div>
                    </div>
                  </div>
                </div>
                <label className="text-[10px] text-gray-400 block mb-1">Cantidad a depositar (USD)</label>
                <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-lg font-bold text-right" min={selectedMethod.minDeposit} />
                <div className="flex gap-1 mt-2">
                  {[50, 100, 250, 500, 1000].map(val => (
                    <button key={val} onClick={() => setAmount(val)} className={`flex-1 py-1.5 rounded text-[10px] font-medium ${amount === val ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>${val}</button>
                  ))}
                </div>
                <p className="text-[9px] text-gray-500 mt-2">Mínimo: ${selectedMethod.minDeposit}</p>
                <button onClick={() => setDepositStep('payment')} disabled={amount < selectedMethod.minDeposit} className="w-full mt-4 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-lg font-bold text-sm disabled:opacity-50">Continuar - ${amount.toFixed(2)}</button>
              </div>
            )}

            {depositStep === 'payment' && selectedMethod && (
              <div className="p-4">
                {isProcessing ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="w-8 h-8 text-purple-400 animate-spin mb-4" />
                    <div className="text-sm font-bold">Obteniendo dirección de depósito...</div>
                  </div>
                ) : depositAddress ? (
                  <>
                    <div className="bg-orange-900/20 border border-orange-500/30 rounded-lg p-3 mb-4 flex items-start gap-2">
                      <Zap className="w-4 h-4 text-orange-400 mt-0.5" />
                      <div className="text-[10px]">
                        <div className="font-bold text-orange-300">Importante</div>
                        <div className="text-orange-200">Envía la cantidad EXACTA a la dirección. Solo envía {selectedMethod.symbol} por la red {selectedMethod.network}.</div>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center mx-auto sm:mx-0 flex-shrink-0">
                        <div className="text-[8px] text-black text-center font-bold p-2">QR CODE<br/>{selectedMethod.symbol}</div>
                      </div>
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="text-[9px] text-gray-400">Cantidad a enviar</label>
                          <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-2">
                            <span className="text-lg font-bold text-yellow-400">{amount.toFixed(2)}</span>
                            <span className="text-gray-400 text-sm">{selectedMethod.symbol}</span>
                            <button onClick={() => copyToClipboard(amount.toFixed(2))} className="ml-auto text-purple-400 hover:text-purple-300"><Copy className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-400">Dirección {selectedMethod.symbol} ({selectedMethod.network})</label>
                          <div className="flex items-center gap-2 bg-[#1a1625] rounded-lg p-2">
                            <span className="text-[10px] font-mono text-emerald-400 truncate">{depositAddress.address}</span>
                            <button onClick={() => copyToClipboard(depositAddress.address)} className="ml-auto text-purple-400 hover:text-purple-300"><Copy className="w-3 h-3" /></button>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-orange-400 bg-orange-900/20 rounded-lg p-2">
                          <Clock className="w-4 h-4" />
                          <span className="text-[10px]">Confirmación: ~10-30 min</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={handleDeposit} className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg font-bold text-sm flex items-center justify-center gap-2">
                      <CheckCircle className="w-4 h-4" /> He realizado el pago
                    </button>
                  </>
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Error obteniendo dirección. Intenta de nuevo.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#13111c] border border-purple-900/30 rounded-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between p-3 border-b border-purple-900/20">
              <div className="flex items-center gap-2">
                {withdrawStep !== 'methods' && (
                  <button onClick={() => setWithdrawStep(withdrawStep === 'confirm' ? 'amount' : 'methods')} className="text-purple-400 hover:text-purple-300">
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                )}
                <h2 className="text-sm font-bold">Retirar Fondos</h2>
              </div>
              <button onClick={() => { setShowWithdrawModal(false); resetModals(); }} className="text-gray-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            {error && (
              <div className="mx-4 mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2 text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" /> {error}
              </div>
            )}

            {success && (
              <div className="mx-4 mt-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2 text-green-400 text-sm">
                <CheckCircle className="w-4 h-4" /> {success}
              </div>
            )}

            {withdrawStep === 'methods' && (
              <div className="p-4">
                <div className="bg-[#1a1625] rounded-lg p-3 mb-4">
                  <div className="text-[10px] text-gray-400">Balance disponible</div>
                  <div className="text-xl font-bold text-emerald-400">${balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</div>
                </div>
                <p className="text-[11px] text-gray-400 mb-3">Selecciona el método de retiro</p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                  {CRYPTO_METHODS.map(method => (
                    <button key={method.id} onClick={() => { setSelectedMethod(method); setWithdrawStep('amount'); }} className={`p-2 bg-gradient-to-br ${method.color} rounded-lg hover:scale-105 transition-all text-center`}>
                      <div className="text-xl mb-1">{method.icon}</div>
                      <div className="text-[9px] font-bold">{method.symbol}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {withdrawStep === 'amount' && selectedMethod && (
              <div className="p-4 space-y-4">
                <div className={`p-3 bg-gradient-to-br ${selectedMethod.color} rounded-lg`}>
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{selectedMethod.icon}</span>
                    <div>
                      <div className="font-bold text-sm">{selectedMethod.name}</div>
                      <div className="text-[10px] opacity-80">Fee: {selectedMethod.fee}</div>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Cantidad a retirar (USD)</label>
                  <input type="number" value={amount} onChange={e => setAmount(Math.min(Number(e.target.value), balance - 2))} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-lg font-bold text-right" min={10} max={balance - 2} />
                  <p className="text-[9px] text-gray-500 mt-1">Mínimo: $10 | Fee: $2 | Disponible: ${(balance - 2).toFixed(2)}</p>
                </div>
                <div>
                  <label className="text-[10px] text-gray-400 block mb-1">Dirección de {selectedMethod.symbol} ({selectedMethod.network})</label>
                  <input type="text" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} placeholder={`Tu dirección ${selectedMethod.symbol}...`} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm font-mono" />
                </div>
                <button onClick={() => setWithdrawStep('confirm')} disabled={!withdrawAddress || amount < 10 || amount > balance - 2} className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-bold text-sm disabled:opacity-50">Continuar</button>
              </div>
            )}

            {withdrawStep === 'confirm' && selectedMethod && (
              <div className="p-4">
                {isProcessing ? (
                  <div className="flex flex-col items-center py-8">
                    <Loader2 className="w-8 h-8 text-orange-400 animate-spin mb-4" />
                    <div className="text-sm font-bold">Procesando retiro...</div>
                  </div>
                ) : (
                  <>
                    <div className="bg-[#1a1625] rounded-lg p-4 space-y-3 mb-4">
                      <div className="text-center">
                        <div className="text-[10px] text-gray-400">Retirando</div>
                        <div className="text-2xl font-bold text-white">${amount.toFixed(2)}</div>
                      </div>
                      <div className="border-t border-purple-900/20 pt-3 space-y-2 text-[10px]">
                        <div className="flex justify-between"><span className="text-gray-400">Método:</span><span>{selectedMethod.name}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Red:</span><span>{selectedMethod.network}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Dirección:</span><span className="font-mono text-emerald-400 truncate max-w-[200px]">{withdrawAddress}</span></div>
                        <div className="flex justify-between"><span className="text-gray-400">Fee:</span><span className="text-orange-400">$2.00</span></div>
                        <div className="flex justify-between border-t border-purple-900/20 pt-2"><span className="text-gray-400">Total a descontar:</span><span className="font-bold text-white">${(amount + 2).toFixed(2)}</span></div>
                      </div>
                    </div>
                    <div className="bg-purple-900/20 border border-purple-500/30 rounded-lg p-3 mb-4 text-[10px] text-purple-300">
                      ⚠️ Verifica que la dirección sea correcta. Las transacciones son irreversibles.
                    </div>
                    <button onClick={handleWithdraw} disabled={isProcessing} className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2">
                      {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                      Confirmar Retiro
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

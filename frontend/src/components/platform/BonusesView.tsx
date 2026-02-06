import { useState, useEffect } from 'react';
import { Gift, Clock, CheckCircle, XCircle, Copy, Tag, TrendingUp, Star, Zap, Crown, Target, RefreshCw, Loader2 } from 'lucide-react';
import { bonusAPI } from '../../lib/api';

interface Bonus {
  id: number;
  name: string;
  type: string;
  amount: number;
  percentage: number;
  min_deposit: number;
  rollover_multiplier: number;
  code: string;
  expires_at: string;
}

interface UserBonus {
  id: number;
  bonus_id: number;
  amount: number;
  rollover_required: number;
  rollover_completed: number;
  status: string;
  activated_at: string;
  expires_at: string;
  bonus_name: string;
  bonus_type: string;
  bonus_code: string;
}

interface BonusStats {
  total_earned: number;
  active_bonus: number;
  pending_rollover: number;
  completed_bonuses: number;
}

export default function BonusesView() {
  const [activeTab, setActiveTab] = useState<'available' | 'active' | 'history'>('available');
  const [promoCode, setPromoCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [availableBonuses, setAvailableBonuses] = useState<Bonus[]>([]);
  const [userBonuses, setUserBonuses] = useState<UserBonus[]>([]);
  const [stats, setStats] = useState<BonusStats>({ total_earned: 0, active_bonus: 0, pending_rollover: 0, completed_bonuses: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [availableRes, myBonusesRes, statsRes] = await Promise.all([
        bonusAPI.getAvailable(),
        bonusAPI.getMyBonuses(),
        bonusAPI.getStats()
      ]);
      setAvailableBonuses(availableRes.data.bonuses || []);
      setUserBonuses(myBonusesRes.data.bonuses || []);
      if (statsRes.data.stats) setStats(statsRes.data.stats);
    } catch (err) {
      console.error('Error loading bonuses:', err);
    } finally {
      setLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'welcome': return <Star className="w-5 h-5 text-yellow-400" />;
      case 'deposit': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'loyalty': return <Crown className="w-5 h-5 text-purple-400" />;
      case 'promo': return <Zap className="w-5 h-5 text-blue-400" />;
      default: return <Gift className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>;
      case 'completed': return <span className="px-2 py-1 bg-purple-500/20 text-purple-400 text-xs rounded-full">Completado</span>;
      case 'cancelled': return <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded-full">Cancelado</span>;
      case 'expired': return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Expirado</span>;
      default: return null;
    }
  };

  const handleApplyCode = async () => {
    if (!promoCode.trim()) return;
    setActionLoading(-1);
    try {
      await bonusAPI.applyPromo(promoCode);
      alert('¡Código aplicado exitosamente!');
      setPromoCode('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error aplicando código');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    alert('Código copiado!');
  };

  const handleClaimBonus = async (id: number) => {
    setActionLoading(id);
    try {
      await bonusAPI.claim(id);
      alert('¡Bono reclamado exitosamente!');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error reclamando bono');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBonus = async (id: number) => {
    if (!confirm('¿Estás seguro? Perderás el bono y las ganancias asociadas.')) return;
    setActionLoading(id);
    try {
      await bonusAPI.cancel(id);
      alert('Bono cancelado');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error cancelando bono');
    } finally {
      setActionLoading(null);
    }
  };

  const activeBonuses = userBonuses.filter(b => b.status === 'active');
  const historyBonuses = userBonuses.filter(b => b.status !== 'active');

  if (loading) {
    return (
      <div className="h-full bg-[#0d0b14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }


  return (
    <div className="h-full bg-[#0d0b14] overflow-y-auto custom-scrollbar">
      <div className="p-4 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><Gift className="w-6 h-6 text-purple-400" /> Bonos y Promociones</h1>
            <p className="text-gray-400 text-sm">Gestiona tus bonos y códigos promocionales</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Gift className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-xs">Total Ganado</span></div>
            <p className="text-2xl font-bold text-green-400">${stats.total_earned.toFixed(2)}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Zap className="w-5 h-5 text-yellow-400" /><span className="text-gray-400 text-xs">Bono Activo</span></div>
            <p className="text-2xl font-bold text-yellow-400">${stats.active_bonus.toFixed(2)}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><RefreshCw className="w-5 h-5 text-blue-400" /><span className="text-gray-400 text-xs">Rollover Pendiente</span></div>
            <p className="text-2xl font-bold text-blue-400">${stats.pending_rollover.toFixed(2)}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-5 h-5 text-purple-400" /><span className="text-gray-400 text-xs">Completados</span></div>
            <p className="text-2xl font-bold text-purple-400">{stats.completed_bonuses}</p>
          </div>
        </div>

        {/* Promo Code Input */}
        <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 mb-6">
          <h3 className="text-white font-medium mb-3 flex items-center gap-2"><Tag className="w-5 h-5 text-purple-400" /> Código Promocional</h3>
          <div className="flex gap-3">
            <input type="text" placeholder="Ingresa tu código..." value={promoCode} onChange={(e) => setPromoCode(e.target.value.toUpperCase())} className="flex-1 bg-[#1a1625] border border-purple-900/30 rounded-lg px-4 py-2 text-white" />
            <button onClick={handleApplyCode} disabled={actionLoading === -1} className="px-6 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center gap-2">
              {actionLoading === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Aplicar
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'available', label: 'Disponibles', icon: Gift },
            { id: 'active', label: 'Activos', icon: Zap },
            { id: 'history', label: 'Historial', icon: Clock }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {/* Available Bonuses */}
        {activeTab === 'available' && (
          <div className="space-y-4">
            {availableBonuses.map(bonus => (
              <div key={bonus.id} className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1a1625] rounded-lg">{getTypeIcon(bonus.type)}</div>
                    <div>
                      <h3 className="text-white font-medium">{bonus.name}</h3>
                      {bonus.code && (
                        <button onClick={() => handleCopyCode(bonus.code)} className="flex items-center gap-1 px-2 py-0.5 bg-[#1a1625] rounded text-xs text-gray-400 hover:text-white mt-1">
                          <Copy className="w-3 h-3" /> {bonus.code}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-green-400">${bonus.amount}</p>
                    {bonus.percentage > 0 && <p className="text-xs text-gray-400">{bonus.percentage}% del depósito</p>}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-3">
                  {bonus.min_deposit > 0 && (
                    <div className="bg-[#1a1625] rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Depósito Mín.</p>
                      <p className="text-sm text-white font-medium">${bonus.min_deposit}</p>
                    </div>
                  )}
                  <div className="bg-[#1a1625] rounded-lg p-2 text-center">
                    <p className="text-xs text-gray-400">Rollover</p>
                    <p className="text-sm text-white font-medium">{bonus.rollover_multiplier}x</p>
                  </div>
                  {bonus.expires_at && (
                    <div className="bg-[#1a1625] rounded-lg p-2 text-center">
                      <p className="text-xs text-gray-400">Expira</p>
                      <p className="text-sm text-white font-medium">{new Date(bonus.expires_at).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
                <button onClick={() => handleClaimBonus(bonus.id)} disabled={actionLoading === bonus.id} className="w-full py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm font-medium flex items-center justify-center gap-2">
                  {actionLoading === bonus.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />} Reclamar Bono
                </button>
              </div>
            ))}
            {availableBonuses.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Gift className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay bonos disponibles</p>
              </div>
            )}
          </div>
        )}

        {/* Active Bonuses */}
        {activeTab === 'active' && (
          <div className="space-y-4">
            {activeBonuses.map(bonus => {
              const progress = bonus.rollover_required > 0 ? (bonus.rollover_completed / bonus.rollover_required) * 100 : 0;
              return (
                <div key={bonus.id} className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-[#1a1625] rounded-lg">{getTypeIcon(bonus.bonus_type)}</div>
                      <div>
                        <h3 className="text-white font-medium">{bonus.bonus_name}</h3>
                        {getStatusBadge(bonus.status)}
                      </div>
                    </div>
                    <p className="text-2xl font-bold text-green-400">${bonus.amount}</p>
                  </div>
                  <div className="mb-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400">Progreso Rollover</span>
                      <span className="text-purple-400">{progress.toFixed(1)}%</span>
                    </div>
                    <div className="w-full bg-gray-700 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full transition-all" style={{ width: `${Math.min(progress, 100)}%` }} />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Requerido: ${bonus.rollover_required.toFixed(2)} | Completado: ${bonus.rollover_completed.toFixed(2)}</p>
                  </div>
                  <div className="flex gap-2">
                    <button className="flex-1 py-2 bg-[#1a1625] rounded-lg text-gray-400 text-sm flex items-center justify-center gap-2">
                      <Target className="w-4 h-4" /> Ver Detalles
                    </button>
                    <button onClick={() => handleCancelBonus(bonus.id)} disabled={actionLoading === bonus.id} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-400 text-sm flex items-center gap-2">
                      {actionLoading === bonus.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />} Cancelar
                    </button>
                  </div>
                </div>
              );
            })}
            {activeBonuses.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Zap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No tienes bonos activos</p>
              </div>
            )}
          </div>
        )}

        {/* History */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            {historyBonuses.map(bonus => (
              <div key={bonus.id} className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#1a1625] rounded-lg">{getTypeIcon(bonus.bonus_type)}</div>
                    <div>
                      <h3 className="text-white font-medium">{bonus.bonus_name}</h3>
                      {getStatusBadge(bonus.status)}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-bold text-white">${bonus.amount}</p>
                    <p className="text-xs text-gray-400">{new Date(bonus.activated_at).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
            {historyBonuses.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay historial de bonos</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

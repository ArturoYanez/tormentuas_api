import { useState, useEffect } from 'react';
import { Users, Copy, Share2, DollarSign, TrendingUp, Gift, Award, Link, CheckCircle, Clock, UserPlus, Percent, Loader2 } from 'lucide-react';
import { referralAPI } from '../../lib/api';

interface Referral {
  id: number;
  name: string;
  email: string;
  status: string;
  total_deposits: number;
  commission: number;
  created_at: string;
}

interface Commission {
  id: number;
  referral_name: string;
  type: string;
  amount: number;
  status: string;
  created_at: string;
}

interface ReferralStats {
  total_referrals: number;
  active_referrals: number;
  total_commissions: number;
  pending_commissions: number;
  this_month: number;
  referral_code: string;
  current_tier: string;
  commission_rate: number;
}

interface Tier {
  id: number;
  name: string;
  min_referrals: number;
  deposit_commission: number;
  trade_commission: number;
  signup_bonus: number;
}

export default function ReferralsView() {
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [tiers, setTiers] = useState<Tier[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, referralsRes, commissionsRes, tiersRes] = await Promise.all([
        referralAPI.getStats(),
        referralAPI.getReferrals(),
        referralAPI.getCommissions(),
        referralAPI.getTiers()
      ]);
      if (statsRes.data.stats) setStats(statsRes.data.stats);
      setReferrals(referralsRes.data.referrals || []);
      setCommissions(commissionsRes.data.commissions || []);
      setTiers(tiersRes.data.tiers || []);
    } catch (err) {
      console.error('Error loading referral data:', err);
    } finally {
      setLoading(false);
    }
  };

  const referralCode = stats?.referral_code || 'LOADING';
  const referralLink = `https://tormentus.com/ref/${referralCode}`;

  const currentTier = tiers.find(t => t.name === stats?.current_tier) || tiers[0];
  const nextTier = tiers.find(t => t.min_referrals > (stats?.total_referrals || 0));

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: string) => {
    const text = `¡Únete a la mejor plataforma de trading! Usa mi código ${referralCode} y obtén un bono de bienvenida.`;
    const urls: Record<string, string> = {
      whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + referralLink)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}&text=${encodeURIComponent(text)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(referralLink)}`,
    };
    window.open(urls[platform], '_blank');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return <span className="px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full">Activo</span>;
      case 'pending': return <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">Pendiente</span>;
      default: return <span className="px-2 py-1 bg-gray-500/20 text-gray-400 text-xs rounded-full">Inactivo</span>;
    }
  };

  const getTierColor = (name: string) => {
    switch (name?.toLowerCase()) {
      case 'bronce': return 'text-orange-400';
      case 'plata': return 'text-gray-300';
      case 'oro': return 'text-yellow-400';
      case 'platino': return 'text-purple-400';
      case 'diamante': return 'text-cyan-400';
      default: return 'text-gray-400';
    }
  };

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
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><Users className="w-6 h-6 text-purple-400" /> Programa de Referidos</h1>
            <p className="text-gray-400 text-sm">Invita amigos y gana comisiones</p>
          </div>
          <div className="flex items-center gap-2">
            <span className={`text-lg font-bold ${getTierColor(stats?.current_tier || '')}`}>{stats?.current_tier || 'Bronce'}</span>
            <Award className={`w-6 h-6 ${getTierColor(stats?.current_tier || '')}`} />
          </div>
        </div>

        {/* Referral Link Card */}
        <div className="bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-xl p-6 border border-purple-500/30 mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Link className="w-5 h-5" /> Tu Enlace de Referido</h3>
          <div className="flex flex-col md:flex-row gap-3 mb-4">
            <div className="flex-1 bg-[#0d0b14] rounded-lg p-3 flex items-center justify-between">
              <span className="text-gray-300 text-sm truncate">{referralLink}</span>
              <button onClick={handleCopyLink} className="ml-2 p-2 hover:bg-purple-600/20 rounded-lg text-purple-400">
                {copied ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <div className="bg-[#0d0b14] rounded-lg p-3 flex items-center gap-2">
              <span className="text-gray-400 text-sm">Código:</span>
              <span className="text-white font-mono font-bold">{referralCode}</span>
              <button onClick={handleCopyCode} className="p-2 hover:bg-purple-600/20 rounded-lg text-purple-400">
                <Copy className="w-4 h-4" />
              </button>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => handleShare('whatsapp')} className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" /> WhatsApp
            </button>
            <button onClick={() => handleShare('telegram')} className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Telegram
            </button>
            <button onClick={() => handleShare('twitter')} className="px-4 py-2 bg-sky-500 hover:bg-sky-600 rounded-lg text-white text-sm flex items-center gap-2">
              <Share2 className="w-4 h-4" /> Twitter
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Users className="w-5 h-5 text-purple-400" /><span className="text-gray-400 text-xs">Total Referidos</span></div>
            <p className="text-2xl font-bold text-white">{stats?.total_referrals || 0}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-xs">Total Comisiones</span></div>
            <p className="text-2xl font-bold text-green-400">${(stats?.total_commissions || 0).toFixed(2)}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Clock className="w-5 h-5 text-yellow-400" /><span className="text-gray-400 text-xs">Pendiente</span></div>
            <p className="text-2xl font-bold text-yellow-400">${(stats?.pending_commissions || 0).toFixed(2)}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-blue-400" /><span className="text-gray-400 text-xs">Este Mes</span></div>
            <p className="text-2xl font-bold text-blue-400">${(stats?.this_month || 0).toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { id: 'overview', label: 'Resumen', icon: TrendingUp },
            { id: 'referrals', label: 'Mis Referidos', icon: Users },
            { id: 'commissions', label: 'Comisiones', icon: DollarSign }
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as typeof activeTab)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <>
            {/* Tier Progress */}
            <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 mb-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Award className="w-5 h-5 text-purple-400" /> Nivel de Afiliado</h3>
              <div className="flex items-center gap-4 mb-4">
                {tiers.map((tier) => (
                  <div key={tier.id} className={`flex-1 text-center ${(stats?.total_referrals || 0) >= tier.min_referrals ? getTierColor(tier.name) : 'text-gray-600'}`}>
                    <Award className="w-8 h-8 mx-auto mb-1" />
                    <p className="text-sm font-medium">{tier.name}</p>
                    <p className="text-xs">{tier.deposit_commission}%</p>
                  </div>
                ))}
              </div>
              {nextTier && (
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-400">Progreso al siguiente nivel</span>
                    <span className="text-purple-400">{stats?.total_referrals || 0}/{nextTier.min_referrals} referidos</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-purple-500 h-2 rounded-full" style={{ width: `${((stats?.total_referrals || 0) / nextTier.min_referrals) * 100}%` }} />
                  </div>
                </div>
              )}
            </div>

            {/* How it Works */}
            <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 mb-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-400" /> ¿Cómo Funciona?</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 bg-[#1a1625] rounded-lg">
                  <div className="w-12 h-12 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Share2 className="w-6 h-6 text-purple-400" />
                  </div>
                  <h4 className="text-white font-medium mb-1">1. Comparte</h4>
                  <p className="text-xs text-gray-400">Comparte tu enlace o código con amigos</p>
                </div>
                <div className="text-center p-4 bg-[#1a1625] rounded-lg">
                  <div className="w-12 h-12 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <UserPlus className="w-6 h-6 text-green-400" />
                  </div>
                  <h4 className="text-white font-medium mb-1">2. Registran</h4>
                  <p className="text-xs text-gray-400">Tus amigos se registran y depositan</p>
                </div>
                <div className="text-center p-4 bg-[#1a1625] rounded-lg">
                  <div className="w-12 h-12 bg-yellow-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <DollarSign className="w-6 h-6 text-yellow-400" />
                  </div>
                  <h4 className="text-white font-medium mb-1">3. Ganas</h4>
                  <p className="text-xs text-gray-400">Recibe comisiones por sus depósitos</p>
                </div>
              </div>
            </div>

            {/* Commission Structure */}
            <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2"><Percent className="w-5 h-5 text-purple-400" /> Estructura de Comisiones</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                  <span className="text-gray-400">Comisión por depósito</span>
                  <span className="text-green-400 font-bold">{currentTier?.deposit_commission || 5}%</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                  <span className="text-gray-400">Bono por registro</span>
                  <span className="text-yellow-400 font-bold">${currentTier?.signup_bonus || 5}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                  <span className="text-gray-400">Comisión de trading</span>
                  <span className="text-blue-400 font-bold">{currentTier?.trade_commission || 0.5}%</span>
                </div>
              </div>
            </div>
          </>
        )}

        {activeTab === 'referrals' && (
          <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1625]">
                  <tr>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Usuario</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Estado</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Fecha Registro</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Depósitos</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Comisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20">
                  {referrals.map(ref => (
                    <tr key={ref.id} className="hover:bg-[#1a1625]/50">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-white font-medium">{ref.name || 'Usuario'}</p>
                          <p className="text-xs text-gray-500">{ref.email}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(ref.status)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(ref.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-sm text-white">${ref.total_deposits.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-green-400 font-medium">+${ref.commission.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {referrals.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>Aún no tienes referidos</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'commissions' && (
          <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#1a1625]">
                  <tr>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Referido</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Tipo</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Monto</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Fecha</th>
                    <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-purple-900/20">
                  {commissions.map(comm => (
                    <tr key={comm.id} className="hover:bg-[#1a1625]/50">
                      <td className="px-4 py-3 text-white font-medium">{comm.referral_name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${comm.type === 'deposit' ? 'bg-green-500/20 text-green-400' : comm.type === 'trade' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'}`}>
                          {comm.type === 'deposit' ? 'Depósito' : comm.type === 'trade' ? 'Trading' : 'Registro'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-green-400 font-medium">+${comm.amount.toFixed(2)}</td>
                      <td className="px-4 py-3 text-sm text-gray-400">{new Date(comm.created_at).toLocaleDateString()}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded text-xs ${comm.status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                          {comm.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {commissions.length === 0 && (
              <div className="text-center py-12 text-gray-400">
                <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No hay comisiones registradas</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

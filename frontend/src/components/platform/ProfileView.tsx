import { useState, useEffect } from 'react';
import { User, Shield, Eye, EyeOff, Lock, Palette, DollarSign, Loader2, Upload, CheckCircle, Clock, XCircle } from 'lucide-react';
import { profileAPI } from '../../lib/api';
import VerificationModal from '../modals/VerificationModal';

type TabType = 'profile' | 'kyc' | 'security' | 'notifications' | 'appearance' | 'trading';

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  balance: number;
  demo_balance: number;
  is_verified: boolean;
  verification_status: string;
  created_at: string;
}

interface UserStats {
  total_trades: number;
  won_trades: number;
  lost_trades: number;
  win_rate: number;
  total_profit: number;
  total_loss: number;
  net_profit: number;
  total_deposits: number;
  total_withdrawals: number;
  tournaments_joined: number;
  best_trade: number;
  worst_trade: number;
  avg_trade_amount: number;
}

interface UserSettings {
  theme: string;
  language: string;
  timezone: string;
  currency: string;
  sound_effects: boolean;
  show_balance: boolean;
  confirm_trades: boolean;
  default_amount: number;
  default_duration: number;
}

export default function ProfileView() {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Data from API
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [settings, setSettings] = useState<UserSettings>({
    theme: 'dark',
    language: 'es',
    timezone: 'America/Mexico_City',
    currency: 'USD',
    sound_effects: true,
    show_balance: true,
    confirm_trades: true,
    default_amount: 10,
    default_duration: 60
  });

  // Form states
  const [profileForm, setProfileForm] = useState({ first_name: '', last_name: '' });
  const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [profileRes, statsRes, settingsRes] = await Promise.all([
        profileAPI.getProfile(),
        profileAPI.getStats(),
        profileAPI.getSettings()
      ]);
      
      const userData = profileRes.data.user;
      setProfile(userData);
      setProfileForm({ first_name: userData.first_name, last_name: userData.last_name });
      
      if (statsRes.data.stats) setStats(statsRes.data.stats);
      if (settingsRes.data.settings) setSettings(settingsRes.data.settings);
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await profileAPI.updateProfile(profileForm);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error guardando perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.new !== passwordForm.confirm) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (passwordForm.new.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres');
      return;
    }
    
    setSaving(true);
    try {
      await profileAPI.changePassword({
        current_password: passwordForm.current,
        new_password: passwordForm.new
      });
      alert('Contraseña actualizada correctamente');
      setPasswordForm({ current: '', new: '', confirm: '' });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error cambiando contraseña');
    } finally {
      setSaving(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      await profileAPI.updateSettings(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error guardando configuración');
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const Toggle = ({ enabled, onChange }: { enabled: boolean; onChange: () => void }) => (
    <button onClick={onChange} className={`w-11 h-6 rounded-full transition-all ${enabled ? 'bg-purple-600' : 'bg-gray-700'} relative`}>
      <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${enabled ? 'left-5' : 'left-0.5'}`} />
    </button>
  );

  const tabs = [
    { id: 'profile' as TabType, label: 'Perfil', icon: User },
    { id: 'kyc' as TabType, label: 'Verificación', icon: Shield },
    { id: 'security' as TabType, label: 'Seguridad', icon: Lock },
    { id: 'appearance' as TabType, label: 'Apariencia', icon: Palette },
    { id: 'trading' as TabType, label: 'Trading', icon: DollarSign },
  ];

  if (loading) {
    return (
      <div className="h-full bg-[#0d0b14] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
      </div>
    );
  }

  const kycStatus = profile?.verification_status || 'pending';

  return (
    <div className="h-full bg-[#0d0b14] overflow-y-auto">
      <div className="max-w-4xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-2xl font-bold">
              {profile?.first_name?.[0]}{profile?.last_name?.[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">{profile?.first_name} {profile?.last_name}</h1>
              <p className="text-gray-400 text-sm">{profile?.email}</p>
              <span className={`text-xs px-2 py-0.5 rounded ${profile?.is_verified ? 'bg-green-600/20 text-green-400' : 'bg-yellow-600/20 text-yellow-400'}`}>
                {profile?.is_verified ? 'Verificado' : 'No verificado'}
              </span>
            </div>
          </div>
          {saved && <span className="text-green-400 text-sm">✓ Guardado</span>}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-800 pb-2 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab.id ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            <div className="bg-[#1a1625] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Información Personal</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm">Nombre</label>
                  <input
                    type="text"
                    value={profileForm.first_name}
                    onChange={e => setProfileForm(p => ({ ...p, first_name: e.target.value }))}
                    className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Apellido</label>
                  <input
                    type="text"
                    value={profileForm.last_name}
                    onChange={e => setProfileForm(p => ({ ...p, last_name: e.target.value }))}
                    className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Email</label>
                  <input type="email" value={profile?.email || ''} disabled className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-gray-500 mt-1" />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Miembro desde</label>
                  <input type="text" value={profile?.created_at ? new Date(profile.created_at).toLocaleDateString() : ''} disabled className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-gray-500 mt-1" />
                </div>
              </div>
              <button onClick={handleSaveProfile} disabled={saving} className="mt-4 bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Guardar Cambios
              </button>
            </div>

            {/* Stats */}
            {stats && (
              <div className="bg-[#1a1625] rounded-xl p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Estadísticas de Trading</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-[#0d0b14] rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Total Trades</p>
                    <p className="text-xl font-bold text-white">{stats.total_trades}</p>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Win Rate</p>
                    <p className="text-xl font-bold text-green-400">{stats.win_rate.toFixed(1)}%</p>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Ganancia Neta</p>
                    <p className={`text-xl font-bold ${stats.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${stats.net_profit.toFixed(2)}</p>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-4">
                    <p className="text-gray-400 text-sm">Torneos</p>
                    <p className="text-xl font-bold text-purple-400">{stats.tournaments_joined}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* KYC Tab */}
        {activeTab === 'kyc' && (
          <div className="bg-[#1a1625] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Verificación de Identidad</h2>
            
            {/* Status Banner */}
            <div className={`p-4 rounded-lg mb-6 flex items-center gap-3 ${
              kycStatus === 'approved' ? 'bg-green-600/20 border border-green-500/30' : 
              kycStatus === 'pending' ? 'bg-yellow-600/20 border border-yellow-500/30' : 
              kycStatus === 'rejected' ? 'bg-red-600/20 border border-red-500/30' :
              'bg-gray-800 border border-gray-700'
            }`}>
              {kycStatus === 'approved' ? (
                <CheckCircle className="w-6 h-6 text-green-400" />
              ) : kycStatus === 'pending' ? (
                <Clock className="w-6 h-6 text-yellow-400" />
              ) : kycStatus === 'rejected' ? (
                <XCircle className="w-6 h-6 text-red-400" />
              ) : (
                <Shield className="w-6 h-6 text-gray-400" />
              )}
              <div>
                <p className={`font-medium ${
                  kycStatus === 'approved' ? 'text-green-400' : 
                  kycStatus === 'pending' ? 'text-yellow-400' : 
                  kycStatus === 'rejected' ? 'text-red-400' :
                  'text-gray-400'
                }`}>
                  {kycStatus === 'approved' ? 'Cuenta Verificada' : 
                   kycStatus === 'pending' ? 'Verificación en Proceso' : 
                   kycStatus === 'rejected' ? 'Verificación Rechazada' :
                   'No Verificado'}
                </p>
                <p className="text-sm text-gray-500">
                  {kycStatus === 'approved' ? 'Tu identidad ha sido verificada exitosamente' : 
                   kycStatus === 'pending' ? 'Estamos revisando tus documentos (24-48 horas)' : 
                   kycStatus === 'rejected' ? 'Por favor, vuelve a enviar tus documentos' :
                   'Verifica tu identidad para desbloquear todas las funciones'}
                </p>
              </div>
            </div>

            {/* Benefits */}
            {kycStatus !== 'approved' && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-white mb-3">Beneficios de verificar tu cuenta:</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#0d0b14] rounded-lg p-3 border border-gray-800">
                    <p className="text-sm text-white">Retiros ilimitados</p>
                    <p className="text-xs text-gray-500">Sin límites diarios</p>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-3 border border-gray-800">
                    <p className="text-sm text-white">Procesamiento rápido</p>
                    <p className="text-xs text-gray-500">Retiros prioritarios</p>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-3 border border-gray-800">
                    <p className="text-sm text-white">Bonos exclusivos</p>
                    <p className="text-xs text-gray-500">Acceso a promociones</p>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-3 border border-gray-800">
                    <p className="text-sm text-white">Mayor seguridad</p>
                    <p className="text-xs text-gray-500">Protección adicional</p>
                  </div>
                </div>
              </div>
            )}

            {/* Action Button */}
            {kycStatus !== 'approved' && kycStatus !== 'pending' && (
              <button 
                onClick={() => setShowVerificationModal(true)}
                className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <Upload className="w-5 h-5" />
                {kycStatus === 'rejected' ? 'Volver a Enviar Documentos' : 'Iniciar Verificación'}
              </button>
            )}

            {kycStatus === 'pending' && (
              <div className="text-center py-4">
                <Loader2 className="w-8 h-8 text-yellow-400 animate-spin mx-auto mb-2" />
                <p className="text-sm text-gray-400">Tu verificación está siendo procesada...</p>
              </div>
            )}
          </div>
        )}

        {/* Verification Modal */}
        {showVerificationModal && (
          <VerificationModal 
            onClose={() => setShowVerificationModal(false)}
            onSuccess={() => {
              setShowVerificationModal(false);
              loadData();
            }}
          />
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <div className="bg-[#1a1625] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Cambiar Contraseña</h2>
              <div className="space-y-4 max-w-md">
                <div>
                  <label className="text-gray-400 text-sm">Contraseña actual</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={passwordForm.current}
                      onChange={e => setPasswordForm(p => ({ ...p, current: e.target.value }))}
                      className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white mt-1 pr-10"
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Nueva contraseña</label>
                  <input
                    type="password"
                    value={passwordForm.new}
                    onChange={e => setPasswordForm(p => ({ ...p, new: e.target.value }))}
                    className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white mt-1"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={passwordForm.confirm}
                    onChange={e => setPasswordForm(p => ({ ...p, confirm: e.target.value }))}
                    className="w-full bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white mt-1"
                  />
                </div>
                <button onClick={handleChangePassword} disabled={saving} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white flex items-center gap-2">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />} Cambiar Contraseña
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Appearance Tab */}
        {activeTab === 'appearance' && (
          <div className="bg-[#1a1625] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Preferencias de Apariencia</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Tema</p>
                  <p className="text-gray-400 text-sm">Selecciona el tema de la interfaz</p>
                </div>
                <select value={settings.theme} onChange={e => updateSetting('theme', e.target.value)} className="bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white">
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Idioma</p>
                  <p className="text-gray-400 text-sm">Idioma de la plataforma</p>
                </div>
                <select value={settings.language} onChange={e => updateSetting('language', e.target.value)} className="bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white">
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Zona horaria</p>
                  <p className="text-gray-400 text-sm">Tu zona horaria local</p>
                </div>
                <select value={settings.timezone} onChange={e => updateSetting('timezone', e.target.value)} className="bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white">
                  <option value="America/Mexico_City">Ciudad de México</option>
                  <option value="America/New_York">Nueva York</option>
                  <option value="America/Los_Angeles">Los Ángeles</option>
                  <option value="Europe/Madrid">Madrid</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Mostrar balance</p>
                  <p className="text-gray-400 text-sm">Mostrar u ocultar tu balance</p>
                </div>
                <Toggle enabled={settings.show_balance} onChange={() => updateSetting('show_balance', !settings.show_balance)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Efectos de sonido</p>
                  <p className="text-gray-400 text-sm">Sonidos al operar</p>
                </div>
                <Toggle enabled={settings.sound_effects} onChange={() => updateSetting('sound_effects', !settings.sound_effects)} />
              </div>
              <button onClick={handleSaveSettings} disabled={saving} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Palette className="w-4 h-4" />} Guardar Preferencias
              </button>
            </div>
          </div>
        )}

        {/* Trading Tab */}
        {activeTab === 'trading' && (
          <div className="bg-[#1a1625] rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Configuración de Trading</h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Monto por defecto</p>
                  <p className="text-gray-400 text-sm">Monto inicial al abrir operaciones</p>
                </div>
                <input type="number" value={settings.default_amount} onChange={e => updateSetting('default_amount', Number(e.target.value))} className="w-24 bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white text-right" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Duración por defecto</p>
                  <p className="text-gray-400 text-sm">Duración inicial en segundos</p>
                </div>
                <select value={settings.default_duration} onChange={e => updateSetting('default_duration', Number(e.target.value))} className="bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white">
                  <option value={30}>30 segundos</option>
                  <option value={60}>1 minuto</option>
                  <option value={120}>2 minutos</option>
                  <option value={300}>5 minutos</option>
                </select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Confirmar operaciones</p>
                  <p className="text-gray-400 text-sm">Pedir confirmación antes de operar</p>
                </div>
                <Toggle enabled={settings.confirm_trades} onChange={() => updateSetting('confirm_trades', !settings.confirm_trades)} />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white">Moneda preferida</p>
                  <p className="text-gray-400 text-sm">Moneda para mostrar valores</p>
                </div>
                <select value={settings.currency} onChange={e => updateSetting('currency', e.target.value)} className="bg-[#0d0b14] border border-gray-700 rounded-lg px-4 py-2 text-white">
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="MXN">MXN</option>
                </select>
              </div>
              <button onClick={handleSaveSettings} disabled={saving} className="bg-purple-600 hover:bg-purple-700 px-6 py-2 rounded-lg text-white flex items-center gap-2">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />} Guardar Configuración
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

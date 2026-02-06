import { useState, useEffect } from 'react';
import { Bell, BellOff, TrendingUp, TrendingDown, Gift, Trophy, AlertTriangle, Info, CheckCircle, Trash2, Settings, Plus, X, Target, Loader2 } from 'lucide-react';
import { notificationAPI } from '../../lib/api';

interface Notification {
  id: number;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface PriceAlert {
  id: number;
  symbol: string;
  condition: string;
  price: number;
  active: boolean;
  triggered: boolean;
}

interface NotificationSettings {
  email_enabled: boolean;
  push_enabled: boolean;
  trades_enabled: boolean;
  deposits_enabled: boolean;
  withdrawals_enabled: boolean;
  promotions_enabled: boolean;
  price_alerts_enabled: boolean;
}

export default function NotificationsView() {
  const [activeTab, setActiveTab] = useState<'notifications' | 'alerts'>('notifications');
  const [filter, setFilter] = useState('all');
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [priceAlerts, setPriceAlerts] = useState<PriceAlert[]>([]);
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [newAlert, setNewAlert] = useState({ symbol: 'BTC/USDT', condition: 'above', price: 70000 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [notifRes, alertsRes, settingsRes] = await Promise.all([
        notificationAPI.getAll(),
        notificationAPI.getPriceAlerts(),
        notificationAPI.getSettings()
      ]);
      setNotifications(notifRes.data.notifications || []);
      setUnreadCount(notifRes.data.unread_count || 0);
      setPriceAlerts(alertsRes.data.alerts || []);
      if (settingsRes.data.settings) setSettings(settingsRes.data.settings);
    } catch (err) {
      console.error('Error loading notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'trade': return <TrendingUp className="w-5 h-5 text-green-400" />;
      case 'bonus': return <Gift className="w-5 h-5 text-yellow-400" />;
      case 'tournament': return <Trophy className="w-5 h-5 text-purple-400" />;
      case 'system': return <Info className="w-5 h-5 text-blue-400" />;
      case 'alert': return <AlertTriangle className="w-5 h-5 text-orange-400" />;
      default: return <Bell className="w-5 h-5 text-gray-400" />;
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.is_read;
    if (filter !== 'all') return n.type === filter;
    return true;
  });

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteNotification = async (id: number) => {
    try {
      await notificationAPI.delete(id);
      const notif = notifications.find(n => n.id === id);
      setNotifications(prev => prev.filter(n => n.id !== id));
      if (notif && !notif.is_read) setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  const handleClearAll = async () => {
    if (!confirm('¿Eliminar todas las notificaciones?')) return;
    try {
      await notificationAPI.deleteAll();
      setNotifications([]);
      setUnreadCount(0);
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleAlert = async (id: number) => {
    try {
      await notificationAPI.togglePriceAlert(id);
      setPriceAlerts(prev => prev.map(a => a.id === id ? { ...a, active: !a.active } : a));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await notificationAPI.deletePriceAlert(id);
      setPriceAlerts(prev => prev.filter(a => a.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddAlert = async () => {
    setActionLoading(-1);
    try {
      const res = await notificationAPI.createPriceAlert(newAlert);
      setPriceAlerts(prev => [res.data.alert, ...prev]);
      setShowAddAlert(false);
      setNewAlert({ symbol: 'BTC/USDT', condition: 'above', price: 70000 });
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error creando alerta');
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdateSettings = async (key: keyof NotificationSettings, value: boolean) => {
    if (!settings) return;
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    try {
      await notificationAPI.updateSettings(newSettings);
    } catch (err) {
      console.error(err);
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
      <div className="p-4 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bell className="w-6 h-6 text-purple-400" /> Notificaciones
              {unreadCount > 0 && <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>}
            </h1>
            <p className="text-gray-400 text-sm">Centro de notificaciones y alertas de precio</p>
          </div>
          {activeTab === 'notifications' && (
            <div className="flex gap-2">
              <button onClick={handleMarkAllRead} className="px-3 py-2 bg-[#1a1625] hover:bg-[#1f1a2e] rounded-lg text-sm text-gray-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Marcar todo leído
              </button>
              <button onClick={handleClearAll} className="px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-sm text-red-400 flex items-center gap-2">
                <Trash2 className="w-4 h-4" /> Limpiar
              </button>
            </div>
          )}
          {activeTab === 'alerts' && (
            <button onClick={() => setShowAddAlert(true)} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm text-white flex items-center gap-2">
              <Plus className="w-4 h-4" /> Nueva Alerta
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('notifications')} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === 'notifications' ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>
            <Bell className="w-4 h-4" /> Notificaciones
            {unreadCount > 0 && <span className="px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">{unreadCount}</span>}
          </button>
          <button onClick={() => setActiveTab('alerts')} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === 'alerts' ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>
            <Target className="w-4 h-4" /> Alertas de Precio
          </button>
        </div>

        {activeTab === 'notifications' && (
          <>
            {/* Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {[
                { id: 'all', label: 'Todas' },
                { id: 'unread', label: 'No leídas' },
                { id: 'trade', label: 'Operaciones' },
                { id: 'bonus', label: 'Bonos' },
                { id: 'tournament', label: 'Torneos' },
                { id: 'system', label: 'Sistema' },
              ].map(f => (
                <button key={f.id} onClick={() => setFilter(f.id)} className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap ${filter === f.id ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}>
                  {f.label}
                </button>
              ))}
            </div>

            {/* Notifications List */}
            <div className="space-y-2">
              {filteredNotifications.map(notification => (
                <div key={notification.id} className={`bg-[#13111c] rounded-xl p-4 border ${notification.is_read ? 'border-purple-900/20' : 'border-purple-500/50'} transition-all`}>
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${notification.is_read ? 'bg-[#1a1625]' : 'bg-purple-600/20'}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-medium ${notification.is_read ? 'text-gray-300' : 'text-white'}`}>{notification.title}</h3>
                        {!notification.is_read && <span className="w-2 h-2 bg-purple-500 rounded-full" />}
                      </div>
                      <p className="text-sm text-gray-400 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">{new Date(notification.created_at).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.is_read && (
                        <button onClick={() => handleMarkAsRead(notification.id)} className="p-2 hover:bg-[#1a1625] rounded-lg text-gray-400 hover:text-white" title="Marcar como leído">
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleDeleteNotification(notification.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400" title="Eliminar">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {filteredNotifications.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <BellOff className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay notificaciones</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'alerts' && (
          <>
            {/* Add Alert Modal */}
            {showAddAlert && (
              <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-[#13111c] rounded-xl p-6 w-full max-w-md border border-purple-900/30">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Nueva Alerta de Precio</h3>
                    <button onClick={() => setShowAddAlert(false)} className="p-1 hover:bg-[#1a1625] rounded-lg text-gray-400">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Par</label>
                      <select value={newAlert.symbol} onChange={(e) => setNewAlert({ ...newAlert, symbol: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-4 py-2 text-white">
                        <option value="BTC/USDT">BTC/USDT</option>
                        <option value="ETH/USDT">ETH/USDT</option>
                        <option value="SOL/USDT">SOL/USDT</option>
                        <option value="EUR/USD">EUR/USD</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Condición</label>
                      <select value={newAlert.condition} onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-4 py-2 text-white">
                        <option value="above">Por encima de</option>
                        <option value="below">Por debajo de</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-sm text-gray-400 mb-1 block">Precio</label>
                      <input type="number" value={newAlert.price} onChange={(e) => setNewAlert({ ...newAlert, price: Number(e.target.value) })} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-4 py-2 text-white" />
                    </div>
                    <button onClick={handleAddAlert} disabled={actionLoading === -1} className="w-full py-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white font-medium flex items-center justify-center gap-2">
                      {actionLoading === -1 ? <Loader2 className="w-4 h-4 animate-spin" /> : null} Crear Alerta
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Price Alerts List */}
            <div className="space-y-3">
              {priceAlerts.map(alert => (
                <div key={alert.id} className={`bg-[#13111c] rounded-xl p-4 border ${alert.active ? 'border-purple-900/20' : 'border-gray-800'}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${alert.active ? 'bg-purple-600/20' : 'bg-[#1a1625]'}`}>
                        {alert.condition === 'above' ? <TrendingUp className={`w-5 h-5 ${alert.active ? 'text-green-400' : 'text-gray-500'}`} /> : <TrendingDown className={`w-5 h-5 ${alert.active ? 'text-red-400' : 'text-gray-500'}`} />}
                      </div>
                      <div>
                        <h3 className={`font-medium ${alert.active ? 'text-white' : 'text-gray-500'}`}>{alert.symbol}</h3>
                        <p className="text-sm text-gray-400">
                          {alert.condition === 'above' ? 'Por encima de' : 'Por debajo de'} <span className="text-white font-medium">${alert.price.toLocaleString()}</span>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {alert.triggered && <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded-full">Activada</span>}
                      <button onClick={() => handleToggleAlert(alert.id)} className={`p-2 rounded-lg ${alert.active ? 'bg-green-500/20 text-green-400' : 'bg-[#1a1625] text-gray-500'}`}>
                        {alert.active ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteAlert(alert.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-gray-400 hover:text-red-400">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {priceAlerts.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No tienes alertas de precio configuradas</p>
                  <button onClick={() => setShowAddAlert(true)} className="mt-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-white text-sm">
                    Crear primera alerta
                  </button>
                </div>
              )}
            </div>

            {/* Alert Settings */}
            {settings && (
              <div className="mt-6 p-4 bg-[#1a1625] rounded-xl border border-purple-900/20">
                <h4 className="text-white font-medium mb-3 flex items-center gap-2"><Settings className="w-4 h-4 text-purple-400" /> Configuración de Alertas</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Notificaciones push</span>
                    <input type="checkbox" checked={settings.push_enabled} onChange={(e) => handleUpdateSettings('push_enabled', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Alertas de precio</span>
                    <input type="checkbox" checked={settings.price_alerts_enabled} onChange={(e) => handleUpdateSettings('price_alerts_enabled', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                  </label>
                  <label className="flex items-center justify-between">
                    <span className="text-sm text-gray-400">Email de alerta</span>
                    <input type="checkbox" checked={settings.email_enabled} onChange={(e) => handleUpdateSettings('email_enabled', e.target.checked)} className="w-4 h-4 accent-purple-600" />
                  </label>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { History, TrendingUp, TrendingDown, Calendar, Filter, Download, Search, BarChart3, PieChart, ArrowUp, ArrowDown, Clock, DollarSign, Target, Award, Loader2, RefreshCw } from 'lucide-react';
import { tradingAPI } from '../../lib/api';

interface TradeHistory {
  id: number;
  symbol: string;
  direction: 'up' | 'down';
  amount: number;
  entry_price: number;
  exit_price: number;
  payout: number;
  profit: number;
  status: 'won' | 'lost' | 'active' | 'cancelled';
  duration: number;
  created_at: string;
  closed_at: string;
  is_demo: boolean;
}

interface TradeStats {
  total_trades: number;
  won_trades: number;
  lost_trades: number;
  win_rate: number;
  total_profit: number;
  total_loss: number;
  net_profit: number;
  best_trade: number;
  worst_trade: number;
  avg_trade_amount: number;
}

export default function HistoryView() {
  const [activeTab, setActiveTab] = useState<'trades' | 'stats'>('trades');
  const [dateRange, setDateRange] = useState('all');
  const [filterSymbol, setFilterSymbol] = useState('all');
  const [filterResult, setFilterResult] = useState('all');
  const [filterAccount, setFilterAccount] = useState('all');
  const [searchTrade, setSearchTrade] = useState('');
  const [loading, setLoading] = useState(true);
  const [trades, setTrades] = useState<TradeHistory[]>([]);
  const [stats, setStats] = useState<TradeStats>({
    total_trades: 0, won_trades: 0, lost_trades: 0, win_rate: 0,
    total_profit: 0, total_loss: 0, net_profit: 0,
    best_trade: 0, worst_trade: 0, avg_trade_amount: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [tradesRes, statsRes] = await Promise.all([
        tradingAPI.getTradeHistory(100, 0),
        tradingAPI.getTradeStats()
      ]);
      setTrades(tradesRes.data.trades || []);
      if (statsRes.data.stats) {
        setStats(statsRes.data.stats);
      }
    } catch (err) {
      console.error('Error loading history:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calcular estadísticas por símbolo
  const symbolStats = trades.reduce((acc, trade) => {
    if (trade.status !== 'won' && trade.status !== 'lost') return acc;
    
    if (!acc[trade.symbol]) {
      acc[trade.symbol] = { symbol: trade.symbol, trades: 0, wins: 0, profit: 0 };
    }
    acc[trade.symbol].trades++;
    if (trade.status === 'won') acc[trade.symbol].wins++;
    acc[trade.symbol].profit += trade.profit;
    return acc;
  }, {} as Record<string, { symbol: string; trades: number; wins: number; profit: number }>);

  const symbolStatsArray = Object.values(symbolStats)
    .map(s => ({ ...s, winRate: s.trades > 0 ? Math.round((s.wins / s.trades) * 100) : 0 }))
    .sort((a, b) => b.trades - a.trades)
    .slice(0, 5);

  // Obtener símbolos únicos para el filtro
  const uniqueSymbols = [...new Set(trades.map(t => t.symbol))];

  // Filtrar trades
  const filteredTrades = trades.filter(t => {
    if (filterSymbol !== 'all' && t.symbol !== filterSymbol) return false;
    if (filterResult !== 'all' && t.status !== filterResult) return false;
    if (filterAccount === 'live' && t.is_demo) return false;
    if (filterAccount === 'demo' && !t.is_demo) return false;
    if (searchTrade && !t.symbol.toLowerCase().includes(searchTrade.toLowerCase()) && !t.id.toString().includes(searchTrade)) return false;
    
    // Filtro por fecha
    if (dateRange !== 'all') {
      const tradeDate = new Date(t.created_at);
      const now = new Date();
      if (dateRange === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        if (tradeDate < today) return false;
      } else if (dateRange === 'week') {
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (tradeDate < weekAgo) return false;
      } else if (dateRange === 'month') {
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (tradeDate < monthAgo) return false;
      }
    }
    return true;
  });

  const handleExport = () => {
    // Generar CSV
    const headers = ['ID', 'Símbolo', 'Dirección', 'Monto', 'Entrada', 'Salida', 'Resultado', 'Ganancia', 'Fecha'];
    const rows = filteredTrades.map(t => [
      t.id,
      t.symbol,
      t.direction === 'up' ? 'COMPRA' : 'VENTA',
      t.amount,
      t.entry_price,
      t.exit_price || '-',
      t.status === 'won' ? 'Ganada' : t.status === 'lost' ? 'Perdida' : t.status,
      t.profit,
      new Date(t.created_at).toLocaleString()
    ]);
    
    const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `historial_trades_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
            <h1 className="text-xl font-bold text-white flex items-center gap-2"><History className="w-6 h-6 text-purple-400" /> Historial de Operaciones</h1>
            <p className="text-gray-400 text-sm">Revisa tu rendimiento y estadísticas</p>
          </div>
          <div className="flex gap-2">
            <button onClick={loadData} className="px-3 py-2 bg-[#1a1625] hover:bg-[#252040] rounded-lg text-sm text-gray-400 flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
            </button>
            <button onClick={handleExport} className="px-4 py-2 bg-purple-600 hover:bg-purple-700 rounded-lg text-sm flex items-center gap-2">
              <Download className="w-4 h-4" /> Exportar
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Target className="w-5 h-5 text-purple-400" /><span className="text-gray-400 text-xs">Total Operaciones</span></div>
            <p className="text-2xl font-bold text-white">{stats.total_trades}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><Award className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-xs">Win Rate</span></div>
            <p className="text-2xl font-bold text-green-400">{stats.win_rate.toFixed(1)}%</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><TrendingUp className="w-5 h-5 text-green-400" /><span className="text-gray-400 text-xs">Ganancia Neta</span></div>
            <p className={`text-2xl font-bold ${stats.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>${stats.net_profit.toFixed(2)}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <div className="flex items-center gap-2 mb-2"><DollarSign className="w-5 h-5 text-yellow-400" /><span className="text-gray-400 text-xs">Mejor Operación</span></div>
            <p className="text-2xl font-bold text-yellow-400">${stats.best_trade.toFixed(2)}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button onClick={() => setActiveTab('trades')} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === 'trades' ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}><History className="w-4 h-4" /> Operaciones</button>
          <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${activeTab === 'stats' ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400'}`}><BarChart3 className="w-4 h-4" /> Estadísticas</button>
        </div>

        {activeTab === 'trades' && (
          <>
            {/* Filters */}
            <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 mb-4">
              <div className="flex flex-wrap gap-3">
                <div className="flex-1 min-w-[200px]">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input type="text" placeholder="Buscar por ID o símbolo..." value={searchTrade} onChange={(e) => setSearchTrade(e.target.value)} className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg pl-10 pr-4 py-2 text-sm text-white" />
                  </div>
                </div>
                <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="today">Hoy</option>
                  <option value="week">Esta semana</option>
                  <option value="month">Este mes</option>
                  <option value="all">Todo</option>
                </select>
                <select value={filterSymbol} onChange={(e) => setFilterSymbol(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="all">Todos los pares</option>
                  {uniqueSymbols.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <select value={filterResult} onChange={(e) => setFilterResult(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="all">Todos</option>
                  <option value="won">Ganadas</option>
                  <option value="lost">Perdidas</option>
                </select>
                <select value={filterAccount} onChange={(e) => setFilterAccount(e.target.value)} className="bg-[#1a1625] border border-purple-900/30 rounded-lg px-3 py-2 text-sm text-white">
                  <option value="all">Todas las cuentas</option>
                  <option value="live">Cuenta Real</option>
                  <option value="demo">Cuenta Demo</option>
                </select>
              </div>
            </div>

            {/* Trades List */}
            <div className="bg-[#13111c] rounded-xl border border-purple-900/20 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#1a1625]">
                    <tr>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">ID</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Par</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Dirección</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Monto</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Entrada</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Salida</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Resultado</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Cuenta</th>
                      <th className="text-left text-xs text-gray-400 font-medium px-4 py-3">Fecha</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-purple-900/20">
                    {filteredTrades.map(trade => (
                      <tr key={trade.id} className="hover:bg-[#1a1625]/50">
                        <td className="px-4 py-3 text-sm text-gray-300">#{trade.id}</td>
                        <td className="px-4 py-3 text-sm text-white font-medium">{trade.symbol}</td>
                        <td className="px-4 py-3">
                          <span className={`flex items-center gap-1 text-sm ${trade.direction === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.direction === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
                            {trade.direction === 'up' ? 'COMPRA' : 'VENTA'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-white">${trade.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{trade.entry_price.toFixed(trade.entry_price < 10 ? 4 : 2)}</td>
                        <td className="px-4 py-3 text-sm text-gray-300">{trade.exit_price ? trade.exit_price.toFixed(trade.exit_price < 10 ? 4 : 2) : '-'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            trade.status === 'won' ? 'bg-green-500/20 text-green-400' : 
                            trade.status === 'lost' ? 'bg-red-500/20 text-red-400' : 
                            trade.status === 'active' ? 'bg-blue-500/20 text-blue-400' :
                            'bg-gray-500/20 text-gray-400'
                          }`}>
                            {trade.status === 'won' ? `+$${trade.profit.toFixed(2)}` : 
                             trade.status === 'lost' ? `-$${trade.amount.toFixed(2)}` : 
                             trade.status === 'active' ? 'Activa' : 'Cancelada'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-xs ${trade.is_demo ? 'bg-blue-500/20 text-blue-400' : 'bg-green-500/20 text-green-400'}`}>
                            {trade.is_demo ? 'Demo' : 'Real'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(trade.created_at).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredTrades.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <Filter className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No se encontraron operaciones</p>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'stats' && (
          <>
            {/* Detailed Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Win/Loss Summary */}
              <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><PieChart className="w-5 h-5 text-purple-400" /> Resumen de Resultados</h3>
                <div className="flex items-center justify-center gap-8">
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-green-500 flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-green-400">{stats.won_trades}</span>
                    </div>
                    <p className="text-sm text-gray-400">Ganadas</p>
                  </div>
                  <div className="text-center">
                    <div className="w-20 h-20 rounded-full border-4 border-red-500 flex items-center justify-center mb-2">
                      <span className="text-2xl font-bold text-red-400">{stats.lost_trades}</span>
                    </div>
                    <p className="text-sm text-gray-400">Perdidas</p>
                  </div>
                </div>
                <div className="mt-4 bg-[#1a1625] rounded-lg p-3">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-400">Win Rate</span>
                    <span className="text-green-400 font-medium">{stats.win_rate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(stats.win_rate, 100)}%` }} />
                  </div>
                </div>
              </div>

              {/* Profit Summary */}
              <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
                <h3 className="text-white font-medium mb-4 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-green-400" /> Resumen de Ganancias</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                    <span className="text-gray-400">Total Ganado</span>
                    <span className="text-green-400 font-bold">+${stats.total_profit.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-[#1a1625] rounded-lg">
                    <span className="text-gray-400">Total Perdido</span>
                    <span className="text-red-400 font-bold">-${stats.total_loss.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-purple-600/20 rounded-lg border border-purple-500/30">
                    <span className="text-white font-medium">Ganancia Neta</span>
                    <span className={`font-bold text-lg ${stats.net_profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {stats.net_profit >= 0 ? '+' : ''}${stats.net_profit.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Performance by Symbol */}
            <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 mb-6">
              <h3 className="text-white font-medium mb-4 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-purple-400" /> Rendimiento por Par</h3>
              {symbolStatsArray.length > 0 ? (
                <div className="space-y-3">
                  {symbolStatsArray.map(s => (
                    <div key={s.symbol} className="flex items-center gap-4 p-3 bg-[#1a1625] rounded-lg">
                      <div className="w-24 font-medium text-white">{s.symbol}</div>
                      <div className="flex-1">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-gray-400">{s.trades} operaciones</span>
                          <span className={s.winRate >= 50 ? 'text-green-400' : 'text-red-400'}>{s.winRate}% win</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${s.winRate >= 50 ? 'bg-green-500' : 'bg-red-500'}`} style={{ width: `${s.winRate}%` }} />
                        </div>
                      </div>
                      <div className={`w-20 text-right font-medium ${s.profit >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {s.profit >= 0 ? '+' : ''}${s.profit.toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">No hay datos suficientes</div>
              )}
            </div>

            {/* Additional Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 text-center">
                <Calendar className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Trades Ganados</p>
                <p className="text-lg font-bold text-white">{stats.won_trades}</p>
              </div>
              <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 text-center">
                <DollarSign className="w-6 h-6 text-yellow-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Monto Promedio</p>
                <p className="text-lg font-bold text-white">${stats.avg_trade_amount.toFixed(2)}</p>
              </div>
              <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 text-center">
                <TrendingUp className="w-6 h-6 text-green-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Mejor Operación</p>
                <p className="text-lg font-bold text-green-400">+${stats.best_trade.toFixed(2)}</p>
              </div>
              <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20 text-center">
                <TrendingDown className="w-6 h-6 text-red-400 mx-auto mb-2" />
                <p className="text-xs text-gray-400 mb-1">Peor Operación</p>
                <p className="text-lg font-bold text-red-400">${stats.worst_trade.toFixed(2)}</p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

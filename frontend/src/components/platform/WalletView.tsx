import { useState, useEffect } from 'react';
import { Wallet, ArrowUpRight, ArrowDownLeft, Copy, QrCode, Clock, CheckCircle, XCircle, AlertTriangle, Search, Download, ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { walletAPI } from '../../lib/api';

type TabType = 'overview' | 'deposit' | 'withdraw' | 'history';

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  tx_hash?: string;
  address?: string;
}

interface WithdrawalRequest {
  id: number;
  amount: number;
  currency: string;
  network?: string;
  address: string;
  fee: number;
  status: string;
  created_at: string;
}

interface CryptoOption {
  symbol: string;
  name: string;
  networks: string[];
  min_deposit: number;
  min_withdrawal: number;
  fee: number;
}

interface WalletSummary {
  live_balance: number;
  demo_balance: number;
  bonus_balance: number;
  pending_withdrawal: number;
  total_deposits: number;
  total_withdrawals: number;
}

export default function WalletView() {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [searchTx, setSearchTx] = useState('');
  const [filterType, setFilterType] = useState('all');

  // State from API
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [cryptoOptions, setCryptoOptions] = useState<CryptoOption[]>([]);
  const [depositAddress, setDepositAddress] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

  // Load deposit address when crypto/network changes
  useEffect(() => {
    if (activeTab === 'deposit' && selectedCrypto && selectedNetwork) {
      loadDepositAddress();
    }
  }, [activeTab, selectedCrypto, selectedNetwork]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [summaryRes, txRes, withdrawRes, optionsRes] = await Promise.all([
        walletAPI.getSummary(),
        walletAPI.getTransactions('all', 50, 0),
        walletAPI.getWithdrawals('all', 50, 0),
        walletAPI.getCryptoOptions()
      ]);
      setSummary(summaryRes.data.summary);
      setTransactions(txRes.data.transactions || []);
      setWithdrawals(withdrawRes.data.withdrawals || []);
      setCryptoOptions(optionsRes.data.options || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  };

  const loadDepositAddress = async () => {
    setLoadingAddress(true);
    try {
      const res = await walletAPI.getDepositAddress(selectedCrypto, selectedNetwork);
      setDepositAddress(res.data.address?.address || '');
    } catch (err) {
      setDepositAddress('');
    } finally {
      setLoadingAddress(false);
    }
  };

  const handleCopyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    alert('Dirección copiada');
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || !withdrawAddress) return;
    
    setSubmitting(true);
    try {
      await walletAPI.requestWithdrawal({
        amount: parseFloat(withdrawAmount),
        currency: selectedCrypto,
        network: selectedNetwork,
        address: withdrawAddress
      });
      alert('Solicitud de retiro creada exitosamente');
      setWithdrawAmount('');
      setWithdrawAddress('');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al solicitar retiro');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelWithdraw = async (id: number) => {
    if (!confirm('¿Cancelar este retiro?')) return;
    try {
      await walletAPI.cancelWithdrawal(id);
      alert('Retiro cancelado');
      loadData();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Error al cancelar');
    }
  };

  const pendingWithdrawals = withdrawals.filter(w => w.status === 'pending');

  const filteredTransactions = transactions.filter(t => {
    if (filterType !== 'all' && t.type !== filterType) return false;
    if (searchTx && !t.tx_hash?.includes(searchTx) && !t.address?.includes(searchTx)) return false;
    return true;
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertTriangle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'deposit': return { label: 'Depósito', color: 'text-green-400', icon: ArrowDownLeft };
      case 'withdrawal': return { label: 'Retiro', color: 'text-red-400', icon: ArrowUpRight };
      case 'bonus': return { label: 'Bono', color: 'text-purple-400', icon: Wallet };
      case 'trade_profit': return { label: 'Ganancia', color: 'text-green-400', icon: ArrowUpRight };
      case 'trade_loss': return { label: 'Pérdida', color: 'text-red-400', icon: ArrowDownLeft };
      default: return { label: type, color: 'text-gray-400', icon: Wallet };
    }
  };

  const currentCrypto = cryptoOptions.find(c => c.symbol === selectedCrypto);

  const exportToCSV = () => {
    const headers = ['Fecha', 'Tipo', 'Monto', 'Moneda', 'Estado', 'Hash'];
    const rows = filteredTransactions.map(tx => [
      new Date(tx.created_at).toLocaleString(),
      getTypeLabel(tx.type).label,
      tx.amount.toString(),
      tx.currency,
      tx.status,
      tx.tx_hash || ''
    ]);
    
    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacciones_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
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
        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/30 rounded-lg text-red-400 text-sm">
            {error}
            <button onClick={loadData} className="ml-2 underline">Reintentar</button>
          </div>
        )}

        {/* Header con Balances */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-gradient-to-br from-purple-600 to-violet-700 rounded-xl p-4">
            <p className="text-purple-200 text-xs">Balance Real</p>
            <p className="text-2xl font-bold text-white">${(summary?.live_balance || 0).toLocaleString()}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <p className="text-gray-400 text-xs">Balance Demo</p>
            <p className="text-2xl font-bold text-blue-400">${(summary?.demo_balance || 0).toLocaleString()}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <p className="text-gray-400 text-xs">Bonos Activos</p>
            <p className="text-2xl font-bold text-yellow-400">${(summary?.bonus_balance || 0).toLocaleString()}</p>
          </div>
          <div className="bg-[#13111c] rounded-xl p-4 border border-purple-900/20">
            <p className="text-gray-400 text-xs">Retiros Pendientes</p>
            <p className="text-2xl font-bold text-orange-400">${(summary?.pending_withdrawal || 0).toLocaleString()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {[
            { id: 'overview', label: 'Resumen', icon: Wallet },
            { id: 'deposit', label: 'Depositar', icon: ArrowDownLeft },
            { id: 'withdraw', label: 'Retirar', icon: ArrowUpRight },
            { id: 'history', label: 'Historial', icon: Clock },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id as TabType)} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 whitespace-nowrap ${activeTab === tab.id ? 'bg-purple-600 text-white' : 'bg-[#1a1625] text-gray-400 hover:bg-[#252040]'}`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
          <button onClick={loadData} className="px-3 py-2 rounded-lg bg-[#1a1625] text-gray-400 hover:bg-[#252040]">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setActiveTab('deposit')} className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-4 text-left hover:shadow-lg hover:shadow-green-500/20 transition-all">
                <ArrowDownLeft className="w-8 h-8 mb-2" />
                <p className="text-lg font-bold">Depositar</p>
                <p className="text-green-200 text-sm">{cryptoOptions.length}+ criptomonedas</p>
              </button>
              <button onClick={() => setActiveTab('withdraw')} className="bg-gradient-to-r from-orange-600 to-red-600 rounded-xl p-4 text-left hover:shadow-lg hover:shadow-orange-500/20 transition-all">
                <ArrowUpRight className="w-8 h-8 mb-2" />
                <p className="text-lg font-bold">Retirar</p>
                <p className="text-orange-200 text-sm">Proceso rápido</p>
              </button>
            </div>

            {/* Pending Withdrawals */}
            {pendingWithdrawals.length > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                <h3 className="text-yellow-400 font-medium mb-3 flex items-center gap-2"><Clock className="w-5 h-5" /> Retiros Pendientes</h3>
                <div className="space-y-2">
                  {pendingWithdrawals.map(w => (
                    <div key={w.id} className="flex items-center justify-between bg-[#0d0b14] p-3 rounded-lg">
                      <div><p className="text-white">${w.amount} {w.currency}</p><p className="text-gray-500 text-xs">{new Date(w.created_at).toLocaleString()}</p></div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 text-xs rounded">Procesando</span>
                        <button onClick={() => handleCancelWithdraw(w.id)} className="text-red-400 text-xs hover:underline">Cancelar</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recent Transactions */}
            <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-medium">Transacciones Recientes</h3>
                <button onClick={() => setActiveTab('history')} className="text-purple-400 text-sm hover:underline">Ver todo</button>
              </div>
              <div className="space-y-2">
                {transactions.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">No hay transacciones</p>
                ) : transactions.slice(0, 5).map(tx => {
                  const typeInfo = getTypeLabel(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-3 bg-[#0d0b14] rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20"><typeInfo.icon className={`w-4 h-4 ${typeInfo.color}`} /></div>
                        <div><p className="text-white text-sm">{typeInfo.label}</p><p className="text-gray-500 text-xs">{new Date(tx.created_at).toLocaleString()}</p></div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>{tx.amount >= 0 ? '+' : ''}{tx.amount} {tx.currency}</p>
                        <div className="flex items-center gap-1 justify-end">{getStatusIcon(tx.status)}<span className="text-gray-500 text-xs">{tx.status}</span></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Deposit Tab */}
        {activeTab === 'deposit' && (
          <div className="space-y-4">
            <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
              <h3 className="text-white font-medium mb-4">Selecciona Criptomoneda</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
                {cryptoOptions.map(crypto => (
                  <button key={crypto.symbol} onClick={() => { setSelectedCrypto(crypto.symbol); setSelectedNetwork(crypto.networks[0]); }} className={`p-3 rounded-lg text-center transition-all ${selectedCrypto === crypto.symbol ? 'bg-purple-600 text-white' : 'bg-[#0d0b14] text-gray-400 hover:bg-[#1a1625]'}`}>
                    <span className="text-lg block mb-1">{crypto.symbol}</span>
                    <span className="text-xs">{crypto.name}</span>
                  </button>
                ))}
              </div>
              {currentCrypto && currentCrypto.networks.length > 1 && (
                <div className="mb-4">
                  <label className="text-gray-400 text-xs block mb-2">Red</label>
                  <div className="flex gap-2">
                    {currentCrypto.networks.map(net => (
                      <button key={net} onClick={() => setSelectedNetwork(net)} className={`px-4 py-2 rounded-lg text-sm ${selectedNetwork === net ? 'bg-purple-600 text-white' : 'bg-[#0d0b14] text-gray-400'}`}>{net}</button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
              <h3 className="text-white font-medium mb-4">Dirección de Depósito</h3>
              <div className="bg-[#0d0b14] p-4 rounded-lg text-center mb-4">
                <div className="w-32 h-32 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center overflow-hidden">
                  {loadingAddress ? (
                    <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
                  ) : depositAddress ? (
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(depositAddress)}`} 
                      alt="QR Code" 
                      className="w-full h-full"
                    />
                  ) : (
                    <QrCode className="w-20 h-20 text-gray-800" />
                  )}
                </div>
                {loadingAddress ? (
                  <div className="flex items-center justify-center gap-2 p-3"><Loader2 className="w-4 h-4 animate-spin" /> Generando...</div>
                ) : (
                  <div className="flex items-center justify-center gap-2 bg-[#1a1625] p-3 rounded-lg">
                    <code className="text-purple-400 text-sm break-all">{depositAddress || 'Selecciona una criptomoneda'}</code>
                    {depositAddress && <button onClick={() => handleCopyAddress(depositAddress)} className="p-1 hover:bg-purple-600 rounded"><Copy className="w-4 h-4" /></button>}
                  </div>
                )}
              </div>
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <p className="text-yellow-400 text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Importante</p>
                <ul className="text-gray-400 text-xs mt-2 space-y-1">
                  <li>• Solo envía {selectedCrypto} a esta dirección</li>
                  <li>• Red: {selectedNetwork}</li>
                  <li>• Depósito mínimo: {currentCrypto?.min_deposit || 10} {selectedCrypto}</li>
                  <li>• Los depósitos se acreditan después de 1 confirmación</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Withdraw Tab */}
        {activeTab === 'withdraw' && (
          <div className="space-y-4">
            <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
              <h3 className="text-white font-medium mb-4">Retirar Fondos</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-gray-400 text-xs block mb-2">Criptomoneda</label>
                  <div className="flex gap-2 flex-wrap">
                    {cryptoOptions.slice(0, 5).map(crypto => (
                      <button key={crypto.symbol} onClick={() => { setSelectedCrypto(crypto.symbol); setSelectedNetwork(crypto.networks[0]); }} className={`px-4 py-2 rounded-lg text-sm flex items-center gap-2 ${selectedCrypto === crypto.symbol ? 'bg-purple-600 text-white' : 'bg-[#0d0b14] text-gray-400'}`}>
                        {crypto.symbol}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-2">Monto</label>
                  <div className="relative">
                    <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(e.target.value)} placeholder="0.00" className="w-full px-4 py-3 bg-[#0d0b14] border border-purple-900/30 rounded-lg text-white text-lg" />
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">{selectedCrypto}</span>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-gray-500 text-xs">Disponible: ${summary?.live_balance || 0}</span>
                    <button onClick={() => setWithdrawAmount((summary?.live_balance || 0).toString())} className="text-purple-400 text-xs">MAX</button>
                  </div>
                </div>
                <div>
                  <label className="text-gray-400 text-xs block mb-2">Dirección de destino</label>
                  <input type="text" value={withdrawAddress} onChange={e => setWithdrawAddress(e.target.value)} placeholder={`Dirección ${selectedCrypto}`} className="w-full px-4 py-3 bg-[#0d0b14] border border-purple-900/30 rounded-lg text-white" />
                </div>
                <div className="bg-[#0d0b14] p-3 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Comisión de red</span>
                    <span className="text-white">~{currentCrypto?.fee || 2} {selectedCrypto}</span>
                  </div>
                  <div className="flex justify-between text-sm mt-1">
                    <span className="text-gray-400">Recibirás</span>
                    <span className="text-green-400">{withdrawAmount ? (parseFloat(withdrawAmount) - (currentCrypto?.fee || 2)).toFixed(2) : '0.00'} {selectedCrypto}</span>
                  </div>
                </div>
                <button onClick={handleWithdraw} disabled={!withdrawAmount || !withdrawAddress || submitting} className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Solicitar Retiro
                </button>
              </div>
            </div>
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div className="bg-[#13111c] rounded-xl border border-purple-900/20 p-4">
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input type="text" value={searchTx} onChange={e => setSearchTx(e.target.value)} placeholder="Buscar por hash o dirección..." className="w-full pl-10 pr-4 py-2 bg-[#0d0b14] border border-purple-900/30 rounded-lg text-white text-sm" />
                </div>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="px-4 py-2 bg-[#0d0b14] border border-purple-900/30 rounded-lg text-white text-sm">
                  <option value="all">Todos</option>
                  <option value="deposit">Depósitos</option>
                  <option value="withdrawal">Retiros</option>
                  <option value="trade_profit">Ganancias</option>
                  <option value="trade_loss">Pérdidas</option>
                  <option value="bonus">Bonos</option>
                </select>
                <button onClick={exportToCSV} disabled={filteredTransactions.length === 0} className="px-4 py-2 bg-[#0d0b14] border border-purple-900/30 rounded-lg text-gray-400 text-sm flex items-center gap-2 hover:bg-purple-600/20 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <Download className="w-4 h-4" /> Exportar CSV
                </button>
              </div>

              <div className="space-y-2">
                {filteredTransactions.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Wallet className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No hay transacciones</p>
                  </div>
                ) : filteredTransactions.map(tx => {
                  const typeInfo = getTypeLabel(tx.type);
                  return (
                    <div key={tx.id} className="flex items-center justify-between p-4 bg-[#0d0b14] rounded-lg hover:bg-[#1a1625] transition-all">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-purple-500/20">
                          <typeInfo.icon className={`w-5 h-5 ${typeInfo.color}`} />
                        </div>
                        <div>
                          <p className="text-white font-medium">{typeInfo.label}</p>
                          <p className="text-gray-500 text-xs">{new Date(tx.created_at).toLocaleString()}</p>
                          {tx.tx_hash && (
                            <p className="text-purple-400 text-xs flex items-center gap-1 mt-1">
                              <code>{tx.tx_hash.slice(0, 10)}...{tx.tx_hash.slice(-6)}</code>
                              <ExternalLink className="w-3 h-3" />
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${tx.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                          {tx.amount >= 0 ? '+' : ''}{tx.amount} {tx.currency}
                        </p>
                        <div className="flex items-center gap-1 justify-end">
                          {getStatusIcon(tx.status)}
                          <span className={`text-xs ${tx.status === 'completed' ? 'text-green-400' : tx.status === 'pending' ? 'text-yellow-400' : 'text-red-400'}`}>
                            {tx.status === 'completed' ? 'Completado' : tx.status === 'pending' ? 'Pendiente' : 'Fallido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

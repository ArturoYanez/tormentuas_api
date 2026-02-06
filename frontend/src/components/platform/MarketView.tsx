import { useState, useEffect, useCallback } from 'react';
import { PriceData } from '../../lib/types';
import { watchlistAPI } from '../../lib/api';
import { 
  TrendingUp, TrendingDown, Star, Search, Activity, 
  BarChart3, Globe, Gem, Bitcoin, Briefcase,
  ChevronUp, ChevronDown, Flame, ArrowRight, Loader2
} from 'lucide-react';

interface MarketViewProps {
  prices: Record<string, PriceData>;
  onSelectSymbol: (symbol: string) => void;
}

interface MarketAsset {
  symbol: string;
  name: string;
  category: string;
  payout: number;
  popular?: boolean;
}

const marketCategories = {
  forex: {
    name: 'Forex',
    icon: Globe,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    borderColor: 'border-blue-500/30',
    assets: [
      { symbol: 'EUR/USD', name: 'Euro / Dólar', payout: 92, popular: true },
      { symbol: 'GBP/USD', name: 'Libra / Dólar', payout: 90, popular: true },
      { symbol: 'USD/JPY', name: 'Dólar / Yen', payout: 88 },
      { symbol: 'USD/CHF', name: 'Dólar / Franco', payout: 87 },
      { symbol: 'AUD/USD', name: 'Aussie / Dólar', payout: 86 },
      { symbol: 'USD/CAD', name: 'Dólar / CAD', payout: 85 },
      { symbol: 'NZD/USD', name: 'Kiwi / Dólar', payout: 84 },
      { symbol: 'EUR/GBP', name: 'Euro / Libra', payout: 85 },
      { symbol: 'EUR/JPY', name: 'Euro / Yen', payout: 86 },
      { symbol: 'GBP/JPY', name: 'Libra / Yen', payout: 87 }
    ]
  },
  crypto: {
    name: 'Criptomonedas',
    icon: Bitcoin,
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/30',
    assets: [
      { symbol: 'BTC/USDT', name: 'Bitcoin', payout: 95, popular: true },
      { symbol: 'ETH/USDT', name: 'Ethereum', payout: 93, popular: true },
      { symbol: 'BNB/USDT', name: 'Binance Coin', payout: 90 },
      { symbol: 'SOL/USDT', name: 'Solana', payout: 92, popular: true },
      { symbol: 'XRP/USDT', name: 'Ripple', payout: 88 },
      { symbol: 'DOGE/USDT', name: 'Dogecoin', payout: 85 },
      { symbol: 'ADA/USDT', name: 'Cardano', payout: 86 },
      { symbol: 'AVAX/USDT', name: 'Avalanche', payout: 87 },
      { symbol: 'DOT/USDT', name: 'Polkadot', payout: 85 },
      { symbol: 'LINK/USDT', name: 'Chainlink', payout: 84 }
    ]
  },
  commodities: {
    name: 'Materias Primas',
    icon: Gem,
    color: 'text-purple-400',
    bgColor: 'bg-purple-500/20',
    borderColor: 'border-purple-500/30',
    assets: [
      { symbol: 'XAU/USD', name: 'Oro', payout: 90, popular: true },
      { symbol: 'XAG/USD', name: 'Plata', payout: 88 },
      { symbol: 'WTI/USD', name: 'Petróleo WTI', payout: 85 },
      { symbol: 'BRENT/USD', name: 'Petróleo Brent', payout: 85 },
      { symbol: 'XPT/USD', name: 'Platino', payout: 82 },
      { symbol: 'XPD/USD', name: 'Paladio', payout: 80 },
      { symbol: 'NG/USD', name: 'Gas Natural', payout: 78 },
      { symbol: 'COPPER/USD', name: 'Cobre', payout: 76 }
    ]
  },
  stocks: {
    name: 'Acciones',
    icon: Briefcase,
    color: 'text-emerald-400',
    bgColor: 'bg-emerald-500/20',
    borderColor: 'border-emerald-500/30',
    assets: [
      { symbol: 'AAPL/USD', name: 'Apple', payout: 88, popular: true },
      { symbol: 'GOOGL/USD', name: 'Google', payout: 87 },
      { symbol: 'MSFT/USD', name: 'Microsoft', payout: 86 },
      { symbol: 'AMZN/USD', name: 'Amazon', payout: 85 },
      { symbol: 'TSLA/USD', name: 'Tesla', payout: 90, popular: true },
      { symbol: 'NVDA/USD', name: 'Nvidia', payout: 92, popular: true },
      { symbol: 'META/USD', name: 'Meta', payout: 84 },
      { symbol: 'SPY/USD', name: 'S&P 500 ETF', payout: 82 },
      { symbol: 'QQQ/USD', name: 'Nasdaq ETF', payout: 83 },
      { symbol: 'DIA/USD', name: 'Dow Jones ETF', payout: 81 }
    ]
  }
};

export default function MarketView({ prices, onSelectSymbol }: MarketViewProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'name' | 'change' | 'payout'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Fetch watchlist from backend
  const fetchWatchlist = useCallback(async () => {
    try {
      const res = await watchlistAPI.get();
      setWatchlist(res.data.watchlist?.items || []);
    } catch (err) {
      console.error('Error fetching watchlist:', err);
      // Fallback to localStorage
      const saved = localStorage.getItem('watchlist');
      if (saved) setWatchlist(JSON.parse(saved));
    } finally {
      setWatchlistLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWatchlist();
  }, [fetchWatchlist]);

  const toggleWatchlist = async (symbol: string) => {
    const isInWatchlist = watchlist.includes(symbol);
    
    // Optimistic update
    setWatchlist(prev => 
      isInWatchlist 
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );

    try {
      if (isInWatchlist) {
        await watchlistAPI.removeSymbol(symbol);
      } else {
        await watchlistAPI.addSymbol(symbol);
      }
      // Also save to localStorage as backup
      const newWatchlist = isInWatchlist 
        ? watchlist.filter(s => s !== symbol)
        : [...watchlist, symbol];
      localStorage.setItem('watchlist', JSON.stringify(newWatchlist));
    } catch (err) {
      console.error('Error updating watchlist:', err);
      // Revert on error
      setWatchlist(prev => 
        isInWatchlist 
          ? [...prev, symbol]
          : prev.filter(s => s !== symbol)
      );
    }
  };

  const getAllAssets = (): (MarketAsset & { category: string })[] => {
    if (selectedCategory === 'watchlist') {
      return Object.entries(marketCategories).flatMap(([catKey, cat]) =>
        cat.assets.filter(a => watchlist.includes(a.symbol)).map(a => ({ ...a, category: catKey }))
      );
    }
    if (selectedCategory === 'all') {
      return Object.entries(marketCategories).flatMap(([catKey, cat]) =>
        cat.assets.map(a => ({ ...a, category: catKey }))
      );
    }
    const cat = marketCategories[selectedCategory as keyof typeof marketCategories];
    return cat ? cat.assets.map(a => ({ ...a, category: selectedCategory })) : [];
  };

  const filteredAssets = getAllAssets()
    .filter(asset => 
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const priceA = prices[a.symbol];
      const priceB = prices[b.symbol];
      if (sortBy === 'change') {
        const changeA = priceA?.change_24h || 0;
        const changeB = priceB?.change_24h || 0;
        return sortOrder === 'asc' ? changeA - changeB : changeB - changeA;
      }
      if (sortBy === 'payout') {
        return sortOrder === 'asc' ? a.payout - b.payout : b.payout - a.payout;
      }
      return sortOrder === 'asc' ? a.symbol.localeCompare(b.symbol) : b.symbol.localeCompare(a.symbol);
    });

  // Calculate market stats
  const allPrices = Object.values(prices);
  const bullishCount = allPrices.filter(p => p.change_24h > 0).length;
  const bearishCount = allPrices.filter(p => p.change_24h < 0).length;
  const avgVolatility = allPrices.reduce((sum, p) => sum + Math.abs(p.change_24h), 0) / (allPrices.length || 1);
  const totalAssets = Object.values(marketCategories).flatMap(c => c.assets).length;

  const handleSort = (column: 'name' | 'change' | 'payout') => {
    if (sortBy === column) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  return (
    <div className="h-full bg-[#0d0b14] overflow-y-auto custom-scrollbar">
      <div className="p-4">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
              Vista de Mercados
            </h1>
            <p className="text-[11px] text-gray-500">Explora todos los activos disponibles para operar</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-[10px] text-gray-500">Mercados en vivo</span>
          </div>
        </div>

        {/* Market Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-4">
          <div className="bg-[#13111c] rounded-lg p-2 md:p-3 border border-purple-900/20">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className={`w-5 h-5 md:w-6 md:h-6 rounded flex items-center justify-center ${bullishCount > bearishCount ? 'bg-emerald-500/20' : 'bg-red-500/20'}`}>
                {bullishCount > bearishCount ? <TrendingUp className="w-2.5 h-2.5 md:w-3 md:h-3 text-emerald-400" /> : <TrendingDown className="w-2.5 h-2.5 md:w-3 md:h-3 text-red-400" />}
              </div>
              <span className="text-[9px] md:text-[10px] text-gray-500">Sentimiento</span>
            </div>
            <div className={`text-base md:text-lg font-bold ${bullishCount > bearishCount ? 'text-emerald-400' : 'text-red-400'}`}>
              {bullishCount > bearishCount ? 'Alcista' : 'Bajista'}
            </div>
            <div className="text-[8px] md:text-[9px] text-gray-500">{bullishCount} ↑ / {bearishCount} ↓</div>
          </div>

          <div className="bg-[#13111c] rounded-lg p-2 md:p-3 border border-purple-900/20">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-purple-500/20 flex items-center justify-center">
                <Activity className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
              </div>
              <span className="text-[9px] md:text-[10px] text-gray-500">Volatilidad</span>
            </div>
            <div className="text-base md:text-lg font-bold text-purple-400">{avgVolatility.toFixed(2)}%</div>
            <div className="text-[8px] md:text-[9px] text-gray-500">Promedio 24h</div>
          </div>

          <div className="bg-[#13111c] rounded-lg p-2 md:p-3 border border-purple-900/20">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-purple-500/20 flex items-center justify-center">
                <BarChart3 className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />
              </div>
              <span className="text-[9px] md:text-[10px] text-gray-500">Activos</span>
            </div>
            <div className="text-base md:text-lg font-bold text-purple-400">{totalAssets}</div>
            <div className="text-[8px] md:text-[9px] text-gray-500">Disponibles</div>
          </div>

          <div className="bg-[#13111c] rounded-lg p-2 md:p-3 border border-purple-900/20">
            <div className="flex items-center gap-1.5 md:gap-2 mb-1">
              <div className="w-5 h-5 md:w-6 md:h-6 rounded bg-purple-500/20 flex items-center justify-center">
                {watchlistLoading ? <Loader2 className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400 animate-spin" /> : <Star className="w-2.5 h-2.5 md:w-3 md:h-3 text-purple-400" />}
              </div>
              <span className="text-[9px] md:text-[10px] text-gray-500">Watchlist</span>
            </div>
            <div className="text-base md:text-lg font-bold text-purple-400">{watchlist.length}</div>
            <div className="text-[8px] md:text-[9px] text-gray-500">Guardados</div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <div className="flex gap-1 flex-wrap overflow-x-auto pb-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[11px] font-medium transition-all whitespace-nowrap ${
                selectedCategory === 'all' 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                  : 'bg-[#1a1625] text-gray-400 hover:text-white border border-purple-900/20'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setSelectedCategory('watchlist')}
              className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[11px] font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                selectedCategory === 'watchlist' 
                  ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                  : 'bg-[#1a1625] text-gray-400 hover:text-white border border-purple-900/20'
              }`}
            >
              <Star className="w-3 h-3" /> <span className="hidden sm:inline">Favoritos</span>
            </button>
            {Object.entries(marketCategories).map(([key, cat]) => {
              const Icon = cat.icon;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-2 md:px-3 py-1 md:py-1.5 rounded-lg text-[10px] md:text-[11px] font-medium transition-all flex items-center gap-1 whitespace-nowrap ${
                    selectedCategory === key 
                      ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                      : 'bg-[#1a1625] text-gray-400 hover:text-white border border-purple-900/20'
                  }`}
                >
                  <Icon className="w-3 h-3" /> <span className="hidden md:inline">{cat.name}</span>
                </button>
              );
            })}
          </div>

          <div className="relative flex-1 min-w-0 sm:min-w-[150px] sm:max-w-[200px]">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 md:w-3.5 md:h-3.5 text-gray-500" />
            <input
              type="text"
              placeholder="Buscar..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#1a1625] border border-purple-900/30 rounded-lg px-2 md:px-3 py-1 md:py-1.5 pl-7 md:pl-8 text-[10px] md:text-[11px] focus:border-purple-500/50 focus:outline-none transition-all"
            />
          </div>
        </div>

        {/* Popular Assets */}
        {selectedCategory === 'all' && (
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="w-3.5 h-3.5 text-orange-400" />
              <span className="text-[11px] font-medium text-gray-400">Activos Populares</span>
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {getAllAssets().filter(a => a.popular).slice(0, 8).map(asset => {
                const price = prices[asset.symbol];
                const isPositive = (price?.change_24h || 0) >= 0;
                const cat = marketCategories[asset.category as keyof typeof marketCategories];
                const Icon = cat.icon;
                return (
                  <div
                    key={asset.symbol}
                    onClick={() => onSelectSymbol(asset.symbol)}
                    className="flex-shrink-0 bg-[#13111c] rounded-lg p-2.5 border border-purple-900/20 hover:border-purple-500/30 cursor-pointer transition-all min-w-[140px]"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className={`w-6 h-6 rounded ${cat.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-3 h-3 ${cat.color}`} />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium">{asset.symbol}</div>
                        <div className="text-[9px] text-gray-500">{asset.name}</div>
                      </div>
                    </div>
                    <div className="flex justify-between items-end">
                      <div className="text-sm font-bold">${price?.price?.toFixed(price.price < 1 ? 4 : 2) || '0.00'}</div>
                      <div className={`flex items-center text-[10px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {Math.abs(price?.change_24h || 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Market Table - Desktop */}
        <div className="hidden md:block bg-[#13111c] rounded-lg border border-purple-900/20 overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#1a1625]">
              <tr>
                <th className="text-left px-3 py-2 text-[10px] text-gray-500 font-medium">
                  <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-white transition-colors">
                    Activo
                    {sortBy === 'name' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="text-right px-3 py-2 text-[10px] text-gray-500 font-medium">Precio</th>
                <th className="text-right px-3 py-2 text-[10px] text-gray-500 font-medium">
                  <button onClick={() => handleSort('change')} className="flex items-center gap-1 justify-end hover:text-white transition-colors ml-auto">
                    Cambio 24h
                    {sortBy === 'change' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="text-right px-3 py-2 text-[10px] text-gray-500 font-medium">Máx/Mín 24h</th>
                <th className="text-right px-3 py-2 text-[10px] text-gray-500 font-medium">
                  <button onClick={() => handleSort('payout')} className="flex items-center gap-1 justify-end hover:text-white transition-colors ml-auto">
                    Payout
                    {sortBy === 'payout' && (sortOrder === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
                  </button>
                </th>
                <th className="text-center px-3 py-2 text-[10px] text-gray-500 font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(asset => {
                const price = prices[asset.symbol];
                const isPositive = (price?.change_24h || 0) >= 0;
                const cat = marketCategories[asset.category as keyof typeof marketCategories];
                const Icon = cat.icon;
                const inWatchlist = watchlist.includes(asset.symbol);
                
                return (
                  <tr 
                    key={asset.symbol} 
                    className="border-t border-purple-900/10 hover:bg-[#1a1625]/50 cursor-pointer transition-all"
                    onClick={() => onSelectSymbol(asset.symbol)}
                  >
                    <td className="px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.symbol); }}
                          className={`transition-colors ${inWatchlist ? 'text-purple-400' : 'text-gray-600 hover:text-purple-400'}`}
                        >
                          <Star className="w-3.5 h-3.5" fill={inWatchlist ? 'currentColor' : 'none'} />
                        </button>
                        <div className={`w-7 h-7 rounded ${cat.bgColor} flex items-center justify-center`}>
                          <Icon className={`w-3.5 h-3.5 ${cat.color}`} />
                        </div>
                        <div>
                          <div className="font-medium text-[11px] flex items-center gap-1">
                            {asset.symbol}
                            {asset.popular && <Flame className="w-2.5 h-2.5 text-orange-400" />}
                          </div>
                          <div className="text-[9px] text-gray-500">{asset.name}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="font-medium text-[12px]">${price?.price?.toFixed(price.price < 1 ? 4 : 2) || '0.00'}</span>
                    </td>
                    <td className={`px-3 py-2.5 text-right ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      <div className="flex items-center justify-end gap-0.5 text-[11px]">
                        {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {isPositive ? '+' : ''}{price?.change_24h?.toFixed(2) || '0.00'}%
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="text-[10px]">
                        <span className="text-emerald-400">${price?.high_24h?.toFixed(price?.high_24h < 1 ? 4 : 2) || '0.00'}</span>
                        <span className="text-gray-600 mx-1">/</span>
                        <span className="text-red-400">${price?.low_24h?.toFixed(price?.low_24h < 1 ? 4 : 2) || '0.00'}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">{asset.payout}%</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <button 
                        className="px-3 py-1 bg-gradient-to-r from-purple-600 to-violet-600 rounded text-[10px] font-medium hover:shadow-lg hover:shadow-purple-500/20 transition-all flex items-center gap-1 mx-auto"
                        onClick={(e) => { e.stopPropagation(); onSelectSymbol(asset.symbol); }}
                      >
                        Operar <ArrowRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Market Cards - Mobile */}
        <div className="md:hidden space-y-2">
          {filteredAssets.map(asset => {
            const price = prices[asset.symbol];
            const isPositive = (price?.change_24h || 0) >= 0;
            const cat = marketCategories[asset.category as keyof typeof marketCategories];
            const Icon = cat.icon;
            const inWatchlist = watchlist.includes(asset.symbol);
            
            return (
              <div 
                key={asset.symbol} 
                className="bg-[#13111c] rounded-lg border border-purple-900/20 p-3"
                onClick={() => onSelectSymbol(asset.symbol)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleWatchlist(asset.symbol); }}
                      className={`transition-colors ${inWatchlist ? 'text-purple-400' : 'text-gray-600'}`}
                    >
                      <Star className="w-4 h-4" fill={inWatchlist ? 'currentColor' : 'none'} />
                    </button>
                    <div className={`w-8 h-8 rounded ${cat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-4 h-4 ${cat.color}`} />
                    </div>
                    <div>
                      <div className="font-medium text-sm flex items-center gap-1">
                        {asset.symbol}
                        {asset.popular && <Flame className="w-3 h-3 text-orange-400" />}
                      </div>
                      <div className="text-[10px] text-gray-500">{asset.name}</div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[10px] font-bold">{asset.payout}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-lg font-bold">${price?.price?.toFixed(price?.price < 1 ? 4 : 2) || '0.00'}</div>
                    <div className={`flex items-center gap-0.5 text-[11px] ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                      {isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                      {isPositive ? '+' : ''}{price?.change_24h?.toFixed(2) || '0.00'}%
                    </div>
                  </div>
                  <button 
                    className="px-4 py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-[11px] font-medium"
                    onClick={(e) => { e.stopPropagation(); onSelectSymbol(asset.symbol); }}
                  >
                    Operar
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Category Cards */}
        {selectedCategory === 'all' && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mt-4">
            {Object.entries(marketCategories).map(([key, cat]) => {
              const Icon = cat.icon;
              const categoryAssets = cat.assets;
              const avgPayout = categoryAssets.reduce((sum, a) => sum + a.payout, 0) / categoryAssets.length;
              return (
                <div
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`bg-[#13111c] rounded-lg p-2 md:p-3 border ${cat.borderColor} hover:bg-[#1a1625] cursor-pointer transition-all`}
                >
                  <div className="flex items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                    <div className={`w-6 h-6 md:w-8 md:h-8 rounded-lg ${cat.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-3 h-3 md:w-4 md:h-4 ${cat.color}`} />
                    </div>
                    <div>
                      <div className="text-[10px] md:text-[11px] font-medium">{cat.name}</div>
                      <div className="text-[8px] md:text-[9px] text-gray-500">{categoryAssets.length} activos</div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[8px] md:text-[9px] text-gray-500">Payout</span>
                    <span className={`text-[10px] md:text-[11px] font-bold ${cat.color}`}>{avgPayout.toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

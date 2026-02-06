import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';
import { useWebSocket } from '../hooks/useWebSocket';
import { Trade, Market } from '../lib/types';
import { tradingAPI } from '../lib/api';

// Components
import Header, { TournamentParticipation } from '../components/platform/Header';
import Sidebar from '../components/platform/Sidebar';
import TradingView from '../components/platform/TradingView';
import TournamentsView from '../components/platform/TournamentsView';
import MarketView from '../components/platform/MarketView';
import SupportView from '../components/platform/SupportView';
import ProfileView from '../components/platform/ProfileView';
import WalletView from '../components/platform/WalletView';
import HistoryView from '../components/platform/HistoryView';
import BonusesView from '../components/platform/BonusesView';
import NotificationsView from '../components/platform/NotificationsView';
import ReferralsView from '../components/platform/ReferralsView';
import AcademyView from '../components/platform/AcademyView';
import VerificationModal from '../components/modals/VerificationModal';

type ViewType = 'trade' | 'tournaments' | 'market' | 'support' | 'wallet' | 'profile' | 'history' | 'bonuses' | 'notifications' | 'academy' | 'referrals';
type AccountType = 'live' | 'demo' | 'tournament';

// Fallback markets in case API fails
const FALLBACK_MARKETS: Market[] = [
  { id: 'crypto', name: 'Criptomonedas', pairs: ['BTC/USDT', 'ETH/USDT', 'BNB/USDT', 'XRP/USDT', 'SOL/USDT'] },
  { id: 'forex', name: 'Forex', pairs: ['EUR/USD', 'GBP/USD', 'USD/JPY', 'AUD/USD'] },
  { id: 'commodities', name: 'Materias Primas', pairs: ['XAU/USD', 'XAG/USD'] },
  { id: 'stocks', name: 'Acciones', pairs: ['AAPL/USD', 'GOOGL/USD', 'MSFT/USD', 'TSLA/USD'] }
];

// Flag para usar backend real o simulación local
const USE_BACKEND_TRADING = true;

export default function Platform() {
  const { user, updateUser } = useAuthContext();
  const { prices, subscribe, unsubscribe, connected } = useWebSocket();
  
  const [currentView, setCurrentView] = useState<ViewType>('trade');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [activeTrades, setActiveTrades] = useState<Trade[]>([]);
  const [markets, setMarkets] = useState<Market[]>(FALLBACK_MARKETS);
  const [marketsLoaded, setMarketsLoaded] = useState(false);
  const [currentSymbol, setCurrentSymbol] = useState('BTC/USDT');
  const [activePairs, setActivePairs] = useState<string[]>(['BTC/USDT']);
  
  // Account type state
  const [accountType, setAccountType] = useState<AccountType>('demo');
  const [selectedTournamentId, setSelectedTournamentId] = useState<number | undefined>();
  const [tournamentParticipations, setTournamentParticipations] = useState<TournamentParticipation[]>([]);
  const [tournamentTrades, setTournamentTrades] = useState<Record<number, Trade[]>>({});

  // Load markets from API
  useEffect(() => {
    if (!marketsLoaded) {
      tradingAPI.getMarkets()
        .then(response => {
          if (response.data.markets && response.data.markets.length > 0) {
            setMarkets(response.data.markets);
          }
          setMarketsLoaded(true);
        })
        .catch(err => {
          console.error('Error loading markets:', err);
          setMarketsLoaded(true); // Use fallback
        });
    }
  }, [marketsLoaded]);

  // Subscribe to active pairs
  useEffect(() => {
    activePairs.forEach(pair => subscribe(pair));
    return () => { activePairs.forEach(pair => unsubscribe(pair)); };
  }, [activePairs, subscribe, unsubscribe]);

  // Listen for trade results
  useEffect(() => {
    const handleTradeResult = (event: CustomEvent<Trade>) => {
      const trade = event.detail;
      
      if (accountType === 'tournament' && selectedTournamentId) {
        setTournamentTrades(prev => ({
          ...prev,
          [selectedTournamentId]: prev[selectedTournamentId]?.filter(t => t.id !== trade.id) || []
        }));
        
        setTournamentParticipations(prev => prev.map(t => {
          if (t.id === selectedTournamentId) {
            const newBalance = t.balance + trade.profit;
            return { ...t, balance: newBalance, profit: newBalance - t.initialBalance };
          }
          return t;
        }));
      } else {
        setActiveTrades(prev => prev.filter(t => t.id !== trade.id));
        if (user && accountType === 'live') {
          updateUser({ balance: user.balance + trade.profit });
        } else if (user && accountType === 'demo') {
          updateUser({ demo_balance: (user.demo_balance || 50000) + trade.profit });
        }
      }

      const isWin = trade.status === 'won';
      showNotification(
        isWin ? `¡Ganaste $${trade.profit.toFixed(2)}!` : `Perdiste $${Math.abs(trade.profit).toFixed(2)}`,
        isWin ? 'success' : 'error'
      );
    };

    window.addEventListener('tradeResult', handleTradeResult as EventListener);
    return () => { window.removeEventListener('tradeResult', handleTradeResult as EventListener); };
  }, [user, updateUser, accountType, selectedTournamentId]);

  // Listen for tournament join events
  useEffect(() => {
    const handleTournamentJoin = (event: CustomEvent<TournamentParticipation>) => {
      const tournament = event.detail;
      setTournamentParticipations(prev => {
        const exists = prev.find(t => t.id === tournament.id);
        if (exists) return prev;
        return [...prev, tournament];
      });
      setTournamentTrades(prev => ({ ...prev, [tournament.id]: [] }));
    };

    const handleTournamentUpdate = (event: CustomEvent<TournamentParticipation>) => {
      const tournament = event.detail;
      setTournamentParticipations(prev => prev.map(t => t.id === tournament.id ? tournament : t));
    };

    window.addEventListener('tournamentJoin', handleTournamentJoin as EventListener);
    window.addEventListener('tournamentUpdate', handleTournamentUpdate as EventListener);
    return () => {
      window.removeEventListener('tournamentJoin', handleTournamentJoin as EventListener);
      window.removeEventListener('tournamentUpdate', handleTournamentUpdate as EventListener);
    };
  }, []);

  const showNotification = (message: string, type: 'success' | 'error') => {
    const notification = document.createElement('div');
    notification.className = `fixed top-24 right-6 px-6 py-4 rounded-2xl font-semibold z-50 shadow-2xl backdrop-blur-xl border animate-slide-up ${
      type === 'success' ? 'bg-emerald-600/90 border-emerald-500/50 text-white' : 'bg-red-600/90 border-red-500/50 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateY(-10px)';
      notification.style.transition = 'all 0.3s ease-out';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  };

  const handleAccountTypeChange = useCallback((type: AccountType, tournamentId?: number) => {
    setAccountType(type);
    if (type === 'tournament' && tournamentId) {
      setSelectedTournamentId(tournamentId);
      setCurrentView('trade');
    } else {
      setSelectedTournamentId(undefined);
    }
  }, []);

  const handleSelectSymbol = useCallback((symbol: string) => {
    setCurrentSymbol(symbol);
    if (!activePairs.includes(symbol)) {
      setActivePairs(prev => [...prev, symbol]);
    }
  }, [activePairs]);

  const handleRemovePair = useCallback((symbol: string) => {
    if (activePairs.length <= 1) return;
    setActivePairs(prev => prev.filter(s => s !== symbol));
    unsubscribe(symbol);
    if (symbol === currentSymbol) {
      setCurrentSymbol(activePairs.find(s => s !== symbol) || 'BTC/USDT');
    }
  }, [activePairs, currentSymbol, unsubscribe]);


  const handlePlaceTrade = useCallback((direction: 'up' | 'down', amount: number, duration: number) => {
    const currentPrice = prices[currentSymbol]?.price || 67500;
    
    // Check balance
    let availableBalance = 0;
    if (accountType === 'tournament' && selectedTournamentId) {
      const tournament = tournamentParticipations.find(t => t.id === selectedTournamentId);
      availableBalance = tournament?.balance || 0;
    } else if (accountType === 'live') {
      availableBalance = user?.balance || 0;
    } else {
      availableBalance = user?.demo_balance || 50000;
    }

    if (amount > availableBalance) {
      showNotification('Balance insuficiente', 'error');
      return;
    }

    // Función para ejecutar trade local (simulación)
    const executeLocalTrade = () => {
      const trade: Trade = {
        id: Date.now(),
        user_id: user?.id || 1,
        symbol: currentSymbol,
        direction,
        amount,
        entry_price: currentPrice,
        exit_price: 0,
        payout: 85,
        profit: 0,
        status: 'active',
        created_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + duration * 1000).toISOString()
      };

      if (accountType === 'tournament' && selectedTournamentId) {
        setTournamentParticipations(prev => prev.map(t => {
          if (t.id === selectedTournamentId) {
            return { ...t, balance: t.balance - amount };
          }
          return t;
        }));
        setTournamentTrades(prev => ({
          ...prev,
          [selectedTournamentId]: [...(prev[selectedTournamentId] || []), trade]
        }));
      } else {
        setActiveTrades(prev => [...prev, trade]);
        if (accountType === 'live') {
          updateUser({ balance: (user?.balance || 0) - amount });
        } else {
          updateUser({ demo_balance: (user?.demo_balance || 50000) - amount });
        }
      }

      showNotification(`Operación abierta: ${direction === 'up' ? 'COMPRA' : 'VENTA'} $${amount}`, 'success');

      // Simular resultado con algoritmo 20% ganadores
      setTimeout(() => {
        const exitPrice = prices[currentSymbol]?.price || currentPrice;
        const algorithmWin = Math.random() < (accountType === 'tournament' ? 0.45 : 0.20);
        const tradeProfit = algorithmWin ? amount * 0.85 : -amount;
        
        const completedTrade: Trade = {
          ...trade,
          exit_price: exitPrice,
          profit: algorithmWin ? amount + tradeProfit : 0,
          status: algorithmWin ? 'won' : 'lost'
        };

        window.dispatchEvent(new CustomEvent('tradeResult', { detail: completedTrade }));
      }, duration * 1000);
    };

    // Intentar usar el backend real para cuentas live/demo
    if (USE_BACKEND_TRADING && accountType !== 'tournament') {
      tradingAPI.placeTrade({
        symbol: currentSymbol,
        direction,
        amount,
        duration,
        is_demo: accountType === 'demo'
      }).then(response => {
        const trade = response.data.trade;
        setActiveTrades(prev => [...prev, trade]);
        
        if (accountType === 'live') {
          updateUser({ balance: (user?.balance || 0) - amount });
        } else {
          updateUser({ demo_balance: (user?.demo_balance || 50000) - amount });
        }
        
        showNotification(`Operación abierta: ${direction === 'up' ? 'COMPRA' : 'VENTA'} $${amount}`, 'success');
      }).catch((error: any) => {
        console.error('Error colocando trade:', error);
        if (error.response?.data?.code === 'INSUFFICIENT_BALANCE') {
          showNotification('Balance insuficiente', 'error');
        } else {
          executeLocalTrade();
        }
      });
      return;
    }

    executeLocalTrade();
  }, [currentSymbol, prices, user, updateUser, accountType, selectedTournamentId, tournamentParticipations]);

  const getCurrentTrades = () => {
    if (accountType === 'tournament' && selectedTournamentId) {
      return tournamentTrades[selectedTournamentId] || [];
    }
    return activeTrades;
  };

  const renderView = () => {
    switch (currentView) {
      case 'trade':
        return (
          <TradingView
            currentSymbol={currentSymbol}
            activePairs={activePairs}
            prices={prices}
            markets={markets}
            activeTrades={getCurrentTrades()}
            onSelectSymbol={handleSelectSymbol}
            onRemovePair={handleRemovePair}
            onPlaceTrade={handlePlaceTrade}
            accountType={accountType}
            tournamentInfo={accountType === 'tournament' && selectedTournamentId 
              ? tournamentParticipations.find(t => t.id === selectedTournamentId) 
              : undefined}
          />
        );
      case 'tournaments':
        return <TournamentsView onJoinTournament={(tournament) => {
          window.dispatchEvent(new CustomEvent('tournamentJoin', { detail: tournament }));
        }} />;
      case 'market':
        return <MarketView prices={prices} onSelectSymbol={handleSelectSymbol} />;
      case 'support':
        return <SupportView />;
      case 'wallet':
        return <WalletView />;
      case 'profile':
        return <ProfileView />;
      case 'history':
        return <HistoryView />;
      case 'bonuses':
        return <BonusesView />;
      case 'notifications':
        return <NotificationsView />;
      case 'referrals':
        return <ReferralsView />;
      case 'academy':
        return <AcademyView />;
      default:
        return (
          <TradingView
            currentSymbol={currentSymbol}
            activePairs={activePairs}
            prices={prices}
            markets={markets}
            activeTrades={getCurrentTrades()}
            onSelectSymbol={handleSelectSymbol}
            onRemovePair={handleRemovePair}
            onPlaceTrade={handlePlaceTrade}
            accountType={accountType}
            tournamentInfo={accountType === 'tournament' && selectedTournamentId 
              ? tournamentParticipations.find(t => t.id === selectedTournamentId) 
              : undefined}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-dark-400">
      <Header 
        connected={connected} 
        accountType={accountType}
        onAccountTypeChange={handleAccountTypeChange}
        activeTournaments={tournamentParticipations}
        selectedTournamentId={selectedTournamentId}
      />
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />
      
      <main className="pt-[44px] md:pl-16 pb-[80px] md:pb-0 h-screen overflow-auto">
        {renderView()}
      </main>

      {showVerificationModal && (
        <VerificationModal onClose={() => setShowVerificationModal(false)} />
      )}
    </div>
  );
}

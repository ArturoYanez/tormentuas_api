import { useState, useEffect, useCallback } from 'react';
import { 
  Trophy, Users, Clock, DollarSign, Star, Flame, Crown, Target, 
  Medal, Calendar, RefreshCw, Play, Gift, CheckCircle, Zap, Loader2
} from 'lucide-react';
import { tournamentAPI } from '../../lib/api';
import { TournamentParticipation } from './Header';

interface TournamentsViewProps {
  onJoinTournament?: (tournament: TournamentParticipation) => void;
}

interface Tournament {
  id: number;
  title: string;
  description: string;
  type: string;
  prize_pool: number;
  entry_fee: number;
  initial_balance: number;
  participants: number;
  max_participants: number;
  min_participants: number;
  status: 'active' | 'upcoming' | 'finished';
  starts_at: string;
  ends_at: string;
}

interface Participant {
  id: number;
  tournament_id: number;
  user_id: number;
  username?: string;
  balance: number;
  profit: number;
  profit_percent: number;
  rank: number;
  trades_count: number;
  wins_count: number;
}

interface MyTournament {
  tournament: Tournament;
  participant: Participant;
}

interface LeaderboardPlayer {
  rank: number;
  username: string;
  balance: number;
  profit: number;
  profit_percent: number;
  trades_count: number;
  wins_count: number;
  isUser?: boolean;
}


const TOURNAMENT_ICONS: Record<string, typeof Trophy> = {
  weekly: Trophy,
  monthly: Medal,
  beginner: Star,
  speed: Flame,
  elite: Crown,
  crypto: Target,
  default: Trophy
};

const TOURNAMENT_BADGES: Record<string, string> = {
  weekly: 'SEMANAL',
  monthly: 'MENSUAL',
  beginner: 'PRINCIPIANTE',
  speed: 'VELOCIDAD',
  elite: 'ELITE',
  crypto: 'CRIPTO',
  default: 'TORNEO'
};

export default function TournamentsView({ onJoinTournament }: TournamentsViewProps) {
  const [filter, setFilter] = useState<'all' | 'active' | 'upcoming' | 'free'>('all');
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [myTournaments, setMyTournaments] = useState<MyTournament[]>([]);
  const [leaderboards, setLeaderboards] = useState<Record<number, LeaderboardPlayer[]>>({});
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState<number | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showNotification = useCallback((message: string, type: 'success' | 'error' | 'info') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [tournamentsRes, myTournamentsRes] = await Promise.all([
        tournamentAPI.getAll(),
        tournamentAPI.getMyTournaments()
      ]);
      setTournaments(tournamentsRes.data.tournaments || []);
      setMyTournaments(myTournamentsRes.data.tournaments || []);
      const activeTournaments = (tournamentsRes.data.tournaments || []).filter(
        (t: Tournament) => t.status === 'active'
      );
      if (activeTournaments.length > 0) {
        const leaderboardRes = await tournamentAPI.getLeaderboard(activeTournaments[0].id, 10);
        setLeaderboards(prev => ({
          ...prev,
          [activeTournaments[0].id]: leaderboardRes.data.leaderboard || []
        }));
      }
    } catch (err) {
      console.error('Error fetching tournaments:', err);
      showNotification('Error al cargar torneos', 'error');
    } finally {
      setLoading(false);
    }
  }, [showNotification]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  const getTimeLeft = (endsAt: string) => {
    const end = new Date(endsAt);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return 'Finalizado';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const getStartsIn = (startsAt: string) => {
    const start = new Date(startsAt);
    const now = new Date();
    const diff = start.getTime() - now.getTime();
    if (diff <= 0) return 'Ya comenzó';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days} días`;
    return `${hours} horas`;
  };

  const isParticipating = (tournamentId: number) => {
    return myTournaments.some(mt => mt.tournament.id === tournamentId);
  };

  const getParticipation = (tournamentId: number) => {
    return myTournaments.find(mt => mt.tournament.id === tournamentId);
  };

  const handleJoinTournament = async (tournament: Tournament) => {
    const participation = getParticipation(tournament.id);
    if (participation) {
      if (tournament.status === 'active') {
        const tournamentData: TournamentParticipation = {
          id: tournament.id,
          title: tournament.title,
          balance: participation.participant.balance,
          initialBalance: tournament.initial_balance,
          rank: participation.participant.rank,
          profit: participation.participant.profit,
          endsAt: new Date(tournament.ends_at)
        };
        if (onJoinTournament) onJoinTournament(tournamentData);
        showNotification(`Cambiando a ${tournament.title}. ¡Opera desde el gráfico principal!`, 'success');
      } else {
        showNotification(`${tournament.title} comenzará en ${getStartsIn(tournament.starts_at)}`, 'info');
      }
      return;
    }
    try {
      setJoining(tournament.id);
      const res = await tournamentAPI.join(tournament.id);
      const participant = res.data.participant;
      await fetchData();
      if (tournament.status === 'active') {
        const tournamentData: TournamentParticipation = {
          id: tournament.id,
          title: tournament.title,
          balance: participant.balance,
          initialBalance: tournament.initial_balance,
          rank: participant.rank || tournament.participants + 1,
          profit: 0,
          endsAt: new Date(tournament.ends_at)
        };
        if (onJoinTournament) onJoinTournament(tournamentData);
        showNotification(`¡Te has unido a ${tournament.title}!`, 'success');
      } else {
        showNotification(`Registrado en ${tournament.title}. Comienza en ${getStartsIn(tournament.starts_at)}`, 'success');
      }
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error al unirse al torneo', 'error');
    } finally {
      setJoining(null);
    }
  };

  const handleRebuy = async (tournament: Tournament) => {
    try {
      setJoining(tournament.id);
      await tournamentAPI.rebuy(tournament.id);
      await fetchData();
      showNotification(`¡Rebuy exitoso! Balance: ${tournament.initial_balance}`, 'success');
    } catch (err: any) {
      showNotification(err.response?.data?.error || 'Error en rebuy', 'error');
    } finally {
      setJoining(null);
    }
  };


  const filteredTournaments = tournaments.filter(t => {
    if (filter === 'all') return true;
    if (filter === 'active') return t.status === 'active';
    if (filter === 'upcoming') return t.status === 'upcoming';
    if (filter === 'free') return t.entry_fee === 0;
    return true;
  });

  const activeTournaments = tournaments.filter(t => t.status === 'active');
  const totalPrizePool = tournaments.reduce((sum, t) => sum + t.prize_pool, 0);
  const totalParticipants = tournaments.reduce((sum, t) => sum + t.participants, 0);
  const firstActiveTournament = activeTournaments[0];
  const displayLeaderboard = firstActiveTournament ? leaderboards[firstActiveTournament.id] || [] : [];

  if (loading) {
    return (
      <div className="flex-1 p-4 bg-[#0d0b14] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto mb-2" />
          <p className="text-gray-400 text-sm">Cargando torneos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-3 md:p-4 bg-[#0d0b14] min-h-full overflow-y-auto">
      {notification && (
        <div className={`fixed top-14 md:top-16 right-2 md:right-4 px-3 md:px-4 py-2 rounded-lg text-xs md:text-sm font-medium z-50 flex items-center gap-2 ${
          notification.type === 'error' ? 'bg-red-600' : 'bg-gradient-to-r from-purple-600 to-violet-600'
        }`}>
          <CheckCircle className="w-4 h-4" />
          {notification.message}
        </div>
      )}

      <div className="text-center mb-4 md:mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl mb-3">
          <Trophy className="w-7 h-7" />
        </div>
        <h1 className="text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">
          Torneos de Trading
        </h1>
        <p className="text-gray-400 text-xs md:text-sm mt-1">Compite con traders de todo el mundo y gana premios</p>
        <div className="mt-3 flex justify-center gap-3 flex-wrap">
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-[11px] font-bold">{activeTournaments.length} Activos</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg">
            <Trophy className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-[11px] font-bold">${totalPrizePool.toLocaleString()} en Premios</span>
          </div>
          <div className="inline-flex items-center gap-1.5 bg-purple-500/10 border border-purple-500/30 px-3 py-1.5 rounded-lg">
            <Users className="w-3.5 h-3.5 text-purple-400" />
            <span className="text-purple-400 text-[11px] font-bold">{totalParticipants} Participantes</span>
          </div>
        </div>
      </div>


      <div className="flex gap-1.5 mb-4 justify-center flex-wrap">
        {[
          { id: 'all', label: 'Todos', count: tournaments.length },
          { id: 'active', label: 'Activos', count: activeTournaments.length },
          { id: 'upcoming', label: 'Próximos', count: tournaments.filter(t => t.status === 'upcoming').length },
          { id: 'free', label: 'Gratis', count: tournaments.filter(t => t.entry_fee === 0).length }
        ].map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as typeof filter)}
            className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
              filter === f.id 
                ? 'bg-gradient-to-r from-purple-600 to-violet-600 text-white' 
                : 'bg-[#1a1625] text-gray-400 hover:text-white border border-purple-900/20'
            }`}
          >
            {f.label}
            <span className={`px-1.5 py-0.5 rounded text-[9px] ${filter === f.id ? 'bg-white/20' : 'bg-purple-500/20 text-purple-400'}`}>{f.count}</span>
          </button>
        ))}
      </div>

      {myTournaments.filter(mt => mt.tournament.status === 'active').length > 0 && (
        <div className="mb-5">
          <h2 className="text-sm font-bold mb-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
            </div>
            Mis Torneos Activos
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {myTournaments.filter(mt => mt.tournament.status === 'active').map(({ tournament, participant }) => (
              <div key={tournament.id} className="bg-[#13111c] border border-purple-500/30 rounded-xl p-3">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-sm text-purple-300">{tournament.title}</span>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${participant.profit >= 0 ? 'bg-purple-500/20 text-purple-400' : 'bg-red-500/20 text-red-400'}`}>
                    {participant.profit >= 0 ? '+' : ''}{participant.profit_percent?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center mb-3">
                  <div className="bg-[#0d0b14] rounded-lg p-2 border border-purple-900/20">
                    <div className="text-[9px] text-gray-500">Balance</div>
                    <div className="text-sm font-bold text-purple-400">${participant.balance?.toFixed(0) || 0}</div>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-2 border border-purple-900/20">
                    <div className="text-[9px] text-gray-500">Rank</div>
                    <div className="text-sm font-bold text-purple-400">#{participant.rank || '-'}</div>
                  </div>
                  <div className="bg-[#0d0b14] rounded-lg p-2 border border-purple-900/20">
                    <div className="text-[9px] text-gray-500">Profit</div>
                    <div className="text-sm font-bold text-purple-400">${participant.profit?.toFixed(0) || 0}</div>
                  </div>
                </div>
                <button
                  onClick={() => handleJoinTournament(tournament)}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-purple-500/20 transition-all"
                >
                  <Play className="w-3 h-3" /> Ir a Operar
                </button>
              </div>
            ))}
          </div>
        </div>
      )}


      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {filteredTournaments.map(tournament => {
          const Icon = TOURNAMENT_ICONS[tournament.type] || TOURNAMENT_ICONS.default;
          const badge = TOURNAMENT_BADGES[tournament.type] || TOURNAMENT_BADGES.default;
          const participating = isParticipating(tournament.id);
          const participation = getParticipation(tournament.id);
          const isActive = tournament.status === 'active';
          const isJoining = joining === tournament.id;

          return (
            <div key={tournament.id} className={`bg-[#13111c] border rounded-xl p-3 hover:scale-[1.02] transition-all ${
              participating ? 'border-purple-500/50' : 'border-purple-900/20 hover:border-purple-500/30'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Icon className="w-4 h-4 text-purple-400" />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                  tournament.entry_fee === 0 ? 'bg-green-500/20 text-green-400' : 'bg-gradient-to-r from-purple-600 to-violet-600 text-white'
                }`}>
                  {tournament.entry_fee === 0 ? 'GRATIS' : badge}
                </span>
              </div>
              <h3 className="text-sm font-bold mb-2 text-white">{tournament.title}</h3>
              <div className="space-y-1.5 text-[10px] mb-3">
                <div className="flex justify-between">
                  <span className="text-gray-400">Premio Total</span>
                  <span className="text-purple-400 font-bold">${tournament.prize_pool.toLocaleString()}</span>
                </div>
                {tournament.entry_fee > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Entrada</span>
                    <span className="font-bold text-white">${tournament.entry_fee}</span>
                  </div>
                )}
                {participating && isActive && participation && (
                  <>
                    <div className="flex justify-between border-t border-purple-900/20 pt-1.5">
                      <span className="text-gray-400">Tu Balance</span>
                      <span className="text-purple-400 font-bold">${participation.participant.balance?.toFixed(2) || 0}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Tu Rank</span>
                      <span className="text-purple-400 font-bold">#{participation.participant.rank || '-'}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-400">Participantes</span>
                  <span className="flex items-center gap-1 text-gray-300">
                    <Users className="w-3 h-3 text-purple-400" />
                    {tournament.participants}/{tournament.max_participants}
                  </span>
                </div>
                {isActive && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Termina en</span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Clock className="w-3 h-3" />{getTimeLeft(tournament.ends_at)}
                    </span>
                  </div>
                )}
                {tournament.status === 'upcoming' && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Comienza en</span>
                    <span className="flex items-center gap-1 text-purple-400">
                      <Calendar className="w-3 h-3" />{getStartsIn(tournament.starts_at)}
                    </span>
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                {participating && isActive && participation && 
                 participation.participant.balance < tournament.initial_balance * 0.2 && 
                 tournament.entry_fee > 0 && (
                  <button
                    onClick={() => handleRebuy(tournament)}
                    disabled={isJoining}
                    className="w-full py-1.5 bg-purple-500/20 border border-purple-500/30 rounded-lg text-[10px] font-bold flex items-center justify-center gap-1 text-purple-400 hover:bg-purple-500/30 transition-all disabled:opacity-50"
                  >
                    {isJoining ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Re-buy ${tournament.entry_fee}
                  </button>
                )}
                <button
                  onClick={() => handleJoinTournament(tournament)}
                  disabled={isJoining}
                  className="w-full py-2 bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:shadow-lg hover:shadow-purple-500/20 transition-all disabled:opacity-50"
                >
                  {isJoining ? (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  ) : participating ? (
                    isActive ? <><Play className="w-3 h-3" /> Entrar a Operar</> : <><Clock className="w-3 h-3" /> Comienza en {getStartsIn(tournament.starts_at)}</>
                  ) : (
                    tournament.entry_fee > 0 ? <><DollarSign className="w-3 h-3" /> Unirse - ${tournament.entry_fee}</> : <><Gift className="w-3 h-3" /> Unirse Gratis</>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredTournaments.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p>No hay torneos disponibles</p>
        </div>
      )}


      {firstActiveTournament && displayLeaderboard.length > 0 && (
        <div className="bg-[#13111c] border border-purple-900/20 rounded-xl p-4">
          <h3 className="text-sm font-bold flex items-center gap-2 mb-3">
            <div className="w-6 h-6 bg-purple-500/20 rounded-lg flex items-center justify-center">
              <Trophy className="w-3.5 h-3.5 text-purple-400" />
            </div>
            Top Traders - {firstActiveTournament.title}
            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
          </h3>
          <div className="space-y-2">
            {displayLeaderboard.slice(0, 5).map((player, index) => (
              <div key={index} className={`flex items-center justify-between p-2.5 rounded-lg border ${
                player.isUser ? 'bg-purple-600/20 border-purple-500/30' : 'bg-[#1a1625] border-purple-900/20'
              }`}>
                <div className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold ${
                    player.rank === 1 ? 'bg-gradient-to-r from-purple-500 to-violet-600' : 
                    player.rank === 2 ? 'bg-purple-500/30' :
                    player.rank === 3 ? 'bg-purple-500/20' : 'bg-[#0d0b14]'
                  }`}>
                    #{player.rank}
                  </div>
                  <span className={`text-[11px] font-bold ${player.isUser ? 'text-purple-400' : 'text-white'}`}>
                    {player.username || `Trader${player.rank}`}
                  </span>
                  {player.isUser && <span className="bg-purple-500 text-white px-1.5 py-0.5 rounded text-[8px] font-bold">TÚ</span>}
                </div>
                <div className="text-right">
                  <div className="text-purple-400 font-bold text-sm">${player.balance?.toFixed(2) || 0}</div>
                  <div className={`text-[9px] ${player.profit >= 0 ? 'text-purple-400' : 'text-red-400'}`}>
                    {player.profit >= 0 ? '+' : ''}{player.profit_percent?.toFixed(1) || 0}%
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState } from 'react';
import { Trophy, Users, Calendar, Star, Clock, Medal, Flame, Crown, Target, ArrowRight, DollarSign, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

interface LeaderboardPlayer {
  rank: number;
  name: string;
  balance: number;
  badge: string;
  color: string;
  isUser?: boolean;
}

interface TournamentsSectionProps {
  onNavigateToTrading?: () => void;
}

const TOURNAMENT_INITIAL_BALANCE = 1000;

const TournamentsSection = ({ onNavigateToTrading }: TournamentsSectionProps) => {
  const [playerTournamentData, setPlayerTournamentData] = useState<{ [key: number]: { balance: number } }>({});
  const [balance, setBalance] = useState(10000.00);

  const tournaments = [
    {
      id: 1,
      title: "Weekly Challenge",
      icon: Trophy,
      badge: "LIVE",
      badgeColor: "from-yellow-500 to-orange-500",
      prizePool: "$5,000",
      participants: 247,
      timeLeft: "2d 14h",
      color: "from-yellow-500 to-orange-600",
      borderColor: "border-yellow-500/30 hover:border-yellow-400/60",
      status: "active",
      entryFee: 0
    },
    {
      id: 2,
      title: "Monthly Masters",
      icon: Medal,
      badge: "PREMIUM",
      badgeColor: "from-blue-500 to-purple-500",
      prizePool: "$25,000",
      entryFee: 50,
      startsIn: "5 days",
      color: "from-blue-500 to-purple-600",
      borderColor: "border-blue-500/30 hover:border-blue-400/60",
      status: "upcoming"
    },
    {
      id: 3,
      title: "Beginner's Cup",
      icon: Star,
      badge: "FREE",
      badgeColor: "from-green-500 to-emerald-500",
      prizePool: "$1,000",
      maxTrades: "≤ 10",
      duration: "7 days",
      color: "from-green-500 to-emerald-600",
      borderColor: "border-green-500/30 hover:border-green-400/60",
      status: "active",
      entryFee: 0
    },
    {
      id: 4,
      title: "Speed Trading",
      icon: Flame,
      badge: "HOT",
      badgeColor: "from-red-500 to-pink-500",
      prizePool: "$8,500",
      participants: 189,
      timeLeft: "12h 30m",
      color: "from-red-500 to-pink-600",
      borderColor: "border-red-500/30 hover:border-red-400/60",
      status: "active",
      entryFee: 25
    },
    {
      id: 5,
      title: "Elite Championship",
      icon: Crown,
      badge: "VIP",
      badgeColor: "from-purple-500 to-indigo-500",
      prizePool: "$50,000",
      entryFee: 200,
      startsIn: "10 days",
      color: "from-purple-500 to-indigo-600",
      borderColor: "border-purple-500/30 hover:border-purple-400/60",
      status: "upcoming"
    },
    {
      id: 6,
      title: "Crypto Warriors",
      icon: Target,
      badge: "NEW",
      badgeColor: "from-cyan-500 to-blue-500",
      prizePool: "$12,000",
      participants: 156,
      timeLeft: "4d 8h",
      color: "from-cyan-500 to-blue-600",
      borderColor: "border-cyan-500/30 hover:border-cyan-400/60",
      status: "active",
      entryFee: 75
    },
    {
      id: 7,
      title: "Night Traders",
      icon: Medal,
      badge: "24H",
      badgeColor: "from-violet-500 to-purple-500",
      prizePool: "$3,500",
      participants: 203,
      timeLeft: "18h 45m",
      color: "from-violet-500 to-purple-600",
      borderColor: "border-violet-500/30 hover:border-violet-400/60",
      status: "active",
      entryFee: 0
    },
    {
      id: 8,
      title: "Forex Masters",
      icon: Trophy,
      badge: "LIVE",
      badgeColor: "from-orange-500 to-red-500",
      prizePool: "$15,000",
      participants: 312,
      timeLeft: "6d 12h",
      color: "from-orange-500 to-red-600",
      borderColor: "border-orange-500/30 hover:border-orange-400/60",
      status: "active",
      entryFee: 100
    },
    {
      id: 9,
      title: "Diamond League",
      icon: Crown,
      badge: "EXCLUSIVE",
      badgeColor: "from-gray-400 to-gray-600",
      prizePool: "$100,000",
      entryFee: 500,
      startsIn: "15 days",
      color: "from-gray-500 to-gray-700",
      borderColor: "border-gray-500/30 hover:border-gray-400/60",
      status: "upcoming"
    }
  ];

  const handleRebuy = (tournament: any) => {
    const rebuyFee = tournament.entryFee;
    if (balance < rebuyFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${rebuyFee} for a re-buy.`,
        variant: "destructive"
      });
      return;
    }

    setBalance(prev => prev - rebuyFee);
    setPlayerTournamentData(prev => ({
      ...prev,
      [tournament.id]: {
        ...prev[tournament.id],
        balance: TOURNAMENT_INITIAL_BALANCE,
      }
    }));

    toast({
      title: "Re-buy Successful!",
      description: `Your tournament balance has been reset to $${TOURNAMENT_INITIAL_BALANCE}.`,
    });
  };

  const handleJoinTournament = (tournament: any) => {
    const isParticipating = !!playerTournamentData[tournament.id];

    if (isParticipating) {
      if (tournament.status === "active") {
        onNavigateToTrading?.();
        toast({
          title: "Entering Tournament!",
          description: `Welcome back to ${tournament.title}. Good luck!`,
        });
      } else {
        toast({
          title: "Tournament Not Started",
          description: `${tournament.title} will be available in ${tournament.startsIn}`,
          variant: "destructive"
        });
      }
      return;
    }

    if (tournament.entryFee > 0 && balance < tournament.entryFee) {
      toast({
        title: "Insufficient Balance",
        description: `You need $${tournament.entryFee} to join this tournament`,
        variant: "destructive"
      });
      return;
    }

    if (tournament.entryFee > 0) {
      setBalance(prev => prev - tournament.entryFee);
    }

    setPlayerTournamentData(prev => ({
      ...prev,
      [tournament.id]: { balance: TOURNAMENT_INITIAL_BALANCE }
    }));
    
    if (tournament.status === "active") {
      toast({
        title: "Tournament Joined!",
        description: `You've joined ${tournament.title} with a starting balance of $${TOURNAMENT_INITIAL_BALANCE}.`,
      });
    } else {
      toast({
        title: "Registration Successful!",
        description: `You're registered for ${tournament.title}. Starts in ${tournament.startsIn}`,
      });
    }
  };

  const weeklyChallengeData = playerTournamentData[1];

  const leaderboardPlayers: LeaderboardPlayer[] = [
      { rank: 1, name: "TradingKing", balance: 1847.50, badge: "🥇", color: "text-yellow-400" },
      { rank: 2, name: "BullRunner", balance: 1732.20, badge: "🥈", color: "text-gray-300" },
      { rank: 3, name: "ProfitMaster", balance: 1698.15, badge: "🥉", color: "text-orange-400" },
      // User is dynamic
      { rank: 5, name: "CryptoWolf", balance: 1187.90, badge: "", color: "text-white" },
  ];
  
  const userPlayer: LeaderboardPlayer = { rank: 4, name: "You", balance: weeklyChallengeData?.balance || 0, isUser: true, badge: "", color: "text-blue-400" };
  leaderboardPlayers.splice(3, 0, userPlayer);

  return (
    <div className="flex-1 p-8 bg-gradient-to-br from-[#131722] to-[#1a1e2e] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <div className="relative inline-block">
            <h1 className="text-5xl font-black text-white mb-4 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-600 bg-clip-text text-transparent">
              Trading Tournaments
            </h1>
            <div className="absolute -top-2 -right-8 animate-bounce">
              <Flame className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          <p className="text-gray-300 text-xl font-medium">Compete with traders worldwide and win amazing prizes</p>
          <div className="mt-4 inline-flex items-center gap-2 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-400/30 px-4 py-2 rounded-full">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-green-400 font-bold">9 Active Tournaments</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {tournaments.map((tournament) => {
            const IconComponent = tournament.icon;
            const tournamentData = playerTournamentData[tournament.id];
            const isParticipating = !!tournamentData;
            const isActive = tournament.status === "active";
            
            return (
              <Card key={tournament.id} className={`bg-gradient-to-br from-[#2C2F42] to-[#23263A] ${tournament.borderColor} transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/20 relative overflow-hidden flex flex-col`}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                <CardHeader className="relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="relative">
                      <IconComponent className="w-10 h-10 text-yellow-400" />
                      {isParticipating && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                        </div>
                      )}
                    </div>
                    <span className={`bg-gradient-to-r ${tournament.badgeColor} text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg`}>
                      {tournament.badge}
                    </span>
                  </div>
                  <CardTitle className="text-white text-xl font-bold">{tournament.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 relative z-10 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-300 font-medium">Prize Pool</span>
                      <span className="text-yellow-400 font-black text-lg">{tournament.prizePool}</span>
                    </div>
                    
                    {tournament.entryFee > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">Entry Fee</span>
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-green-400" />
                          <span className="text-white font-bold">${tournament.entryFee}</span>
                        </div>
                      </div>
                    )}
                    
                    {isParticipating && isActive && tournamentData && (
                       <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600/30">
                        <span className="text-gray-300 font-medium">Tournament Balance</span>
                        <span className="text-blue-400 font-black text-lg">${tournamentData.balance.toFixed(2)}</span>
                      </div>
                    )}
                    
                    {tournament.participants && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">Participants</span>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-400" />
                          <span className="text-white font-bold">{tournament.participants}</span>
                        </div>
                      </div>
                    )}
                    
                    {tournament.timeLeft && isActive && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">Time Left</span>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-red-400" />
                          <span className="text-white font-bold">{tournament.timeLeft}</span>
                        </div>
                      </div>
                    )}
                    
                    {tournament.startsIn && !isActive && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">Starts In</span>
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-green-400" />
                          <span className="text-white font-bold">{tournament.startsIn}</span>
                        </div>
                      </div>
                    )}
                    
                    {tournament.maxTrades && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">Max Trades</span>
                        <span className="text-white font-bold">{tournament.maxTrades}</span>
                      </div>
                    )}
                    
                    {tournament.duration && (
                      <div className="flex items-center justify-between">
                        <span className="text-gray-300 font-medium">Duration</span>
                        <span className="text-white font-bold">{tournament.duration}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col gap-2 mt-4">
                    {isParticipating && isActive && tournamentData && tournamentData.balance < TOURNAMENT_INITIAL_BALANCE && tournament.entryFee > 0 && (
                      <Button
                        onClick={() => handleRebuy(tournament)}
                        className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:shadow-lg transition-all duration-300 text-white font-bold text-base py-2 flex items-center justify-center gap-2"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Re-buy - ${tournament.entryFee}
                      </Button>
                    )}
                    <Button 
                      onClick={() => handleJoinTournament(tournament)}
                      className={`w-full bg-gradient-to-r ${tournament.color} hover:shadow-lg transition-all duration-300 text-white font-bold text-lg py-3 flex items-center justify-center gap-2`}
                    >
                      {isParticipating ? (
                        isActive ? (
                          <>
                            Enter Tournament
                            <ArrowRight className="w-4 h-4" />
                          </>
                        ) : (
                          `Starts in ${tournament.startsIn}`
                        )
                      ) : (
                        tournament.entryFee > 0 ? (
                          <>
                            Join - ${tournament.entryFee}
                            <DollarSign className="w-4 h-4" />
                          </>
                        ) : (
                          'Join Tournament'
                        )
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-3 text-2xl">
              <Trophy className="w-8 h-8 text-yellow-400" />
              Live Leaderboard - Weekly Challenge
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaderboardPlayers.map((player) => (
                <div key={player.rank} className={`flex items-center justify-between p-4 rounded-xl ${player.name === "You" ? "bg-gradient-to-r from-blue-600/30 to-purple-600/30 border border-blue-400/50 shadow-lg" : "bg-gray-700/20 hover:bg-gray-600/30"} transition-all duration-300`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.rank <= 3 ? 'bg-gradient-to-r from-yellow-500 to-orange-600' : 'bg-gray-600'}`}>
                      <span className="text-white text-sm">#{player.rank}</span>
                    </div>
                    <span className="text-2xl">{player.badge}</span>
                    <span className={`font-bold text-lg ${player.color}`}>
                      {player.name}
                    </span>
                    {player.name === "You" && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs font-bold">YOU</span>
                    )}
                  </div>
                  <span className="text-green-400 font-black text-xl">
                    {player.isUser && !weeklyChallengeData ? 'N/A' : `$${player.balance.toFixed(2)}`}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TournamentsSection;

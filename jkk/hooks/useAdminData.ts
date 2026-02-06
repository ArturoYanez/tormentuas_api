
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { User as UserType, Tournament, Transaction } from "@/components/admin/types";
import { TournamentFormValues } from "@/components/admin/TournamentForm";

const usersSample: UserType[] = [
  { id: 1, name: "Juan Perez", email: "juan@mail.com", status: "Active", balance: 1250.50, verified: true, joinDate: "2024-01-15", lastLogin: "2024-06-14", country: "Spain", trades: 234 },
  { id: 2, name: "Maria Lopez", email: "maria@mail.com", status: "Active", balance: 890.25, verified: true, joinDate: "2024-02-20", lastLogin: "2024-06-13", country: "Mexico", trades: 189 },
  { id: 3, name: "Jose Rivera", email: "jose@mail.com", status: "Suspended", balance: 0, verified: false, joinDate: "2024-03-10", lastLogin: "2024-06-10", country: "Argentina", trades: 45 }
];

const tournamentsSample: Tournament[] = [
  { id: 1, name: "Torneo Diario EUR/USD", type: "Daily", status: "Active", participants: 156, prize: 5000, entryFee: 20, startTime: "2024-06-14 10:00", endTime: "2024-06-14 18:00" },
  { id: 2, name: "Torneo Semanal Crypto", type: "Weekly", status: "Upcoming", participants: 89, prize: 15000, entryFee: 50, startTime: "2024-06-17 09:00", endTime: "2024-06-17 21:00" },
  { id: 3, name: "Copa Champions", type: "Special", status: "Finished", participants: 234, prize: 25000, entryFee: 100, startTime: "2024-06-10 10:00", endTime: "2024-06-10 22:00" }
];

const transactionsSample: Transaction[] = [
  { id: 1, user: "Juan Perez", type: "Deposit", amount: 500, status: "Completed", method: "Credit Card", date: "2024-06-14 09:30", fee: 5.00 },
  { id: 2, user: "Jose Rivera", type: "Tournament Fee", amount: 20, status: "Completed", method: "Balance", date: "2024-06-13 15:45", fee: 0 },
  { id: 3, user: "Maria Lopez", type: "Withdrawal", amount: 200, status: "Pending", method: "Bank Transfer", date: "2024-06-11 12:15", fee: 10.00 }
];

export const useAdminData = () => {
  const [users, setUsers] = useState<UserType[]>(usersSample);
  const [tournaments, setTournaments] = useState<Tournament[]>(tournamentsSample);
  const [transactions, setTransactions] = useState<Transaction[]>(transactionsSample);
  const { toast } = useToast();

  const handleUserSubmit = (user: Partial<UserType>) => {
    if (user.id) {
      setUsers(users.map(u => u.id === user.id ? { ...u, ...user } : u));
      toast({ title: "Usuario actualizado", description: `El usuario ${user.name} ha sido actualizado.` });
    } else {
      const newUser = {
        ...user,
        id: Math.max(...users.map(u => u.id)) + 1,
        status: "Active",
        joinDate: new Date().toISOString().split('T')[0],
        lastLogin: new Date().toISOString().split('T')[0],
        country: 'N/A',
        trades: 0,
      } as UserType;
      setUsers([...users, newUser]);
      toast({ title: "Usuario creado", description: `El usuario ${user.name} ha sido creado.` });
    }
  };
  
  const handleSuspendUser = (userId: number) => {
    setUsers(users.map(u => u.id === userId ? { ...u, status: u.status === 'Active' ? 'Suspended' : 'Active' } : u));
    const user = users.find(u => u.id === userId);
    toast({
      title: `Usuario ${user?.status === 'Active' ? 'Suspendido' : 'Activado'}`,
      description: `El estado del usuario ${user?.name} ha cambiado.`,
    });
  };

  const handleTournamentAction = (action: string, tournamentId: number) => {
    if (action === 'Eliminar') {
      setTournaments(tournaments.filter(t => t.id !== tournamentId));
      toast({
        title: `Acción ejecutada`,
        description: `Torneo ${tournamentId} eliminado.`,
        variant: "destructive"
      });
    } else {
      toast({
        title: `Acción ejecutada`,
        description: `${action} aplicado al torneo ${tournamentId}`,
      });
    }
  };

  const handleTournamentCreate = (data: TournamentFormValues) => {
    const newTournamentData: Tournament = {
      id: Math.max(...tournaments.map(t => t.id)) + 1,
      name: data.name,
      type: data.type,
      prize: data.prize,
      entryFee: data.entryFee,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'Upcoming',
      participants: 0,
    };
    
    setTournaments([...tournaments, newTournamentData]);
    
    toast({
      title: "Torneo creado",
      description: `${data.name} ha sido creado exitosamente`,
    });
  };

  return {
    users,
    setUsers,
    tournaments,
    setTournaments,
    transactions,
    setTransactions,
    handleUserSubmit,
    handleSuspendUser,
    handleTournamentAction,
    handleTournamentCreate
  };
};

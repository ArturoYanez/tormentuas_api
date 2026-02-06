
export interface User {
  id: number;
  name: string;
  email: string;
  status: "Active" | "Suspended";
  balance: number;
  verified: boolean;
  joinDate: string;
  lastLogin: string;
  country: string;
  trades: number;
}

export type TournamentStatus = "Active" | "Upcoming" | "Finished";

export interface Tournament {
  id: number;
  name: string;
  type: string;
  status: TournamentStatus;
  participants: number;
  prize: number;
  entryFee: number;
  startTime: string;
  endTime: string;
}

export type TransactionStatus = "Completed" | "Pending" | "Failed";
export type TransactionType = "Deposit" | "Withdrawal" | "Tournament Fee";

export interface Transaction {
  id: number;
  user: string;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  method: string;
  date: string;
  fee: number;
}

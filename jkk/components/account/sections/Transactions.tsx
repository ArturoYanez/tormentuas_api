
import React from 'react';
import { CreditCard, X, Calendar, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface Transaction {
  id: number;
  type: string;
  amount: number;
  currency: string;
  date: string;
  status: string;
  method: string;
}

interface TransactionsProps {
  transactions: Transaction[];
  setActiveSection: (section: string) => void;
}

const Transactions: React.FC<TransactionsProps> = ({ transactions, setActiveSection }) => {
  return (
    <Card className="bg-gradient-to-br from-[#2C2F42] to-[#23263A] border-gray-600/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2 text-2xl">
            <CreditCard className="w-6 h-6 text-green-400" />
            Transaction History
          </CardTitle>
          <Button
            onClick={() => setActiveSection('overview')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-600/50">
                <TableHead className="text-gray-300">Date</TableHead>
                <TableHead className="text-gray-300">Type</TableHead>
                <TableHead className="text-gray-300">Method</TableHead>
                <TableHead className="text-gray-300">Amount</TableHead>
                <TableHead className="text-gray-300">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-gray-600/30 hover:bg-gray-700/20">
                  <TableCell className="text-gray-300">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {transaction.date}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {transaction.type === 'deposit' && <TrendingUp className="w-4 h-4 text-green-400" />}
                      {transaction.type === 'withdrawal' && <TrendingDown className="w-4 h-4 text-red-400" />}
                      {transaction.type === 'trade' && <DollarSign className="w-4 h-4 text-blue-400" />}
                      {transaction.type === 'profit' && <TrendingUp className="w-4 h-4 text-yellow-400" />}
                      <span className="text-white capitalize">{transaction.type}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-gray-300">{transaction.method}</TableCell>
                  <TableCell className={`font-bold ${transaction.amount >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {transaction.amount >= 0 ? '+' : ''}{transaction.amount} {transaction.currency}
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      transaction.status === 'completed' 
                        ? 'bg-green-600/20 text-green-400' 
                        : 'bg-yellow-600/20 text-yellow-400'
                    }`}>
                      {transaction.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default Transactions;


import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle } from "lucide-react";
import { Transaction } from "@/components/admin/types";

interface TransactionsTabProps {
  transactions: Transaction[];
}

export const TransactionsTab: React.FC<TransactionsTabProps> = ({ transactions }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-white">Gestión de Transacciones</h2>
        <div className="flex gap-2">
          <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-colors">
            Exportar
          </Button>
          <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
            Procesar Pendientes
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800">
                <TableHead className="text-gray-400">ID</TableHead>
                <TableHead className="text-gray-400">Usuario</TableHead>
                <TableHead className="text-gray-400">Tipo</TableHead>
                <TableHead className="text-gray-400">Monto</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">Método</TableHead>
                <TableHead className="text-gray-400">Fecha</TableHead>
                <TableHead className="text-gray-400">Comisión</TableHead>
                <TableHead className="text-gray-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id} className="border-gray-800">
                  <TableCell className="text-white font-mono text-xs">{transaction.id}</TableCell>
                  <TableCell className="text-white font-medium">{transaction.user}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      transaction.type === "Deposit" ? "bg-green-600/30 text-green-400 border-green-500/30" :
                      transaction.type === "Withdrawal" ? "bg-orange-600/30 text-orange-400 border-orange-500/30" :
                      "bg-purple-600/30 text-purple-400 border-purple-500/30"
                    }>
                      {transaction.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-mono">€{transaction.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      transaction.status === "Completed" ? "bg-green-600/30 text-green-400 border-green-500/30" :
                      transaction.status === "Pending" ? "bg-yellow-600/30 text-yellow-400 border-yellow-500/30" :
                      "bg-red-600/30 text-red-400 border-red-500/30"
                    }>
                      {transaction.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-gray-400">{transaction.method}</TableCell>
                  <TableCell className="text-gray-400 font-mono text-xs">{transaction.date}</TableCell>
                  <TableCell className="text-white font-mono">€{transaction.fee.toFixed(2)}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700">
                        <Eye className="w-4 h-4" />
                      </Button>
                      {transaction.status === "Pending" && (
                        <Button size="icon" className="h-8 w-8 bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20">
                          <CheckCircle className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

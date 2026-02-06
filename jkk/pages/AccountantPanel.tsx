import React, { useState } from 'react';
import { DollarSign, CheckCircle, XCircle, Clock, User, CreditCard, Search, Filter, TrendingUp, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { Textarea } from "@/components/ui/textarea";

interface WithdrawRequest {
  id: number;
  userId: string;
  userName: string;
  amount: number;
  method: string;
  walletAddress: string;
  status: 'pending' | 'approved' | 'rejected';
  requestDate: string;
  userEmail: string;
  userBalance: number;
}

const AccountantPanel = () => {
  const [withdrawRequests, setWithdrawRequests] = useState<WithdrawRequest[]>([
    {
      id: 1,
      userId: 'USR-001',
      userName: 'Carlos Méndez',
      amount: 500,
      method: 'Bitcoin',
      walletAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
      status: 'pending',
      requestDate: '2025-10-19 14:30',
      userEmail: 'carlos@example.com',
      userBalance: 2500
    },
    {
      id: 2,
      userId: 'USR-002',
      userName: 'María González',
      amount: 1200,
      method: 'Ethereum',
      walletAddress: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      status: 'pending',
      requestDate: '2025-10-19 13:15',
      userEmail: 'maria@example.com',
      userBalance: 5000
    },
    {
      id: 3,
      userId: 'USR-003',
      userName: 'Juan Pérez',
      amount: 750,
      method: 'USDT',
      walletAddress: 'TN3W4H6rK2ce4vX9YnFQHwKENnHjoxb3m9',
      status: 'approved',
      requestDate: '2025-10-18 16:45',
      userEmail: 'juan@example.com',
      userBalance: 3200
    }
  ]);

  const [selectedRequest, setSelectedRequest] = useState<WithdrawRequest | null>(null);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const handleApproveWithdraw = (request: WithdrawRequest) => {
    setWithdrawRequests(withdrawRequests.map(r => 
      r.id === request.id ? { ...r, status: 'approved' } : r
    ));
    
    setIsReviewDialogOpen(false);
    
    toast({
      title: "Retiro Aprobado",
      description: `Retiro de $${request.amount} para ${request.userName} ha sido aprobado.`,
    });
  };

  const handleRejectWithdraw = (request: WithdrawRequest) => {
    if (!rejectionReason.trim()) {
      toast({
        title: "Razón Requerida",
        description: "Por favor ingresa una razón para el rechazo.",
        variant: "destructive"
      });
      return;
    }

    setWithdrawRequests(withdrawRequests.map(r => 
      r.id === request.id ? { ...r, status: 'rejected' } : r
    ));
    
    setIsReviewDialogOpen(false);
    setRejectionReason('');
    
    toast({
      title: "Retiro Rechazado",
      description: `Retiro de ${request.userName} ha sido rechazado.`,
      variant: "destructive"
    });
  };

  const openReviewDialog = (request: WithdrawRequest) => {
    setSelectedRequest(request);
    setIsReviewDialogOpen(true);
  };

  const filteredRequests = withdrawRequests.filter(request => {
    const matchesSearch = request.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.userId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.walletAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    pending: withdrawRequests.filter(r => r.status === 'pending').length,
    approved: withdrawRequests.filter(r => r.status === 'approved').length,
    rejected: withdrawRequests.filter(r => r.status === 'rejected').length,
    totalAmount: withdrawRequests
      .filter(r => r.status === 'pending')
      .reduce((sum, r) => sum + r.amount, 0)
  };

  const getStatusBadge = (status: WithdrawRequest['status']) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>;
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aprobado</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Rechazado</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f0f23] via-[#1a1a2e] to-[#16213e] p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-white mb-2 bg-gradient-to-r from-green-400 via-emerald-500 to-green-600 bg-clip-text text-transparent">
            Panel de Contador
          </h1>
          <p className="text-gray-400 text-lg">Verifica y gestiona solicitudes de retiro</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-900/20 to-yellow-800/20 border-yellow-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Pendientes</p>
                  <p className="text-3xl font-bold text-white">{stats.pending}</p>
                </div>
                <Clock className="w-12 h-12 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/20 to-green-800/20 border-green-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Aprobados</p>
                  <p className="text-3xl font-bold text-white">{stats.approved}</p>
                </div>
                <CheckCircle className="w-12 h-12 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-900/20 to-red-800/20 border-red-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Rechazados</p>
                  <p className="text-3xl font-bold text-white">{stats.rejected}</p>
                </div>
                <XCircle className="w-12 h-12 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/20 to-blue-800/20 border-blue-500/30">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Monto Pendiente</p>
                  <p className="text-3xl font-bold text-white">${stats.totalAmount.toLocaleString()}</p>
                </div>
                <DollarSign className="w-12 h-12 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-gray-900/40 border-gray-700/50 backdrop-blur-md mb-6">
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar por nombre, ID o wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-gray-800 border-gray-700 text-white"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48 bg-gray-800 border-gray-700">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendientes</SelectItem>
                  <SelectItem value="approved">Aprobados</SelectItem>
                  <SelectItem value="rejected">Rechazados</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Withdraw Requests Table */}
        <Card className="bg-gray-900/40 border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-green-400" />
              Solicitudes de Retiro
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Usuario</TableHead>
                  <TableHead className="text-gray-400">Monto</TableHead>
                  <TableHead className="text-gray-400">Método</TableHead>
                  <TableHead className="text-gray-400">Dirección Wallet</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-gray-400">Fecha</TableHead>
                  <TableHead className="text-gray-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{request.userName}</span>
                        <span className="text-gray-400 text-sm">{request.userId}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-green-400 font-bold text-lg">
                      ${request.amount.toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-blue-400" />
                        <span className="text-white">{request.method}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-400 text-sm font-mono max-w-xs truncate">
                      {request.walletAddress}
                    </TableCell>
                    <TableCell>{getStatusBadge(request.status)}</TableCell>
                    <TableCell className="text-gray-400 text-sm">{request.requestDate}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="outline"
                        className="bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20"
                        onClick={() => openReviewDialog(request)}
                      >
                        Revisar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Review Dialog */}
      {selectedRequest && (
        <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-white text-2xl">Revisar Solicitud de Retiro</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              {/* User Info */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <User className="w-5 h-5 text-blue-400" />
                    Información del Usuario
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Nombre:</span>
                    <span className="text-white font-medium">{selectedRequest.userName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">ID Usuario:</span>
                    <span className="text-white font-medium">{selectedRequest.userId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Email:</span>
                    <span className="text-white font-medium">{selectedRequest.userEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Balance Actual:</span>
                    <span className="text-green-400 font-bold">${selectedRequest.userBalance.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Withdraw Details */}
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Detalles del Retiro
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Monto:</span>
                    <span className="text-green-400 font-bold text-xl">${selectedRequest.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Método:</span>
                    <span className="text-white font-medium">{selectedRequest.method}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="text-gray-400">Dirección Wallet:</span>
                    <span className="text-white font-mono text-sm bg-gray-900 p-2 rounded break-all">
                      {selectedRequest.walletAddress}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Fecha de Solicitud:</span>
                    <span className="text-white font-medium">{selectedRequest.requestDate}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Validation Warning */}
              {selectedRequest.amount > selectedRequest.userBalance && (
                <Card className="bg-red-900/20 border-red-500/30">
                  <CardContent className="p-4 flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-red-400 font-bold">Advertencia: Fondos Insuficientes</p>
                      <p className="text-red-300 text-sm">
                        El monto solicitado excede el balance del usuario.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Rejection Reason (shown only when rejecting) */}
              {selectedRequest.status === 'pending' && (
                <div>
                  <label className="text-gray-300 text-sm font-medium mb-2 block">
                    Razón de Rechazo (opcional)
                  </label>
                  <Textarea
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    placeholder="Ingresa la razón del rechazo..."
                    className="bg-gray-800 border-gray-700 text-white"
                    rows={3}
                  />
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              {selectedRequest.status === 'pending' && (
                <>
                  <Button
                    variant="outline"
                    onClick={() => handleRejectWithdraw(selectedRequest)}
                    className="bg-red-500/10 border-red-500/30 hover:bg-red-500/20 text-red-400"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rechazar
                  </Button>
                  <Button
                    onClick={() => handleApproveWithdraw(selectedRequest)}
                    className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprobar Retiro
                  </Button>
                </>
              )}
              {selectedRequest.status !== 'pending' && (
                <Button variant="outline" onClick={() => setIsReviewDialogOpen(false)}>
                  Cerrar
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default AccountantPanel;

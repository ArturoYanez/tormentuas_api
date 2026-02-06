
import React, { useState } from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { CheckCircle, XCircle, Eye, Edit, Ban, Plus, Search } from 'lucide-react';
import { User } from './types';
import { UserForm } from './UserForm';

interface UsersTabProps {
  users: User[];
  handleUserSubmit: (user: Partial<User>) => void;
  handleSuspendUser: (userId: number) => void;
}

export const UsersTab: React.FC<UsersTabProps> = ({ users, handleUserSubmit, handleSuspendUser }) => {
  const [userSearch, setUserSearch] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
      user.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  };

  const handleAdd = () => {
    setSelectedUser(null);
    setIsFormOpen(true);
  };
  
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setIsDetailsOpen(true);
  };

  const onSubmit = (data: Partial<User>) => {
    handleUserSubmit({ ...selectedUser, ...data });
    setIsFormOpen(false);
    setSelectedUser(null);
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Gestión de Usuarios</h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              placeholder="Buscar usuario..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="bg-gray-900/50 border-gray-700 pl-9"
            />
          </div>
          <Button onClick={handleAdd} className="bg-gradient-to-r from-green-600 to-emerald-600 flex-shrink-0">
            <Plus className="w-4 h-4 mr-2" />
            Agregar
          </Button>
        </div>
      </div>

      <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-gray-800 hover:bg-gray-800/50">
                <TableHead className="text-gray-400">ID</TableHead>
                <TableHead className="text-gray-400">Usuario</TableHead>
                <TableHead className="text-gray-400">Estado</TableHead>
                <TableHead className="text-gray-400">Balance</TableHead>
                <TableHead className="text-gray-400">Verificado</TableHead>
                <TableHead className="text-gray-400">Último Login</TableHead>
                <TableHead className="text-gray-400">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="border-gray-800 hover:bg-gray-800/50">
                  <TableCell className="text-white font-mono text-xs">{user.id}</TableCell>
                  <TableCell>
                    <div className="font-medium text-white">{user.name}</div>
                    <div className="text-xs text-gray-400">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className={user.status === 'Active' ? 'bg-green-600/30 text-green-400 border-green-500/30' : 'bg-red-600/30 text-red-400 border-red-500/30'}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white font-mono">€{user.balance.toFixed(2)}</TableCell>
                  <TableCell>
                    {user.verified ? <CheckCircle className="w-5 h-5 text-green-400" /> : <XCircle className="w-5 h-5 text-red-400" />}
                  </TableCell>
                  <TableCell className="text-gray-400 font-mono text-xs">{user.lastLogin}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="icon" variant="outline" className="h-8 w-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700" onClick={() => handleViewDetails(user)}>
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700" onClick={() => handleEdit(user)}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="outline" className="h-8 w-8 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" onClick={() => handleSuspendUser(user.id)}>
                        <Ban className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Dialog for Add/Edit User */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>{selectedUser ? 'Editar Usuario' : 'Crear Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <UserForm user={selectedUser} onSubmit={onSubmit} onFinished={() => setIsFormOpen(false)} />
        </DialogContent>
      </Dialog>
      
      {/* Dialog for User Details */}
       <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-gray-900 border-gray-700 text-white">
          <DialogHeader>
            <DialogTitle>Detalles de Usuario</DialogTitle>
            <DialogDescription>Información completa de {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4 pt-4">
              <div><strong className="text-gray-400">ID:</strong> {selectedUser.id}</div>
              <div><strong className="text-gray-400">Nombre:</strong> {selectedUser.name}</div>
              <div><strong className="text-gray-400">Email:</strong> {selectedUser.email}</div>
              <div><strong className="text-gray-400">País:</strong> {selectedUser.country}</div>
              <div><strong className="text-gray-400">Balance:</strong> €{selectedUser.balance.toFixed(2)}</div>
              <div><strong className="text-gray-400">Fecha de Registro:</strong> {selectedUser.joinDate}</div>
              <div><strong className="text-gray-400">Último Login:</strong> {selectedUser.lastLogin}</div>
              <div><strong className="text-gray-400">Operaciones:</strong> {selectedUser.trades}</div>
            </div>
          )}
           <div className="flex justify-end pt-4">
             <Button onClick={() => setIsDetailsOpen(false)}>Cerrar</Button>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

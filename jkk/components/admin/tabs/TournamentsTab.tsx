
import React from 'react';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Edit, Trash2 } from "lucide-react";
import { Tournament } from "@/components/admin/types";
import { TournamentForm, TournamentFormValues } from "@/components/admin/TournamentForm";

interface TournamentsTabProps {
  tournaments: Tournament[];
  onTournamentCreate: (data: TournamentFormValues) => void;
  onTournamentAction: (action: string, tournamentId: number) => void;
}

export const TournamentsTab: React.FC<TournamentsTabProps> = ({ tournaments, onTournamentCreate, onTournamentAction }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Crear Nuevo Torneo</CardTitle>
          </CardHeader>
          <CardContent>
            <TournamentForm onSubmit={onTournamentCreate} />
          </CardContent>
        </Card>

        <Card className="bg-gray-900/20 border border-gray-700/50 backdrop-blur-md">
          <CardHeader>
            <CardTitle className="text-white">Torneos Existentes</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-800 hover:bg-gray-800/50">
                  <TableHead className="text-gray-400">Nombre</TableHead>
                  <TableHead className="text-gray-400">Estado</TableHead>
                  <TableHead className="text-gray-400">Participantes</TableHead>
                  <TableHead className="text-gray-400">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tournaments.map((tournament) => (
                  <TableRow key={tournament.id} className="border-gray-800 hover:bg-gray-800/50">
                    <TableCell className="text-white font-medium">{tournament.name}</TableCell>
                    <TableCell>
                       <Badge variant="outline" className={
                        tournament.status === "Active" ? "bg-green-600/30 text-green-400 border-green-500/30" :
                        tournament.status === "Upcoming" ? "bg-blue-600/30 text-blue-400 border-blue-500/30" :
                        "bg-gray-600/30 text-gray-400 border-gray-500/30"
                      }>
                        {tournament.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-white">{tournament.participants}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700" onClick={() => onTournamentAction("Ver", tournament.id)}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="icon" variant="outline" className="h-8 w-8 bg-gray-700/50 border-gray-600 hover:bg-gray-700" onClick={() => onTournamentAction("Editar", tournament.id)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                         <Button size="icon" variant="outline" className="h-8 w-8 bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20" onClick={() => onTournamentAction("Eliminar", tournament.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

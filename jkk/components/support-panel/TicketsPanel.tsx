
import React from "react";
import TicketsStats from "./TicketsStats";
import TicketQuickResponse from "./TicketQuickResponse";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";
import { MessageSquare, Plus, User, Zap, CheckCircle, Eye, Crown, Sparkles, Verified, UserCheck } from "lucide-react";

// Types expected as in parent page
interface Ticket {
  id: number;
  user: string;
  email: string;
  subject: string;
  status: string;
  priority: string;
  category: string;
  created: string;
  lastReply: string;
  agent: string;
  messages: number;
}

interface TicketsPanelProps {
  tickets: Ticket[];
  setTickets: React.Dispatch<React.SetStateAction<Ticket[]>>;
  selectedTicket: Ticket | null;
  setSelectedTicket: React.Dispatch<React.SetStateAction<Ticket | null>>;
  ticketSearch: string;
  setTicketSearch: React.Dispatch<React.SetStateAction<string>>;
  newTicketModal: boolean;
  setNewTicketModal: React.Dispatch<React.SetStateAction<boolean>>;
  newTicket: Omit<Ticket, 'id' | 'created' | 'lastReply'>;
  setNewTicket: React.Dispatch<React.SetStateAction<Omit<Ticket, 'id' | 'created' | 'lastReply'>>>;
  newTicketResponse: string;
  setNewTicketResponse: React.Dispatch<React.SetStateAction<string>>;
  handleCreateTicket: () => void;
  handleTicketAction: (action: string, ticketId: number) => void;
  handleSendResponse: () => void;
  toast: any; // Replace 'any' with the actual type of your toast function
}

const TicketsPanel = ({
  tickets, setTickets, selectedTicket, setSelectedTicket,
  ticketSearch, setTicketSearch,
  newTicketModal, setNewTicketModal,
  newTicket, setNewTicket,
  newTicketResponse, setNewTicketResponse,
  handleCreateTicket, handleTicketAction, handleSendResponse, toast
}: TicketsPanelProps) => {
  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.user.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.id.toString().includes(ticketSearch)
  );

  return (
    <>
      <TicketsStats />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Card className="bg-[#131722] border border-[#20232e] shadow-xl hover:shadow-blue-500/10 transition-all duration-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/30 pointer-events-none" />
            <CardHeader className="relative z-10">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
                <CardTitle className="text-white flex items-center gap-3 text-2xl">
                  <Sparkles className="w-7 h-7 text-blue-400 animate-pulse" />
                  Gestión de Tickets Premium
                  <Crown className="w-6 h-6 text-yellow-400 animate-bounce" />
                </CardTitle>
                <div className="flex gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-80 group">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-hover:text-blue-400 transition-colors" />
                    <Input
                      placeholder="🔍 Buscar tickets mágicamente..."
                      value={ticketSearch}
                      onChange={(e) => setTicketSearch(e.target.value)}
                      className="bg-slate-900/60 border-2 border-slate-700/50 pl-12 h-12 rounded-xl focus:border-blue-400/50 focus:ring-2 focus:ring-blue-400/20 transition-all duration-300 group-hover:border-blue-400/30"
                    />
                  </div>
                  <Button className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 flex-shrink-0 h-12 px-6 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 group font-bold" onClick={()=>setNewTicketModal(true)}>
                    <Plus className="w-5 h-5 mr-2 group-hover:animate-spin" />
                    Nuevo
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 relative z-10">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-800/50 bg-slate-900/30">
                      <TableHead className="text-gray-300 font-bold">ID</TableHead>
                      <TableHead className="text-gray-300 font-bold">Usuario</TableHead>
                      <TableHead className="text-gray-300 font-bold">Asunto</TableHead>
                      <TableHead className="text-gray-300 font-bold">Estado</TableHead>
                      <TableHead className="text-gray-300 font-bold">Prioridad</TableHead>
                      <TableHead className="text-gray-300 font-bold">Agente</TableHead>
                      <TableHead className="text-gray-300 font-bold">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTickets.map((ticket, index) => (
                      <TableRow key={ticket.id} className="border-slate-800/30 hover:bg-slate-800/40 transition-all duration-300 group animate-fade-in" style={{animationDelay: `${index * 100}ms`}}>
                        <TableCell className="text-white font-mono text-sm font-bold">
                          <div className="flex items-center gap-2">
                            #{ticket.id}
                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                              <User className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <div className="text-white font-semibold group-hover:text-blue-300 transition-colors">{ticket.user}</div>
                              <div className="text-gray-400 text-xs">{ticket.email}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="max-w-xs">
                            <div className="text-white font-medium truncate group-hover:text-blue-300 transition-colors">{ticket.subject}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <MessageSquare className="w-3 h-3" />
                              <span>{ticket.messages} mensajes</span>
                              <Zap className="w-3 h-3 text-yellow-400 animate-pulse" />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.status === "Open" ? "destructive" : 
                            ticket.status === "In Progress" ? "default" : 
                            "outline"
                          } className={`${
                            ticket.status === "Open" ? "bg-red-600/30 text-red-400 border-red-500/50 animate-pulse" :
                            ticket.status === "In Progress" ? "bg-blue-600/30 text-blue-400 border-blue-500/50 animate-pulse" :
                            "bg-green-600/30 text-green-400 border-green-500/50"
                          } font-bold shadow-lg`}>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${
                            ticket.priority === "High" ? "bg-red-600/30 text-red-400 border-red-500/50 animate-pulse" :
                            ticket.priority === "Medium" ? "bg-yellow-600/30 text-yellow-400 border-yellow-500/50" :
                            "bg-gray-600/30 text-gray-400 border-gray-500/50"
                          } font-bold shadow-lg`}>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <UserCheck className="w-4 h-4 text-green-400" />
                            <span className="text-gray-300 text-sm font-medium">{ticket.agent}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 bg-slate-700/50 border-slate-600 hover:bg-blue-500/20 hover:border-blue-400/50 transition-all duration-300 group/btn" onClick={() => setSelectedTicket(ticket)}>
                              <Eye className="w-4 h-4 group-hover/btn:animate-pulse" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 bg-slate-700/50 border-slate-600 hover:bg-purple-500/20 hover:border-purple-400/50 transition-all duration-300 group/btn" onClick={() => handleTicketAction("Responder", ticket.id)}>
                              <MessageSquare className="w-4 h-4 group-hover/btn:animate-bounce" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 bg-green-500/10 text-green-400 border-green-500/30 hover:bg-green-500/20 hover:scale-110 transition-all duration-300 group/btn" onClick={() => handleTicketAction("Resolver", ticket.id)}>
                              <CheckCircle className="w-4 h-4 group-hover/btn:animate-spin" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>
        <div>
          <TicketQuickResponse
            selectedTicket={selectedTicket}
            newTicketResponse={newTicketResponse}
            setNewTicketResponse={setNewTicketResponse}
            handleSendResponse={handleSendResponse}
            handleTicketAction={handleTicketAction}
          />
        </div>
      </div>
    </>
  );
};
export default TicketsPanel;

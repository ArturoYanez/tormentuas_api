
import React, { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { 
  MessageSquare, Users, Clock, CheckCircle, AlertCircle, Star,
  Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2,
  HeadphonesIcon, Phone, Mail, Video, Settings, Bell, Activity,
  TrendingUp, ArrowUp, ArrowDown, RefreshCw, Plus, Crown, Shield,
  Zap, Target, Award, Heart, Sparkles, UserCheck, Flame
} from "lucide-react";
import LiveChatModal, { Message } from '../support/LiveChatModal';
import EmailFormModal, { EmailFormValues } from '../support/EmailFormModal';
import PhoneSupportModal from '../support/PhoneSupportModal';
import VideoCallModal from '../support/VideoCallModal';

const SupportSection = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("overview");
  const [showLiveChat, setShowLiveChat] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showPhoneDialog, setShowPhoneDialog] = useState(false);
  const [showVideoCall, setShowVideoCall] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [chatMessages, setChatMessages] = useState<Message[]>([
    { 
      id: 1, 
      sender: 'support', 
      message: '¡Hola! Soy Ana del equipo de soporte VIP. ¿En qué puedo ayudarte hoy? 🚀', 
      time: '14:30',
      avatar: '👩‍💼'
    }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [isSupportTyping, setIsSupportTyping] = useState(false);

  // Sample data for admin panel
  const ticketsData = [
    { id: 1001, user: "Juan Pérez", subject: "Error en retiro de fondos", status: "Open", priority: "High", agent: "Ana García", time: "10:30 AM", category: "Retiros" },
    { id: 1002, user: "María López", subject: "Verificación KYC pendiente", status: "In Progress", priority: "Medium", agent: "Carlos Ruiz", time: "09:15 AM", category: "Verificación" },
    { id: 1003, user: "Luis Rivera", subject: "Consulta sobre torneos", status: "Resolved", priority: "Low", agent: "Sofia Mendez", time: "08:45 AM", category: "General" },
    { id: 1004, user: "Ana Torres", subject: "Problema con depósito", status: "Open", priority: "High", agent: "Miguel Santos", time: "11:20 AM", category: "Depósitos" }
  ];

  const agentsData = [
    { id: 1, name: "Ana García", status: "Online", tickets: 12, rating: 4.9, avatar: "👩‍💼" },
    { id: 2, name: "Carlos Ruiz", status: "Busy", tickets: 8, rating: 4.8, avatar: "👨‍💼" },
    { id: 3, name: "Sofia Mendez", status: "Online", tickets: 15, rating: 4.95, avatar: "👩‍🔬" },
    { id: 4, name: "Miguel Santos", status: "Away", tickets: 6, rating: 4.7, avatar: "👨‍🚀" }
  ];

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: chatMessages.length + 1,
        sender: 'user',
        message: newMessage,
        time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
        avatar: '👤'
      };
      setChatMessages([...chatMessages, userMessage]);
      setNewMessage('');
      setIsSupportTyping(true);
      
      setTimeout(() => {
        const responses = [
          'Perfecto, estoy revisando tu cuenta para brindarte la mejor asistencia. Un momento por favor... ✨',
          'Entiendo tu consulta. Permíteme conectarte con nuestro especialista en esta área. 🎯',
          'Excelente pregunta. Te voy a proporcionar toda la información que necesitas. 💡',
          'Gracias por contactarnos. Estoy aquí para resolver tu consulta de manera rápida y eficiente. 🚀'
        ];
        
        const supportResponse: Message = {
          id: chatMessages.length + 2,
          sender: 'support',
          message: responses[Math.floor(Math.random() * responses.length)],
          time: new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
          avatar: '👩‍💼'
        };
        setIsSupportTyping(false);
        setChatMessages(prev => [...prev, supportResponse]);
      }, 2500);
    }
  };

  const onEmailSubmit = (values: EmailFormValues) => {
    console.log('Ticket de soporte creado:', values);
    toast({
        title: "🎉 Ticket Creado Exitosamente",
        description: "Hemos recibido tu solicitud. Te responderemos en menos de 2 horas.",
    });
    setShowEmailForm(false);
  };
  
  const handleCopyPhoneNumber = () => {
    const phoneNumber = "+1 (555) 123-4567";
    navigator.clipboard.writeText(phoneNumber);
    toast({
      title: "📞 ¡Número copiado!",
      description: "El número de teléfono ha sido copiado al portapapeles.",
    });
  };

  const startVideoCall = () => {
    setShowVideoCall(true);
    toast({
      title: "🎥 Conectando videollamada...",
      description: "Te conectaremos con un especialista en unos segundos.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-green-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-xl border border-blue-500/30 backdrop-blur-sm">
                <HeadphonesIcon className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  Panel de Soporte Administrativo
                </h1>
                <p className="text-gray-400 mt-1">Gestión avanzada de soporte al cliente</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10">
                <RefreshCw className="w-4 h-4 mr-2" />
                Actualizar
              </Button>
              <Button variant="outline" className="border-green-500/50 text-green-400 hover:bg-green-500/10">
                <Settings className="w-4 h-4 mr-2" />
                Configurar
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tickets Activos</p>
                  <p className="text-2xl font-bold text-white">23</p>
                  <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                    <ArrowUp className="w-3 h-3" />
                    +12% esta semana
                  </p>
                </div>
                <div className="p-3 bg-blue-600/20 rounded-lg">
                  <MessageSquare className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Agentes Online</p>
                  <p className="text-2xl font-bold text-white">8</p>
                  <p className="text-blue-400 text-xs flex items-center gap-1 mt-1">
                    <Users className="w-3 h-3" />
                    De 12 agentes
                  </p>
                </div>
                <div className="p-3 bg-green-600/20 rounded-lg">
                  <Users className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Tiempo Respuesta</p>
                  <p className="text-2xl font-bold text-white">1.2m</p>
                  <p className="text-green-400 text-xs flex items-center gap-1 mt-1">
                    <ArrowDown className="w-3 h-3" />
                    -30% más rápido
                  </p>
                </div>
                <div className="p-3 bg-yellow-600/20 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm">Satisfacción</p>
                  <p className="text-2xl font-bold text-white">98.5%</p>
                  <p className="text-yellow-400 text-xs flex items-center gap-1 mt-1">
                    <Star className="w-3 h-3 fill-current" />
                    4.9/5 promedio
                  </p>
                </div>
                <div className="p-3 bg-purple-600/20 rounded-lg">
                  <Star className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800/30 mb-6 p-1 rounded-xl border border-gray-700/30">
            <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <Activity className="w-4 h-4 mr-2" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="tickets" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <MessageSquare className="w-4 h-4 mr-2" />
              Tickets
            </TabsTrigger>
            <TabsTrigger value="agents" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <Users className="w-4 h-4 mr-2" />
              Agentes
            </TabsTrigger>
            <TabsTrigger value="support" className="data-[state=active]:bg-blue-600/50 data-[state=active]:text-white">
              <HeadphonesIcon className="w-4 h-4 mr-2" />
              Soporte
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-400" />
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Ticket #1001 resuelto por Ana García</p>
                        <p className="text-gray-400 text-xs">Hace 2 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Nuevo ticket #1005 asignado a Carlos Ruiz</p>
                        <p className="text-gray-400 text-xs">Hace 5 minutos</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                      <div className="flex-1">
                        <p className="text-white text-sm">Chat iniciado con usuario premium</p>
                        <p className="text-gray-400 text-xs">Hace 8 minutos</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Target className="w-5 h-5 text-purple-400" />
                    Métricas de Rendimiento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Resolución Primera Respuesta</span>
                      <span className="text-green-400 font-semibold">85%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tickets Resueltos Hoy</span>
                      <span className="text-blue-400 font-semibold">42</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Tiempo Promedio de Respuesta</span>
                      <span className="text-yellow-400 font-semibold">1.2 min</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-400">Escalaciones</span>
                      <span className="text-red-400 font-semibold">3</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="tickets" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Gestión de Tickets
                  </CardTitle>
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input
                        placeholder="Buscar tickets..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 bg-gray-700/50 border-gray-600"
                      />
                    </div>
                    <Button variant="outline" size="sm" className="border-blue-500/50 text-blue-400">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtrar
                    </Button>
                    <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                      <Plus className="w-4 h-4 mr-2" />
                      Nuevo Ticket
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="border-gray-700">
                      <TableHead className="text-gray-300">ID</TableHead>
                      <TableHead className="text-gray-300">Usuario</TableHead>
                      <TableHead className="text-gray-300">Asunto</TableHead>
                      <TableHead className="text-gray-300">Estado</TableHead>
                      <TableHead className="text-gray-300">Prioridad</TableHead>
                      <TableHead className="text-gray-300">Agente</TableHead>
                      <TableHead className="text-gray-300">Hora</TableHead>
                      <TableHead className="text-gray-300">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ticketsData.map((ticket) => (
                      <TableRow key={ticket.id} className="border-gray-700 hover:bg-gray-700/30">
                        <TableCell className="text-white font-mono">#{ticket.id}</TableCell>
                        <TableCell className="text-white">{ticket.user}</TableCell>
                        <TableCell className="text-gray-300">{ticket.subject}</TableCell>
                        <TableCell>
                          <Badge variant={
                            ticket.status === "Open" ? "destructive" : 
                            ticket.status === "In Progress" ? "default" : 
                            "outline"
                          }>
                            {ticket.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            ticket.priority === "High" ? "border-red-500 text-red-400" :
                            ticket.priority === "Medium" ? "border-yellow-500 text-yellow-400" :
                            "border-gray-500 text-gray-400"
                          }>
                            {ticket.priority}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">{ticket.agent}</TableCell>
                        <TableCell className="text-gray-400">{ticket.time}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button size="sm" variant="outline" className="h-8 w-8 p-0">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="agents" className="space-y-6">
            <Card className="bg-gray-800/50 border-gray-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-green-400" />
                  Agentes de Soporte
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {agentsData.map((agent) => (
                    <Card key={agent.id} className="bg-gray-700/30 border-gray-600/50">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="text-2xl">{agent.avatar}</div>
                          <div className="flex-1">
                            <h3 className="text-white font-semibold">{agent.name}</h3>
                            <div className="flex items-center gap-2">
                              <div className={`w-2 h-2 rounded-full ${
                                agent.status === "Online" ? "bg-green-400" :
                                agent.status === "Busy" ? "bg-yellow-400" :
                                "bg-gray-400"
                              }`}></div>
                              <span className="text-xs text-gray-400">{agent.status}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Tickets:</span>
                            <span className="text-white">{agent.tickets}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-400">Rating:</span>
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-400 fill-current" />
                              <span className="text-white">{agent.rating}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="support" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-blue-600/20 to-blue-800/20 border-blue-500/30 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setShowLiveChat(true)}>
                <CardContent className="p-6 text-center">
                  <MessageSquare className="w-12 h-12 text-blue-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold mb-2">Chat en Vivo</h3>
                  <p className="text-blue-300 text-sm">Soporte instantáneo 24/7</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-600/20 to-green-800/20 border-green-500/30 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={startVideoCall}>
                <CardContent className="p-6 text-center">
                  <Video className="w-12 h-12 text-green-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold mb-2">Videollamada</h3>
                  <p className="text-green-300 text-sm">Asistencia visual premium</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-yellow-600/20 to-yellow-800/20 border-yellow-500/30 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setShowEmailForm(true)}>
                <CardContent className="p-6 text-center">
                  <Mail className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold mb-2">Email</h3>
                  <p className="text-yellow-300 text-sm">Soporte detallado</p>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 border-purple-500/30 hover:scale-105 transition-all duration-300 cursor-pointer" onClick={() => setShowPhoneDialog(true)}>
                <CardContent className="p-6 text-center">
                  <Phone className="w-12 h-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-white font-bold mb-2">Teléfono</h3>
                  <p className="text-purple-300 text-sm">Llamada directa</p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <LiveChatModal
        open={showLiveChat}
        onOpenChange={setShowLiveChat}
        chatMessages={chatMessages}
        isSupportTyping={isSupportTyping}
        newMessage={newMessage}
        setNewMessage={setNewMessage}
        handleSendMessage={handleSendMessage}
      />
      <EmailFormModal
        open={showEmailForm}
        onOpenChange={setShowEmailForm}
        onSubmit={onEmailSubmit}
      />
      <PhoneSupportModal
        open={showPhoneDialog}
        onOpenChange={setShowPhoneDialog}
        onCopyPhoneNumber={handleCopyPhoneNumber}
      />
      <VideoCallModal
        open={showVideoCall}
        onOpenChange={setShowVideoCall}
      />
    </div>
  );
};

export default SupportSection;

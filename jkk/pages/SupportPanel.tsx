import React, { useState } from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  MessageSquare, User, Clock, CheckCircle, XCircle, AlertCircle,
  Search, Plus, Edit, Eye, Mail, Phone, Calendar, 
  FileText, Send, Archive, Star, MoreHorizontal,
  Users, Headphones, Shield, Settings, Activity,
  ArrowUpRight, ArrowDownRight, Filter, Download,
  ChevronDown, ChevronUp, RefreshCw, Bell, Zap,
  Crown, Sparkles, Flame, Heart, TrendingUp,
  UserCheck, Verified, Award, Target, Rocket
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import TicketsPanel from "../components/support-panel/TicketsPanel";
import UsersPanel from "../components/support-panel/UsersPanel";
import FAQPanel from "../components/support-panel/FAQPanel";
import ReportsPanel from "../components/support-panel/ReportsPanel";
import TemplatesPanel from "../components/support-panel/TemplatesPanel";
import SettingsPanel from "../components/support-panel/SettingsPanel";

// Sample support data
const ticketsSample = [
  { 
    id: 1001, 
    user: "Juan Perez", 
    email: "juan@mail.com", 
    subject: "No puedo retirar fondos", 
    status: "Open", 
    priority: "High", 
    category: "Withdrawals",
    created: "2024-06-14 09:30", 
    lastReply: "2024-06-14 11:45",
    agent: "María González",
    messages: 5
  },
  { 
    id: 1002, 
    user: "Ana López", 
    email: "ana@mail.com", 
    subject: "Problema con verificación KYC", 
    status: "In Progress", 
    priority: "Medium", 
    category: "Verification",
    created: "2024-06-13 14:20", 
    lastReply: "2024-06-14 10:15",
    agent: "Carlos Ruiz",
    messages: 3
  },
  { 
    id: 1003, 
    user: "Luis Rivera", 
    email: "luis@mail.com", 
    subject: "Consulta sobre torneos", 
    status: "Resolved", 
    priority: "Low", 
    category: "General",
    created: "2024-06-12 16:45", 
    lastReply: "2024-06-13 09:30",
    agent: "María González",
    messages: 2
  }
];

const faqDataSample = [
  {
    id: 1,
    question: "¿Cómo puedo retirar mis fondos?",
    answer: "Para retirar fondos, vaya a su perfil, seleccione 'Retiro' y siga las instrucciones...",
    category: "Withdrawals",
    views: 1250,
    helpful: 890
  },
  {
    id: 2,
    question: "¿Qué documentos necesito para la verificación?",
    answer: "Necesita un documento de identidad válido y un comprobante de domicilio...",
    category: "Verification", 
    views: 980,
    helpful: 750
  }
];

const templateDataSample = [
  {
    id: 1,
    title: "Bienvenida - Nuevo Usuario",
    content: "¡Bienvenido a Tormentus! Estamos felices de tenerte con nosotros. Si necesitas ayuda, no dudes en escribirnos.",
    description: "Mensaje de bienvenida para nuevos registros"
  },
  {
    id: 2,
    title: "Verificación KYC",
    content: "Por favor, sube tu documento de identidad y comprobante de domicilio para completar el proceso de verificación KYC.",
    description: "Instrucciones para completar verificación"
  },
  {
    id: 3,
    title: "Problema de Retiro",
    content: "Si tienes problemas para retirar, revisa que tu cuenta esté verificada y que cumplas con los requisitos. Si necesitas más ayuda, contáctanos.",
    description: "Solución a problemas comunes de retiro"
  }
];

const SupportPanel = () => {
  const [activeTab, setActiveTab] = useState("tickets");
  const [tickets, setTickets] = useState(ticketsSample);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketSearch, setTicketSearch] = useState("");
  const [newTicketModal, setNewTicketModal] = useState(false);
  const [newTicket, setNewTicket] = useState({
    user: "",
    email: "",
    subject: "",
    status: "Open",
    priority: "Low",
    category: "General",
    agent: "",
    messages: 0
  });
  const [newTicketResponse, setNewTicketResponse] = useState("");
  const [faqData, setFaqData] = useState(faqDataSample);
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [editFaq, setEditFaq] = useState({ question: "", answer: "", category: "General" });
  const [newFAQ, setNewFAQ] = useState({
    question: "",
    answer: "",
    category: "General"
  });
  const [templateData, setTemplateData] = useState(templateDataSample);
  const [selectedTemplateId, setSelectedTemplateId] = useState<number | null>(null);
  const [editTemplate, setEditTemplate] = useState({ id: 0, title: "", content: "", description: "" });
  const [editingTemplate, setEditingTemplate] = useState(false);
  const [showCreateTemplate, setShowCreateTemplate] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ title:"", content:"", description:"" });
  const { toast } = useToast();

  // CREAR NUEVO TICKET
  const handleCreateTicket = () => {
    if (!newTicket.user.trim() || !newTicket.email.trim() || !newTicket.subject.trim()) {
      toast({
        title: "Por favor completa todos los campos obligatorios",
        variant: "destructive"
      });
      return;
    }
    setTickets([
      {
        id: Math.max(...tickets.map(t => t.id), 1000) + 1,
        created: new Date().toISOString().slice(0, 16).replace("T", " "),
        lastReply: new Date().toISOString().slice(0, 16).replace("T", " "),
        ...newTicket,
      },
      ...tickets
    ]);
    setNewTicketModal(false);
    setNewTicket({
      user: "",
      email: "",
      subject: "",
      status: "Open",
      priority: "Low",
      category: "General",
      agent: "",
      messages: 0
    });
    toast({
      title: "🎫 Ticket creado",
      description: "El ticket se creó exitosamente",
    });
  };

  // FAQ: Editar y guardar
  const handleEditFaq = (faq) => {
    setEditingFaqId(faq.id);
    setEditFaq({ question: faq.question, answer: faq.answer, category: faq.category });
  };
  const handleSaveFaq = (id) => {
    setFaqData(faqData.map(faq => 
      faq.id === id
        ? { ...faq, ...editFaq }
        : faq
    ));
    setEditingFaqId(null);
    toast({ title: "✅ FAQ editada" });
  };
  const handleDeleteFaq = (id) => {
    setFaqData(faqData.filter(faq => faq.id !== id));
    toast({ title: "🗑️ FAQ eliminada" });
  };
  const handleAddFaq = () => {
    if (!newFAQ.question.trim() || !newFAQ.answer.trim()) {
      toast({ title: "Completa todos los campos", variant:"destructive" });
      return;
    }
    setFaqData([
      ...faqData,
      {
        ...newFAQ,
        id: Math.max(...faqData.map(f => f.id), 0) + 1,
        views: 0,
        helpful: 0
      }
    ]);
    setNewFAQ({ question: "", answer: "", category: "General" });
    toast({ title: "FAQ creada" });
  };

  // Plantillas: Selección, edición y creación
  const handleSelectTemplate = (id: number) => {
    setSelectedTemplateId(id);
    setEditingTemplate(false);
    const t = templateData.find(t => t.id === id);
    setEditTemplate(t ?? { id: 0, title: "", content: "", description: "" });
  };
  const handleEditTemplate = () => setEditingTemplate(true);
  const handleTemplateChange = (field, value) => setEditTemplate(et => ({ ...et, [field]: value }));
  const handleSaveTemplate = () => {
    setTemplateData(templateData.map(t => t.id === editTemplate.id ? editTemplate : t));
    setEditingTemplate(false);
    toast({ title: "Plantilla editada" });
  };
  const handleDeleteTemplate = (id: number) => {
    setTemplateData(templateData.filter(t => t.id !== id));
    setSelectedTemplateId(null);
    setEditingTemplate(false);
    toast({ title: "Plantilla eliminada" });
  };
  const handleCreateTemplate = () => {
    if (!newTemplate.title.trim() || !newTemplate.content.trim()) {
      toast({ title: "Completa todos los campos", variant: "destructive" });
      return;
    }
    setTemplateData([
      ...templateData,
      { ...newTemplate, id: Math.max(...templateData.map(x=>x.id), 0)+1 }
    ]);
    setShowCreateTemplate(false);
    setNewTemplate({ title:"", content:"", description:"" });
    toast({ title: "Plantilla creada" });
  };

  const handleTicketAction = (action: string, ticketId: number) => {
    toast({
      title: `🎯 Acción ejecutada`,
      description: `${action} aplicado al ticket ${ticketId} exitosamente`,
    });
  };

  const handleSendResponse = () => {
    if (!newTicketResponse.trim()) {
      toast({
        title: "⚠️ Error",
        description: "Por favor ingrese una respuesta",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "🚀 Respuesta enviada",
      description: "La respuesta ha sido enviada al usuario con éxito",
    });
    
    setNewTicketResponse("");
  };

  const filteredTickets = tickets.filter(
    (ticket) =>
      ticket.user.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(ticketSearch.toLowerCase()) ||
      ticket.id.toString().includes(ticketSearch)
  );

  return (
    <div className="min-h-screen w-full bg-black p-4 sm:p-6 lg:p-8 text-white relative overflow-hidden">
      {/* Fondo animado oscurecido */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-[#171822] to-[#181a20] opacity-95"></div>
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-blue-800/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-purple-900/25 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/3 w-80 h-80 bg-cyan-900/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-900/10 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>
      
      <div className="relative z-10">
        {/* Header más oscuro */}
        <header className="mb-8 relative">
          <div className="absolute inset-0 bg-gradient-to-r from-[#171822]/75 via-[#232335]/70 to-black/70 rounded-3xl blur-xl"></div>
          <div className="relative bg-gradient-to-r from-[#171822]/90 via-[#181a20]/90 to-[#12131a]/90 backdrop-blur-xl border border-[#232335] rounded-3xl p-8 shadow-2xl">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-6">
                <div className="relative p-6 bg-gradient-to-br from-blue-600/30 to-cyan-600/30 rounded-2xl border-2 border-blue-400/50 backdrop-blur-sm shadow-2xl group hover:scale-110 transition-all duration-500">
                  <Headphones className="w-12 h-12 text-blue-400 group-hover:animate-bounce" />
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-green-400/50">
                    <Crown className="w-3 h-3 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="font-black text-5xl md:text-6xl bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent animate-fade-in">
                    Centro de Soporte Premium
                  </h1>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                      <span className="text-green-400 font-bold">Sistema activo</span>
                    </div>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-blue-400 animate-pulse" />
                      <span className="text-blue-400 font-semibold">Atención VIP 24/7</span>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 100}ms`}} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="border-blue-500/50 text-blue-400 hover:bg-blue-500/10 hover:text-blue-300 transition-all duration-300 backdrop-blur-sm group">
                  <RefreshCw className="w-4 h-4 mr-2 group-hover:animate-spin" />
                  Actualizar
                </Button>
                <Button variant="outline" className="border-purple-500/50 text-purple-400 hover:bg-purple-500/10 hover:text-purple-300 transition-all duration-300" onClick={() => window.location.href='/platform'}>
                  <Rocket className="w-4 h-4 mr-2" />
                  Volver a la plataforma
                </Button>
              </div>
            </div>
          </div>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-6 bg-[#16181f]/90 mb-8 p-2 rounded-2xl border border-[#20232e] shadow-2xl">
            <TabsTrigger value="tickets" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-cyan-600/50 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl relative group">
              <MessageSquare className="w-4 h-4 group-hover:animate-bounce" />
              Tickets
              <Badge className="ml-1 bg-red-500/20 text-red-400 border-red-500/30 text-xs animate-pulse">23</Badge>
            </TabsTrigger>
            <TabsTrigger value="users" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-cyan-600/50 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl group">
              <Users className="w-4 h-4 group-hover:animate-pulse" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="faq" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-cyan-600/50 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl group">
              <FileText className="w-4 h-4 group-hover:animate-bounce" />
              FAQ
            </TabsTrigger>
            <TabsTrigger value="reports" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-cyan-600/50 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl group">
              <Activity className="w-4 h-4 group-hover:animate-pulse" />
              Reportes
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-cyan-600/50 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl group">
              <Mail className="w-4 h-4 group-hover:animate-bounce" />
              Plantillas
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600/50 data-[state=active]:to-cyan-600/50 data-[state=active]:text-white text-gray-400 transition-all duration-300 rounded-xl group">
              <Settings className="w-4 h-4 group-hover:animate-spin" />
              Configuración
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Tickets Tab */}
          <TabsContent value="tickets" className="space-y-8 animate-fade-in">
            <TicketsPanel
              tickets={tickets}
              setTickets={setTickets}
              selectedTicket={selectedTicket}
              setSelectedTicket={setSelectedTicket}
              ticketSearch={ticketSearch}
              setTicketSearch={setTicketSearch}
              newTicketModal={newTicketModal}
              setNewTicketModal={setNewTicketModal}
              newTicket={newTicket}
              setNewTicket={setNewTicket}
              newTicketResponse={newTicketResponse}
              setNewTicketResponse={setNewTicketResponse}
              handleCreateTicket={handleCreateTicket}
              handleTicketAction={handleTicketAction}
              handleSendResponse={handleSendResponse}
              toast={toast}
            />
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6 animate-fade-in">
            <UsersPanel />
          </TabsContent>

          {/* FAQ Tab */}
          <TabsContent value="faq" className="space-y-6 animate-fade-in">
            <FAQPanel
              faqData={faqData}
              setFaqData={setFaqData}
              editingFaqId={editingFaqId}
              setEditingFaqId={setEditingFaqId}
              editFaq={editFaq}
              setEditFaq={setEditFaq}
              newFAQ={newFAQ}
              setNewFAQ={setNewFAQ}
              handleSaveFaq={handleSaveFaq}
              handleDeleteFaq={handleDeleteFaq}
              handleAddFaq={handleAddFaq}
              toast={toast}
            />
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6 animate-fade-in">
            <ReportsPanel />
          </TabsContent>

          {/* Templates Tab */}
          <TabsContent value="templates" className="space-y-6 animate-fade-in">
            <TemplatesPanel
              templateData={templateData}
              setTemplateData={setTemplateData}
              selectedTemplateId={selectedTemplateId}
              setSelectedTemplateId={setSelectedTemplateId}
              editTemplate={editTemplate}
              setEditTemplate={setEditTemplate}
              editingTemplate={editingTemplate}
              setEditingTemplate={setEditingTemplate}
              showCreateTemplate={showCreateTemplate}
              setShowCreateTemplate={setShowCreateTemplate}
              newTemplate={newTemplate}
              setNewTemplate={setNewTemplate}
              handleEditTemplate={handleEditTemplate}
              handleTemplateChange={handleTemplateChange}
              handleSaveTemplate={handleSaveTemplate}
              handleDeleteTemplate={handleDeleteTemplate}
              handleCreateTemplate={handleCreateTemplate}
              toast={toast}
            />
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6 animate-fade-in">
            <SettingsPanel />
          </TabsContent>
        </Tabs>

        {/* POPUP/MODAL NUEVO TICKET */}
        {newTicketModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 animate-fade-in">
            <div className="bg-[#181a20] rounded-2xl shadow-2xl p-8 w-[96vw] max-w-md border border-[#232335]">
              <h3 className="text-white font-bold text-2xl mb-4">Crear Ticket</h3>
              <div className="space-y-3">
                <Input placeholder="Nombre de usuario" value={newTicket.user} onChange={e=>setNewTicket({...newTicket,user:e.target.value})} />
                <Input placeholder="Email" value={newTicket.email} onChange={e=>setNewTicket({...newTicket,email:e.target.value})} />
                <Input placeholder="Asunto" value={newTicket.subject} onChange={e=>setNewTicket({...newTicket,subject:e.target.value})} />
                <Select value={newTicket.status} onValueChange={v=>setNewTicket({...newTicket,status:v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Estado" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Abierto</SelectItem>
                    <SelectItem value="In Progress">En Progreso</SelectItem>
                    <SelectItem value="Resolved">Resuelto</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTicket.priority} onValueChange={v=>setNewTicket({...newTicket, priority: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Prioridad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">Alta</SelectItem>
                    <SelectItem value="Medium">Media</SelectItem>
                    <SelectItem value="Low">Baja</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={newTicket.category} onValueChange={v=>setNewTicket({...newTicket, category: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="General">General</SelectItem>
                    <SelectItem value="Withdrawals">Retiros</SelectItem>
                    <SelectItem value="Verification">Verificación</SelectItem>
                    <SelectItem value="Trading">Trading</SelectItem>
                    <SelectItem value="Tournaments">Torneos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 mt-4">
                <Button onClick={handleCreateTicket} className="flex-1">Crear</Button>
                <Button variant="outline" onClick={()=>setNewTicketModal(false)}>Cancelar</Button>
              </div>
            </div>
          </div>
        )}

        {/* Botón flotante "Nuevo ticket" en tab tickets*/}
        {activeTab === "tickets" && (
          <Button
            className="fixed bottom-8 right-8 z-50 bg-gradient-to-r from-blue-600 to-cyan-600 text-white ring-2 ring-cyan-400 hover:scale-110 shadow-2xl"
            onClick={()=>setNewTicketModal(true)}
            style={{animation:"fade-in 0.3s"}}
          >
            <Plus className="w-5 h-5 mr-2" /> Nuevo
          </Button>
        )}
      </div>
    </div>
  );
};

export default SupportPanel;

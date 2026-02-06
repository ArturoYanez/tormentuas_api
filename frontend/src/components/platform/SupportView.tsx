import { useState, useEffect, useRef } from 'react';
import { 
  MessageCircle, Video, Mail, Clock, Users, ThumbsUp, 
  HelpCircle, Send, Headphones, FileText, Shield, Zap,
  ChevronDown, ExternalLink, CheckCircle, Loader2, ArrowLeft, X
} from 'lucide-react';
import { supportAPI } from '../../lib/api';

interface Ticket {
  id: number;
  subject: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  created_at: string;
}

interface TicketMessage {
  id: number;
  message: string;
  is_agent: boolean;
  created_at: string;
}

interface ChatMessage {
  id: string;
  message: string;
  is_agent: boolean;
  created_at: string;
}

interface ChatSession {
  id: string;
  status: string;
  messages: ChatMessage[];
}

interface Stats {
  total_tickets: number;
  open_tickets: number;
  closed_tickets: number;
  avg_response_minutes: number;
}

export default function SupportView() {
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [chatMessage, setChatMessage] = useState('');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [ticketForm, setTicketForm] = useState({ subject: '', description: '', category: 'general', priority: 'medium' });
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [ticketMessages, setTicketMessages] = useState<TicketMessage[]>([]);
  const [stats, setStats] = useState<Stats>({ total_tickets: 0, open_tickets: 0, closed_tickets: 0, avg_response_minutes: 15 });
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // Live Chat state
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [liveChatMessages, setLiveChatMessages] = useState<ChatMessage[]>([]);
  const [liveChatLoading, setLiveChatLoading] = useState(false);
  const [sendingMessage, setSendingMessage] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadStats();
    loadTickets();
  }, []);

  const loadStats = async () => {
    try {
      const res = await supportAPI.getStats();
      setStats(res.data.stats || { total_tickets: 0, open_tickets: 0, closed_tickets: 0, avg_response_minutes: 15 });
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const loadTickets = async () => {
    try {
      const res = await supportAPI.getTickets();
      setTickets(res.data.tickets || []);
    } catch (err) {
      console.error('Error loading tickets:', err);
    }
  };

  const loadTicketDetail = async (ticketId: number) => {
    setLoading(true);
    try {
      const res = await supportAPI.getTicket(ticketId);
      setSelectedTicket(res.data.ticket);
      setTicketMessages(res.data.messages || []);
    } catch (err) {
      console.error('Error loading ticket:', err);
    } finally {
      setLoading(false);
    }
  };

  const submitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description) return;
    setSubmitting(true);
    try {
      await supportAPI.createTicket(ticketForm);
      setTicketForm({ subject: '', description: '', category: 'general', priority: 'medium' });
      setSelectedChannel(null);
      loadTickets();
      loadStats();
    } catch (err) {
      console.error('Error creating ticket:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const sendMessage = async () => {
    if (!chatMessage.trim() || !selectedTicket) return;
    try {
      await supportAPI.addMessage(selectedTicket.id, chatMessage);
      setChatMessage('');
      loadTicketDetail(selectedTicket.id);
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const closeTicket = async (ticketId: number) => {
    try {
      await supportAPI.closeTicket(ticketId);
      loadTickets();
      loadStats();
      setSelectedTicket(null);
      setSelectedChannel(null);
    } catch (err) {
      console.error('Error closing ticket:', err);
    }
  };

  // Live Chat functions
  const startLiveChat = async () => {
    setLiveChatLoading(true);
    try {
      const res = await supportAPI.startChat();
      setChatSession(res.data.session);
      setLiveChatMessages(res.data.session.messages || []);
    } catch (err) {
      console.error('Error starting chat:', err);
    } finally {
      setLiveChatLoading(false);
    }
  };

  const sendLiveChatMessage = async () => {
    if (!chatMessage.trim() || !chatSession || sendingMessage) return;
    setSendingMessage(true);
    try {
      const res = await supportAPI.sendChatMessage(chatSession.id, chatMessage);
      setChatMessage('');
      setLiveChatMessages(res.data.session.messages || []);
      // Poll for agent response after 3 seconds
      setTimeout(async () => {
        try {
          const historyRes = await supportAPI.getChatHistory(chatSession.id);
          setLiveChatMessages(historyRes.data.messages || []);
        } catch (e) {
          console.error('Error polling messages:', e);
        }
      }, 3000);
    } catch (err) {
      console.error('Error sending message:', err);
    } finally {
      setSendingMessage(false);
    }
  };

  const endLiveChat = async () => {
    if (!chatSession) return;
    try {
      await supportAPI.endChat(chatSession.id);
      setChatSession(null);
      setLiveChatMessages([]);
      setSelectedChannel(null);
    } catch (err) {
      console.error('Error ending chat:', err);
    }
  };

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [liveChatMessages]);

  const supportChannels = [
    { id: 'chat', icon: MessageCircle, title: 'Chat en Vivo', description: 'Soporte 24/7', responseTime: '< 1 min' },
    { id: 'video', icon: Video, title: 'Videollamada', description: 'Asistencia premium', responseTime: 'Programar' },
    { id: 'ticket', icon: FileText, title: 'Crear Ticket', description: 'Soporte detallado', responseTime: '< 24h' },
    { id: 'mytickets', icon: Mail, title: 'Mis Tickets', description: `${stats.open_tickets} abiertos`, responseTime: 'Ver historial' }
  ];

  const faqs = [
    { question: '¿Cómo verifico mi cuenta?', answer: 'Ve a tu perfil y sube tu documento de identidad.', category: 'Cuenta' },
    { question: '¿Cuánto tarda un retiro?', answer: 'Los retiros se procesan en 1-24 horas.', category: 'Finanzas' },
    { question: '¿Cómo funciona el trading?', answer: 'Selecciona activo, dirección, monto y duración.', category: 'Trading' },
    { question: '¿Qué métodos de depósito aceptan?', answer: 'Aceptamos 15+ criptomonedas. Mínimo $10.', category: 'Finanzas' }
  ];

  const getPriorityColor = (p: string) => p === 'high' ? 'text-red-400 bg-red-500/20' : p === 'medium' ? 'text-yellow-400 bg-yellow-500/20' : 'text-green-400 bg-green-500/20';
  const getStatusColor = (s: string) => s === 'open' ? 'text-blue-400 bg-blue-500/20' : 'text-green-400 bg-green-500/20';

  return (
    <div className="h-full bg-[#0d0b14] overflow-y-auto custom-scrollbar">
      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gradient-to-br from-purple-600 to-violet-600 rounded-2xl mb-3">
            <Headphones className="w-7 h-7" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-violet-400 bg-clip-text text-transparent">Centro de Soporte</h1>
        </div>

        <div className="grid grid-cols-4 gap-3 mb-6">
          {[
            { icon: Clock, label: 'Respuesta', value: `< ${stats.avg_response_minutes}m` },
            { icon: Users, label: 'Agentes', value: '12' },
            { icon: ThumbsUp, label: 'Satisfacción', value: '98%' },
            { icon: Zap, label: 'Mis tickets', value: stats.total_tickets.toString() }
          ].map((s, i) => (
            <div key={i} className="bg-[#13111c] rounded-lg p-3 border border-purple-900/20 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-1 text-purple-400" />
              <div className="text-lg font-bold text-purple-400">{s.value}</div>
              <div className="text-[9px] text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {!selectedChannel && (
          <>
            <div className="mb-6">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><Shield className="w-4 h-4 text-purple-400" />Canales</h2>
              <div className="grid grid-cols-2 gap-3">
                {supportChannels.map(ch => (
                  <button key={ch.id} onClick={() => setSelectedChannel(ch.id)} className="bg-[#13111c] rounded-lg p-3 text-left border border-purple-900/20 hover:border-purple-500/30">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-purple-500/20"><ch.icon className="w-4 h-4 text-purple-400" /></div>
                      <div>
                        <h3 className="font-medium text-[11px]">{ch.title}</h3>
                        <p className="text-[10px] text-gray-500">{ch.description}</p>
                        <div className="text-[9px] text-purple-400">⏱ {ch.responseTime}</div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            <div>
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2"><HelpCircle className="w-4 h-4 text-purple-400" />FAQ</h2>
              <div className="space-y-2">
                {faqs.map((f, i) => (
                  <div key={i} className="bg-[#13111c] rounded-lg border border-purple-900/20">
                    <button onClick={() => setExpandedFaq(expandedFaq === i ? null : i)} className="w-full p-3 flex justify-between items-center text-left">
                      <span className="text-[11px]">{f.question}</span>
                      <ChevronDown className={`w-4 h-4 ${expandedFaq === i ? 'rotate-180' : ''}`} />
                    </button>
                    {expandedFaq === i && <div className="px-3 pb-3 text-[10px] text-gray-400">{f.answer}</div>}
                  </div>
                ))}
              </div>
            </div>
            <div className="mt-6 bg-[#13111c] rounded-lg border border-purple-900/20 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Mail className="w-8 h-8 text-purple-400" />
                <div><div className="text-[11px]">support@tormentus.com</div></div>
              </div>
              <button className="px-3 py-1.5 bg-[#1a1625] rounded text-[10px] flex items-center gap-1">Contactar <ExternalLink className="w-3 h-3" /></button>
            </div>
          </>
        )}

        {selectedChannel === 'mytickets' && !selectedTicket && (
          <div className="bg-[#13111c] rounded-lg border border-purple-900/20 mb-6">
            <div className="p-3 border-b border-purple-900/20 flex items-center gap-2 bg-[#1a1625]">
              <button onClick={() => setSelectedChannel(null)} className="p-1 hover:bg-[#0d0b14] rounded"><ArrowLeft className="w-4 h-4" /></button>
              <span className="text-[11px] font-medium">Mis Tickets ({tickets.length})</span>
            </div>
            <div className="max-h-80 overflow-y-auto">
              {tickets.length === 0 ? <div className="p-8 text-center text-gray-500 text-sm">No tienes tickets</div> : tickets.map(t => (
                <div key={t.id} onClick={() => loadTicketDetail(t.id)} className="p-3 border-b border-purple-900/10 hover:bg-[#1a1625] cursor-pointer">
                  <div className="flex justify-between mb-1">
                    <span className="text-[11px] font-medium">{t.subject}</span>
                    <span className={`px-2 py-0.5 rounded text-[9px] ${getStatusColor(t.status)}`}>{t.status}</span>
                  </div>
                  <div className="flex gap-2 text-[9px] text-gray-500">
                    <span className={`px-1.5 py-0.5 rounded ${getPriorityColor(t.priority)}`}>{t.priority}</span>
                    <span>{new Date(t.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedTicket && (
          <div className="bg-[#13111c] rounded-lg border border-purple-900/20 mb-6">
            <div className="p-3 border-b border-purple-900/20 flex justify-between items-center bg-[#1a1625]">
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedTicket(null); setSelectedChannel('mytickets'); }} className="p-1 hover:bg-[#0d0b14] rounded"><ArrowLeft className="w-4 h-4" /></button>
                <div><div className="text-[11px] font-medium">{selectedTicket.subject}</div><div className="text-[9px] text-gray-500">#{selectedTicket.id}</div></div>
              </div>
              {selectedTicket.status === 'open' && <button onClick={() => closeTicket(selectedTicket.id)} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[9px]">Cerrar</button>}
            </div>
            {loading ? <div className="p-8 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-purple-400" /></div> : (
              <>
                <div className="h-52 p-3 overflow-y-auto space-y-2">
                  <div className="bg-[#1a1625] p-2 rounded text-[10px] text-gray-400">{selectedTicket.description}</div>
                  {ticketMessages.map(m => (
                    <div key={m.id} className={`flex ${m.is_agent ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg text-[11px] ${m.is_agent ? 'bg-[#1a1625]' : 'bg-purple-600'}`}>
                        <p>{m.message}</p>
                        <span className="text-[8px] opacity-60">{new Date(m.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {selectedTicket.status === 'open' && (
                  <div className="p-3 border-t border-purple-900/20 bg-[#1a1625] flex gap-2">
                    <input type="text" value={chatMessage} onChange={(e) => setChatMessage(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && sendMessage()} placeholder="Mensaje..." className="flex-1 bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-[11px]" />
                    <button onClick={sendMessage} className="px-4 py-2 bg-purple-600 rounded-lg"><Send className="w-4 h-4" /></button>
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {selectedChannel === 'ticket' && (
          <div className="bg-[#13111c] rounded-lg border border-purple-900/20 mb-6">
            <div className="p-3 border-b border-purple-900/20 flex items-center gap-2 bg-[#1a1625]">
              <button onClick={() => setSelectedChannel(null)} className="p-1 hover:bg-[#0d0b14] rounded"><ArrowLeft className="w-4 h-4" /></button>
              <span className="text-[11px] font-medium">Crear Ticket</span>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Categoría</label>
                <select value={ticketForm.category} onChange={(e) => setTicketForm(p => ({ ...p, category: e.target.value }))} className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-[11px]">
                  <option value="general">General</option><option value="account">Cuenta</option><option value="trading">Trading</option><option value="deposits">Depósitos</option><option value="withdrawals">Retiros</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Asunto</label>
                <input type="text" value={ticketForm.subject} onChange={(e) => setTicketForm(p => ({ ...p, subject: e.target.value }))} placeholder="Describe tu problema" className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-[11px]" />
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Prioridad</label>
                <div className="flex gap-2">
                  {['low', 'medium', 'high'].map(p => (
                    <button key={p} onClick={() => setTicketForm(prev => ({ ...prev, priority: p }))} className={`px-3 py-1.5 rounded-lg text-[10px] ${ticketForm.priority === p ? getPriorityColor(p) : 'bg-[#1a1625] text-gray-400'}`}>{p === 'low' ? 'Baja' : p === 'medium' ? 'Media' : 'Alta'}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-500 mb-1 block">Descripción</label>
                <textarea value={ticketForm.description} onChange={(e) => setTicketForm(p => ({ ...p, description: e.target.value }))} placeholder="Detalla tu problema..." rows={4} className="w-full bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-[11px] resize-none" />
              </div>
              <button onClick={submitTicket} disabled={submitting || !ticketForm.subject || !ticketForm.description} className="w-full py-2 bg-purple-600 rounded-lg text-[11px] font-medium flex items-center justify-center gap-2 disabled:opacity-50">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}{submitting ? 'Enviando...' : 'Enviar Ticket'}
              </button>
            </div>
          </div>
        )}

        {selectedChannel === 'chat' && (
          <div className="bg-[#13111c] rounded-lg border border-purple-900/20 mb-6">
            <div className="p-3 border-b border-purple-900/20 flex justify-between items-center bg-[#1a1625]">
              <div className="flex items-center gap-2">
                <button onClick={() => { setSelectedChannel(null); setChatSession(null); setLiveChatMessages([]); }} className="p-1 hover:bg-[#0d0b14] rounded"><ArrowLeft className="w-4 h-4" /></button>
                <MessageCircle className="w-4 h-4 text-purple-400" />
                <span className="text-[11px] font-medium">Chat en Vivo</span>
                {chatSession && (
                  <span className={`px-2 py-0.5 rounded text-[9px] ${chatSession.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                    {chatSession.status === 'active' ? 'Conectado' : 'En espera'}
                  </span>
                )}
              </div>
              {chatSession && (
                <button onClick={endLiveChat} className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-[9px] flex items-center gap-1">
                  <X className="w-3 h-3" /> Terminar
                </button>
              )}
            </div>
            
            {!chatSession ? (
              <div className="p-8 text-center">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-500/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="w-8 h-8 text-purple-400" />
                </div>
                <h3 className="text-sm font-medium mb-2">Iniciar Chat en Vivo</h3>
                <p className="text-[11px] text-gray-500 mb-4">Conecta con un agente de soporte en tiempo real</p>
                <button onClick={startLiveChat} disabled={liveChatLoading} className="px-6 py-2 bg-purple-600 rounded-lg text-[11px] font-medium flex items-center justify-center gap-2 mx-auto disabled:opacity-50">
                  {liveChatLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <MessageCircle className="w-4 h-4" />}
                  {liveChatLoading ? 'Conectando...' : 'Iniciar Chat'}
                </button>
              </div>
            ) : (
              <>
                <div className="h-64 p-3 overflow-y-auto space-y-2">
                  {liveChatMessages.map((m, idx) => (
                    <div key={m.id || idx} className={`flex ${m.is_agent ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] px-3 py-2 rounded-lg text-[11px] ${m.is_agent ? 'bg-[#1a1625]' : 'bg-purple-600'}`}>
                        {m.is_agent && <div className="text-[9px] text-purple-400 mb-1">Agente de Soporte</div>}
                        <p>{m.message}</p>
                        <span className="text-[8px] opacity-60">{new Date(m.created_at).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  ))}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 border-t border-purple-900/20 bg-[#1a1625] flex gap-2">
                  <input 
                    type="text" 
                    value={chatMessage} 
                    onChange={(e) => setChatMessage(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendLiveChatMessage()} 
                    placeholder="Escribe tu mensaje..." 
                    className="flex-1 bg-[#0d0b14] border border-purple-900/30 rounded-lg px-3 py-2 text-[11px]" 
                    disabled={sendingMessage}
                  />
                  <button onClick={sendLiveChatMessage} disabled={sendingMessage || !chatMessage.trim()} className="px-4 py-2 bg-purple-600 rounded-lg disabled:opacity-50">
                    {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {selectedChannel === 'video' && (
          <div className="bg-[#13111c] rounded-lg border border-purple-900/20 mb-6 p-8 text-center">
            <Video className="w-12 h-12 mx-auto mb-3 text-purple-400" />
            <h3 className="text-sm font-medium mb-2">Videollamada con Soporte</h3>
            <p className="text-[11px] text-gray-500 mb-4">Las videollamadas están disponibles para usuarios Premium</p>
            <p className="text-[10px] text-gray-600 mb-4">Contacta a soporte por chat o ticket para programar una videollamada</p>
            <button onClick={() => setSelectedChannel(null)} className="px-4 py-2 bg-[#1a1625] rounded-lg text-[11px]">Volver</button>
          </div>
        )}
      </div>
    </div>
  );
}

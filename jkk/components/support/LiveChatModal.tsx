
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Send, Star, Zap, Crown } from "lucide-react";

export type Message = {
  id: number;
  sender: 'user' | 'support';
  message: string;
  time: string;
  avatar: string;
};

interface LiveChatModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  chatMessages: Message[];
  isSupportTyping: boolean;
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSendMessage: () => void;
}

const LiveChatModal = ({ open, onOpenChange, chatMessages, isSupportTyping, newMessage, setNewMessage, handleSendMessage }: LiveChatModalProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl bg-gradient-to-br from-[#1e2139] via-[#2a2d47] to-[#1e2139] border-2 border-blue-400/50 text-white shadow-2xl">
      {/* Enhanced header */}
      <DialogHeader className="border-b border-gray-600/30 pb-4">
        <DialogTitle className="flex items-center justify-between text-2xl">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-4 h-4 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
              <div className="absolute inset-0 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
            </div>
            <MessageCircle className="w-8 h-8 text-blue-400 animate-bounce" />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent font-black">
              Chat VIP Premium
            </span>
            <Crown className="w-6 h-6 text-yellow-400 animate-pulse" />
          </div>
          <div className="flex items-center gap-2">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 text-yellow-400 fill-current animate-pulse" style={{animationDelay: `${i * 200}ms`}} />
            ))}
          </div>
        </DialogTitle>
        <DialogDescription className="text-center text-base text-gray-300 pt-2">
          <div className="flex items-center justify-center gap-3 mb-2">
            <span className="text-2xl animate-bounce">👩‍💼</span>
            <span className="font-semibold">Conectado con Ana - Especialista VIP</span>
            <Badge className="bg-green-500/30 text-green-300 border border-green-400/50 animate-pulse">
              <Zap className="w-3 h-3 mr-1" />
              Online
            </Badge>
          </div>
          <p className="text-sm text-blue-300">Respuesta promedio: 15 segundos • Satisfacción: 4.9/5</p>
        </DialogDescription>
      </DialogHeader>

      {/* Enhanced chat area */}
      <div className="flex flex-col h-[500px]">
        <div className="flex-1 bg-[#131722] rounded-xl p-6 mb-6 overflow-y-auto space-y-6 border border-gray-600/30 custom-scrollbar">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
              <div className={`max-w-md p-5 rounded-2xl relative ${
                msg.sender === 'user'
                  ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gradient-to-r from-gray-700 to-gray-800 text-white border-2 border-blue-400/30 shadow-lg'
              }`}>
                {msg.sender === 'support' && (
                  <div className="flex items-center gap-3 mb-3 pb-2 border-b border-gray-600/30">
                    <span className="text-2xl animate-bounce">{msg.avatar}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-blue-400">Ana - Especialista VIP</span>
                        <Crown className="w-4 h-4 text-yellow-400" />
                      </div>
                      <Badge className="bg-green-500/30 text-green-400 text-xs border border-green-400/50 mt-1">
                        <div className="w-2 h-2 bg-green-400 rounded-full mr-1 animate-pulse"></div>
                        Online Premium
                      </Badge>
                    </div>
                  </div>
                )}
                <p className="text-base leading-relaxed font-medium">{msg.message}</p>
                <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-600/20">
                  <p className="text-xs opacity-70">{msg.time}</p>
                  {msg.sender === 'support' && (
                    <div className="flex items-center gap-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-yellow-400">VIP</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {/* Enhanced typing indicator */}
          {isSupportTyping && (
            <div className="flex justify-start animate-fade-in">
              <div className="max-w-md p-5 rounded-2xl bg-gradient-to-r from-gray-700 to-gray-800 text-white border-2 border-blue-400/30 shadow-lg">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-2xl animate-bounce">👩‍💼</span>
                  <div className="flex-1">
                    <span className="text-sm font-bold text-blue-400">Ana está escribiendo...</span>
                    <Badge className="bg-yellow-500/30 text-yellow-400 text-xs border border-yellow-400/50 ml-2">
                      Procesando
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce"></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                  <span className="text-xs text-gray-400 ml-2">Analizando tu consulta...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Enhanced input area */}
        <div className="flex gap-3 p-2 bg-[#131722] rounded-xl border border-gray-600/30">
          <Input
            placeholder="Escribe tu mensaje VIP..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="bg-transparent border-none text-white placeholder:text-gray-400 focus-visible:ring-blue-500 text-base flex-1"
          />
          <Button 
            onClick={handleSendMessage} 
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 px-8 py-3 font-bold shadow-lg hover:shadow-blue-500/50 transition-all duration-300 rounded-lg"
            disabled={!newMessage.trim()}
          >
            <Send className="w-5 h-5 mr-2" />
            Enviar
          </Button>
        </div>

        {/* Chat quality indicators */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-gray-400">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Conexión segura</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-3 h-3 text-yellow-400" />
            <span>Respuesta ultra rápida</span>
          </div>
          <div className="flex items-center gap-1">
            <Crown className="w-3 h-3 text-purple-400" />
            <span>Soporte Premium</span>
          </div>
        </div>
      </div>
    </DialogContent>
  </Dialog>
);

export default LiveChatModal;

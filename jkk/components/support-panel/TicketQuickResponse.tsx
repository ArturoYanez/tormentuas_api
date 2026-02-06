
import React from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Edit, CheckCircle, Rocket, Sparkles, Verified, MessageSquare, Calendar, User, Zap, Crown, Star, Heart, Send } from "lucide-react";

const TicketQuickResponse = ({
  selectedTicket,
  newTicketResponse,
  setNewTicketResponse,
  handleSendResponse,
  handleTicketAction
}) => {
  if (!selectedTicket) {
    return (
      <div className="text-center py-12 animate-fade-in">
        <div className="mb-6">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
            <MessageSquare className="w-12 h-12 text-blue-400 animate-bounce" />
          </div>
          <Sparkles className="w-8 h-8 mx-auto text-purple-400 animate-spin mb-4" />
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Centro de Control Premium</h3>
        <p className="text-gray-400 mb-6">Seleccione un ticket para activar el panel de respuesta inteligente</p>
        <div className="flex justify-center gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" style={{animationDelay: `${i * 200}ms`}}></div>
          ))}
        </div>
      </div>
    );
  }
  return (
    <div className="animate-fade-in">
      <Label className="text-gray-300 font-semibold flex items-center gap-2">
        <Edit className="w-4 h-4 text-blue-400" />
        Respuesta Premium
      </Label>
      <Textarea
        value={newTicketResponse}
        onChange={e => setNewTicketResponse(e.target.value)}
        placeholder="✨ Escriba su respuesta premium aquí..."
        className="bg-slate-900/60 border-2 border-slate-700/50 text-white rounded-xl"
      />
      <div className="space-y-4">
        <div className="flex gap-3">
          <Button onClick={handleSendResponse} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 flex-1 h-12 rounded-xl shadow-lg hover:shadow-purple-500/30 transition-all duration-300 group font-bold">
            <Send className="w-5 h-5 mr-2 group-hover:animate-bounce" />
            Enviar Respuesta
            <Sparkles className="w-4 h-4 ml-2 group-hover:animate-spin" />
          </Button>
          <Button variant="outline" onClick={() => handleTicketAction("Resolver", selectedTicket.id)} className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:scale-110 transition-all duration-300 h-12 px-4 rounded-xl group">
            <CheckCircle className="w-5 h-5 group-hover:animate-spin" />
          </Button>
        </div>
        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          <Button variant="outline" className="border-blue-500/30 text-blue-400 hover:bg-blue-500/10 transition-all duration-300 group text-sm">
            <Zap className="w-4 h-4 mr-2 group-hover:animate-pulse" />
            Respuesta Rápida
          </Button>
          <Button variant="outline" className="border-purple-500/30 text-purple-400 hover:bg-purple-500/10 transition-all duration-300 group text-sm">
            <Crown className="w-4 h-4 mr-2 group-hover:animate-bounce" />
            Escalar VIP
          </Button>
        </div>
      </div>
    </div>
  );
};
export default TicketQuickResponse;

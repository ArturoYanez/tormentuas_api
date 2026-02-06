
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle, Mail, Phone, Video, Sparkles, Zap, Crown } from 'lucide-react';

interface SupportOptionsProps {
  onLiveChatClick: () => void;
  onVideoCallClick: () => void;
  onEmailClick: () => void;
  onPhoneClick: () => void;
}

const SupportOptions = ({ onLiveChatClick, onVideoCallClick, onEmailClick, onPhoneClick }: SupportOptionsProps) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
    {/* Live Chat Card */}
    <Card className="group bg-gradient-to-br from-[#1e2139] via-[#2a2d47] to-[#1e2139] border-2 border-blue-400/30 hover:border-blue-400/70 hover:scale-110 hover:-translate-y-4 transition-all duration-700 cursor-pointer overflow-hidden relative shadow-2xl hover:shadow-blue-500/50"
          onClick={onLiveChatClick}>
      {/* Animated background particles */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-500 animate-pulse"></div>
      
      {/* Floating icons */}
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
        <Sparkles className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
      
      <CardHeader className="text-center relative z-10 pb-6">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-blue-500/70 relative">
          <MessageCircle className="w-12 h-12 text-white group-hover:animate-bounce" />
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center animate-pulse">
            <span className="text-xs font-bold text-white">5</span>
          </div>
        </div>
        <CardTitle className="text-white text-2xl font-black mb-2 group-hover:text-blue-300 transition-colors duration-300">
          Chat Instantáneo
        </CardTitle>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
          <span className="text-green-400 text-sm font-bold">5 especialistas VIP en línea</span>
          <Crown className="w-4 h-4 text-yellow-400 animate-bounce" />
        </div>
      </CardHeader>
      <CardContent className="text-center relative z-10 px-6">
        <p className="text-gray-300 mb-8 leading-relaxed text-lg">Conversación <span className="text-blue-400 font-bold">inmediata</span> con nuestros especialistas certificados</p>
        <div className="bg-gradient-to-r from-blue-600/30 to-cyan-600/30 border border-blue-400/50 rounded-xl p-4 mb-6 group-hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
            <p className="text-blue-300 text-sm font-bold">Respuesta en tiempo real</p>
          </div>
          <p className="text-xs text-gray-400">Promedio: 15 segundos</p>
        </div>
        <Button className="w-full bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white shadow-xl group-hover:shadow-blue-500/50 transition-all duration-300 font-bold text-lg py-4 rounded-xl">
          💬 Iniciar Chat VIP
        </Button>
      </CardContent>
    </Card>

    {/* Video Call Card */}
    <Card className="group bg-gradient-to-br from-[#1e2139] via-[#2a2d47] to-[#1e2139] border-2 border-purple-400/30 hover:border-purple-400/70 hover:scale-110 hover:-translate-y-4 transition-all duration-700 cursor-pointer overflow-hidden relative shadow-2xl hover:shadow-purple-500/50"
          onClick={onVideoCallClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 animate-pulse"></div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
        <Crown className="w-6 h-6 text-purple-400 animate-bounce" />
      </div>
      
      <CardHeader className="text-center relative z-10 pb-6">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-purple-500/70">
          <Video className="w-12 h-12 text-white group-hover:animate-pulse" />
        </div>
        <CardTitle className="text-white text-2xl font-black mb-2 group-hover:text-purple-300 transition-colors duration-300">
          Videollamada VIP
        </CardTitle>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-pulse shadow-lg shadow-purple-400/50"></div>
          <span className="text-purple-400 text-sm font-bold">Especialistas premium disponibles</span>
        </div>
      </CardHeader>
      <CardContent className="text-center relative z-10 px-6">
        <p className="text-gray-300 mb-8 leading-relaxed text-lg">Asistencia <span className="text-purple-400 font-bold">personal cara a cara</span> con pantalla compartida</p>
        <div className="bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-400/50 rounded-xl p-4 mb-6 group-hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Video className="w-5 h-5 text-purple-400 animate-pulse" />
            <p className="text-purple-300 text-sm font-bold">Conexión HD inmediata</p>
          </div>
          <p className="text-xs text-gray-400">Incluye grabación de sesión</p>
        </div>
        <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-xl group-hover:shadow-purple-500/50 transition-all duration-300 font-bold text-lg py-4 rounded-xl">
          📹 Conectar Premium
        </Button>
      </CardContent>
    </Card>

    {/* Email Support Card */}
    <Card className="group bg-gradient-to-br from-[#1e2139] via-[#2a2d47] to-[#1e2139] border-2 border-green-400/30 hover:border-green-400/70 hover:scale-110 hover:-translate-y-4 transition-all duration-700 cursor-pointer overflow-hidden relative shadow-2xl hover:shadow-green-500/50"
          onClick={onEmailClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-500 via-emerald-500 to-green-500 animate-pulse"></div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
        <Sparkles className="w-6 h-6 text-green-400 animate-spin" />
      </div>
      
      <CardHeader className="text-center relative z-10 pb-6">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-green-500/70">
          <Mail className="w-12 h-12 text-white group-hover:animate-bounce" />
        </div>
        <CardTitle className="text-white text-2xl font-black mb-2 group-hover:text-green-300 transition-colors duration-300">
          Ticket Premium
        </CardTitle>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse shadow-lg shadow-yellow-400/50"></div>
          <span className="text-yellow-400 text-sm font-bold">Seguimiento garantizado 24/7</span>
        </div>
      </CardHeader>
      <CardContent className="text-center relative z-10 px-6">
        <p className="text-gray-300 mb-8 leading-relaxed text-lg">Crea un ticket <span className="text-green-400 font-bold">detallado</span> con seguimiento completo</p>
        <div className="bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-400/50 rounded-xl p-4 mb-6 group-hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Mail className="w-5 h-5 text-green-400 animate-pulse" />
            <p className="text-green-300 text-sm font-bold">Respuesta garantizada &lt; 2 horas</p>
          </div>
          <p className="text-xs text-gray-400">Prioridad VIP incluida</p>
        </div>
        <Button className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-xl group-hover:shadow-green-500/50 transition-all duration-300 font-bold text-lg py-4 rounded-xl">
          🎫 Crear Ticket VIP
        </Button>
      </CardContent>
    </Card>

    {/* Phone Support Card */}
    <Card className="group bg-gradient-to-br from-[#1e2139] via-[#2a2d47] to-[#1e2139] border-2 border-orange-400/30 hover:border-orange-400/70 hover:scale-110 hover:-translate-y-4 transition-all duration-700 cursor-pointer overflow-hidden relative shadow-2xl hover:shadow-orange-500/50"
          onClick={onPhoneClick}>
      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-red-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500 animate-pulse"></div>
      
      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200">
        <Zap className="w-6 h-6 text-orange-400 animate-bounce" />
      </div>
      
      <CardHeader className="text-center relative z-10 pb-6">
        <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-orange-500 to-red-500 rounded-full flex items-center justify-center shadow-2xl group-hover:scale-125 group-hover:rotate-12 transition-all duration-500 group-hover:shadow-orange-500/70 relative">
          <Phone className="w-12 h-12 text-white group-hover:animate-pulse" />
          <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full animate-ping"></div>
        </div>
        <CardTitle className="text-white text-2xl font-black mb-2 group-hover:text-orange-300 transition-colors duration-300">
          Línea Directa VIP
        </CardTitle>
        <div className="flex items-center justify-center gap-3 mt-3">
          <div className="w-3 h-3 bg-orange-400 rounded-full animate-pulse shadow-lg shadow-orange-400/50"></div>
          <span className="text-orange-400 text-sm font-bold">Línea premium activa</span>
        </div>
      </CardHeader>
      <CardContent className="text-center relative z-10 px-6">
        <p className="text-gray-300 mb-8 leading-relaxed text-lg">Conversación <span className="text-orange-400 font-bold">directa inmediata</span> con expertos</p>
        <div className="bg-gradient-to-r from-orange-600/30 to-red-600/30 border border-orange-400/50 rounded-xl p-4 mb-6 group-hover:scale-105 transition-transform duration-300">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Phone className="w-5 h-5 text-orange-400 animate-pulse" />
            <p className="text-orange-300 text-sm font-bold">Sin colas ni esperas</p>
          </div>
          <p className="text-xs text-gray-400">Conexión en 3 segundos</p>
        </div>
        <Button className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-xl group-hover:shadow-orange-500/50 transition-all duration-300 font-bold text-lg py-4 rounded-xl">
          ☎️ Llamar VIP Ahora
        </Button>
      </CardContent>
    </Card>
  </div>
);

export default SupportOptions;


import { Headphones, Clock, Star, Shield, Zap, Users } from 'lucide-react';

const SupportHeader = () => (
  <div className="text-center mb-16 relative">
    {/* Enhanced animated background */}
    <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-green-500/20 rounded-3xl blur-3xl animate-pulse"></div>
    <div className="absolute -top-20 -left-20 w-40 h-40 bg-blue-400/10 rounded-full blur-2xl animate-bounce"></div>
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-2xl animate-bounce delay-1000"></div>
    <div className="absolute -bottom-10 left-1/3 w-24 h-24 bg-green-400/10 rounded-full blur-2xl animate-bounce delay-2000"></div>
    
    <div className="relative z-10">
      {/* Enhanced VIP badge */}
      <div className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 border-2 border-blue-400/50 rounded-full px-8 py-4 mb-8 backdrop-blur-md shadow-2xl hover:scale-105 transition-all duration-300 group">
        <Headphones className="w-7 h-7 text-blue-400 group-hover:animate-bounce" />
        <span className="text-blue-300 font-bold text-xl bg-gradient-to-r from-blue-300 to-purple-300 bg-clip-text text-transparent">Centro de Soporte VIP</span>
        <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
        <Zap className="w-5 h-5 text-yellow-400 animate-pulse" />
      </div>

      {/* Enhanced main title */}
      <h1 className="text-6xl sm:text-8xl font-black text-white mb-8 bg-gradient-to-r from-blue-400 via-purple-500 to-green-400 bg-clip-text text-transparent leading-tight animate-fade-in hover:scale-105 transition-transform duration-500">
        ¿Necesitas Ayuda?
      </h1>
      
      {/* Enhanced subtitle */}
      <p className="text-gray-300 text-xl sm:text-2xl max-w-4xl mx-auto leading-relaxed mb-8 animate-fade-in delay-300">
        Nuestro equipo de <span className="text-blue-400 font-bold">especialistas certificados</span> está disponible 
        <span className="text-green-400 font-bold"> 24/7</span> para brindarte la 
        <span className="text-purple-400 font-bold"> mejor experiencia</span> de soporte premium.
      </p>

      {/* Enhanced stats badges */}
      <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-400 mb-8">
        <div className="flex items-center gap-3 bg-green-600/20 border border-green-400/30 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300 group">
          <Clock className="w-5 h-5 text-green-400 group-hover:animate-spin" />
          <span className="font-semibold">Respuesta promedio: <span className="text-green-400">1.2 min</span></span>
        </div>
        <div className="flex items-center gap-3 bg-yellow-600/20 border border-yellow-400/30 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300 group">
          <Star className="w-5 h-5 text-yellow-400 fill-current group-hover:animate-spin" />
          <span className="font-semibold"><span className="text-yellow-400">4.9/5</span> satisfacción</span>
        </div>
        <div className="flex items-center gap-3 bg-blue-600/20 border border-blue-400/30 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300 group">
          <Shield className="w-5 h-5 text-blue-400 group-hover:animate-pulse" />
          <span className="font-semibold">Soporte <span className="text-blue-400">certificado</span></span>
        </div>
        <div className="flex items-center gap-3 bg-purple-600/20 border border-purple-400/30 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300 group">
          <Users className="w-5 h-5 text-purple-400 group-hover:animate-bounce" />
          <span className="font-semibold"><span className="text-purple-400">50K+</span> usuarios atendidos</span>
        </div>
      </div>

      {/* Call to action pulse */}
      <div className="inline-flex items-center gap-2 text-lg font-bold text-transparent bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text animate-pulse">
        🚀 Tu satisfacción es nuestra prioridad #1
      </div>
    </div>
  </div>
);

export default SupportHeader;

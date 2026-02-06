
import React from 'react';
import { Button } from '@/components/ui/button';
import { CloudLightning, ArrowRight, Star, ArrowDown, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center py-24 overflow-hidden bg-gradient-to-br from-black via-gray-950 to-purple-950">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-fuchsia-900/30 via-black to-blue-900/30 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-to-r from-fuchsia-600/40 to-purple-600/40 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-gradient-to-r from-blue-600/40 to-cyan-600/40 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/3 right-1/2 w-64 h-64 bg-gradient-to-r from-purple-600/30 to-pink-600/30 rounded-full blur-3xl animate-pulse animation-delay-4000"></div>
        
        {/* Floating particles */}
        <div className="absolute top-20 left-20 w-2 h-2 bg-fuchsia-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-32 w-1 h-1 bg-blue-400 rounded-full animate-ping animation-delay-1000"></div>
        <div className="absolute top-40 right-20 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping animation-delay-2000"></div>
      </div>

      <div className="container relative text-center z-10">
        <div className="mb-6 flex justify-center">
          <div className="relative">
            <Sparkles className="w-12 h-12 text-fuchsia-400 animate-spin" />
            <div className="absolute -top-2 -right-2 w-4 h-4 bg-yellow-400 rounded-full animate-bounce"></div>
          </div>
        </div>
        
        <h1 className="text-6xl md:text-8xl lg:text-9xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl animate-fade-in">
          Potencia tus <br />
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
              Inversiones
            </span>
            <div className="absolute -bottom-4 left-0 w-full h-2 bg-gradient-to-r from-fuchsia-500 to-blue-500 rounded-full blur-sm animate-pulse"></div>
          </span>
          <br />
          con <span className="text-gradient-animated font-extrabold">Tormentus</span>
        </h1>
        
        <p className="text-xl md:text-2xl text-fuchsia-100/90 max-w-4xl mx-auto mb-12 leading-relaxed drop-shadow-lg animate-fade-in [animation-delay:200ms] font-medium">
          🚀 La plataforma definitiva de trading algorítmico que <span className="text-yellow-300 font-bold">revolucionará</span> tu manera de invertir.
          <br />
          <span className="text-cyan-300">Automatiza, optimiza y domina</span> los mercados con tecnología de élite.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-6 mb-16 animate-fade-in [animation-delay:400ms]">
          <Button asChild size="lg" className="relative bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 hover:from-fuchsia-500 hover:to-blue-500 text-white shadow-2xl shadow-fuchsia-500/40 font-bold px-10 py-8 text-xl rounded-2xl transition-all duration-300 transform hover:scale-110 hover:shadow-fuchsia-500/60 group overflow-hidden">
            <Link to="/auth">
              <div className="absolute inset-0 bg-gradient-to-r from-yellow-400/20 to-pink-400/20 blur-xl group-hover:blur-2xl transition-all duration-300"></div>
              <Star className="w-7 h-7 mr-3 text-yellow-300 animate-bounce relative z-10" />
              <span className="relative z-10">🔥 Comenzar Ahora</span>
            </Link>
          </Button>
          
          <Button asChild size="lg" variant="outline" className="relative text-fuchsia-100 border-3 border-fuchsia-400/60 bg-black/40 backdrop-blur-sm hover:bg-fuchsia-900/50 hover:text-white hover:border-fuchsia-300 shadow-xl font-bold px-10 py-8 text-xl rounded-2xl group transition-all duration-300 hover:scale-105">
            <a href="#features">
              <span className="relative z-10">✨ Descubrir Más</span>
              <ArrowRight className="w-6 h-6 ml-3 transition-transform group-hover:translate-x-2 relative z-10" />
            </a>
          </Button>
        </div>

        {/* Stats section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16 animate-fade-in [animation-delay:600ms]">
          <div className="bg-gradient-to-br from-fuchsia-900/30 to-purple-900/30 rounded-2xl p-6 border border-fuchsia-500/30 backdrop-blur-sm">
            <div className="text-3xl font-black text-fuchsia-300 mb-2">+10,000</div>
            <div className="text-gray-300">Usuarios Activos</div>
          </div>
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 rounded-2xl p-6 border border-blue-500/30 backdrop-blur-sm">
            <div className="text-3xl font-black text-blue-300 mb-2">99.9%</div>
            <div className="text-gray-300">Tiempo Activo</div>
          </div>
          <div className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30 backdrop-blur-sm">
            <div className="text-3xl font-black text-purple-300 mb-2">$50M+</div>
            <div className="text-gray-300">Volumen Operado</div>
          </div>
        </div>
        
        <a href="#services" aria-label="Scroll down" className="inline-block text-fuchsia-300 animate-bounce hover:text-white transition-colors">
          <ArrowDown className="w-10 h-10"/>
        </a>
      </div>
      
      {/* Enhanced Bottom Glow */}
      <div className="absolute bottom-0 left-0 w-full h-60 bg-gradient-to-t from-black via-purple-950/50 to-transparent pointer-events-none" />
    </section>
  );
};

export default Hero;

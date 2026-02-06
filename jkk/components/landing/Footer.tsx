
import React from 'react';
import { CloudLightning, Star, Twitter, Github, Linkedin } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black border-t-2 border-fuchsia-900/30 shadow-[0_-12px_48px_0_rgba(120,60,255,0.09)] relative">
      <div className="container mx-auto py-12 px-4">
        <div className="grid md:grid-cols-3 gap-8 items-center">
          <div className="flex items-center justify-center md:justify-start">
            <Link to="/" className="flex items-center gap-2 group">
              <CloudLightning className="h-8 w-8 text-fuchsia-400 animate-pulse group-hover:text-white transition-colors" />
              <span className="font-bold text-white text-2xl tracking-widest group-hover:text-fuchsia-300 transition-colors">Tormentus</span>
            </Link>
          </div>
          
          <div className="flex justify-center gap-6 text-fuchsia-200/80">
            <a href="#services" className="hover:text-white transition-colors hover:underline">Servicios</a>
            <a href="#features" className="hover:text-white transition-colors hover:underline">Features</a>
            <a href="#about" className="hover:text-white transition-colors hover:underline">Nosotros</a>
          </div>

          <div className="flex justify-center md:justify-end space-x-5 text-fuchsia-300/70">
            <a href="#" className="hover:text-white transition-colors"><Twitter size={22}/></a>
            <a href="#" className="hover:text-white transition-colors"><Github size={22}/></a>
            <a href="#" className="hover:text-white transition-colors"><Linkedin size={22}/></a>
          </div>
        </div>
        <div className="text-center text-fuchsia-300/60 mt-10 pt-8 border-t border-fuchsia-900/30 text-sm">
          <p className="font-medium">© {new Date().getFullYear()} Tormentus. Todos los derechos reservados.</p>
          <p className="text-xs opacity-70 mt-2">Invertir implica riesgos. El rendimiento pasado no es indicativo de resultados futuros.</p>
        </div>
      </div>
      {/* Footer Glow */}
      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-fuchsia-800/20 to-transparent blur-lg pointer-events-none" />
    </footer>
  );
};

export default Footer;


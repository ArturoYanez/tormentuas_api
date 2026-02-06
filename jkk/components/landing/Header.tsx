
import React from 'react';
import { Button } from '@/components/ui/button';
import { Cloud, Sparkle, Flame, Star, Rainbow } from 'lucide-react';
import { Link } from 'react-router-dom';

const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full bg-black/80 shadow-2xl shadow-fuchsia-500/10 backdrop-blur-xl border-b border-fuchsia-800/20">
      <div className="container flex h-20 items-center relative">
        {/* Glowing aura */}
        <div className="absolute inset-0 pointer-events-none -z-10">
          <div className="w-full h-full bg-gradient-to-r from-fuchsia-800/15 via-transparent to-blue-800/15 blur-3xl animate-pulse" />
        </div>
        {/* Logo & name */}
        <div className="mr-8 flex items-center group hover:scale-105 transition-transform duration-200 ease-out drop-shadow-xl">
          <Link to="/" className="flex items-center">
            <span className="relative flex items-center">
              <Cloud className="h-8 w-8 mr-2 text-fuchsia-400 drop-shadow-lg animate-bounce" />
              <Flame className="h-4 w-4 text-yellow-400 absolute -left-2 bottom-0 animate-pulse" />
            </span>
            <span className="font-extrabold text-2xl md:text-3xl bg-gradient-to-r from-fuchsia-400 via-cyan-200 to-blue-400 bg-clip-text text-transparent tracking-widest drop-shadow-lg select-none transition-shadow duration-150 group-hover:drop-shadow-[0_1px_32px_rgba(180,30,250,0.48)]">
              Tormentus
            </span>
            <Rainbow className="h-5 w-5 text-yellow-200 ml-2 animate-spin-slow" />
            <Star className="h-4 w-4 text-fuchsia-300 ml-1 shimmer" />
          </Link>
        </div>
        {/* Navigation */}
        <nav className="flex items-center gap-8 text-base font-bold flex-1 justify-center">
          <a
            href="#services"
            className="hover-nav-link"
          >
            Servicios
          </a>
          <a
            href="#features"
            className="hover-nav-link"
          >
            Características
          </a>
          <a
            href="#about"
            className="hover-nav-link"
          >
            Nosotros
          </a>
        </nav>
        {/* Buttons */}
        <div className="flex items-center gap-3 relative">
          <div className="absolute -top-4 -right-6 w-12 h-12 rounded-full pointer-events-none bg-gradient-to-br from-fuchsia-500/30 via-pink-400/20 to-blue-400/20 blur-lg animate-blob" />
          <Button
            variant="ghost"
            className="text-fuchsia-200 border border-fuchsia-500/40 hover:bg-fuchsia-900/30 hover:text-white shadow-md transition-all font-bold hover:border-fuchsia-400"
            asChild
          >
            <Link to="/auth">
              <Sparkle className="w-5 h-5 mr-2 text-yellow-300 animate-spin" />
              Iniciar Sesión
            </Link>
          </Button>
          <Button
            className="bg-gradient-to-r from-fuchsia-600 via-purple-500 to-blue-500 hover:from-fuchsia-700 hover:to-blue-600 text-white shadow-xl shadow-fuchsia-500/20 font-extrabold px-7 drop-shadow-lg animate-pulse border-2 border-fuchsia-400/30 transition-all transform hover:scale-105"
            asChild
          >
            <Link to="/auth">
              <Star className="w-5 h-5 mr-1 text-yellow-200 animate-bounce" />
              Regístrate Gratis
            </Link>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;


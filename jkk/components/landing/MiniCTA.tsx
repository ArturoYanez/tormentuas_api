
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CloudLightning } from 'lucide-react';

const MiniCTA = () => (
  <section className="bg-gradient-to-r from-fuchsia-900/60 via-black/90 to-blue-900/60 py-16 relative overflow-hidden">
    <div className="absolute -top-20 right-0 w-[400px] h-40 bg-fuchsia-800/20 blur-2xl z-0" />
    <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
      <div className="flex-1">
        <h3 className="text-3xl md:text-4xl font-extrabold text-white mb-2">¿Listo para potenciar tus inversiones?</h3>
        <p className="text-lg text-fuchsia-200 mb-3">Únete a miles de usuarios y accede a tecnología de trading inigualable.</p>
      </div>
      <Button
        size="lg"
        className="bg-gradient-to-r from-fuchsia-600 via-purple-600 to-blue-600 text-white font-bold px-9 shadow-xl"
        asChild
      >
        <Link to="/auth">
          <CloudLightning className="w-6 h-6 mr-2 animate-pulse" />
          Comenzar Ahora
        </Link>
      </Button>
    </div>
  </section>
);
export default MiniCTA;

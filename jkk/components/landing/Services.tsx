
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, CircleDollarSign, Bitcoin, Users, Zap, Shield, BarChart3, Bot } from 'lucide-react';

const services = [
  {
    icon: TrendingUp,
    title: 'Trading de Acciones',
    description: 'Accede a los principales mercados globales con ejecución instantánea y análisis avanzado.',
    color: 'from-green-500 to-emerald-600',
    bgColor: 'from-green-900/30 to-emerald-900/30',
    borderColor: 'border-green-500/30'
  },
  {
    icon: CircleDollarSign,
    title: 'Mercado de Forex',
    description: 'Opera en el mercado más líquido del mundo con spreads ultra competitivos.',
    color: 'from-blue-500 to-cyan-600',
    bgColor: 'from-blue-900/30 to-cyan-900/30',
    borderColor: 'border-blue-500/30'
  },
  {
    icon: Bitcoin,
    title: 'Criptomonedas',
    description: 'Invierte en Bitcoin, Ethereum y las altcoins más prometedoras del mercado.',
    color: 'from-orange-500 to-yellow-600',
    bgColor: 'from-orange-900/30 to-yellow-900/30',
    borderColor: 'border-orange-500/30'
  },
  {
    icon: Users,
    title: 'Asesoría VIP',
    description: 'Soporte personalizado 24/7 de expertos para maximizar tu rendimiento.',
    color: 'from-purple-500 to-pink-600',
    bgColor: 'from-purple-900/30 to-pink-900/30',
    borderColor: 'border-purple-500/30'
  },
  {
    icon: Zap,
    title: 'Ejecución Ultrarrápida',
    description: 'Tecnología de baja latencia para aprovechar cada oportunidad del mercado.',
    color: 'from-yellow-500 to-orange-600',
    bgColor: 'from-yellow-900/30 to-orange-900/30',
    borderColor: 'border-yellow-500/30'
  },
  {
    icon: Shield,
    title: 'Seguridad Absoluta',
    description: 'Protección de grado militar para tus activos y datos personales.',
    color: 'from-red-500 to-rose-600',
    bgColor: 'from-red-900/30 to-rose-900/30',
    borderColor: 'border-red-500/30'
  },
  {
    icon: BarChart3,
    title: 'Análisis Avanzado',
    description: 'Herramientas profesionales de análisis técnico y fundamental.',
    color: 'from-indigo-500 to-blue-600',
    bgColor: 'from-indigo-900/30 to-blue-900/30',
    borderColor: 'border-indigo-500/30'
  },
  {
    icon: Bot,
    title: 'Trading con IA',
    description: 'Algoritmos de inteligencia artificial que operan por ti 24/7.',
    color: 'from-violet-500 to-purple-600',
    bgColor: 'from-violet-900/30 to-purple-900/30',
    borderColor: 'border-violet-500/30'
  }
];

const Services = () => {
  return (
    <section id="services" className="py-28 bg-gradient-to-b from-black via-gray-950 to-black relative overflow-hidden">
      <div className="container mx-auto px-4 relative z-10">
        {/* Enhanced decorative elements */}
        <div className="absolute -top-20 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-fuchsia-600/20 via-purple-500/10 to-blue-600/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-10 -left-20 w-80 h-80 rounded-full bg-gradient-to-tr from-blue-600/20 via-cyan-500/10 to-transparent blur-3xl animate-pulse animation-delay-2000" />
        
        <div className="text-center mb-20">
          <div className="inline-block mb-6">
            <div className="bg-gradient-to-r from-fuchsia-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold uppercase tracking-wider animate-pulse">
              🚀 Servicios Premium
            </div>
          </div>
          <h2 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 animate-fade-in">
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-400 to-blue-400 bg-clip-text text-transparent drop-shadow-2xl">
              Todo lo que Necesitas
            </span>
          </h2>
          <p className="text-xl text-purple-200 font-medium max-w-3xl mx-auto animate-fade-in [animation-delay:200ms]">
            Herramientas profesionales, tecnología de punta y soporte experto en una sola plataforma 🎯
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <Card 
              key={index} 
              className={`group bg-gradient-to-br ${service.bgColor} backdrop-blur-sm border-2 ${service.borderColor} text-white text-center hover:scale-110 hover:border-opacity-80 shadow-2xl hover:shadow-3xl transition-all duration-500 transform hover:-translate-y-6 animate-fade-in cursor-pointer relative overflow-hidden`} 
              style={{animationDelay: `${index * 100}ms`}}
            >
              {/* Hover glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${service.color} opacity-0 group-hover:opacity-20 transition-opacity duration-500 blur-xl`}></div>
              
              <CardHeader className="relative z-10">
                <div className={`mx-auto bg-gradient-to-br ${service.color} p-6 rounded-2xl w-fit mb-6 shadow-2xl group-hover:shadow-3xl transition-all duration-300 group-hover:scale-110`}>
                  <service.icon className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
                <CardTitle className="text-2xl font-black drop-shadow-md group-hover:text-white transition-colors duration-300">
                  {service.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-300 text-base leading-relaxed">
                  {service.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;

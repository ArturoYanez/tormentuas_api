
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Zap, BarChart, Bot, Sparkles, Crown, Target, Rocket } from 'lucide-react';

const features = [
  {
    icon: ShieldCheck,
    title: 'Seguridad Fort Knox',
    description: 'Encriptación militar, autenticación biométrica y almacenamiento en frío. Tu dinero más seguro que en un banco.',
    gradient: 'from-emerald-400 to-green-600',
    bgGradient: 'from-emerald-900/40 to-green-900/30'
  },
  {
    icon: Zap,
    title: 'Velocidad Sobrehumana',
    description: 'Ejecución en microsegundos. Nuestros servidores están más cerca del mercado que tu competencia.',
    gradient: 'from-yellow-400 to-orange-600',
    bgGradient: 'from-yellow-900/40 to-orange-900/30'
  },
  {
    icon: BarChart,
    title: 'Análisis Cuántico',
    description: 'IA de última generación analiza millones de datos por segundo. Es como tener visión de rayos X del mercado.',
    gradient: 'from-blue-400 to-cyan-600',
    bgGradient: 'from-blue-900/40 to-cyan-900/30'
  },
  {
    icon: Bot,
    title: 'Trading Autopiloto',
    description: 'Algoritmos que nunca duermen, nunca tienen miedo y nunca pierden una oportunidad. Tu dinero trabajando 24/7.',
    gradient: 'from-purple-400 to-pink-600',
    bgGradient: 'from-purple-900/40 to-pink-900/30'
  },
  {
    icon: Crown,
    title: 'Acceso VIP',
    description: 'Mercados exclusivos, spreads preferenciales y señales premium. Únete a la élite del trading.',
    gradient: 'from-amber-400 to-yellow-600',
    bgGradient: 'from-amber-900/40 to-yellow-900/30'
  },
  {
    icon: Target,
    title: 'Precisión Láser',
    description: 'Backtesting con 10 años de datos históricos. Cada estrategia probada millones de veces antes de arriesgar.',
    gradient: 'from-red-400 to-rose-600',
    bgGradient: 'from-red-900/40 to-rose-900/30'
  },
  {
    icon: Rocket,
    title: 'Escalabilidad Infinita',
    description: 'Desde $100 hasta $100M. Nuestros sistemas crecen contigo sin límites ni restricciones.',
    gradient: 'from-indigo-400 to-blue-600',
    bgGradient: 'from-indigo-900/40 to-blue-900/30'
  },
  {
    icon: Sparkles,
    title: 'Magia Financiera',
    description: 'Transforma pequeñas inversiones en fortunas. La alquimia moderna del siglo XXI está aquí.',
    gradient: 'from-fuchsia-400 to-purple-600',
    bgGradient: 'from-fuchsia-900/40 to-purple-900/30'
  }
];

const Features = () => {
  return (
    <section id="features" className="py-32 bg-gradient-to-b from-black via-purple-950/20 to-black relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(120,119,198,0.1),transparent_70%)] pointer-events-none"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        {/* Floating decorative elements */}
        <div className="absolute -top-20 left-10 w-72 h-72 rounded-full bg-gradient-to-br from-fuchsia-500/20 to-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-gradient-to-tl from-blue-500/20 to-cyan-500/10 blur-3xl animate-pulse animation-delay-2000" />
        
        <div className="text-center mb-24">
          <div className="inline-block mb-8">
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-3 rounded-full text-lg font-bold uppercase tracking-wider animate-pulse shadow-2xl">
              ⚡ Superpoderes Incluidos
            </div>
          </div>
          <h2 className="text-6xl md:text-8xl font-black tracking-tighter mb-8 animate-fade-in">
            <span className="bg-gradient-to-r from-fuchsia-300 via-purple-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-2xl">
              Tu Arsenal
            </span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-green-400 bg-clip-text text-transparent">
              Definitivo
            </span>
          </h2>
          <p className="text-2xl text-purple-200 font-semibold max-w-4xl mx-auto animate-fade-in [animation-delay:200ms]">
            🎯 Herramientas que convierten traders promedio en <span className="text-yellow-300">leyendas del mercado</span>
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {features.map((feature, index) => (
            <Card 
              key={index} 
              className={`group bg-gradient-to-br ${feature.bgGradient} backdrop-blur-lg border-2 border-white/10 text-white text-center hover:scale-105 hover:border-white/30 shadow-2xl hover:shadow-4xl transition-all duration-700 transform hover:-translate-y-8 animate-fade-in cursor-pointer relative overflow-hidden`}
              style={{animationDelay: `${index * 150}ms`}}
            >
              {/* Animated background effect */}
              <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-0 group-hover:opacity-30 transition-all duration-700 blur-2xl scale-150`}></div>
              
              <CardHeader className="relative z-10 pb-4">
                <div className={`mx-auto bg-gradient-to-br ${feature.gradient} p-7 rounded-3xl w-fit mb-6 shadow-2xl group-hover:shadow-4xl transition-all duration-500 group-hover:scale-125 group-hover:rotate-12`}>
                  <feature.icon className="h-14 w-14 text-white drop-shadow-2xl" />
                </div>
                <CardTitle className="text-2xl font-black drop-shadow-lg group-hover:text-white transition-all duration-300 leading-tight">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="relative z-10">
                <p className="text-gray-300 group-hover:text-gray-100 transition-colors duration-500 text-base leading-relaxed font-medium">
                  {feature.description}
                </p>
              </CardContent>
              
              {/* Shine effect */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-white/5 to-transparent transform -skew-x-12 translate-x-full group-hover:-translate-x-full transition-transform duration-1000"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;

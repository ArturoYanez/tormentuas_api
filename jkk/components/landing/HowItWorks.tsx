
import React from 'react';
import { Rocket, Settings, Banknote } from 'lucide-react';

const steps = [
  {
    icon: Rocket,
    title: 'Regístrate y personaliza',
    description: 'Crea tu cuenta en segundos y define tus objetivos financieros.',
  },
  {
    icon: Settings,
    title: 'Activa estrategias automáticas',
    description: 'Selecciona un algoritmo o arma el tuyo, según tu perfil y metas.',
  },
  {
    icon: Banknote,
    title: 'Ve crecer tu inversión',
    description: 'Monitorea resultados, recibe soporte y retira fondos cuando quieras.',
  },
];

const HowItWorks = () => (
  <section id="como-funciona" className="py-20 md:py-28 bg-black relative overflow-hidden">
    <div className="absolute -top-10 right-0 w-96 h-32 bg-gradient-to-r from-fuchsia-900/20 via-purple-800/10 to-transparent blur-2xl pointer-events-none" />
    <div className="container mx-auto px-4">
      <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-200 via-fuchsia-200 to-purple-300 drop-shadow text-center mb-14 animate-fade-in">
        <span className="inline-block border-b-4 border-blue-400 px-4 pb-2 rounded-lg shadow-lg bg-blue-900/20">¿Cómo funciona?</span>
      </h2>
      <div className="flex flex-col md:flex-row gap-10 justify-center items-center">
        {steps.map((step, i) => (
          <div key={i} className="flex-1 max-w-xs bg-gradient-to-br from-fuchsia-900/25 via-black/80 to-blue-900/30 rounded-3xl border border-fuchsia-700/30 p-8 mx-4 shadow-2xl text-center text-white animate-fade-in" style={{animationDelay: `${i * 170}ms`}}>
            <div className="mx-auto mb-5 bg-gradient-to-br from-fuchsia-700/50 to-blue-700/40 rounded-full w-20 h-20 flex items-center justify-center border-2 border-fuchsia-400/30 shadow-lg shadow-fuchsia-500/10">
              <step.icon className="w-10 h-10 text-fuchsia-300 drop-shadow-lg" />
            </div>
            <h3 className="font-extrabold text-2xl mb-2">{step.title}</h3>
            <p className="text-gray-300/90">{step.description}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default HowItWorks;

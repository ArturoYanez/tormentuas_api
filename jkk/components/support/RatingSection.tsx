
import { Star, Award, Trophy, Crown } from 'lucide-react';
import { useEffect, useState } from 'react';

const useCountUp = (end: number, duration: number = 2000) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      setCount(Math.floor(progress * end));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
};

const RatingSection = () => {
  const resolutionRate = useCountUp(99.8, 2500);
  const responseTime = useCountUp(1.2, 2000);
  const availability = useCountUp(24, 1800);

  return (
    <div className="text-center relative bg-gradient-to-br from-yellow-600/20 via-orange-600/20 to-red-600/20 border-2 border-yellow-400/40 rounded-3xl p-12 backdrop-blur-md shadow-2xl hover:scale-105 transition-all duration-700 group">
      {/* Animated background elements */}
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
      <div className="absolute -top-6 -right-6 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute -bottom-6 -left-6 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10">
        {/* Enhanced star rating */}
        <div className="inline-flex items-center justify-center gap-3 mb-8 group-hover:scale-110 transition-transform duration-500">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="relative">
              <Star 
                className="w-12 h-12 text-yellow-400 fill-current drop-shadow-2xl animate-pulse group-hover:animate-bounce transition-all duration-300" 
                style={{animationDelay: `${i * 0.2}s`}} 
              />
              <div className="absolute inset-0 w-12 h-12 bg-yellow-400/30 rounded-full blur-lg animate-pulse" style={{animationDelay: `${i * 0.2}s`}}></div>
            </div>
          ))}
          <Crown className="w-10 h-10 text-yellow-400 animate-bounce ml-2" />
        </div>

        {/* Enhanced main heading */}
        <h3 className="text-4xl sm:text-5xl font-black text-white mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform duration-300">
          Calificado 4.9/5 por nuestros usuarios VIP
        </h3>
        
        <p className="text-gray-300 text-2xl mb-4 font-semibold">
          Más de <span className="text-yellow-400 font-black">50,000</span> consultas resueltas exitosamente
        </p>

        {/* Premium badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 bg-yellow-600/30 border border-yellow-400/50 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-yellow-400 font-bold">Certificación Premium</span>
          </div>
          <div className="flex items-center gap-2 bg-purple-600/30 border border-purple-400/50 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300">
            <Trophy className="w-5 h-5 text-purple-400" />
            <span className="text-purple-400 font-bold">Mejor Soporte 2024</span>
          </div>
          <div className="flex items-center gap-2 bg-blue-600/30 border border-blue-400/50 rounded-full px-6 py-3 hover:scale-110 transition-all duration-300">
            <Crown className="w-5 h-5 text-blue-400" />
            <span className="text-blue-400 font-bold">Servicio VIP</span>
          </div>
        </div>

        {/* Enhanced stats grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
          <div className="bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-2 border-green-400/50 rounded-2xl p-8 hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl group/stat">
            <div className="text-5xl font-black text-green-400 mb-3 group-hover/stat:animate-bounce">
              {resolutionRate}%
            </div>
            <div className="text-gray-300 text-lg font-semibold mb-2">Casos resueltos</div>
            <div className="w-full h-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full group-hover/stat:animate-pulse"></div>
          </div>

          <div className="bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-2 border-blue-400/50 rounded-2xl p-8 hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl group/stat">
            <div className="text-5xl font-black text-blue-400 mb-3 group-hover/stat:animate-bounce">
              {responseTime}min
            </div>
            <div className="text-gray-300 text-lg font-semibold mb-2">Tiempo respuesta</div>
            <div className="w-full h-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full group-hover/stat:animate-pulse"></div>
          </div>

          <div className="bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-400/50 rounded-2xl p-8 hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl group/stat">
            <div className="text-5xl font-black text-purple-400 mb-3 group-hover/stat:animate-bounce">
              {availability}/7
            </div>
            <div className="text-gray-300 text-lg font-semibold mb-2">Disponibilidad</div>
            <div className="w-full h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full group-hover/stat:animate-pulse"></div>
          </div>
        </div>

        {/* Customer testimonial preview */}
        <div className="mt-12 bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-2xl p-8 hover:scale-105 transition-all duration-300">
          <div className="flex items-center justify-center gap-2 mb-4">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
            ))}
          </div>
          <p className="text-gray-300 text-lg italic mb-4">
            "El mejor soporte que he experimentado. Respuesta inmediata y solución completa en minutos."
          </p>
          <p className="text-blue-400 font-semibold">- Usuario VIP Verificado</p>
        </div>
      </div>
    </div>
  );
};

export default RatingSection;

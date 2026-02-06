
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

const QuickStats = () => {
  const availabilityCount = useCountUp(24, 1500);
  const responseTime = useCountUp(2, 1800);
  const resolutionRate = useCountUp(99.8, 2000);
  const casesResolved = useCountUp(50, 2200);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
      <div className="group bg-gradient-to-br from-green-600/30 to-emerald-600/30 border-2 border-green-400/50 rounded-2xl p-6 text-center backdrop-blur-md hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-green-400/30 cursor-pointer">
        <div className="text-4xl font-black text-white mb-2 group-hover:animate-bounce">
          {availabilityCount}/7
        </div>
        <div className="text-green-400 text-sm font-bold uppercase tracking-wide">Disponibilidad</div>
        <div className="w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full mt-3 group-hover:animate-pulse"></div>
      </div>

      <div className="group bg-gradient-to-br from-blue-600/30 to-cyan-600/30 border-2 border-blue-400/50 rounded-2xl p-6 text-center backdrop-blur-md hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-blue-400/30 cursor-pointer">
        <div className="text-4xl font-black text-white mb-2 group-hover:animate-bounce">
          &lt;{responseTime}min
        </div>
        <div className="text-blue-400 text-sm font-bold uppercase tracking-wide">Tiempo respuesta</div>
        <div className="w-full h-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full mt-3 group-hover:animate-pulse"></div>
      </div>

      <div className="group bg-gradient-to-br from-purple-600/30 to-pink-600/30 border-2 border-purple-400/50 rounded-2xl p-6 text-center backdrop-blur-md hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-purple-400/30 cursor-pointer">
        <div className="text-4xl font-black text-white mb-2 group-hover:animate-bounce">
          {resolutionRate}%
        </div>
        <div className="text-purple-400 text-sm font-bold uppercase tracking-wide">Resolución</div>
        <div className="w-full h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mt-3 group-hover:animate-pulse"></div>
      </div>

      <div className="group bg-gradient-to-br from-yellow-600/30 to-orange-600/30 border-2 border-yellow-400/50 rounded-2xl p-6 text-center backdrop-blur-md hover:scale-110 hover:-translate-y-2 transition-all duration-500 shadow-2xl hover:shadow-yellow-400/30 cursor-pointer">
        <div className="text-4xl font-black text-white mb-2 group-hover:animate-bounce">
          {casesResolved}K+
        </div>
        <div className="text-yellow-400 text-sm font-bold uppercase tracking-wide">Casos resueltos</div>
        <div className="w-full h-1 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full mt-3 group-hover:animate-pulse"></div>
      </div>
    </div>
  );
};

export default QuickStats;

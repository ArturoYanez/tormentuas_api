
import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: "Andrea R.",
    quote:
      "La plataforma me dio seguridad, facilidad y resultados. ¡La mejor decisión para mis finanzas!",
    avatar: "https://randomuser.me/api/portraits/women/65.jpg",
    rating: 5,
  },
  {
    name: "Carlos M.",
    quote:
      "Honestamente pensé que era complicado, pero con Tormentus ganar fue cuestión de clics. La interfaz es bellísima.",
    avatar: "https://randomuser.me/api/portraits/men/51.jpg",
    rating: 5,
  },
  {
    name: "Valeria G.",
    quote:
      "Me encantó el soporte y los análisis automáticos. ¡Lo recomiendo a todos los que buscan libertad financiera!",
    avatar: "https://randomuser.me/api/portraits/women/30.jpg",
    rating: 4,
  },
];

const Testimonials = () => (
  <section id="testimonios" className="py-20 md:py-28 bg-gradient-to-b from-black via-gray-950 to-[#191324] relative overflow-hidden">
    <div className="absolute top-0 left-[-10vw] w-[120vw] h-[300px] bg-gradient-to-r from-fuchsia-900/10 to-blue-900/10 blur-3xl pointer-events-none" />
    <div className="container mx-auto px-4 relative z-10">
      <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-center text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-purple-300 to-gray-400 drop-shadow animate-fade-in mb-14">
        <span className="inline-block border-b-4 border-fuchsia-400 px-4 pb-2 rounded-lg shadow-lg bg-fuchsia-900/30">Testimonios Reales</span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {testimonials.map((item, i) => (
          <div key={i} className="rounded-2xl bg-gradient-to-tr from-fuchsia-900/30 via-purple-900/20 to-blue-900/20 border border-fuchsia-900/40 shadow-xl text-white px-7 py-8 text-center flex flex-col items-center animate-fade-in" style={{ animationDelay: `${i * 100}ms`}}>
            <img src={item.avatar} alt={item.name} className="w-20 h-20 rounded-full border-4 border-fuchsia-400/40 shadow-lg -mt-14 mb-4 bg-black object-cover" />
            <Quote className="w-9 h-9 text-fuchsia-300 mb-3 opacity-75" />
            <p className="text-lg font-medium mb-4 text-gray-200">{item.quote}</p>
            <div className="flex justify-center gap-1 mb-2">
              {[...Array(item.rating)].map((_, j) => (
                <Star key={j} className="w-5 h-5 text-yellow-400" fill="#fde68a"/>
              ))}
            </div>
            <span className="text-fuchsia-200 font-semibold">{item.name}</span>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default Testimonials;

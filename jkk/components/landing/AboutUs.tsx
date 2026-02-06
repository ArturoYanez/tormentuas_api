
import React from 'react';
import { ThumbsUp, ShieldCheck, Clock3, Users2 } from 'lucide-react';

const reasons = [
  {
    icon: ThumbsUp,
    title: "Resultados Probados",
    desc: "Ayudamos a cientos de inversores a lograr sus metas de forma constante."
  },
  {
    icon: ShieldCheck,
    title: "Seguridad Total",
    desc: "Tecnología de cifrado y monitoreo 24/7 para máxima protección."
  },
  {
    icon: Clock3,
    title: "Soporte 24/7",
    desc: "Resuelve todas tus dudas en cualquier momento con expertos reales."
  },
  {
    icon: Users2,
    title: "Comunidad Activa",
    desc: "Aprende junto a otros traders y participa en foros y webinars mensuales."
  }
];

const AboutUs = () => {
    return (
        <section id="about" className="py-20 md:py-28 bg-black overflow-x-clip relative">
            <div className="container mx-auto px-4">
                {/* Por qué elegirnos */}
                <div className="mb-16 animate-fade-in [animation-delay:150ms]">
                  <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-8 bg-clip-text text-transparent bg-gradient-to-br from-fuchsia-200 via-purple-300 to-gray-300 text-center drop-shadow">
                    <span className="inline-block border-b-4 border-fuchsia-300 px-4 pb-2 rounded-lg shadow-lg bg-fuchsia-900/20">¿Por qué elegirnos?</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                    {reasons.map((r, i) => (
                      <div key={i} className="bg-gradient-to-br from-fuchsia-800/40 via-gray-950/70 to-blue-900/40 border border-fuchsia-900/30 px-6 py-8 rounded-2xl flex flex-col items-center shadow-lg animate-fade-in" style={{animationDelay: `${i * 120}ms`}}>
                        <r.icon className="w-10 h-10 text-fuchsia-300 mb-3" />
                        <h4 className="font-bold text-xl mb-2 text-white">{r.title}</h4>
                        <p className="text-gray-300/80 text-center">{r.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* Separador */}
                <div className="w-full h-px bg-gradient-to-r from-fuchsia-900/10 via-fuchsia-500/40 to-blue-900/10 my-16 opacity-80" />
                {/* About text y equipo */}
                <div className="grid md:grid-cols-2 gap-16 items-center">
                    {/* About text */}
                    <div className="text-left animate-fade-in [animation-delay:200ms] z-10">
                        <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-fuchsia-200 via-purple-300 to-gray-300 drop-shadow">
                            <span className="inline-block border-b-4 border-fuchsia-300 px-4 pb-2 rounded-lg shadow-lg bg-fuchsia-900/20">Sobre Nosotros</span>
                        </h2>
                        <p className="text-xl text-gray-200 mb-6 leading-relaxed drop-shadow-sm">
                            En <b className="text-fuchsia-300 font-bold">Tormentus</b>, nuestra misión es desatar tu <span className="text-gradient-animated font-semibold">potencial financiero</span>.
                            Creemos que todos merecen la oportunidad de <span className="text-blue-300 font-bold">construir su riqueza</span>, y proporcionamos la tecnología y el soporte de élite para lograrlo.
                        </p>
                        <p className="text-lg text-gray-300/80 leading-relaxed">
                            Con un equipo de <b className="text-fuchsia-100">veteranos de la industria</b>, obsesionados con la innovación, trabajamos sin descanso para ofrecerte una plataforma que es <span className="text-purple-200 font-bold">un arsenal financiero</span>: segura, intuitiva y devastadoramente potente.<br/>Tu <span className="font-semibold text-blue-200">victoria</span> es nuestra razón de ser.
                        </p>
                    </div>
                    {/* Gradient circle & Image */}
                    <div className="animate-fade-in relative flex justify-center group">
                        <div className="absolute -inset-4 w-auto h-auto rounded-full bg-gradient-to-br from-fuchsia-800/40 via-blue-600/30 to-purple-800/40 blur-3xl z-0 pointer-events-none animate-pulse group-hover:blur-2xl transition-all duration-500" />
                        <img
                            src="https://images.unsplash.com/photo-1605810230434-7631ac76ec81"
                            alt="Nuestro equipo"
                            className="rounded-2xl shadow-2xl shadow-purple-500/30 border-4 border-fuchsia-600/30 z-10 w-full object-cover mx-auto transform group-hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
};

export default AboutUs;

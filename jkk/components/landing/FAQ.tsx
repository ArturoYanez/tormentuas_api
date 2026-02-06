
import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: "¿Necesito experiencia previa para usar Tormentus?",
    a: "¡No! Nuestra plataforma es ideal tanto para principiantes como expertos. Te guiamos todo el camino.",
  },
  {
    q: "¿Cómo retiro mis ganancias?",
    a: "Puedes retirar fondos en cualquier momento desde tu panel, directo a tu cuenta bancaria.",
  },
  {
    q: "¿Cobran comisiones ocultas?",
    a: "No. Todas las comisiones son transparentes y visibles antes de invertir.",
  },
  {
    q: "¿Es seguro invertir en Tormentus?",
    a: "Sí, utilizamos cifrado avanzado y contamos con auditoría y gestión de riesgos.",  
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="faq" className="py-20 bg-gradient-to-tr from-black to-gray-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-purple-300 to-blue-200 text-center mb-12">
          <span className="inline-block border-b-4 border-purple-400 px-4 pb-2 rounded-lg shadow bg-purple-900/10">Preguntas Frecuentes</span>
        </h2>
        <div className="max-w-2xl mx-auto space-y-5">
          {faqs.map((faq, i) => (
            <div key={i} className="rounded-xl bg-black/80 border border-fuchsia-800/30 shadow-md">
              <button
                type="button"
                className="w-full flex justify-between items-center px-6 py-4 text-left text-fuchsia-200 font-semibold text-lg focus:outline-none"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-6 h-6 transition-transform ${open === i ? 'rotate-180' : ''}`} />
              </button>
              <div
                className={`px-6 pb-4 transition-all text-gray-300/90 text-base ${open === i ? 'max-h-52 opacity-100' : 'max-h-0 opacity-0 overflow-hidden'} duration-300`}
              >
                {faq.a}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;

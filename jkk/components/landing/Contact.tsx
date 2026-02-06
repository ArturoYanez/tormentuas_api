import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Contact = () => {
  return (
    <section id="contact" className="py-20 md:py-28 bg-black">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-fuchsia-300 via-purple-300 to-blue-200 drop-shadow-[0_3px_10px_rgba(150,85,230,0.13)] animate-fade-in">
            Contáctanos
          </h2>
          <p className="text-lg text-purple-200 mt-2 font-medium animate-fade-in [animation-delay:90ms]">
            ¿Tienes preguntas? Estamos aquí para ayudarte.
          </p>
        </div>
        <div className="max-w-2xl mx-auto p-[1px] bg-gradient-to-br from-purple-500/70 via-transparent to-violet-600/70 rounded-lg">
          <div className="bg-black/80 backdrop-blur-sm p-8 rounded-[7px] w-full h-full">
            <form className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-gray-300">Nombre</Label>
                  <Input id="name" placeholder="Tu nombre" className="bg-gray-800 border-gray-700 text-white" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-300">Email</Label>
                  <Input id="email" type="email" placeholder="tu@email.com" className="bg-gray-800 border-gray-700 text-white" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="message" className="text-gray-300">Mensaje</Label>
                <textarea
                  id="message"
                  placeholder="Escribe tu mensaje aquí..."
                  rows={5}
                  className="flex w-full rounded-md border bg-gray-800 border-gray-700 px-3 py-2 text-base ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm text-white"
                />
              </div>
              <div className="text-center">
                <Button type="submit" size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20">Enviar Mensaje</Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;

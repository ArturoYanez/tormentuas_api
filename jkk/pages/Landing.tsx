import React from 'react';
import Header from '@/components/landing/Header';
import Hero from '@/components/landing/Hero';
import Services from '@/components/landing/Services';
import Features from '@/components/landing/Features';
import HowItWorks from '@/components/landing/HowItWorks';
import Testimonials from '@/components/landing/Testimonials';
import AboutUs from '@/components/landing/AboutUs';
import FAQ from '@/components/landing/FAQ';
import MiniCTA from '@/components/landing/MiniCTA';
import Footer from '@/components/landing/Footer';
import ExampleApiUsage from "@/components/ExampleApiUsage";

const Landing = () => {
  return (
    <div className="bg-black text-white antialiased overflow-x-hidden">
      <Header />
      <main>
        <Hero />
        <Services />
        <Features />
        <HowItWorks />
        <Testimonials />
        <AboutUs />
        <FAQ />
        <MiniCTA />
        <ExampleApiUsage />
      </main>
      <Footer />
    </div>
  );
};

export default Landing;

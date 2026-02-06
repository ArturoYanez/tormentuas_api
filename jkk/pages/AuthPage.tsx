
import React, { useState } from 'react';
import { CloudLightning, Apple, Facebook, CircleUser } from 'lucide-react';
import { Link } from 'react-router-dom';
import LoginForm from "@/components/auth/LoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm"; // Import new component

const SocialButton = ({
  children,
  onClick,
  className,
  ariaLabel
}: {
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
  ariaLabel?: string;
}) => (
  <button
    className={`flex items-center justify-center w-14 h-14 rounded-full focus:outline-none focus:ring-2 focus:ring-primary transition-all hover:scale-110 shadow-lg ${className}`}
    onClick={onClick}
    aria-label={ariaLabel}
    type="button"
  >
    {children}
  </button>
);

const AuthPage = () => {
  const [mode, setMode] = useState<"login" | "register" | "forgot-password">("login");

  const handleLoginSuccess = (data: any) => {
    console.log("Login exitoso:", data);
    // Aquí podrías redirigir al usuario o actualizar el estado global
  };

  const handleRegisterSuccess = (data: any) => {
    console.log("Registro exitoso:", data);
    // Automáticamente cambiar a login después del registro exitoso
    setMode("login");
  };

  const handleForgotPasswordSuccess = () => {
    // After success, switch back to login
    setMode("login");
  };
  
  const handleSocialLogin = (provider: string) => {
    console.log(`Iniciar sesión con ${provider}`);
    // Aquí implementarías la lógica de autenticación social
  };

  const titles = {
    login: "¡Bienvenido de nuevo!",
    register: "Crea tu Legado",
    "forgot-password": "Recupera tu Acceso"
  };

  const subtitles = {
    login: "Accede para dominar los mercados",
    register: "Comienza tu aventura financiera hoy",
    "forgot-password": "Te enviaremos un enlace para resetear tu contraseña"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-purple-950 to-black text-white flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Logo */}
      <div className="absolute top-8 left-8 z-20">
        <Link to="/" className="flex items-center gap-2 text-white hover:text-primary transition-colors">
          <CloudLightning className="h-6 w-6 text-primary animate-pulse" />
          <span className="font-extrabold text-xl tracking-wide bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent drop-shadow-glow">
            Tormentus
          </span>
        </Link>
      </div>

      {/* Fondo visual */}
      <div className="absolute inset-0 -z-20 bg-black">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=2020&auto=format&fit=crop')] bg-cover bg-center opacity-15 blur-sm"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 -z-10 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-purple-800/40 via-fuchsia-900/30 to-blue-800/40 blur-3xl animate-pulse" />

      {/* Card principal */}
      <div className="w-full max-w-md z-10 rounded-3xl shadow-2xl shadow-blue-900/30 bg-gradient-to-br from-[#1a113c]/90 via-black/90 to-[#0e0638]/90 border border-violet-700/60 px-8 py-12 backdrop-blur-lg animate-fade-in drop-shadow-xl">
        <div className="text-center mb-8">
          <h2 className="text-4xl md:text-5xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-purple-200 via-pink-300 to-blue-300 drop-shadow-[0_2px_2px_rgba(134,88,223,0.4)] animate-fade-in">
            {titles[mode]}
          </h2>
          <p className="text-md md:text-lg text-purple-200 opacity-90 mt-3 animate-fade-in [animation-delay:100ms]">
            {subtitles[mode]}
          </p>
        </div>

        {/* Formulario */}
        <div className="w-full">
          {mode === "login" ? (
            <LoginForm
              onSuccess={handleLoginSuccess}
              onSwitchToRegister={() => setMode("register")}
              onSwitchToForgotPassword={() => setMode("forgot-password")}
            />
          ) : mode === "register" ? (
            <RegisterForm
              onSuccess={handleRegisterSuccess}
              onSwitchToLogin={() => setMode("login")}
            />
          ) : (
            <ForgotPasswordForm
              onSuccess={handleForgotPasswordSuccess}
              onSwitchToLogin={() => setMode("login")}
            />
          )}

          {mode !== "forgot-password" && (
            <>
              {/* Separador */}
              <div className="flex items-center my-7">
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-700 to-transparent opacity-70"></span>
                <span className="uppercase text-xs text-purple-300 px-3 tracking-widest font-bold opacity-90">o</span>
                <span className="flex-1 h-px bg-gradient-to-r from-transparent via-purple-700 to-transparent opacity-70"></span>
              </div>

              {/* Botones sociales */}
              <div className="flex justify-center gap-6 mt-2 animate-scale-in">
                <SocialButton
                  ariaLabel="Iniciar con Google"
                  className="bg-white/95 hover:bg-white text-gray-800"
                  onClick={() => handleSocialLogin('Google')}
                >
                  <CircleUser size={30} />
                </SocialButton>
                <SocialButton
                  ariaLabel="Iniciar con Facebook"
                  className="bg-[#1877F2] hover:bg-[#1452c6] text-white"
                  onClick={() => handleSocialLogin('Facebook')}
                >
                  <Facebook size={30} />
                </SocialButton>
                <SocialButton
                  ariaLabel="Iniciar con Apple"
                  className="bg-black hover:bg-gray-900 text-white border-2 border-gray-700"
                  onClick={() => handleSocialLogin('Apple')}
                >
                  <Apple size={30} />
                </SocialButton>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthPage;


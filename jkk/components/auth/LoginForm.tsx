
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, Eye, EyeOff, Loader2, LogIn, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido." }),
  password: z.string().min(1, { message: "La contraseña es obligatoria." }),
});

type LoginValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onSuccess?: (data: LoginValues) => void;
  onSwitchToRegister?: () => void;
  onSwitchToForgotPassword?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, onSwitchToRegister, onSwitchToForgotPassword }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: LoginValues) {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log("Login exitoso:", values);
      toast({
        title: "¡Bienvenido! ✨",
        description: "Has iniciado sesión correctamente.",
      });
      
      onSuccess?.(values);
    } catch (error) {
      toast({
        title: "Error",
        description: "Credenciales incorrectas. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="email" className="text-purple-200 font-semibold flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" />
            Correo electrónico
          </Label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm transition-all duration-300 group-hover:blur-none group-focus-within:blur-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors duration-300 group-hover:text-purple-300 group-focus-within:text-purple-300" />
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                autoComplete="email"
                className="bg-gray-900/70 backdrop-blur-sm text-white border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 pl-12 h-14 text-base rounded-xl transition-all duration-300 hover:bg-gray-800/70 focus:bg-gray-800/80"
                {...form.register("email")}
              />
            </div>
          </div>
          {form.formState.errors.email && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {form.formState.errors.email.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="password" className="text-purple-200 font-semibold flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" />
            Contraseña
          </Label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm transition-all duration-300 group-hover:blur-none group-focus-within:blur-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors duration-300 group-hover:text-purple-300 group-focus-within:text-purple-300" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                autoComplete="current-password"
                className="bg-gray-900/70 backdrop-blur-sm text-white border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 pl-12 pr-14 h-14 text-base rounded-xl transition-all duration-300 hover:bg-gray-800/70 focus:bg-gray-800/80"
                {...form.register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-200 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-purple-500/20"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {form.formState.errors.password && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center text-purple-300 cursor-pointer group transition-colors duration-300 hover:text-purple-200">
            <input 
              type="checkbox" 
              className="mr-3 rounded border-purple-500 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-300" 
            />
            <span className="font-medium">Recordarme</span>
          </label>
          <button
            type="button"
            onClick={onSwitchToForgotPassword}
            className="text-purple-400 hover:text-pink-400 underline underline-offset-2 transition-all duration-300 font-semibold hover:scale-105 transform"
          >
            ¿Olvidaste tu contraseña?
          </button>
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-500 hover:from-purple-700 hover:via-violet-700 hover:to-indigo-600 text-white font-bold shadow-2xl h-14 transition-all duration-500 transform hover:scale-105 hover:shadow-purple-500/30 relative group overflow-hidden rounded-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-3 animate-spin" />
              Iniciando sesión...
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-3" />
              Iniciar sesión
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-purple-300">
        <span className="font-medium">¿No tienes una cuenta?</span>{" "}
        <button
          onClick={onSwitchToRegister}
          className="text-purple-300 underline underline-offset-2 font-bold hover:text-pink-400 transition-all duration-300 hover:scale-105 transform inline-block"
        >
          Regístrate gratis ✨
        </button>
      </div>
    </div>
  );
};

export default LoginForm;

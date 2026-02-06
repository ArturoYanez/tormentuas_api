
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Mail, Lock, Eye, EyeOff, Loader2, CheckCircle, Sparkles, Shield, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const registerSchema = z.object({
  name: z.string().min(2, { message: "Ingresa tu nombre completo." }),
  email: z.string().email({ message: "Correo inválido." }),
  password: z.string().min(8, { message: "Mínimo 8 caracteres." }),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: "Debes aceptar los términos y condiciones."
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

type RegisterValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onSuccess?: (data: RegisterValues) => void;
  onSwitchToLogin?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: RegisterValues) {
    setIsLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Registro exitoso:", values);
      toast({
        title: "¡Cuenta creada! 🎉",
        description: "Tu cuenta ha sido creada exitosamente.",
      });
      
      onSuccess?.(values);
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo crear la cuenta. Inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(form.watch("password") || "");
  const strengthColors = ["bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-green-500"];
  const strengthTexts = ["Muy débil", "Débil", "Media", "Fuerte"];

  return (
    <div className="space-y-8">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="name" className="text-purple-200 font-semibold flex items-center gap-2">
            <User className="w-4 h-4 text-purple-400" />
            Nombre completo
          </Label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm transition-all duration-300 group-hover:blur-none group-focus-within:blur-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors duration-300 group-hover:text-purple-300 group-focus-within:text-purple-300" />
              <Input
                id="name"
                placeholder="Tu nombre"
                autoComplete="name"
                className="bg-gray-900/70 backdrop-blur-sm text-white border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 pl-12 h-14 text-base rounded-xl transition-all duration-300 hover:bg-gray-800/70 focus:bg-gray-800/80"
                {...form.register("name")}
              />
            </div>
          </div>
          {form.formState.errors.name && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

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
            <Shield className="w-4 h-4 text-purple-400" />
            Contraseña
          </Label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm transition-all duration-300 group-hover:blur-none group-focus-within:blur-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors duration-300 group-hover:text-purple-300 group-focus-within:text-purple-300" />
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Crea una contraseña segura"
                autoComplete="new-password"
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
          {form.watch("password") && (
            <div className="space-y-3 animate-fade-in">
              <div className="flex space-x-2">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className={`h-2 w-full rounded-full transition-all duration-300 ${
                      i < passwordStrength ? strengthColors[passwordStrength - 1] : "bg-gray-600"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-purple-300 flex items-center gap-2">
                <Star className="w-3 h-3" />
                Seguridad: {passwordStrength > 0 ? strengthTexts[passwordStrength - 1] : "Muy débil"}
              </p>
            </div>
          )}
          {form.formState.errors.password && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {form.formState.errors.password.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <Label htmlFor="confirmPassword" className="text-purple-200 font-semibold flex items-center gap-2">
            <Shield className="w-4 h-4 text-purple-400" />
            Confirmar contraseña
          </Label>
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl blur-sm transition-all duration-300 group-hover:blur-none group-focus-within:blur-none opacity-0 group-hover:opacity-100 group-focus-within:opacity-100" />
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5 transition-colors duration-300 group-hover:text-purple-300 group-focus-within:text-purple-300" />
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirma tu contraseña"
                autoComplete="new-password"
                className="bg-gray-900/70 backdrop-blur-sm text-white border-purple-500/30 focus:border-purple-400 focus:ring-2 focus:ring-purple-500/20 pl-12 pr-14 h-14 text-base rounded-xl transition-all duration-300 hover:bg-gray-800/70 focus:bg-gray-800/80"
                {...form.register("confirmPassword")}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-200 transition-all duration-300 hover:scale-110 p-1 rounded-lg hover:bg-purple-500/20"
              >
                {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {form.formState.errors.confirmPassword && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {form.formState.errors.confirmPassword.message}
            </p>
          )}
        </div>

        <div className="space-y-3">
          <label className="flex items-start text-sm text-purple-300 cursor-pointer group transition-colors duration-300 hover:text-purple-200">
            <input
              type="checkbox"
              className="mr-4 mt-1 rounded border-purple-500 bg-gray-800 text-purple-500 focus:ring-purple-500 focus:ring-offset-0 transition-all duration-300"
              {...form.register("acceptTerms")}
            />
            <span className="font-medium">
              Acepto los{" "}
              <button type="button" className="text-purple-400 underline hover:text-pink-400 transition-colors font-semibold">
                términos y condiciones
              </button>{" "}
              y la{" "}
              <button type="button" className="text-purple-400 underline hover:text-pink-400 transition-colors font-semibold">
                política de privacidad
              </button>
            </span>
          </label>
          {form.formState.errors.acceptTerms && (
            <p className="text-red-400 text-sm flex items-center gap-2 animate-fade-in">
              <Sparkles className="w-4 h-4" />
              {form.formState.errors.acceptTerms.message}
            </p>
          )}
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
              Creando cuenta...
            </>
          ) : (
            <>
              <CheckCircle className="w-5 h-5 mr-3" />
              Crear cuenta
            </>
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-purple-300">
        <span className="font-medium">¿Ya tienes una cuenta?</span>{" "}
        <button
          onClick={onSwitchToLogin}
          className="text-purple-300 underline underline-offset-2 font-bold hover:text-pink-400 transition-all duration-300 hover:scale-105 transform inline-block"
        >
          Inicia sesión ✨
        </button>
      </div>
    </div>
  );
};

export default RegisterForm;

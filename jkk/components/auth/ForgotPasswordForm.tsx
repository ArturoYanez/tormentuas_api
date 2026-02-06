
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Ingresa un correo válido." }),
});

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess?: () => void;
  onSwitchToLogin?: () => void;
}

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSuccess, onSwitchToLogin }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    setIsLoading(true);
    try {
      // Simular envío de email
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      console.log("Solicitud de reseteo para:", values.email);
      toast({
        title: "¡Revisa tu correo!",
        description: "Si existe una cuenta con ese email, hemos enviado un enlace para resetear tu contraseña.",
        variant: "default",
      });
      
      onSuccess?.();
    } catch (error) {
      toast({
        title: "Error",
        description: "Ocurrió un error. Por favor, inténtalo de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-purple-200">
            Correo electrónico
          </Label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-purple-400 w-5 h-5" />
            <Input
              id="email"
              type="email"
              placeholder="tu@email.com"
              autoComplete="email"
              className="bg-gray-800/60 text-white border-purple-500/50 focus:border-purple-400 pl-12 h-12 text-base"
              {...form.register("email")}
            />
          </div>
          {form.formState.errors.email && (
            <p className="text-red-400 text-sm">{form.formState.errors.email.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 via-violet-600 to-indigo-500 hover:from-purple-700 hover:to-indigo-600 text-white font-semibold shadow-lg h-12 transition-all duration-300 transform hover:scale-105"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Enviando...
            </>
          ) : (
            "Enviar enlace de reseteo"
          )}
        </Button>
      </form>

      <div className="text-center text-sm text-purple-300">
        <button
          onClick={onSwitchToLogin}
          className="text-purple-400 underline-offset-2 font-semibold hover:text-pink-400 transition-colors flex items-center justify-center w-full gap-2 group"
        >
          <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
          Volver a Iniciar Sesión
        </button>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;


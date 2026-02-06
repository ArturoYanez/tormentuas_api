
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Mail } from "lucide-react";
import { supportCategories } from "./constants";

const emailFormSchema = z.object({
  email: z.string({ required_error: "El email es obligatorio."}).email({ message: "Por favor, introduce un email válido." }),
  subject: z.string({ required_error: "El asunto es obligatorio."}).min(5, {
    message: "El asunto debe tener al menos 5 caracteres.",
  }),
  category: z.string({ required_error: "La categoría es obligatoria."}),
  description: z.string({ required_error: "La descripción es obligatoria."}).min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
});

export type EmailFormValues = z.infer<typeof emailFormSchema>;

interface EmailFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: EmailFormValues) => void;
}

const EmailFormModal = ({ open, onOpenChange, onSubmit }: EmailFormModalProps) => {
  const form = useForm<EmailFormValues>({
    resolver: zodResolver(emailFormSchema),
    defaultValues: {
      email: "",
      subject: "",
      category: "",
      description: "",
    },
  });

  const handleSubmit = (values: EmailFormValues) => {
    onSubmit(values);
    form.reset();
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg bg-gradient-to-br from-[#1e2139] to-[#2a2d47] border-gray-600/50 text-white">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-xl">
            <Mail className="w-6 h-6 text-green-400" />
            Crear Ticket de Soporte
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-gray-400 pt-1">
            Completa el formulario y te responderemos en menos de 2 horas
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4 pt-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Email de contacto</FormLabel>
                  <FormControl>
                    <Input placeholder="tu@email.com" {...field} className="bg-[#131722] border-gray-600 text-white focus-visible:ring-green-500"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Asunto</FormLabel>
                  <FormControl>
                    <Input placeholder="Describe brevemente tu consulta" {...field} className="bg-[#131722] border-gray-600 text-white focus-visible:ring-green-500"/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Categoría</FormLabel>
                  <FormControl>
                    <select {...field} className="w-full bg-[#131722] border border-gray-600 text-white rounded-md px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent">
                      <option value="">Selecciona una categoría</option>
                      {supportCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.icon} {category.name}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-white">Descripción detallada</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe tu consulta o problema en detalle. Incluye cualquier información relevante que pueda ayudarnos a brindarte la mejor asistencia."
                      className="bg-[#131722] border-gray-600 text-white min-h-32 focus-visible:ring-green-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 font-semibold py-3">
              🎫 Crear Ticket de Soporte
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default EmailFormModal;

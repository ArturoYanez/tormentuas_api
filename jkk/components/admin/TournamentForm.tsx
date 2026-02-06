
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Trophy, Calendar, DollarSign } from 'lucide-react';

const tournamentFormSchema = z.object({
  name: z.string().min(5, { message: 'El nombre debe tener al menos 5 caracteres.' }),
  type: z.string(),
  prize: z.coerce.number().min(1, { message: 'El premio debe ser mayor que cero.' }),
  entryFee: z.coerce.number().min(0, { message: 'La entrada no puede ser negativa.' }),
  startTime: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: 'Por favor, introduce una fecha de inicio válida.' }),
  endTime: z.string().refine((val) => val && !isNaN(Date.parse(val)), { message: 'Por favor, introduce una fecha de fin válida.' }),
});

export type TournamentFormValues = z.infer<typeof tournamentFormSchema>;

interface TournamentFormProps {
  onSubmit: (data: TournamentFormValues) => void;
}

export const TournamentForm: React.FC<TournamentFormProps> = ({ onSubmit }) => {
  const form = useForm<TournamentFormValues>({
    resolver: zodResolver(tournamentFormSchema),
    defaultValues: {
      name: '',
      type: 'Daily',
      prize: 0,
      entryFee: 0,
      startTime: '',
      endTime: '',
    },
  });

  const handleFormSubmit = (data: TournamentFormValues) => {
    onSubmit(data);
    form.reset();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Nombre del Torneo</FormLabel>
              <FormControl>
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input {...field} className="bg-gray-900/50 border-gray-700 text-white pl-10" placeholder="Ej: Torneo Semanal BTC/USD" />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-gray-300">Tipo de Torneo</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger className="bg-gray-900/50 border-gray-700 text-white">
                    <SelectValue placeholder="Selecciona un tipo" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent className="bg-gray-800 border-gray-700 text-white">
                  <SelectItem value="Daily">Diario</SelectItem>
                  <SelectItem value="Weekly">Semanal</SelectItem>
                  <SelectItem value="Monthly">Mensual</SelectItem>
                  <SelectItem value="Special">Especial</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="prize"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Premio (€)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input {...field} type="number" step="0.01" className="bg-gray-900/50 border-gray-700 text-white pl-10" placeholder="5000" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="entryFee"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Entrada (€)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input {...field} type="number" step="0.01" className="bg-gray-900/50 border-gray-700 text-white pl-10" placeholder="50" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Inicio</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input {...field} type="datetime-local" className="bg-gray-900/50 border-gray-700 text-white pl-10 calendar-picker-indicator-invert" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-gray-300">Fin</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input {...field} type="datetime-local" className="bg-gray-900/50 border-gray-700 text-white pl-10 calendar-picker-indicator-invert" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 transition-all duration-300">
          Crear Torneo
        </Button>
      </form>
    </Form>
  );
};

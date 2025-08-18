"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, addDays } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarDays, Clock, MapPin, Users, Euro, User } from "lucide-react";

import { useCreateMatch } from "@/lib/queries";
import {
  createMatchSchema,
  formatMatchData,
  type CreateMatchFormData,
} from "@/lib/validations/match";
import { toast } from "sonner";

export function CreateMatchForm() {
  const router = useRouter();
  const createMatch = useCreateMatch();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(createMatchSchema),
    mode: "onChange" as const,
    defaultValues: {
      location: "",
      capacity: 18,
      match_type: "friendly" as const,
      is_private: false,
      date: format(addDays(new Date(), 1), "yyyy-MM-dd"), // Tomorrow
      start_time: "20:00", // 8 PM default
      duration: 1.5,
      total_cost: undefined,
      renter_name: "",
      renter_player_id: undefined,
      description: "",
    },
  });

  const onSubmit = async (data: CreateMatchFormData) => {
    setIsSubmitting(true);
    try {
      const matchData = formatMatchData(data);

      createMatch.mutate(matchData, {
        onSuccess: (result) => {
          toast.success("¡Partido creado con éxito!");
          // Redirect to the match detail page
          if (result?.id) {
            router.push(`/matches/${result.id}`);
          }
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Error al crear el partido"
          );
        },
        onSettled: () => {
          setIsSubmitting(false);
        },
      });
    } catch (error) {
      console.error("Form submission error:", error);
      toast.error("Error al procesar el formulario");
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CalendarDays className="h-5 w-5" />
          Crear Nuevo Partido
        </CardTitle>
        <CardDescription>
          Completa la información para programar un nuevo partido de fútbol
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Basic Info Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información Básica</h3>

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Ubicación
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Ej: Campo Municipal de Teruel"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="capacity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Capacidad
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="10"
                          max="30"
                          {...field}
                          onChange={(e) =>
                            field.onChange(parseInt(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Número máximo de jugadores (10-30)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="match_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Partido</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecciona el tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="friendly">Amistoso</SelectItem>
                          <SelectItem value="training">
                            Entrenamiento
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription className="opacity-0">
                        Modalidad del encuentro
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="is_private"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Partido Privado</FormLabel>
                      <FormDescription>
                        Los detalles de ubicación solo serán visibles para
                        administradores
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            {/* Date & Time Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Fecha y Hora</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="date"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <CalendarDays className="h-4 w-4" />
                        Fecha
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                          min={format(new Date(), "yyyy-MM-dd")}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="start_time"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Clock className="h-4 w-4" />
                        Hora de Inicio
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="duration"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Duración (horas)</FormLabel>
                      <Select
                        onValueChange={(value) =>
                          field.onChange(parseFloat(value))
                        }
                        defaultValue={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Duración" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">1 hora</SelectItem>
                          <SelectItem value="1.5">1.5 horas</SelectItem>
                          <SelectItem value="2">2 horas</SelectItem>
                          <SelectItem value="2.5">2.5 horas</SelectItem>
                          <SelectItem value="3">3 horas</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Cost & Organizer Section */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Costo y Organizador</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="total_cost"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <Euro className="h-4 w-4" />
                        Costo Total (opcional)
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="500"
                          step="0.01"
                          placeholder="0.00"
                          value={field.value ?? ""}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value
                                ? parseFloat(e.target.value)
                                : undefined
                            )
                          }
                        />
                      </FormControl>
                      <FormDescription>
                        Costo total del alquiler del campo (en euros)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="renter_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Nombre del Organizador
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Nombre de quien organiza"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Persona responsable del partido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Optional Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción (opcional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Información adicional sobre el partido..."
                      className="resize-none"
                      value={field.value ?? ""}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>
                    Detalles adicionales, reglas especiales, etc.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                className="cursor-pointer"
              >
                Cancelar
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting || createMatch.isPending}
                className="cursor-pointer flex-1"
              >
                {isSubmitting || createMatch.isPending
                  ? "Creando..."
                  : "Crear Partido"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

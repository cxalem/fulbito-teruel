"use client";

import { useState } from "react";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User } from "@supabase/supabase-js";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { UserPlus, Search } from "lucide-react";

import { useCreateSignup, useSearchPlayers } from "@/lib/queries";
import {
  getUserAvatar,
  getUserDisplayName,
  getUserInitials,
} from "@/lib/utils/user";
import { 
  getStoredDisplayName, 
  setStoredDisplayName,
  getStoredAvatarUrl,
  setStoredAvatarUrl 
} from "@/lib/utils/localStorage";
import { AvatarUpload } from "@/components/avatar-upload";
import { toast } from "sonner";

const signupSchema = z
  .object({
    position: z.enum(["gk", "lb", "cb", "rb", "cm", "st1", "st2"]).optional(),
    player_option: z.enum(["current_user", "new", "existing"]),
    // For new players
    display_name: z.string().optional(),
    // For existing players
    existing_player_id: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.player_option === "new") {
        return data.display_name && data.display_name.trim().length >= 2;
      }
      if (data.player_option === "existing") {
        return data.existing_player_id && data.existing_player_id.length > 0;
      }
      // current_user option doesn't need additional validation
      return data.player_option === "current_user";
    },
    {
      message: "Completa la información del jugador",
      path: ["display_name"],
    }
  );

type SignupFormData = z.infer<typeof signupSchema>;

interface SignupFormProps {
  matchId: string;
  team: "white" | "black";
  user: User | null;
  onSuccess: () => void;
  onCancel: () => void;
}

const POSITION_OPTIONS = [
  { value: "gk", label: "Portero 🥅" },
  { value: "lb", label: "Lateral Izquierdo 🛡️" },
  { value: "cb", label: "Central 🛡️" },
  { value: "rb", label: "Lateral Derecho 🛡️" },
  { value: "cm", label: "Centrocampista ⚽" },
  { value: "st1", label: "Delantero 1 ⚡" },
  { value: "st2", label: "Delantero 2 ⚡" },
] as const;

export function SignupForm({
  matchId,
  team,
  user,
  onSuccess,
  onCancel,
}: SignupFormProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const createSignup = useCreateSignup();

  const { data: searchResults, isLoading: searchLoading } = useSearchPlayers(
    searchTerm,
    {
      enabled: searchTerm.length >= 2,
    }
  );

  // Determine initial player option and display name
  const initialPlayerOption = user ? "current_user" : "new";
  const initialDisplayName = user ? getUserDisplayName(user) : (getStoredDisplayName() || "");
  const initialAvatarUrl = user ? getUserAvatar(user) : getStoredAvatarUrl();
  const userInitials = getUserInitials(user);

  const form = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      position: "cm",
      player_option: initialPlayerOption,
      display_name: initialDisplayName,
      existing_player_id: "",
    },
  });

  // Initialize avatar URL state
  React.useEffect(() => {
    setAvatarUrl(initialAvatarUrl || null);
  }, [initialAvatarUrl]);

  const playerOption = form.watch("player_option");

  const onSubmit = async (data: SignupFormData) => {
    // Store display name and avatar for anonymous users
    if (!user && data.player_option === "new" && data.display_name) {
      setStoredDisplayName(data.display_name);
      if (avatarUrl) {
        setStoredAvatarUrl(avatarUrl);
      }
    }

    const signupData = {
      match_id: matchId,
      team: team,
      position: data.position,
      ...(data.player_option === "current_user"
        ? { player_name: initialDisplayName }
        : data.player_option === "new"
        ? { player_name: data.display_name! }
        : { player_id: data.existing_player_id! }),
    };

    createSignup.mutate(signupData, {
      onSuccess: () => {
        toast.success("¡Te has apuntado al partido con éxito!");
        onSuccess();
      },
      onError: (error) => {
        toast.error(
          error instanceof Error
            ? error.message
            : "Error al apuntarse al partido"
        );
      },
    });
  };

  const teamColor =
    team === "white"
      ? "bg-zinc-100"
      : "bg-zinc-900 dark:bg-zinc-700";
  const teamName = team === "white" ? "Equipo Blanco" : "Equipo Negro";

  return (
    <div className="flex flex-col gap-6">
      {/* Team Display */}
      <div className="flex items-center justify-center gap-2 p-4 rounded-lg border bg-muted/50 w-fit md:w-full">
        <div className={`w-4 h-4 rounded-full ${teamColor} border`} />
        <span className="font-medium">Apuntándose al {teamName}</span>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 overflow-x-hidden">
          {/* Position Selection */}
          <FormField
            control={form.control}
            name="position"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Posición</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tu posición" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {POSITION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Player Selection */}
          <FormField
            control={form.control}
            name="player_option"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Información del jugador</FormLabel>
                <FormControl>
                  <Tabs value={field.value} onValueChange={field.onChange}>
                    <div className="w-64 md:w-full overflow-x-scroll md:overflow-auto">
                      <TabsList
                        className={`flex md:max-w-full ${
                          user ? "grid-cols-3 w-96 overflow-x-scroll md:overflow-auto" : "grid-cols-2"
                        }`}
                      >
                        {user && (
                          <TabsTrigger
                            value="current_user"
                            className="cursor-pointer"
                          >
                            <Avatar className="h-4 w-4 mr-2">
                              <AvatarImage src={initialAvatarUrl || undefined} />
                              <AvatarFallback className="text-xs">
                                {userInitials}
                              </AvatarFallback>
                            </Avatar>
                            Yo
                          </TabsTrigger>
                        )}
                        <TabsTrigger value="new" className="cursor-pointer">
                          <UserPlus className="h-4 w-4 mr-2" />
                          Nuevo jugador
                        </TabsTrigger>
                        <TabsTrigger
                          value="existing"
                          className="cursor-pointer"
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Jugador existente
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    {user && (
                      <TabsContent
                        value="current_user"
                        className="space-y-4 mt-4"
                      >
                        <Card className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={initialAvatarUrl || undefined} />
                              <AvatarFallback>{userInitials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">
                                {initialDisplayName}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </Card>
                      </TabsContent>
                    )}

                    <TabsContent value="new" className="space-y-4 mt-4">
                      <FormField
                        control={form.control}
                        name="display_name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nombre del jugador</FormLabel>
                            <FormControl>
                              <Input placeholder="Ej: Juan Pérez" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      {/* Avatar Upload for new players */}
                      <div>
                        <Label>Avatar (opcional)</Label>
                        <div className="mt-2">
                          <AvatarUpload
                            currentAvatar={avatarUrl}
                            displayName={form.watch("display_name") || "Jugador"}
                            onAvatarChange={setAvatarUrl}
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="existing" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="search">Buscar jugador</Label>
                          <Input
                            id="search"
                            placeholder="Escribe el nombre del jugador..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                          />
                        </div>

                        {searchTerm.length >= 2 && (
                          <FormField
                            control={form.control}
                            name="existing_player_id"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Seleccionar jugador</FormLabel>
                                <FormControl>
                                  <Select
                                    onValueChange={field.onChange}
                                    value={field.value}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Selecciona un jugador" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {searchLoading ? (
                                        <SelectItem value="loading" disabled>
                                          Buscando...
                                        </SelectItem>
                                      ) : searchResults &&
                                        searchResults.length > 0 ? (
                                        searchResults.map((player) => (
                                          <SelectItem
                                            key={player.id}
                                            value={player.id}
                                          >
                                            {player.display_name}
                                          </SelectItem>
                                        ))
                                      ) : (
                                        <SelectItem value="no-results" disabled>
                                          No se encontraron jugadores
                                        </SelectItem>
                                      )}
                                    </SelectContent>
                                  </Select>
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Summary */}
          <Card className="bg-muted/50">
            <CardHeader>
              <CardTitle className="text-lg">Resumen</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Equipo:</span>
                  <span className="font-medium">{teamName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Posición:</span>
                  <span className="font-medium">
                    {
                      POSITION_OPTIONS.find(
                        (p) => p.value === form.watch("position")
                      )?.label
                    }
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Jugador:</span>
                  <span className="font-medium">
                    {playerOption === "current_user"
                      ? initialDisplayName
                      : playerOption === "new"
                      ? form.watch("display_name") || "Nuevo jugador"
                      : searchResults?.find(
                          (p) => p.id === form.watch("existing_player_id")
                        )?.display_name || "Seleccionar jugador"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              className="cursor-pointer flex-1"
            >
              Cancelar
            </Button>

            <Button
              type="submit"
              disabled={createSignup.isPending}
              className="cursor-pointer flex-1"
            >
              {createSignup.isPending
                ? "Apuntándose..."
                : "Confirmar inscripción"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";
import type { User } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Clock,
  Users,
  Euro,
  User as UserIcon,
  Shield,
  ArrowLeft,
} from "lucide-react";

import { useMatch, useMatchLineups } from "@/lib/queries";
import { TeamLineup } from "@/components/team-lineup";
import { LoadingSpinner } from "@/components/loading-spinner";
import { useRouter } from "next/navigation";

type Match = Database['public']['Tables']['matches']['Row'];

interface MatchDetailViewProps {
  match: Match;
  user: User | null;
  isAdmin: boolean;
}

export function MatchDetailView({
  match: initialMatch,
  user,
  isAdmin,
}: MatchDetailViewProps) {
  const router = useRouter();

  // Use React Query to get fresh data and enable real-time updates
  const {
    data: match,
    isLoading: matchLoading,
    error: matchError,
  } = useMatch(initialMatch.id, {
    initialData: initialMatch,
  });

  const {
    data: lineups,
    isLoading: lineupsLoading,
  } = useMatchLineups(initialMatch.id);

  if (matchLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  if (matchError || !match) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Error al cargar el partido</p>
      </div>
    );
  }

  const startDate = new Date(match.starts_at);
  const endDate = new Date(match.ends_at);
  const isPrivate = match.is_private;
  const canSeeDetails = isAdmin || !isPrivate;

  // Calculate duration in hours
  const durationMs = endDate.getTime() - startDate.getTime();
  const durationHours = durationMs / (1000 * 60 * 60);

  // Check if match has started or ended
  const now = new Date();
  const hasStarted = now >= startDate;
  const hasEnded = now >= endDate;
  const isUpcoming = now < startDate;

  // Calculate total signups
  const totalSignups = lineups
    ? (lineups.white?.length || 0) + (lineups.black?.length || 0)
    : 0;
  const spotsRemaining = match.capacity - totalSignups;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>

        {isAdmin && (
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Vista de administrador
            </span>
          </div>
        )}
      </div>

      {/* Match Info Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">
                  {canSeeDetails ? match.location : "Ubicación privada"}
                </CardTitle>
                {isPrivate && (
                  <Badge variant="secondary" className="text-xs">
                    Privado
                  </Badge>
                )}
              </div>
              <CardDescription>
                {format(startDate, "EEEE, d 'de' MMMM 'de' yyyy", {
                  locale: es,
                })}
              </CardDescription>
            </div>

            <Badge
              variant={
                hasEnded ? "destructive" : hasStarted ? "default" : "secondary"
              }
            >
              {hasEnded ? "Finalizado" : hasStarted ? "En curso" : "Próximo"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Match Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {canSeeDetails
                    ? format(startDate, "HH:mm", { locale: es })
                    : "--:--"}
                  {" - "}
                  {canSeeDetails
                    ? format(endDate, "HH:mm", { locale: es })
                    : "--:--"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {durationHours} {durationHours === 1 ? "hora" : "horas"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="font-medium">
                  {totalSignups} / {match.capacity}
                </p>
                <p className="text-sm text-muted-foreground">
                  {spotsRemaining}{" "}
                  {spotsRemaining === 1
                    ? "lugar disponible"
                    : "lugares disponibles"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Badge variant="outline" className="capitalize">
                {match.match_type === "friendly" ? "Amistoso" : "Entrenamiento"}
              </Badge>
            </div>

            {match.total_cost && (
              <div className="flex items-center gap-3">
                <Euro className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">€{match.total_cost}</p>
                  <p className="text-sm text-muted-foreground">
                    €{(match.total_cost / match.capacity).toFixed(2)} por
                    persona
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Organizer Info */}
          {match.rented_by_name && (
            <>
              <Separator />
              <div className="flex items-center gap-3">
                <UserIcon className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Organizado por</p>
                  <p className="text-sm text-muted-foreground">
                    {match.rented_by_name}
                  </p>
                </div>
              </div>
            </>
          )}

          {/* Description */}
          {match.description && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium mb-2">Descripción</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {match.description}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Team Lineups */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TeamLineup
          matchId={match.id}
          team="white"
          teamName="Equipo Blanco"
          players={lineups?.white || []}
          isLoading={lineupsLoading}
          user={user}
          isAdmin={isAdmin}
          canSignup={isUpcoming && spotsRemaining > 0}
        />

        <TeamLineup
          matchId={match.id}
          team="black"
          teamName="Equipo Negro"
          players={lineups?.black || []}
          isLoading={lineupsLoading}
          user={user}
          isAdmin={isAdmin}
          canSignup={isUpcoming && spotsRemaining > 0}
        />
      </div>

      {/* Full capacity message */}
      {spotsRemaining <= 0 && isUpcoming && (
        <Card className="border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950">
          <CardContent className="pt-6 text-center">
            <p className="text-amber-800 dark:text-amber-200 font-medium">
              ¡Partido completo!
            </p>
            <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
              No hay más lugares disponibles para este partido.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Match ended message */}
      {hasEnded && (
        <Card className="border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground font-medium">
              Este partido ya ha finalizado
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

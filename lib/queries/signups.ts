"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import {
  createSignup,
  updateSignup,
  deleteSignup,
  upsertSignup,
  type CreateSignupData,
} from "@/lib/actions/signups";
import { matchKeys } from "./matches";
import { toast } from "sonner";
import type { Team } from "@/lib/supabase/types";

// Query Keys
export const signupKeys = {
  all: ["signups"] as const,
  match: (matchId: string) => [...signupKeys.all, "match", matchId] as const,
  lineup: (matchId: string, team: Team) =>
    [...signupKeys.all, "lineup", matchId, team] as const,
  lineups: (matchId: string) =>
    [...signupKeys.all, "lineups", matchId] as const,
};

// Helper function to invalidate all signup-related queries for a match
const invalidateMatchSignups = (queryClient: ReturnType<typeof useQueryClient>, matchId: string) => {
  queryClient.invalidateQueries({
    queryKey: signupKeys.match(matchId),
  });
  queryClient.invalidateQueries({
    queryKey: signupKeys.lineups(matchId),
  });
  // Invalidate individual team lineups
  queryClient.invalidateQueries({
    queryKey: signupKeys.lineup(matchId, "white"),
  });
  queryClient.invalidateQueries({
    queryKey: signupKeys.lineup(matchId, "black"),
  });
  queryClient.invalidateQueries({
    queryKey: matchKeys.detail(matchId),
  });
};

/**
 * Hook to fetch team lineup
 */
export function useTeamLineup(matchId: string, team: Team) {
  return useQuery({
    queryKey: signupKeys.lineup(matchId, team),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase.rpc("get_team_lineup", {
        _match_id: matchId,
        _team: team,
      });

      if (error)
        throw new Error(`Error al obtener alineación: ${error.message}`);
      return data;
    },
    enabled: !!matchId && !!team,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to fetch both team lineups for a match
 */
export function useMatchLineups(matchId: string) {
  const whiteTeam = useTeamLineup(matchId, "white");
  const blackTeam = useTeamLineup(matchId, "black");

  return {
    whiteTeam,
    blackTeam,
    isLoading: whiteTeam.isLoading || blackTeam.isLoading,
    error: whiteTeam.error || blackTeam.error,
    data: {
      white: whiteTeam.data || [],
      black: blackTeam.data || [],
    },
  };
}

/**
 * Hook to fetch all signups for a match
 */
export function useMatchSignups(matchId: string) {
  return useQuery({
    queryKey: signupKeys.match(matchId),
    queryFn: async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("signups")
        .select(
          `
          *,
          players:player_id (
            id,
            display_name,
            image_url,
            preferred_position
          )
        `
        )
        .eq("match_id", matchId)
        .order("created_at", { ascending: true });

      if (error)
        throw new Error(`Error al obtener inscripciones: ${error.message}`);
      return data;
    },
    enabled: !!matchId,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Hook to create a signup
 */
export function useCreateSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signupData: CreateSignupData) => {
      const result = await createSignup(signupData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (data && typeof data === 'object' && 'match_id' in data) {
        invalidateMatchSignups(queryClient, (data as { match_id: string }).match_id);
      }
      toast.success("¡Te has apuntado con éxito!");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Error al apuntarse"
      );
    },
  });
}

/**
 * Hook to update a signup
 */
export function useUpdateSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      playerId,
      updates,
    }: {
      matchId: string;
      playerId: string;
      updates: Partial<Pick<CreateSignupData, "team" | "position">>;
    }) => {
      const result = await updateSignup(matchId, playerId, updates);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (data && typeof data === 'object' && 'match_id' in data) {
        invalidateMatchSignups(queryClient, (data as { match_id: string }).match_id);
      }
      toast.success("Inscripción actualizada con éxito");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al actualizar inscripción"
      );
    },
  });
}

/**
 * Hook to delete a signup
 */
export function useDeleteSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      matchId,
      playerId,
    }: {
      matchId: string;
      playerId: string;
    }) => {
      const result = await deleteSignup(matchId, playerId);
      if (!result.success) throw new Error(result.error);
      return { matchId, playerId };
    },
    onSuccess: (data) => {
      // Invalidate related queries for the specific match
      invalidateMatchSignups(queryClient, data.matchId);
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Error al cancelar inscripción"
      );
    },
  });
}

/**
 * Hook to upsert a signup (create or update if exists)
 */
export function useUpsertSignup() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (signupData: CreateSignupData) => {
      const result = await upsertSignup(signupData);
      if (!result.success) throw new Error(result.error);
      return result.data;
    },
    onSuccess: (data) => {
      // Invalidate related queries
      if (data && typeof data === 'object' && 'match_id' in data) {
        invalidateMatchSignups(queryClient, (data as { match_id: string }).match_id);
      }
      toast.success("Inscripción procesada con éxito");
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : "Error al procesar inscripción"
      );
    },
  });
}

/**
 * Hook to check if a player is signed up for a match
 */
export function usePlayerSignup(matchId: string, playerId: string) {
  const { data: signups } = useMatchSignups(matchId);

  const playerSignup = signups?.find((signup) => signup.player_id === playerId);

  return {
    isSignedUp: !!playerSignup,
    signup: playerSignup,
    team: playerSignup?.team,
    position: playerSignup?.position,
  };
}

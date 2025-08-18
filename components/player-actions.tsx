"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useDeleteSignup } from "@/lib/queries";

interface PlayerActionsProps {
  matchId: string;
  playerId: string;
  playerName: string;
  canEdit: boolean;
}

export function PlayerActions({ matchId, playerId, playerName, canEdit }: PlayerActionsProps) {
  const deleteSignup = useDeleteSignup();

  const handleDeleteSignup = () => {
    if (
      window.confirm(
        `¿Estás seguro de que quieres eliminar a ${playerName} del equipo?`
      )
    ) {
      deleteSignup.mutate({ matchId, playerId }, {
        onSuccess: () => {
          toast.success("Jugador eliminado del equipo");
        },
        onError: (error) => {
          toast.error(
            error instanceof Error ? error.message : "Error al eliminar jugador"
          );
        },
      });
    }
  };

  if (!canEdit) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="cursor-pointer">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => {
            toast.info("Funcionalidad de edición próximamente");
          }}
          className="cursor-pointer"
        >
          <Edit className="h-4 w-4 mr-2" />
          Cambiar equipo/posición
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleDeleteSignup}
          className="cursor-pointer text-destructive"
          disabled={deleteSignup.isPending}
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Eliminar del equipo
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

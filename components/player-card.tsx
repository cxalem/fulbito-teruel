import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import { PlayerActions } from "./player-actions";
import type { SoccerPosition } from "@/lib/supabase/types";

interface Player {
  match_id: string;
  team: string;
  player_id: string;
  display_name: string;
  image_url: string | null;
  pos: SoccerPosition | null;
  position_order: number;
  position_label: string | null;
}

interface PlayerCardProps {
  player: Player;
  isAdmin: boolean;
}

const POSITION_LABELS: Record<SoccerPosition, string> = {
  gk: "Portero",
  lb: "Lateral Izq.",
  cb: "Central",
  rb: "Lateral Der.",
  cm: "Centrocampista",
  st1: "Delantero",
  st2: "Delantero",
} as const;

export function PlayerCard({ 
  player,
  isAdmin,
}: PlayerCardProps) {
  const isGoalkeeper = player.pos === 'gk';
  
  return (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-card">
      <div className="flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={player.image_url || undefined} />
          <AvatarFallback className="text-sm font-medium">
            {player.display_name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-sm truncate">
              {player.display_name}
            </p>
            {isGoalkeeper && (
              <Crown className="h-3 w-3 text-amber-500" />
            )}
          </div>

          {player.pos && (
            <Badge variant="secondary" className="text-xs mt-1">
              {POSITION_LABELS[player.pos]}
            </Badge>
          )}
        </div>
      </div>

      <PlayerActions
        matchId={player.match_id}
        playerId={player.player_id}
        playerName={player.display_name}
        canEdit={isAdmin}
      />
    </div>
  );
}
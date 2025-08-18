import type { User } from "@supabase/supabase-js";
import type { SoccerPosition } from "@/lib/supabase/types";
import { PlayerCard } from "./player-card";
import { PlayerActions } from "./player-actions";

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

interface PositionGroupProps {
  position: SoccerPosition;
  label: string;
  icon: string;
  players: Player[];
  user: User | null;
  isAdmin: boolean;
}

export function PositionGroup({
  label,
  icon,
  players,
  user,
  isAdmin,
}: PositionGroupProps) {
  if (players.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-lg">{icon}</span>
        <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wider">
          {label} ({players.length})
        </h4>
      </div>

      <div className="space-y-2">
        {players.map((player) => (
          <div
            key={`${player.match_id}-${player.player_id}`}
            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
          >
            <PlayerCard
              displayName={player.display_name}
              avatarUrl={player.image_url}
              position={player.pos!}
              isGoalkeeper={player.pos === "gk"}
            />

            <PlayerActions
              matchId={player.match_id}
              playerId={player.player_id}
              playerName={player.display_name}
              canEdit={isAdmin || user?.id === player.player_id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

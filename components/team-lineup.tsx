import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PositionGroup } from "./position-group";
import { TeamEmptyState } from "./team-empty-state";
import { TeamSignupDialog } from "./team-signup-dialog";
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

interface TeamLineupProps {
  matchId: string;
  team: "white" | "black";
  teamName: string;
  players: Player[];
  isLoading: boolean;
  user: User | null;
  isAdmin: boolean;
  canSignup: boolean;
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

const POSITION_ICONS: Record<SoccerPosition, string> = {
  gk: "🥅",
  lb: "🛡️",
  cb: "🛡️",
  rb: "🛡️",
  cm: "⚽",
  st1: "⚡",
  st2: "⚡",
} as const;

const POSITION_ORDER: SoccerPosition[] = [
  "gk",
  "lb",
  "cb",
  "rb",
  "cm",
  "st1",
  "st2",
];

export function TeamLineup({
  matchId,
  team,
  teamName,
  players,
  isLoading,
  user,
  isAdmin,
  canSignup,
}: TeamLineupProps) {
  // Group players by position, filtering out null positions
  const playersByPosition = players.reduce((acc, player) => {
    if (player.pos) {
      if (!acc[player.pos]) {
        acc[player.pos] = [];
      }
      acc[player.pos].push(player);
    }
    return acc;
  }, {} as Record<SoccerPosition, Player[]>);

  const teamColor =
    team === "white" ? "bg-zinc-100" : "bg-zinc-900 dark:bg-zinc-700";

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${teamColor}`} />
            {teamName}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <div className={`w-4 h-4 rounded-full ${teamColor}`} />
            {teamName}
            <Badge variant="secondary" className="ml-2">
              {players.length} jugadores
            </Badge>
          </CardTitle>

          <TeamSignupDialog
            matchId={matchId}
            team={team}
            teamName={teamName}
            user={user}
            canSignup={canSignup}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {players.length === 0 ? (
          <TeamEmptyState canSignup={canSignup} />
        ) : (
          <div className="space-y-4">
            {POSITION_ORDER.map((position) => (
              <PositionGroup
                key={position}
                position={position}
                label={POSITION_LABELS[position]}
                icon={POSITION_ICONS[position]}
                players={playersByPosition[position] || []}
                user={user}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

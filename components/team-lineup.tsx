import type { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { PlayerCard } from "./player-card";
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
  isTraining?: boolean;
}



export function TeamLineup({
  matchId,
  team,
  teamName,
  players,
  isLoading,
  user,
  isAdmin,
  canSignup,
  isTraining = false,
}: TeamLineupProps) {
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
            {!isTraining && <div className={`w-4 h-4 rounded-full ${teamColor}`} />}
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
            isTraining={isTraining}
          />
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {players.length === 0 ? (
          <TeamEmptyState canSignup={canSignup} />
        ) : (
          <div className="space-y-3">
            {players.map((player) => (
              <PlayerCard
                key={player.player_id}
                player={player}
                isAdmin={isAdmin}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

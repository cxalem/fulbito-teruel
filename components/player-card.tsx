import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Crown } from "lucide-react";
import type { SoccerPosition } from "@/lib/supabase/types";

interface PlayerCardProps {
  displayName: string;
  avatarUrl?: string | null;
  position: SoccerPosition;
  isGoalkeeper?: boolean;
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
  displayName, 
  avatarUrl, 
  position, 
  isGoalkeeper = false 
}: PlayerCardProps) {
  return (
    <div className="flex items-center gap-3">
      <Avatar className="h-10 w-10">
        <AvatarImage src={avatarUrl || undefined} />
        <AvatarFallback className="text-sm font-medium">
          {displayName.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="font-medium text-sm truncate">
            {displayName}
          </p>
          {isGoalkeeper && (
            <Crown className="h-3 w-3 text-amber-500" />
          )}
        </div>

        <Badge variant="secondary" className="text-xs mt-1">
          {POSITION_LABELS[position]}
        </Badge>
      </div>
    </div>
  );
}
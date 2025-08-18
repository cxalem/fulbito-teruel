import { Users } from "lucide-react";

interface TeamEmptyStateProps {
  canSignup: boolean;
}

export function TeamEmptyState({ canSignup }: TeamEmptyStateProps) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p>No hay jugadores en este equipo</p>
      {canSignup && (
        <p className="text-sm mt-1">¡Sé el primero en apuntarte!</p>
      )}
    </div>
  );
}

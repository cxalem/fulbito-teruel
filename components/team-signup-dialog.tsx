"use client";

import { useState } from "react";
import type { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { UserPlus } from "lucide-react";
import { SignupForm } from "./signup-form";

interface TeamSignupDialogProps {
  matchId: string;
  team: "white" | "black";
  teamName: string;
  user: User | null;
  canSignup: boolean;
}

export function TeamSignupDialog({ 
  matchId, 
  team, 
  teamName, 
  user, 
  canSignup 
}: TeamSignupDialogProps) {
  const [showSignupDialog, setShowSignupDialog] = useState(false);

  if (!canSignup) return null;

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        className="cursor-pointer"
        onClick={() => setShowSignupDialog(true)}
      >
        <UserPlus className="h-4 w-4 mr-1" />
        Unirse
      </Button>

      <Dialog open={showSignupDialog} onOpenChange={setShowSignupDialog}>
        <DialogContent className="sm:max-w-md h-[600px] md:h-[720px] flex flex-col">
          <DialogHeader>
            <DialogTitle>Apuntarse al {teamName}</DialogTitle>
            <DialogDescription>
              Completa la información para unirte a este equipo
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto w-full">
            <SignupForm
              matchId={matchId}
              team={team}
              user={user}
              onSuccess={() => setShowSignupDialog(false)}
              onCancel={() => setShowSignupDialog(false)}
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

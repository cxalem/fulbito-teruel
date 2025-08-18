'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Calendar } from 'lucide-react'
import Link from 'next/link'

interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  showAction?: boolean
  icon?: React.ReactNode
}

export function EmptyState({ 
  title, 
  description, 
  actionLabel, 
  actionHref, 
  showAction = false,
  icon 
}: EmptyStateProps) {
  return (
    <Card className="border-dashed border-2 border-zinc-300 dark:border-zinc-700">
      <CardContent className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="mb-4 p-3 rounded-full bg-zinc-100 dark:bg-zinc-100">
          {icon || <Calendar className="h-8 w-8 text-zinc-400" />}
        </div>
        
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {title}
        </h3>
        
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          {description}
        </p>
        
        {showAction && actionLabel && actionHref && (
          <Button asChild className="cursor-pointer">
            <Link href={actionHref}>
              <Plus className="h-4 w-4 mr-2" />
              {actionLabel}
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export function NoMatchesEmptyState({ isAdmin = false }: { isAdmin?: boolean }) {
  return (
    <EmptyState
      title="No hay partidos programados"
      description="Actualmente no hay partidos próximos. Los partidos aparecerán aquí cuando se programen."
      actionLabel={isAdmin ? "Crear primer partido" : undefined}
      actionHref={isAdmin ? "/matches/new" : undefined}
      showAction={isAdmin}
      icon={<Calendar className="h-8 w-8 text-zinc-400" />}
    />
  )
}

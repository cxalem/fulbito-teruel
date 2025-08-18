'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { useUpcomingMatches, useCreateMatch, useDeleteMatch } from '@/lib/queries'
import { Trash2, Plus, Shield, RefreshCw } from 'lucide-react'

interface AdminTestPanelProps {
  isAdmin: boolean
  user: { id: string; email?: string } | null
}

export function AdminTestPanel({ isAdmin, user }: AdminTestPanelProps) {
  const [testMatch, setTestMatch] = useState<{ id: string; location: string | null } | null>(null)
  
  // React Query hooks
  const { data: matches, isLoading: matchesLoading, refetch } = useUpcomingMatches()
  const createMatch = useCreateMatch()
  const deleteMatch = useDeleteMatch()

  const handleCreateTest = () => {
    createMatch.mutate({
      starts_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      ends_at: new Date(Date.now() + 25 * 60 * 60 * 1000).toISOString(), // Tomorrow + 1 hour
      location: 'Campo de Prueba - React Query',
      capacity: 18,
      is_private: false,
      match_type: 'friendly',
      total_cost: 50.00,
      renter_name: 'Usuario de Prueba'
    }, {
      onSuccess: (data) => {
        if (data?.match) {
          setTestMatch(data.match)
        }
      }
    })
  }

  const handleDeleteTest = () => {
    if (!testMatch) return
    
    deleteMatch.mutate(testMatch.id, {
      onSuccess: () => {
        setTestMatch(null)
      }
    })
  }

  const handleRefresh = () => {
    refetch()
  }

  if (!user) {
    return (
      <Card className="border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Panel de Prueba de Autenticación
          </CardTitle>
          <CardDescription>
            Prueba las políticas RLS y la autenticación
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Inicia sesión para probar las funcionalidades de administrador.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={isAdmin ? "border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950" : "border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950"}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Panel de Prueba de RLS
          {isAdmin ? (
            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100">
              Administrador
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100">
              Usuario Normal
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Usuario: {user.email}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Matches Info */}
        <div className="text-sm">
          <p className="font-medium">Estado de Partidos:</p>
          <p className="text-muted-foreground">
            {matchesLoading ? 'Cargando...' : `${matches?.length || 0} partidos próximos`}
          </p>
        </div>
        
        {isAdmin ? (
          <>
            <p className="text-sm text-green-700 dark:text-green-300">
              ✅ Como administrador, puedes crear y gestionar partidos.
            </p>
            
            <div className="flex gap-2 flex-wrap">
              <Button
                onClick={handleCreateTest}
                disabled={createMatch.isPending || !!testMatch}
                className="cursor-pointer"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createMatch.isPending ? 'Creando...' : 'Crear Partido de Prueba'}
              </Button>
              
              <Button
                onClick={handleRefresh}
                disabled={matchesLoading}
                variant="outline"
                className="cursor-pointer"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Lista
              </Button>
              
              {testMatch && (
                <Button
                  onClick={handleDeleteTest}
                  disabled={deleteMatch.isPending}
                  variant="destructive"
                  className="cursor-pointer"
                  size="sm"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleteMatch.isPending ? 'Eliminando...' : 'Eliminar Partido de Prueba'}
                </Button>
              )}
            </div>
            
            {testMatch && (
              <div className="mt-4 p-3 bg-background rounded-lg border">
                <p className="text-sm font-medium">Partido de prueba creado:</p>
                <p className="text-xs text-muted-foreground">ID: {testMatch.id}</p>
                <p className="text-xs text-muted-foreground">Ubicación: {testMatch.location}</p>
              </div>
            )}
          </>
        ) : (
          <>
            <p className="text-sm text-red-700 dark:text-red-300">
              ❌ Como usuario normal, no puedes crear partidos. Solo los administradores tienen este permiso.
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleCreateTest}
                disabled={createMatch.isPending}
                variant="outline"
                className="cursor-pointer"
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                {createMatch.isPending ? 'Intentando...' : 'Intentar Crear Partido (Fallará)'}
              </Button>
              
              <Button
                onClick={handleRefresh}
                disabled={matchesLoading}
                variant="outline"
                className="cursor-pointer"
                size="sm"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Actualizar Lista
              </Button>
            </div>
            
            <p className="text-xs text-muted-foreground">
              Este botón debería fallar y mostrar un error debido a las políticas RLS.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

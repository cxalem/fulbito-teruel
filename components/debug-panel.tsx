'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Bug, LogOut, Database } from 'lucide-react'
import { signOutAction } from '@/lib/actions/auth'
import { checkAdminTable } from '@/lib/actions/debug'
import { useState } from 'react'
import { toast } from 'sonner'

interface DebugPanelProps {
  user: { id: string; email?: string } | null
  isAdmin: boolean
}

export function DebugPanel({ user, isAdmin }: DebugPanelProps) {
  const [checking, setChecking] = useState(false)
  
  // Get admin emails from client-side (this won't work, but helps debug)
  const clientAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS || 'No NEXT_PUBLIC_ADMIN_EMAILS found'
  
  const handleCheckAdminTable = async () => {
    setChecking(true)
    try {
      const result = await checkAdminTable()
      if (result.success) {
        console.log('Admin table check result:', result.data)
        toast.success(`Encontrados ${result.data?.admins?.length || 0} administradores en la base de datos`)
      } else {
        toast.error(`Error: ${result.error}`)
      }
    } catch {
      toast.error('Error al verificar tabla de administradores')
    } finally {
      setChecking(false)
    }
  }
  
  return (
    <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-sm">
          <Bug className="h-4 w-4" />
          Panel de Debug
        </CardTitle>
        <CardDescription className="text-xs">
          Información para diagnosticar problemas de autenticación
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-xs">
        <div>
          <p className="font-medium">Estado del Usuario:</p>
          <p className="text-muted-foreground">
            {user ? `✅ Autenticado como: ${user.email}` : '❌ No autenticado'}
          </p>
          {user && (
            <p className="text-muted-foreground">
              ID: {user.id}
            </p>
          )}
        </div>
        
        <div>
          <p className="font-medium">Estado de Admin:</p>
          <Badge variant={isAdmin ? "default" : "secondary"} className="text-xs">
            {isAdmin ? 'Es Administrador' : 'No es Administrador'}
          </Badge>
        </div>
        
        <div>
          <p className="font-medium">Variables de Entorno (Cliente):</p>
          <p className="text-muted-foreground break-all">
            NEXT_PUBLIC_ADMIN_EMAILS: {clientAdminEmails}
          </p>
          <p className="text-xs text-orange-600 dark:text-orange-400">
            Nota: Las variables de entorno del servidor no son visibles aquí por seguridad
          </p>
        </div>
        
        {user && (
          <div>
            <p className="font-medium">Email del Usuario:</p>
            <p className="text-muted-foreground">
              {user.email}
            </p>
          </div>
        )}
        
        <div className="border-t pt-2">
          <p className="font-medium text-xs mb-2">Acciones de Debug:</p>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={handleCheckAdminTable}
              disabled={checking}
              variant="outline"
              size="sm"
              className="cursor-pointer"
            >
              <Database className="h-3 w-3 mr-1" />
              {checking ? 'Verificando...' : 'Verificar Tabla Admins'}
            </Button>
            
            {user && (
              <form action={signOutAction}>
                <Button 
                  type="submit" 
                  variant="outline" 
                  size="sm" 
                  className="cursor-pointer"
                >
                  <LogOut className="h-3 w-3 mr-1" />
                  Forzar Cierre de Sesión
                </Button>
              </form>
            )}
          </div>
        </div>
        
        <div className="text-xs text-muted-foreground border-t pt-2">
          <p>💡 <strong>Para solucionar:</strong></p>
          <ol className="list-decimal list-inside space-y-1 ml-2">
            <li>Verifica que tu email esté en ADMIN_EMAILS en .env.local</li>
            <li>Reinicia el servidor después de cambiar .env.local</li>
            <li>Cierra sesión y vuelve a iniciar sesión</li>
            <li>Revisa los logs del servidor en la consola</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  )
}

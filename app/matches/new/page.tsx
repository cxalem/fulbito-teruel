import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser } from '@/lib/auth'
import { CreateMatchForm } from '@/components/create-match-form'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShieldAlert } from 'lucide-react'

export default async function NewMatchPage() {
  const { user, isAdmin } = await getCurrentUser()

  // Redirect if not authenticated
  if (!user) {
    redirect('/auth/signin')
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 p-3 rounded-full bg-red-100 dark:bg-red-900 w-fit">
                <ShieldAlert className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">
                Acceso Denegado
              </CardTitle>
              <CardDescription className="text-red-700 dark:text-red-300">
                Solo los administradores pueden crear partidos
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-red-600 dark:text-red-400 mb-4">
                Necesitas permisos de administrador para acceder a esta página.
              </p>
              <Link 
                href="/" 
                className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 font-medium underline"
              >
                Volver al inicio
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
            Crear Nuevo Partido
          </h1>
          <p className="text-muted-foreground">
            Programa un nuevo partido de fútbol para la comunidad de Teruel
          </p>
        </div>

        {/* Form */}
        <CreateMatchForm />
      </div>
    </div>
  )
}

export const metadata = {
  title: 'Crear Partido - Fulbito Teruel',
  description: 'Crear un nuevo partido de fútbol en Teruel',
}

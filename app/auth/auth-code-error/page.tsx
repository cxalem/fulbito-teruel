import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

export default function AuthCodeErrorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-6">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Error de Autenticación
          </h1>
          <p className="text-muted-foreground">
            Hubo un problema al iniciar sesión. Por favor, intenta de nuevo.
          </p>
        </div>
        
        <div className="space-y-4">
          <Button asChild className="w-full cursor-pointer">
            <Link href="/">
              Volver al Inicio
            </Link>
          </Button>
          
          <div className="text-sm text-muted-foreground">
            <p>Si el problema persiste, contacta con el administrador.</p>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { LogIn, LogOut } from 'lucide-react'
import { useEffect, useState } from 'react'

import { toast } from 'sonner'
import { signOutAction } from '@/lib/actions/auth'
import { getUserAvatar, getUserDisplayName, getUserInitials } from '@/lib/utils/user'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface AuthButtonProps {
  user?: SupabaseUser | null
  isAdmin?: boolean
}

export function AuthButton({ user: initialUser, isAdmin: initialIsAdmin }: AuthButtonProps) {
  const [user, setUser] = useState<SupabaseUser | null>(initialUser || null)
  const [isAdmin, setIsAdmin] = useState(initialIsAdmin || false)
  const [loading, setLoading] = useState(false)
  const supabase = createClient()

  // Sync with prop changes (when server-side values update)
  useEffect(() => {
    setUser(initialUser || null)
    setIsAdmin(initialIsAdmin || false)
  }, [initialUser, initialIsAdmin])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email)
        setUser(session?.user || null)
        
        // Don't try to check admin status client-side due to RLS
        // The admin status comes from the server-side layout
        if (!session?.user) {
          setIsAdmin(false)
        }
        
        // Reset loading state when auth state changes
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase])

  const handleSignIn = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error) {
      console.error('Error signing in:', error)
      toast.error('Error al iniciar sesión')
      setLoading(false)
    }
    // Don't set loading to false here since we're redirecting
  }

  if (user) {
    return (
      <div className="flex items-center gap-2">
        {isAdmin && (
          <Badge variant="secondary" className="text-xs">
            Administrador
          </Badge>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6">
            <AvatarImage src={getUserAvatar(user) || undefined} />
            <AvatarFallback className="text-xs">
              {getUserInitials(user)}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline">
            {getUserDisplayName(user)}
          </span>
        </div>
        <form action={signOutAction} className="inline">
          <Button
            type="submit"
            variant="ghost"
            size="sm"
            className="cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:ml-2 sm:inline">
              Cerrar sesión
            </span>
          </Button>
        </form>
      </div>
    )
  }

  return (
    <Button
      onClick={handleSignIn}
      disabled={loading}
      className="cursor-pointer"
    >
      <LogIn className="h-4 w-4" />
      <span className="ml-2">
        {loading ? 'Iniciando sesión...' : 'Iniciar sesión con Google'}
      </span>
    </Button>
  )
}

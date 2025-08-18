import Link from 'next/link'
import { AuthButton } from './auth-button'
import { ThemeToggle } from './theme-toggle'
import type { User } from '@supabase/supabase-js'

interface NavbarProps {
  user?: User | null
  isAdmin?: boolean
}

export function Navbar({ user, isAdmin }: NavbarProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 max-w-screen-2xl items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-4 flex items-center space-x-2 cursor-pointer">
            <span className="text-xl font-bold">⚽</span>
            <span className="hidden font-bold sm:inline-block">
              Fulbito Teruel
            </span>
          </Link>
        </div>
        
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <AuthButton user={user} isAdmin={isAdmin} />
          </nav>
        </div>
      </div>
    </header>
  )
}

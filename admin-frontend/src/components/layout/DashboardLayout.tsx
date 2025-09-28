'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { Header } from './Header'
import { authService } from '@/lib/api'
import { User } from '@/types/api'
import toast from 'react-hot-toast'

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  const handleLogout = useCallback(() => {
    authService.logout()
    toast.success('Sesión cerrada exitosamente')
    router.push('/login')
  }, [router])

  useEffect(() => {
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/login')
          return
        }

        const userData = authService.getUserData()
        if (userData) {
          setUser(userData)
        } else {
          // Obtener datos del usuario desde la API
          const currentUser = await authService.getCurrentUser()
          setUser(currentUser)
          authService.setUserData(currentUser)
        }

        // Verificar que sea administrador
        const currentUserData = userData || await authService.getCurrentUser()
        if (currentUserData.role !== 'admin') {
          toast.error('Acceso denegado. Necesitas permisos de administrador.')
          handleLogout()
          return
        }
      } catch (error) {
        console.error('Error checking authentication:', error)
        handleLogout()
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [router, handleLogout])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="h-screen flex overflow-hidden">
      <Sidebar onLogout={handleLogout} />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <Header user={user} />
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
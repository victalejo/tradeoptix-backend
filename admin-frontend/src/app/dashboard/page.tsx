'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { dashboardService, userService } from '@/lib/api'
import { DashboardStats, User } from '@/types/api'
import { 
  UsersIcon, 
  DocumentCheckIcon, 
  ClockIcon, 
  CheckCircleIcon,
  XCircleIcon 
} from '@heroicons/react/24/outline'
import { formatRelativeDate, getKYCStatusColor, getKYCStatusText } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [recentUsers, setRecentUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Cargar estadísticas del dashboard
      // Como no tenemos el endpoint implementado en el backend, simulamos los datos
      const mockStats: DashboardStats = {
        total_users: 156,
        pending_kyc: 23,
        approved_kyc: 89,
        rejected_kyc: 8,
        new_users_today: 5,
        new_users_this_week: 18,
        new_users_this_month: 67
      }
      setStats(mockStats)

      // Cargar usuarios recientes
      const usersResponse = await userService.getUsers(1, 5)
      setRecentUsers(usersResponse.data || [])
    } catch (error: any) {
      console.error('Error loading dashboard data:', error)
      toast.error('Error cargando datos del dashboard')
      
      // Datos de fallback
      setStats({
        total_users: 0,
        pending_kyc: 0,
        approved_kyc: 0,
        rejected_kyc: 0,
        new_users_today: 0,
        new_users_this_week: 0,
        new_users_this_month: 0
      })
    } finally {
      setIsLoading(false)
    }
  }

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    color = 'indigo',
    subtitle 
  }: {
    title: string
    value: number
    icon: any
    color?: string
    subtitle?: string
  }) => (
    <Card padding="md">
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <Icon className={`h-8 w-8 text-${color}-600`} />
        </div>
        <div className="ml-5 w-0 flex-1">
          <dl>
            <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
            <dd className="text-lg font-medium text-gray-900">{value.toLocaleString()}</dd>
            {subtitle && (
              <dd className="text-sm text-gray-600">{subtitle}</dd>
            )}
          </dl>
        </div>
      </div>
    </Card>
  )

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="animate-pulse space-y-6">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 h-24 rounded-lg"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-600">
            Resumen general del sistema TradeOptix
          </p>
        </div>

        {/* Estadísticas principales */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            title="Total Usuarios"
            value={stats?.total_users || 0}
            icon={UsersIcon}
            subtitle="Registrados en el sistema"
          />
          <StatCard
            title="KYC Pendientes"
            value={stats?.pending_kyc || 0}
            icon={ClockIcon}
            color="yellow"
            subtitle="Esperando revisión"
          />
          <StatCard
            title="KYC Aprobados"
            value={stats?.approved_kyc || 0}
            icon={CheckCircleIcon}
            color="green"
            subtitle="Verificados exitosamente"
          />
          <StatCard
            title="KYC Rechazados"
            value={stats?.rejected_kyc || 0}
            icon={XCircleIcon}
            color="red"
            subtitle="Requieren corrección"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Nuevos usuarios */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Nuevos Usuarios</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Hoy</span>
                  <span className="text-sm font-medium">{stats?.new_users_today || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Esta semana</span>
                  <span className="text-sm font-medium">{stats?.new_users_this_week || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Este mes</span>
                  <span className="text-sm font-medium">{stats?.new_users_this_month || 0}</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Usuarios recientes */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Usuarios Recientes</h3>
            </div>
            <div className="p-6">
              {recentUsers.length > 0 ? (
                <div className="space-y-3">
                  {recentUsers.map((user) => (
                    <div key={user.id} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.first_name} {user.last_name}
                        </p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge 
                          variant={
                            user.kyc_status === 'approved' ? 'success' :
                            user.kyc_status === 'rejected' ? 'error' : 'warning'
                          }
                        >
                          {getKYCStatusText(user.kyc_status)}
                        </Badge>
                        <span className="text-xs text-gray-400">
                          {formatRelativeDate(user.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No hay usuarios recientes</p>
              )}
            </div>
          </Card>
        </div>

        {/* Acciones rápidas */}
        <Card>
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Acciones Rápidas</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <a
                href="/users"
                className="block p-4 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
              >
                <UsersIcon className="h-8 w-8 text-indigo-600 mb-2" />
                <h4 className="font-medium text-gray-900">Gestionar Usuarios</h4>
                <p className="text-sm text-gray-600">Ver y administrar todos los usuarios</p>
              </a>
              
              <a
                href="/kyc"
                className="block p-4 bg-yellow-50 hover:bg-yellow-100 rounded-lg transition-colors"
              >
                <DocumentCheckIcon className="h-8 w-8 text-yellow-600 mb-2" />
                <h4 className="font-medium text-gray-900">Revisar KYC</h4>
                <p className="text-sm text-gray-600">Aprobar o rechazar documentos</p>
              </a>
              
              <a
                href="/settings"
                className="block p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <UsersIcon className="h-8 w-8 text-gray-600 mb-2" />
                <h4 className="font-medium text-gray-900">Configuración</h4>
                <p className="text-sm text-gray-600">Ajustar configuraciones del sistema</p>
              </a>
            </div>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  )
}
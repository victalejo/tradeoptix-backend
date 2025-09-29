'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CreateNotificationModal } from '@/components/modals/CreateNotificationModal'
import { notificationService } from '@/lib/api'
import { Notification, NotificationStats } from '@/types/api'
import { 
  BellIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  XCircleIcon,
  SpeakerWaveIcon,
  TrashIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

// Tipos importados desde @/types/api

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadNotifications()
    loadStats()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const response = await notificationService.getNotifications(1, 50) // Cargar más notificaciones por defecto
      setNotifications(response.data || [])
    } catch (error) {
      console.error('Error loading notifications:', error)
      toast.error('Error al cargar las notificaciones')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const stats = await notificationService.getNotificationStats()
      setStats(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleDeleteNotification = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta notificación?')) {
      return
    }

    try {
      setIsProcessing(true)
      await notificationService.deleteNotification(id)
      toast.success('Notificación eliminada exitosamente')
      loadNotifications()
      loadStats()
    } catch (error) {
      console.error('Error deleting notification:', error)
      toast.error('Error al eliminar la notificación')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleSendPush = async (id: string) => {
    try {
      setIsProcessing(true)
      await notificationService.sendPushNotification(id)
      toast.success('Notificación push enviada exitosamente')
      loadNotifications()
    } catch (error) {
      console.error('Error sending push:', error)
      toast.error('Error al enviar la notificación push')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNotificationCreated = () => {
    loadNotifications()
    loadStats()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'warning':
        return <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500" />
      case 'error':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      default:
        return <InformationCircleIcon className="h-5 w-5 text-blue-500" />
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'success': return 'success'
      case 'warning': return 'warning'
      case 'error': return 'error'
      default: return 'info'
    }
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'kyc': return 'KYC'
      case 'market': return 'Mercado'
      case 'system': return 'Sistema'
      default: return 'General'
    }
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'kyc': return 'warning'
      case 'market': return 'success'
      case 'system': return 'error'
      default: return 'default'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Notificaciones</h1>
            <p className="text-sm text-gray-600">
              Gestión de notificaciones push y comunicación con usuarios
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <SpeakerWaveIcon className="h-4 w-4" />
            Enviar Notificación
          </Button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <BellIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total_notifications}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Sin Leer</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.unread_notifications}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircleIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Hoy</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.today_notifications}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <SpeakerWaveIcon className="h-8 w-8 text-purple-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Push Enviadas</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.push_notifications_sent}</p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabla de notificaciones */}
        <Card padding="none">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando notificaciones...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notificación
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tipo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Push
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {notifications.map((notification) => (
                    <tr key={notification.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          {getTypeIcon(notification.type)}
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {notification.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {notification.message}
                            </div>
                            {notification.user_id && (
                              <div className="text-xs text-gray-400 mt-1">
                                Usuario: {notification.user_id}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getTypeBadgeVariant(notification.type)}>
                          {notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getCategoryBadgeVariant(notification.category)}>
                          {getCategoryText(notification.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={notification.is_read ? 'success' : 'warning'}>
                          {notification.is_read ? 'Leída' : 'Sin leer'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={notification.is_push_sent ? 'success' : 'default'}>
                          {notification.is_push_sent ? 'Enviada' : 'No enviada'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(notification.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        {!notification.is_push_sent && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleSendPush(notification.id)}
                            disabled={isProcessing}
                          >
                            <SpeakerWaveIcon className="h-4 w-4 mr-1" />
                            Enviar Push
                          </Button>
                        )}
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteNotification(notification.id)}
                          disabled={isProcessing}
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Eliminar
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {notifications.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <BellIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay notificaciones
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Las notificaciones enviadas aparecerán aquí.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setShowCreateModal(true)}>
                      <SpeakerWaveIcon className="h-4 w-4 mr-2" />
                      Enviar Notificación
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modales */}
        <CreateNotificationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleNotificationCreated}
        />
      </div>
    </DashboardLayout>
  )
}
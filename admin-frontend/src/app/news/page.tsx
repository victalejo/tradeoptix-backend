'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { CreateNewsModal } from '@/components/modals/CreateNewsModal'
import { newsService } from '@/lib/api'
import { 
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  NewspaperIcon,
  ChartBarIcon,
  FireIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

interface MarketNews {
  id: string
  title: string
  content: string
  summary?: string
  image_url?: string
  category: 'general' | 'markets' | 'crypto' | 'analysis' | 'regulation'
  priority: number
  is_active: boolean
  published_at: string
  created_by?: string
  created_at: string
  updated_at: string
}

interface NewsStats {
  total_news: number
  active_news: number
  today_news: number
  news_by_category: Record<string, number>
}

export default function NewsPage() {
  const [news, setNews] = useState<MarketNews[]>([])
  const [stats, setStats] = useState<NewsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedNews, setSelectedNews] = useState<MarketNews | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadNews()
    loadStats()
  }, [])

  const loadNews = async () => {
    try {
      setIsLoading(true)
      const response = await newsService.getNews(1, 50) // Cargar más noticias por defecto
      setNews(response.data || [])
    } catch (error) {
      console.error('Error loading news:', error)
      toast.error('Error al cargar las noticias')
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const stats = await newsService.getNewsStats()
      setStats(stats)
    } catch (error) {
      console.error('Error loading stats:', error)
    }
  }

  const handleDeleteNews = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) {
      return
    }

    try {
      setIsProcessing(true)
      await newsService.deleteNews(id)
      toast.success('Noticia eliminada exitosamente')
      loadNews()
      loadStats()
    } catch (error) {
      console.error('Error deleting news:', error)
      toast.error('Error al eliminar la noticia')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleNewsCreated = () => {
    loadNews()
    loadStats()
  }

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'markets': return 'Mercados'
      case 'crypto': return 'Cripto'
      case 'analysis': return 'Análisis'
      case 'regulation': return 'Regulación'
      default: return 'General'
    }
  }

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'markets': return 'success'
      case 'crypto': return 'warning'
      case 'analysis': return 'info'
      case 'regulation': return 'error'
      default: return 'default'
    }
  }

  const getPriorityText = (priority: number) => {
    switch (priority) {
      case 3: return 'Alta'
      case 2: return 'Media'
      default: return 'Baja'
    }
  }

  const getPriorityIcon = (priority: number) => {
    switch (priority) {
      case 3: return <FireIcon className="h-4 w-4 text-red-500" />
      case 2: return <ChartBarIcon className="h-4 w-4 text-yellow-500" />
      default: return <NewspaperIcon className="h-4 w-4 text-gray-500" />
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
            <h1 className="text-2xl font-semibold text-gray-900">Noticias del Mercado</h1>
            <p className="text-sm text-gray-600">
              Gestión de noticias y contenido para la aplicación móvil
            </p>
          </div>
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Nueva Noticia
          </Button>
        </div>

        {/* Estadísticas */}
        {stats && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-4">
            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <NewspaperIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Total</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.total_news}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <EyeIcon className="h-8 w-8 text-green-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Activas</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.active_news}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ChartBarIcon className="h-8 w-8 text-yellow-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Hoy</p>
                    <p className="text-2xl font-semibold text-gray-900">{stats.today_news}</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card>
              <div className="p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <FireIcon className="h-8 w-8 text-red-600" />
                  </div>
                  <div className="ml-5">
                    <p className="text-sm font-medium text-gray-500">Alta Prioridad</p>
                    <p className="text-2xl font-semibold text-gray-900">
                      {news.filter(n => n.priority === 3).length}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabla de noticias */}
        <Card padding="none">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando noticias...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Noticia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Prioridad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {news.map((newsItem) => (
                    <tr key={newsItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-start">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-2">
                              {newsItem.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-1">
                              {newsItem.summary || newsItem.content.substring(0, 100) + '...'}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getCategoryBadgeVariant(newsItem.category)}>
                          {getCategoryText(newsItem.category)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getPriorityIcon(newsItem.priority)}
                          <span className="ml-2 text-sm text-gray-900">
                            {getPriorityText(newsItem.priority)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={newsItem.is_active ? 'success' : 'default'}>
                          {newsItem.is_active ? 'Activa' : 'Inactiva'}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(newsItem.published_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedNews(newsItem)
                            setShowEditModal(true)
                          }}
                        >
                          <PencilIcon className="h-4 w-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => handleDeleteNews(newsItem.id)}
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

              {news.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <NewspaperIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay noticias
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Comienza creando tu primera noticia del mercado.
                  </p>
                  <div className="mt-6">
                    <Button onClick={() => setShowCreateModal(true)}>
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Nueva Noticia
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modales */}
        <CreateNewsModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleNewsCreated}
        />
      </div>
    </DashboardLayout>
  )
}
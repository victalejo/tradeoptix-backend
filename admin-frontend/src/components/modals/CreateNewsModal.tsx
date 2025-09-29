import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { newsService } from '@/lib/api'
import toast from 'react-hot-toast'

interface CreateNewsModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface NewsFormData {
  title: string
  content: string
  summary: string
  category: 'general' | 'markets' | 'crypto' | 'analysis' | 'regulation'
  priority: number
  image_url: string
  is_active: boolean
}

export const CreateNewsModal: React.FC<CreateNewsModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<NewsFormData>({
    title: '',
    content: '',
    summary: '',
    category: 'general',
    priority: 5,
    image_url: '',
    is_active: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('El título y contenido son obligatorios')
      return
    }

    setIsSubmitting(true)

    try {
      await newsService.createNews({
        title: formData.title.trim(),
        content: formData.content.trim(),
        summary: formData.summary.trim() || undefined,
        category: formData.category,
        priority: formData.priority,
        image_url: formData.image_url.trim() || undefined,
        is_active: formData.is_active
      })

      toast.success('Noticia creada exitosamente')
      handleClose()
      onSuccess()
    } catch (error: unknown) {
      console.error('Error creating news:', error)
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? (error.response.data as { error: string }).error
        : 'Error al crear la noticia'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      content: '',
      summary: '',
      category: 'general',
      priority: 5,
      image_url: '',
      is_active: true
    })
    onClose()
  }

  const footer = (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={handleClose}
        disabled={isSubmitting}
      >
        Cancelar
      </Button>
      <Button
        type="submit"
        form="create-news-form"
        disabled={isSubmitting}
        className="ml-3"
      >
        {isSubmitting ? 'Creando...' : 'Crear Noticia'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Noticia"
      footer={footer}
      size="lg"
    >
      <form id="create-news-form" onSubmit={handleSubmit} className="space-y-6">
        {/* Título */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Título *
          </label>
          <input
            type="text"
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Título de la noticia"
            required
          />
        </div>

        {/* Resumen */}
        <div>
          <label htmlFor="summary" className="block text-sm font-medium text-gray-700">
            Resumen
          </label>
          <textarea
            id="summary"
            value={formData.summary}
            onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
            rows={2}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Breve resumen de la noticia"
          />
        </div>

        {/* Contenido */}
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700">
            Contenido *
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            rows={8}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Contenido completo de la noticia"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as NewsFormData['category'] })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="general">General</option>
              <option value="markets">Mercados</option>
              <option value="crypto">Criptomonedas</option>
              <option value="analysis">Análisis</option>
              <option value="regulation">Regulación</option>
            </select>
          </div>

          {/* Prioridad */}
          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
              Prioridad
            </label>
            <select
              id="priority"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value={1}>Muy Baja (1)</option>
              <option value={3}>Baja (3)</option>
              <option value={5}>Media (5)</option>
              <option value={7}>Alta (7)</option>
              <option value={10}>Muy Alta (10)</option>
            </select>
          </div>
        </div>

        {/* URL de imagen */}
        <div>
          <label htmlFor="image_url" className="block text-sm font-medium text-gray-700">
            URL de Imagen
          </label>
          <input
            type="url"
            id="image_url"
            value={formData.image_url}
            onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="https://ejemplo.com/imagen.jpg"
          />
        </div>

        {/* Estado activo */}
        <div className="flex items-center">
          <input
            id="is_active"
            type="checkbox"
            checked={formData.is_active}
            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
          <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
            Publicar inmediatamente
          </label>
        </div>
      </form>
    </Modal>
  )
}
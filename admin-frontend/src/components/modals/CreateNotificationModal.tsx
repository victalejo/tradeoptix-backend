import React, { useState } from 'react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { notificationService } from '@/lib/api'
import toast from 'react-hot-toast'

interface CreateNotificationModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

interface NotificationFormData {
  title: string
  message: string
  type: 'info' | 'warning' | 'success' | 'error'
  category: 'general' | 'kyc' | 'market' | 'system'
  user_id: string
  expires_at: string
}

export const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState<NotificationFormData>({
    title: '',
    message: '',
    type: 'info',
    category: 'general',
    user_id: '',
    expires_at: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title.trim() || !formData.message.trim()) {
      toast.error('El título y mensaje son obligatorios')
      return
    }

    setIsSubmitting(true)

    try {
      const payload = {
        title: formData.title.trim(),
        message: formData.message.trim(),
        type: formData.type,
        category: formData.category,
        user_id: formData.user_id.trim() || undefined,
        expires_at: formData.expires_at || undefined
      }

      await notificationService.createNotification(payload)

      toast.success('Notificación creada exitosamente')
      handleClose()
      onSuccess()
    } catch (error: unknown) {
      console.error('Error creating notification:', error)
      const errorMessage = error && typeof error === 'object' && 'response' in error && 
        error.response && typeof error.response === 'object' && 'data' in error.response &&
        error.response.data && typeof error.response.data === 'object' && 'error' in error.response.data
        ? (error.response.data as { error: string }).error
        : 'Error al crear la notificación'
      toast.error(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleClose = () => {
    setFormData({
      title: '',
      message: '',
      type: 'info',
      category: 'general',
      user_id: '',
      expires_at: ''
    })
    onClose()
  }

  // Calcular fecha por defecto (30 días desde ahora)
  const getDefaultExpiryDate = () => {
    const date = new Date()
    date.setDate(date.getDate() + 30)
    return date.toISOString().slice(0, 16)
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
        form="create-notification-form"
        disabled={isSubmitting}
        className="ml-3"
      >
        {isSubmitting ? 'Creando...' : 'Crear Notificación'}
      </Button>
    </>
  )

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Nueva Notificación"
      footer={footer}
      size="lg"
    >
      <form id="create-notification-form" onSubmit={handleSubmit} className="space-y-6">
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
            placeholder="Título de la notificación"
            required
          />
        </div>

        {/* Mensaje */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
            Mensaje *
          </label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Contenido de la notificación"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Tipo */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700">
              Tipo
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as NotificationFormData['type'] })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="info">Información</option>
              <option value="warning">Advertencia</option>
              <option value="success">Éxito</option>
              <option value="error">Error</option>
            </select>
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              Categoría
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as NotificationFormData['category'] })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            >
              <option value="general">General</option>
              <option value="kyc">KYC/Verificación</option>
              <option value="market">Mercado</option>
              <option value="system">Sistema</option>
            </select>
          </div>
        </div>

        {/* Usuario específico */}
        <div>
          <label htmlFor="user_id" className="block text-sm font-medium text-gray-700">
            ID de Usuario (opcional)
          </label>
          <input
            type="text"
            id="user_id"
            value={formData.user_id}
            onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Dejar vacío para enviar a todos los usuarios"
          />
          <p className="mt-1 text-sm text-gray-500">
            Si se especifica, la notificación se enviará solo a ese usuario. Si se deja vacío, se enviará a todos.
          </p>
        </div>

        {/* Fecha de expiración */}
        <div>
          <label htmlFor="expires_at" className="block text-sm font-medium text-gray-700">
            Fecha de Expiración (opcional)
          </label>
          <input
            type="datetime-local"
            id="expires_at"
            value={formData.expires_at}
            onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
            min={new Date().toISOString().slice(0, 16)}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
          <p className="mt-1 text-sm text-gray-500">
            Si no se especifica, la notificación no expirará automáticamente.
          </p>
        </div>

        {/* Botón para establecer fecha por defecto */}
        <div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setFormData({ ...formData, expires_at: getDefaultExpiryDate() })}
          >
            Expirar en 30 días
          </Button>
        </div>
      </form>
    </Modal>
  )
}
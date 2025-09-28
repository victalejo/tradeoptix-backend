'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { kycService } from '@/lib/api'
import { KYCDocument } from '@/types/api'
import { 
  DocumentCheckIcon,
  EyeIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { 
  formatDate, 
  formatFileSize, 
  getKYCDocumentTypeText,
  getKYCStatusText
} from '@/lib/utils'
import toast from 'react-hot-toast'

export default function KYCPage() {
  const [documents, setDocuments] = useState<KYCDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState<KYCDocument | null>(null)
  const [showDocumentModal, setShowDocumentModal] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [rejectReason, setRejectReason] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    loadDocuments()
  }, [])

  const loadDocuments = async () => {
    try {
      setIsLoading(true)
      
      // Simulamos documentos KYC para el frontend
      const mockDocuments: KYCDocument[] = [
        {
          id: '1',
          user_id: '1',
          document_type: 'cedula_front',
          file_path: '/uploads/1/cedula_front.jpg',
          original_name: 'cedula_frente.jpg',
          file_size: 2048576,
          mime_type: 'image/jpeg',
          status: 'pending',
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          user_id: '1',
          document_type: 'cedula_back',
          file_path: '/uploads/1/cedula_back.jpg',
          original_name: 'cedula_reverso.jpg',
          file_size: 1987654,
          mime_type: 'image/jpeg',
          status: 'pending',
          created_at: '2024-01-15T10:32:00Z',
          updated_at: '2024-01-15T10:32:00Z'
        },
        {
          id: '3',
          user_id: '1',
          document_type: 'face_photo',
          file_path: '/uploads/1/face_photo.jpg',
          original_name: 'foto_facial.jpg',
          file_size: 1456789,
          mime_type: 'image/jpeg',
          status: 'pending',
          created_at: '2024-01-15T10:35:00Z',
          updated_at: '2024-01-15T10:35:00Z'
        },
        {
          id: '4',
          user_id: '2',
          document_type: 'cedula_front',
          file_path: '/uploads/2/cedula_front.jpg',
          original_name: 'documento_frente.jpg',
          file_size: 2234567,
          mime_type: 'image/jpeg',
          status: 'approved',
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-16T09:15:00Z'
        }
      ]

      setDocuments(mockDocuments)
    } catch (error: unknown) {
      console.error('Error loading documents:', error)
      toast.error('Error cargando documentos KYC')
      setDocuments([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleApproveDocument = async (document: KYCDocument) => {
    try {
      setIsProcessing(true)
      await kycService.approveDocument(document.id)
      
      // Actualizar el documento en el estado
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === document.id 
            ? { ...doc, status: 'approved', updated_at: new Date().toISOString() }
            : doc
        )
      )
      
      toast.success('Documento aprobado exitosamente')
    } catch (error: unknown) {
      console.error('Error approving document:', error)
      toast.error('Error al aprobar documento')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRejectDocument = async () => {
    if (!selectedDocument || !rejectReason.trim()) {
      toast.error('Por favor ingrese una razón de rechazo')
      return
    }

    try {
      setIsProcessing(true)
      await kycService.rejectDocument(selectedDocument.id, rejectReason)
      
      // Actualizar el documento en el estado
      setDocuments(docs => 
        docs.map(doc => 
          doc.id === selectedDocument.id 
            ? { 
                ...doc, 
                status: 'rejected', 
                rejection_reason: rejectReason,
                updated_at: new Date().toISOString() 
              }
            : doc
        )
      )
      
      setShowRejectModal(false)
      setRejectReason('')
      setSelectedDocument(null)
      toast.success('Documento rechazado')
    } catch (error: unknown) {
      console.error('Error rejecting document:', error)
      toast.error('Error al rechazar documento')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleViewDocument = (document: KYCDocument) => {
    setSelectedDocument(document)
    setShowDocumentModal(true)
  }

  const handleDownloadDocument = async (document: KYCDocument) => {
    try {
      // Simular descarga
      toast.success(`Descargando ${document.original_name}`)
    } catch (error: unknown) {
      console.error('Error downloading document:', error)
      toast.error('Error al descargar documento')
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'rejected':
        return <XCircleIcon className="h-5 w-5 text-red-500" />
      case 'pending':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  // Modal de visualización de documento
  const DocumentModal = () => {
    if (!selectedDocument) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {getKYCDocumentTypeText(selectedDocument.document_type)}
            </h3>
            <button
              onClick={() => setShowDocumentModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar</span>
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant={getStatusBadgeVariant(selectedDocument.status)}>
                {getKYCStatusText(selectedDocument.status)}
              </Badge>
              <span className="text-sm text-gray-500">
                {formatFileSize(selectedDocument.file_size)}
              </span>
              <span className="text-sm text-gray-500">
                {formatDate(selectedDocument.created_at)}
              </span>
            </div>
            
            {/* Simulación de imagen del documento */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <DocumentCheckIcon className="mx-auto h-24 w-24 text-gray-400" />
              <p className="mt-2 text-sm text-gray-600">
                Vista previa del documento: {selectedDocument.original_name}
              </p>
              <p className="text-xs text-gray-500">
                (En producción se mostraría la imagen real del documento)
              </p>
            </div>
            
            {selectedDocument.rejection_reason && (
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-800">
                  <strong>Razón de rechazo:</strong> {selectedDocument.rejection_reason}
                </p>
              </div>
            )}
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowDocumentModal(false)}
            >
              Cerrar
            </Button>
            <Button
              variant="outline"
              onClick={() => handleDownloadDocument(selectedDocument)}
            >
              <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
              Descargar
            </Button>
            {selectedDocument.status === 'pending' && (
              <>
                <Button
                  variant="danger"
                  onClick={() => {
                    setShowDocumentModal(false)
                    setShowRejectModal(true)
                  }}
                >
                  Rechazar
                </Button>
                <Button
                  variant="success"
                  onClick={() => handleApproveDocument(selectedDocument)}
                  isLoading={isProcessing}
                >
                  Aprobar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Modal de rechazo
  const RejectModal = () => {
    if (!selectedDocument) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-md shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Rechazar Documento
            </h3>
            <button
              onClick={() => {
                setShowRejectModal(false)
                setRejectReason('')
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar</span>
              ✕
            </button>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Razón del rechazo
            </label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="Describa la razón por la cual se rechaza el documento..."
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => {
                setShowRejectModal(false)
                setRejectReason('')
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectDocument}
              isLoading={isProcessing}
              disabled={!rejectReason.trim()}
            >
              Rechazar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Documentos KYC</h1>
          <p className="text-sm text-gray-600">
            Revisión y aprobación de documentos de verificación de identidad
          </p>
        </div>

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
          <Card>
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <ClockIcon className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Pendientes</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {documents.filter(doc => doc.status === 'pending').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Aprobados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {documents.filter(doc => doc.status === 'approved').length}
                </p>
              </div>
            </div>
          </Card>
          
          <Card>
            <div className="flex items-center p-6">
              <div className="flex-shrink-0">
                <XCircleIcon className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-5">
                <p className="text-sm font-medium text-gray-500">Rechazados</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {documents.filter(doc => doc.status === 'rejected').length}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Tabla de documentos */}
        <Card padding="none">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando documentos...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Archivo
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
                  {documents.map((document) => (
                    <tr key={document.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getStatusIcon(document.status)}
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {getKYCDocumentTypeText(document.document_type)}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {document.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {document.user_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{document.original_name}</div>
                        <div className="text-sm text-gray-500">
                          {formatFileSize(document.file_size)} • {document.mime_type}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(document.status)}>
                          {getKYCStatusText(document.status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(document.created_at, 'dd/MM/yyyy HH:mm')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDocument(document)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                        {document.status === 'pending' && (
                          <>
                            <Button
                              variant="success"
                              size="sm"
                              onClick={() => handleApproveDocument(document)}
                              isLoading={isProcessing}
                            >
                              <CheckCircleIcon className="h-4 w-4 mr-1" />
                              Aprobar
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => {
                                setSelectedDocument(document)
                                setShowRejectModal(true)
                              }}
                            >
                              <XCircleIcon className="h-4 w-4 mr-1" />
                              Rechazar
                            </Button>
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {documents.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <DocumentCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No hay documentos KYC
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se han encontrado documentos para revisar.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modales */}
        {showDocumentModal && <DocumentModal />}
        {showRejectModal && <RejectModal />}
      </div>
    </DashboardLayout>
  )
}
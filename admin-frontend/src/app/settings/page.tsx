'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { healthService } from '@/lib/api'
import toast from 'react-hot-toast'

export default function SettingsPage() {
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'checking'>('checking')
  const [apiUrl, setApiUrl] = useState<string>('')

  useEffect(() => {
    checkBackendStatus()
    setApiUrl(process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080')
  }, [])

  const checkBackendStatus = async () => {
    try {
      setBackendStatus('checking')
      await healthService.check()
      setBackendStatus('connected')
    } catch (error) {
      console.error('Backend health check failed:', error)
      setBackendStatus('disconnected')
    }
  }

  const handleRefreshStatus = () => {
    toast.promise(
      checkBackendStatus(),
      {
        loading: 'Verificando conexión...',
        success: 'Conexión verificada correctamente',
        error: 'Error al verificar la conexión'
      }
    )
  }
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Configuración</h1>
          <p className="text-sm text-gray-600">
            Ajustes y configuración del sistema TradeOptix
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Configuración del sistema */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Sistema</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Versión del Backend</label>
                  <p className="text-sm text-gray-900">v1.0.0</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">API URL</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">{apiUrl}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Estado del Backend</label>
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center">
                      <div className={`h-2 w-2 rounded-full mr-2 ${
                        backendStatus === 'connected' ? 'bg-green-400' :
                        backendStatus === 'disconnected' ? 'bg-red-400' :
                        'bg-yellow-400'
                      }`}></div>
                      <span className="text-sm text-gray-900">
                        {backendStatus === 'connected' ? 'Conectado' :
                         backendStatus === 'disconnected' ? 'Desconectado' :
                         'Verificando...'}
                      </span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleRefreshStatus}
                      disabled={backendStatus === 'checking'}
                    >
                      Verificar
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Configuración de KYC */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">KYC</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Tamaño máximo de archivo</label>
                  <p className="text-sm text-gray-900">5 MB</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Formatos permitidos</label>
                  <p className="text-sm text-gray-900">JPG, PNG</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Documentos requeridos</label>
                  <div className="text-sm text-gray-900">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Cédula (frente y reverso)</li>
                      <li>Foto facial</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Información del admin */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Información del Administrador</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Email del Administrador</label>
                  <p className="text-sm text-gray-900 font-mono bg-gray-50 px-2 py-1 rounded">admin@tradeoptix.app</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rol</label>
                  <p className="text-sm text-gray-900">Administrador del Sistema</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Permisos</label>
                  <div className="text-sm text-gray-900">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Gestión de usuarios</li>
                      <li>Validación KYC</li>
                      <li>Visualización de estadísticas</li>
                      <li>Configuración del sistema</li>
                    </ul>
                  </div>
                </div>
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <p className="text-sm text-blue-800">
                    <strong>Información:</strong> Use las credenciales correctas configuradas en la base de datos.
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Enlaces útiles */}
          <Card>
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Enlaces Útiles</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                <a
                  href={`${apiUrl}/docs/index.html`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-blue-900">Documentación de la API</div>
                  <div className="text-sm text-blue-600">Swagger UI del backend</div>
                </a>
                <a
                  href={`${apiUrl}/health`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-3 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                >
                  <div className="font-medium text-green-900">Health Check</div>
                  <div className="text-sm text-green-600">Estado del servidor backend</div>
                </a>
                <div className="block p-3 bg-gray-50 rounded-md">
                  <div className="font-medium text-gray-900">Repositorio en GitHub</div>
                  <div className="text-sm text-gray-600">Código fuente del proyecto</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
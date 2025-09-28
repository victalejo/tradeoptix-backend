'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { User } from '@/types/api'
import { 
  MagnifyingGlassIcon,
  EyeIcon,
  UserIcon
} from '@heroicons/react/24/outline'
import { 
  formatDate, 
  formatPhoneNumber, 
  getKYCStatusText, 
  getDocumentTypeText,
  getInitials 
} from '@/lib/utils'
import toast from 'react-hot-toast'

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [showUserModal, setShowUserModal] = useState(false)

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      
      // Como el backend no tiene implementado el endpoint de admin/users,
      // simulamos datos para el frontend
      const mockUsers: User[] = [
        {
          id: '1',
          first_name: 'Juan',
          last_name: 'Pérez',
          document_type: 'cedula',
          document_number: '12345678',
          email: 'juan@example.com',
          phone_number: '+573001234567',
          address: 'Calle 123 #45-67, Bogotá',
          role: 'user',
          kyc_status: 'pending',
          email_verified: true,
          created_at: '2024-01-15T10:30:00Z',
          updated_at: '2024-01-15T10:30:00Z'
        },
        {
          id: '2',
          first_name: 'María',
          last_name: 'García',
          document_type: 'cedula',
          document_number: '87654321',
          email: 'maria@example.com',
          phone_number: '+573009876543',
          address: 'Carrera 45 #67-89, Medellín',
          role: 'user',
          kyc_status: 'approved',
          email_verified: true,
          created_at: '2024-01-14T14:20:00Z',
          updated_at: '2024-01-16T09:15:00Z'
        },
        {
          id: '3',
          first_name: 'Carlos',
          last_name: 'Rodríguez',
          document_type: 'pasaporte',
          document_number: 'AB123456',
          email: 'carlos@example.com',
          phone_number: '+573005551234',
          address: 'Avenida 80 #12-34, Cali',
          role: 'user',
          kyc_status: 'rejected',
          email_verified: false,
          created_at: '2024-01-13T16:45:00Z',
          updated_at: '2024-01-17T11:30:00Z'
        }
      ]

      setUsers(mockUsers)
    } catch (error: unknown) {
      console.error('Error loading users:', error)
      toast.error('Error cargando usuarios')
      setUsers([])
    } finally {
      setIsLoading(false)
    }
  }

  const filteredUsers = users.filter(user =>
    user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.document_number.includes(searchTerm)
  )

  const handleViewUser = (user: User) => {
    setSelectedUser(user)
    setShowUserModal(true)
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'success'
      case 'rejected': return 'error'
      case 'pending': return 'warning'
      default: return 'default'
    }
  }

  const UserModal = () => {
    if (!selectedUser) return null

    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-2xl shadow-lg rounded-md bg-white">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Detalles del Usuario
            </h3>
            <button
              onClick={() => setShowUserModal(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Cerrar</span>
              ✕
            </button>
          </div>
          
          <div className="space-y-6">
            {/* Información personal */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">
                Información Personal
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Nombre</label>
                  <p className="text-sm text-gray-900">
                    {selectedUser.first_name} {selectedUser.last_name}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email</label>
                  <p className="text-sm text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Teléfono</label>
                  <p className="text-sm text-gray-900">
                    {formatPhoneNumber(selectedUser.phone_number)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Documento</label>
                  <p className="text-sm text-gray-900">
                    {getDocumentTypeText(selectedUser.document_type)} - {selectedUser.document_number}
                  </p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium text-gray-700">Dirección</label>
                  <p className="text-sm text-gray-900">{selectedUser.address}</p>
                </div>
              </div>
            </div>

            {/* Estados */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Estado</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">KYC</label>
                  <div className="mt-1">
                    <Badge variant={getStatusBadgeVariant(selectedUser.kyc_status)}>
                      {getKYCStatusText(selectedUser.kyc_status)}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Email Verificado</label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.email_verified ? 'success' : 'warning'}>
                      {selectedUser.email_verified ? 'Verificado' : 'Pendiente'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Rol</label>
                  <div className="mt-1">
                    <Badge variant={selectedUser.role === 'admin' ? 'info' : 'default'}>
                      {selectedUser.role === 'admin' ? 'Administrador' : 'Usuario'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div>
              <h4 className="text-md font-medium text-gray-900 mb-3">Fechas</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">Registro</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedUser.created_at)}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700">Última actualización</label>
                  <p className="text-sm text-gray-900">
                    {formatDate(selectedUser.updated_at)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => setShowUserModal(false)}
            >
              Cerrar
            </Button>
            <Button
              onClick={() => {
                // Navegar a la página de KYC del usuario
                window.location.href = `/kyc?user=${selectedUser.id}`
              }}
            >
              Ver KYC
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
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Usuarios</h1>
            <p className="text-sm text-gray-600">
              Gestión de usuarios registrados en TradeOptix
            </p>
          </div>
        </div>

        {/* Filtros y búsqueda */}
        <Card>
          <div className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar por nombre, email o documento..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Tabla de usuarios */}
        <Card padding="none">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">Cargando usuarios...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Usuario
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contacto
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Documento
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado KYC
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registro
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-indigo-600 flex items-center justify-center">
                              <span className="text-sm font-medium text-white">
                                {getInitials(user.first_name, user.last_name)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500 capitalize">
                              {user.role}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{user.email}</div>
                        <div className="text-sm text-gray-500">
                          {formatPhoneNumber(user.phone_number)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {getDocumentTypeText(user.document_type)}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.document_number}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusBadgeVariant(user.kyc_status)}>
                          {getKYCStatusText(user.kyc_status)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.created_at, 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUser(user)}
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          Ver
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredUsers.length === 0 && !isLoading && (
                <div className="text-center py-12">
                  <UserIcon className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No se encontraron usuarios
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {searchTerm ? 'Intenta con otros términos de búsqueda.' : 'No hay usuarios registrados.'}
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>

        {/* Modal de detalles */}
        {showUserModal && <UserModal />}
      </div>
    </DashboardLayout>
  )
}
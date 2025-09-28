import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { format, formatDistanceToNow, parseISO } from "date-fns"
import { es } from "date-fns/locale"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formatear fecha para mostrar en la UI
 */
export function formatDate(date: string | Date, formatStr: string = "PPP") {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: es })
}

/**
 * Formatear fecha relativa (hace X tiempo)
 */
export function formatRelativeDate(date: string | Date) {
  const dateObj = typeof date === "string" ? parseISO(date) : date
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es })
}

/**
 * Formatear número de teléfono
 */
export function formatPhoneNumber(phone: string) {
  // Formato colombiano: +57 300 123 4567
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.startsWith("57")) {
    const number = cleaned.slice(2)
    return `+57 ${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
  }
  return phone
}

/**
 * Formatear tamaño de archivo
 */
export function formatFileSize(bytes: number) {
  const units = ["B", "KB", "MB", "GB"]
  let size = bytes
  let unitIndex = 0
  
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

/**
 * Obtener color según estado KYC
 */
export function getKYCStatusColor(status: "pending" | "approved" | "rejected") {
  switch (status) {
    case "pending":
      return "text-yellow-600 bg-yellow-100"
    case "approved":
      return "text-green-600 bg-green-100"
    case "rejected":
      return "text-red-600 bg-red-100"
    default:
      return "text-gray-600 bg-gray-100"
  }
}

/**
 * Obtener texto en español para estado KYC
 */
export function getKYCStatusText(status: "pending" | "approved" | "rejected") {
  switch (status) {
    case "pending":
      return "Pendiente"
    case "approved":
      return "Aprobado"
    case "rejected":
      return "Rechazado"
    default:
      return "Desconocido"
  }
}

/**
 * Obtener texto en español para tipo de documento
 */
export function getDocumentTypeText(type: "cedula" | "pasaporte") {
  switch (type) {
    case "cedula":
      return "Cédula de Ciudadanía"
    case "pasaporte":
      return "Pasaporte"
    default:
      return type
  }
}

/**
 * Obtener texto en español para tipo de documento KYC
 */
export function getKYCDocumentTypeText(type: "cedula_front" | "cedula_back" | "face_photo") {
  switch (type) {
    case "cedula_front":
      return "Cédula - Frente"
    case "cedula_back":
      return "Cédula - Reverso"
    case "face_photo":
      return "Foto Facial"
    default:
      return type
  }
}

/**
 * Validar email
 */
export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generar iniciales del nombre
 */
export function getInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
}

/**
 * Truncar texto
 */
export function truncateText(text: string, maxLength: number = 50) {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}
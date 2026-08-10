export interface WhatsAppSettings {
  businessPhone?: string
  businessId?: string
  displayName?: string

  // Connection information
  isConnected?: boolean
  phoneNumber?: string
  phoneNumberId?: string
  wabaId?: string
  webhookVerified?: boolean

  // Account metadata
  businessName?: string
  templateCount?: number
  lastSync?: string
}

export interface WhatsAppTemplate {
  id: number
  name: string
  message: string
  createdAt: string
  updatedAt: string
}

export interface WhatsAppTemplatePayload {
  name: string
  message: string
}

export interface WhatsAppSendPayload {
  contactIds: number[]
  templateId?: number
  customMessage?: string
}

export interface WhatsAppSendResult {
  success: boolean
  sentCount: number
  failedCount?: number
  errors?: string[]
}
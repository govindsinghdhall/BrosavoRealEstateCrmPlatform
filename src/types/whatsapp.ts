export interface WhatsAppSettings {
  status?: 'connected' | 'disconnected'
  isConnected?: boolean
  businessPhone?: string
  phoneNumber?: string
  businessId?: string
  metaBusinessId?: string
  displayName?: string
  phoneNumberId?: string
  wabaId?: string
  webhookVerified?: boolean
  businessName?: string
  templateCount?: number
  lastSync?: string
  connectedAt?: string
  disconnectedAt?: string | null
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

export interface WhatsAppConversation {
  id: number
  contactId?: number | null
  leadId?: number | null
  phoneNumber: string
  customerPhone?: string
  contactName?: string | null
  lastMessage?: string
  lastMessageAt: string
  unreadCount: number
  status?: string
}

export interface WhatsAppThreadMessage {
  id: number
  conversationId: number
  wamid: string
  direction: 'inbound' | 'outbound'
  senderPhone: string
  recipientPhone: string
  messageType: string
  text: string
  status: string
  errorMessage?: string | null
  timestamp: string
  createdAt: string
}

export interface WhatsAppTestResult {
  ok: boolean
  message: string
  displayName?: string
  businessPhone?: string
  wabaId?: string
  phoneNumberId?: string
}

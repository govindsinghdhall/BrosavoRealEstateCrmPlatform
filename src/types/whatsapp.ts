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

export type WhatsAppTemplateCategory =
  | 'MARKETING'
  | 'UTILITY'
  | 'AUTHENTICATION'

export type WhatsAppTemplateStatus =
  | 'DRAFT'
  | 'PENDING'
  | 'APPROVED'
  | 'REJECTED'
  | 'PAUSED'
  | 'DISABLED'
  | 'IN_REVIEW'
  | string

export interface WhatsAppTemplateButton {
  type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER' | 'COPY_CODE' | 'FLOW' | string
  text: string
  url?: string
  phone_number?: string
  example?: string[]
}

export interface WhatsAppTemplateComponent {
  type: 'HEADER' | 'BODY' | 'FOOTER' | 'BUTTONS' | string
  text?: string
  format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT' | string
  example?: unknown
  buttons?: WhatsAppTemplateButton[]
}

/** Canonical Meta/CRM WhatsApp template record returned by the API. */
export interface WhatsAppMetaTemplate {
  id: number
  templateId?: string | null
  name: string
  language: string
  status: WhatsAppTemplateStatus
  category?: WhatsAppTemplateCategory | string
  quality?: string
  components?: WhatsAppTemplateComponent[]
  variables?: string[]
  rejectionReason?: string | null
  createdAt?: string
  updatedAt?: string
}

/** @deprecated Use WhatsAppMetaTemplate. Kept for transitional imports. */
export type WhatsAppTemplate = WhatsAppMetaTemplate

export interface WhatsAppTemplatePayload {
  name: string
  language: string
  category: WhatsAppTemplateCategory
  header?: {
    format?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'
    text?: string
  }
  body: string
  footer?: string
  buttons?: Array<{
    type: 'QUICK_REPLY' | 'URL' | 'PHONE_NUMBER'
    text: string
    url?: string
    phone_number?: string
  }>
  variableExamples?: Record<string, string>
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

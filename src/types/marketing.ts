export type MarketingTabId =
  | 'whatsapp'
  | 'google'
  | 'ai'
  | 'analytics'
  | 'settings'

export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'cancelled'
export type ReviewReplyStatus = 'pending' | 'approved' | 'posted' | 'ignored'
export type ContentStatus = 'draft' | 'scheduled' | 'published' | 'failed'
export type ThemePreference = 'system' | 'light' | 'dark'
export type AiTone = 'professional' | 'friendly' | 'formal'

export interface MarketingSummary {
  connectedPlatforms: number
  totalPlatforms: number
  googleReviews: number
  googleReviewsTrend: string
  pendingAiReplies: number
  scheduledCampaigns: number
  averageRating: number
  marketingScore: number
}

export interface WhatsAppCampaign {
  id: number | string
  campaignName: string
  audience: string
  status: CampaignStatus
  scheduleAt: string | null
  statistics?: { sent?: number }
  provider: string
  campaignType: string
}

export interface GoogleBusinessProfile {
  connected: boolean
  name: string
  address: string
  logoUrl: string
  verified: boolean
  averageRating: number
  totalReviews: number
  googleMapsUrl: string
  accountId?: string | null
  locationId?: string | null
}

export interface ReviewStats {
  pendingReplies: number
  repliedToday: number
  averageRating: number
  newReviews: number
}

export interface GoogleReview {
  id: number | string
  customerName: string
  avatarUrl: string
  rating: number
  review: string
  aiReply: string
  status: ReviewReplyStatus
  date: string
  hasReply?: boolean
}

export interface ContentItem {
  id: number | string
  title: string
  type: string
  thumbnailUrl: string
  imageUrl?: string
  status: ContentStatus
  scheduledDate: string | null
  contentType?: string
}

export interface GooglePost {
  id: number | string
  title: string
  imageUrl: string
  publishDate: string | null
  status: ContentStatus
  views: number
}

export interface GooglePostsSummary {
  scheduled: number
  published: number
  drafts: number
}

export interface MarketingSettingsState {
  googleConnected: boolean
  enableAiReplies: boolean
  reviewApprovalRequired: boolean
  emailNotifications: boolean
  notificationEmail?: string | null
  autoSyncReviews?: boolean
  autoFetchInterval?: number
  defaultAiTone?: AiTone
  theme: ThemePreference
}

export interface ChartPoint {
  label: string
  value: number
}

export interface NamedValue {
  name: string
  value: number
}

export interface MarketingAnalytics {
  reviewsTrend: ChartPoint[]
  ratingTrend: ChartPoint[]
  ratingDistribution: NamedValue[]
  popularReviewKeywords: NamedValue[]
  sentiment: NamedValue[]
}

export interface MarketingDashboard {
  summary: MarketingSummary
  googleBusiness: GoogleBusinessProfile
  reviewStats: ReviewStats
  postsSummary: GooglePostsSummary
  settings: MarketingSettingsState
  whatsappConfigured: boolean
}

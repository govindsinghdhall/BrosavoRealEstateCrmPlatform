import type {
  ContentItem,
  GoogleReview,
  MarketingAnalytics,
  MarketingDashboard,
  MarketingSettingsState,
  WhatsAppCampaign,
} from '@/types/marketing'
import type { ApiEnvelope } from '../types/backend'
import { apiClient } from '../client'
import { ENDPOINTS } from '../endpoints'
import { unwrap, unwrapPaginated } from '../utils/response'

function mapReview(raw: Record<string, unknown>): GoogleReview {
  return {
    id: (raw._id ?? raw.id) as string | number,
    customerName: String(raw.reviewerName ?? ''),
    avatarUrl: String(raw.reviewerAvatar ?? ''),
    rating: Number(raw.rating ?? 0),
    review: String(raw.reviewText ?? ''),
    aiReply: String(raw.replyText ?? ''),
    status: (raw.status as GoogleReview['status']) || 'pending',
    date: String(raw.reviewDate ?? raw.createdAt ?? new Date().toISOString()),
    hasReply: Boolean(raw.hasReply),
  }
}

function mapCampaign(raw: Record<string, unknown>): WhatsAppCampaign {
  return {
    id: (raw._id ?? raw.id) as string | number,
    campaignName: String(raw.campaignName ?? ''),
    audience: String(raw.audience ?? ''),
    status: (raw.status as WhatsAppCampaign['status']) || 'draft',
    scheduleAt: (raw.scheduleAt as string | null) ?? null,
    statistics: (raw.statistics as { sent?: number }) || {},
    provider: String(raw.provider ?? 'whatsapp'),
    campaignType: String(raw.campaignType ?? ''),
  }
}

function mapContent(raw: Record<string, unknown>): ContentItem {
  return {
    id: (raw._id ?? raw.id) as string | number,
    title: String(raw.title ?? ''),
    type: String(raw.contentType ?? 'photo'),
    contentType: String(raw.contentType ?? 'photo'),
    thumbnailUrl: String(raw.thumbnailUrl ?? raw.imageUrl ?? ''),
    imageUrl: String(raw.imageUrl ?? ''),
    status: (raw.status as ContentItem['status']) || 'draft',
    scheduledDate: (raw.scheduleAt as string | null) ?? null,
  }
}

export const marketingService = {
  async getDashboard(): Promise<MarketingDashboard> {
    const { data } = await apiClient.get<ApiEnvelope<MarketingDashboard>>(ENDPOINTS.MARKETING.DASHBOARD)
    return unwrap(data)
  },

  async getSettings(): Promise<MarketingSettingsState> {
    const { data } = await apiClient.get<ApiEnvelope<Record<string, unknown>>>(ENDPOINTS.MARKETING.SETTINGS)
    const raw = unwrap(data)
    return {
      googleConnected: false,
      enableAiReplies: Boolean(raw.enableAiReply),
      reviewApprovalRequired: Boolean(raw.reviewApprovalRequired),
      emailNotifications: Boolean(raw.emailNotification),
      notificationEmail: (raw.notificationEmail as string | null) ?? null,
      autoSyncReviews: Boolean(raw.autoSyncReviews),
      autoFetchInterval: Number(raw.autoFetchInterval ?? 30),
      defaultAiTone: (raw.defaultAiTone as MarketingSettingsState['defaultAiTone']) || 'professional',
      theme: (raw.theme as MarketingSettingsState['theme']) || 'system',
    }
  },

  async updateSettings(payload: Partial<{
    enableAiReply: boolean
    reviewApprovalRequired: boolean
    emailNotification: boolean
    notificationEmail: string | null
    autoSyncReviews: boolean
    autoFetchInterval: number
    defaultAiTone: string
    theme: string
  }>) {
    const { data } = await apiClient.put<ApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.MARKETING.SETTINGS,
      payload,
    )
    return unwrap(data)
  },

  async getGoogleLoginUrl(): Promise<string> {
    const { data } = await apiClient.get<ApiEnvelope<{ url: string }>>(ENDPOINTS.MARKETING.GOOGLE_LOGIN)
    return unwrap(data).url
  },

  async disconnectGoogle() {
    const { data } = await apiClient.post(ENDPOINTS.MARKETING.GOOGLE_DISCONNECT)
    return unwrap(data)
  },

  async syncReviews() {
    const { data } = await apiClient.post(ENDPOINTS.MARKETING.REVIEWS_SYNC)
    return unwrap(data)
  },

  async listReviews(params?: { page?: number; limit?: number; status?: string; search?: string }) {
    const { data } = await apiClient.get<ApiEnvelope<Record<string, unknown>[]>>(ENDPOINTS.MARKETING.REVIEWS, {
      params,
    })
    const page = unwrapPaginated(data)
    return {
      ...page,
      data: page.data.map(mapReview),
    }
  },

  async generateAiReply(id: string | number) {
    const { data } = await apiClient.post<ApiEnvelope<{ review: Record<string, unknown>; aiReply: unknown }>>(
      ENDPOINTS.MARKETING.REVIEW_GENERATE_AI(id),
    )
    const result = unwrap(data)
    return { review: mapReview(result.review), aiReply: result.aiReply }
  },

  async updateReviewReply(id: string | number, replyText: string) {
    const { data } = await apiClient.put<ApiEnvelope<Record<string, unknown>>>(ENDPOINTS.MARKETING.REVIEW(id), {
      replyText,
    })
    return mapReview(unwrap(data))
  },

  async postReviewReply(id: string | number) {
    const { data } = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.MARKETING.REVIEW_REPLY(id),
    )
    return mapReview(unwrap(data))
  },

  async listContent() {
    const { data } = await apiClient.get<ApiEnvelope<Record<string, unknown>[]>>(ENDPOINTS.MARKETING.CONTENT)
    return unwrap(data).map(mapContent)
  },

  async uploadContent(file: File, meta?: { title?: string; description?: string }) {
    const form = new FormData()
    form.append('file', file)
    if (meta?.title) form.append('title', meta.title)
    if (meta?.description) form.append('description', meta.description)
    const { data } = await apiClient.post<ApiEnvelope<Record<string, unknown>>>(
      ENDPOINTS.MARKETING.CONTENT_UPLOAD,
      form,
    )
    return mapContent(unwrap(data))
  },

  async publishContent(id: string | number) {
    const { data } = await apiClient.post(ENDPOINTS.MARKETING.CONTENT_PUBLISH(id))
    return mapContent(unwrap(data) as Record<string, unknown>)
  },

  async scheduleContent(id: string | number, scheduleAt: string) {
    const { data } = await apiClient.post(ENDPOINTS.MARKETING.CONTENT_SCHEDULE(id), { scheduleAt })
    return mapContent(unwrap(data) as Record<string, unknown>)
  },

  async deleteContent(id: string | number) {
    const { data } = await apiClient.delete(ENDPOINTS.MARKETING.CONTENT_ITEM(id))
    return unwrap(data)
  },

  async listCampaigns() {
    const { data } = await apiClient.get<ApiEnvelope<Record<string, unknown>[]>>(ENDPOINTS.MARKETING.CAMPAIGNS)
    return unwrap(data).map(mapCampaign)
  },

  async createCampaign(payload: {
    campaignName: string
    provider: string
    campaignType: string
    audience: string
    scheduleAt?: string | null
  }) {
    const { data } = await apiClient.post(ENDPOINTS.MARKETING.CAMPAIGNS, payload)
    return mapCampaign(unwrap(data) as Record<string, unknown>)
  },

  async getReviewAnalytics(): Promise<MarketingAnalytics> {
    const { data } = await apiClient.get<ApiEnvelope<MarketingAnalytics>>(ENDPOINTS.MARKETING.ANALYTICS_REVIEWS)
    return unwrap(data)
  },
}

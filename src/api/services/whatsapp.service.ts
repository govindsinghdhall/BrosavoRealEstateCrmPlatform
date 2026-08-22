import type { ApiEnvelope } from "../types/backend";
import type {
  WhatsAppConversation,
  WhatsAppMetaTemplate,
  WhatsAppSendPayload,
  WhatsAppSendResult,
  WhatsAppSettings,
  WhatsAppTemplatePayload,
  WhatsAppTestResult,
  WhatsAppThreadMessage,
} from "@/types";
import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { unwrap, unwrapPaginated } from "../utils/response";

interface WhatsAppAuthUrlResponse {
  url: string;
}

interface WhatsAppRefreshResponse {
  refreshed: boolean;
}

interface CompleteEmbeddedSignupPayload {
  code: string;
  state: string;
}

interface CompleteEmbeddedSignupResult {
  connected: boolean;
  account?: {
    businessName?: string;
    displayName?: string;
    phoneNumber?: string;
    phoneNumberId?: string;
    businessId?: string;
    wabaId?: string;
    isConnected?: boolean;
    webhookVerified?: boolean;
    connectedAt?: string;
  };
}

export const whatsappService = {
  async getSettings(): Promise<WhatsAppSettings> {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppSettings>>(
      ENDPOINTS.WHATSAPP.CONNECTION,
    );

    return unwrap(data);
  },

  async updateSettings(settings: WhatsAppSettings): Promise<WhatsAppSettings> {
    const { data } = await apiClient.patch<ApiEnvelope<WhatsAppSettings>>(
      ENDPOINTS.WHATSAPP.SETTINGS,
      settings,
    );

    return unwrap(data);
  },

  async getAuthUrl(): Promise<WhatsAppAuthUrlResponse> {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppAuthUrlResponse>>(
      ENDPOINTS.WHATSAPP.AUTH_URL,
    );

    return unwrap(data);
  },

  async initiateConnect(): Promise<{ state: string }> {
    const { data } = await apiClient.post<ApiEnvelope<{ state: string }>>(
      ENDPOINTS.WHATSAPP.CONNECT_INITIATE,
    );

    return unwrap(data);
  },

  async disconnect(): Promise<void> {
    await apiClient.post(ENDPOINTS.WHATSAPP.DISCONNECT);
  },

  async refresh(): Promise<WhatsAppRefreshResponse> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppRefreshResponse>>(
      ENDPOINTS.WHATSAPP.REFRESH,
    );

    return unwrap(data);
  },

  async testConnection(): Promise<WhatsAppTestResult> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppTestResult>>(
      ENDPOINTS.WHATSAPP.TEST,
    );

    return unwrap(data);
  },

  async completeEmbeddedSignup(
    payload: CompleteEmbeddedSignupPayload,
  ): Promise<CompleteEmbeddedSignupResult> {
    const { data } = await apiClient.post<
      ApiEnvelope<CompleteEmbeddedSignupResult>
    >(ENDPOINTS.WHATSAPP.EMBEDDED_SIGNUP, payload);

    return unwrap(data);
  },

  async getTemplates(params?: {
    status?: string
    category?: string
    search?: string
    page?: number
    limit?: number
  }): Promise<WhatsAppMetaTemplate[]> {
    const { data } = await apiClient.get<
      ApiEnvelope<Array<WhatsAppMetaTemplate & { _id?: number }>>
    >(ENDPOINTS.WHATSAPP.TEMPLATES, {
      params: {
        page: params?.page || 1,
        limit: params?.limit || 100,
        status: params?.status,
        category: params?.category,
        search: params?.search,
      },
    });

    const result = unwrapPaginated(data);
    return result.data.map((template) => ({
      ...template,
      id: template.id || Number(template._id),
    }));
  },

  async getApprovedTemplates(): Promise<WhatsAppMetaTemplate[]> {
    return this.getTemplates({ status: 'APPROVED', limit: 100 });
  },

  async syncTemplates(): Promise<WhatsAppMetaTemplate[]> {
    const { data } = await apiClient.post<
      ApiEnvelope<{ count: number; templates: WhatsAppMetaTemplate[] }>
    >(ENDPOINTS.WHATSAPP.TEMPLATES_SYNC);

    const result = unwrap(data);
    return (result.templates || []).map((template) => ({
      ...template,
      id: template.id || Number((template as WhatsAppMetaTemplate & { _id?: number })._id),
    }));
  },

  async createTemplate(
    payload: WhatsAppTemplatePayload,
  ): Promise<WhatsAppMetaTemplate> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppMetaTemplate>>(
      ENDPOINTS.WHATSAPP.TEMPLATES,
      payload,
    );

    return unwrap(data);
  },

  async updateTemplate(
    id: number,
    payload: WhatsAppTemplatePayload,
  ): Promise<WhatsAppMetaTemplate> {
    const { data } = await apiClient.put<ApiEnvelope<WhatsAppMetaTemplate>>(
      ENDPOINTS.WHATSAPP.TEMPLATE_BY_ID(id),
      payload,
    );

    return unwrap(data);
  },

  async submitTemplate(id: number): Promise<WhatsAppMetaTemplate> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppMetaTemplate>>(
      ENDPOINTS.WHATSAPP.TEMPLATE_SUBMIT(id),
    );

    return unwrap(data);
  },

  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.WHATSAPP.TEMPLATE_BY_ID(id));
  },

  async sendMessage(payload: WhatsAppSendPayload): Promise<WhatsAppSendResult> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppSendResult>>(
      ENDPOINTS.WHATSAPP.SEND,
      payload,
    );

    return unwrap(data);
  },

  async sendText(payload: {
    text?: string;
    leadId?: number;
    contactId?: number;
    conversationId?: number;
    to?: string;
    type?: 'text' | 'template';
    templateId?: number;
    templateVariables?: Record<string, string>;
  }): Promise<{ messageId: string; conversationId: number }> {
    const { data } = await apiClient.post<
      ApiEnvelope<{ messageId: string; conversationId: number }>
    >(ENDPOINTS.WHATSAPP.MESSAGES, payload);

    return unwrap(data);
  },

  async getConversations(params?: {
    search?: string;
    unreadOnly?: boolean;
    page?: number;
    limit?: number;
  }) {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppConversation[]>>(
      ENDPOINTS.WHATSAPP.CONVERSATIONS,
      { params },
    );

    return unwrapPaginated(data);
  },

  async createConversation(payload: { contactId?: number; leadId?: number }) {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppConversation>>(
      ENDPOINTS.WHATSAPP.CONVERSATIONS,
      payload,
    );

    return unwrap(data);
  },

  async getConversationMessages(conversationId: number) {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppThreadMessage[]>>(
      ENDPOINTS.WHATSAPP.CONVERSATION_MESSAGES(conversationId),
    );

    return unwrap(data);
  },

  async markRead(conversationId: number): Promise<void> {
    await apiClient.post(ENDPOINTS.WHATSAPP.CONVERSATION_READ(conversationId));
  },
};

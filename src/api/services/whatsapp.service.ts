import type { ApiEnvelope } from "../types/backend";
import type {
  WhatsAppSendPayload,
  WhatsAppSendResult,
  WhatsAppSettings,
  WhatsAppTemplate,
  WhatsAppTemplatePayload,
} from "@/types";
import { apiClient } from "../client";
import { ENDPOINTS } from "../endpoints";
import { unwrap } from "../utils/response";

interface WhatsAppAuthUrlResponse {
  url: string;
}

interface WhatsAppRefreshResponse {
  refreshed: boolean;
}

interface CompleteEmbeddedSignupPayload {
  code: string;
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
  };
}

export const whatsappService = {
  async getSettings(): Promise<WhatsAppSettings> {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppSettings>>(
      ENDPOINTS.WHATSAPP.SETTINGS,
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

  // ============================================================
  // META WHATSAPP CONNECTION
  // ============================================================

  async getAuthUrl(): Promise<WhatsAppAuthUrlResponse> {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppAuthUrlResponse>>(
      ENDPOINTS.WHATSAPP.AUTH_URL,
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

  async completeEmbeddedSignup(
    payload: CompleteEmbeddedSignupPayload,
  ): Promise<CompleteEmbeddedSignupResult> {
    const { data } = await apiClient.post<
      ApiEnvelope<CompleteEmbeddedSignupResult>
    >(ENDPOINTS.WHATSAPP.EMBEDDED_SIGNUP, payload);

    return unwrap(data);
  },

  // ============================================================
  // TEMPLATES
  // ============================================================

  async getTemplates(): Promise<WhatsAppTemplate[]> {
    const { data } = await apiClient.get<ApiEnvelope<WhatsAppTemplate[]>>(
      ENDPOINTS.WHATSAPP.TEMPLATES,
    );

    return unwrap(data);
  },

  async createTemplate(
    payload: WhatsAppTemplatePayload,
  ): Promise<WhatsAppTemplate> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppTemplate>>(
      ENDPOINTS.WHATSAPP.TEMPLATES,
      payload,
    );

    return unwrap(data);
  },

  async updateTemplate(
    id: number,
    payload: WhatsAppTemplatePayload,
  ): Promise<WhatsAppTemplate> {
    const { data } = await apiClient.put<ApiEnvelope<WhatsAppTemplate>>(
      ENDPOINTS.WHATSAPP.TEMPLATE_BY_ID(id),
      payload,
    );

    return unwrap(data);
  },

  async deleteTemplate(id: number): Promise<void> {
    await apiClient.delete(ENDPOINTS.WHATSAPP.TEMPLATE_BY_ID(id));
  },

  // ============================================================
  // MESSAGES
  // ============================================================

  async sendMessage(payload: WhatsAppSendPayload): Promise<WhatsAppSendResult> {
    const { data } = await apiClient.post<ApiEnvelope<WhatsAppSendResult>>(
      ENDPOINTS.WHATSAPP.SEND,
      payload,
    );

    return unwrap(data);
  },
};

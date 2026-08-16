export type FacebookLoginStatus =
  | 'connected'
  | 'not_authorized'
  | 'unknown'
  | string

export interface FacebookAuthResponse {
  accessToken?: string
  userID?: string
  expiresIn?: number
  signedRequest?: string
  grantedScopes?: string
  /**
   * WhatsApp Embedded Signup authorization-code flow.
   * Exchange this on the backend. Never log the value.
   */
  code?: string
}

export interface FacebookLoginResponse {
  authResponse: FacebookAuthResponse | null
  status: FacebookLoginStatus
}

export interface WhatsAppEmbeddedSignupLoginOptions {
  config_id: string
  response_type: 'code'
  override_default_response_type: true
  extras: {
    setup: Record<string, unknown>
    /**
     * Empty string = Cloud API Embedded Signup.
     * `whatsapp_business_app_onboarding` is only for WhatsApp Business App coexistence.
     */
    featureType: '' | 'whatsapp_business_app_onboarding'
    sessionInfoVersion: '3'
  }
}

export type FacebookLoginOptions = WhatsAppEmbeddedSignupLoginOptions

export interface FacebookSDK {
  init(options: {
    appId: string
    cookie?: boolean
    xfbml?: boolean
    version: string
  }): void

  login(
    callback: (response: FacebookLoginResponse) => void,
    options: FacebookLoginOptions,
  ): void

  getLoginStatus(
    callback: (response: FacebookLoginResponse) => void,
  ): void
}

declare global {
  interface Window {
    FB?: FacebookSDK
    fbAsyncInit?: () => void
  }
}

export {}

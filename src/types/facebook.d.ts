export interface FacebookLoginResponse {
    authResponse?: {
      accessToken?: string
      userID?: string
      expiresIn?: number
      code?: string
    } | null
    status?: string
  }
  
  export interface FacebookLoginOptions {
    config_id: string
    response_type?: 'code' | 'token'
    override_default_response_type?: boolean
    extras?: {
      setup?: Record<string, unknown>
      featureType?: string
      sessionInfoVersion?: string
    }
  }
  
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
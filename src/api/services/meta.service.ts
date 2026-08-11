import type {
    FacebookLoginResponse,
    FacebookLoginOptions,
  } from '@/types/facebook'
  
  const META_SDK_ID = 'facebook-jssdk'
  
  let sdkPromise: Promise<void> | null = null
  
  export function loadMetaSDK(): Promise<void> {
    if (window.FB) {
      return Promise.resolve()
    }
  
    if (sdkPromise) {
      return sdkPromise
    }
  
    sdkPromise = new Promise((resolve, reject) => {
      const appId = import.meta.env.VITE_META_APP_ID
  
      if (!appId) {
        reject(
          new Error(
            'VITE_META_APP_ID is not configured',
          ),
        )
        return
      }
  
      window.fbAsyncInit = () => {
        if (!window.FB) {
          reject(
            new Error(
              'Meta Facebook SDK failed to initialize',
            ),
          )
          return
        }
  
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version: 'v23.0',
        })
  
        resolve()
      }
  
      if (document.getElementById(META_SDK_ID)) {
        return
      }
  
      const script = document.createElement('script')
  
      script.id = META_SDK_ID
      script.src =
        'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'
  
      script.onerror = () => {
        sdkPromise = null
  
        reject(
          new Error(
            'Unable to load Meta Facebook SDK',
          ),
        )
      }
  
      document.body.appendChild(script)
    })
  
    return sdkPromise
  }
  
  export async function launchWhatsAppSignup(
    onSuccess: (accessToken: string) => void,
    onCancel?: () => void,
    onError?: (error: Error) => void,
  ): Promise<void> {
    try {
      await loadMetaSDK()
  
      const configId =
        import.meta.env.VITE_META_WHATSAPP_CONFIG_ID
  
      if (!configId) {
        throw new Error(
          'VITE_META_WHATSAPP_CONFIG_ID is not configured',
        )
      }
  
      if (!window.FB) {
        throw new Error(
          'Meta Facebook SDK is not available',
        )
      }
  
      const options: FacebookLoginOptions = {
        config_id: configId,
        response_type: 'token',
        override_default_response_type: true,
        extras: {
          setup: {},
          featureType:
            'whatsapp_business_app_onboarding',
          sessionInfoVersion: '3',
        },
      }
  
      window.FB.login(
        (response: FacebookLoginResponse) => {
          const accessToken =
            response.authResponse?.accessToken
  
          if (accessToken) {
            onSuccess(accessToken)
            return
          }
  
          if (
            response.status === 'unknown' ||
            !response.authResponse
          ) {
            onCancel?.()
            return
          }
  
          onError?.(
            new Error(
              'Meta WhatsApp Embedded Signup did not return an access token',
            ),
          )
        },
        options,
      )
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error(
              'Failed to launch WhatsApp Embedded Signup',
            ),
      )
    }
  }
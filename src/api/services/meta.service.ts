import type {
  FacebookLoginResponse,
  WhatsAppEmbeddedSignupLoginOptions,
} from '@/types/facebook'

const META_SDK_ID = 'facebook-jssdk'
const META_SDK_URL = 'https://connect.facebook.net/en_US/sdk.js'

let sdkPromise: Promise<void> | null = null
let sdkInitialized = false

function getMetaAppId(): string {
  const appId = import.meta.env.VITE_META_APP_ID?.trim()

  if (!appId) {
    throw new Error('VITE_META_APP_ID is not configured')
  }

  return appId
}

function getEmbeddedSignupConfigId(): string {
  const configId =
    import.meta.env.VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID?.trim()

  if (!configId) {
    throw new Error(
      'VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID is not configured.',
    )
  }

  return configId
}

function getGraphApiVersion(): string {
  const version = import.meta.env.VITE_META_GRAPH_API_VERSION?.trim()

  if (!version) {
    throw new Error('VITE_META_GRAPH_API_VERSION is not configured')
  }

  return version
}

function summarizeLoginResponse(response: FacebookLoginResponse | null) {
  return {
    status: response?.status ?? null,
    hasAuthResponse: Boolean(response?.authResponse),
    hasCode: Boolean(response?.authResponse?.code),
    hasAccessToken: Boolean(response?.authResponse?.accessToken),
    hasUserID: Boolean(response?.authResponse?.userID),
  }
}

function detectPopupDuringLogin(run: () => void): {
  popupAttempted: boolean
  popupOpened: boolean
  popupBlocked: boolean
} {
  const originalOpen = window.open.bind(window)
  let popupAttempted = false
  let popupOpened = false

  window.open = ((...args: Parameters<typeof window.open>) => {
    popupAttempted = true
    const popup = originalOpen(...args)
    popupOpened = Boolean(popup && !popup.closed)
    return popup
  }) as typeof window.open

  try {
    run()
  } finally {
    window.open = originalOpen
  }

  return {
    popupAttempted,
    popupOpened,
    popupBlocked: popupAttempted && !popupOpened,
  }
}

/**
 * Load and initialize the Meta Facebook JavaScript SDK.
 *
 * This is the ONLY place FB.init() should be called.
 */
export function loadMetaSDK(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error('Meta Facebook SDK can only be loaded in the browser'),
    )
  }

  if (sdkInitialized && window.FB) {
    return Promise.resolve()
  }

  if (sdkPromise) {
    return sdkPromise
  }

  sdkPromise = new Promise<void>((resolve, reject) => {
    let appId: string
    let graphApiVersion: string

    try {
      appId = getMetaAppId()
      graphApiVersion = getGraphApiVersion()
    } catch (error) {
      sdkPromise = null
      reject(error instanceof Error ? error : new Error(String(error)))
      return
    }

    let initializing = false
    let timeoutId: number | null = null

    const cleanup = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const initializeSDK = () => {
      if (sdkInitialized || initializing) {
        if (sdkInitialized) {
          cleanup()
          resolve()
        }
        return
      }

      if (!window.FB) {
        return
      }

      initializing = true
      cleanup()

      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version: graphApiVersion,
        })

        sdkInitialized = true

        console.log('Facebook SDK initialized successfully.')
        resolve()
      } catch (error) {
        initializing = false
        sdkPromise = null
        reject(
          error instanceof Error
            ? error
            : new Error('Failed to initialize Meta Facebook SDK'),
        )
      }
    }

    if (window.FB) {
      initializeSDK()
      return
    }

    const previousFbAsyncInit = window.fbAsyncInit

    window.fbAsyncInit = () => {
      try {
        previousFbAsyncInit?.()
      } catch (error) {
        console.warn('Previous fbAsyncInit callback failed:', error)
      }

      initializeSDK()
    }

    const existingScript = document.getElementById(META_SDK_ID)

    if (existingScript) {
      console.log(
        'Facebook SDK script already exists. Waiting for SDK...',
      )

      const startedAt = Date.now()

      const checkSDK = () => {
        if (window.FB) {
          initializeSDK()
          return
        }

        if (Date.now() - startedAt > 15000) {
          sdkPromise = null
          reject(
            new Error(
              'Facebook SDK did not initialize within 15 seconds.',
            ),
          )
          return
        }

        window.setTimeout(checkSDK, 100)
      }

      checkSDK()
      return
    }

    console.log('Loading Facebook SDK...')

    const script = document.createElement('script')
    script.id = META_SDK_ID
    script.src = META_SDK_URL
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      console.log('Facebook SDK script loaded.')

      if (window.FB) {
        initializeSDK()
      }
    }

    script.onerror = () => {
      sdkPromise = null
      reject(new Error('Unable to load Meta Facebook SDK.'))
    }

    document.body.appendChild(script)

    timeoutId = window.setTimeout(() => {
      if (!sdkInitialized) {
        sdkPromise = null
        reject(new Error('Facebook SDK initialization timed out.'))
      }
    }, 15000)
  })

  return sdkPromise
}

export interface WhatsAppEmbeddedSignupMessage {
  type: 'WA_EMBEDDED_SIGNUP'
  event?: string
  data?: {
    phone_number_id?: string
    waba_id?: string
    business_id?: string
    error_message?: string
    error_code?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

function isMetaMessageOrigin(origin: string): boolean {
  return (
    origin === 'https://www.facebook.com' ||
    origin === 'https://facebook.com' ||
    origin === 'https://web.facebook.com'
  )
}

/**
 * Launch WhatsApp Embedded Signup (authorization-code flow).
 *
 * The authorization code must be sent to the backend.
 * Do not treat FB.login accessToken as the WhatsApp credential.
 */
export async function launchWhatsAppSignup(
  onSuccess: (code: string) => void,
  onCancel?: () => void,
  onError?: (error: Error) => void,
): Promise<void> {
  try {
    await loadMetaSDK()

    const appId = getMetaAppId()
    const configId = getEmbeddedSignupConfigId()
    const graphApiVersion = getGraphApiVersion()

    if (!window.FB) {
      throw new Error('Meta Facebook SDK is not available.')
    }

    console.log('====================================')
    console.log('WhatsApp Embedded Signup: START')
    console.log('META_APP_ID:', appId)
    console.log('META_CONFIG_ID:', configId)
    console.log('META_GRAPH_API_VERSION:', graphApiVersion)
    console.log('window.origin:', window.location.origin)
    console.log('window.location.href:', window.location.href)
    console.log('window.FB exists:', Boolean(window.FB))
    console.log(
      'FB.getLoginStatus exists:',
      typeof window.FB.getLoginStatus === 'function',
    )
    console.log('====================================')

    let settled = false
    let messageHandler: (event: MessageEvent) => void = () => undefined

    const settle = (action: () => void) => {
      if (settled) {
        return
      }

      settled = true
      window.removeEventListener('message', messageHandler)
      action()
    }

    messageHandler = (event: MessageEvent) => {
      if (!isMetaMessageOrigin(event.origin)) {
        return
      }

      let data: unknown = event.data

      if (typeof data === 'string') {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }

      if (!data || typeof data !== 'object') {
        return
      }

      const signupData = data as Partial<WhatsAppEmbeddedSignupMessage>

      if (signupData.type !== 'WA_EMBEDDED_SIGNUP') {
        return
      }

      console.log('WA_EMBEDDED_SIGNUP event:', signupData.event ?? null)
      console.log(
        'WA_EMBEDDED_SIGNUP has data:',
        Boolean(signupData.data),
      )

      if (signupData.event === 'CANCEL') {
        settle(() => {
          onCancel?.()
        })
        return
      }

      if (signupData.event === 'ERROR') {
        const metaError =
          typeof signupData.data?.error_message === 'string'
            ? signupData.data.error_message
            : 'Meta WhatsApp Embedded Signup returned an error.'

        settle(() => {
          onError?.(new Error(metaError))
        })
      }
    }

    window.addEventListener('message', messageHandler)

    const options: WhatsAppEmbeddedSignupLoginOptions = {
      config_id: configId,
      response_type: 'code',
      override_default_response_type: true,
      extras: {
        setup: {},
        featureType: '',
        sessionInfoVersion: '3',
      },
    }

    let callbackCalled = false

    console.log('Calling window.FB.login()...')

    const popup = detectPopupDuringLogin(() => {
      window.FB!.login((response: FacebookLoginResponse) => {
        callbackCalled = true

        console.log('====================================')
        console.log('FB.login CALLBACK')
        console.log('callbackCalled:', true)
        console.log('response.status:', response?.status ?? null)
        console.log(
          'response summary:',
          summarizeLoginResponse(response ?? null),
        )
        console.log('====================================')

        if (!response) {
          settle(() => {
            onError?.(new Error('Meta did not return a response.'))
          })
          return
        }

        if (!response.authResponse) {
          if (response.status === 'unknown') {
            settle(() => {
              onError?.(
                new Error(
                  'Meta FB.login returned status unknown. The authorization flow did not complete.',
                ),
              )
            })
            return
          }

          if (
            response.status === 'not_authorized' ||
            response.status === ''
          ) {
            settle(() => {
              onCancel?.()
            })
            return
          }

          settle(() => {
            onError?.(
              new Error(
                `Meta login failed with status: ${response.status || 'unknown'}.`,
              ),
            )
          })
          return
        }

        const code = response.authResponse.code

        console.log('Authorization code received:', Boolean(code))
        console.log(
          'Access token received:',
          Boolean(response.authResponse.accessToken),
        )

        if (!code) {
          settle(() => {
            onError?.(
              new Error('Meta did not return an authorization code.'),
            )
          })
          return
        }

        settle(() => {
          onSuccess(code)
        })
      }, options)
    })

    console.log('FB.login() called successfully.')
    console.log('popupAttempted:', popup.popupAttempted)
    console.log('popupOpened:', popup.popupOpened)
    console.log('popupBlocked:', popup.popupBlocked)
    console.log('callbackCalled immediately:', callbackCalled)

    if (popup.popupBlocked) {
      console.warn(
        'Meta login popup appears to have been blocked by the browser.',
      )
    }
  } catch (error) {
    console.error('Failed to launch WhatsApp Embedded Signup:', error)

    onError?.(
      error instanceof Error
        ? error
        : new Error('Failed to launch WhatsApp Embedded Signup.'),
    )
  }
}

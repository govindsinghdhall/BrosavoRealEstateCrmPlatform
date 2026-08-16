import type {
  FacebookLoginResponse,
  FacebookLoginOptions,
} from '@/types/facebook'

const META_SDK_ID = 'facebook-jssdk'

const META_SDK_URL =
  'https://connect.facebook.net/en_US/sdk.js'

let sdkPromise: Promise<void> | null = null

/**
 * Load and initialize the Meta Facebook JavaScript SDK.
 *
 * This should be the ONLY place where FB.init()
 * is called in the application.
 */
export function loadMetaSDK(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(
      new Error(
        'Meta Facebook SDK can only be loaded in the browser',
      ),
    )
  }

  if (window.FB) {
    return Promise.resolve()
  }

  if (sdkPromise) {
    return sdkPromise
  }

  sdkPromise = new Promise<void>((resolve, reject) => {
    const appId =
      import.meta.env.VITE_META_APP_ID

    if (!appId) {
      sdkPromise = null

      reject(
        new Error(
          'VITE_META_APP_ID is not configured',
        ),
      )

      return
    }

    let initialized = false
    let timeoutId: number | null = null

    const cleanup = () => {
      if (timeoutId !== null) {
        window.clearTimeout(timeoutId)
        timeoutId = null
      }
    }

    const initializeSDK = () => {
      if (initialized) {
        return
      }

      if (!window.FB) {
        return
      }

      initialized = true

      cleanup()

      try {
        window.FB.init({
          appId,
          cookie: true,
          xfbml: true,
          version:
            import.meta.env
              .VITE_META_GRAPH_API_VERSION ||
            'v26.0',
        })

        console.log(
          'Facebook SDK initialized successfully.',
        )

        resolve()
      } catch (error) {
        sdkPromise = null

        reject(
          error instanceof Error
            ? error
            : new Error(
                'Failed to initialize Meta Facebook SDK',
              ),
        )
      }
    }

    /*
     * If FB is already available, initialize immediately.
     */
    if (window.FB) {
      initializeSDK()
      return
    }

    /*
     * Preserve an existing fbAsyncInit callback.
     */
    const previousFbAsyncInit =
      window.fbAsyncInit

    window.fbAsyncInit = () => {
      try {
        previousFbAsyncInit?.()
      } catch (error) {
        console.warn(
          'Previous fbAsyncInit callback failed:',
          error,
        )
      }

      initializeSDK()
    }

    /*
     * Check whether the SDK script already exists.
     */
    const existingScript =
      document.getElementById(
        META_SDK_ID,
      )

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

        /*
         * Prevent an infinite polling loop.
         */
        if (Date.now() - startedAt > 15000) {
          sdkPromise = null

          reject(
            new Error(
              'Facebook SDK did not initialize within 15 seconds.',
            ),
          )

          return
        }

        window.setTimeout(
          checkSDK,
          100,
        )
      }

      checkSDK()

      return
    }

    /*
     * Load the Facebook SDK.
     */
    console.log(
      'Loading Facebook SDK...',
    )

    const script =
      document.createElement(
        'script',
      )

    script.id = META_SDK_ID
    script.src = META_SDK_URL
    script.async = true
    script.defer = true
    script.crossOrigin = 'anonymous'

    script.onload = () => {
      console.log(
        'Facebook SDK script loaded.',
      )

      /*
       * Normally fbAsyncInit will initialize
       * the SDK.
       *
       * This is a fallback in case the callback
       * has already fired.
       */
      if (window.FB) {
        initializeSDK()
      }
    }

    script.onerror = () => {
      sdkPromise = null

      reject(
        new Error(
          'Unable to load Meta Facebook SDK.',
        ),
      )
    }

    document.body.appendChild(
      script,
    )

    /*
     * Safety timeout.
     */
    timeoutId = window.setTimeout(() => {
      if (!initialized) {
        sdkPromise = null

        reject(
          new Error(
            'Facebook SDK initialization timed out.',
          ),
        )
      }
    }, 15000)
  })

  return sdkPromise
}

/**
 * Information sent by Meta during WhatsApp Embedded Signup.
 */
export interface WhatsAppEmbeddedSignupMessage {
  type: 'WA_EMBEDDED_SIGNUP'
  event?: string
  data?: {
    phone_number_id?: string
    waba_id?: string
    business_id?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}

/**
 * Launch WhatsApp Embedded Signup.
 *
 * Embedded Signup uses an authorization CODE.
 *
 * The authorization code should be sent to the backend.
 * Do NOT store a permanent Meta access token in the browser.
 */
export async function launchWhatsAppSignup(
  onSuccess: (code: string) => void,
  onCancel?: () => void,
  onError?: (error: Error) => void,
): Promise<void> {
  try {
    await loadMetaSDK()

    console.log(
      'Facebook SDK ready.',
    )

    const configId =
      import.meta.env
        .VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID

    if (!configId) {
      throw new Error(
        'VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID is not configured.',
      )
    }

    if (!window.FB) {
      throw new Error(
        'Meta Facebook SDK is not available.',
      )
    }

    console.log(
      '====================================',
    )

    console.log(
      'WhatsApp Embedded Signup: START',
    )

    console.log(
      'META_APP_ID:',
      import.meta.env.VITE_META_APP_ID,
    )

    console.log(
      'META_CONFIG_ID:',
      configId,
    )

    console.log(
      'META_GRAPH_API_VERSION:',
      import.meta.env
        .VITE_META_GRAPH_API_VERSION ||
        'v26.0',
    )

    console.log(
      '====================================',
    )

    /*
     * Listen for Meta's Embedded Signup
     * postMessage events.
     *
     * Meta sends onboarding information such as
     * WABA ID and phone number ID through this event.
     */
    const messageHandler = (
      event: MessageEvent,
    ) => {
      /*
       * Only accept messages from Meta.
       */
      if (
        event.origin !==
          'https://www.facebook.com' &&
        event.origin !==
          'https://facebook.com'
      ) {
        return
      }

      let data: unknown = event.data

      /*
       * Meta may send the data as a JSON string.
       */
      if (
        typeof data === 'string'
      ) {
        try {
          data = JSON.parse(data)
        } catch {
          return
        }
      }

      if (
        !data ||
        typeof data !== 'object'
      ) {
        return
      }

      const signupData =
        data as Partial<WhatsAppEmbeddedSignupMessage>

      if (
        signupData.type !==
        'WA_EMBEDDED_SIGNUP'
      ) {
        return
      }

      console.log(
        '====================================',
      )

      console.log(
        'WA_EMBEDDED_SIGNUP MESSAGE:',
        signupData,
      )

      console.log(
        '===================================='

      )

      /*
       * You can use these values later to
       * complete the onboarding on your backend.
       */
      if (signupData.event) {
        console.log(
          'WhatsApp Embedded Signup event:',
          signupData.event,
        )
      }

      if (signupData.data) {
        console.log(
          'WhatsApp Embedded Signup data:',
          signupData.data,
        )
      }
    }

    window.addEventListener(
      'message',
      messageHandler,
    )

    /*
     * Embedded Signup configuration.
     *
     * IMPORTANT:
     * response_type MUST be "code".
     */
    const options = {
      config_id: configId,

      response_type: 'code',

      override_default_response_type:
        true,

      extras: {
        setup: {},

        featureType:
          'whatsapp_business_app_onboarding',

        sessionInfoVersion: '3',
      },
    } as FacebookLoginOptions

    console.log(
      'Calling window.FB.login()...',
    )

    window.FB.login(
      (
        response: FacebookLoginResponse,
      ) => {
        console.log(
          '====================================',
        )

        console.log(
          'FB.login CALLBACK',
        )

        console.log(
          'FULL META LOGIN RESPONSE:',
          response,
        )

        console.log(
          '====================================',
        )

        /*
         * No response at all.
         */
        if (!response) {
          console.error(
            'Meta did not return a response.',
          )

          window.removeEventListener(
            'message',
            messageHandler,
          )

          onError?.(
            new Error(
              'Meta did not return a response.',
            ),
          )

          return
        }

        /*
         * Log status separately.
         */
        console.log(
          'META LOGIN STATUS:',
          response.status,
        )

        console.log(
          'META AUTH RESPONSE:',
          response.authResponse,
        )

        /*
         * Meta did not authorize the request.
         */
        if (
          !response.authResponse
        ) {
          console.warn(
            'Meta FB.login returned no authResponse.',
            response,
          )

          window.removeEventListener(
            'message',
            messageHandler,
          )

          /*
           * "unknown" means the login flow did not
           * complete. This can happen because:
           *
           * - user closed/cancelled the dialog
           * - Embedded Signup could not start
           * - Meta configuration rejected the flow
           * - popup/iframe communication failed
           */
          if (
            response.status ===
            'unknown'
          ) {
            onCancel?.()
            return
          }

          onError?.(
            new Error(
              `Meta login failed with status: ${response.status || 'unknown'}.`,
            ),
          )

          return
        }

        /*
         * Embedded Signup returns an authorization
         * CODE instead of the permanent access token.
         */
        const authResponse =
          response.authResponse as
            | {
                accessToken?: string
                code?: string
                userID?: string
                expiresIn?: number
                signedRequest?: string
              }
            | undefined

        const code =
          authResponse?.code

        console.log(
          'Authorization code received:',
          Boolean(code),
        )

        /*
         * We expect a code.
         */
        if (!code) {
          console.error(
            'Meta returned authResponse but no authorization code.',
            response,
          )

          window.removeEventListener(
            'message',
            messageHandler,
          )

          onError?.(
            new Error(
              'Meta did not return an authorization code.',
            ),
          )

          return
        }

        console.log(
          'Meta authorization code received successfully.',
        )

        /*
         * IMPORTANT:
         *
         * Send this code to your backend.
         *
         * The backend should perform the required
         * Meta onboarding/token exchange.
         */
        onSuccess(code)

        /*
         * We no longer need the listener after
         * successful authorization.
         */
        window.removeEventListener(
          'message',
          messageHandler,
        )
      },
      options,
    )

    console.log(
      'FB.login() called successfully.',
    )
  } catch (error) {
    console.error(
      'Failed to launch WhatsApp Embedded Signup:',
      error,
    )

    onError?.(
      error instanceof Error
        ? error
        : new Error(
            'Failed to launch WhatsApp Embedded Signup.',
          ),
    )
  }
}
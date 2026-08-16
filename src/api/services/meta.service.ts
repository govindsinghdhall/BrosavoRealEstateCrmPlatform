import type {
  FacebookLoginResponse,
  FacebookLoginOptions,
} from '@/types/facebook'

const META_SDK_ID = 'facebook-jssdk'

let sdkPromise: Promise<void> | null = null

/**
 * Load and initialize the Meta Facebook JavaScript SDK.
 *
 * This should be the ONLY place where FB.init() is called.
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

  sdkPromise = new Promise<void>(
    (resolve, reject) => {
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

      const initializeSDK = () => {
        if (initialized) {
          return
        }

        if (!window.FB) {
          return
        }

        initialized = true

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
       * Facebook SDK may already be in the page
       * but window.FB may not have been initialized yet.
       */
      if (window.FB) {
        initializeSDK()

        return
      }

      /*
       * Facebook SDK calls this after loading.
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
       * SDK script already exists.
       */
      const existingScript =
        document.getElementById(
          META_SDK_ID,
        )

      if (existingScript) {
        /*
         * Give an already-loading SDK time to
         * populate window.FB.
         */
        const checkSDK = () => {
          if (window.FB) {
            initializeSDK()
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
       * Load SDK for the first time.
       */
      console.log(
        'Loading Facebook SDK...',
      )

      const script =
        document.createElement(
          'script',
        )

      script.id = META_SDK_ID
      script.src =
        'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      script.crossOrigin = 'anonymous'

      script.onload = () => {
        /*
         * Normally fbAsyncInit handles this,
         * but check directly as a fallback.
         */
        initializeSDK()
      }

      script.onerror = () => {
        sdkPromise = null

        reject(
          new Error(
            'Unable to load Meta Facebook SDK',
          ),
        )
      }

      document.body.appendChild(
        script,
      )
    },
  )

  return sdkPromise
}

/**
 * Launch WhatsApp Embedded Signup.
 *
 * IMPORTANT:
 * Embedded Signup uses an authorization CODE,
 * not an access token.
 */
export async function launchWhatsAppSignup(
  onSuccess: (code: string) => void,
  onCancel?: () => void,
  onError?: (error: Error) => void,
): Promise<void> {
  try {
    await loadMetaSDK()

    const configId =
      import.meta.env
        .VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID

    if (!configId) {
      throw new Error(
        'VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID is not configured',
      )
    }

    if (!window.FB) {
      throw new Error(
        'Meta Facebook SDK is not available',
      )
    }

    const options:
      FacebookLoginOptions = {
      config_id: configId,

      /*
       * Embedded Signup authorization-code flow.
       */
      response_type: 'code',

      /*
       * Prevent Facebook Login from replacing
       * the requested response type.
       */
      override_default_response_type:
        true,

      extras: {
        setup: {},

        featureType:
          'whatsapp_business_app_onboarding',

        sessionInfoVersion:
          '3',
      },
    }

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
          'Meta login response:',
          response,
        )

        console.log(
          '====================================',
        )

        /*
         * Do not automatically classify every
         * authResponse=null response as cancellation.
         *
         * Log the complete response first.
         */
        if (!response) {
          console.error(
            'Meta did not return a response.',
          )

          onError?.(
            new Error(
              'Meta did not return a response.',
            ),
          )

          return
        }

        if (
          !response.authResponse
        ) {
          console.warn(
            'Meta FB.login returned no authResponse.',
            response,
          )

          /*
           * Facebook Login can return status=unknown
           * when the authorization flow did not complete.
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
              'Meta did not return an authorization response.',
            ),
          )

          return
        }

        /*
         * FacebookLoginResponse may currently be
         * typed around accessToken. Cast only this
         * small section because Embedded Signup
         * returns a CODE.
         */
        const authResponse =
          response.authResponse as
            | {
                accessToken?: string
                code?: string
              }
            | undefined

        const code =
          authResponse?.code

        console.log(
          'Authorization code received:',
          Boolean(code),
        )

        if (!code) {
          console.error(
            'Meta did not return an authorization code.',
            response,
          )

          onError?.(
            new Error(
              'Meta did not return an authorization code.',
            ),
          )

          return
        }

        /*
         * Send the authorization code to the
         * caller. The backend should exchange
         * this code with Meta.
         */
        onSuccess(code)
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
            'Failed to launch WhatsApp Embedded Signup',
          ),
    )
  }
}
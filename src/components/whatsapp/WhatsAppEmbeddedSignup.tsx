import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
} from '@mui/material'
import { whatsappService } from '@/api/services/whatsapp.service'

interface WhatsAppEmbeddedSignupProps {
  organizationId: number

  onSuccess?: (data: {
    organizationId: number
    wabaId: string
    phoneNumberId: string
    businessId?: string
  }) => void

  onError?: (message: string) => void
}

interface SignupData {
  organizationId: number
  wabaId: string
  phoneNumberId: string
  businessId?: string
}

interface MetaSignupMessage {
  type?: string
  event?: string
  data?: {
    waba_id?: string
    phone_number_id?: string
    business_id?: string
  }
}

const META_APP_ID =
  import.meta.env.VITE_META_APP_ID

const META_CONFIG_ID =
  import.meta.env.VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID

const META_GRAPH_API_VERSION =
  import.meta.env.VITE_META_GRAPH_API_VERSION || 'v26.0'

const CODE_STORAGE_KEY =
  'whatsapp_embedded_signup_code'

const DATA_STORAGE_KEY =
  'whatsapp_embedded_signup_data'

export default function WhatsAppEmbeddedSignup({
  organizationId,
  onSuccess,
  onError,
}: WhatsAppEmbeddedSignupProps) {
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const completingRef = useRef(false)
  const timeoutRef = useRef<number | null>(null)

  /*
   * ============================================================
   * HELPERS
   * ============================================================
   */

  const clearSignupStorage = () => {
    sessionStorage.removeItem(
      CODE_STORAGE_KEY,
    )

    sessionStorage.removeItem(
      DATA_STORAGE_KEY,
    )
  }

  const showError = (message: string) => {
    console.error(
      'WhatsApp Embedded Signup:',
      message,
    )

    setLoading(false)
    setError(message)
    onError?.(message)
  }

  /*
   * ============================================================
   * COMPLETE SIGNUP
   * ============================================================
   */

  const completeSignup = async (
    code: string,
    signupData: SignupData,
  ) => {
    if (completingRef.current) {
      console.log(
        'Embedded Signup completion already in progress.',
      )

      return
    }

    completingRef.current = true

    try {
      console.log(
        '====================================',
      )

      console.log(
        'Completing WhatsApp Embedded Signup',
      )

      console.log(
        'Organization:',
        signupData.organizationId,
      )

      console.log(
        'WABA:',
        signupData.wabaId,
      )

      console.log(
        'Phone Number ID:',
        signupData.phoneNumberId,
      )

      console.log(
        'Business ID:',
        signupData.businessId,
      )

      console.log(
        'Authorization code received:',
        Boolean(code),
      )

      console.log(
        '====================================',
      )

      setLoading(true)
      setError('')

      /*
       * Send the complete Embedded Signup payload
       * to the backend.
       *
       * IMPORTANT:
       * The frontend does NOT send a Meta access token.
       *
       * It sends the authorization CODE returned
       * by FB.login() together with the WABA/phone
       * information returned by WA_EMBEDDED_SIGNUP.
       */
      await whatsappService.completeEmbeddedSignup({
        organizationId:
          signupData.organizationId,

        wabaId:
          signupData.wabaId,

        phoneNumberId:
          signupData.phoneNumberId,

        businessId:
          signupData.businessId,

        code,
      })

      console.log(
        'WhatsApp Embedded Signup completed successfully.',
      )

      clearSignupStorage()

      if (timeoutRef.current) {
        window.clearTimeout(
          timeoutRef.current,
        )

        timeoutRef.current = null
      }

      setLoading(false)

      onSuccess?.({
        organizationId:
          signupData.organizationId,

        wabaId:
          signupData.wabaId,

        phoneNumberId:
          signupData.phoneNumberId,

        businessId:
          signupData.businessId,
      })
    } catch (error: any) {
      console.error(
        'Failed to complete WhatsApp Embedded Signup:',
        error,
      )

      const message =
        error?.response?.data?.message ||
        error?.response?.data?.error?.message ||
        error?.message ||
        'Failed to connect WhatsApp account.'

      clearSignupStorage()

      showError(message)
    } finally {
      completingRef.current = false
    }
  }

  /*
   * ============================================================
   * FACEBOOK SDK
   * ============================================================
   */

  useEffect(() => {
    if (!META_APP_ID) {
      setError(
        'Meta App ID is not configured.',
      )

      return
    }

    if (!META_CONFIG_ID) {
      setError(
        'Meta WhatsApp Configuration ID is not configured.',
      )

      return
    }

    const initializeFacebookSDK = () => {
      console.log(
        'Initializing Facebook SDK...',
      )

      if (!window.FB) {
        console.error(
          'Facebook SDK callback fired but window.FB is unavailable.',
        )

        setError(
          'Facebook SDK failed to load.',
        )

        return
      }

      try {
        window.FB.init({
          appId: META_APP_ID,
          cookie: true,
          xfbml: true,
          version:
            META_GRAPH_API_VERSION,
        })

        console.log(
          'Facebook SDK initialized successfully.',
        )

        setSdkReady(true)
        setError('')
      } catch (error) {
        console.error(
          'Facebook SDK initialization failed:',
          error,
        )

        setError(
          'Failed to initialize Meta Facebook SDK.',
        )
      }
    }

    /*
     * SDK already loaded
     */
    if (window.FB) {
      initializeFacebookSDK()

      return
    }

    /*
     * SDK not loaded yet
     */
    window.fbAsyncInit =
      initializeFacebookSDK

    const existingScript =
      document.getElementById(
        'facebook-jssdk',
      )

    if (!existingScript) {
      console.log(
        'Loading Facebook SDK...',
      )

      const script =
        document.createElement('script')

      script.id =
        'facebook-jssdk'

      script.async = true
      script.defer = true
      script.crossOrigin =
        'anonymous'

      script.src =
        'https://connect.facebook.net/en_US/sdk.js'

      script.onerror = () => {
        console.error(
          'Failed to load Facebook SDK.',
        )

        setError(
          'Unable to load Meta Facebook SDK.',
        )
      }

      document.body.appendChild(
        script,
      )
    }

    return () => {
      window.fbAsyncInit =
        undefined
    }
  }, [])

  /*
   * ============================================================
   * META EMBEDDED SIGNUP MESSAGE LISTENER
   * ============================================================
   */

  useEffect(() => {
    const handleMessage = async (
      event: MessageEvent,
    ) => {
      console.log(
        'Meta message received:',
        {
          origin: event.origin,
          data: event.data,
        },
      )

      /*
       * Meta Embedded Signup can communicate
       * through these Facebook origins.
       */
      if (
        event.origin !==
          'https://www.facebook.com' &&
        event.origin !==
          'https://web.facebook.com'
      ) {
        return
      }

      if (
        typeof event.data !==
        'string'
      ) {
        return
      }

      let data: MetaSignupMessage

      try {
        data =
          JSON.parse(
            event.data,
          ) as MetaSignupMessage
      } catch {
        return
      }

      /*
       * Ignore unrelated Facebook messages.
       */
      if (
        data?.type !==
        'WA_EMBEDDED_SIGNUP'
      ) {
        return
      }

      console.log(
        '====================================',
      )

      console.log(
        'WA_EMBEDDED_SIGNUP EVENT',
      )

      console.log(
        data,
      )

      console.log(
        '====================================',
      )

      /*
       * ========================================================
       * CANCEL
       * ========================================================
       */

      if (
        data.event ===
        'CANCEL'
      ) {
        clearSignupStorage()

        if (timeoutRef.current) {
          window.clearTimeout(
            timeoutRef.current,
          )

          timeoutRef.current =
            null
        }

        showError(
          'WhatsApp setup was cancelled.',
        )

        return
      }

      /*
       * ========================================================
       * ERROR
       * ========================================================
       */

      if (
        data.event ===
        'ERROR'
      ) {
        clearSignupStorage()

        showError(
          'Meta WhatsApp Embedded Signup returned an error.',
        )

        return
      }

      /*
       * ========================================================
       * FINISH
       * ========================================================
       */

      if (
        data.event !== 'FINISH' &&
        data.event !== 'FINISH_ONLY_WABA' &&
        data.event !== 'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'
      ) {
        return
      }

      const wabaId =
        data.data?.waba_id

      const phoneNumberId =
        data.data?.phone_number_id

      const businessId =
        data.data?.business_id

      console.log(
        'Embedded Signup assets:',
        {
          wabaId,
          phoneNumberId,
          businessId,
        },
      )

      /*
       * Meta must return WABA ID and Phone Number ID.
       */
      if (
        !wabaId ||
        !phoneNumberId
      ) {
        showError(
          'Meta did not return the WABA ID or Phone Number ID.',
        )

        return
      }

      const signupData: SignupData =
        {
          organizationId,

          wabaId:
            String(wabaId),

          phoneNumberId:
            String(phoneNumberId),

          businessId:
            businessId
              ? String(
                  businessId,
                )
              : undefined,
        }

      /*
       * Store the Meta asset information.
       *
       * FB.login() and this message event
       * are asynchronous and can arrive
       * in either order.
       */
      sessionStorage.setItem(
        DATA_STORAGE_KEY,
        JSON.stringify(
          signupData,
        ),
      )

      /*
       * Check whether FB.login() has already
       * returned the authorization code.
       */
      const code =
        sessionStorage.getItem(
          CODE_STORAGE_KEY,
        )

      if (!code) {
        console.log(
          'WABA information received. Waiting for authorization code...',
        )

        return
      }

      /*
       * Both pieces are available.
       * Complete signup.
       */
      await completeSignup(
        code,
        signupData,
      )
    }

    window.addEventListener(
      'message',
      handleMessage,
    )

    return () => {
      window.removeEventListener(
        'message',
        handleMessage,
      )
    }
  }, [
    organizationId,
    onSuccess,
    onError,
  ])

  /*
   * ============================================================
   * LAUNCH EMBEDDED SIGNUP
   * ============================================================
   */

  const launchSignup = () => {
    console.log(
      '====================================',
    )

    console.log(
      'WhatsApp Embedded Signup: START',
    )

    console.log(
      '====================================',
    )

    console.log(
      'META_APP_ID:',
      META_APP_ID,
    )

    console.log(
      'META_CONFIG_ID:',
      META_CONFIG_ID,
    )

    console.log(
      'META_GRAPH_API_VERSION:',
      META_GRAPH_API_VERSION,
    )

    console.log(
      'Facebook SDK:',
      window.FB,
    )

    console.log(
      'Organization ID:',
      organizationId,
    )

    /*
     * Validate SDK
     */
    if (!window.FB) {
      showError(
        'Meta Facebook SDK is not loaded.',
      )

      return
    }

    /*
     * Validate App ID
     */
    if (!META_APP_ID) {
      showError(
        'Meta App ID is missing.',
      )

      return
    }

    /*
     * Validate Configuration ID
     */
    if (!META_CONFIG_ID) {
      showError(
        'Meta WhatsApp Configuration ID is missing.',
      )

      return
    }

    /*
     * Validate organization
     */
    if (!organizationId) {
      showError(
        'Organization ID is missing.',
      )

      return
    }

    /*
     * Prevent double clicks
     */
    if (loading) {
      return
    }

    /*
     * Clear previous signup data.
     */
    clearSignupStorage()

    completingRef.current =
      false

    setLoading(true)
    setError('')

    console.log(
      'Calling window.FB.login()...',
    )

    try {
      window.FB.login(
        (response) => {
          console.log(
            '====================================',
          )

          console.log(
            'FB.login CALLBACK',
          )

          console.log(
            '====================================',
          )

          console.log(
            'Meta login response:',
            response,
          )

          /*
           * User cancelled Meta login
           */
          if (
            !response
          ) {
            clearSignupStorage()

            showError(
              'Meta did not return a response.',
            )

            return
          }

          /*
           * No authResponse means the login
           * was cancelled or rejected.
           */
          if (
            !response.authResponse
          ) {
            clearSignupStorage()

            showError(
              'WhatsApp setup was cancelled or Meta login failed.',
            )

            return
          }

          /*
           * Embedded Signup configured with
           * response_type=code should return
           * an authorization code.
           */
          const code =
            response
              .authResponse
              .code

          console.log(
            'Authorization code received:',
            Boolean(code),
          )

          if (!code) {
            clearSignupStorage()

            showError(
              'Meta did not return an authorization code.',
            )

            return
          }

          /*
           * Save authorization code.
           */
          sessionStorage.setItem(
            CODE_STORAGE_KEY,
            code,
          )

          console.log(
            'Authorization code saved.',
          )

          /*
           * Check whether the
           * WA_EMBEDDED_SIGNUP message
           * has already arrived.
           */
          const storedData =
            sessionStorage.getItem(
              DATA_STORAGE_KEY,
            )

          if (!storedData) {
            console.log(
              'Authorization code received. Waiting for WA_EMBEDDED_SIGNUP event...',
            )

            return
          }

          try {
            const signupData =
              JSON.parse(
                storedData,
              ) as SignupData

            console.log(
              'Signup data already available:',
              signupData,
            )

            completeSignup(
              code,
              signupData,
            )
          } catch (error) {
            console.error(
              'Failed to parse stored signup data:',
              error,
            )

            clearSignupStorage()

            showError(
              'Invalid WhatsApp signup data.',
            )
          }
        },

        {
          config_id:
            META_CONFIG_ID,

          response_type:
            'code',

          override_default_response_type:
            true,

            extras: {
              setup: {},
            
              featureType:
                'whatsapp_business_app_onboarding',
            
              sessionInfoVersion:
                '3',
            },
        },
      )

      console.log(
        'FB.login() called successfully.',
      )

      /*
       * Safety timeout.
       *
       * If Meta does absolutely nothing,
       * don't leave the CRM stuck forever.
       */
      timeoutRef.current =
        window.setTimeout(() => {
          setLoading(
            (current) => {
              if (!current) {
                return current
              }

              console.warn(
                'Meta Embedded Signup timed out.',
              )

              setError(
                'Meta WhatsApp signup did not open or respond. Please check your Meta App configuration and browser console.',
              )

              onError?.(
                'Meta WhatsApp signup did not open or respond.',
              )

              return false
            },
          )

          timeoutRef.current =
            null
        }, 60000)
    } catch (error) {
      console.error(
        'Exception while calling FB.login():',
        error,
      )

      clearSignupStorage()

      const message =
        error instanceof Error
          ? error.message
          : 'Failed to launch Meta WhatsApp signup.'

      showError(message)
    }
  }

  /*
   * ============================================================
   * CLEANUP
   * ============================================================
   */

  useEffect(() => {
    return () => {
      if (
        timeoutRef.current
      ) {
        window.clearTimeout(
          timeoutRef.current,
        )
      }
    }
  }, [])

  /*
   * ============================================================
   * UI
   * ============================================================
   */

  return (
    <Box>
      <Button
        variant="contained"
        onClick={
          launchSignup
        }
        disabled={
          !sdkReady ||
          loading
        }
        startIcon={
          loading ? (
            <CircularProgress
              size={18}
              color="inherit"
            />
          ) : undefined
        }
        sx={{
          bgcolor:
            '#25D366',

          '&:hover': {
            bgcolor:
              '#20BD5A',
          },
        }}
      >
        {loading
          ? 'Connecting WhatsApp...'
          : sdkReady
            ? 'Connect WhatsApp'
            : 'Loading WhatsApp...'}
      </Button>

      {error && (
        <Alert
          severity="error"
          sx={{
            mt: 2,
          }}
          onClose={() =>
            setError('')
          }
        >
          {error}
        </Alert>
      )}
    </Box>
  )
}
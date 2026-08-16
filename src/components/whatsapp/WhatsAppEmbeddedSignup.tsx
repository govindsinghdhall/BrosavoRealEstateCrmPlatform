import {
  useEffect,
  useRef,
  useState,
} from 'react'

import {
  Alert,
  Box,
  Button,
  CircularProgress,
} from '@mui/material'

import { whatsappService } from '@/api/services/whatsapp.service'
import { loadMetaSDK } from '@/api/services/meta.service'

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

    error_message?: string
    error_code?: string
  }
}

const META_APP_ID =
  import.meta.env.VITE_META_APP_ID

const META_CONFIG_ID =
  import.meta.env
    .VITE_WHATSAPP_EMBEDDED_SIGNUP_CONFIG_ID

const CODE_STORAGE_KEY =
  'whatsapp_embedded_signup_code'

const DATA_STORAGE_KEY =
  'whatsapp_embedded_signup_data'

export default function WhatsAppEmbeddedSignup({
  organizationId,
  onSuccess,
  onError,
}: WhatsAppEmbeddedSignupProps) {
  const [
    sdkReady,
    setSdkReady,
  ] = useState(false)

  const [
    loading,
    setLoading,
  ] = useState(false)

  const [
    error,
    setError,
  ] = useState('')

  const completingRef =
    useRef(false)

  const timeoutRef =
    useRef<number | null>(null)

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

  const showError = (
    message: string,
  ) => {
    console.error(
      'WhatsApp Embedded Signup:',
      message,
    )

    setLoading(false)
    setError(message)

    onError?.(message)
  }

  const clearTimeoutTimer = () => {
    if (
      timeoutRef.current
    ) {
      window.clearTimeout(
        timeoutRef.current,
      )

      timeoutRef.current =
        null
    }
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
    if (
      completingRef.current
    ) {
      console.log(
        'Embedded Signup completion already in progress.',
      )

      return
    }

    completingRef.current =
      true

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
       * Send the authorization CODE and
       * WhatsApp asset information to backend.
       *
       * Do NOT send a Meta access token here.
       */
      await whatsappService.completeEmbeddedSignup(
        {
          organizationId:
            signupData.organizationId,

          wabaId:
            signupData.wabaId,

          phoneNumberId:
            signupData.phoneNumberId,

          businessId:
            signupData.businessId,

          code,
        },
      )

      console.log(
        'WhatsApp Embedded Signup completed successfully.',
      )

      clearSignupStorage()
      clearTimeoutTimer()

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
      clearTimeoutTimer()

      showError(message)
    } finally {
      completingRef.current =
        false
    }
  }

  /*
   * ============================================================
   * INITIALIZE META SDK
   * ============================================================
   */

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
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

      try {
        console.log(
          'Loading Facebook SDK...',
        )

        await loadMetaSDK()

        if (cancelled) {
          return
        }

        console.log(
          'Facebook SDK ready.',
        )

        setSdkReady(true)
        setError('')
      } catch (error) {
        if (cancelled) {
          return
        }

        console.error(
          'Facebook SDK initialization failed:',
          error,
        )

        setError(
          error instanceof Error
            ? error.message
            : 'Failed to initialize Meta Facebook SDK.',
        )
      }
    }

    initialize()

    return () => {
      cancelled = true
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
      /*
       * Only accept messages from Meta/Facebook.
       */
      if (
        event.origin !==
          'https://www.facebook.com' &&
        event.origin !==
          'https://web.facebook.com'
      ) {
        return
      }

      console.log(
        'Meta message received:',
        {
          origin:
            event.origin,

          data:
            event.data,
        },
      )

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
        data.type !==
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
        clearTimeoutTimer()

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
        clearTimeoutTimer()

        const metaError =
          data.data
            ?.error_message

        showError(
          metaError ||
            'Meta WhatsApp Embedded Signup returned an error.',
        )

        return
      }

      /*
       * ========================================================
       * FINISH
       * ========================================================
       */

      const isFinishEvent =
        data.event ===
          'FINISH' ||
        data.event ===
          'FINISH_ONLY_WABA' ||
        data.event ===
          'FINISH_WHATSAPP_BUSINESS_APP_ONBOARDING'

      if (!isFinishEvent) {
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
       * Meta must return WABA ID and
       * Phone Number ID for our flow.
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
       * Store WhatsApp asset information.
       *
       * FB.login() and WA_EMBEDDED_SIGNUP
       * are asynchronous and may arrive
       * in either order.
       */
      sessionStorage.setItem(
        DATA_STORAGE_KEY,

        JSON.stringify(
          signupData,
        ),
      )

      /*
       * Check whether authorization code
       * has already arrived.
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
       * Both code + WABA information
       * are now available.
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
      'Organization ID:',
      organizationId,
    )

    /*
     * Validate SDK.
     */
    if (!window.FB) {
      showError(
        'Meta Facebook SDK is not loaded.',
      )

      return
    }

    /*
     * Validate App ID.
     */
    if (!META_APP_ID) {
      showError(
        'Meta App ID is missing.',
      )

      return
    }

    /*
     * Validate Config ID.
     */
    if (!META_CONFIG_ID) {
      showError(
        'Meta WhatsApp Configuration ID is missing.',
      )

      return
    }

    /*
     * Validate organization.
     */
    if (!organizationId) {
      showError(
        'Organization ID is missing.',
      )

      return
    }

    /*
     * Prevent double-clicks.
     */
    if (loading) {
      return
    }

    /*
     * Clear any previous signup.
     */
    clearSignupStorage()
    clearTimeoutTimer()

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
            'FULL META LOGIN RESPONSE:',
            response,
          )

          console.log(
            'META LOGIN STATUS:',
            response?.status,
          )

          console.log(
            'META AUTH RESPONSE:',
            response?.authResponse,
          )

          /*
           * IMPORTANT:
           *
           * Do NOT immediately call this
           * "cancelled" simply because
           * authResponse is null.
           */
          if (!response) {
            clearSignupStorage()

            showError(
              'Meta did not return a response.',
            )

            return
          }

          if (
            !response.authResponse
          ) {
            console.warn(
              'Meta FB.login returned no authResponse.',
              {
                status:
                  response.status,

                response,
              },
            )

            /*
             * This is intentionally logged
             * instead of being silently converted
             * into a cancellation.
             */
            clearSignupStorage()

            if (
              response.status ===
              'unknown'
            ) {
              showError(
                'Meta login returned status "unknown". Check the browser console and Meta App configuration.',
              )

              return
            }

            showError(
              'Meta did not return an authorization response.',
            )

            return
          }

          /*
           * Embedded Signup is using
           * response_type=code.
           */
          const authResponse =
            response.authResponse as
              | {
                  code?: string
                  accessToken?: string
                }
              | undefined

          const code =
            authResponse?.code

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
           * WA_EMBEDDED_SIGNUP event
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

            void completeSignup(
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

              const message =
                'Meta WhatsApp signup did not open or respond. Please check your Meta App configuration and browser console.'

              setError(message)

              onError?.(
                message,
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
      clearTimeoutTimer()

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
      clearTimeoutTimer()
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
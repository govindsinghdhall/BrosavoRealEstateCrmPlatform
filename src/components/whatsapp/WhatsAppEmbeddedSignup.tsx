import { useEffect, useRef, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  CircularProgress,
} from '@mui/material'
import { whatsappService } from '@/api/services/whatsapp.service'
import {
  launchWhatsAppSignup,
  loadMetaSDK,
} from '@/api/services/meta.service'

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

export default function WhatsAppEmbeddedSignup({
  organizationId,
  onSuccess,
  onError,
}: WhatsAppEmbeddedSignupProps) {
  const [sdkReady, setSdkReady] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const launchingRef = useRef(false)
  const completingRef = useRef(false)

  const showError = (message: string) => {
    launchingRef.current = false
    setLoading(false)
    setError(message)
    onError?.(message)
  }

  const completeSignup = async (code: string, state: string) => {
    if (completingRef.current) {
      return
    }

    completingRef.current = true

    try {
      setLoading(true)
      setError('')

      const result = await whatsappService.completeEmbeddedSignup({
        code,
        state,
      })

      launchingRef.current = false
      setLoading(false)

      onSuccess?.({
        organizationId,
        wabaId: result.account?.wabaId ?? '',
        phoneNumberId: result.account?.phoneNumberId ?? '',
        businessId: result.account?.businessId,
      })
    } catch (caught: unknown) {
      const axiosLike = caught as {
        response?: { data?: { message?: string; error?: { message?: string } } }
        message?: string
      }

      showError(
        axiosLike.response?.data?.message ||
          axiosLike.response?.data?.error?.message ||
          axiosLike.message ||
          'Failed to connect WhatsApp account.',
      )
    } finally {
      completingRef.current = false
    }
  }

  useEffect(() => {
    let cancelled = false

    const initialize = async () => {
      try {
        await loadMetaSDK()
        if (!cancelled) {
          setSdkReady(true)
          setError('')
        }
      } catch (caught) {
        if (!cancelled) {
          setError(
            caught instanceof Error
              ? caught.message
              : 'Failed to initialize Meta Facebook SDK.',
          )
        }
      }
    }

    initialize()

    return () => {
      cancelled = true
    }
  }, [])

  const launchSignup = async () => {
    if (!sdkReady || loading || launchingRef.current) {
      return
    }

    if (!organizationId) {
      showError('Organization ID is missing.')
      return
    }

    launchingRef.current = true
    setLoading(true)
    setError('')

    try {
      const { state } = await whatsappService.initiateConnect()

      await launchWhatsAppSignup(
        (code) => {
          void completeSignup(code, state)
        },
        () => {
          showError('WhatsApp setup was cancelled.')
        },
        (launchError) => {
          showError(launchError.message)
        },
      )
    } catch (caught: unknown) {
      const axiosLike = caught as {
        response?: { data?: { message?: string } }
        message?: string
      }
      showError(
        axiosLike.response?.data?.message ||
          axiosLike.message ||
          'Failed to start WhatsApp signup.',
      )
    }
  }

  return (
    <Box>
      <Button
        variant="contained"
        onClick={() => {
          void launchSignup()
        }}
        disabled={!sdkReady || loading}
        startIcon={
          loading ? <CircularProgress size={18} color="inherit" /> : undefined
        }
        sx={{
          bgcolor: '#25D366',
          '&:hover': { bgcolor: '#20BD5A' },
        }}
      >
        {loading
          ? 'Connecting WhatsApp...'
          : sdkReady
            ? 'Connect WhatsApp'
            : 'Loading WhatsApp...'}
      </Button>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Box>
  )
}

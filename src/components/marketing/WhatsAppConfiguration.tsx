import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2, Webhook } from 'lucide-react'
import { getErrorMessage } from '@/api/client'
import { organizationService } from '@/api/services'
import { WhatsAppTemplatesManager } from '@/components/whatsapp/WhatsAppTemplatesManager'
import WhatsAppEmbeddedSignup from '@/components/whatsapp/WhatsAppEmbeddedSignup'
import { useOrganizationStore } from '@/store/organizationStore'
import { applyOrganizationBranding } from '@/utils/branding'
import type { Organization } from '@/types/organization'
import { MarketingCard, MarketingSection } from './MarketingCard'

export function WhatsAppConfiguration() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const queryClient = useQueryClient()

  const setOrganization = useOrganizationStore(
    (state) => state.setOrganization,
  )

  const [form, setForm] = useState({
    whatsappBusinessPhone: '',
    whatsappBusinessId: '',
    whatsappDisplayName: '',
    accessToken: '',
  })

  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['organization', 'current'],
    queryFn: organizationService.getCurrent,
  })

  useEffect(() => {
    if (!data) return

    setForm({
      whatsappBusinessPhone:
        data.settings?.whatsapp?.businessPhone ?? '',

      whatsappBusinessId:
        data.settings?.whatsapp?.businessId ?? '',

      whatsappDisplayName:
        data.settings?.whatsapp?.displayName ?? '',

      accessToken: '',
    })
  }, [data])

  const applyOrg = async (org: Organization) => {
    setOrganization(org)

    applyOrganizationBranding(org)

    await queryClient.invalidateQueries({
      queryKey: ['organization', 'current'],
    })
  }

  const saveMutation = useMutation({
    mutationFn: organizationService.updateCurrent,

    onSuccess: async (org) => {
      await applyOrg(org)

      setSuccess(
        'WhatsApp settings saved successfully.',
      )

      setError('')
    },

    onError: (err) => {
      setError(getErrorMessage(err))
    },
  })

  const handleSave = () => {
    setSuccess('')
    setError('')

    saveMutation.mutate({
      settings: {
        ...data?.settings,

        whatsapp: {
          businessPhone:
            form.whatsappBusinessPhone.trim() ||
            undefined,

          businessId:
            form.whatsappBusinessId.trim() ||
            undefined,

          displayName:
            form.whatsappDisplayName.trim() ||
            undefined,
        },
      },
    })
  }

  const handleWhatsAppSuccess = async (signupData: {
    organizationId: number
    wabaId: string
    phoneNumberId: string
    businessId?: string
    code?: string
  }) => {
    console.log(
      'WhatsApp Embedded Signup successful:',
      signupData,
    )

    setSuccess(
      'WhatsApp Business account connected successfully.',
    )

    setError('')

    /*
     * Refresh organization information.
     *
     * The backend should have already saved the
     * WhatsApp account during Embedded Signup.
     */
    await queryClient.invalidateQueries({
      queryKey: ['organization', 'current'],
    })

    /*
     * Reload current organization data so the UI
     * immediately reflects the new connection.
     */
    await queryClient.refetchQueries({
      queryKey: ['organization', 'current'],
    })
  }

  const handleWhatsAppError = (message: string) => {
    console.error(
      'WhatsApp Embedded Signup failed:',
      message,
    )

    setError(message)
    setSuccess('')
  }

  const webhookConnected = Boolean(
    form.whatsappBusinessId,
  )

  /*
   * The organization ID comes from the currently
   * authenticated organization.
   */
  const organizationId = data?.id
  ? Number(data.id)
  : undefined

  return (
    <MarketingSection title="WhatsApp Business Configuration">
      <MarketingCard
        hover={false}
        padding={{ xs: 2, sm: 3 }}
      >
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert
            severity="success"
            sx={{ mb: 2 }}
            onClose={() => setSuccess('')}
          >
            {success}
          </Alert>
        )}

        {/* =====================================================
            CONNECT WHATSAPP
        ====================================================== */}

        <Box
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark
              ? alpha('#fff', 0.1)
              : '#E2E8F0',
            bgcolor: isDark
              ? alpha('#fff', 0.025)
              : '#F8FAFC',
          }}
        >
          <Box
            display="flex"
            alignItems="center"
            justifyContent="space-between"
            flexWrap="wrap"
            gap={2}
          >
            <Box>
              <Typography
                variant="h6"
                fontWeight={700}
              >
                Connect WhatsApp
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                Connect the organization's WhatsApp
                Business account through Meta.
              </Typography>
            </Box>

            {organizationId ? (
              <WhatsAppEmbeddedSignup
                organizationId={Number(organizationId)}
                onSuccess={handleWhatsAppSuccess}
                onError={handleWhatsAppError}
              />
            ) : (
              <Button
                variant="contained"
                disabled
              >
                Loading organization...
              </Button>
            )}
          </Box>

          <Typography
            variant="caption"
            color="text.secondary"
            sx={{
              display: 'block',
              mt: 1.5,
            }}
          >
            The customer will complete the Meta
            WhatsApp onboarding flow. Their WhatsApp
            Business Account and phone number will then
            be connected to this organization.
          </Typography>
        </Box>

        <Divider sx={{ mb: 3 }} />

        {/* =====================================================
            CURRENT WHATSAPP SETTINGS
        ====================================================== */}

        <Typography
          variant="subtitle1"
          fontWeight={700}
          sx={{ mb: 2 }}
        >
          WhatsApp Account Details
        </Typography>

        <Box
          display="grid"
          gridTemplateColumns={{
            xs: '1fr',
            md: '1fr 1fr',
          }}
          gap={2}
        >
          <TextField
            label="Business Phone"
            value={form.whatsappBusinessPhone}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                whatsappBusinessPhone:
                  e.target.value,
              }))
            }
            fullWidth
            disabled={
              isLoading ||
              saveMutation.isPending
            }
            helperText="Phone registered with WhatsApp Business API"
          />

          <TextField
            label="Business ID"
            value={form.whatsappBusinessId}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                whatsappBusinessId:
                  e.target.value,
              }))
            }
            fullWidth
            disabled={
              isLoading ||
              saveMutation.isPending
            }
            helperText="WhatsApp Business Account ID"
          />

          <TextField
            label="Display Name"
            value={form.whatsappDisplayName}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                whatsappDisplayName:
                  e.target.value,
              }))
            }
            fullWidth
            disabled={
              isLoading ||
              saveMutation.isPending
            }
          />

          <TextField
            label="Access Token"
            type="password"
            value={form.accessToken}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                accessToken:
                  e.target.value,
              }))
            }
            fullWidth
            disabled={
              isLoading ||
              saveMutation.isPending
            }
            helperText="Stored securely — leave blank to keep existing token"
            autoComplete="new-password"
          />
        </Box>

        {/* =====================================================
            WEBHOOK STATUS + SAVE
        ====================================================== */}

        <Box
          mt={2.5}
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flexWrap="wrap"
          gap={2}
        >
          <Box
            display="flex"
            alignItems="center"
            gap={1.5}
            sx={{
              px: 1.5,
              py: 1,
              borderRadius: '10px',
              bgcolor: isDark
                ? alpha('#fff', 0.04)
                : '#F8FAFC',
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Webhook
              size={16}
              color={
                webhookConnected
                  ? '#2E7D32'
                  : '#8B9CB3'
              }
            />

            <Typography
              variant="body2"
              fontWeight={600}
            >
              Webhook Status
            </Typography>

            <Chip
              size="small"
              icon={
                webhookConnected ? (
                  <CheckCircle2 size={14} />
                ) : undefined
              }
              label={
                webhookConnected
                  ? 'Connected'
                  : 'Not configured'
              }
              color={
                webhookConnected
                  ? 'success'
                  : 'default'
              }
              variant="outlined"
            />
          </Box>

          <Button
            variant="contained"
            onClick={handleSave}
            disabled={
              isLoading ||
              saveMutation.isPending
            }
          >
            {saveMutation.isPending
              ? 'Saving...'
              : 'Save Settings'}
          </Button>
        </Box>

        {/* =====================================================
            TEMPLATES
        ====================================================== */}

        <Box mt={4}>
          <WhatsAppTemplatesManager />
        </Box>
      </MarketingCard>
    </MarketingSection>
  )
}
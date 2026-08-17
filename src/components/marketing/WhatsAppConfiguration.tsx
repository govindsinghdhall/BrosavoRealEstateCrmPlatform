import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CheckCircle2 } from 'lucide-react'
import { getErrorMessage } from '@/api/client'
import { organizationService } from '@/api/services'
import WhatsAppEmbeddedSignup from '@/components/whatsapp/WhatsAppEmbeddedSignup'
import { whatsappService } from '@/api/services/whatsapp.service'
import { MarketingCard, MarketingSection } from './MarketingCard'

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={700}>
        {value || '—'}
      </Typography>
    </Box>
  )
}

export function WhatsAppConfiguration() {
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const queryClient = useQueryClient()
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const orgQuery = useQuery({
    queryKey: ['organization', 'current'],
    queryFn: organizationService.getCurrent,
  })

  const connectionQuery = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: () => whatsappService.getSettings(),
  })

  const connection = connectionQuery.data
  const connected = Boolean(connection?.isConnected)
  const organizationId = orgQuery.data?.id ? Number(orgQuery.data.id) : undefined

  const disconnectMutation = useMutation({
    mutationFn: () => whatsappService.disconnect(),
    onSuccess: async () => {
      setSuccess('WhatsApp disconnected.')
      setError('')
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-settings'] })
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  const testMutation = useMutation({
    mutationFn: () => whatsappService.testConnection(),
    onSuccess: (result) => {
      setSuccess(result.message)
      setError('')
    },
    onError: (err) => {
      setError(getErrorMessage(err))
      setSuccess('')
    },
  })

  return (
    <MarketingSection title="WhatsApp Business Configuration">
      <MarketingCard hover={false} padding={{ xs: 2, sm: 3 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
            {success}
          </Alert>
        )}

        <Box
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2,
            border: '1px solid',
            borderColor: isDark ? alpha('#fff', 0.1) : '#E2E8F0',
            bgcolor: isDark ? alpha('#fff', 0.025) : '#F8FAFC',
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
              <Typography variant="h6" fontWeight={700}>
                {connected ? 'WhatsApp Connected' : 'Connect WhatsApp'}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {connected
                  ? 'This organization can send and receive WhatsApp messages from BROSAVO.'
                  : 'Connect the organization WhatsApp Business Account through Meta Embedded Signup.'}
              </Typography>
            </Box>

            {connected ? (
              <Chip
                icon={<CheckCircle2 size={14} />}
                label="Connected"
                color="success"
                variant="outlined"
              />
            ) : organizationId ? (
              <WhatsAppEmbeddedSignup
                organizationId={organizationId}
                onSuccess={async () => {
                  setSuccess('WhatsApp Business account connected successfully.')
                  setError('')
                  await queryClient.invalidateQueries({
                    queryKey: ['whatsapp-settings'],
                  })
                }}
                onError={setError}
              />
            ) : (
              <Button variant="contained" disabled>
                Loading organization...
              </Button>
            )}
          </Box>
        </Box>

        {connected && (
          <>
            <Typography variant="subtitle1" fontWeight={700} sx={{ mb: 2 }}>
              Connection details
            </Typography>
            <Box
              display="grid"
              gridTemplateColumns={{ xs: '1fr', md: '1fr 1fr' }}
              gap={2}
            >
              <Detail label="Display Name" value={connection?.displayName} />
              <Detail
                label="Business Phone"
                value={connection?.businessPhone || connection?.phoneNumber}
              />
              <Detail
                label="WhatsApp Business Account ID"
                value={connection?.wabaId}
              />
              <Detail label="Phone Number ID" value={connection?.phoneNumberId} />
              <Detail
                label="Meta Business ID"
                value={connection?.metaBusinessId || connection?.businessId}
              />
              <Detail
                label="Connected"
                value={
                  connection?.connectedAt
                    ? new Date(connection.connectedAt).toLocaleString()
                    : '—'
                }
              />
            </Box>

            <Divider sx={{ my: 3 }} />

            <Box display="flex" gap={1} flexWrap="wrap">
              <Button
                variant="outlined"
                onClick={() => testMutation.mutate()}
                disabled={testMutation.isPending}
                startIcon={
                  testMutation.isPending ? (
                    <CircularProgress size={16} color="inherit" />
                  ) : undefined
                }
              >
                Test Connection
              </Button>
              <Button
                color="error"
                variant="outlined"
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
              >
                Disconnect WhatsApp
              </Button>
            </Box>
          </>
        )}
      </MarketingCard>
    </MarketingSection>
  )
}

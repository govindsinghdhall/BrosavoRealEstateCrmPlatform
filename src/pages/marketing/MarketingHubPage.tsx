import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Skeleton,
  Snackbar,
  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Link2, MessageCircle, RefreshCw } from 'lucide-react'
import { getErrorMessage } from '@/api/client'
import { marketingService } from '@/api/services'
import { MarketingHeader } from '@/components/marketing/MarketingHeader'
import { MarketingSummaryCards } from '@/components/marketing/MarketingSummaryCards'
import { MarketingTabs } from '@/components/marketing/MarketingTabs'
import { WhatsAppTab } from '@/components/marketing/WhatsAppTab'
import { GoogleBusinessTab } from '@/components/marketing/GoogleBusinessTab'
import { AIContentStudio } from '@/components/marketing/AIContentStudio'
import { AnalyticsDashboard } from '@/components/marketing/AnalyticsDashboard'
import { MarketingSettings } from '@/components/marketing/MarketingSettings'
import type { MarketingTabId } from '@/types/marketing'
import { MarketingCard } from '@/components/marketing/MarketingCard'

function MarketingHubSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width={220} height={44} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
      <Box display="grid" gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr', md: 'repeat(3, 1fr)' }} gap={2} mb={3}>
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="rounded" height={120} sx={{ borderRadius: '12px' }} />
        ))}
      </Box>
      <Skeleton variant="rounded" height={48} sx={{ mb: 3, borderRadius: '12px' }} />
      <Skeleton variant="rounded" height={360} sx={{ borderRadius: '12px' }} />
    </Box>
  )
}

export function MarketingHubPage() {
  const queryClient = useQueryClient()
  const [searchParams, setSearchParams] = useSearchParams()
  const [tab, setTab] = useState<MarketingTabId>('google')
  const [toast, setToast] = useState<{ message: string; severity: 'success' | 'error' | 'info' } | null>(null)

  const dashboardQuery = useQuery({
    queryKey: ['marketing', 'dashboard'],
    queryFn: marketingService.getDashboard,
  })

  const reviewsQuery = useQuery({
    queryKey: ['marketing', 'reviews'],
    queryFn: () => marketingService.listReviews({ page: 1, limit: 50 }),
  })

  const contentQuery = useQuery({
    queryKey: ['marketing', 'content'],
    queryFn: marketingService.listContent,
  })

  const campaignsQuery = useQuery({
    queryKey: ['marketing', 'campaigns'],
    queryFn: marketingService.listCampaigns,
  })

  const analyticsQuery = useQuery({
    queryKey: ['marketing', 'analytics', 'reviews'],
    queryFn: marketingService.getReviewAnalytics,
    enabled: tab === 'analytics',
  })

  useEffect(() => {
    const google = searchParams.get('google')
    if (!google) return
    if (google === 'connected') {
      setToast({ message: 'Google Business connected successfully.', severity: 'success' })
      setTab('google')
      void queryClient.invalidateQueries({ queryKey: ['marketing'] })
    } else if (google === 'error') {
      setToast({
        message: searchParams.get('message') || 'Could not connect Google Business. Try again.',
        severity: 'error',
      })
    }
    searchParams.delete('google')
    searchParams.delete('message')
    setSearchParams(searchParams, { replace: true })
  }, [searchParams, setSearchParams, queryClient])

  const connectMutation = useMutation({
    mutationFn: marketingService.getGoogleLoginUrl,
    onSuccess: (url) => {
      window.location.href = url
    },
    onError: (err) => setToast({ message: getErrorMessage(err), severity: 'error' }),
  })

  const disconnectMutation = useMutation({
    mutationFn: marketingService.disconnectGoogle,
    onSuccess: async () => {
      setToast({ message: 'Google Business disconnected.', severity: 'info' })
      await queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
    onError: (err) => setToast({ message: getErrorMessage(err), severity: 'error' }),
  })

  const syncMutation = useMutation({
    mutationFn: marketingService.syncReviews,
    onSuccess: async (result) => {
      const upserted = (result as { upserted?: number })?.upserted ?? 0
      setToast({
        message:
          upserted > 0
            ? `Synced ${upserted} review${upserted === 1 ? '' : 's'} from Google.`
            : 'Sync complete. No new reviews found yet.',
        severity: 'success',
      })
      await queryClient.invalidateQueries({ queryKey: ['marketing'] })
    },
    onError: (err) => setToast({ message: getErrorMessage(err), severity: 'error' }),
  })

  const settingsMutation = useMutation({
    mutationFn: marketingService.updateSettings,
    onSuccess: async () => {
      setToast({ message: 'Settings saved.', severity: 'success' })
      await queryClient.invalidateQueries({ queryKey: ['marketing', 'dashboard'] })
    },
    onError: (err) => setToast({ message: getErrorMessage(err), severity: 'error' }),
  })

  const hub = dashboardQuery.data

  const needsSetup = useMemo(() => {
    if (!hub) return false
    return !hub.googleBusiness.connected && !hub.whatsappConfigured
  }, [hub])

  if (dashboardQuery.isLoading) {
    return <MarketingHubSkeleton />
  }

  if (dashboardQuery.isError || !hub) {
    return (
      <Box>
        <MarketingHeader />
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => dashboardQuery.refetch()}>
              Retry
            </Button>
          }
        >
          {getErrorMessage(dashboardQuery.error) || 'Could not load Marketing Hub.'}
        </Alert>
      </Box>
    )
  }

  return (
    <Box>
      <MarketingHeader />

      {needsSetup && (
        <MarketingCard hover={false} sx={{ mb: 3 }}>
          <Typography variant="h6" fontWeight={750} mb={1}>
            Get started in 2 steps
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={2} maxWidth={640}>
            Connect the channels you already use. You can finish either step first — nothing here is required to keep
            using the rest of your CRM.
          </Typography>
          <Box display="flex" gap={1.5} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<Link2 size={16} />}
              onClick={() => {
                setTab('google')
                connectMutation.mutate()
              }}
              disabled={connectMutation.isPending}
            >
              1. Connect Google Business
            </Button>
            <Button
              variant="outlined"
              startIcon={<MessageCircle size={16} />}
              onClick={() => setTab('whatsapp')}
            >
              2. Set up WhatsApp
            </Button>
          </Box>
        </MarketingCard>
      )}

      <MarketingSummaryCards
        summary={hub.summary}
        onManagePlatforms={() => setTab('settings')}
        onReviewReplies={() => setTab('google')}
      />

      <Box display="flex" justifyContent="flex-end" mb={1}>
        {hub.googleBusiness.connected && (
          <Button
            size="small"
            startIcon={<RefreshCw size={14} />}
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            {syncMutation.isPending ? 'Syncing reviews…' : 'Sync Google reviews'}
          </Button>
        )}
      </Box>

      <MarketingTabs value={tab} onChange={setTab} />

      <AnimatePresence mode="wait">
        <Box
          key={tab}
          component={motion.div}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.25 }}
        >
          {tab === 'whatsapp' && (
            <WhatsAppTab
              campaigns={campaignsQuery.data ?? []}
              loadingCampaigns={campaignsQuery.isLoading}
              onCampaignCreated={() => queryClient.invalidateQueries({ queryKey: ['marketing', 'campaigns'] })}
            />
          )}
          {tab === 'google' && (
            <GoogleBusinessTab
              profile={hub.googleBusiness}
              reviewStats={hub.reviewStats}
              reviews={reviewsQuery.data?.data ?? []}
              contentQueue={contentQuery.data ?? []}
              postsSummary={hub.postsSummary}
              posts={(contentQuery.data ?? []).filter((item) => item.contentType === 'post' || item.type === 'post')}
              connecting={connectMutation.isPending}
              onConnect={() => connectMutation.mutate()}
              onRefresh={() => queryClient.invalidateQueries({ queryKey: ['marketing'] })}
              onNotify={(message, severity = 'success') => setToast({ message, severity })}
            />
          )}
          {tab === 'ai' && (
            <AIContentStudio
              tone={hub.settings.defaultAiTone || 'professional'}
              onNotify={(message, severity = 'success') => setToast({ message, severity })}
            />
          )}
          {tab === 'analytics' && (
            <AnalyticsDashboard
              summary={hub.summary}
              analytics={analyticsQuery.data}
              loading={analyticsQuery.isLoading}
            />
          )}
          {tab === 'settings' && (
            <MarketingSettings
              settings={hub.settings}
              saving={settingsMutation.isPending}
              disconnecting={disconnectMutation.isPending}
              onSave={(next) =>
                settingsMutation.mutate({
                  enableAiReply: next.enableAiReplies,
                  reviewApprovalRequired: next.reviewApprovalRequired,
                  emailNotification: next.emailNotifications,
                  notificationEmail: next.notificationEmail ?? null,
                  autoSyncReviews: next.autoSyncReviews,
                  autoFetchInterval: next.autoFetchInterval,
                  defaultAiTone: next.defaultAiTone,
                  theme: next.theme,
                })
              }
              onConnectGoogle={() => connectMutation.mutate()}
              onDisconnectGoogle={() => disconnectMutation.mutate()}
            />
          )}
        </Box>
      </AnimatePresence>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        {toast ? (
          <Alert severity={toast.severity} onClose={() => setToast(null)} variant="filled" sx={{ width: '100%' }}>
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}

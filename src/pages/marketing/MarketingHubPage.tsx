import { useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  CircularProgress,
  IconButton,
  Skeleton,
  Snackbar,

  Typography,
} from '@mui/material'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  BarChart3,
  ChevronRight,
  Globe2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  Settings2,
  Smartphone,
  Sparkles,
  Zap,
} from 'lucide-react'

import { getErrorMessage } from '@/api/client'
import { marketingService } from '@/api/services'
import { WhatsAppPage } from '@/pages/marketing/WhatsAppPage'
import { GoogleBusinessTab } from '@/components/marketing/GoogleBusinessTab'
import { AIContentStudio } from '@/components/marketing/AIContentStudio'
import { AnalyticsDashboard } from '@/components/marketing/AnalyticsDashboard'
import { MarketingSettings } from '@/components/marketing/MarketingSettings'

type MarketingView =
  | 'overview'
  | 'whatsapp'
  | 'google'
  | 'ai'
  | 'analytics'
  | 'settings'
  | 'email'
  | 'sms'
  | 'calls'
  | 'automation'
  | 'website'

interface MarketingTool {
  id: MarketingView
  title: string
  description: string
  icon: typeof MessageCircle
  status?: string
  available?: boolean
}

const MARKETING_TOOLS: MarketingTool[] = [
  {
    id: 'whatsapp',
    title: 'WhatsApp',
    description: 'Conversations, templates and campaigns',
    icon: MessageCircle,
    status: 'Available',
    available: true,
  },
  {
    id: 'google',
    title: 'Google Business',
    description: 'Reviews, posts and business presence',
    icon: Globe2,
    status: 'Available',
    available: true,
  },
  {
    id: 'email',
    title: 'Email',
    description: 'Email campaigns and customer outreach',
    icon: Mail,
    status: 'Coming soon',
    available: false,
  },
  {
    id: 'sms',
    title: 'SMS',
    description: 'SMS campaigns and notifications',
    icon: Smartphone,
    status: 'Coming soon',
    available: false,
  },
  {
    id: 'calls',
    title: 'Calls',
    description: 'Outbound calling and follow-ups',
    icon: Phone,
    status: 'Coming soon',
    available: false,
  },
  {
    id: 'automation',
    title: 'Automation',
    description: 'Automate marketing workflows',
    icon: Zap,
    status: 'Coming soon',
    available: false,
  },
  {
    id: 'website',
    title: 'Website',
    description: 'Lead capture and website marketing',
    icon: Globe2,
    status: 'Coming soon',
    available: false,
  },
  {
    id: 'ai',
    title: 'AI Content',
    description: 'Create marketing content with AI',
    icon: Sparkles,
    status: 'Available',
    available: true,
  },
]

function MarketingPageSkeleton() {
  return (
    <Box>
      <Skeleton
        variant="text"
        width={220}
        height={48}
        sx={{ mb: 1 }}
      />

      <Skeleton
        variant="text"
        width={520}
        height={28}
        sx={{ mb: 4 }}
      />

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(2, 1fr)',
            md: 'repeat(4, 1fr)',
          },
          gap: 2,
        }}
      >
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            height={180}
            sx={{ borderRadius: 3 }}
          />
        ))}
      </Box>
    </Box>
  )
}

interface ToolCardProps {
  tool: MarketingTool
  onClick: () => void
}

function MarketingToolCard({
  tool,
  onClick,
}: ToolCardProps) {
  const Icon = tool.icon

  return (
    <Card
      elevation={0}
      sx={{
        height: '100%',
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        opacity: tool.available ? 1 : 0.65,
        transition:
          'transform 180ms ease, box-shadow 180ms ease, border-color 180ms ease',
        '&:hover': tool.available
          ? {
            transform: 'translateY(-3px)',
            boxShadow: 4,
            borderColor: 'primary.main',
          }
          : undefined,
      }}
    >
      <CardActionArea
        disabled={!tool.available}
        onClick={onClick}
        sx={{
          height: '100%',
          '& .MuiCardActionArea-focusHighlight': {
            backgroundColor: 'transparent',
          },
        }}
      >
        <CardContent
          sx={{
            p: 2.5,
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              color: 'primary.main',
              mb: 2.5,
            }}
          >
            <Icon size={24} />
          </Box>

          <Box sx={{ flex: 1 }}>
            <Typography
              variant="h6"
              fontWeight={750}
              sx={{ mb: 0.75 }}
            >
              {tool.title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                lineHeight: 1.55,
                maxWidth: 240,
              }}
            >
              {tool.description}
            </Typography>
          </Box>

          <Box
            sx={{
              mt: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Chip
              size="small"
              label={tool.status}
              variant={tool.available ? 'outlined' : 'filled'}
              color={tool.available ? 'success' : 'default'}
              sx={{
                fontWeight: 650,
              }}
            />

            {tool.available && (
              <ChevronRight size={18} />
            )}
          </Box>
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export function MarketingHubPage() {
  const queryClient = useQueryClient()

  const [view, setView] =
    useState<MarketingView>('overview')

  const [toast, setToast] = useState<{
    message: string
    severity: 'success' | 'error' | 'info'
  } | null>(null)

  // ============================================================
  // DATA
  // ============================================================

  const dashboardQuery = useQuery({
    queryKey: ['marketing', 'dashboard'],
    queryFn: marketingService.getDashboard,
  })

  const reviewsQuery = useQuery({
    queryKey: ['marketing', 'reviews'],
    queryFn: () =>
      marketingService.listReviews({
        page: 1,
        limit: 50,
      }),
    enabled:
      view === 'google' || view === 'overview',
  })

  const contentQuery = useQuery({
    queryKey: ['marketing', 'content'],
    queryFn: marketingService.listContent,
    enabled: view === 'google',
  })

  const analyticsQuery = useQuery({
    queryKey: [
      'marketing',
      'analytics',
      'reviews',
    ],
    queryFn: marketingService.getReviewAnalytics,
    enabled: view === 'analytics',
  })

  const hub = dashboardQuery.data

  // ============================================================
  // GOOGLE
  // ============================================================

  const connectMutation = useMutation({
    mutationFn: marketingService.getGoogleLoginUrl,

    onSuccess: (url) => {
      window.location.href = url
    },

    onError: (error) => {
      setToast({
        message: getErrorMessage(error),
        severity: 'error',
      })
    },
  })

  const disconnectMutation = useMutation({
    mutationFn: marketingService.disconnectGoogle,

    onSuccess: async () => {
      setToast({
        message:
          'Google Business disconnected.',
        severity: 'info',
      })

      await queryClient.invalidateQueries({
        queryKey: ['marketing'],
      })
    },

    onError: (error) => {
      setToast({
        message: getErrorMessage(error),
        severity: 'error',
      })
    },
  })

  const syncMutation = useMutation({
    mutationFn: marketingService.syncReviews,

    onSuccess: async (result) => {
      const upserted =
        (result as { upserted?: number })
          ?.upserted ?? 0

      setToast({
        message:
          upserted > 0
            ? `Synced ${upserted} review${upserted === 1 ? '' : 's'
            } from Google.`
            : 'Sync complete. No new reviews found yet.',
        severity: 'success',
      })

      await queryClient.invalidateQueries({
        queryKey: ['marketing'],
      })
    },

    onError: (error) => {
      setToast({
        message: getErrorMessage(error),
        severity: 'error',
      })
    },
  })

  const settingsMutation = useMutation({
    mutationFn: marketingService.updateSettings,

    onSuccess: async () => {
      setToast({
        message: 'Settings saved.',
        severity: 'success',
      })

      await queryClient.invalidateQueries({
        queryKey: ['marketing', 'dashboard'],
      })
    },

    onError: (error) => {
      setToast({
        message: getErrorMessage(error),
        severity: 'error',
      })
    },
  })

  // ============================================================
  // LOADING
  // ============================================================

  if (dashboardQuery.isLoading) {
    return <MarketingPageSkeleton />
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (dashboardQuery.isError || !hub) {
    return (
      <Box>
        <Typography
          variant="h4"
          fontWeight={800}
          sx={{ mb: 1 }}
        >
          Marketing
        </Typography>

        <Alert
          severity="error"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={() =>
                dashboardQuery.refetch()
              }
            >
              Retry
            </Button>
          }
        >
          {getErrorMessage(
            dashboardQuery.error,
          ) ||
            'Could not load Marketing.'}
        </Alert>
      </Box>
    )
  }

  // ============================================================
  // OVERVIEW
  // ============================================================

  const renderOverview = () => {

    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            sx={{ mb: 1 }}
          >
            Marketing
          </Typography>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ maxWidth: 680 }}
          >
            Manage your customer outreach, campaigns,
            conversations and marketing channels from
            one place.
          </Typography>
        </Box>

        {/* ================================================== */}
        {/* OVERVIEW SUMMARY */}
        {/* ================================================== */}

        <Box sx={{ mb: 5 }}>
          <Typography
            variant="h6"
            fontWeight={750}
            sx={{ mb: 2 }}
          >
            Overview
          </Typography>

          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h6"
              fontWeight={750}
              sx={{ mb: 2 }}
            >
              Overview
            </Typography>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: 'repeat(2, minmax(0, 1fr))',
                  md: 'repeat(4, minmax(0, 1fr))',
                },
                gap: 2,
              }}
            >
              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Connected Platforms
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ mt: 1 }}
                  >
                    {hub.summary.connectedPlatforms}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 1 }}
                    >
                      / {hub.summary.totalPlatforms}
                    </Typography>
                  </Typography>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Google Reviews
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ mt: 1 }}
                  >
                    {hub.summary.googleReviews}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    {hub.summary.googleReviewsTrend}
                  </Typography>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Scheduled Campaigns
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ mt: 1 }}
                  >
                    {hub.summary.scheduledCampaigns}
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Upcoming campaigns
                  </Typography>
                </CardContent>
              </Card>

              <Card
                elevation={0}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 3,
                }}
              >
                <CardContent>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    Marketing Score
                  </Typography>

                  <Typography
                    variant="h4"
                    fontWeight={800}
                    sx={{ mt: 1 }}
                  >
                    {hub.summary.marketingScore}
                    <Typography
                      component="span"
                      variant="body2"
                      color="text.secondary"
                      sx={{ ml: 0.5 }}
                    >
                      / 100
                    </Typography>
                  </Typography>

                  <Typography
                    variant="caption"
                    color="text.secondary"
                  >
                    Avg. rating {hub.summary.averageRating}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          </Box>
        </Box>

        {/* ================================================== */}
        {/* TOOLS */}
        {/* ================================================== */}

        <Box>
          <Typography
            variant="h6"
            fontWeight={750}
            sx={{ mb: 2 }}
          >
            Marketing Tools
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mb: 3 }}
          >
            Open a marketing channel to manage its
            campaigns, conversations and settings.
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
                lg: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {MARKETING_TOOLS.map((tool) => (
              <MarketingToolCard
                key={tool.id}
                tool={tool}
                onClick={() =>
                  setView(tool.id)
                }
              />
            ))}
          </Box>
        </Box>
      </Box>
    )
  }

  // ============================================================
  // TOOL HEADER
  // ============================================================

  const renderToolHeader = (
    title: string,
    description: string,
    icon: typeof MessageCircle,
  ) => {
    const Icon = icon

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          justifyContent: 'space-between',
          gap: 2,
          mb: 3,
          flexDirection: {
            xs: 'column',
            sm: 'row',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <IconButton
            onClick={() =>
              setView('overview')
            }
            sx={{
              border: '1px solid',
              borderColor: 'divider',
            }}
          >
            <ArrowLeft size={20} />
          </IconButton>

          <Box
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: 'action.hover',
              color: 'primary.main',
            }}
          >
            <Icon size={24} />
          </Box>

          <Box>
            <Typography
              variant="h5"
              fontWeight={800}
            >
              {title}
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
            >
              {description}
            </Typography>
          </Box>
        </Box>
      </Box>
    )
  }

  // ============================================================
  // WHATSAPP
  // ============================================================

  const renderWhatsApp = () => (
    <Box>
      {renderToolHeader(
        'WhatsApp',
        'Connect WhatsApp, message leads, and manage the inbox.',
        MessageCircle,
      )}

      <WhatsAppPage />
    </Box>
  )

  // ============================================================
  // GOOGLE
  // ============================================================

  const renderGoogle = () => (
    <Box>
      {renderToolHeader(
        'Google Business',
        'Manage reviews, posts and your Google Business presence.',
        Globe2,
      )}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          mb: 2,
        }}
      >
        {hub.googleBusiness.connected && (
          <Button
            size="small"
            startIcon={
              syncMutation.isPending ? (
                <CircularProgress
                  size={14}
                />
              ) : (
                <RefreshCw size={14} />
              )
            }
            onClick={() =>
              syncMutation.mutate()
            }
            disabled={
              syncMutation.isPending
            }
          >
            {syncMutation.isPending
              ? 'Syncing reviews…'
              : 'Sync Google reviews'}
          </Button>
        )}
      </Box>

      <GoogleBusinessTab
        profile={hub.googleBusiness}
        reviewStats={hub.reviewStats}
        reviews={
          reviewsQuery.data?.data ?? []
        }
        contentQueue={
          contentQuery.data ?? []
        }
        postsSummary={hub.postsSummary}
        posts={(contentQuery.data ?? []).filter(
          (item) =>
            item.contentType === 'post' ||
            item.type === 'post',
        )}
        connecting={connectMutation.isPending}
        onConnect={() =>
          connectMutation.mutate()
        }
        onRefresh={() =>
          queryClient.invalidateQueries({
            queryKey: ['marketing'],
          })
        }
        onNotify={(message, severity = 'success') =>
          setToast({
            message,
            severity,
          })
        }
      />
    </Box>
  )

  // ============================================================
  // AI
  // ============================================================

  const renderAI = () => (
    <Box>
      {renderToolHeader(
        'AI Content',
        'Create marketing content and customer-facing copy.',
        Sparkles,
      )}

      <AIContentStudio
        tone={
          hub.settings.defaultAiTone ||
          'professional'
        }
        onNotify={(
          message,
          severity = 'success',
        ) =>
          setToast({
            message,
            severity,
          })
        }
      />
    </Box>
  )

  // ============================================================
  // ANALYTICS
  // ============================================================

  const renderAnalytics = () => (
    <Box>
      {renderToolHeader(
        'Analytics',
        'Understand your overall marketing performance.',
        BarChart3,
      )}

      <AnalyticsDashboard
        summary={hub.summary}
        analytics={analyticsQuery.data}
        loading={analyticsQuery.isLoading}
      />
    </Box>
  )

  // ============================================================
  // SETTINGS
  // ============================================================

  const renderSettings = () => (
    <Box>
      {renderToolHeader(
        'Marketing Settings',
        'Configure your marketing preferences and integrations.',
        Settings2,
      )}

      <MarketingSettings
        settings={hub.settings}
        saving={settingsMutation.isPending}
        disconnecting={
          disconnectMutation.isPending
        }
        onSave={(next) =>
          settingsMutation.mutate({
            enableAiReply:
              next.enableAiReplies,
            reviewApprovalRequired:
              next.reviewApprovalRequired,
            emailNotification:
              next.emailNotifications,
            notificationEmail:
              next.notificationEmail ?? null,
            autoSyncReviews:
              next.autoSyncReviews,
            autoFetchInterval:
              next.autoFetchInterval,
            defaultAiTone:
              next.defaultAiTone,
            theme: next.theme,
          })
        }
        onConnectGoogle={() =>
          connectMutation.mutate()
        }
        onDisconnectGoogle={() =>
          disconnectMutation.mutate()
        }
      />
    </Box>
  )

  // ============================================================
  // COMING SOON
  // ============================================================

  const renderComingSoon = (
    title: string,
    description: string,
    icon: typeof MessageCircle,
  ) => {
    const Icon = icon

    return (
      <Box>
        {renderToolHeader(
          title,
          description,
          icon,
        )}

        <Card
          elevation={0}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 3,
          }}
        >
          <CardContent
            sx={{
              py: 10,
              textAlign: 'center',
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                mx: 'auto',
                mb: 2,
                borderRadius: 3,
                bgcolor: 'action.hover',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'primary.main',
              }}
            >
              <Icon size={30} />
            </Box>

            <Typography
              variant="h6"
              fontWeight={750}
              sx={{ mb: 1 }}
            >
              {title} is coming soon
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                maxWidth: 500,
                mx: 'auto',
              }}
            >
              We're preparing this marketing tool
              for your CRM. You will be able to
              manage it from this workspace.
            </Typography>

            <Button
              variant="outlined"
              sx={{ mt: 3 }}
              onClick={() =>
                setView('overview')
              }
            >
              Back to Marketing
            </Button>
          </CardContent>
        </Card>
      </Box>
    )
  }

  // ============================================================
  // CURRENT VIEW
  // ============================================================

  const renderCurrentView = () => {
    switch (view) {
      case 'overview':
        return renderOverview()

      case 'whatsapp':
        return renderWhatsApp()

      case 'google':
        return renderGoogle()

      case 'ai':
        return renderAI()

      case 'analytics':
        return renderAnalytics()

      case 'settings':
        return renderSettings()

      case 'email':
        return renderComingSoon(
          'Email',
          'Manage email campaigns and customer outreach.',
          Mail,
        )

      case 'sms':
        return renderComingSoon(
          'SMS',
          'Manage SMS campaigns and notifications.',
          Smartphone,
        )

      case 'calls':
        return renderComingSoon(
          'Calls',
          'Manage outbound calls and follow-ups.',
          Phone,
        )

      case 'automation':
        return renderComingSoon(
          'Automation',
          'Automate your marketing workflows.',
          Zap,
        )

      case 'website':
        return renderComingSoon(
          'Website',
          'Manage website lead capture and marketing.',
          Globe2,
        )

      default:
        return renderOverview()
    }
  }

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <Box>
      <motion.div
        initial={{
          opacity: 0,
          y: 8,
        }}
        animate={{
          opacity: 1,
          y: 0,
        }}
        transition={{
          duration: 0.25,
        }}
      >
        {renderCurrentView()}
      </motion.div>

      <Snackbar
        open={Boolean(toast)}
        autoHideDuration={4000}
        onClose={() => setToast(null)}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
      >
        {toast ? (
          <Alert
            severity={toast.severity}
            onClose={() =>
              setToast(null)
            }
            variant="filled"
            sx={{
              width: '100%',
            }}
          >
            {toast.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  )
}
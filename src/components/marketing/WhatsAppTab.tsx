import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { MoreHorizontal, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { whatsappService } from '@/api/services/whatsapp.service'
import { EmptyState } from '@/components/common/EmptyState'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'
import { WhatsAppCampaignDrawer } from '@/components/whatsapp/WhatsAppCampaignDrawer'

const statusColor: Record<
  string,
  'default' | 'info' | 'warning' | 'success' | 'error'
> = {
  draft: 'default',
  queued: 'info',
  running: 'warning',
  completed: 'success',
  cancelled: 'error',
  failed: 'error',
}

const statusLabels: Record<string, string> = {
  draft: 'Draft',
  queued: 'Queued',
  running: 'Running',
  completed: 'Completed',
  cancelled: 'Cancelled',
  failed: 'Failed',
}

interface WhatsAppTabProps {
  campaigns?: any[]
  loadingCampaigns?: boolean
  onCampaignCreated?: () => void
}

export function WhatsAppTab({
  campaigns = [],
  loadingCampaigns,
  onCampaignCreated,
}: WhatsAppTabProps) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const queryClient = useQueryClient()

  // Check WhatsApp connection status.
  // The actual connection/settings UI will live in
  // the new WhatsApp Settings page.
  const { data: settings } = useQuery({
    queryKey: ['whatsapp-settings'],
    queryFn: () => whatsappService.getSettings(),
  })

  if (!settings?.isConnected) {
    return (
      <MarketingSection title="WhatsApp Campaigns">
        <MarketingCard hover={false}>
          <Box
            sx={{
              py: 6,
              textAlign: 'center',
            }}
          >
            <Typography
              variant="h6"
              fontWeight={700}
              gutterBottom
            >
              WhatsApp is not connected
            </Typography>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 480, mx: 'auto' }}
            >
              Connect your WhatsApp Business account from
              WhatsApp Settings before creating campaigns.
            </Typography>
          </Box>
        </MarketingCard>
      </MarketingSection>
    )
  }

  return (
    <Box>
      <MarketingSection
        title="WhatsApp Campaigns"
        action={
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            size="small"
            onClick={() => setDrawerOpen(true)}
          >
            New Campaign
          </Button>
        }
      >
        <MarketingCard hover={false} padding={0}>
          {!loadingCampaigns && campaigns.length === 0 ? (
            <EmptyState
              icon={CampaignOutlinedIcon}
              title="No campaigns yet"
              description="Create your first WhatsApp campaign to send bulk messages to your contacts using approved Meta templates."
              action={
                <Button
                  variant="contained"
                  startIcon={<Plus size={16} />}
                  onClick={() => setDrawerOpen(true)}
                >
                  Create Campaign
                </Button>
              }
            />
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Campaign</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Progress</TableCell>
                    <TableCell>Stats</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell align="right">
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {campaigns.map((campaign) => {
                    const progress =
                      campaign.stats?.total > 0
                        ? ((campaign.stats.sent +
                            campaign.stats.failed) /
                            campaign.stats.total) *
                          100
                        : 0

                    return (
                      <TableRow
                        key={String(campaign.id)}
                        hover
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            fontWeight={650}
                          >
                            {campaign.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              statusLabels[campaign.status] ||
                              campaign.status
                            }
                            color={
                              statusColor[campaign.status] ||
                              'default'
                            }
                            variant="outlined"
                            sx={{
                              textTransform: 'capitalize',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>

                        <TableCell sx={{ minWidth: 120 }}>
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            <Box
                              sx={{
                                flex: 1,
                                bgcolor: 'grey.200',
                                borderRadius: 1,
                                height: 6,
                              }}
                            >
                              <Box
                                sx={{
                                  width: `${Math.min(
                                    100,
                                    Math.round(progress),
                                  )}%`,
                                  bgcolor: 'primary.main',
                                  borderRadius: 1,
                                  height: 6,
                                }}
                              />
                            </Box>

                            <Typography variant="caption">
                              {Math.round(progress)}%
                            </Typography>
                          </Box>

                          <Typography
                            variant="caption"
                            color="text.secondary"
                          >
                            {campaign.stats?.sent || 0} of{' '}
                            {campaign.stats?.total || 0}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Box
                            sx={{
                              display: 'flex',
                              gap: 0.5,
                              flexWrap: 'wrap',
                            }}
                          >
                            <Chip
                              size="small"
                              label={`${campaign.stats?.sent || 0} sent`}
                              color="info"
                            />

                            <Chip
                              size="small"
                              label={`${campaign.stats?.delivered || 0} delivered`}
                              color="success"
                            />

                            <Chip
                              size="small"
                              label={`${campaign.stats?.failed || 0} failed`}
                              color="error"
                            />
                          </Box>
                        </TableCell>

                        <TableCell>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                          >
                            {campaign.scheduledAt
                              ? format(
                                  new Date(
                                    campaign.scheduledAt,
                                  ),
                                  'dd MMM yyyy, HH:mm',
                                )
                              : 'Immediate'}
                          </Typography>
                        </TableCell>

                        <TableCell align="right">
                          <IconButton
                            size="small"
                            aria-label="Campaign actions"
                          >
                            <MoreHorizontal size={16} />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </MarketingCard>
      </MarketingSection>

      <WhatsAppCampaignDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onSuccess={() => {
          setDrawerOpen(false)

          queryClient.invalidateQueries({
            queryKey: ['whatsapp-campaigns'],
          })

          onCampaignCreated?.()
        }}
      />
    </Box>
  )
}
import { useState } from 'react'
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material'
import { MoreHorizontal, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useMutation } from '@tanstack/react-query'
import type { CampaignStatus, WhatsAppCampaign } from '@/types/marketing'
import { MarketingCard, MarketingSection } from './MarketingCard'
import { WhatsAppConfiguration } from './WhatsAppConfiguration'
import { marketingService } from '@/api/services'
import { getErrorMessage } from '@/api/client'
import { EmptyState } from '@/components/common/EmptyState'
import CampaignOutlinedIcon from '@mui/icons-material/CampaignOutlined'

const statusColor: Record<CampaignStatus, 'default' | 'info' | 'warning' | 'success' | 'error'> = {
  draft: 'default',
  scheduled: 'info',
  sending: 'warning',
  sent: 'success',
  paused: 'error',
  cancelled: 'default',
}

interface WhatsAppTabProps {
  campaigns: WhatsAppCampaign[]
  loadingCampaigns?: boolean
  onCampaignCreated?: () => void
}

export function WhatsAppTab({ campaigns, loadingCampaigns, onCampaignCreated }: WhatsAppTabProps) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    campaignName: '',
    audience: '',
    campaignType: 'broadcast',
  })
  const [error, setError] = useState('')

  const createMutation = useMutation({
    mutationFn: () =>
      marketingService.createCampaign({
        campaignName: form.campaignName,
        audience: form.audience,
        campaignType: form.campaignType,
        provider: 'whatsapp',
      }),
    onSuccess: () => {
      setOpen(false)
      setForm({ campaignName: '', audience: '', campaignType: 'broadcast' })
      onCampaignCreated?.()
    },
    onError: (err) => setError(getErrorMessage(err)),
  })

  return (
    <Box>
      <WhatsAppConfiguration />

      <MarketingSection
        title="Campaigns"
        action={
          <Button variant="contained" startIcon={<Plus size={16} />} size="small" onClick={() => setOpen(true)}>
            Create Campaign
          </Button>
        }
      >
        <MarketingCard hover={false} padding={0}>
          {!loadingCampaigns && campaigns.length === 0 ? (
            <EmptyState
              icon={CampaignOutlinedIcon}
              title="No campaigns yet"
              description="Create your first WhatsApp campaign when you are ready to message a group of contacts. Start with a clear name and audience so your team knows what it is for."
              action={
                <Button variant="contained" startIcon={<Plus size={16} />} onClick={() => setOpen(true)}>
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
                    <TableCell>Audience</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Scheduled</TableCell>
                    <TableCell align="right">Sent</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {campaigns.map((campaign) => (
                    <TableRow key={String(campaign.id)} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={650}>
                          {campaign.campaignName}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {campaign.audience}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={campaign.status}
                          color={statusColor[campaign.status]}
                          variant="outlined"
                          sx={{ textTransform: 'capitalize', fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {campaign.scheduleAt
                            ? format(new Date(campaign.scheduleAt), 'dd MMM yyyy, HH:mm')
                            : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight={600}>
                          {(campaign.statistics?.sent ?? 0).toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <IconButton size="small" aria-label="Campaign actions">
                          <MoreHorizontal size={16} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>
          )}
        </MarketingCard>
      </MarketingSection>

      <Dialog open={open} onClose={() => setOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Create WhatsApp campaign</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" mb={2}>
            Give the campaign a name your team will recognize, and describe who should receive it.
          </Typography>
          {error && (
            <Typography color="error" variant="body2" mb={1}>
              {error}
            </Typography>
          )}
          <Box display="flex" flexDirection="column" gap={2} mt={1}>
            <TextField
              label="Campaign name"
              value={form.campaignName}
              onChange={(e) => setForm((prev) => ({ ...prev, campaignName: e.target.value }))}
              fullWidth
              required
              placeholder="e.g. Weekend open house invite"
            />
            <TextField
              label="Audience"
              value={form.audience}
              onChange={(e) => setForm((prev) => ({ ...prev, audience: e.target.value }))}
              fullWidth
              required
              placeholder="e.g. Warm leads in Gurgaon"
              helperText="This is for your team — it does not send messages yet."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            disabled={!form.campaignName.trim() || !form.audience.trim() || createMutation.isPending}
            onClick={() => {
              setError('')
              createMutation.mutate()
            }}
          >
            {createMutation.isPending ? 'Creating…' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

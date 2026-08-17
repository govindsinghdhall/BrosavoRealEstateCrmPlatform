import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  MenuItem,
  Stack,
  TextField,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ContactPageOutlinedIcon from '@mui/icons-material/ContactPageOutlined'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import EventNoteOutlinedIcon from '@mui/icons-material/EventNoteOutlined'
import TimelineOutlinedIcon from '@mui/icons-material/TimelineOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { IdChip } from '@/components/common/IdChip'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { getErrorMessage } from '@/api/client'
import { leadsService } from '@/api/services'
import { invalidateListQueries } from '@/api/utils/query'
import { LeadPropertyPanel } from '@/components/leads/LeadPropertyPanel'
import { WhatsAppThreadDrawer } from '@/components/whatsapp/WhatsAppThreadDrawer'
import { LEAD_STATUSES } from '@/utils/constants'
import { capitalize, formatContactId, formatContactRecordId, formatCurrency, formatDateTime, formatLeadId } from '@/utils/formatters'
import type { LeadStatus } from '@/types'

const TIMELINE_ACTION_LABELS: Record<string, string> = {
  LEAD_CREATED: 'Lead created',
  CREATED: 'Lead created',
  STATUS_CHANGED: 'Status updated',
  ASSIGNED: 'Lead assigned',
  NOTE_ADDED: 'Note added',
  PROPERTY_LINKED: 'Property linked',
  PROPERTY_UNLINKED: 'Property unlinked',
  PROPERTY_LINK_UPDATED: 'Property interest updated',
  PROPERTY_INTEREST_UPDATED: 'Primary property updated',
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <Box display="flex" alignItems="flex-start" gap={1.5}>
      <Box sx={{ color: 'text.secondary', mt: 0.25 }}>{icon}</Box>
      <Box>
        <Typography variant="caption" color="text.secondary" display="block">
          {label}
        </Typography>
        <Typography variant="body2" fontWeight={600}>
          {value || '—'}
        </Typography>
      </Box>
    </Box>
  )
}

export function LeadDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const [noteText, setNoteText] = useState('')
  const [whatsappOpen, setWhatsappOpen] = useState(false)

  const { data: lead, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['lead', id],
    queryFn: () => leadsService.getById(id!),
    enabled: !!id,
    refetchInterval: 15_000,
  })

  const statusMutation = useMutation({
    mutationFn: (status: LeadStatus) => leadsService.update(id!, { status }),
    onSuccess: async () => {
      await invalidateListQueries(queryClient, ['lead', id])
      await invalidateListQueries(queryClient, ['leads'])
    },
  })

  const noteMutation = useMutation({
    mutationFn: (content: string) => leadsService.addNote(id!, content),
    onSuccess: async () => {
      setNoteText('')
      await invalidateListQueries(queryClient, ['lead', id])
      await invalidateListQueries(queryClient, ['leads'])
    },
  })

  if (isLoading) return <LoadingSpinner fullScreen />
  if (isError || !lead) {
    return (
      <Box>
        <PageHeader
          title="Lead not found"
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Leads', href: '/leads' },
            { label: 'Detail' },
          ]}
        />
        <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
          {getErrorMessage(error)}
        </Alert>
      </Box>
    )
  }

  const fullName = `${lead.firstName} ${lead.lastName}`

  return (
    <Box>
      <PageHeader
        title={fullName}
        subtitle={`Lead since ${formatDateTime(lead.createdAt)}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Leads', href: '/leads' },
          { label: fullName },
        ]}
        action={
          <Box display="flex" gap={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<WhatsAppIcon />}
              onClick={() => setWhatsappOpen(true)}
              sx={{ bgcolor: '#25D366', '&:hover': { bgcolor: '#20BD5A' } }}
            >
              WhatsApp
            </Button>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/leads')}>
              Back to Leads
            </Button>
          </Box>
        }
      />

      <Box
        sx={{
          mb: 3,
          p: 2.5,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: isDark ? alpha('#1565C0', 0.08) : '#F0F7FF',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IdChip label={formatLeadId(lead.id)} variant="lead" />
        <IdChip label={formatContactId(lead.phone)} variant="contact" />
        <StatusBadge status={lead.status} />
        {lead.status === 'NEW' && (
          <Chip label="New lead" size="small" color="info" sx={{ fontWeight: 600 }} />
        )}
        <Box flex={1} />
        <TextField
          select
          size="small"
          label="Update status"
          value={lead.status}
          onChange={(e) => statusMutation.mutate(e.target.value as LeadStatus)}
          disabled={statusMutation.isPending}
          sx={{ minWidth: 200 }}
        >
          {LEAD_STATUSES.map((s) => (
            <MenuItem key={s} value={s}>
              {capitalize(s)}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard
            title="Contact Details"
            subtitle="Primary contact information"
            action={
              lead.contactId ? (
                <Button
                  size="small"
                  variant="outlined"
                  startIcon={<ContactPageOutlinedIcon />}
                  onClick={() => navigate(`/contacts/${lead.contactId}`)}
                >
                  View Contact
                </Button>
              ) : undefined
            }
          >
            <Stack spacing={2.5}>
              {lead.contactId && (
                <Box>
                  <Typography variant="caption" color="text.secondary">
                    Contact Record
                  </Typography>
                  <Box mt={0.5}>
                    <IdChip
                      label={formatContactRecordId(lead.contactId)}
                      variant="contact"
                      onClick={() => navigate(`/contacts/${lead.contactId}`)}
                    />
                  </Box>
                </Box>
              )}
              <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email" value={lead.email} />
              <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Phone" value={lead.phone} />
              {lead.alternatePhone && (
                <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Alt. Phone" value={lead.alternatePhone} />
              )}
              <InfoRow
                icon={<LocationOnOutlinedIcon fontSize="small" />}
                label="Location"
                value={[lead.location, lead.state, lead.pincode].filter(Boolean).join(', ')}
              />
              <InfoRow icon={<AccountBalanceWalletOutlinedIcon fontSize="small" />} label="Budget" value={formatCurrency(lead.budget)} />
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard title="Lead Overview" subtitle="Source, assignment, and inquiry details">
            <Grid container spacing={2.5}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Source</Typography>
                <Typography variant="body2" fontWeight={600}>{lead.source || '—'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Assigned To</Typography>
                <Typography variant="body2" fontWeight={600}>{lead.assignedToName || 'Unassigned'}</Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Property Interest</Typography>
                <Typography variant="body2" fontWeight={600}>
                  {lead.linkedProperties?.find((item) => item.isPrimary)?.property?.title
                    || lead.propertyTitle
                    || lead.propertyType
                    || '—'}
                </Typography>
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <Typography variant="caption" color="text.secondary">Created By</Typography>
                <Typography variant="body2" fontWeight={600}>{lead.createdByName || '—'}</Typography>
              </Grid>
              {lead.notes && (
                <Grid size={{ xs: 12 }}>
                  <Typography variant="caption" color="text.secondary">Inquiry / Requirements</Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      mt: 0.5,
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: isDark ? alpha('#fff', 0.04) : '#F8FAFC',
                      border: '1px solid',
                      borderColor: 'divider',
                      lineHeight: 1.6,
                    }}
                  >
                    {lead.notes}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <LeadPropertyPanel leadId={lead.id} primaryPropertyTitle={lead.propertyTitle} />
        </Grid>

        <Grid size={{ xs: 12, md: 5 }}>
          <SectionCard
            title="Activity Timeline"
            subtitle={`${lead.timeline.length} events`}
          >
            {lead.timeline.length === 0 ? (
              <Typography variant="body2" color="text.secondary">No activity yet.</Typography>
            ) : (
              <Stack spacing={0} divider={<Divider flexItem />}>
                {lead.timeline.map((entry, index) => (
                  <Box key={entry.id} sx={{ py: 1.75, display: 'flex', gap: 2 }}>
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        bgcolor: isDark ? alpha('#1565C0', 0.2) : '#E3F2FD',
                        color: 'primary.main',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        mt: 0.25,
                      }}
                    >
                      <TimelineOutlinedIcon sx={{ fontSize: 16 }} />
                    </Box>
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={700}>
                        {TIMELINE_ACTION_LABELS[entry.action] ?? capitalize(entry.action)}
                      </Typography>
                      {entry.description && (
                        <Typography variant="body2" color="text.secondary" mt={0.25}>
                          {entry.description}
                        </Typography>
                      )}
                      <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                        {formatDateTime(entry.createdAt)}
                        {entry.performedByName ? ` · ${entry.performedByName}` : ''}
                      </Typography>
                    </Box>
                    {index === 0 && lead.status === 'NEW' && (
                      <Chip label="Latest" size="small" color="primary" variant="outlined" />
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 7 }}>
          <SectionCard
            title="Notes"
            subtitle={`${lead.notesList.length} notes`}
            action={
              lead.counts && (
                <Stack direction="row" spacing={1}>
                  <Chip size="small" label={`${lead.counts.siteVisits} visits`} variant="outlined" />
                  <Chip size="small" label={`${lead.counts.bookings} bookings`} variant="outlined" />
                </Stack>
              )
            }
          >
            <Box display="flex" gap={1} mb={2.5}>
              <TextField
                fullWidth
                size="small"
                placeholder="Add a note about this lead..."
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                multiline
                minRows={2}
              />
              <Button
                variant="contained"
                disabled={!noteText.trim() || noteMutation.isPending}
                onClick={() => noteMutation.mutate(noteText.trim())}
                sx={{ alignSelf: 'flex-end', minWidth: 88 }}
              >
                Add
              </Button>
            </Box>

            {lead.notesList.length === 0 ? (
              <Box textAlign="center" py={3}>
                <EventNoteOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled', mb: 1 }} />
                <Typography variant="body2" color="text.secondary">No notes yet. Add the first follow-up note above.</Typography>
              </Box>
            ) : (
              <Stack spacing={1.5}>
                {lead.notesList.map((note) => (
                  <Box
                    key={note.id}
                    sx={{
                      p: 2,
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: isDark ? alpha('#fff', 0.02) : '#FAFBFC',
                    }}
                  >
                    <Typography variant="body2" lineHeight={1.6}>{note.content}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block" mt={1}>
                      {formatDateTime(note.createdAt)}
                      {note.createdByName ? ` · ${note.createdByName}` : ''}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            )}
          </SectionCard>
        </Grid>
      </Grid>

      <WhatsAppThreadDrawer
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        leadId={lead.id}
        contactId={lead.contactId}
        title={`WhatsApp · ${fullName}`}
        phone={lead.phone}
      />
    </Box>
  )
}

import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  alpha,
  useTheme,
} from '@mui/material'
import Grid from '@mui/material/Grid2'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EmailOutlinedIcon from '@mui/icons-material/EmailOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import LocationOnOutlinedIcon from '@mui/icons-material/LocationOnOutlined'
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined'
import WhatsAppIcon from '@mui/icons-material/WhatsApp'
import { useQuery } from '@tanstack/react-query'
import { AppTable, type AppTableColumn } from '@/components/common/AppTable'
import tableStyles from './ContactLeadsTable.module.css'
import { IdChip } from '@/components/common/IdChip'
import { LoadingSpinner } from '@/components/common/LoadingSpinner'
import { PageHeader } from '@/components/common/PageHeader'
import { SectionCard } from '@/components/common/SectionCard'
import { StatusBadge } from '@/components/common/StatusBadge'
import { getErrorMessage } from '@/api/client'
import { contactsService } from '@/api/services'
import {
  formatContactId,
  formatContactRecordId,
  formatCurrency,
  formatDateTime,
  formatLeadId,
} from '@/utils/formatters'
import type { ContactLeadSummary } from '@/types'
import { WhatsAppThreadDrawer } from '@/components/whatsapp/WhatsAppThreadDrawer'

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

export function ContactDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const theme = useTheme()
  const isDark = theme.palette.mode === 'dark'
  const contactId = Number(id)
  const [whatsappOpen, setWhatsappOpen] = useState(false)

  const { data: contact, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['contact', id],
    queryFn: () => contactsService.getById(contactId),
    enabled: Number.isFinite(contactId) && contactId > 0,
  })

  const leadColumns = useMemo<AppTableColumn<ContactLeadSummary>[]>(
    () => [
      {
        id: 'leadId',
        label: 'Lead ID',
        colClassName: tableStyles.colLeadId,
        render: (lead) => (
          <IdChip
            label={formatLeadId(lead.id)}
            variant="lead"
            onClick={() => navigate(`/leads/${lead.id}`)}
          />
        ),
      },
      {
        id: 'status',
        label: 'Status',
        colClassName: tableStyles.colStatus,
        render: (lead) => <StatusBadge status={lead.status} />,
      },
      {
        id: 'property',
        label: 'Property Interest',
        colClassName: tableStyles.colProperty,
        hideOnMobile: true,
        render: (lead) => lead.propertyTitle || lead.propertyType || '—',
      },
      {
        id: 'source',
        label: 'Source',
        colClassName: tableStyles.colSource,
        hideOnTablet: true,
        hideOnMobile: true,
        render: (lead) => lead.source || '—',
      },
      {
        id: 'agent',
        label: 'Assigned Agent',
        colClassName: tableStyles.colAssigned,
        hideOnTablet: true,
        hideOnMobile: true,
        render: (lead) => lead.assignedToName || 'Unassigned',
      },
      {
        id: 'budget',
        label: 'Budget',
        colClassName: tableStyles.colBudget,
        hideOnMobile: true,
        cellClassName: tableStyles.cellStrong,
        render: (lead) => (lead.budget ? formatCurrency(lead.budget) : '—'),
      },
      {
        id: 'created',
        label: 'Inquiry Date',
        colClassName: tableStyles.colCreated,
        hideOnTablet: true,
        hideOnMobile: true,
        cellClassName: tableStyles.cellMuted,
        render: (lead) => formatDateTime(lead.createdAt),
      },
    ],
    [navigate],
  )

  if (isLoading) return <LoadingSpinner fullScreen />

  if (isError || !contact) {
    return (
      <Box>
        <PageHeader
          title="Contact not found"
          breadcrumbs={[
            { label: 'Home', href: '/dashboard' },
            { label: 'Contacts', href: '/contacts' },
            { label: 'Detail' },
          ]}
        />
        <Alert severity="error" action={<Button onClick={() => refetch()}>Retry</Button>}>
          {getErrorMessage(error)}
        </Alert>
      </Box>
    )
  }

  const fullName = `${contact.firstName} ${contact.lastName}`

  return (
    <Box>
      <PageHeader
        title={fullName}
        subtitle={`Contact since ${formatDateTime(contact.createdAt)}`}
        breadcrumbs={[
          { label: 'Home', href: '/dashboard' },
          { label: 'Contacts', href: '/contacts' },
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
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => navigate('/contacts')}>
              Back to Contacts
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
          bgcolor: isDark ? alpha('#00897B', 0.08) : '#E0F2F1',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 2,
        }}
      >
        <IdChip label={formatContactRecordId(contact.id)} variant="contact" />
        <IdChip label={formatContactId(contact.phone)} variant="contact" />
        <Chip
          icon={<HistoryOutlinedIcon />}
          label={`${contact.leads.length} lead${contact.leads.length === 1 ? '' : 's'}`}
          color="primary"
          variant="outlined"
        />
      </Box>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 4 }}>
          <SectionCard title="Contact Details" subtitle="Primary profile information">
            <Stack spacing={2.5} divider={<Divider flexItem />}>
              <InfoRow icon={<EmailOutlinedIcon fontSize="small" />} label="Email" value={contact.email ?? ''} />
              <InfoRow icon={<PhoneOutlinedIcon fontSize="small" />} label="Phone" value={contact.phone} />
              {contact.alternatePhone && (
                <InfoRow
                  icon={<PhoneOutlinedIcon fontSize="small" />}
                  label="Alt. Phone"
                  value={contact.alternatePhone}
                />
              )}
              <InfoRow
                icon={<LocationOnOutlinedIcon fontSize="small" />}
                label="Location"
                value={[contact.address, contact.city, contact.state, contact.pincode].filter(Boolean).join(', ')}
              />
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Source
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {contact.source || '—'}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Last Updated
                </Typography>
                <Typography variant="body2" fontWeight={600}>
                  {formatDateTime(contact.updatedAt)}
                </Typography>
              </Box>
            </Stack>
          </SectionCard>
        </Grid>

        <Grid size={{ xs: 12, md: 8 }}>
          <SectionCard
            title="Lead History"
            subtitle="All inquiries from this person across properties"
          >
            <AppTable
              rows={contact.leads}
              columns={leadColumns}
              getRowId={(row) => row.id}
              tableClassName={tableStyles.table}
              showIndex={false}
              emptyMessage="No leads linked to this contact yet."
              onRowClick={(lead) => navigate(`/leads/${lead.id}`)}
            />
          </SectionCard>
        </Grid>
      </Grid>

      <WhatsAppThreadDrawer
        open={whatsappOpen}
        onClose={() => setWhatsappOpen(false)}
        contactId={contact.id}
        title={`WhatsApp · ${fullName}`}
        phone={contact.phone}
      />
    </Box>
  )
}

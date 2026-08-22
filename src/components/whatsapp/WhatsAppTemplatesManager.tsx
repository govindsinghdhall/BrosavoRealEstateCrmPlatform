import { useMemo, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import RefreshIcon from '@mui/icons-material/Refresh'
import AddIcon from '@mui/icons-material/Add'
import SyncIcon from '@mui/icons-material/Sync'
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined'
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline'
import SendOutlinedIcon from '@mui/icons-material/SendOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getErrorMessage } from '@/api/client'
import { whatsappService } from '@/api/services'
import type {
  WhatsAppMetaTemplate,
  WhatsAppTemplateCategory,
  WhatsAppTemplateComponent,
  WhatsAppTemplatePayload,
} from '@/types'

type StatusFilter =
  | 'ALL'
  | 'DRAFT'
  | 'APPROVED'
  | 'PENDING'
  | 'REJECTED'
  | 'PAUSED'

type TemplateHeaderType = 'NONE' | 'TEXT' | 'IMAGE' | 'VIDEO' | 'DOCUMENT'

interface CreateTemplateForm {
  name: string
  category: WhatsAppTemplateCategory
  language: string
  headerType: TemplateHeaderType
  headerText: string
  body: string
  footer: string
  buttons: string
}

function normalizeStatus(status?: string) {
  return status?.toUpperCase() ?? 'UNKNOWN'
}

function getStatusColor(
  status?: string,
): 'success' | 'warning' | 'error' | 'default' | 'info' {
  switch (normalizeStatus(status)) {
    case 'APPROVED':
      return 'success'
    case 'PENDING':
    case 'IN_REVIEW':
      return 'warning'
    case 'REJECTED':
      return 'error'
    case 'DRAFT':
      return 'info'
    default:
      return 'default'
  }
}

function getStatusLabel(status?: string) {
  const normalized = normalizeStatus(status)
  if (normalized === 'IN_REVIEW') return 'IN REVIEW'
  if (normalized === 'UNKNOWN') return 'UNKNOWN'
  return normalized
}

function getComponentText(
  components?: WhatsAppTemplateComponent[],
  type?: string,
) {
  return components?.find(
    (component) => component.type?.toUpperCase() === type,
  )?.text
}

function getButtons(components?: WhatsAppTemplateComponent[]) {
  return (
    components
      ?.filter((component) => component.type?.toUpperCase() === 'BUTTONS')
      .flatMap((component) => component.buttons ?? []) ?? []
  )
}

function buildTemplatePayload(form: CreateTemplateForm): WhatsAppTemplatePayload {
  const buttons = form.buttons
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3)
    .map((text) => ({ type: 'QUICK_REPLY' as const, text }))

  return {
    name: form.name.trim(),
    language: form.language.trim() || 'en',
    category: form.category,
    header:
      form.headerType === 'NONE'
        ? undefined
        : {
            format: form.headerType,
            text:
              form.headerType === 'TEXT' ? form.headerText.trim() : undefined,
          },
    body: form.body.trim(),
    footer: form.footer.trim() || undefined,
    buttons: buttons.length ? buttons : undefined,
  }
}

export function WhatsAppTemplatesManager() {
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('ALL')
  const [selectedTemplate, setSelectedTemplate] =
    useState<WhatsAppMetaTemplate | null>(null)
  const [formError, setFormError] = useState('')
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [createForm, setCreateForm] = useState<CreateTemplateForm>({
    name: '',
    category: 'UTILITY',
    language: 'en',
    headerType: 'NONE',
    headerText: '',
    body: '',
    footer: '',
    buttons: '',
  })

  const resetCreateForm = () => {
    setCreateForm({
      name: '',
      category: 'UTILITY',
      language: 'en',
      headerType: 'NONE',
      headerText: '',
      body: '',
      footer: '',
      buttons: '',
    })
    setFormError('')
  }

  const handleOpenCreateDialog = () => {
    resetCreateForm()
    setCreateDialogOpen(true)
  }

  const handleCloseCreateDialog = () => {
    if (createMutation.isPending) return
    setCreateDialogOpen(false)
    resetCreateForm()
  }

  const handleCreateTemplateFormChange = (
    field: keyof CreateTemplateForm,
    value: string,
  ) => {
    setCreateForm((current) => ({ ...current, [field]: value }))
  }

  const {
    data: templates = [],
    isLoading,
    isFetching,
    isError,
    error,
  } = useQuery({
    queryKey: ['whatsapp-templates'],
    queryFn: () => whatsappService.getTemplates({ limit: 100 }),
  })

  const syncMutation = useMutation({
    mutationFn: whatsappService.syncTemplates,
    onSuccess: async (data) => {
      queryClient.setQueryData(['whatsapp-templates'], data)
      await queryClient.invalidateQueries({
        queryKey: ['whatsapp-approved-templates'],
      })
    },
  })

  const createMutation = useMutation({
    mutationFn: (payload: WhatsAppTemplatePayload) =>
      whatsappService.createTemplate(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      setCreateDialogOpen(false)
      resetCreateForm()
    },
    onError: (err) => setFormError(getErrorMessage(err)),
  })

  const submitMutation = useMutation({
    mutationFn: (id: number) => whatsappService.submitTemplate(id),
    onSuccess: async (template) => {
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      setSelectedTemplate(template)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: number) => whatsappService.deleteTemplate(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['whatsapp-templates'] })
      setSelectedTemplate(null)
    },
  })

  const handleCreateTemplate = () => {
    setFormError('')
    if (!createForm.name.trim() || !createForm.body.trim()) {
      setFormError('Template name and body are required.')
      return
    }
    if (createForm.headerType === 'TEXT' && !createForm.headerText.trim()) {
      setFormError('Header text is required when header type is Text.')
      return
    }
    createMutation.mutate(buildTemplatePayload(createForm))
  }

  const filteredTemplates = useMemo(() => {
    const searchValue = search.trim().toLowerCase()
    return templates
      .filter((template) => {
        if (statusFilter === 'ALL') return true
        const status = normalizeStatus(template.status)
        if (statusFilter === 'PENDING') {
          return status === 'PENDING' || status === 'IN_REVIEW'
        }
        return status === statusFilter
      })
      .filter((template) => {
        if (!searchValue) return true
        return [template.name, template.category, template.language, template.status]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(searchValue))
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [templates, search, statusFilter])

  const totalCount = templates.length
  const draftCount = templates.filter(
    (template) => normalizeStatus(template.status) === 'DRAFT',
  ).length
  const approvedCount = templates.filter(
    (template) => normalizeStatus(template.status) === 'APPROVED',
  ).length
  const pendingCount = templates.filter((template) => {
    const status = normalizeStatus(template.status)
    return status === 'PENDING' || status === 'IN_REVIEW'
  }).length
  const rejectedCount = templates.filter(
    (template) => normalizeStatus(template.status) === 'REJECTED',
  ).length

  const canSubmitSelected =
    !!selectedTemplate &&
    ['DRAFT', 'REJECTED'].includes(normalizeStatus(selectedTemplate.status))
  const canDeleteSelected =
    !!selectedTemplate &&
    ['DRAFT', 'REJECTED'].includes(normalizeStatus(selectedTemplate.status))

  const handleSync = () => {
    syncMutation.mutate()
  }

  const handleRefresh = () => {
    queryClient.invalidateQueries({
      queryKey: ['whatsapp-templates'],
    })
  }

  return (
    <Box>
      {/* TOP HEADER */}

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: {
            xs: 'flex-start',
            sm: 'center',
          },
          gap: 2,
          flexWrap: 'wrap',
          mb: 3,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            fontWeight={750}
          >
            WhatsApp Templates
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
          >
            Create local drafts, submit them to Meta, and sync approval status.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{ width: { xs: '100%', sm: 'auto' } }}
        >
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleOpenCreateDialog}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            Create Template
          </Button>

          <Button
            variant="contained"
            startIcon={
              syncMutation.isPending ? (
                <CircularProgress
                  size={16}
                  color="inherit"
                />
              ) : (
                <SyncIcon />
              )
            }
            onClick={handleSync}
            disabled={syncMutation.isPending}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            {syncMutation.isPending
              ? 'Syncing...'
              : 'Sync from Meta'}
          </Button>
        </Stack>
      </Box>

      {/* SYNC ERROR */}

      {syncMutation.isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
        >
          {getErrorMessage(
            syncMutation.error,
          )}
        </Alert>
      )}

      {/* SYNC SUCCESS */}

      {syncMutation.isSuccess && (
        <Alert
          severity="success"
          sx={{ mb: 3 }}
          onClose={() =>
            syncMutation.reset()
          }
        >
          Templates synchronized successfully.
        </Alert>
      )}

      {/* LOAD ERROR */}

      {isError && (
        <Alert
          severity="error"
          sx={{ mb: 3 }}
          action={
            <Button
              color="inherit"
              size="small"
              onClick={handleRefresh}
            >
              Retry
            </Button>
          }
        >
          {getErrorMessage(error) ||
            'Unable to load WhatsApp templates.'}
        </Alert>
      )}

      {/* SUMMARY CARDS */}

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr 1fr',
            md: 'repeat(5, 1fr)',
          },
          gap: 2,
          mb: 3,
        }}
      >
        <SummaryCard label="Total Templates" value={totalCount} />
        <SummaryCard label="Draft" value={draftCount} color="info.main" />
        <SummaryCard label="Approved" value={approvedCount} color="success.main" />
        <SummaryCard label="Pending" value={pendingCount} color="warning.main" />
        <SummaryCard label="Rejected" value={rejectedCount} color="error.main" />
      </Box>

      {/* FILTERS */}

      <Card
        elevation={0}
        sx={{
          border: '1px solid',
          borderColor: 'divider',
          borderRadius: 3,
        }}
      >
        <CardContent sx={{ p: 2.5 }}>
          <Box
            sx={{
              display: 'flex',
              gap: 2,
              flexWrap: 'wrap',
              alignItems: 'center',
              mb: 2,
            }}
          >
            <TextField
              size="small"
              placeholder="Search templates..."
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              InputProps={{
                startAdornment: (
                  <SearchIcon
                    sx={{ fontSize: 20, mr: 1 }}
                  />
                ),
              }}
              sx={{
                minWidth: {
                  xs: '100%',
                  sm: 280,
                },
              }}
            />

            <FormControl
              size="small"
              sx={{
                minWidth: 170,
              }}
            >
              <InputLabel>
                Status
              </InputLabel>

              <Select
                label="Status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(
                    event.target
                      .value as StatusFilter,
                  )
                }
              >
                <MenuItem value="ALL">All Statuses</MenuItem>
                <MenuItem value="DRAFT">Draft</MenuItem>
                <MenuItem value="PENDING">Pending</MenuItem>
                <MenuItem value="APPROVED">Approved</MenuItem>
                <MenuItem value="REJECTED">Rejected</MenuItem>
                <MenuItem value="PAUSED">Paused</MenuItem>
              </Select>
            </FormControl>

            <Box sx={{ ml: 'auto' }}>
              <Tooltip title="Refresh templates">
                <span>
                  <IconButton
                    onClick={handleRefresh}
                    disabled={isFetching}
                  >
                    <RefreshIcon
                      sx={{
                        animation: isFetching
                          ? 'spin 1s linear infinite'
                          : undefined,
                        '@keyframes spin': {
                          from: {
                            transform:
                              'rotate(0deg)',
                          },
                          to: {
                            transform:
                              'rotate(360deg)',
                          },
                        },
                      }}
                    />
                  </IconButton>
                </span>
              </Tooltip>
            </Box>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* TABLE */}

          {isLoading ? (
            <Box
              sx={{
                minHeight: 240,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CircularProgress />
            </Box>
          ) : filteredTemplates.length === 0 ? (
            <Box
              sx={{
                minHeight: 240,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                px: 3,
              }}
            >
              <Typography
                variant="h6"
                fontWeight={700}
                sx={{ mb: 1 }}
              >
                No WhatsApp templates found
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mb: 2 }}
              >
                {templates.length === 0
                  ? 'No templates have been synchronized from your Meta WhatsApp Business Account yet.'
                  : 'No templates match your current search or status filter.'}
              </Typography>

              {templates.length === 0 && (
                <Button
                  variant="contained"
                  startIcon={<SyncIcon />}
                  onClick={handleSync}
                  disabled={
                    syncMutation.isPending
                  }
                >
                  Sync from Meta
                </Button>
              )}
            </Box>
          ) : (
            <TableContainer
              sx={{
                overflowX: 'auto',
              }}
            >
              <Table
                size="small"
                sx={{
                  minWidth: 850,
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <strong>Name</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Category</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Language</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Quality</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Status</strong>
                    </TableCell>

                    <TableCell>
                      <strong>Variables</strong>
                    </TableCell>

                    <TableCell align="right">
                      <strong>Actions</strong>
                    </TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {filteredTemplates.map(
                    (template) => (
                      <TableRow
                        key={
                          template.id ??
                          template.templateId ??
                          template.name
                        }
                        hover
                      >
                        <TableCell>
                          <Typography
                            fontWeight={650}
                          >
                            {template.name}
                          </Typography>
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              template.category ||
                              '—'
                            }
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          {template.language ||
                            '—'}
                        </TableCell>

                        <TableCell>
                          {template.quality ||
                            '—'}
                        </TableCell>

                        <TableCell>
                          <Chip
                            size="small"
                            label={getStatusLabel(
                              template.status,
                            )}
                            color={getStatusColor(
                              template.status,
                            )}
                            variant="outlined"
                          />
                        </TableCell>

                        <TableCell>
                          {template.variables
                            ?.length
                            ? `${template.variables.length} variable${template.variables
                              .length === 1
                              ? ''
                              : 's'
                            }`
                            : 'None'}
                        </TableCell>

                        <TableCell align="right">
                          <Button
                            size="small"
                            startIcon={
                              <VisibilityOutlinedIcon />
                            }
                            onClick={() =>
                              setSelectedTemplate(
                                template,
                              )
                            }
                          >
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* CREATE TEMPLATE DIALOG */}

      <Dialog
        open={createDialogOpen}
        onClose={handleCloseCreateDialog}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Create WhatsApp Template</DialogTitle>

        <DialogContent dividers>
          <Stack spacing={2.5}>
            <Alert severity="info">
              Save as a local draft first. Use Submit to Meta from the template
              details dialog when you are ready for Meta approval.
            </Alert>

            {formError && (
              <Alert severity="error" onClose={() => setFormError('')}>
                {formError}
              </Alert>
            )}

            <TextField
              required
              fullWidth
              label="Template Name"
              placeholder="property_followup"
              value={createForm.name}
              onChange={(event) =>
                handleCreateTemplateFormChange(
                  'name',
                  event.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9_]/g, '_'),
                )
              }
              helperText="Use lowercase letters, numbers, and underscores."
            />

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: {
                  xs: '1fr',
                  sm: '1fr 1fr',
                },
                gap: 2,
              }}
            >
              <FormControl fullWidth>
                <InputLabel>Category</InputLabel>
                <Select
                  label="Category"
                  value={createForm.category}
                  onChange={(event) =>
                    handleCreateTemplateFormChange(
                      'category',
                      event.target.value,
                    )
                  }
                >
                  <MenuItem value="UTILITY">Utility</MenuItem>
                  <MenuItem value="MARKETING">Marketing</MenuItem>
                  <MenuItem value="AUTHENTICATION">
                    Authentication
                  </MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Language"
                value={createForm.language}
                onChange={(event) =>
                  handleCreateTemplateFormChange(
                    'language',
                    event.target.value,
                  )
                }
                helperText="Example: en"
              />
            </Box>

            <FormControl fullWidth>
              <InputLabel>Header</InputLabel>
              <Select
                label="Header"
                value={createForm.headerType}
                onChange={(event) =>
                  handleCreateTemplateFormChange(
                    'headerType',
                    event.target.value,
                  )
                }
              >
                <MenuItem value="NONE">None</MenuItem>
                <MenuItem value="TEXT">Text</MenuItem>
                <MenuItem value="IMAGE">Image</MenuItem>
                <MenuItem value="VIDEO">Video</MenuItem>
                <MenuItem value="DOCUMENT">Document</MenuItem>
              </Select>
            </FormControl>

            {createForm.headerType === 'TEXT' && (
              <TextField
                fullWidth
                label="Header Text"
                value={createForm.headerText}
                onChange={(event) =>
                  handleCreateTemplateFormChange(
                    'headerText',
                    event.target.value,
                  )
                }
              />
            )}

            <TextField
              required
              fullWidth
              multiline
              minRows={5}
              label="Body"
              placeholder="Hi {{1}}, thank you for your interest in {{2}}."
              value={createForm.body}
              onChange={(event) =>
                handleCreateTemplateFormChange(
                  'body',
                  event.target.value,
                )
              }
              helperText="Use {{1}}, {{2}}, etc. for template variables."
            />

            <TextField
              fullWidth
              label="Footer"
              placeholder="Brosavo"
              value={createForm.footer}
              onChange={(event) =>
                handleCreateTemplateFormChange(
                  'footer',
                  event.target.value,
                )
              }
            />

            <TextField
              fullWidth
              multiline
              minRows={2}
              label="Buttons"
              placeholder="Schedule Visit, Call Us"
              value={createForm.buttons}
              onChange={(event) =>
                handleCreateTemplateFormChange(
                  'buttons',
                  event.target.value,
                )
              }
              helperText="Comma-separated quick-reply button labels (max 3). Example: Schedule Visit, Call Us"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleCloseCreateDialog}>
            Cancel
          </Button>

          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={
              createMutation.isPending ||
              !createForm.name.trim() ||
              !createForm.body.trim()
            }
            startIcon={
              createMutation.isPending ? (
                <CircularProgress size={16} color="inherit" />
              ) : undefined
            }
          >
            {createMutation.isPending ? 'Saving...' : 'Save Draft'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* DETAILS DIALOG */}

      <Dialog
        open={Boolean(selectedTemplate)}
        onClose={() =>
          setSelectedTemplate(null)
        }
        fullWidth
        maxWidth="md"
      >
        {selectedTemplate && (
          <>
            <DialogTitle>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent:
                    'space-between',
                  gap: 2,
                }}
              >
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight={750}
                  >
                    {selectedTemplate.name}
                  </Typography>

                  <Typography
                    variant="body2"
                    color="text.secondary"
                  >
                    WhatsApp template details
                  </Typography>
                </Box>

                <Chip
                  label={getStatusLabel(
                    selectedTemplate.status,
                  )}
                  color={getStatusColor(
                    selectedTemplate.status,
                  )}
                  variant="outlined"
                />
              </Box>
            </DialogTitle>

            <DialogContent dividers>
              <Stack spacing={3}>
                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: '1fr 1fr',
                      sm: 'repeat(4, 1fr)',
                    },
                    gap: 2,
                  }}
                >
                  <DetailItem
                    label="Category"
                    value={
                      selectedTemplate.category ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Language"
                    value={
                      selectedTemplate.language ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Quality"
                    value={
                      selectedTemplate.quality ||
                      '—'
                    }
                  />

                  <DetailItem
                    label="Variables"
                    value={
                      selectedTemplate.variables
                        ?.length
                        ? String(
                          selectedTemplate
                            .variables
                            .length,
                        )
                        : '0'
                    }
                  />
                </Box>

                <Box
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                    gap: 2,
                  }}
                >
                  <DetailItem
                    label="Meta Template ID"
                    value={selectedTemplate.templateId || 'Not submitted'}
                  />
                  <DetailItem
                    label="Rejection Reason"
                    value={selectedTemplate.rejectionReason || '—'}
                  />
                </Box>

                {(submitMutation.isError || deleteMutation.isError) && (
                  <Alert severity="error">
                    {getErrorMessage(submitMutation.error || deleteMutation.error)}
                  </Alert>
                )}

                <Divider />

                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight={700}
                    sx={{ mb: 1.5 }}
                  >
                    Template Content
                  </Typography>

                  <Stack spacing={1.5}>
                    {getComponentText(
                      selectedTemplate.components,
                      'HEADER',
                    ) && (
                        <ContentBlock
                          label="Header"
                          text={getComponentText(
                            selectedTemplate.components,
                            'HEADER',
                          )}
                        />
                      )}

                    {getComponentText(
                      selectedTemplate.components,
                      'BODY',
                    ) && (
                        <ContentBlock
                          label="Body"
                          text={getComponentText(
                            selectedTemplate.components,
                            'BODY',
                          )}
                        />
                      )}

                    {getComponentText(
                      selectedTemplate.components,
                      'FOOTER',
                    ) && (
                        <ContentBlock
                          label="Footer"
                          text={getComponentText(
                            selectedTemplate.components,
                            'FOOTER',
                          )}
                        />
                      )}

                    {!getComponentText(
                      selectedTemplate.components,
                      'HEADER',
                    ) &&
                      !getComponentText(
                        selectedTemplate.components,
                        'BODY',
                      ) &&
                      !getComponentText(
                        selectedTemplate.components,
                        'FOOTER',
                      ) && (
                        <Typography
                          variant="body2"
                          color="text.secondary"
                        >
                          No text content available.
                        </Typography>
                      )}
                  </Stack>
                </Box>

                {getButtons(
                  selectedTemplate.components,
                ).length > 0 && (
                    <>
                      <Divider />

                      <Box>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ mb: 1.5 }}
                        >
                          Buttons
                        </Typography>

                        <Stack spacing={1}>
                          {getButtons(
                            selectedTemplate.components,
                          ).map(
                            (button, index) => (
                              <Box
                                key={`${button.text}-${index}`}
                                sx={{
                                  p: 1.5,
                                  border:
                                    '1px solid',
                                  borderColor:
                                    'divider',
                                  borderRadius: 2,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  fontWeight={650}
                                >
                                  {button.text ||
                                    'Untitled button'}
                                </Typography>

                                <Typography
                                  variant="caption"
                                  color="text.secondary"
                                >
                                  {button.type ||
                                    'BUTTON'}
                                </Typography>
                              </Box>
                            ),
                          )}
                        </Stack>
                      </Box>
                    </>
                  )}

                {selectedTemplate.variables
                  ?.length ? (
                  <>
                    <Divider />

                    <Box>
                      <Typography
                        variant="subtitle1"
                        fontWeight={700}
                        sx={{ mb: 1.5 }}
                      >
                        Variables
                      </Typography>

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                      >
                        {selectedTemplate.variables.map(
                          (variable, index) => (
                            <Chip
                              key={`${variable}-${index}`}
                              label={variable}
                              size="small"
                              variant="outlined"
                            />
                          ),
                        )}
                      </Stack>
                    </Box>
                  </>
                ) : null}
              </Stack>
            </DialogContent>

            <DialogActions sx={{ gap: 1, flexWrap: 'wrap' }}>
              {canDeleteSelected && (
                <Button
                  color="error"
                  startIcon={<DeleteOutlineIcon />}
                  disabled={deleteMutation.isPending || submitMutation.isPending}
                  onClick={() => {
                    if (!selectedTemplate?.id) return
                    deleteMutation.mutate(Number(selectedTemplate.id))
                  }}
                >
                  Delete Draft
                </Button>
              )}
              {canSubmitSelected && (
                <Button
                  variant="contained"
                  startIcon={
                    submitMutation.isPending ? (
                      <CircularProgress size={16} color="inherit" />
                    ) : (
                      <SendOutlinedIcon />
                    )
                  }
                  disabled={deleteMutation.isPending || submitMutation.isPending}
                  onClick={() => {
                    if (!selectedTemplate?.id) return
                    submitMutation.mutate(Number(selectedTemplate.id))
                  }}
                >
                  {submitMutation.isPending ? 'Submitting...' : 'Submit to Meta'}
                </Button>
              )}
              <Button onClick={() => setSelectedTemplate(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  )
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string
  value: number
  color?: string
}) {
  return (
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
          sx={{ mb: 0.75 }}
        >
          {label}
        </Typography>

        <Typography
          variant="h5"
          fontWeight={800}
          color={color}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  )
}

function DetailItem({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <Box>
      <Typography
        variant="caption"
        color="text.secondary"
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        fontWeight={650}
      >
        {value}
      </Typography>
    </Box>
  )
}

function ContentBlock({
  label,
  text,
}: {
  label: string
  text?: string
}) {
  return (
    <Box
      sx={{
        p: 2,
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 2,
        bgcolor: 'action.hover',
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          mb: 0.75,
        }}
      >
        {label}
      </Typography>

      <Typography
        variant="body2"
        sx={{
          whiteSpace: 'pre-wrap',
        }}
      >
        {text || '—'}
      </Typography>
    </Box>
  )
}
